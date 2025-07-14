module.exports = async function defaultScraper(page) {
  console.log('⏳ Using default fallback scraper...');
  const text = await page.evaluate(() => document.body.innerText.trim());

  if (text.length < 200 || text.toLowerCase().includes('captcha')) {
    throw new Error('Fallback too little text or captcha found.');
  }

  return { success: true, content: text };
};
