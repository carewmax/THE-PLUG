/* THE PLUG core: tiny hyperscript renderer, icon set, store, router, helpers.
   No external libraries. Every screen is a function that returns DOM nodes;
   state lives in one object and the view is rebuilt after each action. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG = root.PLUG || {};

  /* ---------- hyperscript ---------- */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) {
      for (const k in props) {
        const v = props[k];
        if (v === false || v == null) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style') { if (typeof v === 'string') el.style.cssText = v; else Object.assign(el.style, v); }
        else if (k.startsWith('on') && typeof v === 'function') { const c = PLUG.ctx; el.addEventListener(k.slice(2), c ? function () { const prev = PLUG.ctx; PLUG.ctx = c; try { return v.apply(this, arguments); } finally { PLUG.ctx = prev; } } : v); }
        else if (k === 'value') el.value = v;
        else if (k === 'checked' || k === 'disabled' || k === 'selected' || k === 'hidden' || k === 'required' || k === 'open') { if (v) el.setAttribute(k, ''); el[k] = !!v; }
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    append(el, kids);
    return el;
  }
  function append(el, kids) {
    for (const c of kids) {
      if (c == null || c === false || c === true) continue;
      if (Array.isArray(c)) append(el, c);
      else if (c instanceof Node) el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    }
  }
  const el = (tag) => (props, ...kids) => (props && (props instanceof Node || Array.isArray(props) || typeof props !== 'object'))
    ? h(tag, null, props, ...kids) : h(tag, props, ...kids);
  ['div', 'span', 'p', 'a', 'button', 'ul', 'li', 'ol', 'section', 'article', 'header', 'footer', 'nav', 'main', 'h1', 'h2', 'h3', 'h4', 'label', 'form', 'select', 'option', 'textarea', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'details', 'summary', 'small', 'strong', 'em', 'img', 'input', 'fieldset', 'legend', 'dl', 'dt', 'dd'].forEach(t => { PLUG[t] = el(t); });

  /* ---------- icons ---------- */
  const I = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    food: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 3c-2 2-3 4.5-3 7 0 1.5 1 2.5 3 2.5V21"/>',
    cart: '<path d="M3 4h2.5l2 11h9.5l2-8H6.5"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="16" cy="19.5" r="1.4"/>',
    bed: '<path d="M3 18V7M3 13h18v5M21 13v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="10.5" r="1.8"/>',
    errand: '<path d="M6 8h12l1 12H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9.5 13.5l2 2 3.5-3.5"/>',
    car: '<path d="M4 15l1.6-5.2A2 2 0 0 1 7.5 8.5h9a2 2 0 0 1 1.9 1.3L20 15M3 15h18v3.5H3z"/><circle cx="7.5" cy="18.5" r="1.4"/><circle cx="16.5" cy="18.5" r="1.4"/>',
    plane: '<path d="M2.5 12.5l19-8.5-6 17-3.5-7z"/><path d="M12 14l9.5-10"/>',
    care: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>',
    shop: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M10 20v-5h4v5"/>',
    box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16.5" cy="13.5" r="1.2"/>',
    heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21h4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevR: '<path d="M9 5l7 7-7 7"/>',
    chevL: '<path d="M15 5l-7 7 7 7"/>',
    chevD: '<path d="M5 9l7 7 7-7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    camera: '<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    printer: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',
    code: '<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M12 9v12M3 13h18M12 9c-3 0-4-4-1.5-4S12 9 12 9zm0 0c3 0 4-4 1.5-4S12 9 12 9z"/>',
    route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    users: '<circle cx="9" cy="9" r="3.5"/><path d="M2.5 20c.8-3.5 3.5-5 6.5-5s5.7 1.5 6.5 5M16 6a3.2 3.2 0 0 1 0 6.2M17.5 15c2.2.5 3.5 2 4 5"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    send: '<path d="M3 11l18-8-8 18-2-8z"/>',
    bolt: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
    message: '<path d="M4 5h16v11H9l-5 4z"/>',
    trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    refresh: '<path d="M20 11A8 8 0 0 0 5.5 7M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M8 14v6"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l8-8"/>',
    wifioff: '<path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4.5-2.7M19 12.5a10 10 0 0 0-4-2.3M12 20h.01"/>',
    key: '<circle cx="8" cy="14" r="4"/><path d="M11 12l9-9M16 7l3 3"/>'
  };
  PLUG.icons = I;
  function ico(name, size, cls) {
    const s = document.createElementNS(SVG_NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size || 22); s.setAttribute('height', size || 22);
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.8');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false'); if (cls) s.setAttribute('class', cls);
    s.innerHTML = I[name] || I.info;
    return s;
  }
  PLUG.ico = ico;
  PLUG.h = h;

  /* ---------- helpers ---------- */
  PLUG.fmt = (n) => 'NLe ' + Math.round(n).toLocaleString('en-US');
  PLUG.fmt2 = (n) => 'NLe ' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  PLUG.uid = (p) => (p || 'id') + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  PLUG.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  PLUG.clock = (d) => { d = d || new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  PLUG.dateKey = (d) => d.toISOString().slice(0, 10);
  PLUG.addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  PLUG.nights = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
  PLUG.prettyDate = (iso) => { try { return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }); } catch (e) { return iso; } };

  /* ---------- store and render loop ---------- */
  const S = PLUG.S = {};
  let view = null, rootEl = null, scheduled = false;
  PLUG.mount = (root_el, viewFn) => { rootEl = root_el; view = viewFn; render(); };
  PLUG.set = (patch) => { if (patch) Object.assign(S, patch); schedule(); };
  PLUG.refresh = () => schedule();
  function schedule() { if (scheduled) return; scheduled = true; Promise.resolve().then(() => { scheduled = false; render(); }); }
  function render() {
    if (!rootEl || !view) return;
    const ae = document.activeElement;
    const key = ae && ae !== document.body ? (ae.id ? '#' + ae.id : ae.getAttribute('data-k') ? '[data-k="' + ae.getAttribute('data-k') + '"]' : null) : null;
    const sel = ae && key && typeof ae.selectionStart === 'number' ? [ae.selectionStart, ae.selectionEnd] : null;
    const scrolls = Array.from(rootEl.querySelectorAll('[data-scroll]')).map(n => [n.getAttribute('data-scroll'), n.scrollTop]);
    const h0 = rootEl.offsetHeight; rootEl.style.minHeight = h0 + 'px';
    const sy = window.scrollY;
    let tree;
    try { tree = view(); } catch (err) { console.error(err); tree = h('pre', { style: 'padding:24px;color:#fff;white-space:pre-wrap' }, 'Something went wrong while drawing this screen.\n' + (err && err.message)); }
    rootEl.replaceChildren(tree);
    rootEl.style.minHeight = '';
    scrolls.forEach(([k, top]) => { const n = rootEl.querySelector('[data-scroll="' + k + '"]'); if (n) n.scrollTop = top; });
    if (S._resetScroll) { window.scrollTo(0, 0); S._resetScroll = false; } else window.scrollTo(0, sy);
    if (key) { const n = rootEl.querySelector(key); if (n) { n.focus({ preventScroll: true }); if (sel) try { n.setSelectionRange(sel[0], sel[1]); } catch (e) { } } }
    if (S._afterRender) { const f = S._afterRender; S._afterRender = null; f(); }
  }

  /* ---------- router (in-memory first, hash as a convenience) ---------- */
  PLUG.go = (path, opts) => {
    S.route = path; S._resetScroll = !(opts && opts.keepScroll); S.menuOpen = false;
    try { if (location.hash !== '#' + path) history.replaceState(null, '', '#' + path); } catch (e) { }
    schedule();
  };
  PLUG.initRoute = (fallback, valid) => {
    let p = fallback;
    try { const hsh = (location.hash || '').replace(/^#/, ''); if (hsh && (!valid || valid(hsh))) p = hsh; } catch (e) { }
    S.route = p;
  };
  window.addEventListener('hashchange', () => { try { const hsh = location.hash.replace(/^#/, ''); if (hsh && hsh !== S.route) { S.route = hsh; S._resetScroll = true; schedule(); } } catch (e) { } });

  /* ---------- toast ---------- */
  PLUG.toast = (msg, tone) => {
    S.toast = { msg, tone: tone || 'ok', at: Date.now() };
    schedule();
    const at = S.toast.at;
    setTimeout(() => { if (S.toast && S.toast.at === at) { S.toast = null; schedule(); } }, 3200);
  };
})(typeof window !== 'undefined' ? window : globalThis);
