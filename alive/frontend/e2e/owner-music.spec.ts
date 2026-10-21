import { test, expect } from '@playwright/test'

test('supplied tracks play, seek and persist without demo labels', async ({ page, request }) => {
  await page.addInitScript(() => sessionStorage.setItem('alive-intro-seen', '1'))
  await page.goto('/music')
  const releases = (await (await request.get('/api/v1/releases')).json()).data
  expect(releases.map((release: { title: string }) => release.title)).toEqual(['020226', 'dontwannabelikethis', 'somebodynotanybody', 'sunrise'])
  for (const release of releases) {
    expect(release.demo).toBe(false)
    const track = (await (await request.get(`/api/v1/tracks/${release.trackIds[0]}`)).json()).data
    expect(track.demo).toBe(false)
    const response = await request.get(track.audioUrl, { headers: { Range: 'bytes=0-1023' } })
    expect(response.status()).toBe(206)
    await page.locator('.disc-stage').focus()
    await expect(page.locator('.archive-disc.is-active')).toHaveAttribute('data-release-id', release.id)
    await page.getByRole('button', { name: `Play ${track.title}`, exact: true }).click()
    await expect(page.locator('.now-playing')).toContainText(`Playing: ${track.title}`)
    await expect.poll(() => page.locator('.release-player input[aria-label="Audio position"]').inputValue().then(Number)).toBeGreaterThan(0)
    const seek = page.locator('.release-player input[aria-label="Audio position"]')
    expect(Number(await seek.getAttribute('max'))).toBeCloseTo(track.duration, 0)
    await seek.fill('30')
    await expect.poll(() => seek.inputValue().then(Number)).toBeGreaterThanOrEqual(30)
    if (release.id !== 'sunrise') {
      await page.locator('.disc-stage').focus()
      await page.keyboard.press('ArrowRight')
    }
  }
  await expect(page.locator('.release-demo')).toHaveCount(0)
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Photography', exact: true }).click()
  await expect(page.locator('.persistent-player')).toContainText('sunrise')
  await expect(page.locator('.persistent-player')).not.toContainText('demo')
  await expect(page.locator('.reel-expand, .expand-image')).toHaveCount(0)
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `../../.impeccable/reel-interface/bottom-${width}.png` })
  }
})
