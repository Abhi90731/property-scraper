module.exports = async function commonfloorScraper(page) {
  console.log('⏳ Using CommonFloor scraper with links & contact...');

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const collected = new Map();
  let retries = 0, lastCount = 0;

  while (retries < 5) {
    const cards = await page.$$eval('.project-card', cards =>
      cards.map(card => {
        const titleEl = card.querySelector('h2 a');
        const link = titleEl?.href?.trim() || '';
        const title = titleEl?.innerText.trim() || '';
        const location = card.querySelector('.location')?.innerText.trim() || '';
        const price = card.querySelector('.price')?.innerText.trim() || '';
        const desc = card.querySelector('.desc')?.innerText.trim() || '';
        const contact = card.querySelector('.contact-name')?.innerText.trim() || '';

        return { title, link, location, price, desc, contact };
      })
    );

    cards.forEach(card => {
      const key = `${card.title}|${card.link}`;
      if (!collected.has(key)) collected.set(key, card);
    });

    console.log(`✅ Unique: ${collected.size}`);

    if (collected.size === lastCount) retries++;
    else { retries = 0; lastCount = collected.size; }

    await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
    await sleep(2000);
  }

  const listings = Array.from(collected.values());
  console.log(`✅ Final: ${listings.length}`);
  if (!listings.length) throw new Error('None found.');
  return { success: true, content: listings };
};
