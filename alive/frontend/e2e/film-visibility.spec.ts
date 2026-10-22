import { test, expect } from '@playwright/test'

for (const width of [1440, 390]) {
  test(`films retain their frames at the scroll boundary ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 })
    await page.addInitScript(() => sessionStorage.setItem('alive-intro-seen', '1'))
    await page.goto('/')
    const stage = page.locator('.home-video-stage')
    await expect(stage).toHaveCSS('background-color', 'rgb(23, 23, 23)')
    await expect(page.locator('.home-spread')).toHaveCSS('transform', 'none')
    await stage.scrollIntoViewIfNeeded()
    const visibleFilms = () => stage.locator('video').evaluateAll(videos => videos
      .filter(video => {
        const rect = video.parentElement!.getBoundingClientRect()
        return rect.left < innerWidth && rect.right > 0
      })
      .map(video => ({ loaded: video.hasAttribute('src') && video.readyState >= 2, paused: video.paused })))
    await expect.poll(async () => (await visibleFilms()).every(video => video.loaded && !video.paused)).toBe(true)
    for (const remaining of [30, 2, -10, 30]) {
      await stage.evaluate((element, pixels) => {
        window.scrollTo(0, element.getBoundingClientRect().bottom + scrollY - pixels)
      }, remaining)
      await page.waitForTimeout(250)
      const gap = await stage.evaluate(element => document.querySelector('.home-listening-band')!.getBoundingClientRect().top - element.getBoundingClientRect().bottom)
      expect(Math.abs(gap)).toBeLessThan(.5)
      await expect.poll(async () => (await visibleFilms()).every(video => video.loaded)).toBe(true)
      await expect.poll(async () => (await visibleFilms()).every(video => video.paused === (remaining < 0))).toBe(true)
      if (remaining === 30) await page.screenshot({ path: `../../.impeccable/film-boundary-${width}.png` })
    }
  })
}
