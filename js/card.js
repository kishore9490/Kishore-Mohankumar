/*!
 * Infinitia Links — digital ID card engine.
 * - Illustrated avatars (generated on a canvas, no photos of real people)
 * - Card templates (HTML/CSS for display, Canvas for PNG export)
 * - Interactive card with flip + tilt
 */
(function (global) {
  'use strict';

  var esc = UI.esc;

  /* ---------- Colour helpers ---------- */
  function hexToRgb(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    if (isNaN(n)) n = 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(r) { return '#' + r.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function mix(a, b, t) { var x = hexToRgb(a), y = hexToRgb(b); return rgbToHex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }
  function alpha(hex, a) { var r = hexToRgb(hex); return 'rgba(' + r.join(',') + ',' + a + ')'; }
  function shade(hex, amt) { return amt < 0 ? mix(hex, '#000000', -amt) : mix(hex, '#ffffff', amt); }

  /* ---------- Avatars ---------- */
  function ellipse(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }

  function drawAvatar(ctx, S, a) {
    var cx = S * 0.5, skin = a.skin, hair = a.hair, style = a.style;
    var g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, a.backdrop[0]); g.addColorStop(1, a.backdrop[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ellipse(ctx, cx, S * 0.4, S * 0.36, S * 0.36);

    if (style === 'long' || style === 'wave') {
      ctx.fillStyle = shade(hair, -0.1);
      ctx.beginPath();
      ctx.moveTo(cx - S * 0.2, S * 0.36);
      ctx.quadraticCurveTo(cx - S * 0.26, S * 0.62, cx - S * 0.22, S * 0.8);
      ctx.lineTo(cx + S * 0.22, S * 0.8);
      ctx.quadraticCurveTo(cx + S * 0.26, S * 0.62, cx + S * 0.2, S * 0.36);
      ctx.closePath(); ctx.fill();
    }
    // torso
    ctx.fillStyle = a.shirt; ellipse(ctx, cx, S * 1.03, S * 0.41, S * 0.32);
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.beginPath(); ctx.moveTo(cx - S * 0.1, S * 0.74); ctx.lineTo(cx, S * 0.87); ctx.lineTo(cx + S * 0.1, S * 0.74); ctx.closePath(); ctx.fill();
    // neck
    ctx.fillStyle = shade(skin, -0.12);
    ctx.fillRect(cx - S * 0.062, S * 0.55, S * 0.124, S * 0.2);
    ctx.beginPath(); ctx.moveTo(cx - S * 0.062, S * 0.73); ctx.lineTo(cx, S * 0.82); ctx.lineTo(cx + S * 0.062, S * 0.73); ctx.closePath(); ctx.fill();
    // ears + head
    ctx.fillStyle = shade(skin, -0.04);
    ellipse(ctx, cx - S * 0.165, S * 0.45, S * 0.032, S * 0.045);
    ellipse(ctx, cx + S * 0.165, S * 0.45, S * 0.032, S * 0.045);
    ctx.fillStyle = skin; ellipse(ctx, cx, S * 0.43, S * 0.162, S * 0.195);

    // hair
    ctx.fillStyle = hair;
    ctx.beginPath();
    var hy = S * 0.38, hrx = S * 0.175, hry = S * 0.16;
    if (style === 'short' || style === 'bun') {
      ctx.ellipse(cx, hy, hrx, hry, 0, Math.PI, 0);
      ctx.quadraticCurveTo(cx + S * 0.08, S * 0.3, cx, S * 0.31);
      ctx.quadraticCurveTo(cx - S * 0.1, S * 0.3, cx - hrx, hy + S * 0.02);
      ctx.fill();
      if (style === 'bun') ellipse(ctx, cx, S * 0.2, S * 0.075, S * 0.07);
    } else if (style === 'side') {
      ctx.ellipse(cx, hy, hrx, hry, 0, Math.PI, 0);
      ctx.bezierCurveTo(cx + S * 0.12, S * 0.3, cx - S * 0.02, S * 0.27, cx - S * 0.08, S * 0.33);
      ctx.quadraticCurveTo(cx - S * 0.14, S * 0.37, cx - hrx, hy + S * 0.05);
      ctx.fill();
    } else if (style === 'curly') {
      ctx.ellipse(cx, hy, hrx, hry, 0, Math.PI, 0);
      ctx.quadraticCurveTo(cx, S * 0.33, cx - hrx, hy);
      ctx.fill();
      for (var i = 0; i <= 8; i++) {
        var ang = Math.PI + (Math.PI * i) / 8;
        ellipse(ctx, cx + Math.cos(ang) * S * 0.16, hy + Math.sin(ang) * S * 0.14, S * 0.05, S * 0.05);
      }
    } else { // long / wave
      ctx.ellipse(cx, hy, hrx + S * 0.01, hry, 0, Math.PI, 0);
      ctx.lineTo(cx + hrx + S * 0.01, S * 0.56);
      ctx.quadraticCurveTo(cx + S * 0.13, S * 0.45, cx + S * 0.1, S * 0.34);
      ctx.quadraticCurveTo(cx + S * 0.02, S * 0.29, cx, S * 0.3);
      ctx.quadraticCurveTo(cx - S * 0.06, S * 0.3, cx - S * 0.12, S * 0.36);
      ctx.quadraticCurveTo(cx - S * 0.14, S * 0.46, cx - hrx - S * 0.01, S * 0.56);
      ctx.closePath();
      ctx.fill();
    }

    // face
    ctx.fillStyle = 'rgba(255,120,110,.16)';
    ellipse(ctx, cx - S * 0.09, S * 0.5, S * 0.03, S * 0.018);
    ellipse(ctx, cx + S * 0.09, S * 0.5, S * 0.03, S * 0.018);
    ctx.fillStyle = '#1A1720';
    ellipse(ctx, cx - S * 0.06, S * 0.445, S * 0.014, S * 0.017);
    ellipse(ctx, cx + S * 0.06, S * 0.445, S * 0.014, S * 0.017);
    ctx.strokeStyle = shade(hair, 0.05); ctx.lineCap = 'round'; ctx.lineWidth = S * 0.012;
    ctx.beginPath(); ctx.moveTo(cx - S * 0.085, S * 0.405); ctx.lineTo(cx - S * 0.04, S * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + S * 0.04, S * 0.4); ctx.lineTo(cx + S * 0.085, S * 0.405); ctx.stroke();
    ctx.strokeStyle = shade(skin, -0.38); ctx.lineWidth = S * 0.011;
    ctx.beginPath(); ctx.arc(cx, S * 0.49, S * 0.045, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  }

  var avatarCache = {};
  function avatarURL(student, size) {
    size = size || 320;
    var key = JSON.stringify(student.avatar) + size;
    if (!avatarCache[key]) {
      var c = document.createElement('canvas');
      c.width = c.height = size;
      drawAvatar(c.getContext('2d'), size, student.avatar);
      avatarCache[key] = c.toDataURL('image/png');
    }
    return avatarCache[key];
  }

  /* ---------- Templates ---------- */
  function palette(templateId) {
    var t = Store.template(templateId), b = Store.branding();
    if (t.brand) {
      var p = b.primary || '#0A1433', a = b.accent || '#2F6BFF';
      return { id: t.id, bg: [shade(p, -0.25), p, a], text: '#FFFFFF', muted: 'rgba(255,255,255,.72)', accent: mix(a, '#ffffff', 0.55), glow: alpha(a, 0.5), foot: 'rgba(0,0,0,.32)', dark: true };
    }
    return t;
  }

  function styleVars(p) {
    return '--c-bg1:' + p.bg[0] + ';--c-bg2:' + p.bg[1] + ';--c-bg3:' + p.bg[2] + ';--c-text:' + p.text + ';--c-muted:' + p.muted +
      ';--c-accent:' + p.accent + ';--c-glow:' + p.glow + ';--c-foot:' + p.foot;
  }

  function logoHTML(b) {
    return b.logo
      ? '<span class="idc-logo has-img"><img src="' + esc(b.logo) + '" alt=""></span>'
      : '<span class="idc-logo">' + esc((b.monogram || 'N').slice(0, 2)) + '</span>';
  }

  function statusHTML(s) {
    var on = s.status === 'active';
    return '<span class="idc-status ' + (on ? 'on' : 'off') + '"><i></i>' + (on ? 'Demo Active' : 'Demo Inactive') + '</span>';
  }

  function shortUrl(u) { return u.replace(/^https?:\/\//, ''); }

  function frontHTML(s, b, interactive) {
    var verify = UI.publicUrl('verify', s.id);
    var qrTag = interactive ? 'button type="button" data-qr aria-label="Open demo verification"' : 'div';
    var qrClose = interactive ? 'button' : 'div';
    return '<div class="idc-face idc-front">' +
      '<div class="idc-fx"></div><div class="idc-wm" aria-hidden="true">DEMO</div>' +
      '<div class="idc-top">' + logoHTML(b) +
      '<div class="idc-inst"><b>' + esc(b.institution) + '</b><span>Student Digital ID · Sample</span></div>' + statusHTML(s) + '</div>' +
      '<div class="idc-photo"><img src="' + avatarURL(s) + '" alt="Illustrated sample avatar for ' + esc(s.name) + '"></div>' +
      '<div class="idc-main"><span class="idc-label">Student name</span><div class="idc-name">' + esc(s.name) + '</div>' +
      '<div class="idc-prog">' + esc(s.programme) + '</div><div class="idc-dept">Department of ' + esc(s.department) + '</div></div>' +
      '<div class="idc-row">' +
      '<div><span class="idc-label">Student ID</span><b class="idc-val mono">' + esc(s.id) + '</b></div>' +
      '<div><span class="idc-label">Academic year</span><b class="idc-val">' + esc(s.academicYear) + '</b></div>' +
      '<div><span class="idc-label">Year</span><b class="idc-val">' + esc(s.year) + '</b></div></div>' +
      '<' + qrTag + ' class="idc-qr">' + QR.toSVG(verify, { label: 'Demo verification QR code' }) + '</' + qrClose + '>' +
      '<div class="idc-qr-cap">Scan · Demo verify</div>' +
      '<div class="idc-foot"><span>Not valid for identification · Demo</span><span class="idc-brand">' + UI.LOGO + 'Infinitia Links</span></div>' +
      '<div class="idc-shine"></div></div>';
  }

  function backHTML(s, b, interactive) {
    var verify = UI.publicUrl('verify', s.id);
    var qrTag = interactive ? 'button type="button" data-qr aria-label="Open demo verification"' : 'div';
    var qrClose = interactive ? 'button' : 'div';
    var e = s.emergency || {};
    function cell(label, val, sub) {
      return '<div><span class="idc-label">' + label + '</span><b>' + esc(val) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>';
    }
    return '<div class="idc-face idc-back">' +
      '<div class="idc-fx"></div><div class="idc-wm" aria-hidden="true">DEMO</div>' +
      '<div class="idc-stripe"><span>' + esc(b.shortName || b.institution) + ' · Sample card</span></div>' +
      '<div class="idc-back-grid">' +
      cell('If found, return to', b.institution, b.campus) +
      cell('Institution email', b.supportEmail) +
      cell('Student email', s.email) +
      cell('Emergency contact (demo)', e.name || '—', (e.relation || '') + ' · ' + (e.phone || '')) +
      cell('Valid through', UI.fmtDate(s.validThru || '2027-05-31'), 'Demonstration validity') +
      cell('Blood group', 'Not displayed') +
      '</div>' +
      '<' + qrTag + ' class="idc-qr idc-qr-back">' + QR.toSVG(verify, { label: 'Demo verification QR code' }) + '</' + qrClose + '>' +
      '<div class="idc-qr-cap idc-qr-cap-back">Scan for demo verification<span class="mono">' + esc(shortUrl(verify)) + '</span></div>' +
      '<div class="idc-sign"><svg viewBox="0 0 120 30" aria-hidden="true"><path d="M4 22c8-14 14-16 16-10s-6 10 0 8 10-14 16-12-2 12 4 11 8-9 12-8 2 7 8 6 10-6 16-7 10 2 14 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '<span>Authorised signatory · Sample</span></div>' +
      '<div class="idc-foot idc-foot-back"><span>This is a demonstration identity card. It is not an official student credential.</span></div>' +
      '<div class="idc-shine"></div></div>';
  }

  /** Static (non-interactive) card markup, used for previews and thumbnails. */
  function html(student, templateId, opts) {
    opts = opts || {};
    var p = palette(templateId), b = Store.branding();
    var side = opts.side === 'back' ? backHTML(student, b, false) : frontHTML(student, b, false);
    return '<div class="idc idc-static' + (p.dark ? '' : ' light') + (opts.className ? ' ' + opts.className : '') + '" style="' + styleVars(p) + '">' +
      '<div class="idc-inner">' + side + '</div></div>';
  }

  /** Interactive card: flip, tilt, clickable QR. */
  function mount(container, opts) {
    var state = { student: opts.student, templateId: opts.templateId, side: 'front' };
    var tilt = document.createElement('div');
    tilt.className = 'idc-tilt';
    container.innerHTML = '';
    container.appendChild(tilt);

    function render() {
      var p = palette(state.templateId), b = Store.branding();
      tilt.innerHTML =
        '<div class="idc idc-live' + (p.dark ? '' : ' light') + (state.side === 'back' ? ' flipped' : '') + '" style="' + styleVars(p) + '" tabindex="0" role="button" ' +
        'aria-label="Sample digital ID card for ' + esc(state.student.name) + '. Press to flip.">' +
        '<div class="idc-inner">' + frontHTML(state.student, b, true) + backHTML(state.student, b, true) + '</div></div>';
      var card = tilt.firstChild;
      card.addEventListener('click', function (e) {
        if (e.target.closest('[data-qr]')) { e.stopPropagation(); if (opts.onQr) opts.onQr(); return; }
        api.flip();
      });
      card.addEventListener('keydown', function (e) {
        if (e.target !== card) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); api.flip(); }
      });
    }

    var api = {
      el: tilt,
      get side() { return state.side; },
      flip: function () { api.setSide(state.side === 'front' ? 'back' : 'front'); },
      setSide: function (side) {
        state.side = side;
        var card = tilt.querySelector('.idc');
        card.classList.toggle('flipped', side === 'back');
        if (opts.onFlip) opts.onFlip(side);
      },
      update: function (patch) {
        Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
        render();
      }
    };

    // Pointer tilt + shine (mouse/pen only so touch scrolling stays natural)
    if (opts.tilt !== false && !global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      container.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = tilt.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        tilt.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
        tilt.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
        tilt.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        tilt.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        tilt.classList.add('hovering');
      });
      container.addEventListener('pointerleave', function () {
        tilt.style.setProperty('--rx', '0deg');
        tilt.style.setProperty('--ry', '0deg');
        tilt.classList.remove('hovering');
      });
    }

    render();
    return api;
  }

  /* ---------- Canvas export ---------- */
  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  var SANS = '"Plus Jakarta Sans", "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif';
  var MONO = '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

  function text(ctx, str, x, y, o) {
    var size = o.size;
    ctx.save();
    ctx.fillStyle = o.color;
    ctx.textBaseline = o.baseline || 'top';
    ctx.textAlign = o.align || 'left';
    if ('letterSpacing' in ctx) ctx.letterSpacing = (o.spacing || 0) + 'px';
    function setFont() { ctx.font = (o.weight || 500) + ' ' + size + 'px ' + (o.mono ? MONO : SANS); }
    setFont();
    if (o.maxW) {
      while (ctx.measureText(str).width > o.maxW && size > o.size * 0.6) { size *= 0.95; setFont(); }
      if (ctx.measureText(str).width > o.maxW) {
        while (str.length > 1 && ctx.measureText(str + '…').width > o.maxW) str = str.slice(0, -1);
        str += '…';
      }
    }
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  function drawBase(ctx, W, H, u, p) {
    rr(ctx, 0, 0, W, H, 4.2 * u);
    ctx.clip();
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, p.bg[0]); g.addColorStop(0.55, p.bg[1]); g.addColorStop(1, p.bg[2]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var rg = ctx.createRadialGradient(W * 0.88, H * 0.08, 0, W * 0.88, H * 0.08, W * 0.5);
    rg.addColorStop(0, p.glow); rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = p.dark ? 'rgba(255,255,255,.06)' : 'rgba(10,20,51,.06)';
    ctx.lineWidth = 0.25 * u;
    for (var i = 1; i <= 5; i++) { ctx.beginPath(); ctx.arc(-2 * u, H + 2 * u, i * 9 * u, 0, Math.PI * 2); ctx.stroke(); }
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.rotate(-18 * Math.PI / 180);
    text(ctx, 'DEMO', 0, 0, { size: 19 * u, weight: 800, color: p.dark ? 'rgba(255,255,255,.07)' : 'rgba(10,20,51,.06)', align: 'center', baseline: 'middle', spacing: u });
    ctx.restore();
  }

  function drawFoot(ctx, W, H, u, p, left, right) {
    ctx.fillStyle = p.foot;
    ctx.fillRect(0, H - 8.4 * u, W, 8.4 * u);
    text(ctx, left.toUpperCase(), 5 * u, H - 4.2 * u, { size: 1.35 * u, weight: 700, color: p.muted, baseline: 'middle', spacing: 0.18 * u, maxW: right ? 60 * u : 90 * u });
    if (right) text(ctx, '∞  ' + right, W - 5 * u, H - 4.2 * u, { size: 1.5 * u, weight: 700, color: p.text, baseline: 'middle', align: 'right' });
  }

  function drawQRBox(ctx, url, x, y, w, u) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 2 * u; ctx.shadowOffsetY = 0.6 * u;
    rr(ctx, x, y, w, w, 2.2 * u); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
    var pad = w * 0.07;
    QR.drawToCanvas(ctx, url, x + pad, y + pad, w - pad * 2, '#0A1433');
  }

  function drawFront(ctx, W, H, u, p, s, b, imgs) {
    drawBase(ctx, W, H, u, p);
    // logo
    var ly = 4.6 * u, ls = 7.6 * u;
    rr(ctx, 5 * u, ly, ls, ls, 2 * u);
    ctx.fillStyle = imgs.logo ? '#fff' : (p.dark ? 'rgba(255,255,255,.14)' : alpha('#2F6BFF', 0.1)); ctx.fill();
    if (imgs.logo) {
      var lw = imgs.logo.width, lh = imgs.logo.height, k = Math.min((ls - 1.6 * u) / lw, (ls - 1.6 * u) / lh);
      ctx.drawImage(imgs.logo, 5 * u + (ls - lw * k) / 2, ly + (ls - lh * k) / 2, lw * k, lh * k);
    } else {
      text(ctx, (b.monogram || 'N').slice(0, 2), 5 * u + ls / 2, ly + ls / 2, { size: 3.8 * u, weight: 800, color: p.dark ? p.text : p.accent, align: 'center', baseline: 'middle' });
    }
    text(ctx, b.institution, 14.6 * u, 5.4 * u, { size: 2.9 * u, weight: 700, color: p.text, maxW: 52 * u });
    text(ctx, 'STUDENT DIGITAL ID · SAMPLE', 14.6 * u, 9.1 * u, { size: 1.45 * u, weight: 600, color: p.muted, spacing: 0.3 * u });
    // status pill
    var on = s.status === 'active', label = on ? 'DEMO ACTIVE' : 'DEMO INACTIVE';
    ctx.font = '700 ' + 1.5 * u + 'px ' + SANS;
    var pw = ctx.measureText(label).width + 6.4 * u, px = W - 5 * u - pw, py = 6.7 * u;
    rr(ctx, px, py, pw, 3.6 * u, 1.8 * u);
    ctx.fillStyle = on ? 'rgba(16,185,129,.18)' : 'rgba(244,63,94,.18)'; ctx.fill();
    ctx.strokeStyle = on ? 'rgba(52,211,153,.55)' : 'rgba(251,113,133,.55)'; ctx.lineWidth = 0.15 * u; ctx.stroke();
    ctx.fillStyle = on ? '#34D399' : '#FB7185';
    ctx.beginPath(); ctx.arc(px + 2.2 * u, py + 1.8 * u, 0.55 * u, 0, Math.PI * 2); ctx.fill();
    text(ctx, label, px + 3.6 * u, py + 1.85 * u, { size: 1.5 * u, weight: 700, color: p.dark ? '#fff' : (on ? '#047857' : '#BE123C'), baseline: 'middle', spacing: 0.1 * u });
    // photo
    var phx = 5 * u, phy = 17 * u, phw = 19 * u, phh = 24 * u;
    ctx.save();
    rr(ctx, phx, phy, phw, phh, 2.4 * u); ctx.clip();
    var S = imgs.avatar.width, sw = S * phw / phh;
    ctx.drawImage(imgs.avatar, (S - sw) / 2, 0, sw, S, phx, phy, phw, phh);
    ctx.restore();
    rr(ctx, phx, phy, phw, phh, 2.4 * u);
    ctx.strokeStyle = p.dark ? 'rgba(255,255,255,.35)' : 'rgba(10,20,51,.12)'; ctx.lineWidth = 0.3 * u; ctx.stroke();
    // main
    var mx = 27.5 * u;
    text(ctx, 'STUDENT NAME', mx, 18 * u, { size: 1.35 * u, weight: 700, color: p.muted, spacing: 0.25 * u });
    text(ctx, s.name, mx, 20.4 * u, { size: 4.3 * u, weight: 800, color: p.text, maxW: 45 * u });
    text(ctx, s.programme, mx, 26.6 * u, { size: 2.05 * u, weight: 600, color: p.text, maxW: 45 * u });
    text(ctx, 'Department of ' + s.department, mx, 29.8 * u, { size: 1.8 * u, weight: 500, color: p.muted, maxW: 45 * u });
    // details row
    [[5, 'STUDENT ID', s.id, true], [33.2, 'ACADEMIC YEAR', s.academicYear], [56.2, 'YEAR', s.year]].forEach(function (c) {
      text(ctx, c[1], c[0] * u, 44.5 * u, { size: 1.35 * u, weight: 700, color: p.muted, spacing: 0.25 * u });
      text(ctx, c[2], c[0] * u, 46.9 * u, { size: 2.05 * u, weight: 700, color: p.text, mono: c[3], maxW: 22 * u });
    });
    // QR
    drawQRBox(ctx, UI.publicUrl('verify', s.id), 76 * u, 17 * u, 19 * u, u);
    text(ctx, 'SCAN · DEMO VERIFY', 85.5 * u, 37.6 * u, { size: 1.3 * u, weight: 700, color: p.muted, align: 'center', spacing: 0.2 * u });
    drawFoot(ctx, W, H, u, p, 'Not valid for identification · Demo', 'Infinitia Links');
  }

  function drawBack(ctx, W, H, u, p, s, b) {
    drawBase(ctx, W, H, u, p);
    ctx.fillStyle = p.dark ? 'rgba(0,0,0,.42)' : 'rgba(10,20,51,.85)';
    ctx.fillRect(0, 5 * u, W, 7.5 * u);
    text(ctx, ((b.shortName || b.institution) + ' · Sample card').toUpperCase(), W - 5 * u, 8.75 * u, { size: 1.3 * u, weight: 700, color: 'rgba(255,255,255,.55)', align: 'right', baseline: 'middle', spacing: 0.3 * u });
    var e = s.emergency || {};
    var cells = [
      ['IF FOUND, RETURN TO', b.institution, b.campus],
      ['INSTITUTION EMAIL', b.supportEmail],
      ['STUDENT EMAIL', s.email],
      ['EMERGENCY CONTACT (DEMO)', e.name || '—', (e.relation || '') + ' · ' + (e.phone || '')],
      ['VALID THROUGH', UI.fmtDate(s.validThru || '2027-05-31'), 'Demonstration validity'],
      ['BLOOD GROUP', 'Not displayed']
    ];
    cells.forEach(function (c, i) {
      var x = (5 + (i % 2) * 33) * u, y = (16 + Math.floor(i / 2) * 8.4) * u;
      text(ctx, c[0], x, y, { size: 1.3 * u, weight: 700, color: p.muted, spacing: 0.22 * u });
      text(ctx, c[1], x, y + 2.1 * u, { size: 1.85 * u, weight: 700, color: p.text, maxW: 30 * u });
      if (c[2]) text(ctx, c[2], x, y + 4.6 * u, { size: 1.4 * u, weight: 500, color: p.muted, maxW: 30 * u });
    });
    // signature
    ctx.save();
    ctx.strokeStyle = p.text; ctx.globalAlpha = 0.85; ctx.lineWidth = 0.35 * u; ctx.lineCap = 'round';
    ctx.translate(5 * u, 42.5 * u); ctx.scale(u / 5, u / 5);
    ctx.stroke(new Path2D('M4 22c8-14 14-16 16-10s-6 10 0 8 10-14 16-12-2 12 4 11 8-9 12-8 2 7 8 6 10-6 16-7 10 2 14 1'));
    ctx.restore();
    ctx.fillStyle = p.dark ? 'rgba(255,255,255,.3)' : 'rgba(10,20,51,.2)';
    ctx.fillRect(5 * u, 49 * u, 26 * u, 0.15 * u);
    text(ctx, 'AUTHORISED SIGNATORY · SAMPLE', 5 * u, 50 * u, { size: 1.2 * u, weight: 700, color: p.muted, spacing: 0.2 * u });
    var url = UI.publicUrl('verify', s.id);
    drawQRBox(ctx, url, 73 * u, 16 * u, 22 * u, u);
    text(ctx, 'SCAN FOR DEMO VERIFICATION', 84 * u, 39.6 * u, { size: 1.25 * u, weight: 700, color: p.muted, align: 'center', spacing: 0.15 * u });
    text(ctx, shortUrl(url), 84 * u, 42 * u, { size: 1.15 * u, weight: 500, color: p.muted, align: 'center', mono: true, maxW: 26 * u });
    drawFoot(ctx, W, H, u, p, 'This is a demonstration identity card. It is not an official student credential.');
  }

  function toCanvas(student, templateId, side, scale) {
    scale = scale || 2;
    var W = 1012, H = 638, u = W / 100, b = Store.branding(), p = palette(templateId);
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return fonts.then(function () {
      return Promise.all([loadImage(avatarURL(student, 480)), b.logo ? loadImage(b.logo) : Promise.resolve(null)]);
    }).then(function (imgs) {
      var c = document.createElement('canvas');
      c.width = W * scale; c.height = H * scale;
      var ctx = c.getContext('2d');
      ctx.scale(scale, scale);
      if (side === 'back') drawBack(ctx, W, H, u, p, student, b);
      else drawFront(ctx, W, H, u, p, student, b, { avatar: imgs[0], logo: imgs[1] });
      return c;
    });
  }

  function downloadPNG(student, templateId, side) {
    return toCanvas(student, templateId, side, 2).then(function (c) {
      return new Promise(function (resolve) {
        c.toBlob(function (blob) {
          UI.downloadBlob(blob, 'infinitia-demo-id-' + student.id.toLowerCase() + '-' + (side || 'front') + '.png');
          resolve();
        }, 'image/png');
      });
    });
  }

  global.Card = {
    html: html, mount: mount, toCanvas: toCanvas, downloadPNG: downloadPNG,
    avatarURL: avatarURL, palette: palette, styleVars: styleVars, mix: mix, alpha: alpha
  };
})(window);
