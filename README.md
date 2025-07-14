# 🏠 India Property Scraper

This is a **Node.js + Puppeteer** based web scraper to extract listings from popular Indian real estate websites.

---

## 📌 Supported Sites

- ✅ [MagicBricks](https://www.magicbricks.com)
- ✅ [99acres](https://www.99acres.com)
- ✅ [Housing.com](https://housing.com)
- ✅ [NoBroker](https://www.nobroker.in)
- ✅ [CommonFloor](https://www.commonfloor.com)
- ✅ [SquareYards](https://www.squareyards.com)

---

## 🚀 Features

- Uses **real Chrome** (non-headless) with stealth mode.
- Handles **infinite scroll** and dynamic content.
- Tries **multiple selectors** and fallback logic.
- Extracts:
  - Property title
  - Link to listing
  - Society or locality
  - Price
  - Description
  - Owner/agent name or contact (if available)

- Saves results to `output.json`

---

## ⚙️ Requirements

- Node.js >= 16.x
- Chrome installed (uses Puppeteer with your local Chrome)

---

## 📦 Setup

```bash
git clone https://github.com/YOUR_USERNAME/property-scraper.git
cd property-scraper
npm install
