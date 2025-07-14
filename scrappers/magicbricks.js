module.exports = async function magicbricksScraper(page) {
  console.log('⏳ Using MagicBricks scraper with true progressive scroll...');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const collected = new Map(); // unique by title + society + price

  let retries = 0;
  let lastCount = 0;

  while (retries < 5) {
    const cards = await page.$$eval('.mb-srp__card', cards =>
      cards.map(card => ({
        title: card.querySelector('.mb-srp__card--title')?.innerText.trim() || '',
        society: card.querySelector('.mb-srp__card__society--name')?.innerText.trim() || '',
        price: card.querySelector('.mb-srp__card__price--amount')?.innerText.trim() || '',
        desc: card.querySelector('.mb-srp__card--desc--text')?.innerText.trim() || ''
      }))
    );

    console.log(`🔍 Cards visible now: ${cards.length}`);

    cards.forEach(card => {
      const uniqueKey = `${card.title}|${card.society}|${card.price}`;
      if (!collected.has(uniqueKey)) {
        collected.set(uniqueKey, card);
      }
    });

    console.log(`✅ Unique collected so far: ${collected.size}`);

    if (collected.size === lastCount) {
      retries++;
    } else {
      retries = 0;
      lastCount = collected.size;
    }

    // Scroll by small chunks instead of jumping to bottom!
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight / 2);
    });

    await sleep(2000); // let new cards load
  }

  const properties = Array.from(collected.values());
  console.log(`✅ Final unique properties collected: ${properties.length}`);

  if (properties.length === 0) throw new Error('No properties found.');
  return { success: true, content: JSON.stringify(properties, null, 2) };
};
