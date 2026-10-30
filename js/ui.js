/*!
 * Infinitia Links — shared UI: app shell, theme, icons, toasts, modals, sharing.
 */
(function (global) {
  'use strict';

  var doc = global.document;

  var ICONS = {
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    flip: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    grid: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    idcard: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16a3 3 0 0 1 6 0M14 10h4M14 14h4"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    support: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4M12 17h.01"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A5.6 5.6 0 0 0 22 9.8C22 5.5 17.5 2 12 2Z"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    users: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.9"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    expand: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5Z"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>'
  };

  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  var LOGO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M7.2 8.2c-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8c3 0 6.6-7.6 9.6-7.6 2.1 0 3.8 1.7 3.8 3.8s-1.7 3.8-3.8 3.8c-3 0-6.6-7.6-9.6-7.6Z"/></svg>';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  function param(name) {
    try { return new URLSearchParams(global.location.search).get(name); } catch (e) { return null; }
  }

  /* ---------- Theme ---------- */
  function currentTheme() { return doc.documentElement.getAttribute('data-theme') || 'light'; }
  function setTheme(t) {
    doc.documentElement.setAttribute('data-theme', t);
    try { global.localStorage.setItem('infinitia.theme', t); } catch (e) { /* ignore */ }
    $$('.theme-toggle').forEach(function (b) {
      b.innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  /* ---------- Links ---------- */
  var isHttp = /^https?:$/.test(global.location.protocol);

  function pageUrl(page, id) {
    var qs = id ? '?id=' + encodeURIComponent(id) : '';
    return page + qs;
  }

  // Public URL used in QR codes & share links. When hosted, points at the real
  // deployed page; when opened from disk, uses the institution's (fictional) domain.
  function publicUrl(kind, id) {
    if (isHttp) {
      var base = global.location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
      return base + (kind === 'verify' ? 'verify.html' : 'profile.html') + '?id=' + encodeURIComponent(id);
    }
    var domain = (Store.branding().domain || 'id.nova-institute.example').replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return 'https://' + domain + '/' + (kind === 'verify' ? 'verify' : 'p') + '/' + encodeURIComponent(id);
  }

  function currentStudentId() {
    var id = param('id');
    return id && Store.student(id) ? id : Store.DEFAULT_ID;
  }

  /* ---------- Shell ---------- */
  var NAV = [
    { key: 'wallet', label: 'Digital ID', short: 'ID', icon: 'idcard', href: 'index.html', keepId: true },
    { key: 'profile', label: 'Profile', short: 'Profile', icon: 'user', href: 'profile.html', keepId: true },
    { key: 'verify', label: 'Verify', short: 'Verify', icon: 'shield', href: 'verify.html', keepId: true },
    { key: 'admin', label: 'Admin Preview', short: 'Admin', icon: 'grid', href: 'admin.html' }
  ];

  function renderShell() {
    var page = doc.body.getAttribute('data-page');
    var id = param('id') && Store.student(param('id')) ? param('id') : null;
    var links = NAV.map(function (n) {
      return { n: n, href: n.keepId && id ? pageUrl(n.href, id) : n.href, active: n.key === page };
    });

    var top = $('#shell-top');
    if (top) {
      top.innerHTML =
        '<div class="demo-ribbon" role="note">' + icon('alert') +
        '<span><b>Demo environment</b> · Fictional institution &amp; sample data · Not valid for identification</span></div>' +
        '<header class="topbar"><div class="container topbar-in">' +
        '<a class="brand" href="index.html" aria-label="Infinitia Links home"><span class="brand-mark">' + LOGO + '</span>' +
        '<span class="brand-text"><b>Infinitia</b> Links<small>One link. Infinite possibilities.</small></span></a>' +
        '<nav class="nav" aria-label="Main">' + links.map(function (l) {
          return '<a href="' + l.href + '" class="nav-link' + (l.active ? ' active' : '') + '"' + (l.active ? ' aria-current="page"' : '') + '>' + icon(l.n.icon) + '<span>' + l.n.label + '</span></a>';
        }).join('') + '</nav>' +
        '<button class="icon-btn theme-toggle" type="button"></button>' +
        '</div></header>';
    }

    var bottom = $('#shell-bottom');
    if (bottom) {
      bottom.innerHTML =
        '<footer class="footer"><div class="container footer-in">' +
        '<div class="footer-brand"><span class="brand-mark sm">' + LOGO + '</span><div><b>Infinitia Links</b><span>Digital Identity for the Next Generation</span></div></div>' +
        '<p class="footer-note">Nova Institute of Technology is a fictional institution. All names, IDs, contacts and records shown are sample data created for demonstration and are <b>not valid for identification</b>. No real student data is used and no institutional systems are connected.</p>' +
        '<p class="powered">Powered by <b>Infinitia Links</b> – A product by Infinitia Hub</p>' +
        '</div></footer>' +
        '<nav class="tabbar" aria-label="Main">' + links.map(function (l) {
          return '<a href="' + l.href + '" class="tab' + (l.active ? ' active' : '') + '"' + (l.active ? ' aria-current="page"' : '') + '>' + icon(l.n.icon) + '<span>' + l.n.short + '</span></a>';
        }).join('') + '</nav>';
    }

    setTheme(currentTheme());
    $$('.theme-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
        toast(currentTheme() === 'dark' ? 'Dark theme on' : 'Light theme on', 'info');
      });
    });
  }

  /* ---------- Page transitions & splash ---------- */
  function initTransitions() {
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var href = a.getAttribute('href');
      if (a.target === '_blank' || a.hasAttribute('download') || !/^[\w-]+\.html(\?|#|$)/.test(href)) return;
      e.preventDefault();
      doc.body.classList.add('leaving');
      setTimeout(function () { global.location.href = href; }, 220);
    });
    global.addEventListener('pageshow', function () { doc.body.classList.remove('leaving'); });
  }

  function hideSplash() {
    var s = $('#splash');
    if (!s) return;
    setTimeout(function () {
      s.classList.add('done');
      setTimeout(function () { s.remove(); }, 600);
    }, 650);
  }

  /* ---------- Toasts ---------- */
  function toast(msg, type) {
    var wrap = $('.toasts');
    if (!wrap) {
      wrap = doc.createElement('div');
      wrap.className = 'toasts';
      wrap.setAttribute('aria-live', 'polite');
      doc.body.appendChild(wrap);
    }
    var t = doc.createElement('div');
    var ic = { success: 'check', error: 'alert', info: 'info', warn: 'alert' }[type || 'success'];
    t.className = 'toast toast-' + (type || 'success');
    t.innerHTML = '<span class="toast-ic">' + icon(ic) + '</span><span>' + esc(msg) + '</span>';
    wrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () {
      t.classList.remove('in');
      setTimeout(function () { t.remove(); }, 350);
    }, 2800);
  }

  /* ---------- Modal ---------- */
  var openModal = null;

  function modal(opts) {
    if (openModal) openModal.close(true);
    var root = doc.createElement('div');
    root.className = 'modal-root';
    root.innerHTML =
      '<div class="modal-backdrop" data-close></div>' +
      '<div class="modal modal-' + (opts.size || 'md') + (opts.className ? ' ' + opts.className : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(opts.title || 'Dialog') + '">' +
      (opts.bare ? '' : '<div class="modal-head"><div>' + (opts.eyebrow ? '<span class="eyebrow-sm">' + esc(opts.eyebrow) + '</span>' : '') + '<h3>' + esc(opts.title || '') + '</h3></div>' +
        '<button class="icon-btn" type="button" data-close aria-label="Close">' + icon('x') + '</button></div>') +
      '<div class="modal-body"></div>' +
      (opts.footer ? '<div class="modal-foot">' + opts.footer + '</div>' : '') +
      '</div>';
    var body = $('.modal-body', root);
    if (typeof opts.body === 'string') body.innerHTML = opts.body;
    else if (opts.body) body.appendChild(opts.body);
    doc.body.appendChild(root);
    doc.body.classList.add('modal-open');
    var prevFocus = doc.activeElement;

    var api = {
      el: root,
      close: function (instant) {
        doc.removeEventListener('keydown', onKey);
        root.classList.remove('in');
        if (openModal === api) openModal = null;
        if (!openModal) doc.body.classList.remove('modal-open');
        setTimeout(function () { root.remove(); }, instant ? 0 : 280);
        if (opts.onClose) opts.onClose();
        if (prevFocus && prevFocus.focus && !instant) prevFocus.focus();
      }
    };
    function onKey(e) { if (e.key === 'Escape') api.close(); }
    doc.addEventListener('keydown', onKey);
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) api.close();
    });
    openModal = api;
    requestAnimationFrame(function () {
      root.classList.add('in');
      var f = root.querySelector('[autofocus], .modal input, .modal select, .modal button');
      if (f) f.focus({ preventScroll: true });
    });
    if (opts.onOpen) opts.onOpen(root, api);
    return api;
  }

  function confirmDialog(title, text, okLabel, danger) {
    return new Promise(function (resolve) {
      var done = false;
      var m = modal({
        title: title, size: 'sm',
        body: '<p class="muted">' + esc(text) + '</p>',
        footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" data-ok>' + esc(okLabel || 'Confirm') + '</button>',
        onClose: function () { if (!done) resolve(false); }
      });
      $('[data-ok]', m.el).addEventListener('click', function () { done = true; resolve(true); m.close(); });
    });
  }

  /* ---------- Clipboard & share ---------- */
  function copyText(text, label) {
    function fallback() {
      var ta = doc.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      doc.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }
    var p = global.navigator.clipboard && global.isSecureContext
      ? global.navigator.clipboard.writeText(text).then(function () { return true; }, fallback)
      : Promise.resolve(fallback());
    return p.then(function (ok) {
      if (ok) toast((label || 'Link') + ' copied to clipboard');
      else modal({ title: 'Copy link', size: 'sm', body: '<p class="muted">Copy this demo link:</p><input class="input mono" readonly value="' + esc(text) + '" onfocus="this.select()">' });
      return ok;
    });
  }

  function share(data) {
    if (global.navigator.share && isHttp) {
      return global.navigator.share(data).catch(function (e) {
        if (e && e.name !== 'AbortError') shareSheet(data);
      });
    }
    shareSheet(data);
    return Promise.resolve();
  }

  function shareSheet(data) {
    var text = data.text + ' ' + data.url;
    var m = modal({
      title: data.title || 'Share', eyebrow: 'Share demo profile', size: 'sm', className: 'sheet',
      body:
        '<div class="share-qr">' + QR.toSVG(data.url, { margin: 2, light: '#fff', label: 'QR code for shared link' }) + '</div>' +
        '<p class="share-url mono">' + esc(data.url) + '</p>' +
        '<div class="share-grid">' +
        '<button class="share-opt" data-act="copy">' + icon('copy') + '<span>Copy link</span></button>' +
        '<a class="share-opt" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(text) + '">' + icon('chat') + '<span>WhatsApp</span></a>' +
        '<a class="share-opt" href="mailto:?subject=' + encodeURIComponent(data.title || '') + '&body=' + encodeURIComponent(text) + '">' + icon('mail') + '<span>Email</span></a>' +
        '<a class="share-opt" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(data.url) + '">' + icon('users') + '<span>LinkedIn</span></a>' +
        '</div>' +
        '<p class="tiny muted center">Demo link only — it does not identify a real student.</p>'
    });
    $('[data-act="copy"]', m.el).addEventListener('click', function () { copyText(data.url); });
  }

  /* ---------- Misc ---------- */
  function fmtDate(iso) {
    var d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function fmtNum(n) { return Number(n).toLocaleString('en-US'); }
  function timeAgo(t) {
    var s = Math.max(1, Math.round((Date.now() - t) / 1000));
    if (s < 60) return 'just now';
    var m = Math.round(s / 60); if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60); if (h < 24) return h + ' h ago';
    var d = Math.round(h / 24); return d + ' d ago';
  }
  function downloadBlob(blob, filename) {
    var a = doc.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    doc.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function animateCount(el, to, dur) {
    var from = 0, start = performance.now();
    dur = dur || 900;
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtNum(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Replace <span data-icon="name"> placeholders: classed spans keep their box, bare ones become the icon.
  function hydrateIcons(root) {
    $$('[data-icon]', root).forEach(function (el) {
      var name = el.getAttribute('data-icon');
      if (el.className) { el.innerHTML = icon(name); el.removeAttribute('data-icon'); }
      else el.outerHTML = icon(name);
    });
  }

  function init() {
    renderShell();
    hydrateIcons();
    initTransitions();
    hideSplash();
  }

  global.UI = {
    icon: icon, LOGO: LOGO, esc: esc, $: $, $$: $$, param: param,
    toast: toast, modal: modal, confirm: confirmDialog, copy: copyText, share: share,
    pageUrl: pageUrl, publicUrl: publicUrl, currentStudentId: currentStudentId,
    fmtDate: fmtDate, fmtNum: fmtNum, timeAgo: timeAgo, downloadBlob: downloadBlob,
    animateCount: animateCount, hydrateIcons: hydrateIcons, setTheme: setTheme, init: init, isHttp: isHttp
  };
})(window);
