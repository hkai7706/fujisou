import sharp from 'sharp';

// Re-export from the original photographs, never from the compressed WebPs.
const images = [
 {source:'img/gallery/post31-04-ldk-web.jpg',output:'img/home/hero-material-hq',widths:[768,1152,1920,2560],ratio:1.5},
 {source:'img/gallery/exterior-safe-home-retouched-v2.jpg',output:'img/gallery/exterior-hero-hq',widths:[768,1152,1535]},
 {source:'img/home/fujisou-kitchen-retouched-v2.jpg',output:'img/home/kitchen-hero-hq',widths:[768,1152,1538]}
];
for(const image of images){
 for(const width of image.widths){
  const resize=image.ratio?{width,height:Math.round(width/image.ratio)}:{width};
  await sharp(image.source).resize({...resize,withoutEnlargement:true})
   .webp({quality:94,smartSubsample:true,effort:6}).toFile(`${image.output}-${width}.webp`);
 }
}
console.log('High-quality responsive hero photographs exported from originals.');
