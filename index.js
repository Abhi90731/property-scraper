const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const url = process.argv[2];
if (!url || !url.startsWith('http')) {
  console.error('❌ Please provide a valid URL with https:// or http://');
  process.exit(1);
}

function pickScraper(url) {
  if (url.includes('magicbricks.com')) return require('./scrappers/magicbricks');
  if (url.includes('99acres.com')) return require('./scrappers/99acers');
  if (url.includes('housing.com')) return require('./scrappers/housing');
  if (url.includes('commonfloor.com')) return require('./scrappers/commfloor');
  if (url.includes('nobroker.in')) return require('./scrappers/nobroker');
  if (url.includes('squareyards.com')) return require('./scrappers/squareyards');
  return require('./scrappers/default');
}

async function scrapeWithPuppeteer(url) {
  const scraper = pickScraper(url);

  const browser = await puppeteer.launch({
    headless: false, // 👈 use visible Chrome so you can see what happens
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // ✅ <-- YOUR local Chrome path
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');

  console.log('⏳ Visiting page...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // ✅ Universal auto-scroll so dynamic content loads
  console.log('⏳ Auto-scrolling...');
  await autoScroll(page);

  try {
    const result = await scraper(page);
    if (result.success) {
      await browser.close();
      fs.writeFileSync('output.json', JSON.stringify({
        url,
        content: result.content
      }, null, 2));
      console.log(`✅ Scrape succeeded. Output saved to output.json`);
      return;
    } else {
      throw new Error(result.reason);
    }
  } catch (err) {
    const screenshot = `screenshots/fail_${Date.now()}.png`;
    if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');
    await page.screenshot({ path: screenshot });
    await browser.close();
    fs.writeFileSync('report.json', JSON.stringify({
      url,
      reason: err.message,
      screenshot
    }, null, 2));
    console.error(`⚠️ Scrape failed. Report saved.`);
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
}

scrapeWithPuppeteer(url);
