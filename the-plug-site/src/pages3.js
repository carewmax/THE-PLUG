/* THE PLUG pages, part 3: Search, Orders, Wallet, Account, Saved, Rewards, About/Partner, Help. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, h = PLUG.h, ico = PLUG.ico, M = () => PLUG.MERCH, fmt = PLUG.fmt;
  const { div, span, p, button, h2, h3, h4, label, ul, li, input, strong, details, summary } = PLUG;
  const pages = PLUG.pages;
  const gap = (n) => h('div', { style: 'height:' + (n || 14) + 'px' });
  const signinCard = (why) => PLUG.empty('Sign in to continue', why, button({ class: 'btn pri', onclick: () => PLUG.requireAuth() }, 'Sign in (demo code 123456)'));

  /* ---------- Search ---------- */
  pages.search = () => {
    const f = S.search, cats = ['All', 'Shop', 'Eats', 'Market', 'Events', 'Care', 'Stays', 'Travel', 'Studio', 'Errands', 'Ride'];
    const res = PLUG.search(f.q, f.cat);
    return div(
      div({ class: 'searchbar', style: 'margin-bottom:14px' }, div({ class: 'in' }, ico('search', 18), PLUG.in('search', f, 'q', { bare: true, ph: PLUG.t('search') }))),
      PLUG.chipRow(cats, f.cat, (c) => { f.cat = c; PLUG.set(); }), gap(16),
      !f.q.trim() ? div(p({ class: 'muted' }, 'Try one of these:'), div({ class: 'chips' }, ['rice', 'pizza', 'hotel', 'print', 'rides', 'groceries'].map(x => button({ class: 'chip', onclick: () => { f.q = x; PLUG.set(); } }, x))))
        : res.length ? div({ class: 'card', style: 'padding:4px 18px' }, p({ class: 'small muted', style: 'padding-top:12px;margin:0' }, res.length + ' result' + (res.length === 1 ? '' : 's') + ' (sample data)'), res.slice(0, 40).map(r => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'row', style: 'gap:8px' }, PLUG.pill(r.cat, 'mute'), span({ class: 'nm' }, r.title)), div({ class: 'small muted' }, r.sub)),
          r.kind === 'item' ? PLUG.addButton(r.item) : PLUG.lnk(r.route, 'btn sm ghost', 'Open'))))
          : PLUG.empty('Nothing found for “' + f.q + '”', 'Check the spelling, try a shorter word, or pick All categories.', button({ class: 'btn pri', onclick: () => { f.q = ''; f.cat = 'All'; PLUG.set(); } }, 'Clear search')));
  };

  /* ---------- Orders and bookings ---------- */
  const typeIcon = { order: 'box', errand: 'errand', ride: 'car', stay: 'bed', travel: 'plane', studio: 'printer', transfer: 'car', service: 'users' };
  const entryStatus = (e) => e.cancelled ? ['Cancelled', 'bad'] : e.idx >= e.steps.length - 1 ? ['Done', 'mute'] : [e.steps[e.idx], ''];
  const neutral = (e) => e.sensitive && S.settings.hideSensitive;
  pages.orders = () => {
    const f = PLUG.form('orders', { tab: 'active' });
    if (!S.orders.length) return PLUG.empty('No orders or bookings yet', 'When you order or book, it shows up here with live status.', [PLUG.lnk('/eats', 'btn pri', 'Order food'), PLUG.lnk('/stays', 'btn ghost', 'Find a stay')]);
    const active = S.orders.filter(e => !e.cancelled && e.idx < e.steps.length - 1), past = S.orders.filter(e => !active.includes(e)), list = f.tab === 'active' ? active : past;
    return div(PLUG.tabs([['active', 'Active (' + active.length + ')'], ['past', 'Past (' + past.length + ')']], f.tab, (t) => { f.tab = t; PLUG.set(); }),
      list.length ? list.map(e => { const st = entryStatus(e); return div({ class: 'card', style: 'margin-bottom:12px;cursor:pointer', onclick: () => PLUG.nav('/orders/' + e.id) },
        div({ class: 'row between', style: 'flex-wrap:nowrap;align-items:flex-start' }, div({ class: 'row', style: 'flex-wrap:nowrap;align-items:flex-start' }, ico(typeIcon[e.type] || 'box', 24, 'ic'), div(strong(neutral(e) ? 'Personal essentials order' : e.title), div({ class: 'small muted' }, neutral(e) ? 'Sealed bag' : e.sub), div({ class: 'small muted' }, e.id + ' · ' + PLUG.prettyDate(e.created.slice(0, 10))))), div({ style: 'text-align:right' }, PLUG.pill(st[0], st[1]), div({ class: 'price', style: 'margin-top:6px' }, fmt(e.total))))); })
        : PLUG.empty('Nothing here', f.tab === 'active' ? 'No active orders right now.' : 'Finished orders appear here.'));
  };
  pages.orderDetail = (id) => {
    const e = S.orders.find(o => o.id === id); if (!e) return PLUG.empty('Order not found', 'It may have been from an earlier session.', PLUG.lnk('/orders', 'btn pri', 'All orders'));
    const st = entryStatus(e), final = e.idx >= e.steps.length - 1, hide = neutral(e);
    const delay = (kind) => {
      const plan = e.plan, mid = e.delay.mid, sep = plan.separate.find(x => x.merchantId === mid);
      if (kind === 'wait') e.log.push({ t: PLUG.clock(), label: 'You chose to wait for ' + M()[mid].name });
      if (kind === 'remove') { const sub = e.totals.bySub[mid].total; e.total -= sub; e.removed = (e.removed || []).concat(mid); e.log.push({ t: PLUG.clock(), label: M()[mid].name + ' items removed, ' + fmt(sub) + ' refunded' }); if (e.paid !== 'cod') S.tx.unshift({ id: PLUG.uid('tx'), t: new Date().toISOString(), label: 'Refund: ' + M()[mid].name + ' removed', amount: sub, status: 'Refund (demo)' }); }
      if (kind === 'split') { e.total += sep.fee; e.mode = 'split'; e.log.push({ t: PLUG.clock(), label: M()[mid].name + ' sent separately for ' + fmt(sep.fee) }); S.tx.unshift({ id: PLUG.uid('tx'), t: new Date().toISOString(), label: 'Separate delivery for ' + M()[mid].name, amount: sep.fee, status: e.paid === 'cod' ? 'Pay on delivery' : 'Charged (demo)' }); }
      e.delay.resolved = kind; PLUG.set();
    };
    return div({ class: 'two' },
      div(
        PLUG.trackCard(e), PLUG.trackCard(e) ? h('div', { style: 'height:14px' }) : null,
        div({ class: 'card' }, div({ class: 'row between' }, h2({ style: 'font-size:24px' }, hide ? 'Personal essentials order' : e.title), PLUG.pill(st[0], st[1])), p({ class: 'small muted' }, e.id + ' · ' + (hide ? 'Sealed bag' : e.sub)), gap(8),
          h4({ style: 'margin-bottom:10px' }, 'Status'), h('ol', { class: 'steps', 'aria-label': 'Order progress' }, e.steps.map((s, i) => h('li', { class: i < e.idx || (final && i === e.idx && !e.cancelled) ? 'done' : i === e.idx && !e.cancelled ? 'now' : '' }, span({ class: 'b' }, i < e.idx || (final && i === e.idx) ? ico('check', 12) : null), s, i === e.idx && !e.cancelled && !final ? span({ class: 'small muted' }, '  (current)') : null, (e.log.find(l => l.label === s) && (i <= e.idx)) ? span({ class: 'stime' }, e.log.find(l => l.label === s).t) : null))),
          e.cancelled ? PLUG.notice('Cancelled.' + (e.refund ? ' Refund of ' + fmt(e.refund) + ' recorded in Wallet (demo).' : ''), 'bad') : null,
          e.type === 'order' && e.mode === 'combined' && !e.cancelled ? div({ class: 'card flat', style: 'padding:12px;margin:10px 0;background:var(--card2)' }, h4({ style: 'font-size:14px;margin-bottom:6px' }, 'Pickups on the way'), Object.keys(e.totals.bySub).filter(mid => !(e.removed || []).includes(mid)).map(mid => PLUG.kv(hide && M()[mid].kind === 'pharmacy' ? 'Sealed pickup' : M()[mid].name, PLUG.subStatus(e, mid)))) : null,
          e.type === 'errand' && e.idx >= 1 ? PLUG.notice(['Runner: sample runner. Completion code (give it to the runner only when it is done): ', strong(e.data.code)], '', 'key') : null,
          e.type === 'ride' && e.idx >= 0 ? PLUG.notice(['Trip PIN: ', strong(e.data.pin), e.driver ? ' · ' + e.driver.name + ', ' + e.driver.vehicle + ' ' + e.driver.plate + ' (sample)' : ' · a driver appears here once one accepts'], '', 'key') : null,
          e.type === 'stay' ? PLUG.notice(e.steps.length > 2 ? 'The host has to approve this request before it is a booking.' : 'Instant booking.', '', 'info') : null),
        e.log.length ? div({ class: 'card', style: 'margin-top:12px' }, h4('Activity'), e.log.slice().reverse().map(l => div({ class: 'kv small' }, span(l.label), span({ class: 'muted' }, l.t)))) : null,
        e.delay && !e.delay.resolved ? div({ class: 'card', style: 'margin-top:12px;border-color:var(--warn)' }, h4('Delay at ' + M()[e.delay.mid].name), p({ class: 'small muted' }, 'This pickup is running late. You choose what happens. The cost of each choice is shown before you pick.'),
          PLUG.optcard({ k: 'd-w', group: 'dly', title: 'Wait for it', sub: 'Everything arrives together once it is ready. No extra cost.', pick: () => delay('wait') }),
          PLUG.optcard({ k: 'd-r', group: 'dly', title: 'Remove those items', sub: 'The rest goes on. You are refunded ' + fmt(e.totals.bySub[e.delay.mid].total) + ' for them.', pick: () => delay('remove') }),
          PLUG.optcard({ k: 'd-s', group: 'dly', title: 'Send the rest now, those later', sub: 'A separate delivery for ' + M()[e.delay.mid].name + ' costs ' + fmt(e.plan.separate.find(x => x.merchantId === e.delay.mid).fee) + ' extra.', pick: () => delay('split') })) : null),
      div({ class: 'sticky' }, div({ class: 'card' }, h3('Summary'), e.lines ? e.lines.map(l => PLUG.kv(l.qty + ' × ' + (hide && l.sensitive ? 'Personal item' : l.name), fmt(l.price * l.qty))) : null,
        e.totals ? [PLUG.kv('Delivery', fmt(e.totals.delivery + e.totals.consolidation)), e.totals.tip ? PLUG.kv('Tip', fmt(e.totals.tip)) : null, e.totals.discount ? PLUG.kv('Promo', '-' + fmt(e.totals.discount)) : null] : null,
        PLUG.kv('Total', fmt(e.total), 'tot'), p({ class: 'small muted' }, 'Payment: ' + (e.paid === 'cod' ? 'cash on delivery' : e.paid === 'demo' ? 'demo test payment (no money moved)' : 'pay when complete')),
        e.address ? p({ class: 'small muted' }, 'Deliver to: ' + e.address.landmark + ' (' + (PLUG.ZONES.find(z => z.id === e.address.zone) || {}).name + ')') : null,
        h4({ style: 'font-size:13px;margin:12px 0 6px;color:var(--fg2)' }, 'Prototype controls'),
        div({ class: 'stack', style: 'gap:8px' },
          !final && !e.cancelled ? button({ class: 'btn sec2 block', onclick: () => PLUG.advance(e.id) }, 'Demo: move to next step') : null,
          e.type === 'order' && e.mode === 'combined' && e.idx >= 1 && e.idx <= 3 && !e.cancelled && !e.delay && Object.keys(e.totals.bySub).length > 1 ? button({ class: 'btn sec2 block', onclick: () => { e.delay = { mid: Object.keys(e.totals.bySub).sort((a, b) => M()[b].prep - M()[a].prep)[0], resolved: false }; PLUG.set(); } }, 'Demo: a pickup is delayed') : null,
          PLUG.canCancel(e) ? button({ class: 'btn danger block', onclick: () => PLUG.cancelEntry(e.id) }, 'Cancel') : null,
          e.type === 'order' && !e.sensitive ? button({ class: 'btn ghost block', onclick: () => { PLUG.reorder(e.id); PLUG.nav('/basket'); } }, 'Order again') : null,
          PLUG.lnk('/help', 'btn ghost block', 'Get help with this order')))));
  };

  /* ---------- Wallet ---------- */
  pages.wallet = () => {
    const methods = [['Cash on delivery', 'Available', '', 'Limit ' + fmt(PLUG.CONFIG.codLimitNewAccount) + ' for new accounts'], ['Demo test payment', 'Prototype only', 'warn', 'Shows success, failure and cancel. No money moves.'], ['Mobile money', 'Not yet integrated', 'bad', 'Needs a provider agreement'], ['Bank card', 'Not yet integrated', 'bad', 'Needs a payment provider agreement'], ['Bank transfer', 'Not yet integrated', 'bad', 'Planned for larger bookings']];
    return div({ class: 'two' }, div(
      div({ class: 'card', style: 'margin-bottom:16px' }, h3('Wallet balance'), div({ class: 'price', style: 'font-size:30px' }, fmt(0)), p({ class: 'small muted', style: 'margin:0' }, 'Top-ups are not connected yet, so there is nothing to add. Refunds on demo payments are recorded below.')),
      div({ class: 'card' }, h3('Transactions'), S.tx.length ? S.tx.map(x => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'nm' }, x.label), div({ class: 'small muted' }, PLUG.prettyDate(x.t.slice(0, 10)) + ' · ' + x.status)), div({ class: 'price' }, fmt(x.amount)))) : p({ class: 'muted small' }, 'No transactions yet.'))),
      div({ class: 'sticky' }, div({ class: 'card' }, h3('Payment methods'), methods.map(m => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'nm' }, m[0]), div({ class: 'small muted' }, m[3])), PLUG.pill(m[1], m[2]))))));
  };

  /* ---------- Saved ---------- */
  pages.saved = () => {
    const f = PLUG.form('saved', { tab: 'merchant' }), sv = S.saved;
    const rows = { merchant: sv.merchant.map(id => M()[id]).filter(Boolean).map(m => [m.name, m.cuisines.join(' · ') || m.blurb, m.kind === 'restaurant' ? '/eats/' + m.id : '/market', 'merchant', m.id]),
      item: sv.item.map(id => PLUG.ITEMS[id]).filter(Boolean).map(i => [i.name, M()[i.merchantId].name + ' · ' + fmt(i.price), null, 'item', i.id, i]),
      stay: sv.stay.map(id => PLUG.STAYS.find(s => s.id === id)).filter(Boolean).map(s => [s.name, s.type + ' · ' + s.area, '/stays/' + s.id, 'stay', s.id]),
      package: sv.package.map(id => PLUG.PACKAGES.find(s => s.id === id)).filter(Boolean).map(s => [s.name, s.summary, '/travel', 'package', s.id]) }[f.tab];
    return div(PLUG.tabs([['merchant', 'Places (' + sv.merchant.length + ')'], ['item', 'Items (' + sv.item.length + ')'], ['stay', 'Stays (' + sv.stay.length + ')'], ['package', 'Trips (' + sv.package.length + ')']], f.tab, (t) => { f.tab = t; PLUG.set(); }),
      rows.length ? div({ class: 'card', style: 'padding:4px 18px' }, rows.map(r => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'nm' }, r[0]), div({ class: 'small muted' }, r[1])), r[5] ? PLUG.addButton(r[5]) : PLUG.lnk(r[2], 'btn sm ghost', 'Open'), PLUG.heart(r[3], r[4]))))
        : PLUG.empty('Nothing saved yet', 'Tap the heart on a place, item, stay or trip to keep it here.', PLUG.lnk('/eats', 'btn pri', 'Browse Eats')));
  };

  /* ---------- Rewards and Plus ---------- */
  pages.rewards = () => {
    const wl = PLUG.form('plus', { contact: '' }), joined = S.waitlist.some(w => w.what === 'plus');
    return div({ class: 'two' }, div(
      div({ class: 'card', style: 'margin-bottom:16px' }, h3('Your points'), div({ class: 'grid g2' }, div(div({ class: 'price', style: 'font-size:30px' }, S.points.confirmed), span({ class: 'small muted' }, 'Confirmed')), div(div({ class: 'price', style: 'font-size:30px' }, S.points.pending), span({ class: 'small muted' }, 'Pending'))),
        p({ class: 'small muted', style: 'margin-top:10px' }, 'You earn 1 point for every NLe ' + PLUG.CONFIG.points.per + ' on completed orders. Points stay pending until the order is delivered and are removed if it is cancelled. What points can be spent on has not been decided, so none can be redeemed yet.')),
      div({ class: 'card' }, h3('Rules'), ul({ class: 'small muted' }, li('Points never expire in this prototype. Final rules need a policy decision.'), li('Promo codes (like WELCOME) are separate from points.'), li('Cancelled or refunded orders earn nothing.')))),
      div({ class: 'sticky' }, div({ class: 'card' }, div({ class: 'eyebrow' }, 'THE PLUG Plus'), h3('A membership is planned'), p({ class: 'small muted' }, 'We have not set the price or the perks, so we are not showing any. Leave a contact and we will tell you when there is something real to join.'),
        joined ? PLUG.notice('You are on the list (demo, nothing was sent).', '', 'check') : [PLUG.in('plus', wl, 'contact', { label: 'Phone or email', ph: '+232 ...' }), button({ class: 'btn pri block', onclick: () => { if (wl.contact.trim()) PLUG.joinWaitlist('plus', wl.contact.trim()); else PLUG.toast('Add a phone or email first', 'warn'); } }, 'Tell me when it is ready')])));
  };

  /* ---------- Account / profile ---------- */
  const cfgIn = (obj, key, lbl) => PLUG.fld(lbl, input({ id: PLUG.id('cfg-' + key), type: 'number', step: 'any', value: obj[key], oninput: (e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) obj[key] = v; PLUG.refresh(); } }));
  pages.account = () => {
    const a = PLUG.currentAddress(), st = S.settings, d = PLUG.CONFIG.delivery;
    const tog = (k, text, sub) => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'nm' }, text), sub ? div({ class: 'small muted' }, sub) : null), h('input', { type: 'checkbox', role: 'switch', id: PLUG.id('set-' + k), checked: !!st[k], 'aria-label': text, style: 'width:22px;height:22px;accent-color:#7FB800', onchange: (e) => { st[k] = e.target.checked; PLUG.set(); } }));
    return div({ class: 'two' }, div(
      div({ class: 'card', style: 'margin-bottom:16px' }, h3('Your THE PLUG'), div({ class: 'grid g2 keep' }, [['/sell', 'shop', S.myShop ? 'My shop' : 'Sell on THE PLUG'], ['/tickets', 'receipt', 'My tickets'], ['/requests', 'send', 'Quote requests'], ['/events', 'calendar', 'Events'], ['/agent', 'key', 'Door agent mode'], ['/map', 'map', 'Map and my pin']].map(x => PLUG.lnk(x[0], 'btn sec2', ico(x[1], 16), x[2])))),
      div({ class: 'card', style: 'margin-bottom:16px' }, h3('Profile'), S.user ? [PLUG.kv('Name', S.user.name), PLUG.kv('Contact', S.user.contact), button({ class: 'btn ghost sm', onclick: PLUG.signOut }, 'Sign out')] : [p({ class: 'muted small' }, 'You can browse without an account. You sign in when you place an order or booking.'), button({ class: 'btn pri', onclick: () => PLUG.requireAuth() }, 'Sign in or sign up')]),
      div({ class: 'card', style: 'margin-bottom:16px' }, h3('Delivery address'), PLUG.sel('acc', a, 'zone', PLUG.ZONES.map(z => [z.id, PLUG.zoneLabel(z)]), { label: 'Area' }), PLUG.in('acc', a, 'landmark', { label: 'Landmark or directions', ph: 'Opposite the blue gate...' }), PLUG.in('acc', a, 'phone', { label: 'Phone for the courier', type: 'tel' })),
      div({ class: 'card', style: 'margin-bottom:16px' }, h3('Language and data'), PLUG.chipRow(['English', 'Krio (draft)'], S.lang === 'en' ? 'English' : 'Krio (draft)', (c) => PLUG.setLang(c === 'English' ? 'en' : 'kri')),
        S.lang === 'kri' ? PLUG.notice('The Krio text is a first draft for a few words and needs review by native speakers before launch. Missing words show in English.', 'warn', 'info') : null,
        tog('lowData', 'Low-data mode', 'Hides photos and animations so pages load with less data.')),
      div({ class: 'card', style: 'margin-bottom:16px' }, h3('Privacy and notifications'), tog('hideSensitive', 'Hide sensitive wording', 'Care orders show neutral names in lists and notifications, never on the lock screen.'), tog('orderAlerts', 'Order alerts', 'Status updates for your orders.'), tog('offers', 'Offers and news', 'Off by default.'), tog('locationConsent', 'Use my location', 'Not connected in this prototype. Off by default.'))),
      div({ class: 'sticky' }, div({ class: 'card' }, button({ class: 'link', style: 'font-size:16px;font-family:var(--fd)', 'aria-expanded': String(S.cfgOpen), onclick: () => { S.cfgOpen = !S.cfgOpen; PLUG.set(); } }, S.cfgOpen ? 'Hide pricing settings' : 'Admin demo: pricing settings'),
        p({ class: 'small muted' }, 'In the full product an admin console sets these. Change a value here and your basket updates.'),
        S.cfgOpen ? div(cfgIn(PLUG.CONFIG.market, 'storefrontMin', 'Products needed for a custom page'), cfgIn(PLUG.CONFIG.market, 'staleDays', 'Days before seller stock counts as unconfirmed'), cfgIn(PLUG.CONFIG.tickets, 'feePct', 'Ticket fee (%)'), PLUG.sel('cfg', PLUG.CONFIG.tickets, 'payer', [['buyer', 'Ticket fee paid by the buyer'], ['organizer', 'Ticket fee paid by the organizer']], { label: 'Who pays the ticket fee' }), cfgIn(d, 'base', 'Delivery base fee (NLe)'), cfgIn(d, 'perKm', 'Per km (NLe)'), cfgIn(d, 'extraStop', 'Extra stop fee (NLe)'), cfgIn(d, 'consolidationFee', 'Consolidation fee, max (NLe)'), cfgIn(d, 'maxStops', 'Max pickups per rider'), cfgIn(d, 'maxSpreadKm', 'Max spread between pickups (km)'), cfgIn(PLUG.CONFIG, 'codLimitNewAccount', 'Cash on delivery limit, new accounts (NLe)')) : null)));
  };

  /* ---------- About, partner ---------- */
  pages.about = () => {
    const f = PLUG.form('partner', { tab: 'about', name: '', contact: '', what: '', sent: {} });
    const form = (key, title, text, fields) => div({ class: 'two' }, div({ class: 'card' }, h3(title), p({ class: 'muted' }, text), PLUG.in('pt', f, 'name', { label: 'Your name or business' }), PLUG.in('pt', f, 'contact', { label: 'Phone or email' }), PLUG.in('pt', f, 'what', { label: fields, area: true, rows: 3 }),
      f.sent[key] ? PLUG.notice('Saved in this demo. Nothing was sent to anyone.', '', 'check') : button({ class: 'btn pri', onclick: () => { if (!f.name.trim() || !f.contact.trim()) { PLUG.toast('Add your name and a way to reach you', 'warn'); return; } PLUG.joinWaitlist(key, f.contact + ' (' + f.name + '): ' + f.what); f.sent[key] = true; PLUG.set(); } }, 'Send application')),
      div({ class: 'card' }, h4('What happens next'), p({ class: 'small muted', style: 'margin:0' }, 'In the real product a person from our partner team reviews each application, checks documents and agrees terms before anything goes live. The merchant, driver and partner apps are still to be built.')));
    return div(PLUG.tabs([['about', 'About'], ['partners', 'Partners'], ['sell', 'Sell on THE PLUG'], ['drive', 'Deliver or run errands'], ['host', 'List a stay']], f.tab, (t) => { f.tab = t; PLUG.set(); }),
      f.tab === 'partners' ? PLUG.partnersBlock() : f.tab === 'about' ? div(h2({ style: 'font-size:28px;margin-bottom:8px' }, 'One app for everyday life in Sierra Leone'), p({ class: 'muted', style: 'max-width:62ch' }, 'THE PLUG brings food, groceries, stays, errands, rides, travel, pharmacy and print into one place, and lets one rider bring orders from several shops together. We are starting with a pilot area in Freetown and growing only where partners and couriers are ready.'),
        div({ class: 'grid g3', style: 'margin:18px 0' }, PLUG.SERVICES.map(s => PLUG.lnk(s.route, 'card', div({ class: 'row', style: 'margin-bottom:6px;color:var(--acc)' }, ico(s.icon, 22), strong(s.name)), div({ class: 'small muted' }, s.blurb), div({ class: 'small', style: 'margin-top:6px;color:var(--acc)' }, s.tier)))), PLUG.sechead(null, 'Service hours', PLUG.TIER_NOTE), PLUG.tierBlock())
        : f.tab === 'sell' ? form('merchant', 'Sell on THE PLUG', 'Restaurants, shops, pharmacies and print shops can receive orders, set their own opening hours and mark items out of stock.', 'What do you sell and where?')
          : f.tab === 'drive' ? form('courier', 'Deliver or run errands', 'Couriers and Errand Runner runners are identified and verified before taking work.', 'Your vehicle or what you can help with')
            : form('host', 'List a stay', 'Hosts set prices, blocked dates, rules and cancellation terms.', 'Property type and area'));
  };

  /* ---------- Help and policies ---------- */
  pages.help = () => {
    const f = PLUG.form('help', { msg: '', sent: false, tab: 'faq' });
    const faq = [['Is this a real service yet?', 'No. This is a working prototype with sample partners. Nothing you order here is delivered and no money is taken.'], ['When will it be live?', 'We will announce a pilot area and date once partners, couriers and payments are ready. We will not guess a date here.'], ['Which areas will you start in?', 'A pilot in Freetown (' + PLUG.ZONES.filter(z => z.pilot).map(z => z.name).join(', ') + '). Other areas show as outside the pilot.'], ['How does One Delivery work?', 'One rider collects from several places when the route is short and the price is lower. Otherwise we deliver separately and tell you why.'], ['What if a place is not confirmed open?', 'We show “Unconfirmed” and ask the merchant before you can order.'], ['How are Care orders kept private?', 'Sealed plain bags, neutral wording in lists and notifications, and no sensitive text on the lock screen.'], ['What can I pay with?', 'Cash on delivery (with a limit for new accounts) and a demo test payment. Mobile money and cards are not connected yet.']];
    const pol = [['Terms of use', 'Draft: by using the service you agree to follow local laws and not to misuse couriers or partners.'], ['Privacy notice', 'Draft: we collect only what we need to deliver orders. Sensitive categories get extra protection. Needs legal review.'], ['Refunds and cancellations', 'Draft: free cancellation before a merchant accepts. Each stay and travel provider sets its own terms, shown before you book.'], ['Age-restricted items', 'Draft: age-restricted items need an 18+ confirmation and may need ID at the door.'], ['Care and pharmacy items', 'Draft: medicines are supplied only by licensed pharmacies, within local rules.']];
    return div(PLUG.tabs([['faq', 'Help'], ['policies', 'Policies (draft)'], ['contact', 'Contact support']], f.tab, (t) => { f.tab = t; PLUG.set(); }),
      f.tab === 'faq' ? faq.map(x => details({ class: 'faq' }, summary(x[0], ico('chevD', 16)), div({ class: 'body' }, x[1])))
        : f.tab === 'policies' ? div(PLUG.notice('These are plain-language drafts for a lawyer to review. They are not final terms.', 'warn', 'info'), pol.map(x => details({ class: 'faq' }, summary(x[0], ico('chevD', 16)), div({ class: 'body' }, x[1]))))
          : div({ class: 'card', style: 'max-width:560px' }, h3('Message support'), p({ class: 'small muted' }, 'Planned support hours: extended hours, with urgent order problems prioritised. This demo does not send messages.'),
            f.sent ? PLUG.notice('Message saved in this demo. In the live product a person replies in this thread.', '', 'check') : [PLUG.in('help', f, 'msg', { label: 'How can we help?', area: true, rows: 4 }), button({ class: 'btn pri', onclick: () => { if (f.msg.trim().length < 5) { PLUG.toast('Write a few words first', 'warn'); return; } f.sent = true; PLUG.set(); } }, 'Send (demo)')]));
  };
})(typeof window !== 'undefined' ? window : globalThis);
