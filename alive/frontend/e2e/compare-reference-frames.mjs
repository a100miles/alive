import {chromium}from'@playwright/test';
import{readFile,mkdir,writeFile}from'node:fs/promises';
import{resolve}from'node:path';
const root=resolve('../../.impeccable/reconstruction'),output=resolve('../docs/comparisons');await mkdir(output,{recursive:true});
const pairs=[
 ['discs-desktop','ref-a24-clock-before.png','local-a24-clock-before.png','Desktop resting geometry — 1440 × 900'],
 ['discs-350ms','ref-a24-clock-350.png','local-a24-clock-350.png','Wheel +450px — 350 ms virtual animation time'],
 ['discs-700ms','ref-a24-clock-700.png','local-a24-clock-700.png','Wheel +450px — 700 ms virtual animation time'],
 ['discs-mobile','a24-mobile-fresh.png','local-music-mobile.png','Mobile resting geometry — 390 × 844'],
 ['photography-desktop','huy-load-8000.png','local-reel-desktop.png','Perspective reel resting geometry — 1440 × 900'],
 ['photography-mobile','huy-mobile-gallery.png','local-reel-mobile.png','Mobile reel resting geometry — 390 × 844'],
 ['navigation-150ms','ref-jesper-clock-150.png','local-jesper-clock-150.png','Navigation aperture — 150 ms virtual animation time'],
 ['navigation-266ms','ref-jesper-clock-266.png','local-jesper-clock-266.png','Navigation aperture — 266 ms virtual animation time'],
 ['navigation-443ms','ref-jesper-clock-443.png','local-jesper-clock-443.png','Navigation aperture — 443 ms virtual animation time'],
 ['intro-typography','huy-refined-load-5000.png','local-intro-1900.png','Typography hold — equivalent phase, asset-dependent start times'],
];
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();const links=[];
try{for(const[name,reference,local,label]of pairs){
 const images=await Promise.all([reference,local].map(async filename=>'data:image/png;base64,'+(await readFile(resolve(root,filename))).toString('base64')));
 const data=await page.evaluate(async({images,label})=>{
  const loaded=await Promise.all(images.map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;})));
  const scale=loaded[0].width>1000?.64:1,w=Math.round(loaded[0].width*scale),h=Math.round(loaded[0].height*scale),gap=20,top=70;
  const canvas=document.createElement('canvas');canvas.width=w*2+gap;canvas.height=h+top;const ctx=canvas.getContext('2d');ctx.fillStyle='#dedbd2';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#171717';ctx.font='16px sans-serif';ctx.fillText(label,14,24);ctx.font='13px sans-serif';ctx.fillText('Reference — research evidence only',14,53);ctx.fillText('a.l.i.v.e — original implementation and local artwork',w+gap+14,53);
  loaded.forEach((img,i)=>ctx.drawImage(img,i*(w+gap),top,w,h));return canvas.toDataURL('image/png').split(',')[1];
 },{images,label});
 await writeFile(resolve(output,`${name}.png`),Buffer.from(data,'base64'));links.push(`<figure><a href="${name}.png"><img src="${name}.png" alt="${label}: reference on left, a.l.i.v.e on right"></a><figcaption>${label}</figcaption></figure>`);
}
await writeFile(resolve(output,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>a.l.i.v.e interaction comparison</title><style>body{font:16px system-ui;background:#f2f0eb;color:#171717;margin:32px;line-height:1.6}main{max-width:1500px;margin:auto}figure{margin:40px 0}img{width:100%;height:auto}p{max-width:80ch}figcaption{font-size:13px}a{color:inherit}</style><main><h1>Reference interaction comparison</h1><p>Same viewport dimensions; matched animation timestamps where stated. Different branding and artwork are intentional. Clock captures are quantized to approximately one animation frame (16 ms). Raw pixel differences are not used as a fidelity score because content and colors differ. See ../reference-interactions.md for geometry, timing, source limitations and verification.</p>${links.join('')}</main></html>`);
console.log(`Wrote ${pairs.length} paired comparisons to ${output}`);
}finally{await browser.close()}
