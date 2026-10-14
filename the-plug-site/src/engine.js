/* THE PLUG engine: pure functions for One Delivery planning, pricing, quotes and search.
   No DOM access, so it can be unit tested in Node. All rates come from PLUG.CONFIG. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG = root.PLUG || {};
  const C = () => PLUG.CONFIG, D = () => PLUG.CONFIG.delivery, M = () => PLUG.MERCH;
  const round = (n) => Math.round(n);

  const dist = PLUG.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) * D().roadFactor;
  const mins = (km) => km / D().speedKmh * 60;

  /* ---------- One Delivery ---------- */
  function nearestOrder(ids, from) {
    const left = ids.slice(), out = []; let cur = from;
    while (left.length) {
      let bi = 0, bd = Infinity;
      left.forEach((id, i) => { const dd = dist(cur, M()[id]); if (dd < bd) { bd = dd; bi = i; } });
      const id = left.splice(bi, 1)[0]; out.push(id); cur = M()[id];
    }
    return out;
  }
  function simulate(order, dest) {
    // dispatch is delayed so the rider is never kept waiting at a counter
    const d = D(); let t = 0, cur = d.hub, km = 0; const arrive = [];
    order.forEach((id, i) => { const leg = dist(cur, M()[id]); km += leg; t += mins(leg); arrive.push(t); t += d.handlingMin; cur = M()[id]; });
    const last = dist(cur, dest); km += last; const travel = t + mins(last);
    let depart = 0; order.forEach((id, i) => { depart = Math.max(depart, M()[id].prep - arrive[i]); });
    return { km, eta: round(depart + travel), depart: round(depart), legs: arrive.map(a => round(a)) };
  }
  PLUG.planDelivery = function (lines, dest) {
    const d = D(); const mids = [];
    (lines || []).forEach(l => { if (l.merchantId && !mids.includes(l.merchantId)) mids.push(l.merchantId); });
    if (!mids.length) return null;
    const bulkyIds = mids.filter(id => lines.some(l => l.merchantId === id && l.bulky));
    const normalIds = mids.filter(id => !bulkyIds.includes(id));
    const hasHot = normalIds.some(id => M()[id].kind === 'restaurant');
    const hasSensitive = lines.some(l => l.sensitive);
    const trip = (id) => {
      const a = dist(d.hub, M()[id]), b = dist(M()[id], dest), km = a + b;
      const isB = bulkyIds.includes(id);
      return { merchantId: id, km: Math.round(km * 10) / 10, bulky: isB, fee: round(d.base + d.perKm * km + (isB ? d.bulkyExtra : 0)), eta: round(Math.max(M()[id].prep, mins(a)) + d.handlingMin + mins(b)) };
    };
    const separate = mids.map(trip);
    const sepNormal = separate.filter(s => !s.bulky), sepBulky = separate.filter(s => s.bulky);
    const splitFee = separate.reduce((s, x) => s + x.fee, 0);
    const splitEta = separate.reduce((m, x) => Math.max(m, x.eta), 0);
    const bulkyFee = sepBulky.reduce((s, x) => s + x.fee, 0), bulkyEta = sepBulky.reduce((m, x) => Math.max(m, x.eta), 0);
    const notes = [];
    if (hasHot && normalIds.length > 1) notes.push('Hot food is collected last and packed in insulated bags, kept apart from other goods.');
    if (hasSensitive) notes.push('Personal essentials travel in a sealed, discreet bag that the courier does not open.');
    if (bulkyIds.length) notes.push('Large or fragile items need a bigger vehicle, so they are always delivered separately.');
    const plan = { mids, normalIds, bulkyIds, separate, splitFee, splitEta, combined: null, feasible: false, reasons: [], notes, recommended: 'split', dest };
    if (normalIds.length > 1) {
      // hot food last, then nearest-neighbour among each group
      const cold = nearestOrder(normalIds.filter(id => M()[id].kind !== 'restaurant'), d.hub);
      const hot = nearestOrder(normalIds.filter(id => M()[id].kind === 'restaurant'), cold.length ? M()[cold[cold.length - 1]] : d.hub);
      const route = cold.concat(hot), sim = simulate(route, dest);
      const sepFee = sepNormal.reduce((s, x) => s + x.fee, 0), sepEta = sepNormal.reduce((m, x) => Math.max(m, x.eta), 0);
      const fee = round(d.base + d.perKm * sim.km + d.extraStop * (route.length - 1));
      const cons = Math.min(d.consolidationFee, Math.max(0, round(0.3 * (sepFee - fee))));
      const savings = sepFee - fee - cons;
      let spread = 0; normalIds.forEach(a => normalIds.forEach(b => { spread = Math.max(spread, dist(M()[a], M()[b])); }));
      const why = [];
      if (normalIds.length > d.maxStops) why.push('More than ' + d.maxStops + ' pickups. Split to keep the delivery on time.');
      if (spread > d.maxSpreadKm) why.push('The merchants are about ' + spread.toFixed(1) + ' km apart, more than the ' + d.maxSpreadKm + ' km limit for one rider.');
      if (sim.eta > sepEta + d.maxExtraMin) why.push('Combining would arrive about ' + (sim.eta - sepEta) + ' minutes later than the slowest separate delivery.');
      if (savings <= 0) why.push('Combining would not cost less than separate deliveries.');
      plan.combined = { route, km: Math.round(sim.km * 10) / 10, eta: Math.max(sim.eta, bulkyEta), depart: sim.depart, fee: fee + bulkyFee, deliveryFee: fee, consolidation: cons, savings: round(savings), spread: Math.round(spread * 10) / 10, sepFee, sepEta };
      plan.feasible = why.length === 0; plan.reasons = why; plan.recommended = plan.feasible ? 'combined' : 'split';
    } else if (normalIds.length === 1) { plan.recommended = 'single'; }
    return plan;
  };
  PLUG.deliveryFor = function (plan, mode) {
    if (!plan) return { fee: 0, consolidation: 0, eta: 0, mode: 'none' };
    if (mode === 'combined' && plan.combined && plan.feasible) return { fee: plan.combined.fee, consolidation: plan.combined.consolidation, eta: plan.combined.eta, mode: 'combined' };
    return { fee: plan.splitFee, consolidation: 0, eta: plan.splitEta, mode: plan.mids.length > 1 ? 'split' : 'single' };
  };

  /* ---------- totals ---------- */
  PLUG.totals = function (basket, plan, mode, opts) {
    opts = opts || {}; const lines = basket.lines || [], bookings = basket.bookings || [];
    const items = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const bySub = {};
    lines.forEach(l => { (bySub[l.merchantId] = bySub[l.merchantId] || { merchantId: l.merchantId, total: 0, count: 0 }); bySub[l.merchantId].total += l.price * l.qty; bySub[l.merchantId].count += l.qty; });
    const del = PLUG.deliveryFor(plan, mode);
    const service = round(items * C().serviceFeePct / 100), tax = round((items + service) * C().taxPct / 100);
    const bookingsTotal = bookings.reduce((s, b) => s + b.price, 0);
    const promo = opts.promo && C().promos[String(opts.promo).toUpperCase()];
    const discount = promo && opts.firstOrder && items > 0 ? Math.min(round(items * promo.pct / 100), promo.max) : 0;
    const tip = items > 0 ? round(items * (opts.tipPct || 0) / 100) : 0;
    const total = items + del.fee + del.consolidation + service + tax + bookingsTotal + tip - discount;
    return { items, bySub, delivery: del.fee, consolidation: del.consolidation, service, tax, bookings: bookingsTotal, tip, discount, total, eta: del.eta, mode: del.mode, promoValid: !!promo };
  };

  /* ---------- Errands ---------- */
  PLUG.errandQuote = function (f) {
    const e = C().errand, rows = [];
    rows.push(['Runner base fee', e.base]);
    const km = Math.max(0, +f.km || 0); if (km) rows.push(['Distance, ' + km + ' km', round(e.perKm * km)]);
    const extra = Math.max(0, (+f.stops || 1) - 1); if (extra) rows.push(['Extra stops, ' + extra, e.perExtraStop * extra]);
    const wait = Math.max(0, (+f.waitMin || 0) - e.waitFreeMin);
    if (wait) rows.push(['Waiting time, ' + (f.waitMin) + ' min expected (first ' + e.waitFreeMin + ' free)', Math.ceil(wait / 15) * e.waitPer15]);
    let sub = rows.reduce((s, r) => s + r[1], 0);
    if (f.night) { const n = round(sub * e.nightPct / 100); rows.push(['Night rate, ' + e.nightPct + '%', n]); sub += n; }
    const budget = Math.max(0, +f.budget || 0);
    return { rows, fee: sub, budget, total: sub + budget, note: budget ? 'The runner pays for the item up to your budget and uploads the receipt. Anything above NLe ' + budget + ' needs your approval first.' : '' };
  };

  /* ---------- Ride ---------- */
  PLUG.rideQuote = function (f) {
    const v = PLUG.VEHICLES.find(x => x.id === f.vehicle) || PLUG.VEHICLES[1];
    let fare = v.base + v.perKm * Math.max(0, +f.km || 0);
    const night = !!f.night; if (night) fare = fare * (1 + C().ride.nightPct / 100);
    fare = round(fare);
    const fitsSeats = (+f.pax || 1) <= v.seats, fitsBags = (+f.bags || 0) <= v.bags;
    return { vehicle: v, fare, lo: round(fare * 0.9), hi: round(fare * 1.1), night, fitsSeats, fitsBags, includedWait: C().ride.waitFreeMin, waitPerMin: C().ride.waitPerMin, cancel: 'Free to cancel until a driver accepts. After that, a cancellation fee of NLe 15 (sample) applies once the driver is on the way.' };
  };

  /* ---------- Stays ---------- */
  PLUG.stayBlocked = function (stay, today, extra) {
    const out = (stay.blocked || []).map(r => [PLUG.addDays(today, r[0]), PLUG.addDays(today, r[1])]);
    (extra || []).filter(x => x.stayId === stay.id).forEach(x => out.push([x.checkIn, x.checkOut]));
    return out;
  };
  PLUG.stayAvailable = function (stay, today, ci, co, guests, extra) {
    if (!ci || !co || co <= ci) return { ok: false, why: 'Choose valid dates' };
    if (guests > stay.cap) return { ok: false, why: 'Sleeps up to ' + stay.cap };
    const clash = PLUG.stayBlocked(stay, today, extra).some(r => ci < r[1] && co > r[0]);
    return clash ? { ok: false, why: 'Not available on those dates' } : { ok: true };
  };
  PLUG.stayQuote = function (stay, ci, co) {
    const n = Math.max(1, PLUG.nights(ci, co)), sub = stay.rate * n, tax = round(sub * C().stay.taxPct / 100);
    return { nights: n, sub, cleaning: stay.cleaning || 0, tax, total: sub + (stay.cleaning || 0) + tax };
  };

  /* ---------- Travel ---------- */
  PLUG.transferQuote = function (routeId, vehicleId, pax, bags) {
    const r = PLUG.TRANSFERS.routes.find(x => x.id === routeId), v = PLUG.TRANSFERS.vehicles.find(x => x.id === vehicleId);
    const fits = pax <= v.seats && bags <= v.bags;
    return { price: round(r.base * v.mult), fits, vehicle: v, route: r };
  };
  PLUG.travelBuild = function (f) {
    const nights = Math.max(1, +f.nights || 1), pax = Math.max(1, +f.travellers || 1);
    const interests = f.interests && f.interests.length ? f.interests : ['culture'];
    const stays = PLUG.STAYS.slice().sort((a, b) => a.rate - b.rate);
    const rooms = (s) => Math.ceil(pax / Math.max(1, Math.min(s.cap, 2 + (s.cap > 3 ? 1 : 0))));
    const items = [];
    const transfer = PLUG.transferQuote('airport', pax > 3 ? (pax > 4 ? 'van' : 'suv') : 'car', pax, pax);
    items.push({ label: 'Airport transfers, both ways (' + transfer.vehicle.name + ')', cost: transfer.price * 2, kind: 'transfer' });
    const budget = +f.budget || 0;
    const stayFor = (tier) => stays[Math.min(stays.length - 1, tier)];
    // pick the best stay that leaves room for activities
    let chosen = stays[0];
    for (let i = stays.length - 1; i >= 0; i--) { const s = stays[i], c = s.rate * nights * rooms(s) + transfer.price * 2; if (!budget || c <= budget * 0.6) { chosen = s; break; } }
    items.push({ label: nights + ' night' + (nights > 1 ? 's' : '') + ' at ' + chosen.name + ', ' + rooms(chosen) + ' room' + (rooms(chosen) > 1 ? 's' : ''), cost: chosen.rate * nights * rooms(chosen), kind: 'stay' });
    const pool = PLUG.ACTIVITIES.filter(a => a.tags.some(t => interests.includes(t))).sort((a, b) => a.cost - b.cost);
    const days = Math.min(nights + 1, 6); const acts = [];
    let running = items.reduce((s, i) => s + i.cost, 0);
    pool.forEach(a => { if (acts.length < days && (!budget || running + a.cost * pax <= budget)) { acts.push(a); running += a.cost * pax; } });
    acts.forEach(a => items.push({ label: a.name + (pax > 1 ? ' x ' + pax : ''), cost: a.cost * pax, kind: 'activity' }));
    const total = items.reduce((s, i) => s + i.cost, 0);
    const dayPlan = []; for (let d = 0; d < nights + 1; d++) dayPlan.push({ day: d + 1, title: d === 0 ? 'Arrival and transfer' : d === nights ? 'Departure' : (acts[d - 1] ? acts[d - 1].name : 'Free day'), note: d === 0 ? 'Airport pickup, check in at ' + chosen.name : d === nights ? 'Check out and transfer to the airport' : (acts[d - 1] ? acts[d - 1].hours + ' hours' : 'Time to relax or add something') });
    return { items, total, perPerson: Math.round(total / pax), over: budget && total > budget ? total - budget : 0, stay: chosen, days: dayPlan, includes: ['Items listed above, itemised'], excludes: ['International flights', 'Meals not listed', 'Travel insurance', 'Personal spending'], cancel: 'Each provider has its own cancellation rules. They are shown before you send the request.', note: f.access ? 'Accessibility needs noted: "' + f.access + '". Each provider must confirm before booking.' : '' };
  };

  /* ---------- Studio ---------- */
  PLUG.studioQuote = function (kind, pkg, f) {
    f = f || {}; const rows = []; let milestones = [];
    if (kind === 'print') { const v = pkg.variants[f.variant || 0]; rows.push([pkg.name + ', ' + v.l, v.p]); if (f.design) rows.push(['Design help (sample)', 80]); }
    else if (kind === 'photo') {
      rows.push([pkg.name, pkg.price]);
      if (f.extraHours) rows.push(['Extra hours, ' + f.extraHours, 150 * f.extraHours]);
      if (f.outside) rows.push(['Travel outside the city (sample)', 120]);
      if (f.rush) rows.push(['Rush delivery (sample)', round(pkg.price * 0.25)]);
    } else {
      rows.push([pkg.name, pkg.price]);
      if (f.extraPages) rows.push(['Extra pages, ' + f.extraPages, 500 * f.extraPages]);
      if (f.hosting) rows.push(['First month of hosting and care', PLUG.STUDIO.hosting.monthly]);
    }
    const total = rows.reduce((s, r) => s + r[1], 0);
    if (kind !== 'print') { const parts = [['Start of work', 40], ['Draft approved', 40], ['Handover', 20]]; milestones = parts.map(p => ({ l: p[0], pct: p[1], amt: round(total * p[1] / 100) })); }
    return { rows, total, milestones };
  };

  /* ---------- Search ---------- */
  PLUG.searchIndex = function () {
    const out = [], M_ = PLUG.MERCH;
    Object.values(M_).forEach(m => {
      const type = m.kind === 'restaurant' ? 'Eats' : m.kind === 'store' ? 'Market' : m.kind === 'pharmacy' ? 'Care' : 'Studio';
      out.push({ cat: type, title: m.name, sub: [m.blurb, m.zone].concat(m.cuisines).join(' · '), route: m.kind === 'restaurant' ? '/eats/' + m.id : m.kind === 'store' ? '/market' : m.kind === 'pharmacy' ? '/care' : '/studio', kind: 'merchant', id: m.id });
    });
    Object.values(PLUG.ITEMS).forEach(i => {
      const m = M_[i.merchantId]; const cat = m.kind === 'restaurant' ? 'Eats' : m.kind === 'store' ? 'Market' : 'Care';
      out.push({ cat, title: i.name, sub: m.name + ' · ' + PLUG.fmt(i.price), route: m.kind === 'restaurant' ? '/eats/' + m.id : m.kind === 'store' ? '/market' : '/care', kind: 'item', id: i.id, item: i });
    });
    PLUG.STAYS.forEach(s => out.push({ cat: 'Stays', title: s.name, sub: s.type + ' · ' + s.area, route: '/stays/' + s.id, kind: 'stay', id: s.id }));
    PLUG.PACKAGES.forEach(p => out.push({ cat: 'Travel', title: p.name, sub: p.days + ' days · ' + p.summary, route: '/travel', kind: 'package', id: p.id }));
    PLUG.ACTIVITIES.forEach(a => out.push({ cat: 'Travel', title: a.name, sub: a.tags.join(', '), route: '/travel', kind: 'activity', id: a.id }));
    ['print', 'photo', 'build'].forEach(k => PLUG.STUDIO[k].forEach(p => out.push({ cat: 'Studio', title: p.name, sub: k + (p.desc ? ' · ' + p.desc : ''), route: '/studio', kind: 'studio', id: p.id })));
    PLUG.ERRAND_TYPES.forEach(t => out.push({ cat: 'Errands', title: t.name, sub: t.hint, route: '/errands', kind: 'errand', id: t.id }));
    PLUG.VEHICLES.forEach(v => out.push({ cat: 'Ride', title: v.name, sub: v.note, route: '/ride', kind: 'vehicle', id: v.id }));
    return out;
  };
  PLUG.search = function (q, cat) {
    q = (q || '').trim().toLowerCase(); if (!q) return [];
    const idx = PLUG.searchIndex().filter(r => (!cat || cat === 'All' || r.cat === cat) && (r.title + ' ' + r.sub).toLowerCase().includes(q));
    return idx.sort((a, b) => (b.title.toLowerCase().startsWith(q) ? 1 : 0) - (a.title.toLowerCase().startsWith(q) ? 1 : 0));
  };

  /* ---------- availability for merchants ---------- */
  PLUG.merchantStatus = function (m, confirmed) {
    if (confirmed && confirmed[m.id]) return { code: 'open', label: 'Confirmed open', detail: 'Confirmed by the merchant just now (demo)' };
    if (m.state === 'open') return { code: 'open', label: 'Open', detail: 'Merchant status updated ' + m.updated + ' (sample)' };
    if (m.state === 'closed') return { code: 'closed', label: 'Closed', detail: 'Opens ' + (m.opens || 'later') + ' (sample). You can schedule an order.' };
    return { code: 'unknown', label: 'Unconfirmed', detail: 'Last update ' + m.updated + '. Ask the merchant before ordering.' };
  };
})(typeof window !== 'undefined' ? window : globalThis);
