import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/GRZESIEK/AppData/Roaming/npm/node_modules/puppeteer');

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/GRZESIEK/.cache/puppeteer/chrome/win64-146.0.7680.31/chrome-win64/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// Collect all image network requests
const imageUrls = new Set();
page.on('response', async (response) => {
  const url = response.url();
  const ct = response.headers()['content-type'] || '';
  if (ct.startsWith('image/') || /\.(webp|jpg|jpeg|png|gif|svg)(\?|$)/i.test(url)) {
    if (!url.includes('data:')) {
      imageUrls.add(url);
    }
  }
});

console.log('Loading https://veza-e.lt/ ...');
await page.goto('https://veza-e.lt/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));

// Scroll to trigger lazy loading
for (let i = 0; i < 8; i++) {
  await page.evaluate((i) => window.scrollTo(0, i * 600), i);
  await new Promise(r => setTimeout(r, 500));
}
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 2000));

// DOM images
const domImages = await page.evaluate(() => {
  return [...document.querySelectorAll('img')].map(img => ({
    src: img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy') || '',
    alt: img.alt || '',
    w: img.naturalWidth,
    h: img.naturalHeight,
  })).filter(i => i.src && !i.src.startsWith('data:'));
});

// Background images
const bgImages = await page.evaluate(() => {
  const res = new Set();
  document.querySelectorAll('*').forEach(el => {
    const bg = window.getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none' && bg.includes('url(')) {
      const m = bg.match(/url\(["']?([^"')]+)["']?\)/g);
      if (m) m.forEach(u => {
        const clean = u.replace(/url\(["']?/, '').replace(/["']?\)$/, '');
        if (!clean.startsWith('data:')) res.add(clean);
      });
    }
  });
  return [...res];
});

// Slider HTML
const sliderHTML = await page.evaluate(() => {
  const s = document.querySelector('.swiper, .swiper-container, [class*="slider"], [class*="banner"]');
  return s ? s.outerHTML.substring(0, 3000) : 'NOT FOUND';
});

console.log('\n=== NETWORK IMAGES (' + imageUrls.size + ') ===');
[...imageUrls].sort().forEach(u => console.log(u));

console.log('\n=== DOM IMAGES (' + domImages.length + ') ===');
domImages.forEach(i => console.log(`[${i.w}x${i.h}] ${i.src}  alt="${i.alt}"`));

console.log('\n=== BG IMAGES ===');
bgImages.forEach(u => console.log(u));

console.log('\n=== SLIDER HTML (first 3000 chars) ===');
console.log(sliderHTML);

await browser.close();
