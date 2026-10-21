async page => {
  await page.addInitScript(() => sessionStorage.setItem('alive-intro-seen','1'));
  for (const size of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]) {
    await page.setViewportSize(size);
    await page.goto('http://127.0.0.1:5173/');
    await page.locator('h1').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(1800);
    await page.screenshot({path:'../../.impeccable/review/notebook-home-'+size.name+'.png'});
  }
  return await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth}));
}
