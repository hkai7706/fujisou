import fs from 'node:fs';
import path from 'node:path';
const project = path.resolve(import.meta.dirname, '..');
const runtime = path.join(project, 'contact/mailformpro');
const config = path.join(runtime, 'config.cgi');
if (!fs.existsSync(config)) throw new Error('Prepare the original Mailform Pro package first.');
fs.cpSync(path.join(project, 'tools/mailform/sitevalidation'), path.join(runtime, 'librarys/sitevalidation'), {recursive:true});
let text = fs.readFileSync(config, 'utf8');
if (!/^push @Modules,'sitevalidation';/m.test(text)) text = text.replace('@Modules = ();', "@Modules = ();\npush @Modules,'sitevalidation';");
fs.writeFileSync(config, text);
// A failed sendmail child must never redirect to a successful receipt.
const coreFile=path.join(runtime,'librarys/core.cgi');
let core=fs.readFileSync(coreFile,'utf8');
if(!core.includes("Status: 503 Service Unavailable"))core=core.replace('sub _Error {\n\tmy($ErrorCode) = @_;', 'sub _Error {\n\tmy($ErrorCode) = @_;\n\tif ($ErrorCode == 500) { print "Status: 503 Service Unavailable\\n"; }');
core=core.replace("print MAIL &_MAILHEADER($to,$from,$name,$subject,$body,$attached,$htmlmail);\n\t\tclose(MAIL);", "print MAIL &_MAILHEADER($to,$from,$name,$subject,$body,$attached,$htmlmail);\n\t\tif (!close(MAIL)) { &_SENDMAIL_ERROR('sendmail exit error'); }");
fs.writeFileSync(coreFile,core);
const entryFile=path.join(runtime,'mailformpro.cgi');
let entry=fs.readFileSync(entryFile,'utf8');
entry=entry.replace('use CGI::Carp qw(fatalsToBrowser);','use CGI::Carp;');
if(!entry.includes('# Site public endpoint allowlist'))entry=entry.replace('&_MAIN;', `# Site public endpoint allowlist: administrative/export modules are not public.
if ($_GET{'module'} ne '' && ($_GET{'module'} ne 'thanks' || ($_GET{'action'} ne '' && $_GET{'action'} ne 'main'))) {
    print "Status: 404 Not Found\\nContent-Type: text/plain\\n\\nNot found";
    exit;
}
&_MAIN;`);
fs.writeFileSync(entryFile,entry);
// The receipt endpoint returns only a boolean, never submitted personal data.
fs.copyFileSync(path.join(project,'tools/mailform/receipt-main.cgi'),path.join(runtime,'librarys/thanks/main.cgi'));
fs.copyFileSync(path.join(project,'tools/mailform/receipt-finish.cgi'),path.join(runtime,'librarys/thanks/finish.cgi'));
fs.writeFileSync(path.join(runtime,'librarys/thanks/run.cgi'),'1;\n');
const deny = 'Options -Indexes\n<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n';
for (const folder of ['data','configs','librarys']) fs.writeFileSync(path.join(runtime, folder, '.htaccess'), deny);
fs.writeFileSync(path.join(runtime, '.htaccess'), 'Options -Indexes\n<Files "config.cgi">\n<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n</Files>\n');
function normalizePerl(directory){for(const item of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,item.name);if(item.isDirectory()&&item.name!=='data')normalizePerl(file);else if(item.isFile()&&/\.(cgi|pl|pm)$/.test(item.name))fs.writeFileSync(file,fs.readFileSync(file,'utf8').replaceAll('\r\n','\n'));}}
normalizePerl(runtime);
console.log('Installed contact server validation and protected private runtime folders.');
