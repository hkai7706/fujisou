import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
export function phpRuntime(){
  const installed=process.platform==='win32'?path.join(process.env.LOCALAPPDATA||'','Microsoft/WinGet/Packages/PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe/php.exe'):'';
  const binary=process.env.PHP_BINARY||(installed&&fs.existsSync(installed)?installed:'php');
  const result=spawnSync(binary,['-m'],{encoding:'utf8'});
  if(result.error||result.status!==0)throw Error('PHP 8.2+ is required. Set PHP_BINARY to its executable path.');
  const args=[];
  if(!result.stdout.toLowerCase().includes('pdo_sqlite')){
    if(process.platform!=='win32')throw Error('Enable PHP PDO_SQLITE before running service tests.');
    args.push('-d','extension_dir='+path.join(path.dirname(binary),'ext'),'-d','extension=pdo_sqlite');
  }
  return {binary,args};
}
