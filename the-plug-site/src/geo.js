/* THE PLUG geography: Freetown first, parcels to other towns, the landmark map,
   and the proposed DA HOOD partnership page. Fees and places are SAMPLES. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, h = PLUG.h, ico = PLUG.ico, fmt = PLUG.fmt;
  const { div, span, p, button, h2, h3, h4, strong, ul, li } = PLUG;
  const pages = PLUG.pages;
  const gap = (n) => h('div', { style: 'height:' + (n || 14) + 'px' });
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- towns outside Freetown: parcel only ---------- */
  PLUG.CONFIG.intercity = {
    bo: { fee: 150, eta: '1 to 2 days', point: 'Bo agent pickup point (sample)' },
    makeni: { fee: 170, eta: '1 to 2 days', point: 'Makeni agent pickup point (sample)' },
    bonthe: { fee: 260, eta: '2 to 4 days, depends on boat times', point: 'Bonthe jetty agent (sample)' }
  };
  PLUG.ZONES.push({ id: 'bo', name: 'Bo', x: 40, y: 30, pilot: false, intercity: true }, { id: 'makeni', name: 'Makeni', x: 40, y: -20, pilot: false, intercity: true }, { id: 'bonthe', name: 'Bonthe', x: 30, y: 45, pilot: false, intercity: true });
  PLUG.zoneLabel = (z) => z.intercity ? z.name + ' (parcel only)' : z.pilot ? z.name : z.name + ' (outside pilot)';
  Object.values(PLUG.ITEMS).forEach(i => { if (i.cat === 'Fresh') i.perishable = true; });

  const basePlan = PLUG.planDelivery;
  PLUG.planDelivery = (lines, dest) => {
    if (!dest || !dest.intercity) return basePlan(lines, dest);
    const mids = []; (lines || []).forEach(l => { if (!mids.includes(l.merchantId)) mids.push(l.merchantId); });
    if (!mids.length) return null;
    const cfg = PLUG.CONFIG.intercity[dest.id];
    return { mids, normalIds: mids, bulkyIds: [], separate: [], splitFee: cfg.fee, splitEta: 0, combined: null, feasible: false, reasons: [], recommended: 'single', dest, intercity: true, cfg, notes: ['Everything is packed together in Freetown and sent as one parcel to ' + cfg.point + '.'] };
  };
  // use the customer's dropped pin when they have one
  const baseDest = PLUG.destination;
  PLUG.destination = () => { const z = baseDest(), a = PLUG.currentAddress(); return a.pin && !z.intercity ? Object.assign({}, z, { x: a.pin.x, y: a.pin.y }) : z; };
  PLUG.intercityCard = (plan) => {
    const bad = S.basket.lines.filter(l => l.perishable);
    return div({ class: 'card', style: 'margin-bottom:16px' }, h3('Parcel to ' + plan.dest.name),
      PLUG.kv('Parcel delivery', fmt(plan.cfg.fee)), PLUG.kv('Arrives', plan.cfg.eta), PLUG.kv('Collect from', plan.cfg.point),
      bad.length ? PLUG.notice(['These spoil on a long trip and can only go to Freetown addresses: ', bad.map(l => l.name).join(', '), '. Remove them or change your address.'], 'bad', 'leaf') : PLUG.notice('Everything in your basket lasts the journey.', '', 'check'),
      p({ class: 'small muted', style: 'margin:0' }, 'Parcels travel with a transport partner (not signed yet). Sample fees.'));
  };

  /* ---------- the landmark map ---------- */
  PLUG.LANDMARKS = [{ n: 'Roundabout, Lumley (sample)', x: 1.1, y: 3.3, zone: 'lumley' }, { n: 'Bridge, Aberdeen (sample)', x: 2.1, y: 1.3, zone: 'aberdeen' }, { n: 'Junction on Wilkinson Road (sample)', x: 3.0, y: 3.5, zone: 'wilkinson' }, { n: 'Market, Kissy (sample)', x: 8.0, y: 2.6, zone: 'kissy' }];
  const B = { x0: -2.5, x1: 9.2, y0: -3.8, y1: 5.8 }, W = 600, H = 420;
  const sx = (x) => 20 + (x - B.x0) / (B.x1 - B.x0) * (W - 40), sy = (y) => 20 + (y - B.y0) / (B.y1 - B.y0) * (H - 40);
  const ux = (px) => B.x0 + (px - 20) / (W - 40) * (B.x1 - B.x0), uy = (py) => B.y0 + (py - 20) / (H - 40) * (B.y1 - B.y0);
  const nearestZone = (x, y) => PLUG.ZONES.filter(z => !z.intercity).reduce((b, z) => (Math.hypot(z.x - x, z.y - y) < Math.hypot(b.x - x, b.y - y) ? z : b));
  function mapSvg() {
    const a = PLUG.currentAddress(), you = a.pin || PLUG.ZONES.find(z => z.id === a.zone) || PLUG.ZONES[1];
    let g = '<rect width="' + W + '" height="' + H + '" rx="16" fill="#0A1A24"/>';
    g += '<path d="M' + sx(-2.2) + ' ' + sy(5.5) + ' C ' + sx(-2.4) + ' ' + sy(1) + ', ' + sx(-1) + ' ' + sy(-3.6) + ', ' + sx(1.5) + ' ' + sy(-3.4) + ' S ' + sx(5) + ' ' + sy(0.6) + ', ' + sx(9) + ' ' + sy(1.2) + ' L ' + sx(9.2) + ' ' + sy(5.8) + ' Z" fill="#14261A" stroke="rgba(182,251,5,.35)" stroke-width="1.5"/>';
    g += '<g stroke="rgba(255,255,255,.08)" stroke-width="3" fill="none"><path d="M' + sx(-1.5) + ' ' + sy(-3) + ' Q ' + sx(0.5) + ' ' + sy(1.5) + ' ' + sx(2) + ' ' + sy(1) + ' T ' + sx(3.2) + ' ' + sy(3.6) + ' T ' + sx(8.2) + ' ' + sy(2.5) + '"/><path d="M' + sx(1) + ' ' + sy(3.5) + ' L ' + sx(5) + ' ' + sy(5) + '"/></g>';
    PLUG.ZONES.filter(z => !z.intercity).forEach(z => { g += '<circle cx="' + sx(z.x) + '" cy="' + sy(z.y) + '" r="' + (z.pilot ? 26 : 20) + '" fill="' + (z.pilot ? 'rgba(182,251,5,.16)' : 'rgba(255,255,255,.05)') + '" stroke="' + (z.pilot ? 'rgba(182,251,5,.6)' : 'rgba(255,255,255,.2)') + '" stroke-dasharray="' + (z.pilot ? '' : '4 4') + '"/><text x="' + sx(z.x) + '" y="' + (sy(z.y) - 30) + '" text-anchor="middle" fill="' + (z.pilot ? '#D9FF7A' : '#A3B5A8') + '" font-size="12" font-family="DM Sans,sans-serif" font-weight="700">' + z.name + '</text>'; });
    Object.values(PLUG.MERCH).forEach(m => { g += '<circle cx="' + sx(m.x) + '" cy="' + sy(m.y) + '" r="3.5" fill="' + (m.kind === 'restaurant' ? '#F5B83D' : m.kind === 'seller' ? '#7CC6FF' : '#B6FB05') + '" opacity=".9"/>'; });
    PLUG.LANDMARKS.forEach(l => { g += '<rect x="' + (sx(l.x) - 4) + '" y="' + (sy(l.y) - 4) + '" width="8" height="8" transform="rotate(45 ' + sx(l.x) + ' ' + sy(l.y) + ')" fill="#fff" opacity=".7"/>'; });
    g += '<g transform="translate(' + sx(you.x) + ' ' + sy(you.y) + ')"><path d="M0 0 C -9 -12 -11 -16 -11 -21 A 11 11 0 0 1 11 -21 C 11 -16 9 -12 0 0 Z" fill="#fff" stroke="#050806" stroke-width="2"/><circle cy="-21" r="4" fill="#050806"/></g>';
    g += '<text x="' + (W - 16) + '" y="' + (H - 14) + '" text-anchor="end" fill="#7C8E81" font-size="11" font-family="DM Sans,sans-serif">Schematic sample, not to scale. Tap to drop your pin.</text>';
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 ' + W + ' ' + H); s.setAttribute('class', 'diagram mapsvg'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', 'Schematic map of Freetown areas with your delivery pin. Pilot areas are highlighted.'); s.innerHTML = g;
    s.addEventListener('click', (ev) => { const r = s.getBoundingClientRect(), x = ux((ev.clientX - r.left) / r.width * W), y = uy((ev.clientY - r.top) / r.height * H); const z = nearestZone(x, y); a.pin = { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }; a.zone = z.id; PLUG.toast('Pin dropped in ' + z.name); PLUG.set(); });
    return s;
  }
  pages.map = () => {
    const a = PLUG.currentAddress(), z = PLUG.ZONES.find(x => x.id === a.zone);
    return div({ class: 'two' },
      div(div({ class: 'mapwrap' }, mapSvg()),
        div({ class: 'row', style: 'gap:14px;margin-top:10px' }, [['#B6FB05', 'Pilot area'], ['#F5B83D', 'Restaurant'], ['#7CC6FF', 'Seller'], ['#ffffff', 'Landmark']].map(k => span({ class: 'small muted', style: 'display:inline-flex;align-items:center;gap:6px' }, span({ class: 'dot', style: 'color:' + k[0] }), k[1]))),
        gap(18), h3({ style: 'margin-bottom:10px' }, 'The map plan'),
        div({ class: 'grid g3' }, [['Phase 1 · now', 'Landmarks and pins', 'A 2D map with landmarks and pins, because most addresses have no street name. This screen is a schematic sample of it.', ''], ['Phase 2', '360° street photos', 'Main roads first, captured by cameras on kekes over time. Faces and plates blurred. Our own photos, not copied.', 'mute'], ['Phase 3', '3D key areas', 'Downtown, Lumley and Aberdeen by drone, with permits. A low-data mode, because 3D is heavy.', 'mute']].map(x => div({ class: 'card' }, PLUG.pill(x[0], x[3]), h4({ style: 'margin:8px 0 4px' }, x[1]), p({ class: 'small muted', style: 'margin:0' }, x[2]))))),
      div({ class: 'sticky' }, div({ class: 'card' }, h3('Your delivery spot'),
        PLUG.kv('Area', z.name + (z.pilot ? '' : z.intercity ? ' (parcel only)' : ' (outside pilot)')), PLUG.kv('Pin', a.pin ? 'Dropped on map' : 'Area centre'),
        PLUG.in('map', a, 'landmark', { label: 'Landmark or directions', ph: 'Blue gate opposite the shop...' }),
        h4({ style: 'font-size:14px;margin:6px 0' }, 'Nearby landmarks (sample)'), div({ class: 'stack', style: 'gap:6px' }, PLUG.LANDMARKS.map(l => button({ class: 'btn sec2 sm', style: 'justify-content:flex-start', onclick: () => { a.pin = { x: l.x, y: l.y }; a.zone = l.zone; a.landmark = l.n.replace(' (sample)', ''); PLUG.set(); } }, ico('pin', 15), l.n))),
        a.pin ? button({ class: 'link small', style: 'margin-top:10px', onclick: () => { a.pin = null; PLUG.set(); } }, 'Remove my pin') : null),
        gap(12), div({ class: 'card' }, h3('Outside Freetown'), p({ class: 'small muted' }, 'Fresh and hot food stay in Freetown. Things that last can go by parcel.'),
          Object.keys(PLUG.CONFIG.intercity).map(k => { const c = PLUG.CONFIG.intercity[k], zz = PLUG.ZONES.find(x => x.id === k); return div({ class: 'item' }, div({ class: 'grow' }, strong(zz.name), div({ class: 'small muted' }, c.eta + ' · ' + c.point)), span({ class: 'price' }, fmt(c.fee))); }),
          button({ class: 'btn ghost sm', style: 'margin-top:10px', onclick: () => { a.zone = 'bo'; a.pin = null; PLUG.toast('Address set to Bo (parcel only)'); PLUG.set(); } }, 'Try delivering to Bo'))));
  };

  /* ---------- DA HOOD (proposed partner) ---------- */
  PLUG.partnersBlock = () => div(
    PLUG.notice('Proposed partnership, not signed. This page shows how the two could work together.', 'warn', 'info'),
    h2({ style: 'font-size:26px;margin-bottom:6px' }, 'THE PLUG × DA HOOD'), p({ class: 'muted', style: 'max-width:62ch' }, 'A few small, written deals instead of a merger. Each one can be tested on its own.'),
    div({ class: 'grid g3', style: 'margin:16px 0' }, [
      ['calendar', 'Events', 'Car Theaters, festivals and esports nights sell tickets here. Food is delivered to cars and seats. Rides to and from.', '/events/e1', 'See the pilot event'],
      ['tag', 'Clothing and merch', 'DA HOOD Clothing sells with its own business page. Studio prints the merch.', '/store/dahood', 'Open the store'],
      ['car', 'Transport', 'E-kekes and buses as ride supply, with a student rate. A deal with the transport business, not the group.', '/ride', 'Ride'],
      ['leaf', 'G.W.E.N', 'Collection runs use THE PLUG dispatch for routes and tracking. NGO money stays separate.', '/about', null],
      ['users', 'Jobs for members', 'Couriers, runners and door agents for student income, plus Studio work for members with skills.', '/agent', 'Door agent mode']
    ].map(x => div({ class: 'card' }, div({ class: 'row', style: 'color:var(--acc);margin-bottom:6px' }, ico(x[0], 22), strong(x[1])), p({ class: 'small muted' }, x[2]), x[4] ? PLUG.lnk(x[3], 'link small', x[4]) : null))),
    div({ class: 'card' }, h3('Ground rules'), ul({ class: 'small muted' }, li('One short written agreement per project, with the split and length.'), li('The Da Hood Collective and G.W.E.N never mix funds with THE PLUG.'), li('Write down who signs for each side.'), li('Register the DA HOOD trademark before it appears in the app.'))),
    gap(12), PLUG.notice('First pilot: one DA HOOD Car Theater night with food delivered to cars, tickets and door agents.', '', 'bolt'));
})(typeof window !== 'undefined' ? window : globalThis);
