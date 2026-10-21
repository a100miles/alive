import {chromium} from '@playwright/test';
import {writeFile}from'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.addInitScript(()=>sessionStorage.setItem('alive-intro-seen','1'));
try{await page.goto('http://127.0.0.1:5173/music');await page.waitForSelector('.archive-disc');await page.waitForTimeout(1400);
 const result=await page.evaluate(()=>{
  const element=document.querySelector('.archive-disc'),radius=element.offsetWidth/2,parent=element.offsetParent.getBoundingClientRect();
  const center={x:parent.x+element.offsetLeft+radius,y:parent.y+element.offsetTop+radius};
  const bounds=(rx,ry,scale,x,y)=>{
   const perspective=new DOMMatrix();perspective.m34=-1/(radius*5);
   const m=perspective.translate(x,y).rotate(0,0,-23).rotate(0,ry,0).rotate(rx,0,0).scale(scale);
   let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
   for(let n=0;n<180;n++){const a=n/180*Math.PI*2,p=m.transformPoint(new DOMPoint(Math.cos(a)*radius,Math.sin(a)*radius,0,1)),px=center.x+p.x/p.w,py=center.y+p.y/p.w;left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
   return [left,top,right,bottom];
  };
  const targets=[{name:'active',box:[484,184,1014,734],x:0,y:0,start:[45,-28,1]},{name:'previous',box:[68,368,495,786],x:-440,y:115,start:[45,-28,.8]}];
  return {center,css:element.style.transform,results:targets.map(target=>{
   let candidate=target.start,step=[4,4,.04];const score=p=>bounds(...p,target.x,target.y).reduce((sum,v,i)=>sum+(v-target.box[i])**2,0);let best=score(candidate);
   for(let iteration=0;iteration<20;iteration++){let changed=false;for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){const p=[...candidate];p[axis]+=step[axis]*sign;const value=score(p);if(value<best){candidate=p;best=value;changed=true;}}if(!changed)step=step.map(s=>s*.5);}
   return {name:target.name,target:target.box,estimate:{rotationX:candidate[0],rotationY:candidate[1],scale:candidate[2]},bounds:bounds(...candidate,target.x,target.y),rmsEdgeError:Math.sqrt(best/4)};
  })};
 });await writeFile('../docs/references/disc-calibration.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close()}
