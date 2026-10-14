/* THE PLUG customer app prototype: phone frame, onboarding, home, tab bar.
   Service screens are the same builders the website uses, so both stay in sync. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, h = PLUG.h, ico = PLUG.ico, fmt = PLUG.fmt;
  const { div, span, p, button, h1, h2, h3, h4, strong, img } = PLUG;
  const TABS = [['/', 'Home', 'home'], ['/search', 'Explore', 'search'], ['/orders', 'Orders', 'receipt'], ['/wallet', 'Wallet', 'wallet'], ['/account', 'Profile', 'user']];
  const step = () => S.appState.step || (S.appState.splash ? 'splash' : 'main');
  const cur = () => S.appState.stack[S.appState.stack.length - 1];
  const resetScroll = () => { S._afterRender = () => { const sc = document.querySelector('.screen [data-scroll]'); if (sc) sc.scrollTop = 0; }; };

  PLUG.appPush = (path) => {
    const A = S.appState; if (path === '/app') path = '/';
    if (TABS.some(t => t[0] === path)) A.stack = [path];
    else if (cur() !== path) A.stack.push(path);
    resetScroll(); S.menuOpen = false; PLUG.set();
  };
  PLUG.appBack = () => { const A = S.appState; if (A.stack.length > 1) A.stack.pop(); resetScroll(); PLUG.set(); };
  const setStep = (st) => { S.appState.step = st; PLUG.set(); };

  /* ---------- onboarding ---------- */
  function splash() {
    return div({ class: 'splash' }, PLUG.road('road'), PLUG.badge('badgebig'),
      p({ class: 'muted', style: 'max-width:26ch;position:relative' }, 'Everything you need. In one app.'),
      div({ class: 'chips', style: 'justify-content:center;position:relative' }, [['en', 'English'], ['kri', 'Krio (draft)']].map(x => button({ class: 'chip' + (S.lang === x[0] ? ' on' : ''), 'aria-pressed': String(S.lang === x[0]), onclick: () => PLUG.setLang(x[0]) }, x[1]))),
      S.lang === 'kri' ? p({ class: 'small muted', style: 'position:relative' }, 'Krio is a draft and needs native review.') : null,
      button({ class: 'btn pri block pill', style: 'max-width:300px;position:relative', onclick: () => setStep('signin') }, PLUG.t('getstarted') !== 'getstarted' ? PLUG.t('getstarted') : 'Get started'),
      button({ class: 'link small', style: 'position:relative', onclick: () => setStep('main') }, 'Just let me browse'));
  }
  function signin() {
    return div({ class: 'pad', style: 'padding-top:40px' }, h2('Sign in or sign up'),
      p({ class: 'muted' }, 'We send a one-time code to your phone or email. In this prototype nothing is sent: the code is 123456.'),
      button({ class: 'btn pri block', onclick: () => PLUG.requireAuth(() => setStep('location')) }, 'Continue with phone or email'),
      h('div', { style: 'height:10px' }), button({ class: 'btn ghost block', onclick: () => setStep('location') }, 'Continue as a guest'),
      p({ class: 'small muted', style: 'margin-top:14px' }, 'You can browse as a guest. You need an account to place an order or booking.'));
  }
  function locationForm(done) {
    const a = PLUG.currentAddress(), z = PLUG.ZONES.find(x => x.id === a.zone);
    return div(PLUG.sel('loc', a, 'zone', PLUG.ZONES.map(x => [x.id, PLUG.zoneLabel(x)]), { label: 'Area' }),
      !z.pilot ? PLUG.notice(z.name + ' is outside the pilot area. You can browse, but we can’t deliver there yet.', 'warn') : null,
      PLUG.in('loc', a, 'landmark', { label: 'Landmark or directions', ph: 'Near the market, blue gate...', hint: 'Many places have no street name. A landmark helps the courier.' }),
      PLUG.in('loc', a, 'phone', { label: 'Phone for the courier', type: 'tel', ph: '+232 ...' }),
      button({ class: 'btn ghost block', disabled: true, style: 'margin-bottom:10px' }, ico('pin', 16), 'Use my location (not connected yet)'),
      button({ class: 'btn pri block', onclick: done }, 'Save and continue'));
  }
  function location() {
    return div({ class: 'pad', style: S.appState.step === 'location' ? 'padding-top:40px' : '' }, h2('Where should we deliver?'), p({ class: 'muted' }, 'Set your area and a landmark. You can change this any time.'),
      locationForm(() => { if (S.appState.step === 'location') setStep('main'); else PLUG.appBack(); }));
  }

  /* ---------- home ---------- */
  function home() {
    const active = S.orders.filter(e => !e.cancelled && e.idx < e.steps.length - 1).slice(0, 2);
    const feat = [['Royal Bites', 'food', 'food', '/eats/r1', 'Rice & burgers'], ['FreshMart', 'market', 'cart', '/market', 'Groceries'], ['Vista Apartments', 'stay', 'bed', '/stays/st2', 'Lumley'], ['Island Escape', 'travel', 'plane', '/travel', '5 days']];
    const tiles = PLUG.SERVICES.map(s => [s.route, s.icon, PLUG.t(s.k) !== s.k ? PLUG.t(s.k) : s.name]).concat([['/map', 'map', 'Map']]);
    return div({ class: 'pad' },
      button({ class: 'searchfake', onclick: () => PLUG.appPush('/search') }, ico('search', 18), span(PLUG.t('search'))),
      div({ class: 'grid4' }, tiles.map(t => button({ class: 'ntile', onclick: () => PLUG.appPush(t[0]) }, ico(t[1], 24, 'ic'), t[2]))),
      button({ class: 'onecard', onclick: () => PLUG.appPush('/one') }, div({ class: 'grow' }, div({ class: 'eyebrow', style: 'margin:0 0 4px' }, 'THE PLUG One Delivery'), strong('Multiple orders. One delivery.'), div({ class: 'small muted' }, 'Mix shops, one rider.'), span({ class: 'btn pri sm', style: 'margin-top:8px' }, 'Order now')), ico('box', 54, 'ic')),
      active.length ? [h3({ style: 'margin:16px 0 8px' }, 'Active now'), active.map(e => button({ class: 'rowc', onclick: () => PLUG.appPush('/orders/' + e.id) }, ico(e.type === 'order' ? 'box' : e.type === 'ride' ? 'car' : e.type === 'errand' ? 'errand' : 'receipt', 22, 'ic'), div({ class: 'grow' }, strong(e.sensitive && S.settings.hideSensitive ? 'Personal essentials order' : e.title), div({ class: 'small muted' }, e.steps[e.idx])), ico('chevR', 16)))] : null,
      div({ class: 'row between', style: 'margin:16px 0 8px' }, h3({ style: 'margin:0' }, 'Popular near you'), button({ class: 'link small', onclick: () => PLUG.appPush('/shop') }, 'See all')),
      div({ class: 'scroll-row' }, feat.map(x => button({ class: 'popcard', onclick: () => PLUG.appPush(x[3]) }, PLUG.Photo(x[1], x[2]), div({ class: 'nm' }, x[0]), div({ class: 'small muted' }, x[4] + ' · new')))));
  }
  function homeBrand() {
    const a = PLUG.currentAddress(), z = PLUG.ZONES.find(x => x.id === a.zone);
    return div({ class: 'homebrand' }, PLUG.logo('logo'), div(PLUG.wordmark('wordmark sm'), button({ class: 'locbtn', onclick: () => PLUG.appPush('/location') }, ico('pin', 13), (a.landmark ? a.landmark.slice(0, 18) + ', ' : '') + z.name + (z.intercity ? '' : ', Sierra Leone'), ico('chevD', 12))));
  }
  function profile() {
    const u = S.user, rows = [['/orders', 'receipt', 'My orders'], ['/location', 'pin', 'Addresses'], ['/wallet', 'wallet', 'Payment methods'], ['/saved', 'heart', 'Saved items'], ['/tickets', 'calendar', 'My tickets'], ['/sell', 'shop', S.myShop ? 'My shop' : 'Sell on THE PLUG'], ['/rewards', 'gift', 'Rewards and Plus'], ['/help', 'message', 'Help & support'], ['/settings', 'gear', 'Settings']];
    return div({ class: 'pad' },
      div({ class: 'profhead' }, div({ class: 'davatar big', 'aria-hidden': 'true' }, u ? ico('user', 28) : ico('user', 28)), div({ class: 'grow' }, strong({ style: 'font-size:18px' }, u ? u.name : 'Guest'), div({ class: 'small muted' }, u ? u.contact : 'Browsing without an account'), u ? PLUG.pill('Member (demo)') : null)),
      div({ class: 'plist' }, rows.map(r => button({ class: 'prow', onclick: () => PLUG.appPush(r[0]) }, span({ class: 'pi' }, ico(r[1], 17)), span({ class: 'grow' }, r[2]), ico('chevR', 16))),
        u ? button({ class: 'prow', onclick: PLUG.signOut }, span({ class: 'pi' }, ico('x', 17)), span({ class: 'grow' }, 'Log out'), null) : button({ class: 'prow', onclick: () => PLUG.requireAuth() }, span({ class: 'pi' }, ico('key', 17)), span({ class: 'grow' }, 'Sign in or sign up'), ico('chevR', 16))));
  }

  function notifications() {
    const items = []; S.orders.forEach(e => e.log.forEach(l => items.push({ e, l })));
    const hide = (e) => e.sensitive && S.settings.hideSensitive;
    return div({ class: 'pad' }, !S.settings.orderAlerts ? PLUG.notice('Order alerts are off. Turn them on in Profile.', 'warn', 'bell') : null,
      items.length ? items.slice(0, 30).map(x => button({ class: 'rowc', onclick: () => PLUG.appPush('/orders/' + x.e.id) }, ico('bell', 20, 'ic'), div({ class: 'grow' }, strong(hide(x.e) ? 'You have an order update' : x.l.label), div({ class: 'small muted' }, hide(x.e) ? 'Open the app to see it' : x.e.title + ' · ' + x.l.t)))) : PLUG.empty('No notifications yet', 'Order and booking updates will appear here.'));
  }

  /* ---------- frame ---------- */
  PLUG.phone = () => {
    const prev = PLUG.ctx; PLUG.ctx = 'a';
    try {
      const A = S.appState, st = step(), path = cur(), n = PLUG.basketCount();
      let content, title = '', showBar = false, onTab = TABS.some(t => t[0] === path);
      if (st === 'splash') content = splash();
      else if (st === 'signin') content = signin();
      else if (st === 'location') content = location();
      else {
        showBar = true;
        if (path === '/') { content = home(); title = ''; }
        else if (path === '/notifications') { content = notifications(); title = 'Notifications'; }
        else if (path === '/account') { content = profile(); title = 'Profile'; }
        else if (path === '/location') { content = location(); title = 'Delivery location'; }
        else { const r = PLUG.resolve(path); title = r ? r.title : 'Not found'; content = r && r.bare ? r.build() : div({ class: 'pad' }, r ? r.build() : PLUG.empty('Not found', 'That screen does not exist.', button({ class: 'btn pri', onclick: () => PLUG.appPush('/') }, 'Home'))); }
      }
      const topbar = showBar ? div({ class: 'topbar' },
        A.stack.length > 1 ? button({ class: 'iconbtn', 'aria-label': 'Back', onclick: PLUG.appBack }, ico('chevL', 20)) : (path === '/' ? homeBrand() : null),
        path === '/' ? null : h1(title),
        path === '/' ? button({ class: 'iconbtn', 'aria-label': 'Notifications', onclick: () => PLUG.appPush('/notifications') }, ico('bell', 18)) : null,
        path !== '/basket' ? button({ class: 'iconbtn', 'aria-label': 'Basket, ' + n + ' items', onclick: () => PLUG.appPush('/basket') }, ico('cart', 18), n ? span({ class: 'badge' }, n) : null) : null) : null;
      return div({ class: 'phone app dark' + (S.settings.lowData ? ' lowdata' : ''), 'aria-label': 'THE PLUG app prototype' },
        div({ class: 'status' }, span(PLUG.clock()), span('Prototype')),
        div({ class: 'screen' }, div({ 'data-scroll': 'app', style: 'height:100%;overflow-y:auto' }, topbar, content)),
        showBar ? h('nav', { class: 'tabbar', 'aria-label': 'App tabs' }, TABS.map(t => button({ class: A.stack[0] === t[0] ? 'on' : '', 'aria-current': A.stack[0] === t[0] ? 'page' : null, onclick: () => PLUG.appPush(t[0]) }, ico(t[2], 22), t[1]))) : null,
        PLUG.overlays());
    } finally { PLUG.ctx = prev; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
