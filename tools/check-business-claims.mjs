import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const requireText = (file, text, label) => {
  if (!read(file).includes(text)) failures.push(`${file}: missing ${label}`);
};
const forbidText = (file, text, label) => {
  if (read(file).includes(text)) failures.push(`${file}: contains ${label}`);
};

forbidText('index.html', '初回から3回目', 'an unverified three-session promise');
requireText('index.html', '費用が発生する業務は事前にご説明します', 'advance fee disclosure');
requireText('index.html', '商品と計画条件ごとに確認します', 'plan-specific seismic qualification');
requireText('land-info/index.html', '現在の販売状況、価格、条件はお問い合わせ時にご確認ください', 'current land availability disclaimer');
requireText('process/index.html', '有料', 'paid-work distinction');
requireText('aftercare/index.html', '契約時の保証書', 'contract-controlled warranty disclaimer');

for (const product of ['smart', 'premium', 'cute', 'hirayahouse']) {
  requireText(`plans/products/${product}/index.html`, '現在の価格、仕様、標準・オプション、総費用は最新の仕様書・見積書でご確認ください', 'current price/specification disclaimer');
}

if (failures.length) {
  console.error(`Business-claims check failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Business-claims check passed: consultation, seismic, land, process, warranty, and plan-price safeguards are present.');
