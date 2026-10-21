import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('alive-intro-seen', '1'))
})

test('film strip preserves ratios, bounds decoders, and pauses for user, offscreen and reduced motion', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  const stage = page.locator('.home-video-stage')
  await stage.scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('video').first().evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0)
  expect(await page.locator('video[src]').count()).toBeLessThan(5)
  await expect(stage).toHaveCSS('mask-image', 'none')
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(248, 247, 243)')
  const ratios = await page.locator('video[src]').evaluateAll(videos => videos.map(element => {
    const video = element as HTMLVideoElement
    const rect = video.getBoundingClientRect()
    return { actual: video.videoWidth / video.videoHeight, displayed: rect.width / rect.height, fit: getComputedStyle(video).objectFit }
  }))
  ratios.forEach(ratio => { expect(ratio.actual).toBe(.75); expect(ratio.displayed).toBeCloseTo(.75, 2); expect(ratio.fit).toBe('contain') })
  await stage.press('Space')
  await expect.poll(() => page.locator('video').evaluateAll(videos => videos.every(video => (video as HTMLVideoElement).paused))).toBe(true)
  await stage.press('Space')
  await page.setViewportSize({ width: 1440, height: 600 })
  await page.locator('.site-footer').scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('video').evaluateAll(videos => videos.every(video => (video as HTMLVideoElement).paused))).toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await stage.scrollIntoViewIfNeeded()
  await expect(stage).toHaveCSS('overflow-x', 'auto')
  await expect(page.locator('.film-grain')).toHaveCSS('animation-name', 'none')
  await expect.poll(() => page.locator('video').evaluateAll(videos => videos.every(video => (video as HTMLVideoElement).paused))).toBe(true)
  await stage.press('ArrowRight')
  expect(await stage.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
  expect(errors).toEqual([])
})

test('one entire circuit stays linear and recycles only outside the visible strip', async ({ page }) => {
  test.setTimeout(60000)
  await page.goto('/')
  await page.locator('.home-video-stage').scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('video').first().evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0)
  await page.clock.install()
  await page.clock.pauseAt(Date.now())
  // Establish the RAF time origin after switching from the real browser clock.
  await page.clock.runFor(2000)
  const read = () => page.locator('.home-video-stage').evaluate(stage => {
    const origin = stage.getBoundingClientRect().left
    return {
      width: stage.clientWidth, gap: parseFloat(getComputedStyle(stage).columnGap),
      films: Array.from(stage.querySelectorAll('.film-strip-item')).map(item => {
        const rect = item.getBoundingClientRect()
        return { x: rect.left - origin, width: rect.width }
      }),
    }
  })
  let previous = await read()
  const cycle = previous.films.reduce((sum, film) => sum + film.width + previous.gap, 0)
  let wraps = 0
  const iterations = Math.ceil(cycle / 64) + 1
  for (let step = 0; step < iterations; step++) {
    await page.clock.runFor(2000)
    const current = await read()
    current.films.forEach((film, index) => {
      const before = previous.films[index]
      if (film.x > before.x + 1) {
        wraps++
        expect(before.x + before.width).toBeLessThan(65)
        expect(film.x).toBeGreaterThan(current.width)
      } else {
        expect(before.x - film.x).toBeGreaterThan(60)
        expect(before.x - film.x).toBeLessThan(67)
      }
    })
    const visible = current.films.filter(film => film.x < current.width && film.x + film.width > 0).sort((a, b) => a.x - b.x)
    expect(visible[0].x).toBeLessThanOrEqual(current.gap + 1)
    expect(visible.at(-1)!.x + visible.at(-1)!.width).toBeGreaterThan(current.width - current.gap - 1)
    previous = current
  }
  expect(wraps).toBeGreaterThanOrEqual(5)
})

for (const width of [1440, 768, 390]) {
  test(`film strip and preserved music inspection ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.locator('.home-video-stage').scrollIntoViewIfNeeded()
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `../../.impeccable/film-strip/home-${width}.png` })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.goto('/music')
    await page.locator('.archive-disc.is-active').focus()
    await page.waitForTimeout(900)
    await page.screenshot({ path: `../../.impeccable/film-strip/music-${width}.png` })
    await expect(page.locator('.archive-disc.is-active path').first()).toHaveCSS('animation-name', 'contour-orbit')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(page.locator('.archive-disc.is-active path').first()).toHaveCSS('animation-name', 'none')
  })
}

