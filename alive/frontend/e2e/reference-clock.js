async page=>{
  const report={clock:'Playwright virtual RAF, 16ms frame quantization',sequences:[]};
  await page.clock.install();await page.setViewportSize({width:1440,height:900});
  for(const site of ['a24','jesper']){
    await page.clock.resume();await page.goto(site==='a24'?'https://a24.raviklaassens.com/':'https://jesperlandberg.com/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(8000);
    await page.clock.pauseAt(Date.now()+100);
    await page.screenshot({path:`../../.impeccable/reconstruction/ref-${site}-clock-before.png`});
    if(site==='a24'){await page.mouse.move(720,450);await page.mouse.wheel(0,450);}else await page.getByRole('link',{name:'Full',exact:true}).click({force:true});
    let prior=0;const times=site==='a24'?[0,150,350,700,1050,1400]:[0,150,266,443,659,1000,1400];
    for(const t of times){await page.clock.runFor(t-prior);prior=t;await page.screenshot({path:`../../.impeccable/reconstruction/ref-${site}-clock-${t}.png`});}
    report.sequences.push({site,times,url:page.url()});
  }
  await page.clock.resume();return report;
}
