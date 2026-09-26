import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ignoredDirectories = new Set(['.git', 'node_modules', 'docs', 'dist']);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function jpegSize(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    const length = buffer.readUInt16BE(offset + 2);
    if (!length) break;
    offset += length + 2;
  }
}

function imageSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.subarray(1, 4).toString() === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return jpegSize(buffer);
}

const pages = walk(root).filter((file) => /\.(?:html|shtml)$/i.test(file) && !['header.shtml', 'footer.shtml'].includes(path.basename(file)));
let updatedPages = 0;
let updatedImages = 0;

for (const page of pages) {
  let html = fs.readFileSync(page, 'utf8');
  let foundPrimaryContentImage = false;
  const firstHeaderEnd = html.indexOf('</header>');
  const updated = html.replace(/<img\b[^>]*>/gi, (tag, offset) => {
    const source = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (!source || /^(?:https?:|data:|\/\/)/i.test(source)) return tag;

    const isChromeImage = /ainos-bridal-house-logo|LINE_logo|Instagram|YouTube/i.test(source);
    const isHeaderLogo = /ainos-bridal-house-logo/i.test(source) && firstHeaderEnd !== -1 && offset < firstHeaderEnd;
    const isPrimaryContentImage = !isChromeImage && !foundPrimaryContentImage;
    if (isPrimaryContentImage) foundPrimaryContentImage = true;

    const cleanSource = source.split(/[?#]/)[0];
    const imagePath = path.resolve(path.dirname(page), cleanSource);
    let result = tag;
    if ((!/\bwidth=/i.test(result) || !/\bheight=/i.test(result)) && fs.existsSync(imagePath)) {
      const dimensions = imageSize(imagePath);
      if (dimensions) {
        result = result.replace(/\s*\/?>$/, ` width="${dimensions.width}" height="${dimensions.height}">`);
      }
    }
    if (!/\bdecoding=/i.test(result)) result = result.replace(/>$/, ' decoding="async">');
    if (!isPrimaryContentImage && !isHeaderLogo && !/\bloading=/i.test(result) && !/\bfetchpriority=["']high/i.test(result)) {
      result = result.replace(/>$/, ' loading="lazy">');
    }
    if (result !== tag) updatedImages += 1;
    return result;
  });

  if (updated !== html) {
    fs.writeFileSync(page, updated);
    updatedPages += 1;
  }
}

console.log(`Prepared ${updatedImages} image tags across ${updatedPages} pages.`);
