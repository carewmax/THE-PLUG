/* THE PLUG shared UI pieces: photo slots, form controls, modal, route map, links.
   Controls need ids so focus survives the re-render after each keystroke. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S, h = PLUG.h, ico = PLUG.ico;
  const { div, span, p, button, label, input, select, option, textarea, h3, h4, img } = PLUG;
  const NS = 'http://www.w3.org/2000/svg';

  PLUG.ctx = 'w'; // 'w' website, 'a' phone app: decides where links go and how ids are prefixed
  PLUG.nav = (path) => { if (PLUG.ctx === 'a') PLUG.appPush(path); else PLUG.go(path); };
  PLUG.lnk = (path, cls, ...kids) => PLUG.a({ class: cls || '', href: PLUG.ctx === 'w' ? '#' + path : '#', onclick: (e) => { e.preventDefault(); PLUG.nav(path); } }, ...kids);
  PLUG.id = (k) => PLUG.ctx + '-' + k;

  /* ---------- sample photo slot ---------- */
  function art() {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('class', 'bgart'); s.setAttribute('viewBox', '0 0 160 100'); s.setAttribute('preserveAspectRatio', 'xMidYMid slice'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<circle cx="30" cy="20" r="40" fill="rgba(255,255,255,.05)"/><circle cx="140" cy="90" r="50" fill="rgba(182,251,5,.09)"/><path d="M0 80 Q40 60 80 78 T160 70 V100 H0Z" fill="rgba(0,0,0,.25)"/>';
    return s;
  }
  // Real photos can be added later through an `img` field on any item. Until then this slot is clearly a sample.
  PLUG.Photo = (tone, icon, cls, src) => div({ class: 'photo ' + (cls || ''), 'data-tone': tone, role: 'img', 'aria-label': 'Sample image' },
    src ? img({ src, alt: '', style: 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover' }) : [art(), ico(icon || 'image', 56, 'glyph')],
    cls && (cls.includes('tall') || cls.includes('wide')) ? span({ class: 'tag' }, 'Sample image') : null);

  /* ---------- small pieces ---------- */
  PLUG.pill = (text, tone, icon) => span({ class: 'pill ' + (tone || '') }, icon ? ico(icon, 13) : null, text);
  PLUG.statusPill = (m) => { const st = PLUG.merchantStatus(m, S.confirmed); return PLUG.pill(st.label, st.code === 'open' ? '' : st.code === 'closed' ? 'mute' : 'warn'); };
  PLUG.kv = (l, v, cls) => div({ class: 'kv ' + (cls || '') }, span(l), span(v));
  PLUG.notice = (text, tone, icon) => div({ class: 'notice ' + (tone || ''), role: tone === 'bad' ? 'alert' : null }, ico(icon || (tone === 'bad' ? 'x' : tone === 'warn' ? 'info' : 'shield'), 18), div({ class: 'grow' }, text));
  PLUG.sechead = (eyebrow, title, sub) => div({ class: 'sechead' }, eyebrow ? div({ class: 'eyebrow' }, eyebrow) : null, h3({ style: 'font-size:clamp(22px,3vw,30px);margin-bottom:6px' }, title), sub ? p({ class: 'sub muted' }, sub) : null);
  PLUG.empty = (title, text, actions) => div({ class: 'empty' }, h3(title), p({ class: 'muted' }, text), actions ? div({ class: 'row', style: 'justify-content:center' }, actions) : null);
  PLUG.heart = (type, id) => button({ class: 'heart' + (PLUG.isSaved(type, id) ? ' on' : ''), 'aria-label': PLUG.isSaved(type, id) ? 'Remove from saved' : 'Save', 'aria-pressed': String(PLUG.isSaved(type, id)), onclick: (e) => { e.stopPropagation(); PLUG.toggleSaved(type, id); } }, ico('heart', 20));
  PLUG.qtyCtl = (q, onChange, name) => div({ class: 'qty' }, button({ 'aria-label': 'Fewer' + (name ? ' ' + name : ''), onclick: () => onChange(q - 1) }, ico('minus', 16)), span({ 'aria-live': 'polite' }, q), button({ 'aria-label': 'More' + (name ? ' ' + name : ''), onclick: () => onChange(q + 1) }, ico('plus', 16)));
  PLUG.tabs = (items, cur, onPick) => div({ class: 'tabs', role: 'tablist' }, items.map(it => button({ role: 'tab', 'aria-selected': String(cur === it[0]), class: cur === it[0] ? 'on' : '', disabled: !!it[2], onclick: () => onPick(it[0]) }, it[1])));
  PLUG.chipRow = (items, cur, onPick) => div({ class: 'chips' }, items.map(it => button({ class: 'chip' + (cur === it ? ' on' : ''), 'aria-pressed': String(cur === it), onclick: () => onPick(it) }, it)));

  /* ---------- form controls ---------- */
  PLUG.fld = (lbl, control, o) => { o = o || {}; const id = control.id || (control.firstChild && control.firstChild.id) || ''; return div({ class: 'field' }, lbl ? label({ for: id }, lbl) : null, control, o.hint ? div({ class: 'hint' }, o.hint) : null, o.err ? div({ class: 'err' }, o.err) : null); };
  // text-like input bound to an object key; id = ctx-name-key
  PLUG.in = (name, f, key, o) => {
    o = o || {}; const id = PLUG.id(name + '-' + key);
    const common = { id, class: o.cls, value: f[key] == null ? '' : f[key], placeholder: o.ph || '', oninput: (e) => { f[key] = e.target.value; if (o.onInput) o.onInput(); PLUG.refresh(); }, autocomplete: o.auto || 'off' };
    const ctl = o.area ? textarea(Object.assign(common, { rows: o.rows || 3 })) : input(Object.assign(common, { type: o.type || 'text', min: o.min, max: o.max, step: o.step, inputmode: o.mode, maxlength: o.maxlen }));
    return o.bare ? ctl : PLUG.fld(o.label, ctl, o);
  };
  PLUG.sel = (name, f, key, opts, o) => {
    o = o || {}; const id = PLUG.id(name + '-' + key);
    const ctl = select({ id, onchange: (e) => { f[key] = e.target.value; if (o.onChange) o.onChange(e.target.value); PLUG.refresh(); } }, opts.map(x => option({ value: x[0], selected: String(f[key]) === String(x[0]), disabled: !!x[2] }, x[1])));
    return o.bare ? ctl : PLUG.fld(o.label, ctl, o);
  };
  PLUG.chk = (name, f, key, text, o) => { o = o || {}; const id = PLUG.id(name + '-' + key); return div({ class: 'check' }, input({ type: 'checkbox', id, checked: !!f[key], disabled: !!o.disabled, onchange: (e) => { f[key] = e.target.checked; if (o.onChange) o.onChange(e.target.checked); PLUG.refresh(); } }), label({ for: id }, text)); };
  // selectable card (radio style)
  PLUG.optcard = (o) => {
    const id = PLUG.id('opt-' + o.k);
    return div({ class: 'opt' + (o.on ? ' on' : '') + (o.disabled ? ' off' : ''), onclick: (e) => { if (!o.disabled && e.target.tagName !== 'BUTTON') o.pick(); } },
      input({ type: o.multi ? 'checkbox' : 'radio', id, name: o.group || 'g', checked: !!o.on, disabled: !!o.disabled, 'data-k': id, onchange: () => o.pick(), 'aria-describedby': id + '-d' }),
      div({ class: 'grow' }, label({ for: id, class: 't' }, o.title), o.sub ? div({ id: id + '-d', class: 'small muted' }, o.sub) : null, o.extra || null),
      o.right ? div({ class: 'price' }, o.right) : null);
  };
  PLUG.back = (path, text) => PLUG.ctx === 'a' ? null : PLUG.lnk(path, 'link small', ico('chevL', 14), ' ', text || 'Back');

  /* ---------- modal ---------- */
  PLUG.modal = (kids, onClose) => div({ class: 'modal-back', onclick: (e) => { if (e.target.classList.contains('modal-back')) onClose(); } },
    div({ class: 'modal', role: 'dialog', 'aria-modal': 'true' }, button({ class: 'x', 'aria-label': 'Close', onclick: onClose }, ico('x', 20)), kids));

  PLUG.authModal = () => {
    const a = S.auth; if (!a) return null; const close = () => { S.auth = null; PLUG.set(); };
    if (a.step === 'enter') {
      return PLUG.modal([h3('Sign in or create an account'),
        p({ class: 'muted small' }, 'We use your phone or email to send a one-time code. In this prototype no message is sent: the demo code is 123456.'),
        div({ class: 'chips', style: 'margin-bottom:12px' }, ['phone', 'email'].map(m => button({ class: 'chip' + (a.mode === m ? ' on' : ''), onclick: () => { a.mode = m; a.value = ''; a.error = ''; PLUG.set(); } }, m === 'phone' ? 'Phone' : 'Email'))),
        div({ class: 'field' }, label({ for: 'auth-value' }, a.mode === 'phone' ? 'Phone number' : 'Email address'), input({ id: 'auth-value', type: a.mode === 'phone' ? 'tel' : 'email', value: a.value, placeholder: a.mode === 'phone' ? '+232 ...' : 'name@example.com', oninput: (e) => { a.value = e.target.value; }, onkeydown: (e) => { if (e.key === 'Enter') PLUG.authSend(); } }), a.error ? div({ class: 'err', role: 'alert' }, a.error) : null),
        button({ class: 'btn pri block', onclick: PLUG.authSend }, 'Send code'),
        p({ class: 'small muted', style: 'margin-top:12px' }, 'By continuing you agree to the draft Terms and Privacy notice (see Help).')], close);
    }
    return PLUG.modal([h3('Enter your code'), p({ class: 'muted small' }, 'Demo prototype: type 123456.'),
      div({ class: 'field' }, label({ for: 'auth-code' }, '6-digit code'), input({ id: 'auth-code', inputmode: 'numeric', maxlength: 6, value: a.code, oninput: (e) => { a.code = e.target.value; }, onkeydown: (e) => { if (e.key === 'Enter') PLUG.authVerify(); } }), a.error ? div({ class: 'err', role: 'alert' }, a.error) : null),
      button({ class: 'btn pri block', onclick: PLUG.authVerify }, 'Verify'),
      button({ class: 'link small', style: 'margin-top:12px', onclick: () => { a.step = 'enter'; a.error = ''; PLUG.set(); } }, 'Use a different number or email')], close);
  };

  /* ---------- route map: hub, merchants, destination ---------- */
  PLUG.routeMap = (plan, mode) => {
    const d = PLUG.CONFIG.delivery, M = PLUG.MERCH; const pts = [{ x: d.hub.x, y: d.hub.y, n: 'Dispatch hub', t: 'hub' }, { x: plan.dest.x, y: plan.dest.y, n: 'You', t: 'you' }].concat(plan.mids.map(id => ({ x: M[id].x, y: M[id].y, n: M[id].name, t: 'm', id })));
    const xs = pts.map(q => q.x), ys = pts.map(q => q.y); const x0 = Math.min(...xs) - .6, x1 = Math.max(...xs) + .6, y0 = Math.min(...ys) - .6, y1 = Math.max(...ys) + .6;
    const W = 440, H = 230, sx = (x) => 20 + (x - x0) / Math.max(1, x1 - x0) * (W - 40), sy = (y) => 20 + (y - y0) / Math.max(1, y1 - y0) * (H - 40);
    const P = (o) => [sx(o.x).toFixed(1), sy(o.y).toFixed(1)];
    let lines = '';
    const path = (list, dash) => { lines += '<polyline fill="none" stroke="#B6FB05" stroke-width="2.4" ' + (dash ? 'stroke-dasharray="5 5" opacity=".65"' : '') + ' points="' + list.map(o => P(o).join(',')).join(' ') + '"/>'; };
    if (mode === 'combined' && plan.combined) path([pts[0]].concat(plan.combined.route.map(id => M[id])).concat(plan.bulkyIds.length ? [] : []).concat([plan.dest]));
    else plan.mids.forEach(id => path([pts[0], M[id], plan.dest], true));
    let dots = '';
    pts.forEach((q, qi) => { const [x, y] = P(q); const dy = qi % 2 ? 16 : -9; const fill = q.t === 'you' ? '#fff' : q.t === 'hub' ? '#7a8a7e' : '#B6FB05'; dots += '<circle cx="' + x + '" cy="' + y + '" r="' + (q.t === 'm' ? 6 : 7) + '" fill="' + fill + '" stroke="#050806" stroke-width="2"/><text x="' + (+x + 10) + '" y="' + (+y + 4) + '" fill="#fff" font-size="10.5" font-family="DM Sans,sans-serif" paint-order="stroke" stroke="#050806" stroke-width="3">' + q.n + '</text>'; });
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 ' + W + ' ' + H); s.setAttribute('class', 'diagram'); s.setAttribute('role', 'img');
    s.setAttribute('aria-label', 'Route sketch: ' + (mode === 'combined' ? 'one rider visits ' + plan.combined.route.map(id => M[id].name).join(', then ') + ', then you' : 'separate riders from each merchant to you') + '. Sample distances, not a real map.');
    s.innerHTML = '<rect width="' + W + '" height="' + H + '" rx="14" fill="#0A130B" stroke="rgba(182,251,5,.25)"/><g stroke="rgba(255,255,255,.05)">' + [1, 2, 3, 4, 5, 6].map(i => '<line x1="' + i * 63 + '" y1="0" x2="' + i * 60 + '" y2="' + H + '"/>').join('') + [1, 2, 3].map(i => '<line x1="0" y1="' + i * 52 + '" x2="' + W + '" y2="' + i * 52 + '"/>').join('') + '</g>' + lines + dots;
    return s;
  };
  PLUG.logo = (cls) => img({ class: cls || 'logo', src: PLUG.ASSETS.wordmark, alt: 'THE PLUG' });
})(typeof window !== 'undefined' ? window : globalThis);
