/* THE PLUG state and actions. Everything the screens can do goes through here.
   This is a prototype: no real payments, bookings, drivers or notifications are connected. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, C = () => PLUG.CONFIG, M = () => PLUG.MERCH;

  PLUG.init = function () {
    Object.assign(S, {
      route: '/', lang: 'en', lowData: false, user: null, auth: null,
      basket: { lines: [], bookings: [] }, orders: [], tx: [], points: { pending: 0, confirmed: 0 },
      saved: { merchant: [], item: [], stay: [], package: [] },
      addresses: [{ id: 'a1', label: 'Home', zone: 'lumley', landmark: '', phone: '', note: '' }], addressId: 'a1',
      confirmed: {}, mode: 'combined', tip: 0, promo: '', promoApplied: false, payment: 'cod', demoOutcome: 'success', ageOk: false,
      firstOrderUsed: false, stayBookings: [], f: {}, search: { q: '', cat: 'All' }, toast: null, menuOpen: false,
      settings: { hideSensitive: true, orderAlerts: true, offers: false, locationConsent: false },
      today: PLUG.dateKey(new Date()), waitlist: [], appState: { stack: ['/'], tab: 'home', splash: true }, checkoutError: '', cfgOpen: false
    });
  };

  /* ---------- small utilities ---------- */
  PLUG.t = (k) => (PLUG.LANG[S.lang] && PLUG.LANG[S.lang][k]) || PLUG.LANG.en[k] || k;
  // per-screen form state; keeps what the person typed across re-renders
  PLUG.form = (name, defaults) => { if (!S.f[name]) S.f[name] = Object.assign({}, typeof defaults === 'function' ? defaults() : defaults); return S.f[name]; };
  PLUG.currentAddress = () => S.addresses.find(a => a.id === S.addressId) || S.addresses[0];
  PLUG.destination = () => PLUG.ZONES.find(z => z.id === PLUG.currentAddress().zone) || PLUG.ZONES[0];
  PLUG.isSaved = (type, id) => S.saved[type].includes(id);
  PLUG.toggleSaved = (type, id) => { const a = S.saved[type], i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); PLUG.set(); PLUG.toast(i >= 0 ? 'Removed from saved' : 'Saved'); };
  PLUG.basketCount = () => S.basket.lines.reduce((s, l) => s + l.qty, 0) + S.basket.bookings.length;
  PLUG.view = () => {
    const plan = PLUG.planDelivery(S.basket.lines, PLUG.destination());
    const mode = plan && plan.feasible && S.mode === 'combined' ? 'combined' : 'split';
    const totals = PLUG.totals(S.basket, plan, mode, { tipPct: S.tip, promo: S.promoApplied ? S.promo : '', firstOrder: !S.firstOrderUsed });
    return { plan, mode, totals };
  };

  /* ---------- sign-in (demo verification) ---------- */
  PLUG.requireAuth = (then) => { if (S.user) { then && then(); return; } S.auth = { step: 'enter', mode: 'phone', value: '', code: '', error: '', then }; PLUG.set(); };
  PLUG.authSend = () => { const a = S.auth; const v = (a.value || '').trim(); const okPhone = /^[+\d][\d\s-]{6,}$/.test(v), okMail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
    if (a.mode === 'phone' ? !okPhone : !okMail) { a.error = a.mode === 'phone' ? 'Enter a phone number with at least 7 digits.' : 'Enter a valid email address.'; PLUG.set(); return; }
    a.step = 'code'; a.error = ''; PLUG.set(); };
  PLUG.authVerify = () => { const a = S.auth; if ((a.code || '').trim() !== '123456') { a.error = 'That code is not right. In this prototype the code is 123456.'; PLUG.set(); return; }
    S.user = { name: 'Demo customer', contact: a.value, since: new Date().toISOString() }; const then = a.then; S.auth = null; PLUG.set(); PLUG.toast('Signed in (demo account)'); if (then) then(); };
  PLUG.signOut = () => { S.user = null; PLUG.set(); PLUG.toast('Signed out'); };

  /* ---------- basket ---------- */
  PLUG.confirmMerchant = (id) => { S.confirmed[id] = true; PLUG.set(); PLUG.toast('Merchant confirmed they are open (demo)'); };
  PLUG.addLine = (item, qty, opts) => {
    const m = M()[item.merchantId], st = PLUG.merchantStatus(m, S.confirmed);
    if (st.code === 'unknown') { PLUG.toast('Ask ' + m.name + ' if they are open first', 'warn'); return false; }
    if (item.enabled === false || item.pharmacist) { PLUG.toast(item.note || 'This item is not available yet', 'warn'); return false; }
    if (item.stock != null && item.stock <= 0) { PLUG.toast('Out of stock', 'warn'); return false; }
    opts = opts || {}; const extras = (opts.extras || []), extraCost = extras.reduce((s, e) => s + e.p, 0);
    const key = item.id + '|' + extras.map(e => e.n).join(',') + '|' + (opts.variant || '') + '|' + (opts.note || '');
    const ex = S.basket.lines.find(l => l.key === key);
    const have = ex ? ex.qty : 0;
    if (item.stock != null && have + (qty || 1) > item.stock) { PLUG.toast('Only ' + item.stock + ' in stock', 'warn'); return false; }
    if (ex) ex.qty += qty || 1;
    else S.basket.lines.push({ key, itemId: item.id, merchantId: item.merchantId, name: item.name + (opts.variant ? ', ' + opts.variant : ''), price: (opts.price != null ? opts.price : item.price) + extraCost, qty: qty || 1, extras: extras.map(e => e.n), note: opts.note || '', sub: 'contact', hot: !!item.hot, sensitive: !!item.sensitive, bulky: !!opts.bulky, restricted: item.restricted || '', perishable: !!(item.perishable || item.hot || M()[item.merchantId].kind === 'restaurant'), stock: item.stock, kind: opts.kind || 'item', proof: !!opts.proof });
    PLUG.set(); PLUG.toast('Added to basket'); return true;
  };
  PLUG.setQty = (key, q) => { const l = S.basket.lines.find(x => x.key === key); if (!l) return; if (q <= 0) { S.basket.lines = S.basket.lines.filter(x => x.key !== key); } else if (l.stock != null && q > l.stock) { PLUG.toast('Only ' + l.stock + ' in stock', 'warn'); return; } else l.qty = q; PLUG.set(); };
  PLUG.addBooking = (b) => { b.key = b.key || PLUG.uid('bk'); S.basket.bookings.push(b); PLUG.set(); PLUG.toast('Added to checkout as a booking'); };
  PLUG.removeBooking = (key) => { S.basket.bookings = S.basket.bookings.filter(b => b.key !== key); PLUG.set(); };
  PLUG.applyPromo = () => { const code = (S.promo || '').trim().toUpperCase(); const p = C().promos[code];
    if (!p) { S.promoApplied = false; PLUG.set(); PLUG.toast('That code is not valid', 'warn'); return; }
    if (S.firstOrderUsed) { PLUG.toast('This code is for a first order only', 'warn'); return; }
    S.promoApplied = true; PLUG.set(); PLUG.toast('Code applied: ' + p.label); };

  /* ---------- order entries ---------- */
  function addEntry(e) {
    const id = PLUG.uid(e.type === 'order' ? 'PLG' : e.type.slice(0, 3).toUpperCase());
    const entry = Object.assign({ id, created: new Date().toISOString(), idx: 0, cancelled: false, log: [], refund: 0 }, e);
    entry.log.push({ t: PLUG.clock(), label: entry.steps[0] });
    S.orders.unshift(entry); return entry;
  }
  PLUG.addEntry = addEntry;
  PLUG.stepsFor = (e) => e.steps;
  PLUG.subStatus = (e, mid) => { const prep = M()[mid].prep; const off = prep > 22 ? 1 : 0; return e.steps[Math.max(0, Math.min(3, e.idx - off))]; };
  PLUG.advance = (id) => {
    const e = S.orders.find(o => o.id === id); if (!e || e.cancelled || e.idx >= e.steps.length - 1) return;
    e.idx++; e.log.push({ t: PLUG.clock(), label: e.steps[e.idx] });
    if (e.type === 'ride' && e.idx === 1) e.driver = { name: 'Sample driver', vehicle: e.data.vehicleName, plate: 'DEMO-000' };
    if (e.idx === e.steps.length - 1) { const pts = Math.floor((e.total || 0) / C().points.per); if (pts > 0 && !e.pointsDone) { e.pointsDone = true; S.points.pending = Math.max(0, S.points.pending - (e.pendingPoints || 0)); S.points.confirmed += pts; } }
    PLUG.set();
  };
  PLUG.canCancel = (e) => !e.cancelled && ((e.type === 'service' && e.idx < 1) || (e.type === 'order' && e.idx <= 2) || (e.type === 'errand' && e.idx <= 1) || (e.type === 'ride' && e.idx <= 2) || (e.type === 'stay' && e.idx < e.steps.length - 1) || (e.type === 'travel' && e.idx < 3) || (e.type === 'studio' && e.idx <= 2) || (e.type === 'transfer' && e.idx <= 2));
  PLUG.cancelEntry = (id) => {
    const e = S.orders.find(o => o.id === id); if (!e || !PLUG.canCancel(e)) return;
    e.cancelled = true; e.log.push({ t: PLUG.clock(), label: 'Cancelled by you' });
    if (e.paid && e.paid !== 'cod' && e.total) { e.refund = e.total; S.tx.unshift({ id: PLUG.uid('tx'), t: new Date().toISOString(), label: 'Refund for ' + e.title, amount: e.total, status: 'Refund (demo)' }); }
    if (e.pendingPoints) S.points.pending = Math.max(0, S.points.pending - e.pendingPoints);
    PLUG.set(); PLUG.toast('Cancelled');
  };
  PLUG.reorder = (id) => { const e = S.orders.find(o => o.id === id); if (!e || !e.lines) return; let n = 0; e.lines.forEach(l => { const it = PLUG.ITEMS[l.itemId]; if (it && PLUG.addLine(it, l.qty, { extras: (l.extras || []).map(n => ({ n, p: 0 })), variant: '' })) n++; }); if (!n) PLUG.toast('Those items are not available right now', 'warn'); };

  /* ---------- checkout ---------- */
  PLUG.checkout = function () {
    const v = PLUG.view(), a = PLUG.currentAddress(); S.checkoutError = '';
    const fail = (m) => { S.checkoutError = m; PLUG.set(); return false; };
    if (!S.basket.lines.length && !S.basket.bookings.length) return fail('Your basket is empty.');
    if (S.basket.lines.length) {
      if (!a.landmark.trim()) return fail('Add a landmark or directions so the courier can find you.');
      if (!/^[+\d][\d\s-]{6,}$/.test((a.phone || '').trim())) return fail('Add a phone number the courier can call.');
      if (S.basket.lines.some(l => l.restricted) && !S.ageOk) return fail('Confirm you are 18 or over to buy age-restricted items.');
    }
    if (S.payment === 'cod' && S.basket.bookings.length) return fail('Bookings cannot be paid in cash on delivery. Use the demo test payment for the bookings, or remove them.');
    if (S.payment === 'cod' && v.totals.total > C().codLimitNewAccount) return fail('Cash on delivery is limited to ' + PLUG.fmt(C().codLimitNewAccount) + ' for new accounts. Remove items or use another method.');
    if (!['cod', 'demo'].includes(S.payment)) return fail('That payment method is not connected yet.');
    if (S.payment === 'demo') {
      if (S.demoOutcome === 'failure') { S.tx.unshift({ id: PLUG.uid('tx'), t: new Date().toISOString(), label: 'Payment attempt', amount: v.totals.total, status: 'Failed (demo)' }); return fail('The demo payment failed. No money was taken and your basket is unchanged.'); }
      if (S.demoOutcome === 'cancel') return fail('You cancelled the demo payment. Your basket is unchanged.');
    }
    const paid = S.payment, when = new Date().toISOString(), made = [];
    const label = (m) => M()[m].name;
    if (S.basket.lines.length) {
      const names = Object.keys(v.totals.bySub).map(label);
      const sensitiveOnly = S.basket.lines.every(l => l.sensitive);
      const e = addEntry({ type: 'order', title: sensitiveOnly ? 'Personal essentials order' : 'Order from ' + names.join(', '), sub: v.mode === 'combined' ? 'One Delivery, ' + names.length + ' pickups' : (names.length > 1 ? 'Separate deliveries' : 'Single delivery'), steps: PLUG.STEPS.order, total: v.totals.total, paid, lines: S.basket.lines.map(l => Object.assign({}, l)), totals: v.totals, plan: v.plan, mode: v.mode, address: Object.assign({}, a), sensitive: S.basket.lines.some(l => l.sensitive) });
      e.pendingPoints = Math.floor(v.totals.total / C().points.per); S.points.pending += e.pendingPoints; made.push(e);
    }
    S.basket.bookings.forEach(b => {
      const steps = b.type === 'stay' ? (b.instant ? PLUG.STEPS.stayInstant : PLUG.STEPS.stayRequest) : b.type === 'travel' ? PLUG.STEPS.travel : b.type === 'transfer' ? PLUG.STEPS.transfer : b.type === 'service' ? PLUG.STEPS.service : PLUG.STEPS.studio;
      const e = addEntry({ type: b.type === 'transfer' ? 'transfer' : b.type, title: b.title, sub: b.sub, steps, total: b.price, paid, data: b.meta || {} });
      if (b.type === 'stay') S.stayBookings.push({ stayId: b.meta.stayId, checkIn: b.meta.checkIn, checkOut: b.meta.checkOut });
      e.pendingPoints = Math.floor(b.price / C().points.per); S.points.pending += e.pendingPoints; made.push(e);
    });
    S.tx.unshift({ id: PLUG.uid('tx'), t: when, label: made.length > 1 ? made.length + ' items' : made[0].title, amount: v.totals.total, status: paid === 'cod' ? 'Pay on delivery' : 'Paid (demo)' });
    if (S.promoApplied) S.firstOrderUsed = true;
    S.basket = { lines: [], bookings: [] }; S.promo = ''; S.promoApplied = false; S.tip = 0; S.ageOk = false; S.checkoutError = '';
    PLUG.set(); PLUG.toast(made.length > 1 ? 'Placed, see Orders and bookings' : 'Order placed (demo)');
    return made[0];
  };

  /* ---------- other services ---------- */
  PLUG.requestErrand = (f, q) => {
    const type = PLUG.ERRAND_TYPES.find(t => t.id === f.type);
    const e = addEntry({ type: 'errand', title: type.name + (f.what ? ': ' + f.what.slice(0, 40) : ''), sub: (f.pickup || 'Pickup') + ' to ' + (f.dropoff || 'drop-off'), steps: PLUG.STEPS.errand, total: q.total, paid: S.payment === 'demo' ? 'demo' : 'cod', data: { f: Object.assign({}, f), q, code: String(1000 + Math.floor(Math.random() * 9000)) } });
    S.tx.unshift({ id: PLUG.uid('tx'), t: new Date().toISOString(), label: e.title, amount: q.total, status: 'Pay when complete' });
    PLUG.set(); PLUG.toast('Errand requested'); return e;
  };
  PLUG.requestRide = (f, q) => {
    const e = addEntry({ type: 'ride', title: 'Ride: ' + (f.pickup || 'pickup') + ' to ' + (f.dest || 'destination'), sub: q.vehicle.name + (f.when === 'later' ? ', scheduled ' + (f.date || '') + ' ' + (f.time || '') : ', now'), steps: PLUG.STEPS.ride, total: q.fare, paid: 'cod', data: { f: Object.assign({}, f), q, vehicleName: q.vehicle.name, pin: String(1000 + Math.floor(Math.random() * 9000)) } });
    PLUG.set(); PLUG.toast('Ride requested. Not confirmed until a driver accepts.'); return e;
  };
  PLUG.joinWaitlist = (what, contact) => { S.waitlist.push({ what, contact, t: new Date().toISOString() }); PLUG.set(); PLUG.toast('Added to the list (demo, nothing is sent)'); };
  PLUG.setLang = (l) => { S.lang = l; PLUG.set(); };
})(typeof window !== 'undefined' ? window : globalThis);
