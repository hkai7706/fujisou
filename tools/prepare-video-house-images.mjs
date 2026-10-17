import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const folder='img/videos/modern-hiraya-black-wood';
const originals=path.join(root,folder,'originals');
const selection=[
  ['0049','black-wood-hiraya-exterior','黒の外壁と木目を組み合わせた平屋の外観'],
  ['0050','wood-entrance-porch','木張りで仕上げた玄関ポーチ'],
  ['0053','entrance-hall','無垢床と白い壁でまとめた玄関ホール'],
  ['0064','open-living-dining','キッチンとつながるリビング・ダイニング'],
  ['0068','dark-grey-kitchen','ダークグレーの対面キッチンと背面収納'],
  ['0062','living-window','大きな窓に面したリビング'],
  ['0058','bedroom-closet','収納を備えた洋室'],
  ['0073','corner-bedroom','二面の窓から光が入る洋室'],
  ['0055','entrance-adjustable-shelves','玄関まわりに設けた木の可動棚'],
  ['0076','wood-walk-in-closet','木張りで仕上げたウォークインクローゼット'],
  ['0078','washroom-dressing','洗面台と作業カウンターを設けた脱衣室'],
  ['0080','bathroom','落ち着いた色合いの浴室'],
  ['0088','living-track-lighting','リビングのスポットライト'],
  ['0089','plaster-wall-texture','漆喰壁の表情と壁付けの操作パネル']
];
const files=fs.readdirSync(originals);const photos=[];let bytes=0;
for(const [number,name,caption]of selection){
  const source=files.find(file=>file.includes(`_${number}_D.`));if(!source)throw Error('Missing source photograph '+number);
  const variants=[];
  for(const size of [900,1800]){const relative=`${folder}/${name}-${size}.webp`;const info=await sharp(path.join(originals,source)).rotate().resize({width:size,height:size,fit:'inside',withoutEnlargement:true}).webp({lossless:true,effort:6}).toFile(path.join(root,relative));variants.push({src:relative,width:info.width,height:info.height});bytes+=info.size;}
  photos.push({...variants[1],small:variants[0],caption,original:source});
}
const recordsFile=path.join(root,'videos/posts.json');const records=JSON.parse(fs.readFileSync(recordsFile,'utf8'));const video=records.find(v=>v.youtubeId==='_UZrtXhPSKQ');if(!video)throw Error('Video record missing');
video.house={title:'黒と木目が映える、無垢材と漆喰の平屋',intro:'木張りの玄関から、無垢床のリビングへ。対面キッチンを中心に、洋室や収納、水まわりへとつながる平屋の住まいです。動画と写真で、素材の表情や部屋のつながりをご覧ください。',facts:[['建物タイプ','平屋・注文住宅'],['外観','黒の金属サイディングと木目の組み合わせ'],['内装','無垢材のフローリング・漆喰壁'],['キッチン','ダークグレーの対面キッチン・背面収納'],['収納','玄関まわりの可動棚・ウォークインクローゼット'],['水まわり','洗面・脱衣室・浴室']],floorPlan:null,photos};
fs.writeFileSync(recordsFile,JSON.stringify(records,null,2)+'\n');console.log(`Prepared ${photos.length} selected photographs / ${Math.round(bytes/1048576*10)/10} MiB. All 65 originals preserved locally.`);
