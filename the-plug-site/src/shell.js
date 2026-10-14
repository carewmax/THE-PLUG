/* THE PLUG website shell: routes, header, footer, page frames, the /app prototype page. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, h = PLUG.h, ico = PLUG.ico;
  const { div, span, p, button, h1, h2, h3, h4, strong } = PLUG;
  const R = {};
  const def = (path, title, sub, build) => { R[path] = { path, title, sub, build }; };
  const P = () => PLUG.pages;
  def('/eats', 'Restaurants', 'Order from restaurants near you. Sample restaurants while partners are being signed.', () => P().eats());
  def('/market', 'Groceries and household', 'Supermarket staples, fresh produce and cleaning goods from sample stores.', () => P().market());
  def('/one', 'One Delivery', 'Many places, one rider, and a clear price for each option.', () => P().one());
  def('/basket', 'Your basket', 'Check items, pick how they travel, and see the full price.', () => P().basket());
  def('/checkout', 'Checkout', 'Address, payment and a final price before you commit.', () => P().checkout());
  def('/errands', 'Errands', 'Tell a runner what you need done. You approve the cost first.', () => P().errands());
  def('/ride', 'Ride', 'Cars, kekes and vans with a fare range before you request.', () => P().ride());
  def('/care', 'Care', 'Pharmacy and personal essentials, delivered discreetly.', () => P().care());
  def('/studio', 'Studio', 'Print, photos, websites and apps for your business.', () => P().studio());
  def('/stays', 'Stays', 'Hotels, guesthouses, apartments and holiday homes.', () => P().stays());
  def('/travel', 'Travel', 'Packages, custom trips and transfers, all request-based.', () => P().travel());
  def('/search', 'Search', 'One search across every service.', () => P().search());
  def('/orders', 'Orders and bookings', 'Live status for everything you have placed.', () => P().orders());
  def('/wallet', 'Wallet and payments', 'Payment methods, refunds and your transaction history.', () => P().wallet());
  def('/saved', 'Saved', 'Places, items, stays and trips you want to come back to.', () => P().saved());
  def('/rewards', 'Rewards and Plus', 'Points on completed orders, and the planned membership.', () => P().rewards());
  def('/account', 'Account', 'Your details, language, privacy and data settings.', () => P().account());
  def('/about', 'About and partners', 'Who we are, our service hours, and how to work with us.', () => P().about());
  def('/help', 'Help, support and policies', 'Answers, contact and draft policies.', () => P().help());
  def('/shop', 'Shop', 'Every seller in one search. Compare price, stock and distance, then mix sellers in one basket.', () => P().shop());
  def('/sell', 'Sell on THE PLUG', 'Snap a photo, set a price and stock, and sell with your own “by” tag and page.', () => P().sell());
  def('/requests', 'Quote requests', 'Post one request. Registered providers choose to quote, and you pick.', () => P().requests());
  def('/events', 'Events', 'What’s on in Freetown, with tickets from THE PLUG.', () => P().events());
  def('/events/new', 'Post an event', 'Free to list. Tickets go on sale once we have checked you.', () => P().eventNew());
  def('/tickets', 'My tickets', 'Show the code at the door. Each ticket works once.', () => P().tickets());
  def('/agent', 'Door agent', 'Check tickets at the door, even without signal.', () => P().agent());
  def('/map', 'Map', 'Drop your pin and add a landmark so riders find you.', () => P().map());
  def('/settings', 'Settings', 'Language, privacy, address and the admin demo settings.', () => P().account());
  PLUG.ROUTES = R;
  PLUG.resolve = (path) => {
    if (R[path]) return R[path]; let m;
    if ((m = path.match(/^\/eats\/([\w-]+)$/))) return { title: 'Restaurant', build: () => P().eatsDetail(m[1]), parent: '/eats' };
    if ((m = path.match(/^\/stays\/([\w-]+)$/))) return { title: 'Stay details', build: () => P().staysDetail(m[1]), parent: '/stays' };
    if ((m = path.match(/^\/p\/([\w-]+)$/))) return { title: 'Compare sellers', build: () => P().product(m[1]), parent: '/shop' };
    if ((m = path.match(/^\/store\/([\w-]+)$/))) return { title: (PLUG.MERCH[m[1]] || {}).name || 'Business page', build: () => P().store(m[1]), parent: '/shop', bare: true };
    if ((m = path.match(/^\/events\/([\w-]+)$/))) return { title: 'Event', build: () => P().event(m[1]), parent: '/events' };
    if ((m = path.match(/^\/orders\/([\w-]+)$/))) return { title: 'Order details', build: () => P().orderDetail(m[1]), parent: '/orders' };
    return null;
  };
  PLUG.validRoute = (path) => path === '/' || path === '/app' || !!PLUG.resolve(path);

  const MAIN_NAV = [['/', 'Home'], ['menu', 'Services'], ['/eats', 'Eats'], ['/shop', 'Shop'], ['/events', 'Events'], ['/stays', 'Stays & Travel'], ['/about', 'About'], ['/help', 'Contact']];
  const active = (path) => S.route === path || S.route.startsWith(path + '/');

  PLUG.overlays = () => [PLUG.authModal(), PLUG.itemSheet(),
    S.toast ? div({ class: 'toast ' + (S.toast.tone === 'warn' ? 'warn' : ''), role: 'status', 'aria-live': 'polite' }, S.toast.msg) : null];

  function header() {
    const n = PLUG.basketCount();
    return h('header', { class: 'hdr' }, div({ class: 'wrap' },
      PLUG.lnk('/', '', PLUG.logo()),
      h('nav', { class: 'nav', 'aria-label': 'Main' }, MAIN_NAV.map(x => x[0] === 'menu' ? button({ class: S.menuOpen ? 'on' : '', 'aria-expanded': String(!!S.menuOpen), onclick: () => { S.menuOpen = !S.menuOpen; PLUG.set(); } }, x[1], ' ', ico('chevD', 14)) : PLUG.lnk(x[0], (x[0] === '/' ? S.route === '/' : active(x[0]) || (x[0] === '/stays' && active('/travel'))) ? 'on' : '', x[1]))),
      div({ class: 'right' },
        PLUG.lnk('/search', 'iconbtn', ico('search', 20), span({ class: 'sr' }, 'Search')),
        PLUG.lnk('/orders', 'iconbtn hide-s', ico('bell', 20), span({ class: 'sr' }, 'Orders and updates')),
        PLUG.lnk('/basket', 'iconbtn', ico('cart', 20), n ? span({ class: 'badge' }, n) : null, span({ class: 'sr' }, 'Basket, ' + n + ' items')),
        PLUG.lnk('/account', 'iconbtn hide-s', ico('user', 20), span({ class: 'sr' }, S.user ? 'Account' : 'Sign in')),
        PLUG.lnk('/app', 'btn pri sm hide-s', 'Get the app'),
        button({ class: 'iconbtn', 'aria-label': 'Menu', 'aria-expanded': String(!!S.menuOpen), onclick: () => { S.menuOpen = !S.menuOpen; PLUG.set(); } }, ico(S.menuOpen ? 'x' : 'menu', 20)))), S.menuOpen ? svcMenu() : null);
  }
  function svcMenu() {
    return div({ class: 'svcmenu' }, div({ class: 'wrap' }, PLUG.SERVICES.map(s => PLUG.lnk(s.route, '', ico(s.icon, 20), s.name)),
      [['/sell', 'shop', 'Sell on THE PLUG'], ['/requests', 'send', 'Quote requests'], ['/tickets', 'receipt', 'My tickets'], ['/agent', 'key', 'Door agent'], ['/map', 'map', 'Map'], ['/orders', 'receipt', 'Orders'], ['/wallet', 'wallet', 'Wallet'], ['/saved', 'heart', 'Saved'], ['/rewards', 'gift', 'Rewards and Plus'], ['/account', 'user', 'Account'], ['/about', 'info', 'About and partners'], ['/help', 'message', 'Help and policies'], ['/app', 'phone', 'Get the app']].map(x => PLUG.lnk(x[0], '', ico(x[1], 20), x[2]))));
  }
  function footer() {
    const col = (t, items) => div(h4(t), items.map(x => PLUG.lnk(x[0], '', x[1])));
    return h('footer', { class: 'footer dark' }, div({ class: 'wrap' }, div({ class: 'cols' },
      div(PLUG.logo('logo big'), p({ class: 'small', style: 'color:var(--mut);margin-top:12px;max-width:34ch' }, 'One App. Every Need. Sierra Leone & beyond.')),
      col('Services', PLUG.SERVICES.map(s => [s.route, s.name])),
      col('You', [['/orders', 'Orders and bookings'], ['/wallet', 'Wallet and payments'], ['/saved', 'Saved'], ['/rewards', 'Rewards and Plus'], ['/account', 'Account']]),
      col('Company', [['/about', 'About and partners'], ['/sell', 'Sell on THE PLUG'], ['/events/new', 'Post an event'], ['/help', 'Help and support'], ['/help', 'Policies (draft)'], ['/app', 'Get the app (coming soon)']])),
      p({ class: 'small', style: 'color:var(--mut);margin-top:26px;border-top:1px solid var(--line2);padding-top:16px' }, 'Prototype. All merchants, prices, stock, hours and reviews are sample content. No orders are fulfilled and no payments are taken. Merchant, courier, partner and admin tools are not built yet.')));
  }

  function appPage() {
    const phone = PLUG.phone();
    return div({ class: 'dark' }, div({ class: 'wrap appwrap' },
      div({ class: 'side' }, div({ class: 'eyebrow' }, 'Customer app prototype'), h1({ style: 'font-size:clamp(30px,4.5vw,46px);margin-bottom:12px' }, 'Try THE PLUG ', span({ class: 'lime' }, 'on a phone')),
        p({ class: 'muted' }, 'Same sample data as the website. Browse, add from several places, check out with a demo payment, and follow the order. Sign-in code is 123456.'),
        div({ class: 'shortcuts', style: 'max-width:380px;margin:14px 0' }, [['Order from three places', 'One Delivery in action', () => { PLUG.addLine(PLUG.ITEMS['r1-jollof'], 1); PLUG.addLine(PLUG.ITEMS['s1-rice'], 1); PLUG.addLine(PLUG.ITEMS['p1-sanit'], 1); PLUG.appPush('/basket'); }], ['Request a runner', 'Errand wizard', () => PLUG.appPush('/errands')], ['Find a stay', 'Dates and availability', () => PLUG.appPush('/stays')]].map(x => button({ onclick: x[2] }, ico('arrow', 16), div(strong(x[0]), div({ class: 'small', style: 'color:var(--mut);font-weight:400' }, x[1]))))),
        div({ class: 'row' }, button({ class: 'btn ghost', onclick: () => { PLUG.init(); S.route = '/app'; PLUG.set(); PLUG.toast('Demo reset'); } }, 'Reset demo'), PLUG.lnk('/', 'btn sec2', 'Back to the website')),
        p({ class: 'small muted', style: 'margin-top:14px' }, 'Store listings are not live yet. This is a prototype running in your browser.')),
      phone));
  }

  PLUG.webPage = (path) => {
    if (path === '/') return P().home();
    if (path === '/app') return appPage();
    const r = PLUG.resolve(path);
    if (!r) return div({ class: 'dark pagehead' }, div({ class: 'wrap' }, PLUG.empty('Page not found', 'That link does not go anywhere.', PLUG.lnk('/', 'btn pri', 'Back to home'))));
    if (r.bare) return r.build();
    return div(div({ class: 'dark pagehead' }, div({ class: 'wrap' }, r.parent ? PLUG.back(r.parent, 'Back') : null, h1(r.title), r.sub ? p(r.sub) : null)),
      div({ class: 'paper sec', style: 'min-height:50vh' }, div({ class: 'wrap' }, r.build())));
  };

  PLUG.rootView = () => {
    PLUG.ctx = 'w';
    const path = S.route || '/', body = PLUG.webPage(path); PLUG.ctx = 'w';
    return div({ class: 'plug-root' + (S.settings.lowData ? ' lowdata' : '') },
      button({ class: 'sr', onclick: () => { const m = document.getElementById('main'); if (m) m.focus(); } }, 'Skip to content'),
      div({ class: 'demo' }, 'Prototype with sample data. No real orders, payments or deliveries.'),
      header(),
      h('main', { id: 'main', tabindex: '-1', style: 'outline:none' }, body), footer(),
      path === '/app' ? null : PLUG.overlays());
  };
})(typeof window !== 'undefined' ? window : globalThis);
