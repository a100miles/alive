import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const output=resolve('../../.impeccable/reconstruction');await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const report={errors:[],frames:[],geometry:[]};page.on('pageerror',e=>report.errors.push(e.message));
await page.addInitScript(()=>sessionStorage.setItem('alive-intro-seen','1'));
async function settled(route){await page.goto(`http://127.0.0.1:5173${route}`);await page.waitForSelector('main h1');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1300);}
async function capture(name){await page.screenshot({path:resolve(output,`${name}.png`)});}
async function series(name,times,action){const start=Date.now();await action();for(const t of times){await page.waitForTimeout(Math.max(0,start+t-Date.now()));const actual=Date.now()-start;await capture(`${name}-${t}`);report.frames.push({name,target:t,actual});}}
async function geometry(label){report.geometry.push({label,...await page.evaluate(()=>{
 const disc=document.querySelector('.archive-disc.is-active');const photo=document.querySelector('.reel-plane.is-active img');
 let projected=null;if(disc){const m=new DOMMatrix(getComputedStyle(disc).transform), parent=disc.offsetParent.getBoundingClientRect(), r=disc.offsetWidth/2;const points=Array.from({length:180},(_,i)=>{const a=i/180*Math.PI*2,p=m.transformPoint(new DOMPoint(Math.cos(a)*r,Math.sin(a)*r,0,1));return {x:parent.x+disc.offsetLeft+r+p.x/p.w,y:parent.y+disc.offsetTop+r+p.y/p.w};});projected={x:Math.min(...points.map(p=>p.x)),y:Math.min(...points.map(p=>p.y)),right:Math.max(...points.map(p=>p.x)),bottom:Math.max(...points.map(p=>p.y))};}
 return{viewport:{width:innerWidth,height:innerHeight},disc:projected,photo:photo?.getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth};
})});}
try{
 await settled('/music');await capture('local-music-desktop');await geometry('music-desktop');
 await page.mouse.move(720,450);await series('local-music-wheel',[14,377,796,1206,1597],()=>page.mouse.wheel(0,450));
 await capture('local-music-selected');
 await settled('/photography');await capture('local-reel-desktop');await geometry('reel-desktop');
 await page.mouse.move(720,450);await series('local-reel-wheel',[30,456,828,1204],()=>page.mouse.wheel(0,300));
 await series('local-navigation',[41,266,443,659,1003,1816],()=>page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About',exact:true}).click());
 for(const route of ['/music','/photography']){await page.setViewportSize({width:390,height:844});await settled(route);await capture(`local-${route==='/music'?'music':'reel'}-mobile`);await geometry(`${route}-mobile`);}
 await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:5173/');await page.evaluate(()=>sessionStorage.removeItem('alive-intro-seen'));
 // Clear the initial-script override for this new context to capture a genuine intro.
 const introContext=await browser.newContext({viewport:{width:1440,height:900}});const intro=await introContext.newPage();const start=Date.now();await intro.goto('http://127.0.0.1:5173/');
 for(const t of [150,600,1000,1500,1900,2200,2600,3200]){await intro.waitForTimeout(Math.max(0,start+t-Date.now()));await intro.screenshot({path:resolve(output,`local-intro-${t}.png`)});report.frames.push({name:'local-intro',target:t,actual:Date.now()-start});}
 await introContext.close();
 await writeFile(resolve(output,'local-measurements.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({errors:report.errors,geometry:report.geometry}));
}finally{await browser.close();}
