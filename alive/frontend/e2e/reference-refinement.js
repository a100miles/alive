async page => {
  const report={events:[],frames:[]};const origin=Date.now();
  const shot=async(name)=>{const actual=Date.now()-origin;await page.screenshot({path:`../../.impeccable/reconstruction/${name}.png`});report.frames.push({name,actual,url:page.url()});};
  await page.setViewportSize({width:1440,height:900});
  report.events.push({name:'huy-navigation',t:Date.now()-origin});
  await page.goto('https://huyml.co/',{waitUntil:'domcontentloaded'});
  const loading=Date.now();
  for(const t of [1500,2500,3000,3500,4500,5000,5500,6500,8000]){await page.waitForTimeout(Math.max(0,loading+t-Date.now()));await shot(`huy-refined-load-${t}`);}
  await page.mouse.move(720,450);report.events.push({name:'huy-wheel-300',t:Date.now()-origin});await page.mouse.wheel(0,300);
  for(const t of [0,200,500,1000]){await page.waitForTimeout(t?200:0);await shot(`huy-reel-wheel-${t}`);}
  await page.mouse.move(720,500);await page.mouse.down();await page.mouse.move(720,240,{steps:20});await page.mouse.up();await page.waitForTimeout(900);await shot('huy-vertical-drag');
  report.huy={url:page.url(),frames:page.frames().map(f=>f.url()),animations:await page.evaluate(()=>document.getAnimations().map(a=>({state:a.playState,timing:a.effect?.getComputedTiming()})))};
  await page.goto('https://a24.raviklaassens.com/',{waitUntil:'domcontentloaded'});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(6500);await shot('a24-mobile-fresh');
  const cdp=await page.context().newCDPSession(page);report.events.push({name:'a24-touch-up',t:Date.now()-origin});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:560}]});
  for(let y=540;y>=260;y-=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y}]});await page.waitForTimeout(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await shot('a24-mobile-touch-0');await page.waitForTimeout(250);await shot('a24-mobile-touch-250');await page.waitForTimeout(750);await shot('a24-mobile-touch-1000');
  await cdp.detach();return report;
}
