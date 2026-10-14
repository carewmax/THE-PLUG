/* THE PLUG open marketplace: one product many sellers, "by" tags, business pages,
   seller sign-up with background removal, photo search (not connected), quote requests.
   All sellers, prices and stock here are SAMPLE content. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, h = PLUG.h, ico = PLUG.ico, fmt = PLUG.fmt, M = () => PLUG.MERCH;
  const { div, span, p, button, h2, h3, h4, strong, input, img, label, ul, li, select, option, textarea } = PLUG;
  const pages = PLUG.pages;
  const gap = (n) => h('div', { style: 'height:' + (n || 14) + 'px' });

  /* ---------- config and data ---------- */
  PLUG.CONFIG.market = { staleDays: 3, storefrontMin: 5, commissionPct: 'Not set yet' };
  PLUG.STEPS.service = ['Request sent', 'Provider confirmed the time', 'Completed'];
  PLUG.SELLER_COLORS = ['#B6FB05', '#F5B83D', '#7CC6FF', '#FF9F8A', '#C9A7FF', '#7FE0C2'];
  const CAT = PLUG.CATALOG = {};
  const cat = (id, name, c, lasts, tone, icon) => { CAT[id] = { id, name, cat: c, lasts, tone: tone || 'market', icon: icon || 'cart' }; };
  cat('maggi', 'Maggi cubes, 100 pack', 'Food cupboard', true); cat('rice25', 'Rice, 25 kg bag', 'Food cupboard', true); cat('oil5', 'Vegetable oil, 5 L', 'Food cupboard', true); cat('spag', 'Spaghetti, 500 g', 'Food cupboard', true);
  cat('tomato', 'Fresh tomatoes, 1 heap', 'Fresh', false, 'market', 'leaf'); cat('pepper', 'Hot pepper, 1 heap', 'Fresh', false, 'market', 'leaf'); cat('banana', 'Bananas, 1 bunch', 'Fresh', false, 'market', 'leaf'); cat('orange', 'Oranges, 10', 'Fresh', false, 'market', 'leaf');
  cat('soap', 'Bar soap, pack of 3', 'Household', true, 'care', 'box'); cat('charger', 'Phone charger, USB-C', 'Phones and gadgets', true, 'studio', 'bolt'); cat('powerbank', 'Power bank, 10,000 mAh', 'Phones and gadgets', true, 'studio', 'bolt'); cat('shea', 'Shea butter, 250 g', 'Beauty', true, 'care', 'heart');
  cat('dh-tee', 'DA HOOD T-shirt', 'Clothing', true, 'one', 'tag'); cat('dh-hoodie', 'DA HOOD hoodie', 'Clothing', true, 'one', 'tag'); cat('dh-cap', 'DA HOOD cap', 'Clothing', true, 'one', 'tag'); cat('dh-tote', 'DA HOOD tote bag', 'Clothing', true, 'one', 'tag'); cat('dh-socks', 'DA HOOD socks, 2 pairs', 'Clothing', true, 'one', 'tag');

  const seller = (o) => { M()[o.id] = Object.assign({ kind: 'seller', cuisines: [], prep: 15, state: 'open', updated: 'today', tone: 'market', layout: 'grid', services: [], quoteCats: [], website: '', logo: '' }, o); };
  seller({ id: 'jsk', name: 'JSK Provisions', tag: 'JSK', type: 'business', verified: true, x: 2.7, y: 3.3, zone: 'Wilkinson Road', color: '#F5B83D', blurb: 'Food cupboard and household', about: 'Family provisions shop selling food cupboard basics and household goods at shop prices (sample).', hours: '08:00–21:00', website: 'https://example.com' });
  seller({ id: 'owen', name: "Owen's Corner", tag: 'Owen', type: 'person', verified: false, x: 1.3, y: 3.2, zone: 'Lumley', color: '#7CC6FF', blurb: 'Small table shop', about: '', hours: '10:00–19:00' });
  seller({ id: 'fatu', name: 'Mama Fatu Fresh', tag: 'Mama Fatu', type: 'person', verified: false, x: 2.0, y: 2.7, zone: 'Aberdeen', color: '#7FE0C2', blurb: 'Fresh produce', about: '', hours: '07:00–18:00' });
  seller({ id: 'kd', name: 'KD Mini Mart', tag: 'KD Mart', type: 'business', verified: true, x: 3.4, y: 3.8, zone: 'Wilkinson Road', color: '#FF9F8A', blurb: 'Mini mart, phones and household', about: 'Neighbourhood mini mart with food, household items and phone accessories (sample).', hours: '07:30–22:00', layout: 'list' });
  seller({ id: 'tech', name: 'Tech Hub Lumley', tag: 'Tech Hub', type: 'business', verified: true, x: 1.1, y: 3.6, zone: 'Lumley', color: '#C9A7FF', blurb: 'Phone accessories', about: '', hours: '09:00–20:00' });
  seller({ id: 'dahood', name: 'DA HOOD Clothing', tag: 'DA HOOD', type: 'brand', verified: true, x: 2.4, y: 3.4, zone: 'Wilkinson Road', color: '#B6FB05', blurb: 'Streetwear from Freetown', about: 'DA HOOD streetwear. Shown here as a proposed partner store with sample products and prices. Not a live store yet.', hours: 'Online orders', tone: 'one' });
  seller({ id: 'glow', name: 'Glow Lash Studio', tag: 'Glow Lashes', type: 'service', verified: false, x: 1.6, y: 3.3, zone: 'Lumley', color: '#C9A7FF', blurb: 'Lash extensions', about: 'Lash sets and refills in a clean home studio (sample provider).', hours: 'By appointment', services: [{ n: 'Classic lash set', p: 250, min: 90 }, { n: 'Volume lash set', p: 400, min: 120 }, { n: 'Lash refill', p: 150, min: 60 }] });
  seller({ id: 'kadi', name: 'Nails by Kadi', tag: 'Kadi Nails', type: 'service', verified: false, x: 2.9, y: 3.0, zone: 'Wilkinson Road', color: '#FF9F8A', blurb: 'Nail tech', about: 'Gel, acrylics and nail art. Home visits on request (sample provider).', hours: 'Mon–Sat, by appointment', services: [{ n: 'Gel polish', p: 120, min: 45 }, { n: 'Acrylic full set', p: 300, min: 120 }, { n: 'Nail art, add-on', p: 50, min: 20 }] });
  seller({ id: 'qprint', name: 'QuickPrint Centre', tag: 'QuickPrint', type: 'business', verified: true, x: 3.1, y: 3.4, zone: 'Wilkinson Road', color: '#7CC6FF', blurb: 'Printing and copies', about: 'Copies, flyers, cards and banners (sample provider).', hours: '08:00–18:00', quoteCats: ['print'] });
  seller({ id: 'clab', name: 'Colour Lab', tag: 'Colour Lab', type: 'business', verified: true, x: 1.8, y: 3.6, zone: 'Lumley', color: '#F5B83D', blurb: 'Print and photo studio', about: 'Large-format print and studio photography (sample provider).', hours: '09:00–18:00', quoteCats: ['print', 'photo'] });
  seller({ id: 'pixel', name: 'Pixel Works', tag: 'Pixel Works', type: 'business', verified: false, x: 2.2, y: 2.4, zone: 'Aberdeen', color: '#7FE0C2', blurb: 'Websites and apps', about: 'Small web and app team (sample provider).', hours: 'Mon–Fri', quoteCats: ['build'] });

  // [product, seller, price, stock, days since stock was confirmed]
  const OFFERS = [['maggi', 'jsk', 32, 40, 0], ['maggi', 'owen', 30, 6, 1], ['maggi', 'kd', 33, 25, 0], ['maggi', 'fatu', 29, 3, 5],
    ['rice25', 'jsk', 640, 12, 0], ['rice25', 'kd', 655, 4, 0], ['oil5', 'jsk', 210, 9, 1], ['oil5', 'kd', 205, 0, 0], ['spag', 'jsk', 14, 60, 0], ['spag', 'owen', 13, 2, 4],
    ['tomato', 'fatu', 15, 20, 0], ['pepper', 'fatu', 10, 15, 0], ['banana', 'fatu', 20, 8, 0], ['orange', 'fatu', 25, 10, 1], ['tomato', 'kd', 18, 6, 0],
    ['soap', 'jsk', 24, 30, 0], ['soap', 'kd', 22, 14, 0], ['charger', 'tech', 85, 10, 0], ['charger', 'kd', 90, 3, 2], ['powerbank', 'tech', 260, 5, 0], ['shea', 'kd', 45, 8, 0],
    ['dh-tee', 'dahood', 180, 25, 0], ['dh-hoodie', 'dahood', 420, 10, 0], ['dh-cap', 'dahood', 120, 15, 0], ['dh-tote', 'dahood', 90, 20, 0], ['dh-socks', 'dahood', 60, 30, 0]];
  const addOffer = (pid, sid, price, stock, days, img) => { const c = CAT[pid]; const it = { id: 'o-' + sid + '-' + pid, pid, merchantId: sid, name: c.name, price, stock, upd: days || 0, kind: 'item', hot: false, perishable: !c.lasts, cat: c.cat, img: img || '' }; PLUG.ITEMS[it.id] = it; return it; };
  OFFERS.forEach(o => addOffer(o[0], o[1], o[2], o[3], o[4]));
  PLUG.addOffer = addOffer;

  /* ---------- helpers ---------- */
  PLUG.offersFor = (pid) => Object.values(PLUG.ITEMS).filter(i => i.pid === pid);
  PLUG.sellerItems = (sid) => Object.values(PLUG.ITEMS).filter(i => i.merchantId === sid && i.pid);
  PLUG.sellers = () => Object.values(M()).filter(m => m.kind === 'seller');
  PLUG.isStale = (it) => it.upd >= PLUG.CONFIG.market.staleDays && !S.confirmed[it.id];
  PLUG.hasCustomPage = (s) => s.type === 'service' || PLUG.sellerItems(s.id).length >= PLUG.CONFIG.market.storefrontMin;
  PLUG.kmTo = (m) => PLUG.dist(PLUG.destination(), m);
  const initials = (n) => n.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  PLUG.avatar = (s, size) => { size = size || 44; return s.logo ? img({ src: s.logo, alt: '', class: 'avatar', style: 'width:' + size + 'px;height:' + size + 'px' }) : div({ class: 'avatar', 'aria-hidden': 'true', style: 'width:' + size + 'px;height:' + size + 'px;background:' + (s._force || PLUG.hasCustomPage(s) ? s.color : '#DDE3D9') + ';font-size:' + Math.round(size * 0.36) + 'px' }, initials(s.name)); };
  PLUG.byTag = (s) => PLUG.lnk('/store/' + s.id, 'bytag', 'by ' + s.tag, s.verified ? span({ class: 'sr' }, ', verified') : null, s.verified ? ico('check', 13) : null);
  const typeLabel = { business: 'Business', person: 'Individual seller', brand: 'Brand', service: 'Service provider' };
  const stockPill = (it) => it.stock <= 0 ? PLUG.pill('Out of stock', 'bad') : PLUG.isStale(it) ? PLUG.pill('Stock unconfirmed, ' + it.upd + ' days', 'warn') : it.stock <= 5 ? PLUG.pill('Only ' + it.stock + ' left', 'warn') : PLUG.pill(it.stock + ' in stock');
  PLUG.offerButton = (it) => {
    if (it.stock <= 0) return button({ class: 'btn sm sec2', disabled: true }, 'Out of stock');
    if (PLUG.isStale(it)) return button({ class: 'btn sm sec2', 'aria-label': 'Ask ' + M()[it.merchantId].name + ' to confirm stock', onclick: () => { S.confirmed[it.id] = true; PLUG.set(); PLUG.toast('Seller confirmed stock (demo reply)'); } }, 'Ask seller first');
    return button({ class: 'btn sm pri', 'aria-label': 'Add ' + it.name + ' from ' + M()[it.merchantId].name, onclick: () => PLUG.addLine(it, 1) }, ico('plus', 15), 'Add');
  };
  const lastBadge = (c) => c.lasts ? PLUG.pill('Can ship outside Freetown', 'mute', 'send') : PLUG.pill('Freetown only', 'warn', 'leaf');
  const productSummary = (pid) => { const os = PLUG.offersFor(pid), live = os.filter(o => o.stock > 0); return { n: os.length, from: live.length ? Math.min(...live.map(o => o.price)) : null }; };
  const itemPhoto = (it, c, cls) => it && it.img ? div({ class: 'photo pimg ' + (cls || '') }, img({ src: it.img, alt: it.name })) : PLUG.Photo(c.tone, c.icon, cls);

  // keep the search index honest: one entry per product, sellers as business pages
  const baseIndex = PLUG.searchIndex;
  PLUG.searchIndex = () => {
    const out = baseIndex().filter(r => !(r.kind === 'merchant' && M()[r.id] && M()[r.id].kind === 'seller') && !(r.kind === 'item' && r.item && M()[r.item.merchantId].kind === 'seller'));
    Object.values(CAT).forEach(c => { const s = productSummary(c.id); if (s.n) out.push({ cat: 'Shop', title: c.name, sub: s.n + ' seller' + (s.n > 1 ? 's' : '') + (s.from != null ? ' · from ' + fmt(s.from) : ''), route: '/p/' + c.id, kind: 'product', id: c.id }); });
    PLUG.sellers().forEach(s => out.push({ cat: 'Shop', title: s.name, sub: 'by ' + s.tag + ' · ' + typeLabel[s.type] + ' · ' + s.zone, route: '/store/' + s.id, kind: 'seller', id: s.id }));
    PLUG.sellers().filter(s => s.services.length).forEach(s => s.services.forEach(v => out.push({ cat: 'Shop', title: v.n, sub: s.name + ' · ' + fmt(v.p), route: '/store/' + s.id, kind: 'service', id: s.id })));
    return out;
  };

  // orders hold stock so two people can't buy the last one
  const baseCheckout = PLUG.checkout;
  PLUG.checkout = function () { const lines = S.basket.lines.map(l => Object.assign({}, l)); const e = baseCheckout(); if (e) lines.forEach(l => { const it = PLUG.ITEMS[l.itemId]; if (it && it.stock != null) it.stock = Math.max(0, it.stock - l.qty); }); return e; };

  // reset hook: remove anything the demo user created
  const baseInit = PLUG.init;
  PLUG.init = function () {
    baseInit();
    Object.keys(PLUG.ITEMS).forEach(k => { if (PLUG.ITEMS[k].merchantId === 'me') delete PLUG.ITEMS[k]; });
    Object.keys(CAT).forEach(k => { if (CAT[k].mine) delete CAT[k]; });
    delete M().me;
    Object.assign(S, { myShop: null, requests: [], photoSearch: null });
  };

  /* ---------- Shop: the open marketplace ---------- */
  pages.shop = () => {
    const f = PLUG.form('shop', { q: '', cat: 'All' });
    const cats = ['All'].concat(Array.from(new Set(Object.values(CAT).map(c => c.cat))));
    const prods = Object.values(CAT).filter(c => productSummary(c.id).n && (f.cat === 'All' || c.cat === f.cat) && (!f.q || c.name.toLowerCase().includes(f.q.toLowerCase())));
    const sellers = PLUG.sellers().filter(s => s.type !== 'service' && !s.quoteCats.length);
    const services = PLUG.sellers().filter(s => s.type === 'service');
    return div(
      div({ class: 'row', style: 'flex-wrap:nowrap;gap:10px;margin-bottom:14px' },
        div({ class: 'searchbar grow' }, div({ class: 'in' }, ico('search', 18), PLUG.in('shop', f, 'q', { bare: true, ph: 'Search any product, e.g. Maggi' }))),
        button({ class: 'btn ghost', onclick: () => { S.photoSearch = S.photoSearch ? null : { src: '', pick: '' }; PLUG.set(); }, 'aria-expanded': String(!!S.photoSearch) }, ico('camera', 18), span({ class: 'hide-xs' }, 'Search by photo'))),
      S.photoSearch ? photoSearch() : null,
      PLUG.chipRow(cats, f.cat, (c) => { f.cat = c; PLUG.set(); }), gap(16),
      PLUG.sechead(null, 'Products', 'One listing per product. Tap one to compare every seller on price, stock and distance. Sample sellers and prices.'),
      prods.length ? div({ class: 'listing' }, prods.map(c => { const s = productSummary(c.id), firstImg = PLUG.offersFor(c.id).find(o => o.img);
        return PLUG.lnk('/p/' + c.id, 'lcard', itemPhoto(firstImg, c), div({ class: 'body' }, span({ class: 'nm' }, c.name), span({ class: 'small muted' }, s.n + ' seller' + (s.n > 1 ? 's' : '') + (s.from != null ? ' · from ' + fmt(s.from) : ' · all out of stock')), div({ class: 'row', style: 'gap:6px' }, lastBadge(c)))); }))
        : PLUG.empty('No products match', 'Try another word or category, or ask sellers with a quote request.', PLUG.lnk('/requests', 'btn pri', 'Request quotes')),
      gap(28), PLUG.sechead(null, 'Sellers', 'Every seller has a “by” tag. Tap it to open their page.'),
      div({ class: 'grid g3' }, sellers.map(sellerCard)),
      gap(28), PLUG.sechead(null, 'Services', 'Nail techs, lash techs and other services get their own page straight away.'),
      div({ class: 'grid g3' }, services.map(sellerCard)),
      gap(28), div({ class: 'banner' }, div({ style: 'max-width:520px' }, h3('Sell on THE PLUG'), p({ class: 'muted', style: 'margin:0' }, 'Take a photo, set a price and stock, and you are live with your own “by” tag. Five products unlock your own custom page.')), div({ class: 'row' }, PLUG.lnk('/sell', 'btn pri', 'Start selling'), PLUG.lnk('/requests', 'btn ghost', 'Request quotes'))));
  };
  function sellerCard(s) {
    const n = PLUG.sellerItems(s.id).length;
    return PLUG.lnk('/store/' + s.id, 'card sellercard', div({ class: 'row', style: 'flex-wrap:nowrap' }, PLUG.avatar(s, 46), div({ class: 'grow' }, strong(s.name), div({ class: 'small muted' }, 'by ' + s.tag + ' · ' + s.zone))),
      div({ class: 'row', style: 'gap:6px;margin-top:10px' }, PLUG.pill(typeLabel[s.type], 'mute'), s.verified ? PLUG.pill('Verified', '', 'check') : PLUG.pill('Not verified yet', 'mute'), s.type === 'service' ? PLUG.pill(s.services.length + ' services', 'mute') : PLUG.pill(n + ' product' + (n === 1 ? '' : 's'), 'mute')));
  }
  function photoSearch() {
    const ps = S.photoSearch;
    return div({ class: 'card', style: 'margin-bottom:16px' }, h3('Search by photo'),
      PLUG.notice('Photo matching is not connected in this prototype. In the live app your photo is compared with listings. Here you can see the screen and pick what it looks like.', 'warn', 'info'),
      div({ class: 'row', style: 'align-items:flex-start' },
        ps.src ? img({ src: ps.src, alt: 'Your photo', style: 'width:120px;height:120px;object-fit:cover;border-radius:12px' }) : null,
        div({ class: 'grow' }, PLUG.fld('Your photo', input({ type: 'file', accept: 'image/*', id: PLUG.id('ps-file'), onchange: (e) => { const fl = e.target.files[0]; if (!fl) return; const r = new FileReader(); r.onload = () => { ps.src = r.result; PLUG.set(); }; r.readAsDataURL(fl); } })),
          ps.src ? [p({ class: 'small', style: 'font-weight:700' }, 'What does it look like?'), div({ class: 'chips' }, Object.values(CAT).filter(c => productSummary(c.id).n).slice(0, 10).map(c => PLUG.lnk('/p/' + c.id, 'chip', c.name)))] : null)));
  }

  /* ---------- Product page: compare sellers ---------- */
  pages.product = (pid) => {
    const c = CAT[pid]; if (!c) return PLUG.empty('Product not found', '', PLUG.lnk('/shop', 'btn pri', 'Back to Shop'));
    const f = PLUG.form('prod', { sort: 'Cheapest' });
    const os = PLUG.offersFor(pid).map(o => ({ o, s: M()[o.merchantId], km: PLUG.kmTo(M()[o.merchantId]) }));
    const rank = { Cheapest: (a, b) => a.o.price - b.o.price, Closest: (a, b) => a.km - b.km, 'Most stock': (a, b) => b.o.stock - a.o.stock }[f.sort];
    os.sort((a, b) => ((a.o.stock <= 0) - (b.o.stock <= 0)) || rank(a, b));
    const live = os.filter(x => x.o.stock > 0), cheapest = live.length ? Math.min(...live.map(x => x.o.price)) : null, closest = live.length ? Math.min(...live.map(x => x.km)) : null;
    const dz = PLUG.destination();
    return div({ class: 'two' },
      div(div({ class: 'row', style: 'align-items:flex-start;flex-wrap:nowrap;gap:16px;margin-bottom:16px' }, div({ style: 'width:150px;flex:none' }, itemPhoto(os.find(x => x.o.img) && os.find(x => x.o.img).o, c, 'sq')),
          div(h2({ style: 'font-size:26px;margin-bottom:6px' }, c.name), p({ class: 'muted', style: 'margin-bottom:8px' }, c.cat + ' · ' + os.length + ' seller' + (os.length > 1 ? 's' : '')), lastBadge(c))),
        dz.intercity && !c.lasts ? PLUG.notice('This spoils on a long trip, so it can only be delivered inside Freetown. Your address is set to ' + dz.name + '.', 'warn', 'leaf') : null,
        div({ class: 'row between', style: 'margin-bottom:10px' }, h3('Compare sellers'), PLUG.chipRow(['Cheapest', 'Closest', 'Most stock'], f.sort, (x) => { f.sort = x; PLUG.set(); })),
        div({ class: 'card', style: 'padding:4px 18px' }, os.map(x => div({ class: 'item offer' + (x.o.stock <= 0 ? ' dim' : '') },
          PLUG.avatar(x.s, 40),
          div({ class: 'grow' }, div({ class: 'row', style: 'gap:8px' }, strong(x.s.name), PLUG.byTag(x.s)),
            div({ class: 'row', style: 'gap:6px;margin-top:4px' }, stockPill(x.o), PLUG.pill(x.km.toFixed(1) + ' km away', 'mute'), x.o.stock > 0 && x.o.price === cheapest ? PLUG.pill('Cheapest', '') : null, x.o.stock > 0 && x.km === closest ? PLUG.pill('Closest', '') : null)),
          div({ class: 'price' }, fmt(x.o.price)), PLUG.offerButton(x.o)))),
        p({ class: 'small muted', style: 'margin-top:10px' }, 'Stock is what each seller reports. If a seller hasn’t confirmed stock in ' + PLUG.CONFIG.market.staleDays + ' days, you ask them first. Distances are from your delivery pin, as the crow flies with a road factor.')),
      div({ class: 'sticky' }, PLUG.miniBasket(), gap(12), div({ class: 'card' }, h4('Mixing sellers is fine'), p({ class: 'small muted', style: 'margin:0' }, 'Add from as many sellers as you like. One Delivery combines them into one trip when that is cheaper, and tells you when it isn’t.'))));
  };

  /* ---------- Business page ---------- */
  pages.store = (sid) => {
    const s = M()[sid]; if (!s || s.kind !== 'seller') return div({ class: 'wrap sec' }, PLUG.empty('Page not found', 'This seller may have left.', PLUG.lnk('/shop', 'btn pri', 'Back to Shop')));
    const items = PLUG.sellerItems(sid), custom = PLUG.hasCustomPage(s), min = PLUG.CONFIG.market.storefrontMin;
    const f = PLUG.form('book-' + sid, { svc: '0', date: '', time: '', err: '' });
    const grid = (list) => div({ class: s.layout === 'list' && custom ? 'storelist' : 'listing' }, list.map(it => div({ class: 'lcard' + (it.stock <= 0 ? ' off' : '') }, PLUG.lnk('/p/' + it.pid, '', itemPhoto(it, CAT[it.pid])), div({ class: 'body' }, PLUG.lnk('/p/' + it.pid, 'nm', it.name), div({ class: 'row', style: 'gap:6px' }, stockPill(it)), div({ class: 'row between', style: 'margin-top:auto' }, span({ class: 'price' }, fmt(it.price)), PLUG.offerButton(it))))));
    const book = () => {
      if (!f.date || !f.time) { f.err = 'Choose a date and time.'; PLUG.set(); return; }
      const v = s.services[+f.svc]; f.err = '';
      PLUG.addBooking({ type: 'service', title: v.n + ' with ' + s.name, sub: PLUG.prettyDate(f.date) + ' ' + f.time + ' · about ' + v.min + ' min · provider confirms', price: v.p, meta: { seller: sid } }); PLUG.nav('/basket');
    };
    const head = div({ class: 'storehead' + (custom ? '' : ' simple'), style: custom ? '--sc:' + s.color : '' }, div({ class: 'wrap' },
      PLUG.ctx === 'w' ? PLUG.lnk('/shop', 'link small', ico('chevL', 14), ' Shop') : null,
      div({ class: 'row', style: 'flex-wrap:nowrap;gap:16px;margin-top:12px' }, PLUG.avatar(s, custom ? 76 : 60),
        div({ class: 'grow' }, h1el(s.name), div({ class: 'row', style: 'gap:6px;margin-top:6px' }, span({ class: 'pill' }, 'by ' + s.tag), s.verified ? PLUG.pill('Verified', '', 'check') : PLUG.pill('Not verified yet', 'mute'), PLUG.pill(typeLabel[s.type], 'mute')))),
      p({ class: 'storeblurb' }, (custom && s.about ? s.about : s.blurb) + ' · ' + s.zone + ' · ' + s.hours),
      s.website ? h('a', { class: 'btn ghost sm', href: s.website, target: '_blank', rel: 'noopener noreferrer' }, ico('globe', 16), 'Visit their website') : null));
    return div({ class: 'store' },
      head,
      div({ class: 'paper sec' }, div({ class: 'wrap' },
        !custom ? PLUG.notice(['Simple page, made automatically. ', s.id === 'me' ? 'Add ' + (min - items.length) + ' more product' + (min - items.length === 1 ? '' : 's') + ' to unlock your own custom page.' : 'Sellers unlock a custom page at ' + min + ' products.'], '', 'info') : null,
        s.type === 'service' ? div({ class: 'two' }, div(h3({ style: 'margin-bottom:10px' }, 'Services'), div({ class: 'card', style: 'padding:4px 18px' }, s.services.length ? s.services.map(v => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'nm' }, v.n), div({ class: 'small muted' }, 'About ' + v.min + ' minutes')), div({ class: 'price' }, fmt(v.p)))) : p({ class: 'muted small', style: 'padding:12px 0' }, 'No services listed yet.')),
          gap(16), div({ class: 'grid g3 gal' }, [0, 1, 2].map(i => PLUG.Photo('care', i ? 'image' : 'camera', i ? '' : 'tall'))), p({ class: 'small muted' }, 'Gallery slots are samples.')),
          s.services.length ? div({ class: 'sticky' }, div({ class: 'card' }, h3('Request a booking'), PLUG.sel('bk' + sid, f, 'svc', s.services.map((v, i) => [i, v.n + ' · ' + fmt(v.p)]), { label: 'Service' }), div({ class: 'grid g2 keep' }, PLUG.in('bk' + sid, f, 'date', { label: 'Date', type: 'date', min: S.today }), PLUG.in('bk' + sid, f, 'time', { label: 'Time', type: 'time' })), f.err ? PLUG.notice(f.err, 'bad') : null, p({ class: 'small muted' }, 'The provider confirms the time before it is booked.'), button({ class: 'btn pri block', onclick: book }, 'Request booking'))) : null)
          : [custom && items.length > 3 ? [h3({ style: 'margin-bottom:10px' }, 'Featured'), div({ class: 'listing' }, items.slice(0, 3).map(it => PLUG.lnk('/p/' + it.pid, 'lcard', itemPhoto(it, CAT[it.pid]), div({ class: 'body' }, span({ class: 'nm' }, it.name), span({ class: 'price' }, fmt(it.price)))))), gap(24)] : null,
            h3({ style: 'margin-bottom:10px' }, custom ? 'Everything from ' + s.tag : 'Products'), items.length ? grid(items) : PLUG.empty('Nothing listed yet', s.quoteCats.length ? 'This provider takes quote requests for: ' + s.quoteCats.join(', ') + '.' : 'Check back soon.', s.quoteCats.length ? PLUG.lnk('/requests', 'btn pri', 'Request a quote') : null),
            custom && s.about ? [gap(24), div({ class: 'card' }, h3('About ' + s.name), p({ class: 'muted', style: 'margin:0' }, s.about))] : null],
        gap(16), p({ class: 'small muted' }, 'Orders, payment and delivery on this page are handled by THE PLUG, so the same protection applies everywhere. Pickup addresses are shared only with the assigned rider.'))));
  };
  const h1el = (t) => h('h1', { class: 'storename' }, t);

  /* ---------- Background removal (works on plain backgrounds) ---------- */
  PLUG.removeBg = (src, tol, cb) => {
    const im = new Image();
    im.onload = () => {
      const max = 520, sc = Math.min(1, max / Math.max(im.width, im.height)), w = Math.max(1, Math.round(im.width * sc)), hh = Math.max(1, Math.round(im.height * sc));
      const cv = document.createElement('canvas'); cv.width = w; cv.height = hh; const x = cv.getContext('2d'); x.drawImage(im, 0, 0, w, hh);
      const d = x.getImageData(0, 0, w, hh), a = d.data, N = w * hh;
      const R = [], G = [], B = []; const take = (i) => { R.push(a[i * 4]); G.push(a[i * 4 + 1]); B.push(a[i * 4 + 2]); };
      for (let i = 0; i < w; i++) { take(i); take((hh - 1) * w + i); } for (let j = 0; j < hh; j++) { take(j * w); take(j * w + w - 1); }
      const med = (v) => v.sort((p1, p2) => p1 - p2)[v.length >> 1]; const br = med(R), bgc = med(G), bb = med(B);
      const dist2 = (i) => { const o = i * 4, r = a[o] - br, g = a[o + 1] - bgc, b = a[o + 2] - bb; return r * r + g * g + b * b; };
      const t2 = tol * tol, seen = new Uint8Array(N), q = new Int32Array(N); let qh = 0, qt = 0;
      const push = (i) => { if (!seen[i] && dist2(i) <= t2) { seen[i] = 1; q[qt++] = i; } };
      for (let i = 0; i < w; i++) { push(i); push((hh - 1) * w + i); } for (let j = 0; j < hh; j++) { push(j * w); push(j * w + w - 1); }
      while (qh < qt) { const i = q[qh++], cx = i % w, cy = (i / w) | 0; if (cx > 0) push(i - 1); if (cx < w - 1) push(i + 1); if (cy > 0) push(i - w); if (cy < hh - 1) push(i + w); }
      let removed = 0;
      for (let i = 0; i < N; i++) {
        if (seen[i]) { a[i * 4 + 3] = 0; removed++; continue; }
        const cx = i % w, cy = (i / w) | 0; const edge = (cx > 0 && seen[i - 1]) || (cx < w - 1 && seen[i + 1]) || (cy > 0 && seen[i - w]) || (cy < hh - 1 && seen[i + w]);
        if (edge && dist2(i) <= t2 * 2.6) a[i * 4 + 3] = 140;
      }
      x.putImageData(d, 0, 0);
      cb(cv.toDataURL('image/png'), Math.round(removed / N * 100));
    };
    im.onerror = () => cb(null, 0);
    im.src = src;
  };
  const shrinkImage = (src, max, cb) => { const im = new Image(); im.onload = () => { const sc = Math.min(1, max / Math.max(im.width, im.height)); const cv = document.createElement('canvas'); cv.width = Math.round(im.width * sc); cv.height = Math.round(im.height * sc); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); cb(cv.toDataURL('image/png')); }; im.onerror = () => cb(''); im.src = src; };
  const readFile = (fl, cb) => { const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(fl); };

  /* ---------- Sell on THE PLUG ---------- */
  const zoneXY = (zid) => { const z = PLUG.ZONES.find(x => x.id === zid) || PLUG.ZONES[1]; return { x: z.x + 0.2, y: z.y - 0.1, zone: z.name }; };
  const lookFields = (f, pre) => div(
    div({ class: 'field' }, span({ class: 'lbl' }, 'Page colour'), div({ class: 'chips', role: 'radiogroup', 'aria-label': 'Page colour' }, PLUG.SELLER_COLORS.map(c => button({ class: 'swatch' + (f.color === c ? ' on' : ''), role: 'radio', 'aria-checked': String(f.color === c), 'aria-label': 'Colour ' + c, style: 'background:' + c, onclick: () => { f.color = c; PLUG.set(); } })))),
    div({ class: 'row', style: 'align-items:flex-end' }, f.logo ? img({ src: f.logo, alt: 'Your logo', class: 'avatar', style: 'width:56px;height:56px' }) : null,
      div({ class: 'grow' }, PLUG.fld('Logo (optional)', input({ type: 'file', accept: 'image/*', id: PLUG.id(pre + '-logo'), onchange: (e) => { const fl = e.target.files[0]; if (fl) readFile(fl, (d) => shrinkImage(d, 160, (s2) => { f.logo = s2; PLUG.set(); })); } }), { hint: 'No logo? We make one from your initials.' }))),
    PLUG.in(pre, f, 'about', { label: 'About you', area: true, rows: 3, ph: 'What you sell, what makes you different, delivery days...' }),
    PLUG.in(pre, f, 'website', { label: 'Your own website (optional)', ph: 'https://...', hint: 'Shown as a “Visit our website” button.' }),
    PLUG.sel(pre, f, 'layout', [['grid', 'Products as a grid'], ['list', 'Products as a list']], { label: 'Layout' }));

  pages.sell = () => {
    const shop = S.myShop;
    if (!shop) return sellOnboarding();
    const me = M().me, mine = PLUG.sellerItems('me'), min = PLUG.CONFIG.market.storefrontMin, custom = PLUG.hasCustomPage(me);
    const f = PLUG.form('selltab', { tab: 'products' });
    let body;
    if (f.tab === 'products') body = shop.type === 'service' ? serviceEditor(me) : mine.length ? div({ class: 'card', style: 'padding:4px 18px' }, mine.map(it => div({ class: 'item' },
      div({ style: 'width:64px;flex:none' }, itemPhoto(it, CAT[it.pid], 'sq')),
      div({ class: 'grow' }, div({ class: 'nm' }, it.name), div({ class: 'row', style: 'gap:6px;margin-top:4px' }, stockPill(it), CAT[it.pid].lasts ? PLUG.pill('Ships outside Freetown', 'mute') : PLUG.pill('Freetown only', 'warn'))),
      div({ class: 'price' }, fmt(it.price)),
      div({ class: 'stack', style: 'gap:6px;align-items:flex-end' }, PLUG.qtyCtl(it.stock, (q) => { it.stock = Math.max(0, q); it.upd = 0; PLUG.set(); }, 'stock of ' + it.name), button({ class: 'link small', onclick: () => { it.stock = 0; it.upd = 0; PLUG.set(); PLUG.toast('Marked sold out'); } }, 'Sold out'))))) : PLUG.empty('No products yet', 'Add your first product with a photo.', button({ class: 'btn pri', onclick: () => { f.tab = 'add'; PLUG.set(); } }, 'Add a product'));
    else if (f.tab === 'add') body = addProduct(f);
    else if (f.tab === 'requests') body = providerRequests(shop);
    else body = div({ class: 'card', style: 'max-width:640px' }, h3('Your page'), lookFields(shop, 'look'), button({ class: 'btn pri', onclick: () => { Object.assign(me, { color: shop.color, logo: shop.logo, about: shop.about, website: shop.website, layout: shop.layout }); PLUG.toast('Page updated'); PLUG.set(); } }, 'Save page'));
    return div(
      div({ class: 'card', style: 'margin-bottom:18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap' }, PLUG.avatar(me, 56), div({ class: 'grow' }, h3(me.name), div({ class: 'small muted' }, 'by ' + me.tag + ' · ' + typeLabel[me.type] + ' · ' + me.zone)),
        shop.type === 'service' ? PLUG.pill('Custom page unlocked', '', 'check') : div({ style: 'min-width:220px' }, div({ class: 'small', style: 'font-weight:700;margin-bottom:6px' }, custom ? 'Custom page unlocked' : mine.length + ' of ' + min + ' products to unlock your custom page'), div({ class: 'meter', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': min, 'aria-valuenow': Math.min(min, mine.length) }, div({ style: 'width:' + Math.min(100, mine.length / min * 100) + '%' }))),
        PLUG.lnk('/store/me', 'btn ghost sm', 'View my page')),
      PLUG.tabs([['products', shop.type === 'service' ? 'Services' : 'Products (' + mine.length + ')'], ['add', 'Add product', shop.type === 'service'], ['requests', 'Quote requests'], ['page', 'Page design', !custom]], f.tab, (t) => { f.tab = t; PLUG.set(); }),
      !custom && f.tab === 'products' ? p({ class: 'small muted' }, 'Page design opens when your custom page unlocks.') : null,
      body);
  };
  function sellOnboarding() {
    const f = PLUG.form('onb', { step: 1, type: 'business', name: '', tag: '', zone: 'lumley', rules: false, color: '#B6FB05', logo: '', about: '', website: '', layout: 'grid', err: '' });
    const next = () => {
      f.err = '';
      if (!f.name.trim()) f.err = 'Add your shop or business name.';
      else if (!f.tag.trim()) f.err = 'Choose what your “by” tag says.';
      else if (/\b(official|plug)\b/i.test(f.tag)) f.err = 'Tags can’t claim to be official or to be THE PLUG. Use your own name or business name.';
      else if (!f.rules) f.err = 'Please agree to the seller rules.';
      if (f.err) { PLUG.set(); return; } f.step = 2; PLUG.set();
    };
    const create = () => {
      if (f.website && !/^https?:\/\/\S+\.\S+/.test(f.website.trim())) { f.err = 'Website should start with http:// or https://'; PLUG.set(); return; }
      PLUG.requireAuth(() => {
        const xy = zoneXY(f.zone);
        S.myShop = { type: f.type, color: f.color, logo: f.logo, about: f.about.trim(), website: f.website.trim(), layout: f.layout };
        M().me = { id: 'me', kind: 'seller', name: f.name.trim(), tag: f.tag.trim(), type: f.type, verified: false, x: xy.x, y: xy.y, zone: xy.zone, color: f.color, logo: f.logo, blurb: typeLabel[f.type], about: f.about.trim(), hours: 'Set your hours', website: f.website.trim(), layout: f.layout, services: [], quoteCats: f.type === 'service' ? ['photo'] : ['print'], cuisines: [], prep: 15, state: 'open', updated: 'today', tone: 'market' };
        PLUG.toast('Your shop is live (demo)'); PLUG.set();
      });
    };
    return div({ class: 'two' }, div(
      PLUG.tabs([[1, '1. About you'], [2, '2. Your page']], f.step, (s) => { if (s < f.step) { f.step = s; PLUG.set(); } }),
      f.step === 1 ? div({ class: 'card' }, h3('Who is selling?'),
        ['business', 'person', 'brand', 'service'].map(t => PLUG.optcard({ k: 'st-' + t, group: 'stype', on: f.type === t, title: typeLabel[t], sub: { business: 'A registered shop or company.', person: 'You sell on your own, even from home.', brand: 'Your own brand or label.', service: 'Nail tech, lash tech, barber, photographer and other services.' }[t], pick: () => { f.type = t; PLUG.set(); } })),
        PLUG.in('onb', f, 'name', { label: 'Shop or business name', ph: 'e.g. JSK Provisions' }),
        PLUG.in('onb', f, 'tag', { label: 'Your “by” tag', ph: 'e.g. JSK, or your own name', maxlen: 24, hint: 'Shown on every product as “by ' + (f.tag.trim() || '…') + '”. Customers tap it to open your page.' }),
        PLUG.sel('onb', f, 'zone', PLUG.ZONES.filter(z => !z.intercity).map(z => [z.id, z.name]), { label: 'Area', hint: 'Customers see your area only. Your exact pickup spot is shared with the assigned rider.' }),
        PLUG.chk('onb', f, 'rules', 'I won’t sell medicines, counterfeit, illegal or dangerous goods, and I keep my stock up to date.'),
        f.err ? PLUG.notice(f.err, 'bad') : null, button({ class: 'btn pri', onclick: next }, 'Continue', ico('arrow', 18))) : null,
      f.step === 2 ? div({ class: 'card' }, h3('Make it yours'),
        p({ class: 'muted small' }, f.type === 'service' ? 'Service providers get a custom page straight away.' : 'You start with a simple page made for you. At ' + PLUG.CONFIG.market.storefrontMin + ' products your custom page unlocks with these settings.'),
        lookFields(f, 'onb'), f.err ? PLUG.notice(f.err, 'bad') : null,
        div({ class: 'row' }, button({ class: 'btn ghost', onclick: () => { f.step = 1; PLUG.set(); } }, 'Back'), button({ class: 'btn pri', onclick: create }, 'Create my shop'))) : null),
      div({ class: 'sticky' }, div({ class: 'card' }, h4('Preview of your tag'), div({ class: 'row', style: 'margin:10px 0' }, PLUG.avatar({ name: f.name || 'Your shop', logo: f.logo, color: f.color, type: f.type, id: '_preview', _force: true }, 48), div(strong(f.name || 'Your shop'), h('br'), span({ class: 'bytag' }, 'by ' + (f.tag || 'you')))),
        ul({ class: 'small muted' }, li('Take a photo, the background is removed for you.'), li('Pick the product if someone already sells it, or create it.'), li('Set price and stock. Done.')), p({ class: 'small muted', style: 'margin:0' }, 'Commission per sale: ' + PLUG.CONFIG.market.commissionPct + ' (decision pending).'))));
  }
  function addProduct(tabForm) {
    const f = PLUG.form('addp', { src: '', clean: '', pct: 0, tol: '60', useClean: true, busy: false, q: '', pid: '', newName: '', newCat: 'Food cupboard', lasts: true, price: '', stock: '', err: '' });
    const run = () => { if (!f.src) return; f.busy = true; PLUG.set(); PLUG.removeBg(f.src, +f.tol, (out, pct) => { f.clean = out || ''; f.pct = pct; f.busy = false; PLUG.set(); }); };
    const matches = f.q.trim() ? Object.values(CAT).filter(c => c.name.toLowerCase().includes(f.q.toLowerCase())).slice(0, 6) : [];
    const publish = () => {
      f.err = '';
      if (!f.pid && !f.newName.trim()) f.err = 'Pick an existing product or type a new product name.';
      else if (!(+f.price > 0)) f.err = 'Add a price.';
      else if (!(+f.stock >= 0) || f.stock === '') f.err = 'Add how many you have in stock.';
      else if (f.pid && PLUG.ITEMS['o-me-' + f.pid]) f.err = 'You already sell this. Update its stock in Products.';
      if (f.err) { PLUG.set(); return; }
      let pid = f.pid;
      if (!pid) { pid = 'my-' + PLUG.uid('p').toLowerCase(); CAT[pid] = { id: pid, name: f.newName.trim(), cat: f.newCat, lasts: !!f.lasts, tone: 'market', icon: 'cart', mine: true }; }
      const before = PLUG.hasCustomPage(M().me);
      addOffer(pid, 'me', Math.round(+f.price), Math.round(+f.stock), 0, f.src ? (f.useClean && f.clean ? f.clean : f.src) : '');
      const after = PLUG.hasCustomPage(M().me);
      Object.assign(f, { src: '', clean: '', pct: 0, q: '', pid: '', newName: '', price: '', stock: '' });
      tabForm.tab = after && !before ? 'page' : 'products';
      PLUG.toast(after && !before ? 'Your custom page is unlocked! Design it now.' : 'Product is live (demo)'); PLUG.set();
    };
    return div({ class: 'two' },
      div({ class: 'card' }, h3('1. Photo'),
        PLUG.fld('Take or upload a photo', input({ type: 'file', accept: 'image/*', capture: 'environment', id: PLUG.id('addp-file'), onchange: (e) => { const fl = e.target.files[0]; if (!fl) return; readFile(fl, (d) => { f.src = d; f.clean = ''; PLUG.set(); run(); }); } }), { hint: 'Plain backgrounds work best: a wall, a table, a sheet of paper.' }),
        f.src ? [div({ class: 'grid g2 keep' }, div(div({ class: 'small muted', style: 'margin-bottom:4px' }, 'Original'), div({ class: 'preview' }, img({ src: f.src, alt: 'Original photo' }))),
          div(div({ class: 'small muted', style: 'margin-bottom:4px' }, f.busy ? 'Removing background…' : 'Background removed (' + f.pct + '% cleared)'), div({ class: 'preview checker' }, f.clean ? img({ src: f.clean, alt: 'Photo with background removed' }) : null))),
          div({ class: 'field', style: 'margin-top:12px' }, label({ for: PLUG.id('addp-tol') }, 'Removal strength'), input({ type: 'range', id: PLUG.id('addp-tol'), min: 20, max: 140, value: f.tol, onchange: (e) => { f.tol = e.target.value; run(); } }), div({ class: 'hint' }, 'Move it if too much or too little is removed.')),
          PLUG.chk('addp', f, 'useClean', 'Use the cleaned photo'),
          PLUG.notice('This demo removes plain backgrounds with a simple colour method. The live app would use an AI model that handles busier photos.', 'warn', 'info')] : null),
      div({ class: 'card' }, h3('2. What is it?'),
        f.pid ? div({ class: 'row between', style: 'margin-bottom:12px' }, div(strong(CAT[f.pid].name), div({ class: 'small muted' }, PLUG.offersFor(f.pid).length + ' other sellers. Customers will compare you.')), button({ class: 'link small', onclick: () => { f.pid = ''; PLUG.set(); } }, 'Change'))
          : [PLUG.in('addp', f, 'q', { label: 'Search existing products', ph: 'e.g. Maggi', hint: 'If someone already sells it, pick it so customers can compare.' }),
            matches.length ? div({ class: 'chips', style: 'margin-bottom:12px' }, matches.map(c => button({ class: 'chip', onclick: () => { f.pid = c.id; f.lasts = c.lasts; PLUG.set(); } }, c.name))) : null,
            PLUG.in('addp', f, 'newName', { label: 'Or create a new product', ph: 'Name and size, e.g. Palm oil, 1 L' }),
            PLUG.sel('addp', f, 'newCat', Array.from(new Set(Object.values(CAT).map(c => c.cat))).map(c => [c, c]), { label: 'Category' }),
            PLUG.chk('addp', f, 'lasts', 'It lasts the journey (can ship outside Freetown)')],
        h3({ style: 'margin-top:8px' }, '3. Price and stock'),
        div({ class: 'grid g2 keep' }, PLUG.in('addp', f, 'price', { label: 'Price (NLe)', type: 'number', min: 1 }), PLUG.in('addp', f, 'stock', { label: 'In stock', type: 'number', min: 0 })),
        f.err ? PLUG.notice(f.err, 'bad') : null, button({ class: 'btn pri block', onclick: publish }, 'Publish product')));
  }
  function serviceEditor(me) {
    const f = PLUG.form('svced', { n: '', p: '', min: '60', err: '' });
    return div({ class: 'two' }, div({ class: 'card', style: 'padding:4px 18px' }, me.services.length ? me.services.map((v, i) => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'nm' }, v.n), div({ class: 'small muted' }, 'About ' + v.min + ' min')), div({ class: 'price' }, fmt(v.p)), button({ class: 'btn sm sec2', 'aria-label': 'Remove ' + v.n, onclick: () => { me.services.splice(i, 1); PLUG.set(); } }, ico('trash', 15)))) : p({ class: 'muted small', style: 'padding:14px 0' }, 'No services yet. Add your first one.')),
      div({ class: 'card' }, h3('Add a service'), PLUG.in('svced', f, 'n', { label: 'Service', ph: 'e.g. Gel polish' }), div({ class: 'grid g2 keep' }, PLUG.in('svced', f, 'p', { label: 'Price (NLe)', type: 'number', min: 1 }), PLUG.in('svced', f, 'min', { label: 'Minutes', type: 'number', min: 5 })),
        f.err ? PLUG.notice(f.err, 'bad') : null, button({ class: 'btn pri block', onclick: () => { if (!f.n.trim() || !(+f.p > 0)) { f.err = 'Add a name and a price.'; PLUG.set(); return; } me.services.push({ n: f.n.trim(), p: Math.round(+f.p), min: Math.round(+f.min) || 60 }); Object.assign(f, { n: '', p: '', err: '' }); PLUG.toast('Service added'); PLUG.set(); } }, 'Add service')));
  }

  /* ---------- Quote requests ---------- */
  const QCATS = [['print', 'Printing'], ['photo', 'Photos and video'], ['build', 'Websites and apps']];
  const qName = (c) => (QCATS.find(x => x[0] === c) || [c, c])[1];
  PLUG.providersFor = (c) => [{ id: 'studio', name: 'THE PLUG Studio', tag: 'THE PLUG Studio', own: true }].concat(PLUG.sellers().filter(s => s.quoteCats.includes(c) && s.id !== 'me'));
  const simulate = (r) => {
    const base = { print: 150, photo: 300, build: 5000 }[r.cat] || 200, q = Math.max(1, +r.qty || 1), provs = PLUG.providersFor(r.cat);
    provs.forEach((pv, i) => { if (r.responses.some(x => x.by === pv.id)) return;
      const k = (pv.id.charCodeAt(0) + i * 7) % 5;
      if (k === 4) r.responses.push({ by: pv.id, name: pv.name, tag: pv.tag, kind: 'decline', note: 'Too busy before your deadline.' });
      else r.responses.push({ by: pv.id, name: pv.name, tag: pv.tag, kind: 'quote', price: Math.round(base * (r.cat === 'print' ? Math.ceil(q / 100) : 1) * (0.85 + k * 0.12)), days: 1 + k, note: k === 1 ? 'Can do it faster for a rush fee.' : '' }); });
  };
  pages.requests = () => {
    const f = PLUG.form('rq', { cat: 'print', what: '', qty: '100', deadline: '', zone: 'lumley', file: '', budget: '', err: '' });
    const post = () => {
      f.err = '';
      if (f.what.trim().length < 8) f.err = 'Describe the job in a few words so providers can price it.';
      else if (!f.deadline) f.err = 'Choose a deadline.';
      if (f.err) { PLUG.set(); return; }
      PLUG.requireAuth(() => { S.requests.unshift({ id: PLUG.uid('RQ'), cat: f.cat, what: f.what.trim(), qty: f.qty, deadline: f.deadline, zone: f.zone, file: f.file, budget: f.budget, status: 'open', responses: [], mine: true, created: PLUG.clock() }); Object.assign(f, { what: '', file: '', budget: '' }); PLUG.toast('Request sent to matching providers (demo)'); PLUG.set(); });
    };
    const mine = S.requests.filter(r => r.mine);
    return div({ class: 'two' },
      div(PLUG.notice('Can’t find what you need, or our own Studio is busy? Post a request. Registered providers in that category see it and choose to quote or not.', '', 'info'),
        mine.length ? mine.map(r => div({ class: 'card', style: 'margin-bottom:14px' },
          div({ class: 'row between' }, div(strong(qName(r.cat) + ': ' + r.what.slice(0, 60)), div({ class: 'small muted' }, 'Qty ' + r.qty + ' · by ' + PLUG.prettyDate(r.deadline) + ' · sent ' + r.created)), PLUG.pill(r.status === 'booked' ? 'Booked' : r.status === 'closed' ? 'Closed' : 'Open, 30 min window (sample)', r.status === 'open' ? '' : 'mute')),
          r.responses.length ? div({ style: 'margin-top:10px' }, r.responses.map(x => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'row', style: 'gap:8px' }, strong(x.name), x.own ? PLUG.pill('Our own studio', 'mute') : M()[x.by] ? PLUG.byTag(M()[x.by]) : null), div({ class: 'small muted' }, x.kind === 'decline' ? 'Declined: ' + x.note : 'Ready in about ' + x.days + ' day' + (x.days > 1 ? 's' : '') + (x.note ? ' · ' + x.note : ''))),
            x.kind === 'quote' ? [div({ class: 'price' }, fmt(x.price)), r.status === 'open' ? button({ class: 'btn sm pri', onclick: () => { r.status = 'booked'; r.chosen = x.by; PLUG.addBooking({ type: 'studio', title: qName(r.cat) + ' by ' + x.name, sub: r.what.slice(0, 50) + ' · quote accepted', price: x.price, meta: { request: r.id } }); PLUG.nav('/basket'); } }, 'Accept') : r.chosen === x.by ? PLUG.pill('Chosen') : null] : null)))
            : p({ class: 'small muted', style: 'margin:10px 0 0' }, 'Waiting for providers to reply.'),
          r.status === 'open' ? div({ class: 'row', style: 'margin-top:10px' }, button({ class: 'btn sm sec2', onclick: () => { simulate(r); PLUG.set(); } }, 'Demo: providers reply'), button({ class: 'link small', onclick: () => { r.status = 'closed'; PLUG.set(); } }, 'Close request')) : null))
          : PLUG.empty('No requests yet', 'Post your first request with the form.')),
      div({ class: 'sticky' }, div({ class: 'card' }, h3('New request'), PLUG.sel('rq', f, 'cat', QCATS, { label: 'What kind of job' }),
        PLUG.in('rq', f, 'what', { label: 'Describe it', area: true, rows: 3, ph: 'e.g. 200 A5 flyers, full colour both sides, for Saturday' }),
        div({ class: 'grid g2 keep' }, PLUG.in('rq', f, 'qty', { label: 'Quantity', type: 'number', min: 1 }), PLUG.in('rq', f, 'deadline', { label: 'Deadline', type: 'date', min: S.today })),
        PLUG.sel('rq', f, 'zone', PLUG.ZONES.filter(z => !z.intercity).map(z => [z.id, z.name]), { label: 'Your area' }),
        PLUG.fld('Attach a file (optional)', input({ type: 'file', id: PLUG.id('rq-file'), onchange: (e) => { f.file = e.target.files[0] ? e.target.files[0].name : ''; PLUG.set(); } }), { hint: f.file ? 'Chosen: ' + f.file + ' (not stored in the demo)' : 'Artwork, a brief or examples.' }),
        PLUG.in('rq', f, 'budget', { label: 'Budget (optional, NLe)', type: 'number', min: 0 }),
        p({ class: 'small muted' }, 'Goes to ' + PLUG.providersFor(f.cat).length + ' providers for ' + qName(f.cat).toLowerCase() + ' near you. They can’t see your phone number until you book.'),
        f.err ? PLUG.notice(f.err, 'bad') : null, button({ class: 'btn pri block', onclick: post }, 'Send request'))));
  };
  function providerRequests(shop) {
    const open = S.requests.filter(r => r.status === 'open');
    const f = PLUG.form('pq', { price: {}, days: {} });
    if (!open.length) return PLUG.empty('No open requests', 'When a customer posts a request in your category, it shows here. Try posting one from the Quote requests page to see both sides.', PLUG.lnk('/requests', 'btn pri', 'Open Quote requests'));
    return div(open.map(r => { const mineQ = r.responses.find(x => x.by === 'me');
      return div({ class: 'card', style: 'margin-bottom:12px' }, strong(qName(r.cat) + ': ' + r.what), div({ class: 'small muted', style: 'margin-bottom:8px' }, 'Qty ' + r.qty + ' · needed by ' + PLUG.prettyDate(r.deadline) + (r.budget ? ' · budget ' + fmt(+r.budget) : '')),
        mineQ ? PLUG.notice(mineQ.kind === 'quote' ? 'You quoted ' + fmt(mineQ.price) + ', ready in ' + mineQ.days + ' days.' : 'You declined.', '', 'check')
          : div({ class: 'row', style: 'align-items:flex-end' }, div({ style: 'width:140px' }, PLUG.in('pq' + r.id, f.price, r.id, { label: 'Your price', type: 'number', min: 1 })), div({ style: 'width:110px' }, PLUG.in('pqd' + r.id, f.days, r.id, { label: 'Days', type: 'number', min: 1 })),
            button({ class: 'btn pri sm', style: 'margin-bottom:14px', onclick: () => { if (!(+f.price[r.id] > 0)) { PLUG.toast('Add your price', 'warn'); return; } r.responses.push({ by: 'me', name: M().me.name, tag: M().me.tag, kind: 'quote', price: Math.round(+f.price[r.id]), days: Math.max(1, Math.round(+f.days[r.id] || 1)), note: '' }); PLUG.toast('Quote sent'); PLUG.set(); } }, 'Send quote'),
            button({ class: 'btn ghost sm', style: 'margin-bottom:14px', onclick: () => { r.responses.push({ by: 'me', name: M().me.name, tag: M().me.tag, kind: 'decline', note: 'Not available.' }); PLUG.set(); } }, 'Decline'))); }));
  }
})(typeof window !== 'undefined' ? window : globalThis);
