/* THE PLUG events: one calendar (no ads), THE PLUG picks, tickets sold by us,
   door agents with an offline ticket list. Events and organizers are SAMPLES. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, h = PLUG.h, ico = PLUG.ico, fmt = PLUG.fmt;
  const { div, span, p, button, h2, h3, h4, strong, input, label, ul, li } = PLUG;
  const pages = PLUG.pages;
  const gap = (n) => h('div', { style: 'height:' + (n || 14) + 'px' });
  const NS = 'http://www.w3.org/2000/svg';

  PLUG.CONFIG.tickets = { feePct: 5, payer: 'buyer' };
  const untilFriday = () => { const d = new Date(); return (5 - d.getDay() + 7) % 7; };
  const TYPES = ['Music', 'Comedy', 'Sports', 'Car cinema', 'Festival', 'Esports'];
  const look = { Music: ['studio', 'moon'], Comedy: ['food', 'message'], Sports: ['market', 'flag'], 'Car cinema': ['one', 'car'], Festival: ['travel', 'users'], Esports: ['ride', 'bolt'] };
  const REF = 'Full refund up to 24 hours before the start. After that, refunds only if the event is cancelled.';
  PLUG.EVENTS = [
    { id: 'e1', title: 'DA HOOD Car Theater: Friday Night Movie', type: 'Car cinema', day: untilFriday(), time: '19:30', venue: 'Open-air lot, Lumley (sample)', zone: 'lumley', org: { name: 'DA HOOD', tag: 'DA HOOD', verified: true, sellerId: 'dahood', partner: true }, pick: true, status: 'approved', tiers: [{ id: 'car', n: 'Car pass, one car', p: 150 }, { id: 'walk', n: 'Walk-in seat', p: 50 }], refund: REF, desc: 'A pop-up drive-in under the stars. During the film, order food from THE PLUG Eats and a rider brings it to your car. This is the proposed first pilot of the THE PLUG and DA HOOD partnership.' },
    { id: 'e2', title: 'Beach Sounds Live', type: 'Music', day: 2, time: '20:00', venue: 'Beach stage, Lumley Beach (sample)', zone: 'lumley', org: { name: 'Sample Promotions', tag: 'Sample Promotions', verified: true }, pick: false, status: 'approved', tiers: [{ id: 'reg', n: 'Regular', p: 100 }, { id: 'vip', n: 'VIP', p: 250 }], refund: REF, desc: 'Live bands and DJs by the sea.' },
    { id: 'e3', title: 'Laugh Out Loud: Comedy Night', type: 'Comedy', day: 4, time: '19:00', venue: 'Hall in Aberdeen (sample)', zone: 'aberdeen', org: { name: 'Sample Comedy Club', tag: 'Comedy Club', verified: true }, pick: true, status: 'approved', tiers: [{ id: 'reg', n: 'Regular', p: 80 }], refund: REF, desc: 'Stand-up from local comedians.' },
    { id: 'e4', title: 'CODM Community Cup', type: 'Esports', day: 6, time: '14:00', venue: 'Gaming lounge, Wilkinson Road (sample)', zone: 'wilkinson', org: { name: 'DA HOOD Gaming', tag: 'DA HOOD Gaming', verified: true, partner: true }, pick: false, status: 'approved', tiers: [{ id: 'player', n: 'Player entry', p: 50 }, { id: 'spec', n: 'Spectator', p: 0 }], refund: REF, desc: 'Call of Duty: Mobile community tournament. Spectators free with a pass.' },
    { id: 'e5', title: 'Sunday Football Fun Day', type: 'Sports', day: 3, time: '15:00', venue: 'Community field (sample)', zone: 'wilkinson', org: { name: 'Community Sports (sample)', tag: 'Community Sports', verified: true }, pick: false, status: 'approved', tiers: [{ id: 'free', n: 'Free entry pass', p: 0 }], refund: 'Free event.', desc: 'Five-a-side games for all ages.' },
    { id: 'e6', title: 'Freetown Food Fair', type: 'Festival', day: 9, time: '12:00', venue: 'Open grounds, Aberdeen (sample)', zone: 'aberdeen', org: { name: 'Sample Events Co.', tag: 'Sample Events', verified: true }, pick: true, status: 'approved', tiers: [{ id: 'day', n: 'Day pass', p: 60 }], refund: REF, desc: 'Food stalls, music and cooking demos.' },
    { id: 'e7', title: 'Rooftop Party', type: 'Music', day: 7, time: '21:00', venue: 'Rooftop venue (sample)', zone: 'aberdeen', org: { name: 'New organizer (sample)', tag: 'New organizer', verified: false }, pick: false, status: 'pending', tiers: [{ id: 'reg', n: 'Regular', p: 120 }], refund: REF, desc: 'Posted by an organizer who has not been checked yet.' }
  ];

  const baseInit = PLUG.init;
  PLUG.init = function () { baseInit(); Object.assign(S, { tickets: [], evState: {}, myEvents: [], agent: { name: '', eventId: '', lists: {}, online: true, log: [], pending: [], result: null } }); };

  PLUG.allEvents = () => PLUG.EVENTS.concat(S.myEvents || []);
  PLUG.eventById = (id) => PLUG.allEvents().find(e => e.id === id);
  const st = (e) => (S.evState[e.id] && S.evState[e.id].status) || e.status;
  const verified = (e) => e.org.verified || !!(S.evState[e.id] && S.evState[e.id].verified);
  PLUG.eventDate = (e) => e.date || PLUG.addDays(S.today, e.day);
  const dayLabel = (iso) => { const n = PLUG.nights(S.today, iso); if (n === 0) return 'Today'; if (n === 1) return 'Tomorrow'; try { return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); } catch (x) { return iso; } };
  const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = (rnd) => 'PLG-' + Array.from({ length: 4 }, () => ALPH[Math.floor(rnd() * ALPH.length)]).join('');
  const seeded = (seed) => { let x = 0; for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };
  const fees = (sub) => { const c = PLUG.CONFIG.tickets, fee = Math.round(sub * c.feePct / 100); return { sub, fee, total: c.payer === 'buyer' ? sub + fee : sub, payer: c.payer }; };
  const priceFrom = (e) => { const paid = e.tiers.filter(t => t.p > 0); return paid.length ? 'from ' + fmt(Math.min(...paid.map(t => t.p))) : 'Free'; };
  const evPhoto = (e, cls) => PLUG.Photo((look[e.type] || ['studio'])[0], (look[e.type] || [0, 'calendar'])[1], cls);
  const orgTag = (e) => e.org.sellerId && PLUG.MERCH[e.org.sellerId] ? PLUG.byTag(PLUG.MERCH[e.org.sellerId]) : span({ class: 'bytag static' }, 'by ' + e.org.tag);
  const statusPills = (e) => [st(e) === 'cancelled' ? PLUG.pill('Cancelled', 'bad') : st(e) === 'pending' ? PLUG.pill('Pending review', 'warn') : null, e.pick ? PLUG.pill('THE PLUG pick', '', 'bolt') : null, e.org.partner ? PLUG.pill('Proposed partner', 'mute') : null];

  const baseIndex = PLUG.searchIndex;
  PLUG.searchIndex = () => baseIndex().concat(PLUG.allEvents().map(e => ({ cat: 'Events', title: e.title, sub: dayLabel(PLUG.eventDate(e)) + ' · ' + e.type + ' · ' + e.venue, route: '/events/' + e.id, kind: 'event', id: e.id })));

  /* ---------- calendar ---------- */
  pages.events = () => {
    const f = PLUG.form('cal', { day: 'all', type: 'All', picks: false });
    const days = Array.from({ length: 14 }, (_, i) => PLUG.addDays(S.today, i));
    const list = PLUG.allEvents().filter(e => { const d = PLUG.eventDate(e); return d >= S.today && (f.day === 'all' || d === f.day) && (f.type === 'All' || e.type === f.type) && (!f.picks || e.pick); }).sort((a, b) => (PLUG.eventDate(a) + a.time).localeCompare(PLUG.eventDate(b) + b.time));
    const byDay = {}; list.forEach(e => { (byDay[PLUG.eventDate(e)] = byDay[PLUG.eventDate(e)] || []).push(e); });
    return div(
      div({ class: 'row between', style: 'margin-bottom:14px' }, p({ class: 'muted', style: 'margin:0;max-width:60ch' }, 'Everything on in Freetown, in one calendar. No ads: every checked event is listed. Sample events.'),
        div({ class: 'row' }, PLUG.lnk('/tickets', 'btn ghost sm', ico('receipt', 16), 'My tickets' + (S.tickets.length ? ' (' + S.tickets.length + ')' : '')), PLUG.lnk('/events/new', 'btn pri sm', ico('plus', 16), 'Post an event'))),
      div({ class: 'datestrip', 'data-scroll': 'dates', role: 'group', 'aria-label': 'Pick a day' }, button({ class: 'dchip' + (f.day === 'all' ? ' on' : ''), 'aria-pressed': String(f.day === 'all'), onclick: () => { f.day = 'all'; PLUG.set(); } }, strong('All'), span('upcoming')),
        days.map(d => { const n = PLUG.allEvents().filter(e => PLUG.eventDate(e) === d).length, lab = dayLabel(d).split(' ');
          return button({ class: 'dchip' + (f.day === d ? ' on' : ''), 'aria-pressed': String(f.day === d), 'aria-label': dayLabel(d) + ', ' + n + ' events', onclick: () => { f.day = d; PLUG.set(); } }, strong(lab[0].replace(',', '')), span(lab.slice(1).join(' ') || ' '), n ? span({ class: 'dot' }) : null); })),
      div({ class: 'row between', style: 'margin:14px 0 18px' }, PLUG.chipRow(['All'].concat(TYPES), f.type, (t) => { f.type = t; PLUG.set(); }), PLUG.chk('cal', f, 'picks', 'THE PLUG picks only')),
      list.length ? Object.keys(byDay).map(d => div({ style: 'margin-bottom:22px' }, h3({ style: 'margin-bottom:10px' }, dayLabel(d)), div({ class: 'listing' }, byDay[d].map(e => PLUG.lnk('/events/' + e.id, 'lcard' + (st(e) === 'cancelled' ? ' off' : ''), evPhoto(e), div({ class: 'body' }, span({ class: 'nm' }, e.title), span({ class: 'small muted' }, e.time + ' · ' + e.venue), div({ class: 'row', style: 'gap:6px' }, statusPills(e)), div({ class: 'row between', style: 'margin-top:auto' }, span({ class: 'small muted' }, 'by ' + e.org.tag + (verified(e) ? ' ✓' : '')), span({ class: 'price' }, priceFrom(e)))))))))
        : PLUG.empty('Nothing on that day yet', 'Try another day or type.', button({ class: 'btn pri', onclick: () => { Object.assign(f, { day: 'all', type: 'All', picks: false }); PLUG.set(); } }, 'Show everything')),
      div({ class: 'card', style: 'margin-top:8px' }, h4('Working the door?'), p({ class: 'small muted', style: 'margin:0 0 10px' }, 'Agents check tickets with the scanner, even without signal.'), PLUG.lnk('/agent', 'btn ghost sm', ico('key', 16), 'Open door agent mode')));
  };

  /* ---------- event page and tickets ---------- */
  pages.event = (id) => {
    const e = PLUG.eventById(id); if (!e) return PLUG.empty('Event not found', '', PLUG.lnk('/events', 'btn pri', 'All events'));
    const f = PLUG.form('ev-' + id, { qty: {}, outcome: 'success', err: '' });
    const s = st(e), onSale = s === 'approved' && verified(e), past = PLUG.eventDate(e) < S.today;
    const sub = e.tiers.reduce((a, t) => a + t.p * (+f.qty[t.id] || 0), 0), count = e.tiers.reduce((a, t) => a + (+f.qty[t.id] || 0), 0), money = fees(sub);
    const buy = () => {
      f.err = ''; if (!count) { f.err = 'Choose how many tickets.'; PLUG.set(); return; }
      PLUG.requireAuth(() => {
        if (money.total > 0 && f.outcome === 'failure') { S.tx.unshift({ id: PLUG.uid('tx'), t: new Date().toISOString(), label: 'Tickets: ' + e.title, amount: money.total, status: 'Failed (demo)' }); f.err = 'The demo payment failed. No money was taken.'; PLUG.set(); return; }
        const rnd = Math.random; e.tiers.forEach(t => { for (let i = 0; i < (+f.qty[t.id] || 0); i++) S.tickets.unshift({ id: PLUG.uid('tk'), code: code(rnd), eventId: e.id, tier: t.n, price: t.p, holder: S.user.contact, status: 'valid', usedAt: '', by: '' }); });
        if (money.total > 0) S.tx.unshift({ id: PLUG.uid('tx'), t: new Date().toISOString(), label: 'Tickets: ' + e.title, amount: money.total, status: 'Paid (demo)' });
        f.qty = {}; PLUG.toast(count + ' ticket' + (count > 1 ? 's' : '') + ' ready'); PLUG.nav('/tickets');
      });
    };
    const cancelEv = () => {
      S.evState[e.id] = Object.assign({}, S.evState[e.id], { status: 'cancelled' });
      S.tickets.filter(t => t.eventId === e.id && t.status !== 'refunded').forEach(t => { t.status = 'refunded'; if (t.price) S.tx.unshift({ id: PLUG.uid('tx'), t: new Date().toISOString(), label: 'Refund: ' + e.title + ', ' + t.tier, amount: t.price, status: 'Refund (demo)' }); });
      PLUG.toast('Event cancelled. Ticket holders refunded (demo).'); PLUG.set();
    };
    return div({ class: 'two' },
      div(evPhoto(e, 'wide'), gap(12), div({ class: 'row', style: 'gap:6px;margin-bottom:8px' }, PLUG.pill(e.type, 'mute'), statusPills(e)),
        h2({ style: 'font-size:28px;margin-bottom:6px' }, e.title),
        p({ class: 'muted' }, dayLabel(PLUG.eventDate(e)) + ' at ' + e.time + ' · ' + e.venue),
        div({ class: 'row', style: 'margin-bottom:14px' }, orgTag(e), verified(e) ? PLUG.pill('Checked organizer', '', 'check') : PLUG.pill('Organizer not checked yet', 'warn')),
        p(e.desc),
        div({ class: 'card', style: 'margin:14px 0' }, h4('Refunds'), p({ class: 'small muted', style: 'margin:0' }, e.refund + ' Organizers are paid after the event, so refunds come from money THE PLUG still holds.')),
        e.org.partner ? PLUG.notice('This listing shows a proposed DA HOOD partnership. Nothing is signed yet.', '', 'info') : null,
        div({ class: 'card' }, h4({ style: 'font-size:14px;color:var(--fg2)' }, 'Prototype controls'), div({ class: 'row' },
          s === 'pending' ? button({ class: 'btn sec2 sm', onclick: () => { S.evState[e.id] = { status: 'approved', verified: true }; PLUG.toast('Organizer checked and approved (demo admin)'); PLUG.set(); } }, 'Demo: approve organizer') : null,
          s !== 'cancelled' ? button({ class: 'btn danger sm', onclick: cancelEv }, 'Demo: organizer cancels event') : null))),
      div({ class: 'sticky' }, div({ class: 'card' }, h3('Tickets'),
        s === 'cancelled' ? PLUG.notice('This event was cancelled. Everyone who bought tickets is refunded.', 'bad')
          : !onSale ? PLUG.notice('Tickets go on sale once THE PLUG has checked this organizer.', 'warn', 'clock')
            : past ? PLUG.notice('This event has passed.', 'warn')
              : [e.tiers.map(t => div({ class: 'item' }, div({ class: 'grow' }, div({ class: 'nm' }, t.n), div({ class: 'small muted' }, t.p ? fmt(t.p) + ' each' : 'Free')), PLUG.qtyCtl(+f.qty[t.id] || 0, (q) => { f.qty[t.id] = Math.max(0, Math.min(10, q)); PLUG.set(); }, t.n))),
                count ? [PLUG.kv('Tickets', fmt(money.sub)), money.sub ? PLUG.kv('Ticket fee (' + PLUG.CONFIG.tickets.feePct + '%, sample)', money.payer === 'buyer' ? fmt(money.fee) : 'Paid by organizer') : null, PLUG.kv('Total', fmt(money.total), 'tot')] : null,
                money.total > 0 ? [p({ class: 'small muted' }, 'Payment: demo test payment only. Mobile money is not yet integrated.'), PLUG.sel('ev' + id, f, 'outcome', [['success', 'Demo result: success'], ['failure', 'Demo result: payment fails']], { label: 'Test payment' })] : null,
                f.err ? PLUG.notice(f.err, 'bad') : null,
                button({ class: 'btn pri block', onclick: buy }, money.total > 0 ? 'Pay ' + fmt(money.total) + ' (demo)' : 'Get free pass' + (count > 1 ? 'es' : '')),
                p({ class: 'small muted', style: 'margin-top:10px' }, 'Each ticket has its own code and works once at the door.')])));
  };

  // a drawn pattern from the code; clearly not a real QR in this prototype
  PLUG.ticketArt = (c) => {
    const r = seeded(c), n = 9, sz = 9; let cells = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const corner = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5); const on = corner ? !(x % 3 === 1 && y % 3 === 1 && false) : r() > 0.5; if (on) cells += '<rect x="' + x * sz + '" y="' + y * sz + '" width="' + sz + '" height="' + sz + '"/>'; }
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 81 81'); s.setAttribute('class', 'tart'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', 'Demo ticket pattern for ' + c); s.innerHTML = '<rect width="81" height="81" fill="#fff"/><g fill="#0B130D">' + cells + '</g>'; return s;
  };
  pages.tickets = () => {
    if (!S.tickets.length) return PLUG.empty('No tickets yet', 'Tickets you buy show here with their door code.', PLUG.lnk('/events', 'btn pri', 'See what’s on'));
    return div(PLUG.notice('In this prototype the square is a drawn pattern, not a scannable QR code. Give the agent the backup code under it.', 'warn', 'info'),
      div({ class: 'grid g2' }, S.tickets.map(t => { const e = PLUG.eventById(t.eventId) || { title: 'Event', venue: '', time: '' };
        return div({ class: 'ticketcard' + (t.status !== 'valid' ? ' spent' : '') }, div({ class: 'tl' }, div({ class: 'small', style: 'color:var(--mut)' }, t.tier), strong({ style: 'font-size:17px' }, e.title), div({ class: 'small', style: 'color:#C9D6CC' }, (e.id ? dayLabel(PLUG.eventDate(e)) : '') + ' · ' + e.time + ' · ' + e.venue),
          div({ style: 'margin-top:8px' }, t.status === 'valid' ? PLUG.pill('Valid, not used') : t.status === 'used' ? PLUG.pill('Used ' + t.usedAt + (t.by ? ' · ' + t.by : ''), 'mute') : PLUG.pill('Refunded', 'bad'))),
          div({ class: 'tr' }, PLUG.ticketArt(t.code), div({ class: 'tcode' }, t.code))); })));
  };

  /* ---------- post an event ---------- */
  pages.eventNew = () => {
    const f = PLUG.form('evnew', { title: '', type: 'Music', date: '', time: '19:00', venue: '', zone: 'lumley', desc: '', free: false, t1n: 'Regular', t1p: '', t2n: '', t2p: '', refund: REF, org: '', agree: false, err: '' });
    const post = () => {
      f.err = '';
      if (f.title.trim().length < 4) f.err = 'Add the event name.'; else if (!f.date || f.date < S.today) f.err = 'Choose a date from today on.'; else if (!f.venue.trim()) f.err = 'Add the venue.'; else if (!f.org.trim()) f.err = 'Add the organizer name people will see.';
      else if (!f.free && !(+f.t1p > 0)) f.err = 'Add a ticket price, or mark it as free.'; else if (!f.agree) f.err = 'Please confirm the organizer rules.';
      if (f.err) { PLUG.set(); return; }
      PLUG.requireAuth(() => {
        const tiers = f.free ? [{ id: 'free', n: 'Free pass', p: 0 }] : [{ id: 't1', n: f.t1n.trim() || 'Regular', p: Math.round(+f.t1p) }].concat(f.t2n.trim() && +f.t2p > 0 ? [{ id: 't2', n: f.t2n.trim(), p: Math.round(+f.t2p) }] : []);
        const e = { id: 'my' + PLUG.uid('ev').toLowerCase(), title: f.title.trim(), type: f.type, date: f.date, time: f.time, venue: f.venue.trim(), zone: f.zone, org: { name: f.org.trim(), tag: f.org.trim(), verified: false, mine: true }, pick: false, status: 'pending', tiers, refund: f.refund.trim() || REF, desc: f.desc.trim() || 'No description yet.' };
        S.myEvents.push(e); Object.assign(f, { title: '', venue: '', desc: '', t1p: '', t2n: '', t2p: '', agree: false });
        PLUG.toast('Event posted, waiting for review'); PLUG.nav('/events/' + e.id);
      });
    };
    return div({ class: 'two' }, div({ class: 'card' },
      PLUG.in('evn', f, 'title', { label: 'Event name' }), div({ class: 'grid g3' }, PLUG.sel('evn', f, 'type', TYPES.map(t => [t, t]), { label: 'Type' }), PLUG.in('evn', f, 'date', { label: 'Date', type: 'date', min: S.today }), PLUG.in('evn', f, 'time', { label: 'Start time', type: 'time' })),
      div({ class: 'grid g2' }, PLUG.in('evn', f, 'venue', { label: 'Venue', ph: 'Name and landmark' }), PLUG.sel('evn', f, 'zone', PLUG.ZONES.filter(z => !z.intercity).map(z => [z.id, z.name]), { label: 'Area' })),
      PLUG.in('evn', f, 'desc', { label: 'Description', area: true, rows: 3 }), PLUG.in('evn', f, 'org', { label: 'Organizer name shown on the event', hint: 'Shown as “by …”.' }),
      PLUG.chk('evn', f, 'free', 'Free event'),
      !f.free ? div({ class: 'grid g2' }, PLUG.in('evn', f, 't1n', { label: 'Ticket type' }), PLUG.in('evn', f, 't1p', { label: 'Price (NLe)', type: 'number', min: 1 }), PLUG.in('evn', f, 't2n', { label: 'Second type (optional)', ph: 'VIP' }), PLUG.in('evn', f, 't2p', { label: 'Price (NLe)', type: 'number', min: 1 })) : null,
      PLUG.in('evn', f, 'refund', { label: 'Refund rules', area: true, rows: 2 }),
      PLUG.chk('evn', f, 'agree', 'This is a real event, I have the right to sell tickets for it, and I agree that payouts happen after the event.'),
      f.err ? PLUG.notice(f.err, 'bad') : null, button({ class: 'btn pri', onclick: post }, 'Post event')),
      div({ class: 'sticky' }, div({ class: 'card' }, h3('How it works'), ul({ class: 'small muted' }, li('Every event goes into the calendar. No ads needed.'), li('New organizers are checked by THE PLUG before tickets go on sale.'), li('Ticket fee: ' + PLUG.CONFIG.tickets.feePct + '%, paid by the ' + PLUG.CONFIG.tickets.payer + ' (sample, decision pending).'), li('You are paid after the event. If you cancel, buyers are refunded.'), li('Our door agents check tickets with the scanner.')))));
  };

  /* ---------- door agent mode ---------- */
  const sampleList = (eid) => { const r = seeded(eid + 'door'), e = PLUG.eventById(eid); return Array.from({ length: 12 }, () => ({ code: code(r), tier: e.tiers[Math.floor(r() * e.tiers.length)].n, status: 'valid', usedAt: '', by: '', sample: true })); };
  pages.agent = () => {
    const A = S.agent, f = PLUG.form('agent', { name: '', ev: '', code: '', cashTier: '0', cashN: '1' });
    if (!A.name) return div({ class: 'card', style: 'max-width:520px' }, h3('Start your shift'), p({ class: 'muted small' }, 'Agents sign in with their own name so every scan shows who checked it. In the live app this is a staff account.'),
      PLUG.in('agent', f, 'name', { label: 'Agent name' }), button({ class: 'btn pri', onclick: () => { if (f.name.trim().length < 2) { PLUG.toast('Add your name', 'warn'); return; } A.name = f.name.trim(); PLUG.set(); } }, 'Start shift'));
    const evs = PLUG.allEvents().filter(e => st(e) === 'approved' && verified(e));
    if (!A.eventId) return div({ class: 'card', style: 'max-width:620px' }, h3('Which event are you working?'), evs.map(e => PLUG.optcard({ k: 'ag-' + e.id, group: 'agev', title: e.title, sub: dayLabel(PLUG.eventDate(e)) + ' · ' + e.time + ' · ' + e.venue, pick: () => { A.eventId = e.id; PLUG.set(); } })), button({ class: 'link small', onclick: () => { A.name = ''; PLUG.set(); } }, 'End shift'));
    const e = PLUG.eventById(A.eventId), list = A.lists[e.id];
    const live = () => S.tickets.filter(t => t.eventId === e.id);
    const download = () => { const mine = live().map(t => ({ code: t.code, tier: t.tier, status: t.status, usedAt: t.usedAt, by: t.by, ref: t.id })); A.lists[e.id] = { at: PLUG.clock(), tickets: sampleList(e.id).concat(mine) }; PLUG.toast('Ticket list saved on this phone'); PLUG.set(); };
    const sync = () => { A.pending.forEach(x => { const t = S.tickets.find(k => k.code === x.code); if (t && t.status === 'valid') Object.assign(t, { status: 'used', usedAt: x.usedAt, by: x.by }); }); const n = A.pending.length; A.pending = []; if (n) PLUG.toast(n + ' scan' + (n > 1 ? 's' : '') + ' synced'); };
    const check = (raw) => {
      const c = (raw || '').trim().toUpperCase().replace(/\s+/g, ''); if (!c) return;
      let res;
      if (!list) res = { ok: false, t: 'Download the ticket list first.' };
      else {
        let t = list.tickets.find(k => k.code === c);
        if (!t && A.online) { const l = live().find(k => k.code === c); if (l) { t = { code: l.code, tier: l.tier, status: l.status, usedAt: l.usedAt, by: l.by, ref: l.id }; list.tickets.push(t); } }
        if (!t) { const other = S.tickets.find(k => k.code === c); res = other ? { ok: false, t: 'This ticket is for a different event.' } : !A.online ? { ok: false, t: 'Not in the offline list. Check again when back online.' } : { ok: false, t: 'Code not found. It may be fake or mistyped.' }; }
        else if (t.status === 'used') res = { ok: false, t: 'Already used at ' + t.usedAt + (t.by ? ' (checked by ' + t.by + ')' : '') + '.', tier: t.tier };
        else if (t.status === 'refunded') res = { ok: false, t: 'Refunded ticket. Not valid.', tier: t.tier };
        else {
          Object.assign(t, { status: 'used', usedAt: PLUG.clock(), by: A.name });
          if (t.ref) { if (A.online) { const lt = S.tickets.find(k => k.id === t.ref); if (lt) Object.assign(lt, { status: 'used', usedAt: t.usedAt, by: A.name }); } else A.pending.push({ code: t.code, usedAt: t.usedAt, by: A.name }); }
          res = { ok: true, t: 'Valid. Let them in.', tier: t.tier };
        }
      }
      res.code = c; A.result = res; A.log.unshift({ t: PLUG.clock(), text: c + ': ' + (res.ok ? 'admitted' : res.t) }); f.code = ''; PLUG.set();
    };
    const used = list ? list.tickets.filter(t => t.status === 'used').length : 0, total = list ? list.tickets.length : 0;
    return div({ class: 'two' },
      div(div({ class: 'card', style: 'margin-bottom:14px' }, div({ class: 'row between' }, div(strong(e.title), div({ class: 'small muted' }, 'Agent: ' + A.name + ' · ' + e.venue)), button({ class: 'link small', onclick: () => { A.eventId = ''; A.result = null; PLUG.set(); } }, 'Switch event')),
          div({ class: 'row', style: 'margin-top:12px' }, list ? PLUG.pill('List saved at ' + list.at + ' · ' + total + ' tickets', '', 'check') : PLUG.pill('No ticket list on this phone', 'warn'), button({ class: 'btn sm ' + (list ? 'ghost' : 'pri'), onclick: download }, list ? 'Refresh list' : 'Download ticket list'),
            button({ class: 'btn sm sec2', 'aria-pressed': String(!A.online), onclick: () => { A.online = !A.online; if (A.online) sync(); PLUG.set(); } }, ico(A.online ? 'globe' : 'wifioff', 16), A.online ? 'Online' : 'Offline (demo)')),
          A.pending.length ? p({ class: 'small', style: 'margin:8px 0 0;color:var(--warn-l)' }, A.pending.length + ' scan(s) waiting to sync') : null),
        A.result ? div({ class: 'scan ' + (A.result.ok ? 'ok' : 'bad'), role: 'status', 'aria-live': 'assertive' }, ico(A.result.ok ? 'check' : 'x', 40), div(div({ class: 'scanbig' }, A.result.ok ? 'VALID' : 'STOP'), div(A.result.t), A.result.tier ? div({ class: 'small' }, A.result.tier + ' · ' + A.result.code) : div({ class: 'small' }, A.result.code))) : null,
        div({ class: 'card', style: 'margin-top:14px' }, h3('Check a ticket'), p({ class: 'small muted' }, 'The live app scans the QR with the camera. Here, type the backup code or use the demo buttons.'),
          div({ class: 'row', style: 'flex-wrap:nowrap;align-items:flex-end' }, div({ class: 'grow' }, PLUG.in('agent', f, 'code', { label: 'Ticket code', ph: 'PLG-XXXX' })), button({ class: 'btn pri', style: 'margin-bottom:14px', onclick: () => check(f.code) }, 'Check')),
          div({ class: 'row' }, button({ class: 'btn sm sec2', disabled: !list, onclick: () => { const v = list.tickets.filter(t => t.status === 'valid'); if (!v.length) { PLUG.toast('Everyone is in', 'warn'); return; } check(v[Math.floor(Math.random() * v.length)].code); } }, 'Demo: scan a sample ticket'), button({ class: 'btn sm sec2', disabled: !list || !used, onclick: () => check(list.tickets.find(t => t.status === 'used').code) }, 'Demo: scan a used one'), button({ class: 'btn sm sec2', onclick: () => check('PLG-FAKE') }, 'Demo: fake code'))),
        div({ class: 'card', style: 'margin-top:14px' }, h3('Cash sale at the door'), div({ class: 'row', style: 'align-items:flex-end' }, div({ class: 'grow' }, PLUG.sel('agent', f, 'cashTier', e.tiers.map((t, i) => [i, t.n + ' · ' + (t.p ? fmt(t.p) : 'Free')]), { label: 'Ticket type' })), div({ style: 'width:90px' }, PLUG.in('agent', f, 'cashN', { label: 'How many', type: 'number', min: 1, max: 20 })),
          button({ class: 'btn ghost', style: 'margin-bottom:14px', onclick: () => { const t = e.tiers[+f.cashTier], n = Math.max(1, Math.round(+f.cashN || 1)); A.log.unshift({ t: PLUG.clock(), text: 'Cash sale: ' + n + ' × ' + t.n + ', ' + fmt(t.p * n) + (A.online ? '' : ' (waiting to sync)') }); PLUG.toast('Cash sale recorded'); PLUG.set(); } }, 'Record')))),
      div({ class: 'sticky' }, div({ class: 'card' }, h3('Door count'), div({ class: 'price', style: 'font-size:30px' }, used + ' / ' + total), p({ class: 'small muted' }, 'checked in, from the list on this phone'),
        h4({ style: 'margin:12px 0 6px' }, 'Shift log'), A.log.length ? A.log.slice(0, 14).map(l => div({ class: 'kv small' }, span(l.text), span({ class: 'muted' }, l.t))) : p({ class: 'small muted' }, 'Nothing yet.'),
        button({ class: 'link small', style: 'margin-top:10px', onclick: () => { A.name = ''; A.eventId = ''; A.result = null; PLUG.set(); } }, 'End shift'))));
  };
})(typeof window !== 'undefined' ? window : globalThis);
