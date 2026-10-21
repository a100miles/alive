import {test,expect} from '@playwright/test'

test('pencil motion, glass interruption and signature respect reduced motion', async ({page}) => {
  await page.addInitScript(() => sessionStorage.setItem('alive-intro-seen','1'))
  await page.goto('/music')
  await expect(page.locator('.archive-disc.is-active')).toBeVisible()
  await expect(page.locator('.archive-disc.is-active .disc-object')).toHaveCSS('animation-name','none')
  await page.locator('.archive-disc.is-active').hover()
  await expect(page.locator('.archive-disc.is-active path').first()).toHaveCSS('animation-name','contour-orbit')
  await page.clock.install()
  await page.clock.pauseAt(Date.now()+100)
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Home',exact:true}).click({force:true})
  await page.clock.runFor(266)
  await expect(page.locator('.scene-glass')).toHaveCSS('backdrop-filter','blur(18px) saturate(0.75)')
  await expect(page.locator('.scene-transitioning .disc-hover-contour').first()).toHaveCSS('visibility','hidden')
  await page.emulateMedia({reducedMotion:'reduce'})
  await expect(page.locator('.scene-glass')).toHaveCount(0)
  await expect(page.locator('.home-wordmark')).toBeFocused()
  await expect(page.locator('.home-wordmark')).toHaveCSS('animation-name','none')
  await expect(page.locator('.home-wordmark')).toHaveCSS('font-family','"Indie Flower", cursive')
})

