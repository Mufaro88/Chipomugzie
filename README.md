# SkinSaver - Skincare Price Scraper

A web app that scrapes multiple online retailers (Amazon, Walmart, eBay) to find the cheapest skincare products.

## Features

- Real-time price scraping from Amazon, eBay, and Walmart
- Filter by maximum price
- Sort by price or name
- Responsive design for mobile and desktop
- Parallel scraping for fast results

## Setup

```bash
pip install -r requirements.txt
python app.py
```

Then open http://localhost:5000 in your browser.

## How It Works

1. Enter a skincare product (e.g. "moisturizer", "vitamin C serum")
2. Optionally set a max price and sort preference
3. The app scrapes Amazon, eBay, and Walmart in parallel
4. Results are deduplicated, sorted, and displayed as cards with links to the original listings
