/* THE PLUG v2 look: the founders' layout reference (neon on near-black) and the round badge logo.
   Overrides the home page, adds live tracking, and shared brand pieces. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, h = PLUG.h, ico = PLUG.ico, fmt = PLUG.fmt;
  const { div, span, p, button, h1, h2, h3, h4, strong, img } = PLUG;
  const pages = PLUG.pages;
  const NS = 'http://www.w3.org/2000/svg';
  const gap = (n) => h('div', { style: 'height:' + (n || 14) + 'px' });

  PLUG.logo = (cls) => img({ class: cls || 'logo', src: PLUG.ASSETS.badgeSm, alt: 'THE PLUG. One App. Every Need.' });
  PLUG.badge = (cls) => img({ class: cls || 'badgebig', src: PLUG.ASSETS.badge, alt: 'THE PLUG. One App. Every Need.' });
  PLUG.wordmark = (cls) => img({ class: cls || 'wordmark', src: PLUG.ASSETS.wordmark, alt: 'THE PLUG' });

  Object.assign(PLUG.LANG.en, { heroA: 'One App.', heroB: 'Every Need.' }); Object.assign(PLUG.LANG.kri, { heroA: 'Wan App.', heroB: 'Ɛvri Nid.' });
  // service names and lines from the layout reference
  const LINES = { eats: 'Restaurants & more', shop: 'Every seller, one search', market: 'Groceries & shops', events: 'What’s on & tickets', stays: 'Hotels & apartments', errands: 'Pickups & tasks', ride: 'Cars & transport', travel: 'Packages & transfers', care: 'Pharmacy & essentials', studio: 'Printing & creative', one: 'Multiple stores' };
  PLUG.SERVICES.forEach(s => { if (LINES[s.id]) s.blurb = LINES[s.id]; });
  const ORDER = ['eats', 'market', 'errands', 'ride', 'one', 'care', 'studio', 'stays', 'travel', 'shop', 'events'];
  PLUG.SERVICES.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

  // light-trail road, the motif from the splash screen
  PLUG.road = (cls) => {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 800 300'); s.setAttribute('preserveAspectRatio', 'none'); s.setAttribute('class', cls || 'road'); s.setAttribute('aria-hidden', 'true');
    let g = '<defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B6FB05" stop-opacity="0"/><stop offset="1" stop-color="#B6FB05" stop-opacity=".9"/></linearGradient></defs>';
    [-360, -200, -60, 60, 200, 360].forEach((dx, i) => { g += '<path d="M400 0 L ' + (400 + dx * 2.2) + ' 300" stroke="url(#rg)" stroke-width="' + (i === 2 || i === 3 ? 3 : 1.5) + '" fill="none"/>'; });
    g += '<path d="M400 0 C 380 120, 250 220, 120 300" stroke="url(#rg)" stroke-width="5" fill="none" opacity=".8"/><path d="M400 0 C 420 120, 560 220, 690 300" stroke="url(#rg)" stroke-width="5" fill="none" opacity=".8"/>';
    s.innerHTML = g; return s;
  };

  /* ---------- Home (website), following panel 01 of the reference ---------- */
  pages.home = () => {
    const a = PLUG.currentAddress(), f = PLUG.form('hero', { q: '' });
    const go = () => { S.search = { q: f.q, cat: 'All' }; PLUG.nav('/search'); };
    const wl = PLUG.form('wl', { contact: '' });
    const feat = [['Royal Bites', 'Rice dishes and burgers', 'food', 'food', '/eats/r1'], ['FreshMart', 'Staples, drinks and household', 'market', 'cart', '/market'], ['Vista Luxury Apartments', 'Apartment in Lumley', 'stay', 'bed', '/stays/st2'], ['Island Escape', '5-day package, request only', 'travel', 'plane', '/travel']];
    const soon = PLUG.allEvents ? PLUG.allEvents().filter(e => (e.status === 'approved') && PLUG.eventDate(e) >= S.today).sort((x, y) => PLUG.eventDate(x).localeCompare(PLUG.eventDate(y))).slice(0, 3) : [];
    return div(
      h('section', { class: 'hero2 dark' }, PLUG.road(), div({ class: 'wrap' },
        div({ class: 'herocopy' }, div({ class: 'eyebrow' }, 'Sierra Leone first · Pilot in Freetown'),
          h1(PLUG.t('heroA'), h('br'), span({ class: 'lime' }, PLUG.t('heroB'))),
          p({ class: 'lead' }, 'Food. Stays. Travel. Shopping. Errands. Transport. Pharmacy. Creative services.'),
          div({ class: 'locpill' }, ico('pin', 18), span({ class: 'small' }, 'Deliver to'), PLUG.sel('hero', a, 'zone', PLUG.ZONES.map(z => [z.id, PLUG.zoneLabel(z) + ', Sierra Leone']), { bare: true })),
          div({ class: 'search2', role: 'search' }, ico('search', 18), PLUG.in('hero', f, 'q', { bare: true, ph: 'What do you need today?' }), button({ class: 'roundgo', 'aria-label': 'Search', onclick: go }, ico('search', 20))),
          div({ class: 'row', style: 'margin-top:20px' }, PLUG.lnk('/app', 'btn pri', 'Get started', ico('arrow', 18)), PLUG.lnk('/one', 'btn ghost', 'See how it works'))),
        div({ class: 'heroart2', 'aria-hidden': 'true' }, PLUG.badge(),
          div({ class: 'float', style: 'left:-2%;top:14%' }, ico('food', 18, 'ic'), 'Eats'), div({ class: 'float', style: 'right:-4%;top:26%' }, ico('bed', 18, 'ic'), 'Stays'),
          div({ class: 'float', style: 'left:2%;bottom:16%' }, ico('errand', 18, 'ic'), 'Errands'), div({ class: 'float', style: 'right:0;bottom:6%' }, ico('box', 18, 'ic'), '3 pickups, 1 rider (sample)')))),
      h('section', { class: 'dark sec', id: 'services' }, div({ class: 'wrap' },
        div({ class: 'row between', style: 'margin-bottom:18px' }, h2({ style: 'margin:0' }, 'Explore Our Services'), PLUG.lnk('/about', 'link', 'All services')),
        div({ class: 'tiles' }, PLUG.SERVICES.map(s => PLUG.lnk(s.route, 'tile', div({ class: 'ic' }, ico(s.icon, 30)), span(s.name), span({ class: 'small' }, s.blurb))).concat([PLUG.lnk('/map', 'tile', div({ class: 'ic' }, ico('map', 30)), span('Map'), span({ class: 'small' }, 'Pins & landmarks'))])),
        gap(26),
        div({ class: 'banner onebanner' }, div({ style: 'max-width:520px;position:relative' }, div({ class: 'eyebrow' }, 'THE PLUG One Delivery'), h3('Multiple orders. One pickup. One delivery.'),
            p({ class: 'muted' }, 'Add food, groceries and essentials from different places. When the route works we combine them into one trip and show the saving. When it doesn’t, we say why.'),
            div({ class: 'row' }, PLUG.lnk('/one', 'btn pri', 'Learn more'), PLUG.lnk('/basket', 'btn ghost', 'Open basket'))),
          h('div', { style: 'flex:1 1 280px;max-width:380px;position:relative' }, PLUG.routeMap(PLUG.planDelivery([{ merchantId: 'r1', price: 1 }, { merchantId: 's1', price: 1 }, { merchantId: 'p1', price: 1 }], PLUG.ZONES[1]), 'combined'))),
        gap(22),
        div({ class: 'truststrip' }, [['bolt', 'Fast', 'One rider for many shops'], ['lock', 'Secure', 'Prices shown before you pay'], ['shield', 'Reliable', 'Honest status, no guesses'], ['clock', 'Requests 24/7', 'Hours shown per service']].map(x => div({ class: 'tsi' }, ico(x[0], 22), div(strong(x[1]), span({ class: 'small' }, x[2]))))))),
      h('section', { class: 'paper sec' }, div({ class: 'wrap' },
        div({ class: 'row between', style: 'margin-bottom:6px' }, h2({ style: 'margin:0' }, 'Popular right now'), PLUG.lnk('/shop', 'link', 'See all')),
        p({ class: 'muted', style: 'margin-bottom:18px' }, 'Sample listings. Ratings appear only after real customers review a place.'),
        div({ class: 'grid g4' }, feat.map(x => PLUG.lnk(x[4], 'lcard', PLUG.Photo(x[2], x[3]), div({ class: 'body' }, span({ class: 'nm' }, x[0]), span({ class: 'small muted' }, x[1]), span({ class: 'pill mute', style: 'align-self:flex-start' }, 'New · no reviews yet'))))))),
      soon.length ? h('section', { class: 'dark sec' }, div({ class: 'wrap' },
        div({ class: 'row between', style: 'margin-bottom:18px' }, h2({ style: 'margin:0' }, 'What’s on this week'), PLUG.lnk('/events', 'link', 'Full calendar')),
        div({ class: 'grid g3' }, soon.map(e => PLUG.lnk('/events/' + e.id, 'lcard', PLUG.Photo('studio', 'calendar'), div({ class: 'body' }, span({ class: 'nm' }, e.title), span({ class: 'small muted' }, e.time + ' · ' + e.venue), e.pick ? PLUG.pill('THE PLUG pick', '', 'bolt') : null)))))) : null,
      h('section', { class: 'paper sec' }, div({ class: 'wrap' },
        h2({ style: 'margin-bottom:18px' }, 'How it works'),
        div({ class: 'grid g4' }, [['search', 'Choose', 'Pick what you need from one or many places.'], ['receipt', 'See the price', 'Delivery, fees and total are shown before you pay.'], ['route', 'We plan the trip', 'Combined when it helps, separate when it is better.'], ['check', 'Track it', 'Live status from pickup to your door.']].map((x, i) => div({ class: 'card' }, div({ class: 'row', style: 'margin-bottom:8px' }, span({ class: 'stepnum' }, i + 1), ico(x[0], 22)), h4({ style: 'font-size:17px;margin-bottom:4px' }, x[1]), p({ class: 'small muted', style: 'margin:0' }, x[2])))))),
      h('section', { class: 'dark sec' }, div({ class: 'wrap' }, h2({ style: 'margin-bottom:8px' }, 'Night Plug: hours we can stand behind'), p({ class: 'muted', style: 'max-width:64ch;margin-bottom:18px' }, PLUG.TIER_NOTE), PLUG.tierBlock())),
      h('section', { class: 'dark sec', style: 'padding-top:0' }, div({ class: 'wrap' }, div({ class: 'banner appbanner' },
        div({ class: 'row', style: 'flex-wrap:nowrap;gap:18px' }, PLUG.logo('logo big'), div(h3('More than an app. Sierra Leone & beyond.'), p({ class: 'muted', style: 'margin:0' }, 'Store listings are not live yet. Try the working prototype, or leave a contact to hear when the apps launch. Nothing is sent in this demo.'))),
        div({ class: 'row' }, PLUG.lnk('/app', 'btn pri', 'Try the app'), h('div', { class: 'row', style: 'flex-wrap:nowrap' }, div({ style: 'width:190px' }, PLUG.in('wl', wl, 'contact', { bare: true, cls: 'in-box', ph: 'Phone or email' })), button({ class: 'btn ghost', onclick: () => { if (wl.contact.trim()) { PLUG.joinWaitlist('app', wl.contact.trim()); wl.contact = ''; } else PLUG.toast('Add a phone or email first', 'warn'); } }, 'Notify me')))))));
  };

  /* ---------- live tracking (reference panel "Live Tracking") ---------- */
  const seeded = (seed) => { let x = 7; for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };
  const stageOf = (e) => {
    if (e.type === 'order') return e.idx >= 5 ? 3 : e.idx >= 4 ? 2 : 0;
    if (e.type === 'ride') return [0, 1, 1, 2, 3][e.idx] || 0;
    if (e.type === 'errand') return [0, 0, 1, 2, 3][e.idx] || 0;
    return 0;
  };
  function trackMap(e, frac) {
    const r = seeded(e.id), W = 360, H = 200; let g = '<rect width="' + W + '" height="' + H + '" rx="14" fill="#060D08"/>';
    for (let i = 0; i < 7; i++) { const y = 15 + r() * 170; g += '<path d="M0 ' + y.toFixed(0) + ' L ' + W + ' ' + (y + (r() - .5) * 60).toFixed(0) + '" stroke="rgba(255,255,255,.07)" stroke-width="' + (2 + r() * 4).toFixed(1) + '"/>'; }
    for (let i = 0; i < 6; i++) { const x = 20 + r() * 320; g += '<path d="M' + x.toFixed(0) + ' 0 L ' + (x + (r() - .5) * 80).toFixed(0) + ' ' + H + '" stroke="rgba(255,255,255,.06)" stroke-width="' + (2 + r() * 3).toFixed(1) + '"/>'; }
    const pts = [[40, 150 + r() * 30]]; for (let i = 1; i < 5; i++) pts.push([40 + i * 70, 30 + r() * 140]); pts.push([320, 30 + r() * 40]);
    const segs = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); tot += d; }
    let want = tot * frac, mx = pts[0][0], my = pts[0][1];
    for (let i = 0; i < segs.length; i++) { if (want <= segs[i]) { const t = segs[i] ? want / segs[i] : 0; mx = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t; my = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t; break; } want -= segs[i]; mx = pts[i + 1][0]; my = pts[i + 1][1]; }
    const line = pts.map(q => q[0].toFixed(0) + ',' + q[1].toFixed(0)).join(' ');
    g += '<polyline points="' + line + '" fill="none" stroke="#B6FB05" stroke-width="9" stroke-opacity=".18" stroke-linejoin="round"/><polyline points="' + line + '" fill="none" stroke="#B6FB05" stroke-width="3.5" stroke-linejoin="round"/>';
    g += '<circle cx="' + pts[0][0] + '" cy="' + pts[0][1].toFixed(0) + '" r="7" fill="#B6FB05" stroke="#060D08" stroke-width="3"/>';
    const end = pts[pts.length - 1]; g += '<g transform="translate(' + end[0] + ' ' + end[1].toFixed(0) + ')"><path d="M0 0 C -8 -10 -10 -14 -10 -19 A 10 10 0 0 1 10 -19 C 10 -14 8 -10 0 0 Z" fill="#fff"/><circle cy="-19" r="3.5" fill="#060D08"/></g>';
    if (frac > 0) g += '<circle cx="' + mx.toFixed(0) + '" cy="' + my.toFixed(0) + '" r="12" fill="#B6FB05" opacity=".25"/><circle cx="' + mx.toFixed(0) + '" cy="' + my.toFixed(0) + '" r="7" fill="#fff" stroke="#B6FB05" stroke-width="3"/>';
    g += '<text x="' + (W - 10) + '" y="' + (H - 10) + '" text-anchor="end" fill="#7C8E81" font-size="10" font-family="DM Sans,sans-serif">Sample map. Live GPS not connected.</text>';
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 ' + W + ' ' + H); s.setAttribute('class', 'trackmap'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', 'Sample tracking map. Progress ' + Math.round(frac * 100) + ' percent.'); s.innerHTML = g; return s;
  }
  PLUG.trackCard = (e) => {
    if (e.cancelled || !['order', 'ride', 'errand'].includes(e.type)) return null;
    const cfg = { order: { who: 'Sample rider', role: 'Courier · motorbike', labels: ['Picked up', 'On the way', 'Arriving'], wait: 'Tracking starts when the rider collects your order.' }, ride: { who: 'Sample driver', role: (e.data && e.data.vehicleName) || 'Driver', labels: ['Driver on the way', 'Trip started', 'Arrived'], wait: 'Waiting for a driver to accept.' }, errand: { who: 'Sample runner', role: 'Errand Runner', labels: ['Started', 'In progress', 'Completed'], wait: 'A runner appears here once one accepts.' } }[e.type];
    const st = stageOf(e), frac = st / 3, msg = (t) => () => PLUG.toast(t + ' is not connected in this prototype', 'warn');
    return div({ class: 'card trackcard' },
      div({ class: 'row between', style: 'margin-bottom:10px' }, h3({ style: 'margin:0' }, e.type === 'errand' ? 'Errand Runner' : 'Live tracking'), st > 0 && st < 3 ? PLUG.pill('Live (demo)', '', 'bolt') : st === 3 ? PLUG.pill('Done', 'mute') : PLUG.pill('Waiting', 'warn')),
      trackMap(e, frac),
      st === 0 ? p({ class: 'small muted', style: 'margin:10px 0 0' }, cfg.wait)
        : div({ class: 'driver' }, div({ class: 'davatar', 'aria-hidden': 'true' }, cfg.who.split(' ').map(w => w[0].toUpperCase()).join('')), div({ class: 'grow' }, strong(cfg.who), div({ class: 'small muted' }, cfg.role + ' · New, no ratings yet')),
          button({ class: 'btn sm ghost', onclick: msg('Calling') }, ico('phone', 15), 'Call'), button({ class: 'btn sm ghost', onclick: msg('Messaging') }, ico('message', 15), e.type === 'errand' ? 'Contact' : 'Message')),
      div({ class: 'tprog', role: 'list' }, cfg.labels.map((l, i) => div({ class: 'tp' + (st > i ? ' on' : ''), role: 'listitem' }, span({ class: 'tdot' }, st > i ? ico('check', 12) : null), span(l)))));
  };
})(typeof window !== 'undefined' ? window : globalThis);
