module.exports = async function housingScraper(page) {
  console.log('⏳ Using Housing.com scraper with property links & contact...');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const collected = new Map();
  let retries = 0, lastCount = 0;

  while (retries < 5) {
    const cards = await page.$$eval('article', cards =>
      cards.map(card => {
        const titleEl = card.querySelector('h2.title-style');
        const linkEl = titleEl?.closest('a');
        const sellerEl = card.querySelector('.sellerName-label');

        return {
          title: titleEl?.innerText.trim() || '',
          link: linkEl?.href?.trim() || '',
          society: card.querySelector('.subtitle-style')?.innerText.trim() || '',
          price: card.querySelector('.T_singlePriceStyle')?.innerText.trim() || '',
          area: Array.from(card.querySelectorAll('.T_primaryInfoTextStyle'))
            .map(el => el.innerText.trim())
            .join(', '),
          contact: sellerEl?.innerText.trim() || '',
        };
      })
    );

    cards.forEach(card => {
      const key = `${card.title}|${card.link}|${card.price}`;
      if (!collected.has(key)) {
        collected.set(key, card);
      }
    });

    console.log(`✅ Unique collected so far: ${collected.size}`);

    if (collected.size === lastCount) {
      retries++;
    } else {
      retries = 0;
      lastCount = collected.size;
    }

    await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
    await sleep(2000);
  }

  const listings = Array.from(collected.values());
  console.log(`✅ Final unique listings collected: ${listings.length}`);

  if (!listings.length) throw new Error('No listings found.');
  return { success: true, content: listings };
};
