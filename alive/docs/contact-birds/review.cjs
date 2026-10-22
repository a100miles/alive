async (page) => {


  const results = [];
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:5173/contact');
    await page.locator('.contact-bird').first().waitFor();
    await page.waitForTimeout(800);
    const before = await page.locator('.contact-bird').evaluateAll(nodes => nodes.map(n => n.style.transform));
    await page.waitForTimeout(1100);
    const after = await page.locator('.contact-bird').evaluateAll(nodes => nodes.map(n => n.style.transform));
    if (!before.every((value, i) => value !== after[i])) throw new Error('Not all birds moving');
    const geometry = await page.evaluate(() => {
      const sky = document.querySelector('.contact-sky').getBoundingClientRect();
      const heading = document.querySelector('h1').getBoundingClientRect();
      const links = [...document.querySelectorAll('.contact-links a')].map(n => ({ href: n.href, width: n.getBoundingClientRect().width, height: n.getBoundingClientRect().height }));
      return { overflow: document.documentElement.scrollWidth > innerWidth, sky: sky.toJSON(), heading: heading.toJSON(), links };
    });
    if (geometry.overflow || geometry.links.some(n => n.width < 44 || n.height < 44)) throw new Error('Layout or target failure');
    if (await page.getByRole('button', { name: 'pause birds' }).count()) throw new Error('Pause button should be absent');
    await page.locator('h1').focus();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `../docs/contact-birds/${width}.png`, fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);
    if (await page.getByRole('button', { name: 'pause birds' }).count()) throw new Error('Reduced motion failure');
    if ((await page.locator('.contact-bird').evaluateAll(nodes => nodes.map(n => n.style.transform))).some(Boolean)) throw new Error('Reduced motion transform failure');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    results.push({ width, allBirdsMoved: true, reducedMotion: true, ...geometry });
  }

  console.log(JSON.stringify(results));
}
