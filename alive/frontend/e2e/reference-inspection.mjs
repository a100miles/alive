import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve('../docs/references');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const references = [
  ['huy', 'https://huyml.co/'],
  ['a24', 'https://a24.raviklaassens.com/'],
  ['jesper', 'https://jesperlandberg.com/'],
];

try {
  for (const [name, url] of references) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const warnings = [];
    page.on('pageerror', (error) => warnings.push(error.message));
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.screenshot({ path: resolve(output, `${name}-desktop-initial.png`), timeout: 10000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: resolve(output, `${name}-desktop-settled.png`), timeout: 10000 });
      console.log(JSON.stringify({ reference: name, url: page.url(), status: response?.status(), title: await page.title(), text: (await page.locator('body').innerText()).slice(0, 3500), controls: await page.locator('button, a').evaluateAll((nodes) => nodes.map((node) => ({ text: node.textContent?.trim().slice(0, 70), href: node.getAttribute('href') })).filter((item) => item.text).slice(0, 30)), warnings }));
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: resolve(output, `${name}-mobile-initial.png`), timeout: 10000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: resolve(output, `${name}-mobile-settled.png`), timeout: 10000 });
    } catch (error) {
      console.log(JSON.stringify({ reference: name, blocked: error.message, warnings }));
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
