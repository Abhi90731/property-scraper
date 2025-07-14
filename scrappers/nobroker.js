module.exports = async function nobrokerScraper(page) {
  console.log('⏳ Using NoBroker scraper with links & contact...');

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const collected = new Map();
  let retries = 0, lastCount = 0;

  while (retries < 5) {
    const cards = await page.$$eval('article', cards =>
      cards.map(card => {
        const titleEl = card.querySelector('h2.heading-6 a');
        const link = titleEl?.href?.trim() || '';
        const title = titleEl?.innerText.trim() || '';
        const locationEl = card.querySelector('.max-w-70');
        const priceEl = card.querySelector('#minimumRent') || card.querySelector('.heading-6');
        const descEl = card.querySelector('.tupleNew__descText');
        const contactEl = card.querySelector('[itemprop="name"]');

        return {
          title,
          link,
          location: locationEl?.innerText.trim() || '',
          price: priceEl?.innerText.trim() || '',
          desc: descEl?.innerText.trim() || '',
          contact: contactEl?.innerText.trim() || '',
        };
      })
    );

    cards.forEach(card => {
      const key = `${card.title}|${card.link}`;
      if (!collected.has(key)) collected.set(key, card);
    });

    console.log(`✅ Unique so far: ${collected.size}`);

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
