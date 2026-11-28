const {before,after,test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {NextRequest}=require('next/server');
const {createCompiler}=require('./helpers/compile-module.cjs');
const fixtureRoot=process.env.GROWTH_FIXTURE_ROOT||path.resolve('../jitu-backend/test');
const {createGrowthDatabase,fixture}=require(path.join(fixtureRoot,'growth-fixture.cjs'));
let db,pool,actor;
const compile=createCompiler({'@/lib/server-auth':{getAuthenticatedAppUser:async()=>actor},'@/lib/db':{getDbPool:()=>pool}});
const {POST}=compile('app/api/proxy/tryout/[id]/register/route.ts');
const {GET}=compile('app/api/proxy/tryout/[id]/growth/route.ts');
before(async()=>{db=await createGrowthDatabase();pool=db.pool;});
after(async()=>{await db?.cleanup();});
function request(f,body) {return new NextRequest(`http://localhost:5173/api/proxy/tryout/${f.tryout}/register`,{
 method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});}
async function register(f,body={mode:'FREE',growth:f.input,expectedSolutionPrice:0}) {
 actor={id:f.user,email:f.user+'@test.invalid'};
 return POST(request(f,body),{params:Promise.resolve({id:f.tryout})});
}
test('Next route creates pending verification without granting an attempt and returns normalized own state',async()=>{
 const f=await fixture(pool),response=await register(f);
 assert.equal(response.status,202);const state=await response.json();assert.equal(state.isRegistered,false);
 assert.equal(state.verification.instagramUsername,'test.user');assert.equal(state.verificationStatus,'PENDING_VERIFICATION');
 const result=await GET(new NextRequest(`http://localhost:5173/api/proxy/tryout/${f.tryout}/growth`),{params:Promise.resolve({id:f.tryout})});
 assert.equal(result.status,200);assert.equal((await result.json()).verification.id,state.verification.id);
});
test('concurrent Next submissions are idempotent across distinct HTTP requests',async()=>{
 const f=await fixture(pool);const responses=await Promise.all(Array.from({length:6},()=>register(f)));
 const states=await Promise.all(responses.map(r=>r.json()));assert.equal(new Set(states.map(s=>s.verification.id)).size,1);
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM "TryOutAttempt" WHERE "userId"=$1',[f.user])).rows[0].n,0);
});
test('client cannot bypass free verification by naming zero-price registration PREMIUM',async()=>{
 const f=await fixture(pool);const response=await register(f,{mode:'PREMIUM',expectedSolutionPrice:0});
 assert.equal(response.status,409);assert.equal((await pool.query('SELECT count(*)::int AS n FROM "TryOutAttempt" WHERE "userId"=$1',[f.user])).rows[0].n,0);
});
test('disabled growth preserves legacy free registration and checklist-only flow grants immediate access',async()=>{
 const legacy=await fixture(pool,{enabled:false});let response=await register(legacy,{mode:'FREE',expectedSolutionPrice:0});
 assert.equal(response.status,200);let result=await response.json();assert.equal(result.isRegistered,true);assert.ok(result.attemptId);
 const auto=await fixture(pool,{manualVerification:false});response=await register(auto);result=await response.json();
 assert.equal(response.status,200);assert.equal(result.verificationStatus,'APPROVED');assert.equal(result.isRegistered,true);
});
test('paid registration keeps atomic coin deduction and resolves pending status without claiming Instagram verification',async()=>{
 const f=await fixture(pool);await register(f);await pool.query('UPDATE "TryOut" SET "solutionPrice"=1 WHERE id=$1',[f.tryout]);
 const paid={mode:'PREMIUM',expectedSolutionPrice:1};const responses=await Promise.all([register(f,paid),register(f,paid)]);
 assert.ok(responses.every(r=>r.status===200));
 const user=(await pool.query('SELECT "tokenBalance" FROM "user" WHERE id=$1',[f.user])).rows[0];assert.equal(user.tokenBalance,9);
 const verification=(await pool.query('SELECT status,"approvalMethod","verifiedBy" FROM "TryoutRegistrationVerification" WHERE "userId"=$1',[f.user])).rows[0];
 assert.deepEqual(verification,{status:'APPROVED',approvalMethod:'PAID',verifiedBy:null});
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM "TryOutAttempt" WHERE "userId"=$1',[f.user])).rows[0].n,1);
});
test('ownership comes from the authenticated session and authentication is required',async()=>{
 const f=await fixture(pool),other=await fixture(pool);
 const response=await register(f,{mode:'FREE',userId:other.user,growth:{...f.input,userId:other.user}});
 assert.equal(response.status,202);
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM "TryoutRegistrationVerification" WHERE "userId"=$1',[other.user])).rows[0].n,0);
 actor=null;const denied=await POST(request(f,{mode:'FREE'}),{params:Promise.resolve({id:f.tryout})});assert.equal(denied.status,401);
});
test('invalid Instagram usernames and registration after close fail without persisting submissions',async()=>{
 const f=await fixture(pool);let response=await register(f,{mode:'FREE',growth:{...f.input,instagramUsername:'has space'}});assert.equal(response.status,400);
 await pool.query(`UPDATE "TryOut" SET "scheduledEnd"=(NOW() AT TIME ZONE 'UTC')-interval '1 minute' WHERE id=$1`,[f.tryout]);
 response=await register(f);assert.equal(response.status,400);
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM "TryoutRegistrationVerification" WHERE "userId"=$1',[f.user])).rows[0].n,0);
});
