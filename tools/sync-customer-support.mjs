import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..'),root=process.argv[2]?path.resolve(process.argv[2]):project;
if(root!==project&&root!==path.join(project,'dist'))throw Error('Unsupported support output');
for(const [page,fragment] of [['process/index.html','process-guide'],['aftercare/index.html','owner-support']]){
  const file=path.join(root,page),start=`<!-- ${fragment}:start -->`,end=`<!-- ${fragment}:end -->`;
  let html=fs.readFileSync(file,'utf8');const block=start+'\n'+fs.readFileSync(path.join(project,'include',fragment+'.fragment'),'utf8')+end;
  const begin=html.indexOf(start),finish=html.indexOf(end);
  if(begin>=0&&finish>=begin)html=html.slice(0,begin)+block+html.slice(finish+end.length);
  else html=html.replace('</main>',block+'\n</main>');
  if(!html.includes('stylesheet/customer-support.css'))html=html.replace('</head>','<link rel="stylesheet" href="../stylesheet/customer-support.css"></head>');
  fs.writeFileSync(file,html);
}
const file=path.join(root,'concept/index.html');let html=fs.readFileSync(file,'utf8');
html=html.replace('<article><span>TAKAOKA</span>','<article id="takaoka-office"><span>TAKAOKA</span>').replace('<article><span>TOYAMA</span>','<article id="toyama-office"><span>TOYAMA</span>');
fs.writeFileSync(file,html);
console.log('Customer support, process guidance and office anchors refreshed.');
