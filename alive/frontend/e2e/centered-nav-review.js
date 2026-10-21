async page => {
  await page.addInitScript(()=>sessionStorage.setItem('alive-intro-seen','1'));
  const results=[];
  for (const size of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]) {
    await page.setViewportSize(size);
    await page.goto('http://127.0.0.1:5173/');
    await page.locator('h1').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(1800);
    results.push(await page.evaluate(()=>({brandCount:document.querySelectorAll('.site-header .brand').length,lowercase:getComputedStyle(document.body).textTransform,overflow:document.documentElement.scrollWidth>innerWidth,navCenter:(()=>{const r=document.querySelector('.desktop-nav').getBoundingClientRect();return r.x+r.width/2})()})));
    await page.screenshot({path:'../../.impeccable/review/centered-nav-'+size.name+'.png'});
  }
  await page.getByRole('button',{name:'Open menu'}).click();
  await page.screenshot({path:'../../.impeccable/review/centered-nav-menu.png'});
  return results;
}
