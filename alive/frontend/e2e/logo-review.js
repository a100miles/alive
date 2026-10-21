async page => {
  await page.goto('http://127.0.0.1:5173/');
  const results=[];
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    await page.locator('.site-header > .brand img').waitFor();
    results.push(await page.locator('.site-header > .brand img').evaluate(img => ({src:img.getAttribute('src'),loaded:img.complete && img.naturalWidth>0,width:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height})));
  }
  return {results,favicon:await page.locator('link[rel="icon"]').getAttribute('href')};
}
