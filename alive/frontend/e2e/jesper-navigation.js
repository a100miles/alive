async page => {
  const result={reference:'jesper',sequences:[],controls:[]};
  const sample=async(name,trigger)=>{
    await page.evaluate(()=>{
      window.__motionSamples=[];const start=performance.now();let last=-100;
      const frame=()=>{const t=performance.now()-start;if(t-last>40){last=t;window.__motionSamples.push({t,items:[...document.querySelectorAll('main,main article,body>div>div,p,nav')].filter(e=>{const b=e.getBoundingClientRect();return b.width>50&&b.height>10&&b.top<innerHeight&&b.bottom>0;}).slice(0,24).map(e=>{const c=getComputedStyle(e),b=e.getBoundingClientRect();return {tag:e.tagName,class:e.className,text:e.tagName==='P'?e.textContent.slice(0,36):'',x:b.x,y:b.y,w:b.width,h:b.height,transform:c.transform,opacity:c.opacity,filter:c.filter,clip:c.clipPath};})});}if(t<2500)requestAnimationFrame(frame);};requestAnimationFrame(frame);
    });
    const start=Date.now();await trigger();const shots=[];
    for(const t of [0,150,350,650,1000,1800,2600]){await page.waitForTimeout(Math.max(0,start+t-Date.now()));shots.push({target:t,actual:Date.now()-start});await page.screenshot({path:`../../.impeccable/reconstruction/jesper-${name}-${t}.png`});}
    result.sequences.push({name,url:page.url(),shots,samples:await page.evaluate(()=>window.__motionSamples)});
  };
  await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(900);
  await sample('profile',()=>page.getByRole('button',{name:'Profile',exact:true}).click());
  result.controls=await page.locator('button').allTextContents();
  const profile=page.getByRole('button',{name:/profile|close/i}).first();
  await sample('profile-close',()=>profile.click());
  await sample('full',()=>page.getByRole('link',{name:'Full',exact:true}).click());
  await sample('featured',()=>page.getByRole('link',{name:'Featured',exact:true}).click());
  const articles=page.locator('article');
  if(await articles.count()){
    await sample('project',()=>articles.nth(1).click());
    if(page.url()!=='https://jesperlandberg.com/')await sample('project-back',()=>page.goBack({waitUntil:'domcontentloaded'}));
  }
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(600);
  await sample('profile-mobile',()=>page.getByRole('button',{name:'Profile',exact:true}).click());
  return result;
}
