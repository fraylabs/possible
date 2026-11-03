import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,rm,writeFile,access} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
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
 await assert.rejects(preparePagesDelivery({root,repoToken:'fixture'}));
 await assert.rejects(preparePagesDelivery({root,tokenJson:'{}'}));
 await writeFile(join(root,'apps/web/src/payment-links.json'),JSON.stringify({demo:'https://example.test'}));
 await assert.rejects(preparePagesDelivery({root}));
});
test('copies only switched-on products into the static export',async t=>{
 const root=await fixture(t,{demo:'https://example.test',other:'',all:''});
 assert.equal(await preparePagesDelivery(options(root,stub([[one,'demo']]))),'built');
 assert.equal(await readFile(join(root,'apps/web/out/d',one,'index.html'),'utf8'),'synthetic page');
 assert.equal(await exists(join(root,'apps/web/out/d',one,'demo.zip')),true);
 assert.equal(await exists(join(root,'apps/web/out/d',two)),false);
});
test('rejects invalid mappings, unexpected output and overwrites',async t=>{
 const root=await fixture(t,{demo:'https://example.test',all:'https://example.test'});
 const base=options(root,stub([[one,'demo'],[two,'all']]));
 await assert.rejects(preparePagesDelivery({...base,tokenJson:'{'}));
 await assert.rejects(preparePagesDelivery({...base,tokenJson:JSON.stringify({demo:one,all:one})}));
 await assert.rejects(preparePagesDelivery({...base,tokenJson:JSON.stringify({demo:'../unsafe',all:two})}));
 await assert.rejects(preparePagesDelivery({...base,build:stub([[one,'demo'],[two,'all']],true)}));
 await mkdir(join(root,'apps/web/out/d',one),{recursive:true});await writeFile(join(root,'apps/web/out/d',one,'index.html'),'existing');
 await assert.rejects(preparePagesDelivery(base));assert.equal(await readFile(join(root,'apps/web/out/d',one,'index.html'),'utf8'),'existing');
});
test('command-line failure does not print provided values',async()=>{
 const {spawnSync}=await import('node:child_process');
 const token='synthetic-private-value-do-not-log';
 const result=spawnSync(process.execPath,['scripts/prepare-pages-delivery.mjs'],{encoding:'utf8',env:{PATH:process.env.PATH,POSSIBLE_PROMPTS_READ_TOKEN:token,POSSIBLE_DELIVERY_TOKENS_JSON:'{bad'}});
 assert.notEqual(result.status,0);assert.doesNotMatch(result.stdout+result.stderr,/synthetic-private-value-do-not-log|\{bad/);
});
