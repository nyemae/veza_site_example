import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/GRZESIEK/AppData/Roaming/npm/node_modules/puppeteer');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/GRZESIEK/.cache/puppeteer/chrome/win64-146.0.7680.31/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// Navigate but DON'T wait for networkidle — catch the intro mid-animation
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

// Give fonts ~400ms to load then capture the drawing phase
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: path.join(__dirname, 'temporary screenshots', 'intro-t400.png') });

// Stroke drawing mid-way (~1.8s in)
await new Promise(r => setTimeout(r, 1400));
await page.screenshot({ path: path.join(__dirname, 'temporary screenshots', 'intro-t1800.png') });

// After strokes + fill in (~3.3s)
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: path.join(__dirname, 'temporary screenshots', 'intro-t3300.png') });

// After overlay dissolves (~4.5s total)
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: path.join(__dirname, 'temporary screenshots', 'intro-t4500.png') });

await browser.close();
console.log('Intro frames captured');
