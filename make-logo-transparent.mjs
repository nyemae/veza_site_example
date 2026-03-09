import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/GRZESIEK/AppData/Roaming/npm/node_modules/puppeteer');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = path.join(__dirname, 'b6bnbsburga6alplwsrtgo8jeuzeolod.webp');
const outputPath = path.join(__dirname, 'brand_assets', 'veza-logo.png');

// Embed image as base64 to avoid file:// security issues
const imgData = fs.readFileSync(inputPath).toString('base64');
const dataUrl = `data:image/webp;base64,${imgData}`;

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/GRZESIEK/.cache/puppeteer/chrome/win64-146.0.7680.31/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 800, height: 300 });

await page.setContent(`<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:transparent">
<canvas id="c"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const img = new Image();
img.onload = function() {
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], b = d[i+2];
    if (r > 235 && g > 235 && b > 235) {
      d[i+3] = 0;
    } else if (r > 215 && g > 215 && b > 215) {
      const dist = Math.max(r - 215, g - 215, b - 215);
      d[i+3] = Math.round(255 * (1 - dist / 40));
    }
  }
  ctx.putImageData(data, 0, 0);
  document.title = canvas.toDataURL('image/png');
};
img.src = '${dataUrl}';
</script>
</body></html>`);

await page.waitForFunction('document.title.startsWith("data:image/png")', { timeout: 15000 });
const result = await page.title();
const base64Out = result.replace('data:image/png;base64,', '');
fs.writeFileSync(outputPath, Buffer.from(base64Out, 'base64'));

await browser.close();
console.log('Done:', outputPath);
