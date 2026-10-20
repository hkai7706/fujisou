import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
process.chdir(root);
const argv=process.argv;
process.argv=[process.execPath,import.meta.filename];
try{
  await import('./build-gallery-projects.mjs');
  await import('./build-gallery-redirects.mjs');
  await import('./normalize-folder-links.mjs');
  await import('./embed-shared-chrome.mjs');
  await import('./generate-sitemap.mjs');
}finally{process.argv=argv;}
// Refresh the local upload package without copying originals or private mail data.
if(fs.existsSync('dist')){
  for(const name of fs.readdirSync('gallery').filter(name=>/\.(?:html|shtml)$/.test(name))){
    const file='gallery/'+name,text=fs.readFileSync(file,'utf8');
    fs.copyFileSync(file,'dist/'+file);
    for(const match of text.matchAll(/img\/[^\s"'<>),?#]+/g)){
      const image=match[0];
      if(image.includes('/originals/')||!fs.existsSync(image))continue;
      fs.mkdirSync(path.dirname('dist/'+image),{recursive:true});
      fs.copyFileSync(image,'dist/'+image);
    }
  }
  fs.copyFileSync('sitemap.xml','dist/sitemap.xml');
  // Keep the test-folder deployment's indexing headers when refreshing redirects.
  const sourceHt=fs.readFileSync('.htaccess','utf8');
  const marker=/# BEGIN GALLERY DESCRIPTIVE URLS[\s\S]*?# END GALLERY DESCRIPTIVE URLS/;
  const block=sourceHt.match(marker)?.[0];
  if(block&&fs.existsSync('dist/.htaccess')){let ht=fs.readFileSync('dist/.htaccess','utf8');ht=marker.test(ht)?ht.replace(marker,block):ht.replace('RewriteEngine On','RewriteEngine On\n\n  '+block);fs.writeFileSync('dist/.htaccess',ht);}
}
console.log('Gallery pages, shared navigation and sitemap refreshed. Run npm run check before upload.');
