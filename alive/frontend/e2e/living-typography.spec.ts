import { test, expect } from '@playwright/test'

test('typography fits, cycles without shifting, and respects pause and reduced motion', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('alive-intro-seen', '1'))
  await page.goto('/')
  const installation = page.locator('.living-typography')
  await expect(installation).toHaveAttribute('data-ready', 'true')
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await installation.scrollIntoViewIfNeeded()
    await expect(installation).toHaveAttribute('data-running', 'true')
    const before = await page.locator('.living-word').evaluateAll(nodes => nodes.map(node => {
      const { x, y, width, height } = node.getBoundingClientRect()
      return { x, y, width, height }
    }))
    expect(await installation.evaluate(element => [...element.querySelectorAll('.living-face')].every(face => face.scrollWidth <= face.clientWidth))).toBe(true)
    await page.waitForTimeout(2300)
    expect(await page.locator('.living-word').evaluateAll(nodes => nodes.map(node => {
      const { x, y, width, height } = node.getBoundingClientRect()
      return { x, y, width, height }
    }))).toEqual(before)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 1440 || width === 390) await page.screenshot({ path: `../../.impeccable/living-typography-${width}.png` })
  }
  await installation.focus()
  await page.keyboard.press('Space')
  await expect(installation).toHaveAttribute('aria-pressed', 'true')
  expect(await page.locator('.living-face').first().evaluate(node => getComputedStyle(node).animationPlayState)).toBe('paused')
  await page.keyboard.press('Space')
  await page.setViewportSize({ width: 390, height: 400 })
  await page.evaluate(() => scrollTo(0, 0))
  await expect(installation).toHaveAttribute('data-running', 'false')
  await installation.scrollIntoViewIfNeeded()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(installation).toHaveAttribute('data-running', 'false')
  expect(await page.locator('.living-face').first().evaluate(node => getComputedStyle(node).animationName)).toBe('none')
  expect(await page.locator('.living-face').first().evaluate(node => getComputedStyle(node).opacity)).toBe('1')
})
