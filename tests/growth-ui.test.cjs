const {test}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {createCompiler}=require('./helpers/compile-module.cjs');
const element=tag=>({children,...props})=>React.createElement(tag,props,children);
const compile=createCompiler({'@/components/ui/dialog':{
 Dialog:({children})=>children,DialogContent:element('section'),DialogHeader:element('header'),
 DialogTitle:element('h2'),DialogDescription:element('p'),
},'@/components/ui/button':{Button:({variant,...props})=>React.createElement('button',props)}});
const {SocialEngagementModal}=compile('components/registration-growth/social-engagement-modal.tsx');
const {RegistrationOutcomeModal}=compile('components/registration-growth/registration-outcome-modal.tsx');
const {normalizeInstagram,validInstagram}=compile('lib/growth/types.ts');
const {registrationLabel}=compile('lib/growth/registration-label.ts');
const config={enabled:true,manualVerification:true,profileUrl:'https://www.instagram.com/jituptn/',campaignUrl:'https://www.instagram.com/p/example/',
 items:{follow:{enabled:true,required:true},likeTag:{enabled:true,required:true},story:{enabled:true,required:true}},mentionRequired:true,
 prize:{enabled:true,winners:5,type:'Saldo E-Wallet',info:''},community:{enabled:true,url:'https://example.com/community'}};
function flow(overrides={}){return{state:{tryoutName:'Tryout UTBK',config,verification:{status:'PENDING_VERIFICATION',rejectionReasons:[]},registrationClosed:false},
 username:'test.user',checks:{follow:false,likeTag:false,story:false},busy:false,ready:false,track(){},close(){},setUsername(){},setChecks(){},...overrides};}
const render=(Component,value)=>renderToStaticMarkup(React.createElement(Component,{open:true,flow:value}));
test('social modal renders exact default copy, required input and external safe links',()=>{
 const html=render(SocialEngagementModal,flow());
 for(const text of ['Daftar Tryout Gratis','Lengkapi persyaratan berikut.','Follow Instagram @jituptn','Like &amp; tag 3 teman di postingan tryout',
  'Share ke Instagram Story &amp; mention @jituptn','Username Instagram','usernamekamu','Gunakan akun Instagram yang sama.','Pendaftaranmu akan diverifikasi terlebih dahulu.'])assert.ok(html.includes(text),text);
 assert.equal((html.match(/target="_blank"/g)||[]).length,3);assert.ok(html.includes('noopener noreferrer'));
 assert.match(html,/<button[^>]+disabled/);assert.equal((html.match(/type="checkbox"/g)||[]).length,3);
});
test('pending outcome uses actual name and never claims approval',()=>{
 const html=render(RegistrationOutcomeModal,flow());
 for(const text of ['Menunggu Verifikasi','Pendaftaranmu untuk Tryout UTBK telah diterima.','Pastikan Instagram Story masih dapat dilihat.',
  'Hadiah Saldo E-Wallet untuk 5 Besar!','Gabung Komunitas JITU','Kembali ke Tryout'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('Pendaftaran Berhasil!'));assert.ok(html.includes('target="_blank"'));
});
test('optional Story and disabled prizes remove Story warning and every winner claim',()=>{
 const value=flow();value.state.config={...config,items:{...config.items,story:{enabled:true,required:false}},prize:{...config.prize,enabled:false}};
 const html=render(RegistrationOutcomeModal,value);assert.ok(!/Hadiah|pemenang|Story masih/.test(html));assert.ok(html.includes('Gabung Komunitas JITU'));
});
test('disabled community is hidden; rejected outcomes show reasons and disallow closed resubmission',()=>{
 const value=flow();value.state={...value.state,registrationClosed:true,config:{...config,community:{enabled:false,url:''}},verification:{status:'REJECTED',rejectionReasons:['Belum tag 3 teman.']}};
 const html=render(RegistrationOutcomeModal,value);assert.ok(html.includes('Pendaftaran Belum Disetujui'));assert.ok(html.includes('Belum tag 3 teman.'));
 assert.match(html,/<button[^>]+disabled[^>]*>Ajukan Ulang/);assert.ok(!html.includes('Gabung Komunitas JITU'));
});
test('username accepts optional @ and normalizes case while rejecting malformed accounts',()=>{
 assert.equal(normalizeInstagram(' @Test.User '),'test.user');
 for(const value of ['@test.user','_test','user123'])assert.ok(validInstagram(value));
 for(const value of ['','a..b','name.','https://instagram.com/a','@a b','x'.repeat(31)])assert.ok(!validInstagram(value),value);
});
test('registration labels preserve pending/rejected status and existing action fallback',()=>{
 assert.equal(registrationLabel('PENDING_VERIFICATION'),'Menunggu Verifikasi');assert.equal(registrationLabel('REJECTED'),'Ajukan Ulang');
 assert.equal(registrationLabel(null,'Daftar Gratis'),'Daftar Gratis');
});
