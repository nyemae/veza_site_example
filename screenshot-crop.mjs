import { createRequire } from 'module';
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
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

const footH = await page.evaluate(() => document.body.scrollHeight);
// Footer logo area
await page.screenshot({ path: path.join(__dirname, 'temporary screenshots', 'crop-footer-logo.png'), clip: { x: 0, y: footH - 520, width: 1440, height: 320 } });

await browser.close();
console.log('Done');
