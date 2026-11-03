import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,rm,writeFile,access,symlink} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {preparePagesDelivery} from './prepare-pages-delivery.mjs';
const one='synthetic_token_11111111111111',two='synthetic_token_22222222222222';
async function fixture(t,links){
 const root=await mkdtemp(join(tmpdir(),'possible-pages-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'apps/web/src'),{recursive:true});await mkdir(join(root,'apps/web/out'),{recursive:true});
 await writeFile(join(root,'apps/web/src/payment-links.json'),JSON.stringify(links));return root;
}
const exists=path=>access(path).then(()=>true,()=>false);
function stub(slugs,addExtra=false){return async(folder)=>{
 for(const [token,slug] of slugs){const dir=join(folder,'dist/delivery/d',token);await mkdir(dir,{recursive:true});await writeFile(join(dir,'index.html'),'synthetic page');await writeFile(join(dir,slug==='all'?'possible-all.zip':slug+'.zip'),'synthetic zip');}
 if(addExtra)await mkdir(join(folder,'dist/delivery/d','unexpected'),{recursive:true});
};}
const options=(root,build)=>({root,repoToken:'fixture-credential',tokenJson:JSON.stringify({demo:one,other:two,all:two}),checkout:async()=>{},build});
test('skips only without credentials and active links',async t=>{
 const root=await fixture(t,{demo:'',all:''});assert.equal(await preparePagesDelivery({root}),'skipped');
 await assert.rejects(preparePagesDelivery({root,repoToken:'fixture'}),/Both delivery credentials/);
 await assert.rejects(preparePagesDelivery({root,tokenJson:'{}'}),/Both delivery credentials/);
 await writeFile(join(root,'apps/web/src/payment-links.json'),JSON.stringify({demo:'https://example.test'}));
 await assert.rejects(preparePagesDelivery({root}),/Active payment links require delivery credentials/);
});
test('copies only switched-on products into the static export',async t=>{
 const root=await fixture(t,{demo:'https://example.test',other:'',all:''});
 await assert.rejects(preparePagesDelivery(options(root,stub([[one,'demo'],[two,'other']]))),/Delivery output does not match active products/);
 assert.equal(await preparePagesDelivery(options(root,stub([[one,'demo']]))),'built');
 assert.equal(await readFile(join(root,'apps/web/out/d',one,'index.html'),'utf8'),'synthetic page');
 assert.equal(await exists(join(root,'apps/web/out/d',one,'demo.zip')),true);
 assert.equal(await exists(join(root,'apps/web/out/d',two)),false);
});
test('rejects invalid mappings, unexpected output and overwrites',async t=>{
 const root=await fixture(t,{demo:'https://example.test',all:'https://example.test'});
 const base=options(root,stub([[one,'demo'],[two,'all']]));
 await assert.rejects(preparePagesDelivery({...base,tokenJson:'{'}),/Invalid delivery mappings/);
 await assert.rejects(preparePagesDelivery({...base,tokenJson:JSON.stringify({demo:one,all:one})}),/Invalid delivery mappings/);
 await assert.rejects(preparePagesDelivery({...base,tokenJson:JSON.stringify({demo:'../unsafe',all:two})}),/Invalid delivery mappings/);
 await assert.rejects(preparePagesDelivery({...base,build:stub([[one,'demo'],[two,'all']],true)}),/Delivery output does not match active products/);
 await mkdir(join(root,'apps/web/out/d',one),{recursive:true});await writeFile(join(root,'apps/web/out/d',one,'index.html'),'existing');
 await assert.rejects(preparePagesDelivery(base),{code:'ERR_FS_CP_EEXIST'});assert.equal(await readFile(join(root,'apps/web/out/d',one,'index.html'),'utf8'),'existing');
});
test('command-line failure does not print provided values',async()=>{
 const {spawnSync}=await import('node:child_process');
 const token='synthetic-private-value-do-not-log';
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('./prepare-pages-delivery.mjs',import.meta.url))],{encoding:'utf8',cwd:fileURLToPath(new URL('..',import.meta.url)),env:{PATH:process.env.PATH,POSSIBLE_PROMPTS_READ_TOKEN:token,POSSIBLE_DELIVERY_TOKENS_JSON:'{bad'}});
 assert.notEqual(result.status,0);assert.match(result.stderr,/Paid delivery preparation failed/);assert.doesNotMatch(result.stdout+result.stderr,/synthetic-private-value-do-not-log|\{bad/);
});

test('configured build rejects output when no links are active',async t=>{const root=await fixture(t,{demo:''});await assert.rejects(preparePagesDelivery(options(root,stub([[one,'demo']]))),/Delivery output does not match active products/);assert.equal(await preparePagesDelivery(options(root,stub([]))),'built');});

test('Sites delivery remains responsible for active links when its directory is set',async t=>{
 const root=await fixture(t,{demo:'https://example.test'});
 assert.equal(await preparePagesDelivery({root,siteDeliveryDir:'/synthetic/sites-delivery',checkout:async()=>{throw Error('must not fetch')}}),'sites');
 assert.equal(await exists(join(root,'apps/web/out/d')),false);
});
test('malformed output and invalid product slugs fail and private checkouts are cleaned',async t=>{
 const root=await fixture(t,{demo:'https://example.test'}),base=options(root,stub([[one,'demo']]));
 for(const kind of ['wrong-zip','extra-file','symlink']){
  const build=async folder=>{const dir=join(folder,'dist/delivery/d',one);await mkdir(dir,{recursive:true});
   if(kind==='symlink')await symlink('/nonexistent',join(dir,'index.html'));else await writeFile(join(dir,'index.html'),'synthetic');
   await writeFile(join(dir,kind==='wrong-zip'?'wrong.zip':'demo.zip'),'zip');if(kind==='extra-file')await writeFile(join(dir,'extra'),'extra');};
  await assert.rejects(preparePagesDelivery({...base,build}),/Invalid delivery output/);
 }
 let captured;await assert.rejects(preparePagesDelivery({...base,checkout:async folder=>{captured=folder;throw Error('synthetic checkout failure')}}),/synthetic checkout failure/);assert.equal(await exists(captured),false);
 await writeFile(join(root,'apps/web/src/payment-links.json'),JSON.stringify({'../bad':'https://example.test'}));
 await assert.rejects(preparePagesDelivery({...base,tokenJson:JSON.stringify({'../bad':one})}),/Invalid product name/);
});
