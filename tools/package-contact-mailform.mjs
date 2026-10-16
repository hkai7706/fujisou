import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'output/contact-mailform-lolipop');
if (fs.existsSync(output)) throw new Error('Package already exists; choose a fresh output folder before rebuilding.');
for (const name of ['mailformpro', 'mfp.statics', 'thanks.html']) {
  const source = path.join(root, 'contact', name);
  if (!fs.existsSync(source)) throw new Error(`Missing ${name}`);
}
fs.mkdirSync(path.join(output, 'contact'), { recursive: true });
for (const name of ['mailformpro', 'mfp.statics', 'thanks.html']) {
  fs.cpSync(path.join(root, 'contact', name), path.join(output, 'contact', name), { recursive: true });
}
fs.writeFileSync(path.join(output, 'README.txt'), 'Mailform Pro supplement for the redesigned SSI website.\nRecipient: hkai7706@gmail.com\nSender: info@ainos.biz\nUpload alongside the complete new website on Lolipop, with its includes, stylesheet and script folders.\nPreserve the original live form and its data. This package has fresh counters and no customer records.\nConfigure CGI execution and writable data permissions using Lolipop instructions.\nTest validation, confirmation, notification, automatic reply and thanks redirect over HTTPS before launch.\nThis package does not execute on GitHub Pages or a static local preview.\n');
console.log(`Mailform package prepared: ${output}`);
