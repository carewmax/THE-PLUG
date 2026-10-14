/* THE PLUG boot: start state, mount the view, keyboard handling. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG, S = PLUG.S;
  PLUG.init();
  PLUG.initRoute('/', PLUG.validRoute);
  const focusId = (id) => { S._afterRender = () => { const n = document.getElementById(id); if (n) n.focus(); }; };
  const rq = PLUG.requireAuth; PLUG.requireAuth = (then) => { rq(then); if (S.auth) focusId('auth-value'); };
  const as = PLUG.authSend; PLUG.authSend = () => { as(); if (S.auth && S.auth.step === 'code') focusId('auth-code'); };
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (S.auth) { S.auth = null; PLUG.set(); } else if (S.itemSheet) { S.itemSheet = null; PLUG.set(); } else if (S.menuOpen) { S.menuOpen = false; PLUG.set(); }
  });
  const mount = () => PLUG.mount(document.getElementById('plug-app'), PLUG.rootView);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})(typeof window !== 'undefined' ? window : globalThis);
