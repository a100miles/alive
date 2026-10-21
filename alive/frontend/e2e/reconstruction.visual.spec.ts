import {test,expect}from'@playwright/test'

test.beforeEach(async({page})=>{await page.addInitScript(()=>sessionStorage.setItem('alive-intro-seen','1'))})
for(const size of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  for(const route of ['music','photography']){
    test(`${route} ${size.name} spatial composition`,async({page})=>{
      await page.setViewportSize(size);await page.goto(`/${route}`)
      await expect(page.getByRole('heading',{level:1})).toBeVisible();await page.evaluate(()=>document.fonts.ready)
      await expect.poll(()=>page.locator('img[loading="eager"]').evaluateAll(images=>images.every(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0))).toBe(true)
      await page.waitForTimeout(1200);await page.mouse.move(5,5)
      await expect(page).toHaveScreenshot(`${route}-${size.name}.png`,{maxDiffPixels:350})
    })
  }
}

test('aperture geometry at 266 ms',async({page})=>{
  await page.clock.install();await page.setViewportSize({width:1440,height:900});await page.goto('/photography')
  await expect(page.getByRole('heading',{level:1})).toBeVisible();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1400)
  await page.clock.pauseAt(Date.now()+100)
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About',exact:true}).click({force:true})
  await page.clock.runFor(266)
  await expect(page.locator('.scene-glass')).toHaveCount(1)
  await expect(page).toHaveScreenshot('aperture-266ms.png',{animations:'allow',maxDiffPixelRatio:.025})
  await page.clock.runFor(1200);await expect(page.locator('.scene-glass')).toHaveCount(0)
})

