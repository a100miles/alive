async page => {
  const name = new URL(page.url()).hostname.includes('a24') ? 'a24' : new URL(page.url()).hostname.includes('huy') ? 'huy' : 'jesper';
  await page.screenshot({ path: `../../.impeccable/reconstruction/${name}-state.png` });
  return await page.evaluate(() => {
    const items = [...document.querySelectorAll('canvas,img,h1,h2,button,a,nav,[class*=loader],[class*=intro]')].map(el => {
      const box = el.getBoundingClientRect(), css = getComputedStyle(el);
      return { tag: el.tagName, class: typeof el.className === 'string' ? el.className : '', text: el.textContent?.trim().slice(0, 90), href: el.getAttribute('href'), box: { x:box.x,y:box.y,w:box.width,h:box.height }, css: { transform:css.transform, opacity:css.opacity, perspective:css.perspective, font:css.font, clipPath:css.clipPath, transition:css.transition, display:css.display } };
    }).filter(el => el.box.w > 0 && el.box.h > 0 && el.css.display !== 'none').slice(0, 75);
    return { url:location.href, viewport:{width:innerWidth,height:innerHeight}, scrollY, body:getComputedStyle(document.body).overflow, text:document.body.innerText.slice(0,1700), elements:items, animations:document.getAnimations().map(a=>({name:a.id,time:a.currentTime,state:a.playState,timing:a.effect?.getComputedTiming()})) };
  });
}
