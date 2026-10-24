import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const skip=new Set(['analytics-portal','analytics-service','analytics-portal-dist','analytics-service-dist','.git','node_modules','dist','tmp','backup','.tmp','output','.cache','mailformpro','mfp.statics','iplogs','originals']);
function snapshot(){
  const result={};
  function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(e.name)||e.isSymbolicLink())continue;
    const file=path.join(dir,e.name);
    if(e.isDirectory()){walk(file);continue;}
    const key=path.relative(root,file).replaceAll('\\','/');
    if(/\.(?:html|shtml|css|js|mjs|json|md|xml|txt)$/.test(file)||e.name==='.htaccess')result[key]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    else {const stat=fs.statSync(file);result[key]=`${stat.size}:${stat.mtimeMs}`;}
  }}
  walk(root);return result;
}
const before=snapshot();
const env={...process.env};
const key=Object.keys(env).find(key=>key.toLowerCase()==='path')||'Path';
env[key]=path.dirname(process.execPath)+path.delimiter+(env[key]||'');
const args=['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(root,'tools/build-deploy.ps1')];
if(process.argv.includes('--production'))args.push('-Production');
const build=spawnSync('powershell',args,{cwd:root,stdio:'inherit',env});
assert.equal(build.status,0,'Deployment build failed');
assert.deepEqual(snapshot(),before,'Packaging modified maintained source files');
assert.ok(!fs.existsSync(path.join(root,'dist/server')),'Historical server directory must not be deployed');
assert.ok(!fs.existsSync(path.join(root,'dist/stylesheet/source')),'Editable CSS modules must not be deployed');
console.log(`Build isolation passed: ${Object.keys(before).length} source files unchanged.`);
