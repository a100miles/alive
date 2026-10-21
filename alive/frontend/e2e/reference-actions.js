async page => {
  const name = new URL(page.url()).hostname.includes('a24') ? 'a24' : new URL(page.url()).hostname.includes('huy') ? 'huy' : 'jesper';
  const report = { reference: name, viewport: { width: 1440, height: 900 }, frames: [], errors: [] };
  page.on('pageerror', error => report.errors.push(error.message));
  const state = () => page.evaluate(() => ({
    url: location.href, viewport: { width: innerWidth, height: innerHeight }, scrollY,
    text: document.body.innerText.slice(0, 600),
    controls: [...document.querySelectorAll('a,button')].filter(el => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })).map(el => ({ text: el.textContent.trim().slice(0, 50), href: el.getAttribute('href'), box: el.getBoundingClientRect().toJSON() })).slice(0, 35),
    transformed: [...document.querySelectorAll('main *,canvas,[class*=intro],[class*=loader]')].filter(el => { const s=getComputedStyle(el), b=el.getBoundingClientRect(); return b.width>20 && b.height>10 && b.bottom>0 && b.top<innerHeight && (s.transform!=='none'||el.tagName==='CANVAS'); }).slice(0,30).map(el=>{ const s=getComputedStyle(el);return {tag:el.tagName,class:typeof el.className==='string'?el.className:'',box:el.getBoundingClientRect().toJSON(),transform:s.transform,opacity:s.opacity,filter:s.filter,clipPath:s.clipPath,transition:s.transition}; }),
    animations: document.getAnimations().map(a=>({state:a.playState,time:a.currentTime,timing:a.effect?.getComputedTiming()})),
  }));
  const series = async (action, times, trigger) => {
    const started = Date.now(); if (trigger) await trigger();
    for (const target of times) {
      await page.waitForTimeout(Math.max(0, started + target - Date.now()));
      const actual = Date.now() - started;
      await page.screenshot({ path: `../../.impeccable/reconstruction/${name}-${action}-${target}.png` });
      report.frames.push({ action, target, actual, state: await state() });
    }
  };
  await page.setViewportSize(report.viewport);
  await series('load', [0,250,500,1000,2000,4000,8000], () => page.reload({ waitUntil:'domcontentloaded', timeout:20000 }));
  await series('hover', [0,200,600], () => page.mouse.move(720,450));
  await page.mouse.move(1000,450); await page.mouse.down();
  const dragStart = Date.now();
  for (let step=1;step<=4;step++) {
    await page.mouse.move(1000-step*100,450,{steps:5});
    await page.waitForTimeout(80);
    await page.screenshot({path:`../../.impeccable/reconstruction/${name}-drag-${step}.png`});
    report.frames.push({action:'drag-held',target:step*100,actual:Date.now()-dragStart,state:await state()});
  }
  await series('release',[0,150,350,700,1400],()=>page.mouse.up());
  await series('wheel',[0,150,350,700,1400],()=>page.mouse.wheel(0,450));
  if (name==='a24') {
    await series('select',[0,200,450,900,1800],()=>page.mouse.click(720,450));
    if (page.url() !== 'https://a24.raviklaassens.com/') await series('back',[0,400,1000],()=>page.goBack({waitUntil:'domcontentloaded'}));
  }
  await page.setViewportSize({width:390,height:844});
  await series('mobile-resize',[0,400,1200]);
  await series('mobile-wheel',[0,200,600,1200],()=>page.mouse.wheel(0,300));
  return report;
}
