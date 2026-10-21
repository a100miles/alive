import { test, expect } from '@playwright/test'

test('notebook fonts and reversible section reveals', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('alive-intro-seen', '1'))
  await page.setViewportSize({width: 1440, height: 900})
  await page.goto('/')
  await expect(page.locator('.home-wordmark')).toHaveCSS('font-family', '"Indie Flower", cursive')
  await expect(page.locator('.desktop-nav')).toHaveCSS('font-family', '"Cutive Mono", monospace')
  const section = page.locator('.home-listening')
  await expect(section).toHaveCSS('opacity', '0')
  await section.scrollIntoViewIfNeeded()
  await expect(section).toHaveCSS('opacity', '1')
  await page.evaluate(() => scrollTo(0, 0))
  await expect(section).toHaveCSS('opacity', '0')
  await page.emulateMedia({reducedMotion: 'reduce'})
  await expect(section).toHaveCSS('opacity', '1')
  await expect(section).toHaveCSS('transform', 'none')
})
