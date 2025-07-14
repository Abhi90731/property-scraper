module.exports = async function squareyardsScraper(page) {
  console.log('⏳ Using SquareYards scraper with progressive scroll...');
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const collected = new Map();
  let retries = 0, lastCount = 0;

  while (retries < 5) {
    const cards = await page.$$eval('.srpCard', cards =>
      cards.map(card => ({
        title: card.querySelector('.srpCard__propertyTitle')?.innerText.trim() || '',
        location: card.querySelector('.srpCard__address')?.innerText.trim() || '',
        price: card.querySelector('.srpCard__price')?.innerText.trim() || '',
        desc: card.querySelector('.srpCard__desc')?.innerText.trim() || ''
      }))
    );

    cards.forEach(card => {
      const key = `${card.title}|${card.location}|${card.price}`;
      if (!collected.has(key)) collected.set(key, card);
    });

    if (collected.size === lastCount) retries++; else { retries = 0; lastCount = collected.size; }
    await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
    await sleep(2000);
  }

  const listings = Array.from(collected.values());
  if (!listings.length) throw new Error('No listings found.');
  return { success: true, content: listings };
};
