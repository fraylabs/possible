import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {cp,lstat,mkdtemp,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

// Update this single pin when a reviewed possible-prompts release is ready.
export const PROMPTS_COMMIT = '05adb5235052b49ad0a743ac39edbc7b1c8575af';
const exec=promisify(execFile);
const quiet={encoding:'utf8',maxBuffer:1024*1024};
async function checkoutPrivate(folder,credential){
 const env={PATH:process.env.PATH,HOME:folder,GIT_TERMINAL_PROMPT:'0',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_COUNT:'1',GIT_CONFIG_KEY_0:'http.https://github.com/.extraheader',GIT_CONFIG_VALUE_0:`Authorization: Bearer ${credential}`};
 await exec('git',['init','-q',folder],{...quiet,env});
 await exec('git',['-C',folder,'fetch','-q','--depth=1','https://github.com/fraylabs/possible-prompts.git',PROMPTS_COMMIT],{...quiet,env});
 await exec('git',['-C',folder,'checkout','-q','--detach','FETCH_HEAD'],{...quiet,env});
 const {stdout}=await exec('git',['-C',folder,'rev-parse','HEAD'],{...quiet,env});
 if(stdout.trim()!==PROMPTS_COMMIT)throw Error('Pinned revision mismatch');
}
async function buildPrivate(folder,root,mapping){
 await exec(process.execPath,[join(folder,'scripts/build.mjs'),'--site',root],{...quiet,env:{PATH:process.env.PATH,POSSIBLE_DELIVERY_TOKENS_JSON:mapping}});
}
async function regular(path){const stat=await lstat(path);return stat.isFile()&&!stat.isSymbolicLink();}
export async function preparePagesDelivery({root,tokenJson,repoToken,checkout=checkoutPrivate,build=buildPrivate}){
 const links=JSON.parse(await readFile(join(root,'apps/web/src/payment-links.json'),'utf8'));
 const live=Object.entries(links).filter(([,value])=>typeof value==='string'&&value.trim()!=='').map(([slug])=>slug);
 if(!tokenJson&&!repoToken){if(live.length)throw Error('Active payment links require delivery credentials.');return 'skipped';}
 if(!tokenJson||!repoToken)throw Error('Both delivery credentials are required.');
 let mapping;try{mapping=JSON.parse(tokenJson)}catch{throw Error('Invalid delivery mappings.');}
 if(!mapping||typeof mapping!=='object'||Array.isArray(mapping))throw Error('Invalid delivery mappings.');
 if(live.some(slug=>!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)))throw Error('Invalid product name.');
 const tokens=live.map(slug=>mapping[slug]);
 if(tokens.some(t=>typeof t!=='string'||!/^[A-Za-z0-9_-]{20,128}$/.test(t))||new Set(tokens).size!==tokens.length)throw Error('Invalid delivery mappings.');
 const folder=await mkdtemp(join(tmpdir(),'possible-delivery-'));
 try{
  await checkout(folder,repoToken);await build(folder,root,tokenJson);
  const source=join(folder,'dist/delivery/d');
  if(live.length){
   const names=await readdir(source);if(names.length!==tokens.length||names.some(n=>!tokens.includes(n)))throw Error('Delivery output does not match active products.');
   for(const [index,slug] of live.entries()){
    const dir=join(source,tokens[index]);const stat=await lstat(dir);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('Invalid delivery output.');
    const files=await readdir(dir);const zip=slug==='all'?'possible-all.zip':`${slug}.zip`;
    if(files.length!==2||!files.includes('index.html')||!files.includes(zip)||!await regular(join(dir,'index.html'))||!await regular(join(dir,zip)))throw Error('Invalid delivery output.');
   }
   const out=join(root,'apps/web/out/d');
   await cp(source,out,{recursive:true,force:false,errorOnExist:true});
  }
  return 'built';
 }finally{await rm(folder,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
 try{const status=await preparePagesDelivery({root,tokenJson:process.env.POSSIBLE_DELIVERY_TOKENS_JSON,repoToken:process.env.POSSIBLE_PROMPTS_READ_TOKEN});console.log(status==='skipped'?'Paid delivery skipped: no active links.':'Paid delivery prepared.');}
 catch{console.error('Paid delivery preparation failed. Check the build configuration and credentials.');process.exitCode=1;}
}
