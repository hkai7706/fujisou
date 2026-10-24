import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {phpRuntime} from './php-runtime.mjs';

// Loopback-only preview. Never uses production credentials or visitor storage.
const root=path.resolve(import.meta.dirname,'..');
const build=spawnSync(process.execPath,['tools/build-analytics.mjs'],{cwd:root,stdio:'inherit'});
if(build.status!==0)process.exit(build.status||1);
const php=phpRuntime(),password=randomBytes(18).toString('base64url');
const hashed=spawnSync(php.binary,[...php.args,'-r','echo password_hash(getenv("PREVIEW_PASSWORD"), PASSWORD_DEFAULT);'],{encoding:'utf8',env:{...process.env,PREVIEW_PASSWORD:password}});
if(hashed.status!==0)throw Error('Could not prepare local authentication.');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'ainos-preview-'));
const origin='http://127.0.0.1:5503';
const config={admin_name:'admin',password_hash:hashed.stdout,secret:randomBytes(32).toString('hex'),data_dir:path.join(directory,'data'),portal_origins:[origin],sites:{local:{label:'Local test — empty database',origin:'http://127.0.0.1:5501',base_path:'/'}},retention_days:7};
const file=path.join(directory,'config.php');
fs.writeFileSync(file,`<?php return json_decode(base64_decode('${Buffer.from(JSON.stringify(config)).toString('base64')}'),true);`,{mode:0o600});
const server=spawn(php.binary,[...php.args,'-S','127.0.0.1:5503','-t',path.join(root,'analytics-service-dist'),path.join(root,'analytics-service-dist/router.php')],{env:{...process.env,ANALYTICS_CONFIG:file},stdio:['ignore','inherit','inherit']});
let cleaned=false;
function cleanup(){if(cleaned)return;cleaned=true;fs.rmSync(directory,{recursive:true,force:true});}
server.on('error',error=>{console.error(error.message);cleanup();process.exitCode=1;});
server.on('exit',code=>{cleanup();process.exitCode=code||0;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.kill());
process.on('exit',()=>{server.kill();cleanup();});
console.log(`\nLocal dashboard: ${origin}/\nService URL: ${origin}/api.php\nUsername: admin\nTemporary password: ${password}\n\nKeep this terminal open. Press Ctrl+C to stop and delete test data.\nThis preview does not track the public website.\n`);
