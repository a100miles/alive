import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const files = ['2026-10-16 19-57-37.mp4', '2026-10-16 19-58-03.mp4', '2026-10-16 19-58-29.mp4'].map(name => `C:/Users/ASUS/Videos/${name}`);
const output = resolve('../../.impeccable/reconstruction/recordings');
await mkdir(output, { recursive: true });
const server = createServer((req, res) => {
  if (req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<html><body style="margin:0;background:#ddd"><video muted preload="auto" style="display:none"></video><canvas></canvas></body></html>'); return; }
  const index = Number(req.url?.slice(1));
  if (!Number.isInteger(index) || !files[index]) { res.writeHead(404); res.end(); return; }
  const file = files[index]; const size = statSync(file).size;
  const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  const start = range ? Number(range[1]) : 0; const end = range?.[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  res.writeHead(range ? 206 : 200, { 'Content-Type': 'video/mp4', 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes', ...(range ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}) });
  createReadStream(file, { start, end }).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const metadata = [];
try {
  await page.goto(origin);
  for (let index = 0; index < files.length; index++) {
    const info = await page.evaluate(async index => {
      const video = document.querySelector('video'); video.src = `/${index}`;
      await new Promise((resolve, reject) => { video.onloadeddata = resolve; video.onerror = reject; });
      return { width: video.videoWidth, height: video.videoHeight, duration: video.duration };
    }, index);
    metadata.push({ index: index + 1, file: files[index], ...info });
    const times = Array.from({ length: Math.ceil(info.duration / 2) }, (_, n) => n * 2);
    const sheet = await page.evaluate(async ({ times, info }) => {
      const video = document.querySelector('video'); const canvas = document.querySelector('canvas');
      const tileW = 384; const tileH = Math.round(tileW * info.height / info.width); const cols = 4;
      canvas.width = tileW * cols; canvas.height = (tileH + 28) * Math.ceil(times.length / cols);
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#e5e2d9'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let n = 0; n < times.length; n++) {
        video.currentTime = Math.max(.001, times[n]);
        await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
        const x = n % cols * tileW, y = Math.floor(n / cols) * (tileH + 28);
        ctx.drawImage(video, x, y, tileW, tileH); ctx.fillStyle = '#171717'; ctx.font = '16px sans-serif'; ctx.fillText(`${times[n].toFixed(2)}s`, x + 8, y + tileH + 20);
      }
      return canvas.toDataURL('image/png').split(',')[1];
    }, { times, info });
    await writeFile(resolve(output, `recording-${index + 1}-sheet.png`), Buffer.from(sheet, 'base64'));
    for (const time of [2, 2.2, 2.4, 2.6, 3, 4, 6, 8]) {
      const frame = await page.evaluate(async time => {
        const video = document.querySelector('video'); video.currentTime = time;
        await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
        const canvas=document.querySelector('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;
        canvas.getContext('2d').drawImage(video,0,0);return canvas.toDataURL('image/png').split(',')[1];
      }, time);
      await writeFile(resolve(output,`recording-${index + 1}-${time.toFixed(1)}s.png`),Buffer.from(frame,'base64'));
    }
    console.log(JSON.stringify(metadata.at(-1)));
  }
  await writeFile(resolve(output, 'metadata.json'), JSON.stringify(metadata, null, 2));
} finally { await browser.close(); server.close(); }
