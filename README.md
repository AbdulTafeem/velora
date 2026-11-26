# VELORA India — Storefront & Admin Handover Guide

Architectural home furniture storefront built with plain HTML, CSS, and vanilla JavaScript, powered by a live Google Sheet product catalog, server-verified Google Apps Script order sync, and WhatsApp concierge ordering.

## Architecture Overview
- `index.html` — Flagship storefront, spotlight showcase, room collections, and bestsellers.
- `shop.html` — Full filterable & sortable catalog.
- `product.html` — Dynamic product detail view (`product.html?id=<SKU>`).
- `policies.html` — DPDP Act 2023 & Consumer Protection (E-Commerce) Rules, 2020 compliance pages (Privacy, Terms, Returns, Shipping, Contact & Grievance Officer).
- `js/products.js` — Live Google Sheet CSV loader with loading & retry states.
- `js/store.js` — Single source of truth for cart state, promo codes (`VELORA10`), totals calculation, INR formatting, HTML escaping, and product card rendering.
- `js/cart.js` — Cart drawer, quick-view modal, wishlist, and WhatsApp order formatting.
- `js/checkout-billing.js` — Checkout form, server-verified Apps Script order submission, WhatsApp failure fallback, and printable A4 Order Confirmation.

---

## How to Manage Products in the Google Sheet (`Sheet1`)
1. Open the connected Google Sheet (`Sheet1`).
2. Keep Row 1 column headers clean:
   - `id` — Permanent unique SKU (e.g., `vel-01`, `vel-02`). **Never reuse or change an existing `id` when sorting rows.**
   - `name` — Product title shown across the store and on invoices.
   - `category` — Use exact slugs: `clothes-rack`, `storage-rack`, `shoe-rack`, `wall-shelf`, `stool`, or `decor`.
   - `room` — e.g., `Bedroom`, `Entryway`, `Living Room`, `Dressing Area`.
   - `price` — Selling price in INR (numbers only, e.g., `3299`).
   - `mrp` — Original MRP in INR (optional; must be higher than `price` to show `% OFF`).
   - `stock` — Available units (`0` automatically displays **Sold Out**).
   - `status` — `active` to show on site, or `hide` / `draft` to unpublish.
   - `finishes` — Separate options with `|` (e.g., `Mirror Chrome | Brushed Silver | Matte Black`).
   - `image` & `hoverimage` — Direct image URLs or Google Drive share links.
   - `dimensions`, `material`, `delivery`, `description` — Product specifications.
3. Reload the website (`Ctrl + Shift + R`) to verify changes immediately.

---

## Pre-Launch Checklist for Business Owner
- [ ] Confirm `id` column is populated for all rows in `Sheet1`.
- [ ] Verify updated `Code.gs` is deployed in **Extensions → Apps Script → Deploy → Manage deployments → New version**.
- [ ] Fill all `[TO CONFIRM]` placeholders in `policies.html` (Registered Legal Name, GSTIN, Registered Address, Grievance Officer Name, Warranty/Return terms, and official domain email).
- [ ] Update domain URLs in `robots.txt` and `sitemap.xml` once custom domain HTTPS is live.
