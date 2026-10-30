import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
// Explicit maintenance command: unlike packaging, this intentionally updates
// checked-in static pages for GitHub Pages and local preview.
const steps=['build-shared-css.mjs','build-videos.mjs','add-loan-links.mjs','add-house-guide-links.mjs','build-gallery-redirects.mjs','review-health-copy.mjs','prepare-home-images.mjs','optimize-shared-chrome.mjs','standardize-page-heroes.mjs','sync-customer-support.mjs','build-home-blog.mjs','build-consultation-banners.mjs','build-home-inquiries.mjs','build-event-state.mjs','add-analytics.mjs','build-home-css.mjs','normalize-folder-links.mjs','update-catalog-links.mjs','add-favicons.mjs','prepare-seo.mjs','generate-sitemap.mjs','version-public-assets.mjs','build-home-delivery.mjs'];
for(const step of steps){
  const result=spawnSync(process.execPath,[path.join(root,'tools',step)],{cwd:root,stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
}
