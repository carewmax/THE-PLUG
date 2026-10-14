/* THE PLUG pages, part 1: home, Eats, Market, One Delivery, basket, checkout. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, h = PLUG.h, ico = PLUG.ico, M = () => PLUG.MERCH, fmt = PLUG.fmt;
  const { div, span, p, button, h1, h2, h3, h4, label, ul, li, input, strong, small } = PLUG;
  const pages = PLUG.pages = PLUG.pages || {};

  PLUG.SERVICES = [
    { id: 'eats', k: 'food', route: '/eats', icon: 'food', tone: 'food', name: 'Eats', blurb: 'Restaurants and meals', tier: 'Extended hours' },
    { id: 'shop', k: 'shopall', route: '/shop', icon: 'shop', tone: 'market', name: 'Shop', blurb: 'Every seller, one search', tier: 'Follows each seller' },
    { id: 'market', k: 'groceries', route: '/market', icon: 'cart', tone: 'market', name: 'Market', blurb: 'Groceries and household', tier: 'Daytime' },
    { id: 'events', k: 'eventsk', route: '/events', icon: 'calendar', tone: 'studio', name: 'Events', blurb: 'What’s on, with tickets', tier: 'Calendar any time' },
    { id: 'stays', k: 'stays', route: '/stays', icon: 'bed', tone: 'stay', name: 'Stays', blurb: 'Hotels, guesthouses, apartments', tier: 'Requests anytime' },
    { id: 'errands', k: 'errands', route: '/errands', icon: 'errand', tone: 'errand', name: 'Errands', blurb: 'A runner does it for you', tier: 'Always on (when runners are online)' },
    { id: 'ride', k: 'rides', route: '/ride', icon: 'car', tone: 'ride', name: 'Ride', blurb: 'Cars, kekes and vans', tier: 'Always on (when drivers are online)' },
    { id: 'travel', k: 'travel', route: '/travel', icon: 'plane', tone: 'travel', name: 'Travel', blurb: 'Packages and transfers', tier: 'Requests anytime' },
    { id: 'care', k: 'pharmacy', route: '/care', icon: 'care', tone: 'care', name: 'Care', blurb: 'Pharmacy and personal essentials', tier: 'Extended hours' },
    { id: 'studio', k: 'shops', route: '/studio', icon: 'printer', tone: 'studio', name: 'Studio', blurb: 'Print, photos and websites', tier: 'Daytime' },
    { id: 'one', k: 'one', route: '/one', icon: 'box', tone: 'one', name: 'One Delivery', blurb: 'Many shops, one rider', tier: 'With Eats and Market' }
  ];
  const TIER_NOTE = 'Planned service tiers. A tier only counts once partners and couriers are signed up for it. Nothing here claims round-the-clock cover today.';
  PLUG.TIER_NOTE = TIER_NOTE;

  PLUG.tierBlock = () => div({ class: 'grid g3' }, [
    ['Always on', 'bolt', 'Requests for errands, rides and stays can be sent at any hour. A request is confirmed only when a person accepts it.'],
    ['Extended hours', 'moon', 'Food and Care follow partner opening times, planned to run late into the evening. Each partner shows its own status.'],
    ['Daytime', 'clock', 'Markets, print and photo studios work normal business hours. After-hours orders are scheduled for the next opening.']
  ].map(x => div({ class: 'card' }, div({ class: 'row', style: 'margin-bottom:8px;color:var(--acc)' }, ico(x[1], 22), h4({ style: 'font-size:17px' }, x[0])), p({ class: 'small muted', style: 'margin:0' }, x[2]))));

  /* ---------- Home (website) ---------- */
  pages.home = () => {
    const f = PLUG.form('hero', { q: '', zone: 'lumley' });
    const go = () => { S.search = { q: f.q, cat: 'All' }; PLUG.nav('/search'); };
    const wl = PLUG.form('wl', { contact: '' });
    const feat = [['r1', 'Royal Bites', 'Rice dishes and burgers', 'food', 'food', '/eats/r1'], ['s1', 'FreshMart', 'Staples, drinks and household', 'market', 'cart', '/market'], ['st2', 'Vista Luxury Apartments', 'Apartment in Lumley', 'stay', 'bed', '/stays/st2'], ['pk2', 'Island Escape', '5 day package, request only', 'travel', 'plane', '/travel']];
    return div(
      div({ class: 'dark hero' }, div({ class: 'wrap' },
        div(div({ class: 'eyebrow' }, 'Sierra Leone first · Pilot in Freetown'),
          h1(PLUG.t('hello').split('. ')[0] + '.', h('br'), span({ class: 'lime' }, (PLUG.t('hello').split('. ')[1] || 'In one place.'))),
          p({ class: 'lead' }, 'Food, groceries, stays, errands, rides, travel, pharmacy and print in one app. Add shops together and one rider brings it all.'),
          div({ class: 'row', style: 'margin-bottom:22px' }, PLUG.lnk('/app', 'btn pri', 'Get started', ico('arrow', 18)), PLUG.lnk('/one', 'btn ghost', 'See how it works')),
          div({ class: 'searchbar' },
            div({ class: 'in' }, ico('pin', 18), PLUG.sel('hero', f, 'zone', PLUG.ZONES.map(z => [z.id, PLUG.zoneLabel(z)]), { bare: true })),
            div({ class: 'in' }, ico('search', 18), PLUG.in('hero', f, 'q', { bare: true, ph: PLUG.t('search') })),
            button({ class: 'btn pri', onclick: go }, 'Search'))),
        div({ class: 'heroart', 'aria-hidden': 'true' },
          div({ class: 'mark' }, h('img', { src: PLUG.ASSETS.icon, alt: '' })),
          div({ class: 'float', style: 'left:0;top:12%' }, ico('food', 18, 'ic'), 'Eats'),
          div({ class: 'float', style: 'right:-2%;top:22%' }, ico('bed', 18, 'ic'), 'Stays'),
          div({ class: 'float', style: 'left:4%;bottom:14%' }, ico('errand', 18, 'ic'), 'Errands'),
          div({ class: 'float', style: 'right:2%;bottom:8%' }, ico('box', 18, 'ic'), '3 pickups, 1 rider (sample)')))),
      div({ class: 'paper sec' }, div({ class: 'wrap' },
        PLUG.sechead('Nine ways we help', 'One app, nine services', 'Tap a service to see how it works. Everything shown is sample content while partners are being signed.'),
        div({ class: 'tiles' }, PLUG.SERVICES.map(s => PLUG.lnk(s.route, 'tile', div({ class: 'ic' }, ico(s.icon, 24)), span(PLUG.t(s.k) !== s.k ? PLUG.t(s.k) : s.name), span({ class: 'small', style: 'font-weight:500;color:var(--fg2)' }, s.blurb))).concat([PLUG.lnk('/about', 'tile', div({ class: 'ic' }, ico('plus', 24)), span('More'), span({ class: 'small', style: 'font-weight:500;color:var(--fg2)' }, 'Partners, hours and help'))])))),
      div({ class: 'paper', style: 'padding-bottom:44px' }, div({ class: 'wrap' },
        PLUG.sechead(null, 'Featured right now', 'Sample listings that show how cards will look. No ratings or review counts are shown until real customers leave them.'),
        div({ class: 'grid g4' }, feat.map(x => PLUG.lnk(x[5], 'lcard', PLUG.Photo(x[3], x[4]), div({ class: 'body' }, span({ class: 'nm' }, x[1]), span({ class: 'small muted' }, x[2]), span({ class: 'pill mute', style: 'align-self:flex-start' }, 'Sample'))))))),
      div({ class: 'dark sec' }, div({ class: 'wrap' }, div({ class: 'banner' },
        div({ style: 'max-width:520px' }, div({ class: 'eyebrow' }, 'One Delivery'), h3('Order from many places. One rider brings it all.'),
          p({ class: 'muted' }, 'Add a meal, groceries and a pharmacy item. If the route works we combine them into one trip and show you the saving. If it does not, we tell you why and deliver separately.'),
          div({ class: 'row' }, PLUG.lnk('/one', 'btn pri', 'See how it works'), PLUG.lnk('/basket', 'btn ghost', 'Open basket'))),
        h('div', { style: 'flex:1 1 280px;max-width:380px' }, PLUG.routeMap(PLUG.planDelivery([{ merchantId: 'r1', price: 1 }, { merchantId: 's1', price: 1 }, { merchantId: 'p1', price: 1 }], PLUG.ZONES[1]), 'combined'))))),
      div({ class: 'paper sec' }, div({ class: 'wrap' },
        PLUG.sechead('How it works', 'Four steps, no surprises'),
        div({ class: 'grid g4' }, [['search', 'Choose', 'Pick what you need from one or many places.'], ['receipt', 'See the price', 'Delivery, fees and total are shown before you pay.'], ['route', 'We plan the trip', 'Combined when it helps, separate when it is better.'], ['check', 'Track it', 'Each step shows a real status, not a guess.']].map((x, i) => div({ class: 'card' }, div({ class: 'row', style: 'margin-bottom:8px' }, span({ class: 'pill' }, i + 1), ico(x[0], 22)), h4({ style: 'font-size:17px;margin-bottom:4px' }, x[1]), p({ class: 'small muted', style: 'margin:0' }, x[2])))))),
      div({ class: 'paper', style: 'padding-bottom:44px' }, div({ class: 'wrap' }, div({ class: 'trust card' }, [['shield', 'Honest status', 'If a place has not confirmed it is open, we say so and ask first.'], ['receipt', 'Clear prices', 'Fees are itemised. Cash on delivery is limited for new accounts.'], ['lock', 'Discreet Care', 'Sealed bags and no sensitive wording on lock screens.'], ['users', 'Real support', 'Order help from a person, with hours shown plainly.']].map(x => div(ico(x[0], 20, 'ic'), div(strong(x[1]), h('br'), span({ class: 'muted small' }, x[2]))))))),
      div({ class: 'dark sec' }, div({ class: 'wrap' }, PLUG.sechead('Night Plug', 'Hours we can stand behind', TIER_NOTE), PLUG.tierBlock())),
      div({ class: 'paper sec' }, div({ class: 'wrap' }, div({ class: 'card', style: 'display:flex;gap:24px;flex-wrap:wrap;align-items:center;justify-content:space-between' },
        div({ style: 'max-width:520px' }, h3('The mobile app is coming'), p({ class: 'muted', style: 'margin:0' }, 'App store listings are not live yet. Try the working prototype now, or leave a contact to hear when the apps launch. This demo does not send anything.')),
        div({ class: 'row' }, PLUG.lnk('/app', 'btn pri', 'Try the app prototype'),
          h('div', { class: 'row', style: 'flex-wrap:nowrap' }, div({ style: 'width:200px' }, PLUG.in('wl', wl, 'contact', { bare: true, ph: 'Phone or email' })), button({ class: 'btn ghost', onclick: () => { if (wl.contact.trim()) { PLUG.joinWaitlist('app', wl.contact.trim()); wl.contact = ''; } else PLUG.toast('Add a phone or email first', 'warn'); } }, 'Notify me')))))));
  };

  /* ---------- Item add sheet (extras, notes) ---------- */
  PLUG.openItem = (item) => { S.itemSheet = { id: item.id, extras: [], note: '' }; PLUG.set(); };
  PLUG.itemSheet = () => {
    const sh = S.itemSheet; if (!sh) return null; const item = PLUG.ITEMS[sh.id]; const close = () => { S.itemSheet = null; PLUG.set(); };
    const extraCost = item.extras.filter(e => sh.extras.includes(e.n)).reduce((s, e) => s + e.p, 0);
    return PLUG.modal([h3(item.name), p({ class: 'muted small' }, item.desc || ''),
      item.allergens ? PLUG.notice('Allergens as supplied by the merchant: ' + item.allergens + '. Ask the merchant if unsure.', 'warn') : null,
      item.extras && item.extras.length ? [h4({ style: 'margin-bottom:8px' }, 'Extras'), item.extras.map(e => PLUG.optcard({ k: 'x-' + e.n, multi: true, on: sh.extras.includes(e.n), title: e.n, right: e.p ? '+' + fmt(e.p) : 'Free', pick: () => { const i = sh.extras.indexOf(e.n); if (i >= 0) sh.extras.splice(i, 1); else sh.extras.push(e.n); PLUG.set(); } }))] : null,
      PLUG.in('sheet', sh, 'note', { label: 'Note for the kitchen (optional)', area: true, rows: 2, ph: 'No pepper, sauce on the side...' }),
      button({ class: 'btn pri block', onclick: () => { if (PLUG.addLine(item, 1, { extras: item.extras.filter(e => sh.extras.includes(e.n)), note: sh.note.trim() })) close(); } }, 'Add to basket, ' + fmt(item.price + extraCost))], close);
  };
  PLUG.addButton = (item, o) => {
    const m = M()[item.merchantId], st = PLUG.merchantStatus(m, S.confirmed); o = o || {};
    const dis = item.enabled === false || item.pharmacist || (item.stock != null && item.stock <= 0);
    const label_ = dis ? (item.pharmacist ? 'Not available yet' : 'Out of stock') : st.code === 'unknown' ? 'Ask first' : st.code === 'closed' ? 'Schedule' : 'Add';
    return button({ class: 'btn sm ' + (dis || st.code === 'unknown' ? 'sec2' : 'pri'), disabled: dis, 'aria-label': label_ + ' ' + item.name, onclick: () => { if (st.code === 'unknown') { PLUG.toast('Ask ' + m.name + ' if they are open first', 'warn'); return; } if (item.extras && item.extras.length) PLUG.openItem(item); else PLUG.addLine(item, 1); } }, dis ? label_ : [ico('plus', 15), label_]);
  };
  PLUG.confirmBar = (m) => {
    const st = PLUG.merchantStatus(m, S.confirmed);
    if (st.code === 'unknown') return PLUG.notice([strong(m.name + ' has not confirmed it is open. '), st.detail, ' ', button({ class: 'link', onclick: () => PLUG.confirmMerchant(m.id) }, 'Ask the merchant now (demo reply: open)')], 'warn', 'clock');
    if (st.code === 'closed') return PLUG.notice([strong(m.name + ' is closed. '), st.detail], 'warn', 'clock');
    return null;
  };

  /* ---------- Eats ---------- */
  pages.eats = () => {
    const f = PLUG.form('eats', { q: '', cuisine: 'All', open: false });
    const all = PLUG.byKind('restaurant'), cuisines = ['All'].concat(Array.from(new Set([].concat(...all.map(r => r.cuisines)))));
    const list = all.filter(r => (f.cuisine === 'All' || r.cuisines.includes(f.cuisine)) && (!f.q || (r.name + r.blurb + r.cuisines.join(' ')).toLowerCase().includes(f.q.toLowerCase())) && (!f.open || PLUG.merchantStatus(r, S.confirmed).code === 'open'));
    const feat = list.filter(r => PLUG.merchantStatus(r, S.confirmed).code !== 'unknown').slice(0, 5).map(r => PLUG.menuFor(r.id).find(i => i.sec === 'Mains'));
    return div(
      div({ class: 'searchbar', style: 'margin-bottom:16px' }, div({ class: 'in' }, ico('search', 18), PLUG.in('eats', f, 'q', { bare: true, ph: 'Search restaurants or cuisines' }))),
      div({ class: 'row between', style: 'margin-bottom:18px' }, PLUG.chipRow(cuisines, f.cuisine, (c) => { f.cuisine = c; PLUG.set(); }), PLUG.chk('eats', f, 'open', 'Open now only')),
      PLUG.sechead(null, 'Top restaurants', 'Sample restaurants. Prep times are the merchant’s estimate, not a promise.'),
      list.length ? div({ class: 'listing' }, list.map(r => {
        const st = PLUG.merchantStatus(r, S.confirmed);
        return div({ class: 'lcard' + (st.code === 'closed' ? ' off' : '') }, PLUG.lnk('/eats/' + r.id, '', PLUG.Photo('food', 'food')),
          div({ class: 'body' }, div({ class: 'row between nowrap', style: 'flex-wrap:nowrap' }, PLUG.lnk('/eats/' + r.id, 'nm', r.name), PLUG.heart('merchant', r.id)),
            span({ class: 'small muted' }, r.cuisines.join(' · ') + ' · ' + r.zone), span({ class: 'small muted' }, 'Prep about ' + r.prep + ' min (estimate)'),
            div({ class: 'row' }, PLUG.statusPill(r), span({ class: 'small muted' }, st.detail))));
      })) : PLUG.empty('No restaurants match', 'Try another cuisine or clear the search.', button({ class: 'btn pri', onclick: () => { f.q = ''; f.cuisine = 'All'; f.open = false; PLUG.set(); } }, 'Clear filters')),
      h('div', { style: 'height:28px' }), PLUG.sechead(null, 'Featured meals', 'Picked from the restaurants above.'),
      div({ class: 'card', style: 'padding:4px 18px' }, feat.length ? feat.map(it => div({ class: 'item' }, div({ style: 'width:76px;flex:none' }, PLUG.Photo('food', 'food', 'sq')), div({ class: 'grow' }, div({ class: 'nm' }, it.name), div({ class: 'small muted' }, M()[it.merchantId].name + ' · ' + (it.desc || ''))), div({ class: 'price' }, fmt(it.price)), PLUG.addButton(it))) : div({ class: 'item muted' }, 'No meals to feature with these filters.')));
  };
  pages.eatsDetail = (rid) => {
    const m = M()[rid]; if (!m) return PLUG.empty('Restaurant not found', 'It may have been removed.', PLUG.lnk('/eats', 'btn pri', 'Back to Eats'));
    const items = PLUG.menuFor(rid), secs = Array.from(new Set(items.map(i => i.sec)));
    return div(
      div({ class: 'two', style: 'margin-top:12px' },
        div(PLUG.Photo('food', 'food', 'wide', null), h('div', { style: 'height:12px' }),
          div({ class: 'row between' }, h2({ style: 'font-size:28px' }, m.name), PLUG.heart('merchant', m.id)),
          p({ class: 'muted' }, m.cuisines.join(' · ') + ' · ' + m.zone + ' · prep about ' + m.prep + ' min (estimate)'),
          div({ class: 'row', style: 'margin-bottom:12px' }, PLUG.statusPill(m), span({ class: 'small muted' }, PLUG.merchantStatus(m, S.confirmed).detail)),
          PLUG.confirmBar(m),
          secs.map(sec => div({ class: 'card', style: 'margin-bottom:16px;padding:6px 18px' }, h3({ style: 'padding:12px 0 0' }, sec), items.filter(i => i.sec === sec).map(it => div({ class: 'item' },
            div({ class: 'grow' }, div({ class: 'nm' }, it.name), it.desc ? div({ class: 'small muted' }, it.desc) : null, div({ class: 'row', style: 'gap:6px;margin-top:4px' }, (it.tags || []).map(t => PLUG.pill(t, 'mute')), it.allergens ? span({ class: 'small muted' }, 'Allergens: ' + it.allergens) : null)),
            div({ class: 'price' }, fmt(it.price)), PLUG.addButton(it)))))),
        div({ class: 'sticky' }, PLUG.miniBasket())));
  };
  PLUG.miniBasket = () => {
    const n = PLUG.basketCount(), v = PLUG.view();
    return div({ class: 'card' }, h3('Your basket'), n ? [S.basket.lines.map(l => div({ class: 'kv' }, span(l.qty + ' × ' + l.name), span(fmt(l.price * l.qty)))),
      PLUG.kv('Items', fmt(v.totals.items), 'tot'), PLUG.lnk('/basket', 'btn pri block', 'Review basket')] : p({ class: 'muted small' }, 'Nothing here yet. Add items from one or more places and we will plan the delivery.'));
  };

  /* ---------- Market ---------- */
  pages.market = () => {
    const f = PLUG.form('market', { store: 's1', cat: 'All', q: '' });
    const stores = PLUG.byKind('store'), m = M()[f.store];
    const items = PLUG.menuFor(f.store).filter(i => (f.cat === 'All' || i.cat === f.cat) && (!f.q || i.name.toLowerCase().includes(f.q.toLowerCase())));
    const cats = ['All'].concat(Array.from(new Set(PLUG.menuFor(f.store).map(i => i.cat))));
    return div(
      PLUG.tabs(stores.map(s => [s.id, s.name]), f.store, (id) => { f.store = id; f.cat = 'All'; PLUG.set(); }),
      PLUG.confirmBar(m),
      div({ class: 'row between', style: 'margin-bottom:14px' }, PLUG.chipRow(cats, f.cat, (c) => { f.cat = c; PLUG.set(); }), div({ class: 'searchbar', style: 'padding:2px 8px;min-width:220px' }, div({ class: 'in' }, ico('search', 16), PLUG.in('market', f, 'q', { bare: true, ph: 'Search this store' })))),
      p({ class: 'small muted' }, 'Stock figures are sample numbers. Real stock will come from each store’s own system, and we remove an item if it runs out before it is packed.'),
      items.length ? div({ class: 'listing' }, items.map(it => {
        const out = it.stock <= 0, low = it.stock > 0 && it.stock <= 5;
        return div({ class: 'lcard' + (out ? ' off' : '') }, PLUG.Photo('market', 'cart'), div({ class: 'body' },
          div({ class: 'row between', style: 'flex-wrap:nowrap' }, span({ class: 'nm' }, it.name), PLUG.heart('item', it.id)),
          div({ class: 'row', style: 'gap:6px' }, out ? PLUG.pill('Out of stock', 'bad') : low ? PLUG.pill('Only ' + it.stock + ' left', 'warn') : PLUG.pill('In stock'), it.restricted ? PLUG.pill('Age ' + it.restricted, 'warn') : null),
          div({ class: 'row between', style: 'margin-top:auto' }, span({ class: 'price' }, fmt(it.price)), PLUG.addButton(it))));
      })) : PLUG.empty('Nothing found', 'Try another category or search.'));
  };

  /* ---------- One Delivery explainer ---------- */
  pages.one = () => {
    const demo = () => {
      const pick = (id, q) => PLUG.addLine(PLUG.ITEMS[id], q || 1, {});
      pick('r1-jollof'); pick('s1-rice'); pick('p1-sanit'); PLUG.nav('/basket');
    };
    const sample = PLUG.planDelivery([{ merchantId: 'r1', price: 1 }, { merchantId: 's1', price: 1 }, { merchantId: 'p1', price: 1 }], PLUG.ZONES[1]);
    return div(
      div({ class: 'two' },
        div(h2({ style: 'font-size:28px;margin-bottom:8px' }, 'How One Delivery decides'), p({ class: 'muted' }, 'Every basket with more than one place is checked by the same rules. You always see both options and the real cost of each.'),
          div({ class: 'stack' }, [
            ['Nearest first', 'The rider visits pickups in the shortest sensible order. Hot food is collected last so it stays hot.'],
            ['Dispatch waits for the slowest kitchen', 'We delay the rider’s start so nobody waits at a counter with your food going cold.'],
            ['Limits that protect you', 'At most ' + PLUG.CONFIG.delivery.maxStops + ' pickups, places within about ' + PLUG.CONFIG.delivery.maxSpreadKm + ' km of each other, and no more than ' + PLUG.CONFIG.delivery.maxExtraMin + ' extra minutes compared with separate trips.'],
            ['Only when it saves', 'A small consolidation fee applies only when combining really costs less than separate deliveries.'],
            ['Big or fragile things go alone', 'Banners, framed prints and bulky goods get their own vehicle and are never squeezed in.'],
            ['Personal essentials stay sealed', 'Care items travel in a sealed bag the courier does not open.']
          ].map((x, i) => div({ class: 'card row', style: 'flex-wrap:nowrap;align-items:flex-start' }, span({ class: 'pill' }, i + 1), div(strong(x[0]), p({ class: 'small muted', style: 'margin:0' }, x[1])))))),
        div({ class: 'sticky' }, div({ class: 'card' }, h3('Example: a meal, rice and a hand sanitiser'), PLUG.routeMap(sample, 'combined'),
          sample.feasible ? [PLUG.kv('Separate deliveries', fmt(sample.splitFee)), PLUG.kv('One Delivery', fmt(sample.combined.deliveryFee + sample.combined.consolidation)), PLUG.kv('You save', fmt(sample.combined.savings), 'tot')] : PLUG.notice(sample.reasons.join(' '), 'warn'),
          p({ class: 'small muted' }, 'Sample map and prices for illustration. Distances use straight-line estimates with a road factor, not live traffic.'),
          button({ class: 'btn pri block', onclick: demo }, 'Try it with a sample basket')))));
  };

  /* ---------- Basket ---------- */
  pages.basket = () => {
    const lines = S.basket.lines, bookings = S.basket.bookings, v = PLUG.view(), t = v.totals, plan = v.plan;
    if (!lines.length && !bookings.length) return PLUG.empty('Your basket is empty', 'Add food, groceries or personal essentials from different places and we will plan one delivery.', [PLUG.lnk('/eats', 'btn pri', 'Browse Eats'), PLUG.lnk('/market', 'btn ghost', 'Browse Market'), PLUG.lnk('/one', 'btn ghost', 'How One Delivery works')]);
    const groups = Object.keys(t.bySub);
    return div({ class: 'two' },
      div(
        groups.map(mid => { const m = M()[mid]; return div({ class: 'card', style: 'margin-bottom:16px' },
          div({ class: 'row between' }, h3(m.name), PLUG.statusPill(m)), PLUG.confirmBar(m),
          lines.filter(l => l.merchantId === mid).map(l => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'nm' }, l.sensitive ? l.name + ' (discreet)' : l.name), l.extras.length ? div({ class: 'small muted' }, l.extras.join(', ')) : null, l.note ? div({ class: 'small muted' }, 'Note: ' + l.note) : null, l.restricted ? PLUG.pill('Age ' + l.restricted, 'warn') : null),
            PLUG.qtyCtl(l.qty, (q) => PLUG.setQty(l.key, q), l.name), div({ class: 'price', style: 'min-width:70px;text-align:right' }, fmt(l.price * l.qty)))),
          m.state === 'closed' && !S.confirmed[mid] ? PLUG.notice('This will be scheduled for when ' + m.name + ' opens (' + (m.opens || 'later') + ').', 'warn') : null); }),
        bookings.length ? div({ class: 'card', style: 'margin-bottom:16px' }, h3('Bookings and requests'), bookings.map(b => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'nm' }, b.title), div({ class: 'small muted' }, b.sub)), div({ class: 'price' }, fmt(b.price)), button({ class: 'btn sm sec2', 'aria-label': 'Remove ' + b.title, onclick: () => PLUG.removeBooking(b.key) }, ico('trash', 15))))) : null,
        plan ? PLUG.deliveryChooser(plan, v) : null),
      div({ class: 'sticky' }, PLUG.summaryCard(v, true)));
  };
  PLUG.deliveryChooser = (plan, v) => {
    if (plan.intercity) return PLUG.intercityCard(plan);
    if (plan.mids.length < 2) return div({ class: 'card' }, h3('Delivery'), PLUG.kv('Single delivery', fmt(plan.splitFee)), p({ class: 'small muted' }, 'About ' + plan.splitEta + ' minutes (estimate).'));
    const c = plan.combined, ok = plan.feasible;
    return div({ class: 'card', style: 'margin-bottom:16px' }, h3('One Delivery'),
      plan.mids.length > 1 ? PLUG.routeMap(plan, v.mode) : null,
      !ok && c ? PLUG.notice(['We can’t combine these. ', plan.reasons.join(' ')], 'warn') : null,
      PLUG.optcard({ k: 'mode-c', group: 'mode', on: v.mode === 'combined', disabled: !ok, title: 'One rider, one trip', sub: ok ? 'Route: ' + c.route.map(id => M()[id].name).join(' → ') + ' → you. About ' + c.eta + ' min. Rider leaves at about +' + c.depart + ' min so nobody waits. You save ' + fmt(c.savings) + '.' : 'Not available for this basket.', right: ok ? fmt(c.deliveryFee + c.consolidation + (c.fee - c.deliveryFee)) : '', pick: () => { S.mode = 'combined'; PLUG.set(); } }),
      PLUG.optcard({ k: 'mode-s', group: 'mode', on: v.mode !== 'combined', title: 'Separate deliveries', sub: plan.mids.length + ' riders, arrivals within about ' + plan.splitEta + ' min.' + (plan.separate.some(x => x.bulky) ? ' Large items always travel separately.' : ''), right: fmt(plan.splitFee), pick: () => { S.mode = 'split'; PLUG.set(); } }),
      plan.notes.map(n => p({ class: 'small muted', style: 'margin:4px 0' }, n)));
  };
  PLUG.summaryCard = (v, toCheckout) => {
    const t = v.totals;
    return div({ class: 'card' }, h3('Summary'),
      t.items ? PLUG.kv('Items', fmt(t.items)) : null,
      t.items ? PLUG.kv(v.plan && v.plan.intercity ? 'Parcel to ' + v.plan.dest.name : t.mode === 'combined' ? 'Delivery (One Delivery)' : 'Delivery', fmt(t.delivery)) : null,
      t.consolidation ? PLUG.kv('Consolidation fee', fmt(t.consolidation)) : null,
      t.bookings ? PLUG.kv('Bookings', fmt(t.bookings)) : null,
      t.tip ? PLUG.kv('Courier tip', fmt(t.tip)) : null,
      t.discount ? PLUG.kv('Promo', '-' + fmt(t.discount)) : null,
      PLUG.kv('Total', fmt(t.total), 'tot'),
      t.items ? p({ class: 'small muted' }, 'Service fee and tax: ' + fmt(t.service + t.tax) + ' (none charged in this sample). ' + (v.plan && v.plan.intercity ? 'Parcel arrives in ' + v.plan.cfg.eta + '.' : 'Delivery about ' + t.eta + ' min (estimate).')) : null,
      toCheckout ? [
        t.items ? [h4({ style: 'margin:12px 0 6px;font-size:14px' }, 'Courier tip (optional)'), PLUG.chipRow(PLUG.CONFIG.tipOptions.map(x => x + '%'), S.tip + '%', (c) => { S.tip = parseInt(c, 10); PLUG.set(); }),
          h('div', { style: 'height:12px' }),
          h('div', { class: 'row', style: 'flex-wrap:nowrap;gap:8px' }, h('div', { class: 'grow' }, PLUG.in('basket', S, 'promo', { bare: true, cls: 'in-box', ph: 'Promo code' })), button({ class: 'btn sec2', onclick: PLUG.applyPromo }, 'Apply')),
          S.promoApplied ? p({ class: 'small', style: 'color:var(--acc);margin-top:6px' }, 'Applied: ' + PLUG.CONFIG.promos[S.promo.trim().toUpperCase()].label) : p({ class: 'small muted', style: 'margin-top:6px' }, 'First order? Try WELCOME.')] : null,
        h('div', { style: 'height:14px' }), PLUG.lnk('/checkout', 'btn pri block', 'Continue to checkout', ico('arrow', 18))] : null);
  };

  /* ---------- Checkout ---------- */
  pages.checkout = () => {
    const v = PLUG.view(), t = v.totals, a = PLUG.currentAddress(), hasLines = S.basket.lines.length > 0, hasBk = S.basket.bookings.length > 0;
    if (!hasLines && !hasBk) return PLUG.empty('Nothing to check out', 'Your basket is empty.', PLUG.lnk('/eats', 'btn pri', 'Browse Eats'));
    const zone = PLUG.ZONES.find(z => z.id === a.zone), outside = hasLines && !zone.pilot && !zone.intercity, spoils = zone.intercity ? S.basket.lines.filter(l => l.perishable) : [];
    const sensitive = S.basket.lines.some(l => l.sensitive), restricted = S.basket.lines.some(l => l.restricted);
    const place = () => {
      if (outside) { S.checkoutError = zone.name + ' is outside the pilot delivery area, so we cannot take this order yet.'; PLUG.set(); return; }
      if (spoils.length) { S.checkoutError = spoils.map(l => l.name).join(', ') + ' would spoil on the way to ' + zone.name + '. Remove ' + (spoils.length > 1 ? 'them' : 'it') + ' or use a Freetown address.'; PLUG.set(); return; }
      PLUG.requireAuth(() => { const e = PLUG.checkout(); if (e) PLUG.nav('/orders/' + e.id); });
    };
    const methods = [['cod', 'Cash on delivery', 'Pay the courier. Limit ' + fmt(PLUG.CONFIG.codLimitNewAccount) + ' for new accounts. Not for bookings.', true],
      ['demo', 'Demo test payment', 'Prototype only. Choose a result below to see how success, failure and cancel behave. No money moves.', true],
      ['momo', 'Mobile money', 'Not yet integrated. Needs a payment provider agreement.', false],
      ['card', 'Bank card', 'Not yet integrated. Needs a payment provider agreement.', false]];
    return div({ class: 'two' },
      div(
        hasLines ? div({ class: 'card', style: 'margin-bottom:16px' }, h3('Delivery address'),
          PLUG.sel('co', a, 'zone', PLUG.ZONES.map(z => [z.id, PLUG.zoneLabel(z)]), { label: 'Area' }),
          outside ? PLUG.notice('We are not delivering in ' + zone.name + ' yet. Choose an area marked as pilot.', 'bad') : null,
          PLUG.in('co', a, 'landmark', { label: 'Landmark or directions', ph: 'Opposite the blue gate, near the junction...', hint: 'Many addresses have no street name, so a landmark helps the courier find you.', err: S.checkoutError.includes('landmark') ? S.checkoutError : '' }),
          PLUG.in('co', a, 'phone', { label: 'Phone number the courier can call', type: 'tel', ph: '+232 ...', err: S.checkoutError.includes('phone') ? S.checkoutError : '' }),
          PLUG.in('co', a, 'note', { label: 'Note for the courier (optional)', area: true, rows: 2 })) : null,
        sensitive ? PLUG.notice('Personal essentials are packed in a sealed, plain bag. Notifications and the order list show neutral wording' + (S.settings.hideSensitive ? '.' : ' only if you turn on “Hide sensitive wording” in Account.'), '', 'lock') : null,
        restricted ? div({ class: 'card', style: 'margin-bottom:16px' }, PLUG.chk('co', S, 'ageOk', 'I am 18 or over. The courier may check ID and will not hand over age-restricted items without it.')) : null,
        div({ class: 'card', style: 'margin-bottom:16px' }, h3('Payment'), methods.map(m => PLUG.optcard({ k: 'pay-' + m[0], group: 'pay', on: S.payment === m[0], disabled: !m[3], title: m[1] + (m[3] ? '' : ' (not yet connected)'), sub: m[2], pick: () => { S.payment = m[0]; PLUG.set(); } })),
          S.payment === 'demo' ? PLUG.sel('co', S, 'demoOutcome', [['success', 'Demo result: success'], ['failure', 'Demo result: payment fails'], ['cancel', 'Demo result: I cancel']], { label: 'What should the test payment do?' }) : null),
        S.basket.lines.some(l => M()[l.merchantId].state === 'closed') ? PLUG.notice('One or more places are closed right now. Those items will be scheduled for the next opening and you can cancel for free before they are accepted.', 'warn', 'clock') : null),
      div({ class: 'sticky' }, PLUG.summaryCard(v, false),
        S.checkoutError && !/landmark|phone/.test(S.checkoutError) ? h('div', { style: 'margin-top:12px' }, PLUG.notice(S.checkoutError, 'bad')) : null,
        h('div', { style: 'height:12px' }), button({ class: 'btn pri block', onclick: place }, S.payment === 'cod' ? 'Place order, pay on delivery' : 'Pay ' + fmt(t.total) + ' (demo)'),
        p({ class: 'small muted', style: 'margin-top:10px' }, 'No real payment is taken. Signing in uses the demo code 123456.')));
  };
})(typeof window !== 'undefined' ? window : globalThis);
