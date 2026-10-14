/* THE PLUG pages, part 2: Errands, Ride, Care, Studio, Stays, Travel. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, h = PLUG.h, ico = PLUG.ico, M = () => PLUG.MERCH, fmt = PLUG.fmt;
  const { div, span, p, button, h2, h3, h4, label, ul, li, input, strong, details, summary } = PLUG;
  const pages = PLUG.pages;
  const gap = (n) => h('div', { style: 'height:' + (n || 14) + 'px' });
  const rowsTable = (rows) => rows.map(r => PLUG.kv(r[0], fmt(r[1])));

  /* ---------- Errands (powered by Errand Runner, integration pending) ---------- */
  pages.errands = () => {
    const f = PLUG.form('errand', { step: 1, type: 'queue', what: '', pickup: '', dropoff: '', km: '3', stops: '1', waitMin: '30', night: false, budget: '', agree: false, err: '' });
    const type = PLUG.ERRAND_TYPES.find(t => t.id === f.type);
    const qIn = () => ({ km: f.km, stops: f.type === 'multi' ? f.stops : 1, waitMin: f.type === 'queue' ? f.waitMin : 0, night: f.night, budget: f.type === 'buy' ? f.budget : 0 });
    const q = PLUG.errandQuote(qIn());
    const next = () => {
      f.err = '';
      if (f.step === 2) {
        if (!f.what.trim()) f.err = 'Describe what the runner should do.';
        else if (!f.pickup.trim()) f.err = 'Add where the runner should start.';
        else if (f.type !== 'queue' && !f.dropoff.trim()) f.err = 'Add where it should end up.';
        else if (f.type === 'buy' && !(+f.budget > 0)) f.err = 'Add a budget for the item so the runner knows the limit.';
        else if (!(+f.km >= 0)) f.err = 'Distance must be a number.';
      }
      if (!f.err) f.step++; PLUG.set();
    };
    const send = () => {
      if (!f.agree) { f.err = 'Please approve the estimated cost first.'; PLUG.set(); return; }
      PLUG.requireAuth(() => { const e = PLUG.requestErrand(f, q); f.step = 1; f.what = ''; f.agree = false; f.err = ''; PLUG.nav('/orders/' + e.id); });
    };
    return div({ class: 'two' },
      div(
        PLUG.notice('Errands are carried out by runners from Errand Runner, a partner service that is still being built. Requests here stay in the demo and are not sent to anyone.', 'warn', 'info'),
        PLUG.tabs([[1, '1. What'], [2, '2. Details'], [3, '3. Review']], f.step, (s) => { if (s < f.step) { f.step = s; PLUG.set(); } }),
        f.step === 1 ? div(PLUG.sechead(null, 'What do you need done?'), PLUG.ERRAND_TYPES.map(t => PLUG.optcard({ k: 'er-' + t.id, group: 'errtype', on: f.type === t.id, title: t.name, sub: t.hint, pick: () => { f.type = t.id; PLUG.set(); } })),
          div({ class: 'grid g2', style: 'margin-top:12px' }, div({ class: 'card' }, h4('Runners can help with'), ul({ class: 'small' }, PLUG.ERRAND_ALLOWED.map(x => li(x)))), div({ class: 'card' }, h4('Runners will not'), ul({ class: 'small' }, PLUG.ERRAND_PROHIBITED.map(x => li(x))))),
          gap(), button({ class: 'btn pri', onclick: () => { f.step = 2; PLUG.set(); } }, 'Continue', ico('arrow', 18))) : null,
        f.step === 2 ? div(PLUG.sechead(null, type.name),
          PLUG.in('er', f, 'what', { label: 'What should the runner do?', area: true, rows: 3, ph: type.id === 'queue' ? 'Wait in line at the passport office and call me when 5 people are ahead.' : type.id === 'buy' ? 'Buy a 5 kg bag of rice, brand does not matter.' : 'Describe it with as much detail as you can.' }),
          PLUG.in('er', f, 'pickup', { label: type.id === 'queue' ? 'Where is the queue?' : 'Start at', ph: 'Place and landmark' }),
          type.id !== 'queue' ? PLUG.in('er', f, 'dropoff', { label: 'Finish at', ph: 'Place and landmark' }) : null,
          div({ class: 'grid g2' }, PLUG.in('er', f, 'km', { label: 'Approx. distance (km)', type: 'number', min: 0, step: .5, mode: 'decimal', hint: 'A rough guess is fine. Final cost is shown before the runner starts.' }),
            type.id === 'multi' ? PLUG.in('er', f, 'stops', { label: 'Number of stops', type: 'number', min: 1, max: 8 }) : null,
            type.id === 'queue' ? PLUG.in('er', f, 'waitMin', { label: 'Expected wait (minutes)', type: 'number', min: 0, step: 5, hint: 'First ' + PLUG.CONFIG.errand.waitFreeMin + ' minutes are free.' }) : null,
            type.needsBudget ? PLUG.in('er', f, 'budget', { label: 'Budget for the item (NLe)', type: 'number', min: 0, mode: 'numeric', hint: 'The runner will not spend above this without asking you.' }) : null),
          PLUG.chk('er', f, 'night', 'This is a night errand (after 22:00)'),
          f.err ? PLUG.notice(f.err, 'bad') : null,
          div({ class: 'row' }, button({ class: 'btn ghost', onclick: () => { f.step = 1; PLUG.set(); } }, 'Back'), button({ class: 'btn pri', onclick: next }, 'Review cost', ico('arrow', 18)))) : null,
        f.step === 3 ? div(PLUG.sechead(null, 'Review and approve'),
          div({ class: 'card' }, h4(type.name), p({ class: 'small muted' }, f.what), PLUG.kv('From', f.pickup || '-'), f.dropoff ? PLUG.kv('To', f.dropoff) : null),
          gap(10), div({ class: 'card' }, h4('Estimated cost'), rowsTable(q.rows), q.budget ? PLUG.kv('Item budget (receipt required)', fmt(q.budget)) : null, PLUG.kv('Estimated total', fmt(q.total), 'tot'), q.note ? p({ class: 'small muted' }, q.note) : null),
          gap(10), PLUG.notice('You pay when the errand is done. The runner must send proof (receipt or a photo) and a completion code that you confirm. If the real cost will be higher you are asked first.', '', 'shield'),
          PLUG.chk('er', f, 'agree', 'I approve this estimated cost.'),
          f.err ? PLUG.notice(f.err, 'bad') : null,
          div({ class: 'row' }, button({ class: 'btn ghost', onclick: () => { f.step = 2; PLUG.set(); } }, 'Back'), button({ class: 'btn pri', onclick: send }, 'Request runner'))) : null),
      div({ class: 'sticky' }, div({ class: 'card' }, h3('Fast. Safe. Reliable.'), p({ class: 'small muted' }, 'This is how we plan to run it. None of it is live until Errand Runner is connected.'),
        ul({ class: 'small' }, li('Runners are identified and verified before they take work.'), li('You see the cost before anything starts.'), li('Proof and a completion code close every errand.'), li('Anything above your approved cost needs your yes first.')))));
  };

  /* ---------- Ride ---------- */
  pages.ride = () => {
    const f = PLUG.form('ride', { pickup: '', dest: '', km: '5', vehicle: 'standard', pax: '2', bags: '1', when: 'now', date: '', time: '', night: false, err: '' });
    const q = PLUG.rideQuote({ vehicle: f.vehicle, km: f.km, night: f.night, pax: f.pax, bags: f.bags });
    const send = () => {
      f.err = '';
      if (!f.pickup.trim() || !f.dest.trim()) f.err = 'Add both a pickup and a destination.';
      else if (!(+f.km > 0)) f.err = 'Add an approximate distance in km.';
      else if (!q.fitsSeats || !q.fitsBags) f.err = q.vehicle.name + ' seats ' + q.vehicle.seats + ' and takes ' + q.vehicle.bags + ' bags. Pick a bigger vehicle or reduce the load.';
      else if (f.when === 'later' && (!f.date || !f.time)) f.err = 'Choose a date and time for the scheduled ride.';
      if (f.err) { PLUG.set(); return; }
      PLUG.requireAuth(() => { const e = PLUG.requestRide(f, q); PLUG.nav('/orders/' + e.id); });
    };
    return div({ class: 'two' },
      div(
        PLUG.notice('Drivers are not connected to this prototype. A request stays at “Searching for a driver” until you move it forward with the demo control on the order page.', 'warn', 'info'),
        div({ class: 'card' }, h3('Where to?'),
          PLUG.in('ride', f, 'pickup', { label: 'Pickup', ph: 'Place or landmark' }), PLUG.in('ride', f, 'dest', { label: 'Destination', ph: 'Place or landmark' }),
          div({ class: 'grid g3 num' }, PLUG.in('ride', f, 'km', { label: 'Distance (km)', type: 'number', min: 1, step: .5, mode: 'decimal' }), PLUG.in('ride', f, 'pax', { label: 'Passengers', type: 'number', min: 1, max: 12 }), PLUG.in('ride', f, 'bags', { label: 'Bags', type: 'number', min: 0, max: 15 }))),
        gap(12), div({ class: 'card' }, h3('Choose a vehicle'), PLUG.VEHICLES.map(v => PLUG.optcard({ k: 'rv-' + v.id, group: 'veh', on: f.vehicle === v.id, title: v.name, sub: v.note + ' · up to ' + v.seats + ' passengers, ' + v.bags + ' bags', right: fmt(PLUG.rideQuote({ vehicle: v.id, km: f.km, night: f.night }).fare), pick: () => { f.vehicle = v.id; PLUG.set(); } }))),
        gap(12), div({ class: 'card' }, h3('When'), PLUG.chipRow(['Now', 'Schedule'], f.when === 'now' ? 'Now' : 'Schedule', (c) => { f.when = c === 'Now' ? 'now' : 'later'; PLUG.set(); }),
          f.when === 'later' ? div({ class: 'grid g2', style: 'margin-top:12px' }, PLUG.in('ride', f, 'date', { label: 'Date', type: 'date', min: S.today }), PLUG.in('ride', f, 'time', { label: 'Time', type: 'time' })) : null,
          gap(8), PLUG.chk('ride', f, 'night', 'Night trip (after 22:00, +' + PLUG.CONFIG.ride.nightPct + '%)'))),
      div({ class: 'sticky' }, div({ class: 'card' }, h3('Fare estimate'), div({ class: 'price', style: 'font-size:28px' }, fmt(q.lo) + ' – ' + fmt(q.hi)),
        p({ class: 'small muted' }, 'The fare is a range based on distance. ' + q.includedWait + ' minutes of waiting are included, then ' + fmt(q.waitPerMin) + ' per minute.'),
        !q.fitsSeats || !q.fitsBags ? PLUG.notice(q.vehicle.name + ' may be too small for ' + f.pax + ' passengers and ' + f.bags + ' bags.', 'warn') : null,
        PLUG.kv('Payment', 'Cash to the driver'), PLUG.kv('Safety', 'Trip PIN and shared status'),
        p({ class: 'small muted' }, q.cancel), f.err ? PLUG.notice(f.err, 'bad') : null,
        button({ class: 'btn pri block', onclick: send }, 'Request ride'))));
  };

  /* ---------- Care ---------- */
  pages.care = () => {
    const items = PLUG.menuFor('p1'), m = M().p1, ess = items.filter(i => !i.pharmacist), med = items.filter(i => i.pharmacist);
    return div(
      PLUG.notice(['Discreet by design. ', 'Personal essentials arrive in a sealed plain bag, the courier does not open it, and order names stay neutral on screens and notifications. ', PLUG.lnk('/account', 'link', 'Privacy settings')], '', 'lock'),
      div({ class: 'row between', style: 'margin:14px 0' }, h3('Personal essentials'), div({ class: 'row' }, PLUG.statusPill(m), span({ class: 'small muted' }, m.name))),
      PLUG.confirmBar(m),
      div({ class: 'listing' }, ess.map(it => div({ class: 'lcard' }, PLUG.Photo('care', 'care'), div({ class: 'body' }, div({ class: 'row between', style: 'flex-wrap:nowrap' }, span({ class: 'nm' }, it.name), PLUG.heart('item', it.id)), it.sensitive ? PLUG.pill('Sealed bag', '', 'lock') : null, div({ class: 'row between', style: 'margin-top:auto' }, span({ class: 'price' }, fmt(it.price)), PLUG.addButton(it)))))),
      gap(24), h3('Medicines'), p({ class: 'muted small' }, 'Medicines and anything that needs a pharmacist are supplied only by licensed pharmacies, under local rules. They are switched off in this prototype.'),
      div({ class: 'listing' }, med.map(it => div({ class: 'lcard off' }, div({ class: 'body' }, span({ class: 'nm' }, it.name), PLUG.pill('Needs licensed pharmacist', 'warn'), p({ class: 'small muted', style: 'margin:0' }, it.note), button({ class: 'btn sm sec2', disabled: true, style: 'align-self:flex-start' }, 'Not available yet'))))),
      gap(16), PLUG.notice('If you are unwell or in an emergency, contact a health worker or the nearest clinic. This service is not medical advice.', 'warn', 'info'));
  };

  /* ---------- Studio: print, photo, build ---------- */
  pages.studio = () => {
    const f = PLUG.form('studio', { tab: 'print', print: 'pr-cards', variant: 0, design: false, file: '', photo: 'ph-portrait', date: '', where: '', extraHours: '0', outside: false, rush: false, build: 'bd-site', brief: '', extraPages: '0', hosting: false, err: '' });
    const S_ = PLUG.STUDIO; let body;
    const add = (kind, pkg, q, title, sub, meta) => { f.err = ''; PLUG.addBooking({ type: 'studio', title, sub, price: q.total, meta }); PLUG.nav('/basket'); };
    if (f.tab === 'print') {
      const pkg = S_.print.find(x => x.id === f.print), q = PLUG.studioQuote('print', pkg, { variant: +f.variant, design: f.design });
      body = div({ class: 'two' }, div(S_.print.map(x => PLUG.optcard({ k: 'sp-' + x.id, group: 'print', on: f.print === x.id, title: x.name, sub: x.desc + ' · ready in about ' + x.days + ' day' + (x.days > 1 ? 's' : '') + (x.bulky ? ' · delivered separately' : ''), right: 'from ' + fmt(x.variants[0].p), pick: () => { f.print = x.id; f.variant = 0; PLUG.set(); } }))),
        div({ class: 'sticky' }, div({ class: 'card' }, h3(pkg.name), PLUG.sel('st', f, 'variant', pkg.variants.map((v, i) => [i, v.l + ' · ' + fmt(v.p)]), { label: 'Option' }),
          PLUG.chk('st', f, 'design', 'I need design help (sample ' + fmt(80) + ')'),
          PLUG.fld('Upload your artwork (optional)', input({ type: 'file', id: PLUG.id('st-file'), onchange: (e) => { f.file = e.target.files[0] ? e.target.files[0].name : ''; PLUG.set(); } }), { hint: f.file ? 'Chosen: ' + f.file + ' (the demo does not store files).' : 'PDF, PNG or JPG. The demo does not store files.' }),
          rowsTable(q.rows), PLUG.kv('Total', fmt(q.total), 'tot'), p({ class: 'small muted' }, 'Handled by a print partner (sample). A person confirms your file before printing starts.'),
          button({ class: 'btn pri block', onclick: () => add('print', pkg, q, pkg.name + ', ' + pkg.variants[+f.variant].l, 'Print · about ' + pkg.days + ' days', { kind: 'print' }) }, 'Add to basket'))));
    } else if (f.tab === 'photo') {
      const pkg = S_.photo.find(x => x.id === f.photo), q = PLUG.studioQuote('photo', pkg, { extraHours: +f.extraHours, outside: f.outside, rush: f.rush });
      body = div({ class: 'two' }, div(S_.photo.map(x => PLUG.optcard({ k: 'sph-' + x.id, group: 'photo', on: f.photo === x.id, title: x.name, sub: x.desc + ' · ' + x.hours + ' · ' + x.edited + ' · Rights: ' + x.rights, right: fmt(x.price), pick: () => { f.photo = x.id; PLUG.set(); } }))),
        div({ class: 'sticky' }, div({ class: 'card' }, h3(pkg.name), PLUG.in('st', f, 'date', { label: 'Preferred date', type: 'date', min: S.today }), PLUG.in('st', f, 'where', { label: 'Location', ph: 'Studio, or the place and landmark' }),
          PLUG.sel('st', f, 'extraHours', [[0, 'No extra hours'], [1, '+1 hour'], [2, '+2 hours'], [3, '+3 hours']], { label: 'Extra time' }), PLUG.chk('st', f, 'outside', 'Outside the city'), PLUG.chk('st', f, 'rush', 'Rush delivery of edited photos'),
          rowsTable(q.rows), PLUG.kv('Total', fmt(q.total), 'tot'), p({ class: 'small muted' }, 'Delivered in about ' + pkg.days + ' day' + (pkg.days === 1 ? '' : 's') + '. The photographer confirms the date and rights before you pay. Sample photographers only.'),
          f.err ? PLUG.notice(f.err, 'bad') : null,
          button({ class: 'btn pri block', onclick: () => { if (!f.date) { f.err = 'Choose a preferred date.'; PLUG.set(); return; } add('photo', pkg, q, pkg.name, 'Photo · ' + PLUG.prettyDate(f.date), { kind: 'photo', date: f.date }); } }, 'Add booking request'))));
    } else {
      const pkg = S_.build.find(x => x.id === f.build), q = PLUG.studioQuote('build', pkg, { extraPages: +f.extraPages, hosting: f.hosting });
      body = div({ class: 'two' }, div(S_.build.map(x => PLUG.optcard({ k: 'sb-' + x.id, group: 'build', on: f.build === x.id, title: x.name, sub: x.desc + ' · about ' + x.weeks + ' week' + (x.weeks > 1 ? 's' : '') + ' · ' + x.revisions + ' revision rounds', right: fmt(x.price), pick: () => { f.build = x.id; PLUG.set(); } }))),
        div({ class: 'sticky' }, div({ class: 'card' }, h3(pkg.name), PLUG.in('st', f, 'brief', { label: 'Tell us about your business', area: true, rows: 4, ph: 'What you sell, who it is for, examples you like...' }),
          pkg.id === 'bd-site' || pkg.id === 'bd-shop' ? PLUG.in('st', f, 'extraPages', { label: 'Extra pages (' + fmt(500) + ' each)', type: 'number', min: 0, max: 20 }) : null,
          PLUG.chk('st', f, 'hosting', 'Add first month of hosting and care (' + fmt(S_.hosting.monthly) + ')'),
          rowsTable(q.rows), PLUG.kv('Total', fmt(q.total), 'tot'),
          h4({ style: 'font-size:14px;margin:10px 0 4px' }, 'Staged payments'), q.milestones.map(m => PLUG.kv(m.l + ' (' + m.pct + '%)', fmt(m.amt))),
          p({ class: 'small muted' }, 'A provider reviews your brief and sends a quote before you pay anything. Hosting is optional and month to month.'),
          f.err ? PLUG.notice(f.err, 'bad') : null,
          button({ class: 'btn pri block', onclick: () => { if (f.brief.trim().length < 10) { f.err = 'Add a short description so the provider can quote properly.'; PLUG.set(); return; } add('build', pkg, q, pkg.name, 'Build · about ' + pkg.weeks + ' weeks', { kind: 'build', brief: f.brief }); } }, 'Send brief for a quote'))));
    }
    return div(PLUG.tabs([['print', 'Print'], ['photo', 'Photos'], ['build', 'Websites and apps']], f.tab, (t) => { f.tab = t; f.err = ''; PLUG.set(); }),
      PLUG.notice('Studio partners and prices are samples. Nothing is booked until a real provider accepts.', 'warn', 'info'),
      div({ class: 'card row between', style: 'margin-bottom:16px' }, div(strong('Busy, or not what you need?'), div({ class: 'small muted' }, 'Send one request and other registered providers can quote.')), PLUG.lnk('/requests', 'btn ghost sm', 'Ask other providers')), body);
  };

  /* ---------- Stays ---------- */
  const stayDates = () => PLUG.form('stays', () => ({ type: 'All', ci: PLUG.addDays(S.today, 3), co: PLUG.addDays(S.today, 5), guests: '2', err: '' }));
  pages.stays = () => {
    const f = stayDates(), types = ['All', 'Hotel', 'Apartment', 'Guesthouse', 'Holiday rental'];
    const list = PLUG.STAYS.filter(s => f.type === 'All' || s.type === f.type);
    return div(
      div({ class: 'card', style: 'margin-bottom:18px' }, div({ class: 'grid g4' }, PLUG.in('stays', f, 'ci', { label: 'Check in', type: 'date', min: S.today }), PLUG.in('stays', f, 'co', { label: 'Check out', type: 'date', min: PLUG.addDays(f.ci || S.today, 1) }), PLUG.in('stays', f, 'guests', { label: 'Guests', type: 'number', min: 1, max: 12 }),
        PLUG.sel('stays', f, 'type', types.map(t => [t, t === 'All' ? 'Any type' : t]), { label: 'Type' }))),
      PLUG.sechead(null, 'Featured stays', 'Sample properties. Availability below is checked against your dates.'),
      div({ class: 'listing' }, list.map(s => {
        const av = PLUG.stayAvailable(s, S.today, f.ci, f.co, +f.guests || 1, S.stayBookings), q = av.ok ? PLUG.stayQuote(s, f.ci, f.co) : null;
        return div({ class: 'lcard' + (av.ok ? '' : ' off') }, PLUG.lnk('/stays/' + s.id, '', PLUG.Photo('stay', 'bed')), div({ class: 'body' },
          div({ class: 'row between', style: 'flex-wrap:nowrap' }, PLUG.lnk('/stays/' + s.id, 'nm', s.name), PLUG.heart('stay', s.id)), span({ class: 'small muted' }, s.type + ' · ' + s.area + ' · sleeps ' + s.cap),
          div({ class: 'row', style: 'gap:6px' }, PLUG.pill(s.instant ? 'Instant booking' : 'Host approves', s.instant ? '' : 'mute'), av.ok ? PLUG.pill('Available', '') : PLUG.pill(av.why, 'bad')),
          div({ class: 'row between', style: 'margin-top:auto' }, span({ class: 'price' }, fmt(s.rate) + ' / night'), q ? span({ class: 'small muted' }, fmt(q.total) + ' total') : null)));
      })),
      gap(24), div({ class: 'banner' }, div(h3('Own a hotel, guesthouse or apartment?'), p({ class: 'muted', style: 'margin:0' }, 'Hosts set their own prices, blocked dates and cancellation rules.')), PLUG.lnk('/about', 'btn pri', 'List your stay')));
  };
  pages.staysDetail = (id) => {
    const s = PLUG.STAYS.find(x => x.id === id); if (!s) return PLUG.empty('Stay not found', '', PLUG.lnk('/stays', 'btn pri', 'All stays'));
    const f = stayDates(), av = PLUG.stayAvailable(s, S.today, f.ci, f.co, +f.guests || 1, S.stayBookings), q = av.ok ? PLUG.stayQuote(s, f.ci, f.co) : null;
    const blocked = PLUG.stayBlocked(s, S.today, S.stayBookings), cells = [];
    for (let i = 0; i < 28; i++) { const d = PLUG.addDays(S.today, i), b = blocked.some(r => d >= r[0] && d < r[1]), sel = d >= f.ci && d < f.co; cells.push(div({ class: 'cal-d' + (b ? ' b' : '') + (sel ? ' s' : ''), title: b ? 'Not available' : sel ? 'Your dates' : 'Available' }, span(PLUG.prettyDate(d)), span({ class: 'small' }, b ? 'Taken' : sel ? 'You' : 'Free'))); }
    const book = () => {
      if (!av.ok) { PLUG.toast(av.why, 'warn'); return; }
      PLUG.addBooking({ type: 'stay', title: s.name + ', ' + q.nights + ' night' + (q.nights > 1 ? 's' : ''), sub: PLUG.prettyDate(f.ci) + ' to ' + PLUG.prettyDate(f.co) + ' · ' + f.guests + ' guest(s) · ' + (s.instant ? 'instant' : 'host approval'), price: q.total, instant: s.instant, meta: { stayId: s.id, checkIn: f.ci, checkOut: f.co, guests: f.guests } }); PLUG.nav('/basket');
    };
    return div(div({ class: 'two' },
      div(div({ class: 'grid g3 gal' }, PLUG.Photo('stay', 'bed', 'tall'), PLUG.Photo('stay', 'home'), PLUG.Photo('stay', 'image')), gap(12),
        div({ class: 'row between' }, h2({ style: 'font-size:28px' }, s.name), PLUG.heart('stay', s.id)), p({ class: 'muted' }, s.type + ' · ' + s.area + ' · sleeps ' + s.cap + ' · check in ' + s.checkIn + ', check out ' + s.checkOut),
        div({ class: 'card', style: 'margin-bottom:14px' }, h4('What’s included'), div({ class: 'chips', style: 'margin-top:8px' }, s.amenities.map(a => PLUG.pill(a, 'mute')))),
        div({ class: 'card', style: 'margin-bottom:14px' }, h4('House rules'), p({ class: 'small muted', style: 'margin:0' }, s.rules)), div({ class: 'card', style: 'margin-bottom:14px' }, h4('Cancellation'), p({ class: 'small muted', style: 'margin:0' }, s.cancel)),
        div({ class: 'card' }, h4('Next 4 weeks'), div({ class: 'cal' }, cells), p({ class: 'small muted' }, 'Sample calendar. Blocked dates move with the date so the demo always shows some taken nights.'))),
      div({ class: 'sticky' }, div({ class: 'card' }, div({ class: 'price', style: 'font-size:24px' }, fmt(s.rate) + ' / night'), gap(8),
        div({ class: 'grid g2' }, PLUG.in('stays', f, 'ci', { label: 'Check in', type: 'date', min: S.today }), PLUG.in('stays', f, 'co', { label: 'Check out', type: 'date', min: PLUG.addDays(f.ci || S.today, 1) })), PLUG.in('stays', f, 'guests', { label: 'Guests', type: 'number', min: 1, max: 12 }),
        av.ok ? [PLUG.kv(fmt(s.rate) + ' × ' + q.nights + ' night' + (q.nights > 1 ? 's' : ''), fmt(q.sub)), q.cleaning ? PLUG.kv('Cleaning fee', fmt(q.cleaning)) : null, PLUG.kv(PLUG.CONFIG.stay.taxLabel, fmt(q.tax)), PLUG.kv('Total', fmt(q.total), 'tot')] : PLUG.notice(av.why + '. Try other dates.', 'bad'),
        p({ class: 'small muted' }, s.instant ? 'Instant booking: confirmed as soon as you pay (demo).' : 'Request to book: the host has to approve first. You are not charged until they do.'),
        button({ class: 'btn pri block', disabled: !av.ok, onclick: book }, s.instant ? 'Book now' : 'Request to book')))));
  };

  /* ---------- Travel ---------- */
  pages.travel = () => {
    const f = PLUG.form('travel', { tab: 'packages', nights: '4', travellers: '2', budget: '', interests: ['culture', 'food'], access: '', tr: 'airport', tv: 'car', tpax: '2', tbags: '2', tdate: '', tflight: '', pk: {}, err: '' });
    let body;
    if (f.tab === 'packages') {
      body = div({ class: 'grid g3' }, PLUG.PACKAGES.map(pk => {
        if (!f.pk[pk.id]) f.pk[pk.id] = '2';
        const n = +f.pk[pk.id];
        return div({ class: 'lcard' }, PLUG.Photo('travel', 'plane'), div({ class: 'body' }, div({ class: 'row between', style: 'flex-wrap:nowrap' }, span({ class: 'nm' }, pk.name), PLUG.heart('package', pk.id)), span({ class: 'small muted' }, pk.days + ' days, ' + pk.nights + ' nights · ' + pk.summary),
          span({ class: 'price' }, fmt(pk.price) + ' per person (sample)'),
          details({ class: 'faq', style: 'margin:4px 0' }, summary('What is included', ico('chevD', 16)), div({ class: 'body small' }, h4({ style: 'font-size:13px' }, 'Included'), ul(pk.includes.map(x => li(x))), h4({ style: 'font-size:13px' }, 'Not included'), ul(pk.excludes.map(x => li(x))), p(strong('Cancellation: '), pk.cancel))),
          PLUG.sel('pkg' + pk.id, f.pk, pk.id, [[1, '1 traveller'], [2, '2 travellers'], [3, '3 travellers'], [4, '4 travellers'], [6, '6 travellers']], { label: 'Travellers' }),
          button({ class: 'btn pri block', style: 'margin-top:auto', onclick: () => { PLUG.addBooking({ type: 'travel', title: pk.name + ' × ' + n, sub: pk.days + ' days · request only · ' + n + ' traveller(s)', price: pk.price * n, meta: { pk: pk.id, n } }); PLUG.nav('/basket'); } }, 'Request this package')));
      }));
    } else if (f.tab === 'build') {
      const r = PLUG.travelBuild({ nights: f.nights, travellers: f.travellers, budget: f.budget, interests: f.interests, access: f.access }), I = ['culture', 'history', 'wildlife', 'beach', 'adventure', 'food'];
      body = div({ class: 'two' }, div({ class: 'card' }, h3('Tell us about the trip'), div({ class: 'grid g3' }, PLUG.sel('tb', f, 'nights', [2, 3, 4, 5, 6, 7].map(n => [n, n + ' nights']), { label: 'Length' }), PLUG.in('tb', f, 'travellers', { label: 'Travellers', type: 'number', min: 1, max: 12 }), PLUG.in('tb', f, 'budget', { label: 'Budget (NLe, optional)', type: 'number', min: 0 })),
        div({ class: 'lbl small', style: 'font-weight:700;margin-bottom:6px' }, 'Interests'), div({ class: 'chips', style: 'margin-bottom:14px' }, I.map(t => button({ class: 'chip' + (f.interests.includes(t) ? ' on' : ''), 'aria-pressed': String(f.interests.includes(t)), onclick: () => { const i = f.interests.indexOf(t); if (i >= 0) f.interests.splice(i, 1); else f.interests.push(t); PLUG.set(); } }, t))),
        PLUG.in('tb', f, 'access', { label: 'Accessibility or other needs (optional)', area: true, rows: 2 })),
        div({ class: 'sticky' }, div({ class: 'card' }, h3('Your estimate'), r.items.map(i => PLUG.kv(i.label, fmt(i.cost))), PLUG.kv('Estimated total', fmt(r.total), 'tot'), p({ class: 'small muted' }, fmt(r.perPerson) + ' per person. An estimate, not a confirmed price.'),
          r.over ? PLUG.notice('This is ' + fmt(r.over) + ' over your budget. Try fewer nights or fewer interests.', 'warn') : null, r.note ? PLUG.notice(r.note, '', 'info') : null,
          h4({ style: 'font-size:14px;margin:8px 0' }, 'Day by day'), r.days.map(d => div({ class: 'small', style: 'margin-bottom:4px' }, strong('Day ' + d.day + ': ' + d.title), span({ class: 'muted' }, ' · ' + d.note))),
          p({ class: 'small muted' }, 'Not included: ' + r.excludes.join(', ') + '. ' + r.cancel),
          button({ class: 'btn pri block', onclick: () => { PLUG.addBooking({ type: 'travel', title: 'Custom trip, ' + f.nights + ' nights', sub: f.travellers + ' traveller(s) · request only', price: r.total, meta: { custom: true } }); PLUG.nav('/basket'); } }, 'Send this as a request'))));
    } else if (f.tab === 'transfer') {
      const T = PLUG.TRANSFERS, q = PLUG.transferQuote(f.tr, f.tv, +f.tpax || 1, +f.tbags || 0);
      body = div({ class: 'two' }, div({ class: 'card' }, h3('Airport and city transfers'), PLUG.sel('tt', f, 'tr', T.routes.map(r => [r.id, r.name]), { label: 'Route' }), PLUG.sel('tt', f, 'tv', T.vehicles.map(v => [v.id, v.name + ' (' + v.seats + ' seats, ' + v.bags + ' bags)']), { label: 'Vehicle' }),
        div({ class: 'grid g2' }, PLUG.in('tt', f, 'tpax', { label: 'Passengers', type: 'number', min: 1, max: 12 }), PLUG.in('tt', f, 'tbags', { label: 'Bags', type: 'number', min: 0, max: 15 }), PLUG.in('tt', f, 'tdate', { label: 'Date', type: 'date', min: S.today }), PLUG.in('tt', f, 'tflight', { label: 'Flight number (optional)', ph: 'So the driver can track delays' }))),
        div({ class: 'sticky' }, div({ class: 'card' }, h3('Transfer estimate'), PLUG.kv(q.route.name, ''), PLUG.kv('Vehicle', q.vehicle.name), PLUG.kv('Price (sample)', fmt(q.price), 'tot'), !q.fits ? PLUG.notice('This vehicle is too small for ' + f.tpax + ' passengers and ' + f.tbags + ' bags.', 'warn') : null,
          f.err ? PLUG.notice(f.err, 'bad') : null,
          button({ class: 'btn pri block', onclick: () => { if (!f.tdate) { f.err = 'Choose a date.'; PLUG.set(); return; } if (!q.fits) { f.err = 'Pick a bigger vehicle.'; PLUG.set(); return; } f.err = ''; PLUG.addBooking({ type: 'transfer', title: q.route.name, sub: q.vehicle.name + ' · ' + PLUG.prettyDate(f.tdate), price: q.price, meta: { flight: f.tflight } }); PLUG.nav('/basket'); } }, 'Request transfer'))));
    } else body = PLUG.notice('Flights need an airline or ticketing partner. Not available yet.', 'warn');
    return div(PLUG.tabs([['packages', 'Packages'], ['build', 'Build my trip'], ['transfer', 'Transfers'], ['flights', 'Flights (later)', true]], f.tab, (t) => { f.tab = t; f.err = ''; PLUG.set(); }),
      PLUG.notice('Travel is request-based. Prices are estimates until each provider confirms. Flights are not offered yet.', 'warn', 'info'), body);
  };
})(typeof window !== 'undefined' ? window : globalThis);
