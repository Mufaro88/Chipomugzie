"""Skincare Price Scraper - Find cheap skincare products across multiple retailers."""

import re
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)


def scrape_amazon(query: str) -> list[dict]:
    """Scrape Amazon search results for skincare products."""
    products = []
    url = "https://www.amazon.com/s"
    params = {"k": f"{query} skincare", "s": "price-asc-rank"}
    try:
        resp = SESSION.get(url, params=params, timeout=12)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        items = soup.select('[data-component-type="s-search-result"]')
        for item in items[:12]:
            name_el = item.select_one("h2 a span")
            price_whole = item.select_one(".a-price-whole")
            price_frac = item.select_one(".a-price-fraction")
            img_el = item.select_one("img.s-image")
            link_el = item.select_one("h2 a")
            if name_el and price_whole:
                whole = price_whole.get_text(strip=True).replace(",", "").rstrip(".")
                frac = price_frac.get_text(strip=True) if price_frac else "00"
                price = float(f"{whole}.{frac}")
                link = "https://www.amazon.com" + link_el["href"] if link_el else "#"
                products.append({
                    "name": name_el.get_text(strip=True)[:120],
                    "price": price,
                    "currency": "USD",
                    "image": img_el["src"] if img_el else "",
                    "link": link,
                    "source": "Amazon",
                })
    except Exception:
        pass
    return products


def scrape_walmart(query: str) -> list[dict]:
    """Scrape Walmart search results for skincare products."""
    products = []
    url = "https://www.walmart.com/search"
    params = {"q": f"{query} skincare", "sort": "price_low"}
    try:
        resp = SESSION.get(url, params=params, timeout=12)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        # Walmart renders via JS; try to extract from embedded JSON
        scripts = soup.find_all("script", {"type": "application/json"})
        for script in scripts:
            text = script.string or ""
            # Look for product data patterns
            price_matches = re.findall(
                r'"name"\s*:\s*"([^"]{5,120})".*?"price"\s*:\s*([\d.]+)',
                text[:50000],
            )
            for name, price_str in price_matches[:12]:
                try:
                    price = float(price_str)
                    if 0.50 < price < 500:
                        products.append({
                            "name": name,
                            "price": price,
                            "currency": "USD",
                            "image": "",
                            "link": f"https://www.walmart.com/search?q={query}+skincare",
                            "source": "Walmart",
                        })
                except ValueError:
                    continue
            if products:
                break
    except Exception:
        pass
    return products


def scrape_ebay(query: str) -> list[dict]:
    """Scrape eBay search results for skincare products."""
    products = []
    url = "https://www.ebay.com/sch/i.html"
    params = {"_nkw": f"{query} skincare", "_sop": 15}  # sort by price + shipping lowest
    try:
        resp = SESSION.get(url, params=params, timeout=12)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        items = soup.select(".s-item")
        for item in items[:12]:
            name_el = item.select_one(".s-item__title")
            price_el = item.select_one(".s-item__price")
            img_el = item.select_one(".s-item__image-img")
            link_el = item.select_one(".s-item__link")
            if name_el and price_el:
                name = name_el.get_text(strip=True)
                if name.lower() == "shop on ebay":
                    continue
                raw_price = price_el.get_text(strip=True)
                match = re.search(r"[\d,.]+", raw_price)
                if match:
                    try:
                        price = float(match.group().replace(",", ""))
                    except ValueError:
                        continue
                    products.append({
                        "name": name[:120],
                        "price": price,
                        "currency": "USD",
                        "image": img_el.get("src", "") if img_el else "",
                        "link": link_el["href"] if link_el else "#",
                        "source": "eBay",
                    })
    except Exception:
        pass
    return products


SCRAPERS = [scrape_amazon, scrape_walmart, scrape_ebay]


def search_products(query: str, max_price: float | None = None, sort: str = "price") -> list[dict]:
    """Run all scrapers in parallel and return combined, sorted results."""
    all_products: list[dict] = []
    with ThreadPoolExecutor(max_workers=len(SCRAPERS)) as executor:
        futures = {executor.submit(fn, query): fn.__name__ for fn in SCRAPERS}
        for future in as_completed(futures):
            try:
                all_products.extend(future.result())
            except Exception:
                pass

    if max_price is not None:
        all_products = [p for p in all_products if p["price"] <= max_price]

    # Deduplicate by similar names
    seen = set()
    unique = []
    for p in all_products:
        key = re.sub(r"\W+", "", p["name"].lower())[:40]
        if key not in seen:
            seen.add(key)
            unique.append(p)

    if sort == "price":
        unique.sort(key=lambda p: p["price"])
    elif sort == "name":
        unique.sort(key=lambda p: p["name"].lower())

    return unique


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/search")
def api_search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "Please enter a search term."}), 400

    max_price = request.args.get("max_price", type=float)
    sort = request.args.get("sort", "price")

    results = search_products(query, max_price=max_price, sort=sort)
    return jsonify({"results": results, "count": len(results)})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
