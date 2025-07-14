module.exports = async function ninetynineAcresScraper(page) {
  console.log('⏳ Using 99acres scraper with robust progressive scroll...');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const collected = new Map();

  let retries = 0;
  let lastCount = 0;

  while (retries < 5) {
    const cards = await page.$$eval('.tupleNew__outerTupleWrap', cards =>
      cards.map(card => ({
        title: card.querySelector('.tupleNew__propType')?.innerText.trim() || '',
        location: card.querySelector('.tupleNew__locationName')?.innerText.trim() || '',
        price: card.querySelector('.tupleNew__priceValWrap span')?.innerText.trim() || '',
        desc: card.querySelector('.tupleNew__descText')?.innerText.trim() || ''
      }))
    );

    console.log(`🔍 Cards visible now: ${cards.length}`);

    cards.forEach(card => {
      const uniqueKey = `${card.title}|${card.location}|${card.price}`;
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

    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight / 2);
    });

    await sleep(2000);
  }

  const listings = Array.from(collected.values());
  console.log(`✅ Final unique listings collected: ${listings.length}`);

  if (listings.length === 0) throw new Error('No listings found.');
  return { success: true, content: listings };
};
