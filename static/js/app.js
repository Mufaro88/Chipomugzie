const form = document.getElementById("search-form");
const queryInput = document.getElementById("query");
const maxPriceInput = document.getElementById("max-price");
const sortSelect = document.getElementById("sort");
const searchBtn = document.getElementById("search-btn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = queryInput.value.trim();
    if (!query) return;

    // Show loading
    searchBtn.disabled = true;
    resultsEl.innerHTML = "";
    statusEl.className = "status";
    statusEl.innerHTML = '<span class="spinner"></span> Searching for the best deals...';

    const params = new URLSearchParams({ q: query, sort: sortSelect.value });
    const maxPrice = maxPriceInput.value;
    if (maxPrice) params.set("max_price", maxPrice);

    try {
        const resp = await fetch(`/api/search?${params}`);
        const data = await resp.json();

        if (!resp.ok) {
            statusEl.className = "status error";
            statusEl.textContent = data.error || "Something went wrong.";
            return;
        }

        if (data.count === 0) {
            statusEl.className = "status";
            statusEl.textContent = "No products found. Try a different search term.";
            return;
        }

        statusEl.className = "status";
        statusEl.textContent = `Found ${data.count} product${data.count !== 1 ? "s" : ""}`;

        resultsEl.innerHTML = data.results.map(product => `
            <div class="product-card">
                ${product.image
                    ? `<img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" loading="lazy">`
                    : `<div class="no-img">No image</div>`
                }
                <div class="product-info">
                    <h3>${escapeHtml(product.name)}</h3>
                    <div class="product-meta">
                        <span class="price">$${product.price.toFixed(2)}</span>
                        <span class="source">${escapeHtml(product.source)}</span>
                    </div>
                </div>
                <a class="view-btn" href="${escapeAttr(product.link)}" target="_blank" rel="noopener noreferrer">View Deal</a>
            </div>
        `).join("");
    } catch (err) {
        statusEl.className = "status error";
        statusEl.textContent = "Network error. Please try again.";
    } finally {
        searchBtn.disabled = false;
    }
});

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
