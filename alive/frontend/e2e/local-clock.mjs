import {chromium} from '@playwright/test';
import{writeFile}from'node:fs/promises';
import{resolve}from'node:path';
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.clock.install();await page.addInitScript(()=>sessionStorage.setItem('alive-intro-seen','1'));
const report=[];
try{
 for(const mode of ['a24','jesper']){
  await page.clock.resume();await page.goto(`http://127.0.0.1:5173/${mode==='a24'?'music':'photography'}`);await page.waitForSelector('main h1');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1500);
  await page.clock.pauseAt(Date.now()+100);await page.screenshot({path:`../../.impeccable/reconstruction/local-${mode}-clock-before.png`});
  if(mode==='a24'){await page.mouse.move(720,450);await page.mouse.wheel(0,450);}else await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About',exact:true}).click({force:true});
  let previous=0;const times=mode==='a24'?[0,150,350,700,1050,1400]:[0,150,266,443,659,1000,1400];
  for(const time of times){await page.clock.runFor(time-previous);previous=time;await page.screenshot({path:`../../.impeccable/reconstruction/local-${mode}-clock-${time}.png`});report.push({mode,time,portal:await page.locator('.scene-clip-definitions path').count()?await page.locator('.scene-clip-definitions path').getAttribute('d'):null});}
 }
 await writeFile(resolve('../../.impeccable/reconstruction/local-clock.json'),JSON.stringify(report,null,2));
}finally{await browser.close()}
