const {before,after,test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const {randomUUID}=require('node:crypto');
const fixtureRoot=process.env.AFFILIATE_FIXTURE_ROOT || path.resolve(process.cwd(),'../jitu-backend/test');
const {createTestDatabase,fixture,quote,payment,boost}=require(path.join(fixtureRoot,'affiliate-fixture.cjs'));
function compile(relative,aliases={}) {
 const file=path.resolve(process.cwd(),relative),m=new Module(file,module);m.paths=Module._nodeModulePaths(process.cwd());
 const original=m.require.bind(m);m.require=id=>id in aliases?aliases[id]:original(id);
 m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 return m.exports;
}
const pricing=compile('lib/shop-pricing.ts');
let db,pool;
before(async()=>{db=await createTestDatabase();pool=db.pool;});
after(async()=>{await db?.cleanup();});
test('student voucher preview and reservation use the same central affiliate rates',async()=>{
 const f=await fixture(pool),preview=await pricing.priceVoucher(pool,f.code,11000);
 assert.equal(preview.discountPercent,15);assert.equal(preview.finalPrice,9350);assert.equal(preview.affiliateCheckoutId,null);
 const id=randomUUID(),reserved=await pricing.priceVoucher(pool,f.code,11000,id);
 assert.equal(reserved.affiliateCheckoutId,id);assert.equal(reserved.discountAmount,1650);
 assert.equal((await pool.query('SELECT count(*) FROM "AffiliateCheckout" WHERE "affiliateId"=$1',[f.id])).rows[0].count,'1');
});
test('campaign discount is applied before affiliate eligibility and commission',async()=>{
 await pool.query(`CREATE TABLE "Discount" (id text,type text,value int,"isActive" bool,"startDate" timestamptz,"endDate" timestamptz,"packageId" text,"createdAt" timestamptz);
   INSERT INTO "Discount" VALUES ('campaign','PERCENTAGE',10,true,NOW()-interval '1 hour',NOW()+interval '1 hour','product',NOW())`);
 const f=await fixture(pool),pkg=await pricing.getShopPackage(pool,'product');assert.equal(pkg.price,9900);
 const result=await pricing.priceVoucher(pool,f.code,pkg.price,randomUUID());assert.equal(result.finalPrice,8415);
 await pool.query('DROP TABLE "Discount"');
});
test('non-affiliate codes retain promotional percentage, validity, and limit checks',async()=>{
 const id=randomUUID();await pool.query(`INSERT INTO "Voucher" (id,code,"discountPercent","maxDiscount") VALUES ($1,UPPER($1),40,0)`,[id]);
 const result=await pricing.priceVoucher(pool,id,11000,randomUUID());assert.equal(result.finalPrice,6600);assert.equal(result.affiliateCheckoutId,null);
 await pool.query('UPDATE "Voucher" SET "isActive"=false WHERE id=$1',[id]);
 await assert.rejects(pricing.priceVoucher(pool,id,11000),/tidak aktif/);
});
test('student route persists correct snapshot before calling the gateway',async()=>{
 const f=await fixture(pool),user={id:randomUUID(),email:'test-student@invalid.example'};let gatewayAmount;
 const {POST}=compile('app/api/proxy/shop/create/[id]/route.ts',{
  '@/lib/db':{getDbPool:()=>pool},'@/lib/server-auth':{getAuthenticatedAppUser:async()=>user},
  '@/lib/shop-pricing':pricing,'@/lib/free-voucher-payment':{createFreePayment:async()=>assert.fail('Unexpected free payment')},
  '@/lib/midtrans-server':{getMidtransConfig:()=>({clientKey:'test-only'}),createQrisTransaction:async input=>{
   gatewayAmount=input.grossAmount;
   const row=(await pool.query('SELECT * FROM "Payment" WHERE "orderId"=$1',[input.orderId])).rows[0];
   assert.ok(row.affiliateCheckoutId);return{token:'test-token',redirect_url:'https://invalid.example',qr_url:'https://invalid.example/qr'};
  }},
 });
 const response=await POST({json:async()=>({voucherCode:f.code}),nextUrl:{searchParams:new URLSearchParams()}},{params:Promise.resolve({id:'product'})});
 const result=await response.json();assert.equal(response.status,200);assert.equal(result.amount,9350);assert.equal(gatewayAmount,9350);
 const saved=(await pool.query('SELECT * FROM "Payment" WHERE id=$1',[result.transactionId])).rows[0];
 assert.equal(saved.amount,9350);assert.equal(saved.discountAmount,1650);
 await pool.query(`UPDATE "Payment" SET status='CONFIRMED' WHERE id=$1`,[saved.id]);
 assert.equal((await pool.query('SELECT amount FROM "AffiliateLedger" WHERE "checkoutId"=$1',[saved.affiliateCheckoutId])).rows[0].amount,935);
});
test('student refund reconciliation uses verified cumulative amount and rejects mismatches',async()=>{
 const f=await fixture(pool),snapshot=await quote(pool,f.voucher),id=await payment(pool,snapshot,'CONFIRMED');
 const {reconcileAffiliateRefund}=compile('lib/affiliate-refund.ts',{'./db':{getDbPool:()=>pool}});
 await assert.rejects(reconcileAffiliateRefund(id,{transaction_status:'refund',gross_amount:'1'}),/does not match/);
 const status={transaction_status:'partial_refund',gross_amount:'9350',refund_amount:'1000'};
 await reconcileAffiliateRefund(id,status);await reconcileAffiliateRefund(id,status);
 assert.equal((await pool.query('SELECT sum(amount)::int AS amount FROM "AffiliateLedger" WHERE "checkoutId"=$1',[snapshot.id])).rows[0].amount,835);
});
