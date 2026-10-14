# THE PLUG: website and customer app prototype

Sierra Leone first, all-in-one marketplace. This is a **prototype with sample data**: no real orders, payments, drivers, sellers or tickets are connected.

## Run it
Open `index.html` in a browser. No install, no build, no external libraries (Google Fonts only, with fallbacks). The phone app is at `#/app`. Demo sign-in code: `123456`.

## Put it on GitHub Pages
1. Create a repo and upload everything in this folder (keep `.nojekyll`).
2. Settings > Pages > Deploy from a branch > `main` / root.
3. The site appears at `https://<you>.github.io/<repo>/`.

## Look and logo
The design follows the founders' layout reference: near-black with neon lime outlines, the round THE PLUG badge ("One App. Every Need."), Poppins headings and DM Sans text. The logo files are in `assets/` (`logo-badge.png`, `logo-wordmark.png`). The build inlines them from `src/asset_badge*.txt` and `src/asset_wordmark2.txt`.

## What's in the prototype
**Services:** Eats, Shop (open marketplace), Market, Events, Stays, Errands, Ride, Travel, Care, Studio, One Delivery.

**New in this version**
- **Shop:** one listing per product, every seller compared on price, stock and distance. Unconfirmed stock must be checked with the seller first, out-of-stock is disabled, and ordering reduces stock.
- **"by" tags and business pages:** simple auto-made page under 5 products, custom page at 5+, service pages (nail/lash techs) straight away, plus a website link.
- **Sell on THE PLUG:** sign-up, blocked impersonating tags, background removal on photo upload, match an existing product or create one, stock +/- and sold out, custom page unlocks at 5.
- **Quote requests:** customers post a job, providers (including our own Studio) quote or decline, the customer accepts. Sellers can quote from their dashboard.
- **Search by photo:** screen only; matching is not connected.
- **Events:** a calendar with no ads, day strip, type filter, THE PLUG picks, organizer posting with review, tickets with a fee (configurable, sample 5% paid by the buyer), refunds when an event is cancelled.
- **Door agent:** shift sign-in, offline ticket list, valid/used/fake/other-event checks, sync when back online, cash sales.
- **Freetown first:** Bo, Makeni and Bonthe are parcel-only. Fresh and hot items are blocked there, with a parcel fee and pickup point.
- **Map:** schematic Freetown map with pin drop and landmarks, and the 2D, 360° and 3D plan.
- **Partners:** a proposed THE PLUG × DA HOOD page (not signed).

**App screens (from the reference):** splash, home dashboard, search, One Delivery basket, live tracking, Errand Runner, stays and travel, profile and wallet.

**Admin demo (Account page):** delivery fees, products needed for a custom page, days before stock counts as unconfirmed, ticket fee and who pays it, cash-on-delivery limit.

## Source
Edit the files in `src/`, then run `python3 build.py` to rebuild into `dist/index.html`.
- `data.js`, `engine.js`, `actions.js`: catalogue, One Delivery planner, checkout rules
- `pages1-3.js`, `shell.js`, `app.js`: website pages and phone app
- `market.js`: marketplace, sellers, business pages, background removal, quote requests
- `events.js`: calendar, tickets, door agent
- `geo.js`: parcel towns, map, partners page
- `theme.js`: v2 look: home page, logo helpers, live tracking card
- `styles.css`: design system

## Honest limits
- All sellers, prices, stock, events and organizers are fictional samples. DA HOOD appears as a proposed partner only.
- Background removal is a simple colour method for plain backgrounds. Production would use an AI model.
- Ticket squares are drawn patterns, not real QR codes. There is no camera scanning.
- Payments are cash on delivery plus a demo gateway. Mobile money and cards are not integrated.
- Not built yet: merchant, courier and admin apps, real maps, SMS codes, 360°/3D capture, photo matching.

`docs/THE-PLUG-Expansion-Plan.pdf` explains the plan behind these features.
