import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const source = path.resolve(root, 'tmp/fujisou-ainos-original/contact');
const destination = path.join(root, 'contact');
for (const name of ['mailformpro', 'mfp.statics']) {
  const target = path.join(destination, name);
  if (fs.existsSync(target)) throw new Error(`${name} already exists; refusing to overwrite runtime settings.`);
  if (!fs.existsSync(path.join(source, name))) throw new Error(`Missing original ${name}`);
}
fs.cpSync(path.join(source, 'mailformpro'), path.join(destination, 'mailformpro'), {
  recursive: true,
  filter: entry => !path.relative(path.join(source, 'mailformpro'), entry).split(path.sep).includes('data'),
});
fs.cpSync(path.join(source, 'mfp.statics'), path.join(destination, 'mfp.statics'), { recursive: true });
const data = path.join(destination, 'mailformpro/data');
fs.mkdirSync(data, { recursive: true });
// Keep the directory layout, without copying submissions, sessions or generated caches.
function createDirectories(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (item.isDirectory()) {
      const original = path.join(directory, item.name);
      fs.mkdirSync(path.join(data, path.relative(path.join(source, 'mailformpro/data'), original)), { recursive: true });
      createDirectories(original);
    }
  }
}
createDirectories(path.join(source, 'mailformpro/data'));
fs.writeFileSync(path.join(data, 'dat.mailformpro.cgi'), '0,0,0,0\n');
const configPath = path.join(destination, 'mailformpro/config.cgi');
let config = fs.readFileSync(configPath, 'utf8');
config = config.replaceAll('<_姓_>', '<_氏名_>')
  .replace(/^push @AddOns,'switching\.js';/m, "#push @AddOns,'switching.js';")
  .replace("$config{'ThanksPage'} = '../thanks.shtml';", "$config{'ThanksPage'} = '../thanks.html';")
  .replace("$config{'fixed'} = 0;", "$config{'fixed'} = 1;");
config = config.replace(/push @mailto,'[^']+';/, "push @mailto,'hkai7706@gmail.com';")
  .replace("$config{'mailfrom'} = $mailto[0];", "$config{'mailfrom'} = 'info@ainos.biz';");
fs.writeFileSync(configPath, config);
console.log('Prepared local Mailform Pro runtime with fresh data; recipient hkai7706@gmail.com, sender info@ainos.biz.');
