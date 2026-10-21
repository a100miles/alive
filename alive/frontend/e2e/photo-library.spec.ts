import { test, expect } from '@playwright/test'
import type { Album, Photo, Release } from '../src/types'

test('all supplied photographs are served and the archive has no sample images', async ({ page, request }) => {
  const photos = (await (await request.get('/api/v1/photos')).json()).data as Photo[]
  const albums = (await (await request.get('/api/v1/albums')).json()).data as Album[]
  const releases = (await (await request.get('/api/v1/releases')).json()).data as Release[]
  expect(photos).toHaveLength(48)
  expect(albums).toHaveLength(5)
  expect(new Set(photos.map(photo => photo.src)).size).toBe(48)
  expect(photos.every(photo => !photo.demo && photo.description && photo.alt && photo.src.startsWith('/media/collections/'))).toBe(true)
  expect(releases.every(release => release.coverImage.startsWith('/media/collections/'))).toBe(true)
  for (const photo of photos) {
    const response = await request.get(photo.src)
    expect(response.ok(), photo.src).toBe(true)
    expect(response.headers()['content-type']).toContain('image/jpeg')
  }
  await page.addInitScript(() => sessionStorage.setItem('alive-intro-seen', '1'))
  await page.goto('/photography')
  await expect(page.locator('.reel-plane')).toHaveCount(48)
  expect(await page.locator('.reel-plane img').count()).toBeLessThanOrEqual(9)
  for (const album of albums) {
    await page.getByRole('button', { name: album.title, exact: true }).click()
    const selected = photos.filter(photo => photo.albumId === album.id)
    await expect(page.locator('.reel-plane')).toHaveCount(selected.length)
    await page.getByRole('region', { name: /Photograph reel/ }).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.viewer-bottom h2')).toHaveText(selected[0].title)
    await expect(page.locator('.viewer-bottom p')).toHaveText(selected[0].description)
    await expect(page.locator('.viewer-bottom')).not.toContainText('Sample photograph')
    await page.keyboard.press('Escape')
  }
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.locator('.home-video-stage').scrollIntoViewIfNeeded()
    await page.waitForTimeout(1800)
    await page.screenshot({ path: `../../.impeccable/photo-review/films-${width}.png` })
    await page.goto('/photography')
    await expect(page.locator('.reel-plane.is-active img')).toBeVisible()
    await expect.poll(() => page.locator('.reel-plane.is-active img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true)
    await page.waitForTimeout(800)
    await page.screenshot({ path: `../../.impeccable/photo-review/gallery-${width}.png` })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})
