/* Infinitia Hub Poster Studio — canvas rendering engine.
 * One renderer draws the live preview, the gallery thumbnails and the exported file,
 * so the download always matches what you see. All coordinates are in poster pixels;
 * the caller supplies a scale for preview/print sizes. */
(function (root) {
  'use strict';

  /* ---------------- Fonts ---------------- */
  const FONTS = {
    'Poppins': 'sans', 'Inter': 'sans', 'Montserrat': 'sans', 'Outfit': 'sans', 'Space Grotesk': 'sans', 'Raleway': 'sans',
    'Playfair Display': 'serif', 'DM Serif Display': 'serif', 'Cormorant Garamond': 'serif', 'Lora': 'serif',
    'Bebas Neue': 'display', 'Archivo Black': 'display', 'Orbitron': 'display', 'Great Vibes': 'script'
  };
  const FALLBACK = {
    sans: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    display: 'Impact, "Arial Black", system-ui, sans-serif',
    script: '"Segoe Script", "Brush Script MT", cursive'
  };
  const SCRIPT_FONT = 'Great Vibes';
  const QUOTE_FONT = 'Playfair Display';

  function font(weight, size, family) {
    const kind = FONTS[family] || 'sans';
    return `${weight} ${Math.max(0.5, size).toFixed(2)}px "${family}", ${FALLBACK[kind]}`;
  }
  function setLS(ctx, px) { if ('letterSpacing' in ctx) ctx.letterSpacing = (px || 0).toFixed(2) + 'px'; }

  /* ---------------- Colour helpers ---------------- */
  function hex2rgb(h) {
    h = String(h || '#000000').trim();
    if (h.startsWith('rgb')) { const m = h.match(/[\d.]+/g) || [0, 0, 0]; return { r: +m[0], g: +m[1], b: +m[2] }; }
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16) || 0;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgba(h, a) { const c = hex2rgb(h); return `rgba(${c.r},${c.g},${c.b},${Math.max(0, Math.min(1, a))})`; }
  function lum(h) {
    const c = hex2rgb(h);
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function onColor(h) {
    const L = lum(h);
    return (L + 0.05) / 0.0589 > 1.05 / (L + 0.05) ? '#0F172A' : '#FFFFFF';
  }
  function mix(a, b, t) {
    const x = hex2rgb(a), y = hex2rgb(b);
    const m = (p, q) => Math.round(p + (q - p) * t);
    return '#' + [m(x.r, y.r), m(x.g, y.g), m(x.b, y.b)].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  /* ---------------- Icons (24×24 stroke paths, Lucide-style) ---------------- */
  const C = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const ICONS = {
    globe: [C(12, 12, 10), 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
    phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'],
    chat: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z', 'M8.5 10.5c.5 2 2.5 4 5 5l1.5-1.5 2 1-.5 1.5c-3.5 0-8-4.5-8-8l1.5-.5 1 2z'],
    check: ['M20 6 9 17l-5-5'],
    checkCircle: [C(12, 12, 10), 'm8.5 12.5 2.5 2.5 5-5.5'],
    x: ['M18 6 6 18', 'm6 6 12 12'],
    xCircle: [C(12, 12, 10), 'm15 9-6 6', 'm9 9 6 6'],
    star: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
    arrow: ['M5 12h14', 'm12 5 7 7-7 7'],
    mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'm22 7-10 6L2 7'],
    pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z', C(12, 10, 3)],
    calendar: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
    clock: [C(12, 12, 10), 'M12 6v6l4 2'],
    users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', C(9, 7, 4), 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
    sparkles: ['M12 3l1.9 5.8 5.8 1.9-5.8 1.9L12 18.5l-1.9-5.9L4.3 10.7l5.8-1.9z', 'M19 15l.7 2.3 2.3.7-2.3.7L19 21l-.7-2.3-2.3-.7 2.3-.7z'],
    zap: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
    bolt: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
    target: [C(12, 12, 10), C(12, 12, 6), C(12, 12, 2)],
    trend: ['m22 7-8.5 8.5-5-5L2 17', 'M16 7h6v6'],
    shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 12 2 2 4-4'],
    heart: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'],
    home: ['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
    briefcase: ['M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z', 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'],
    cpu: ['M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M9 9h6v6H9z', 'M9 1v3', 'M15 1v3', 'M9 20v3', 'M15 20v3', 'M20 9h3', 'M20 14h3', 'M1 9h3', 'M1 14h3'],
    rocket: ['M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z', 'm12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z', 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0', 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5']
  };
  const pathCache = {};
  function iconPaths(name) {
    if (!pathCache[name]) pathCache[name] = (ICONS[name] || ICONS.check).map(d => new Path2D(d));
    return pathCache[name];
  }
  function drawIcon(ctx, name, x, y, size, color, weight) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 24, size / 24);
    ctx.strokeStyle = color;
    ctx.lineWidth = weight || 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    iconPaths(name).forEach(p => ctx.stroke(p));
    ctx.restore();
  }

  /* ---------------- Geometry helpers ---------------- */
  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r || 0, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function archPath(ctx, x, y, w, h) {
    const r = Math.min(w / 2, h);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arc(x + w / 2, y + r, w / 2, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  }
  function starPath(ctx, cx, cy, ro, ri, n, rot) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? ri : ro;
      const a = (rot || -Math.PI / 2) + i * Math.PI / n;
      i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath();
  }
  function sparkle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.closePath();
  }
  function imgSize(img) { return { w: img.naturalWidth || img.width || 1, h: img.naturalHeight || img.height || 1 }; }
  function drawCover(ctx, img, x, y, w, h) {
    const s = imgSize(img); const k = Math.max(w / s.w, h / s.h);
    const dw = s.w * k, dh = s.h * k;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  /* ---------------- Text wrapping ---------------- */
  function wrap(ctx, text, maxW) {
    const lines = [];
    String(text).trim().split('\n').forEach(par => {
      const words = par.split(/\s+/).filter(Boolean);
      if (!words.length) { lines.push(''); return; }
      let line = '';
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width <= maxW) { line = test; continue; }
        if (line) lines.push(line);
        if (ctx.measureText(word).width <= maxW) { line = word; continue; }
        let chunk = '';
        for (const ch of word) {
          if (chunk && ctx.measureText(chunk + ch).width > maxW) { lines.push(chunk); chunk = ch; } else chunk += ch;
        }
        line = chunk;
      }
      if (line) lines.push(line);
    });
    return lines;
  }
  function wordsFit(ctx, text, w) { return String(text).split(/\s+/).every(x => ctx.measureText(x).width <= w); }
  function maxWidth(ctx, lines) { return lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0); }
  function alignX(al, x, w, inner) { return al === 'center' ? x + (w - inner) / 2 : al === 'right' ? x + w - inner : x; }

  /* ---------------- Blocks ----------------
   * A block has: g (gap before, in units of u), measure(s, w) → height, draw(x, y, w, s).
   * Stacks shrink every block together (scale s) until the whole stack fits its box, so
   * text is never clipped whatever the poster size. */
  const OVER = 1e6; // returned when a single-line element cannot fit the width

  function TextB(e, text, o) {
    text = String(text || '').trim();
    if (!text) return null;
    if (o.upper) text = text.toUpperCase();
    const ctx = e.ctx;
    const fw = (o.italic ? 'italic ' : '') + (o.weight || 400);
    const lh = o.lh || 1.2;
    let c = null;
    const b = {
      g: o.g == null ? 0.028 : o.g,
      measure(s, w) {
        let size = o.size * s;
        ctx.font = font(fw, size, o.fam); setLS(ctx, (o.ls || 0) * size);
        let lines = o.wordLines ? text.split(/\s+/) : wrap(ctx, text, w);
        if (o.fillWidth) {
          ctx.font = font(fw, 100, o.fam); setLS(ctx, (o.ls || 0) * 100);
          const unit = o.wordLines ? maxWidth(ctx, lines) : ctx.measureText(text.split(/\s+/).reduce((a, x) => x.length > a.length ? x : a, '')).width;
          const cap = unit > 0 ? (w * 0.98 * 100) / unit : o.size;
          size = Math.min(o.size * (o.fillMax || 1.6), cap) * s;
          ctx.font = font(fw, size, o.fam); setLS(ctx, (o.ls || 0) * size);
          if (!o.wordLines) lines = wrap(ctx, text, w);
        }
        const broken = !o.wordLines && !wordsFit(ctx, text, w);
        c = { s, w, size, lines };
        setLS(ctx, 0);
        return lines.length * size * lh + (broken ? OVER : 0);
      },
      draw(x, y, w, s) {
        if (!c || c.s !== s || c.w !== w) b.measure(s, w);
        const { size, lines } = c;
        const lineH = size * lh;
        const al = o.align || e.align;
        ctx.save();
        ctx.font = font(fw, size, o.fam); setLS(ctx, (o.ls || 0) * size);
        ctx.textBaseline = 'middle';
        ctx.textAlign = al;
        const ax = al === 'center' ? x + w / 2 : al === 'right' ? x + w : x;
        let fill = o.color;
        if (o.hl === 'gradient') {
          const gr = ctx.createLinearGradient(x, y, x + w, y + lineH * lines.length);
          gr.addColorStop(0, e.p.accent); gr.addColorStop(1, e.p.accent2);
          fill = gr;
        }
        if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = size * 0.35 * e.k; }
        lines.forEach((ln, i) => {
          const cy = y + i * lineH + lineH / 2 + size * 0.04;
          const last = i === lines.length - 1;
          const tw = ctx.measureText(ln).width;
          const lx = al === 'center' ? ax - tw / 2 : al === 'right' ? ax - tw : ax;
          if (o.hl === 'marker' && last) {
            ctx.save(); ctx.shadowBlur = 0; ctx.fillStyle = rgba(e.p.accent2, 0.45);
            ctx.fillRect(lx - size * 0.08, cy - size * 0.02, tw + size * 0.16, size * 0.42); ctx.restore();
          }
          if (o.hl === 'underline' && last) {
            ctx.save(); ctx.fillStyle = e.p.accent; ctx.fillRect(lx, cy + size * 0.48, Math.min(tw, size * 2.2), size * 0.09); ctx.restore();
          }
          if (o.hl === 'outline' && i % 2 === 1) {
            ctx.lineWidth = Math.max(1, size * 0.028); ctx.strokeStyle = o.color; ctx.strokeText(ln, ax, cy); return;
          }
          if (o.hl === 'accentLast' && last) {
            if (lines.length > 1) { ctx.fillStyle = e.p.accent; ctx.fillText(ln, ax, cy); return; }
            const words = ln.split(' ');
            if (words.length > 1) {
              const head = words.slice(0, -1).join(' ') + ' ';
              const hw = ctx.measureText(head).width;
              ctx.textAlign = 'left';
              ctx.fillStyle = fill; ctx.fillText(head, lx, cy);
              ctx.fillStyle = e.p.accent; ctx.fillText(words[words.length - 1], lx + hw, cy);
              ctx.textAlign = al;
              return;
            }
          }
          ctx.fillStyle = fill;
          ctx.fillText(ln, ax, cy);
        });
        ctx.restore();
      }
    };
    return b;
  }

  function TagB(e, text, o) {
    text = String(text || '').trim();
    if (!text) return null;
    const st = o.style || 'pill';
    const base = 0.026 * e.s.bodyScale * e.u;
    if (st === 'script') return TextB(e, text, { fam: SCRIPT_FONT, weight: 400, size: base * 2.6, color: e.p.accent, lh: 1.1, g: 0 });
    if (st === 'text') return TextB(e, text, { fam: e.bodyFont, weight: 700, size: base, color: e.p.accent, upper: true, ls: 0.16, lh: 1.3, g: 0 });
    const ctx = e.ctx;
    let c = null;
    const t = st === 'ribbon' ? text.toUpperCase() : text.toUpperCase();
    const b = {
      g: 0,
      measure(s, w) {
        const size = base * s, px = size * (st === 'ribbon' ? 1.4 : 1.1), py = size * 0.62;
        ctx.font = font(700, size, e.bodyFont); setLS(ctx, size * 0.12);
        const lines = wrap(ctx, t, Math.max(10, w - px * 2 - (st === 'ribbon' ? size * 1.6 : 0)));
        c = { s, w, size, px, py, lines, tw: maxWidth(ctx, lines) };
        setLS(ctx, 0);
        return lines.length * size * 1.3 + py * 2;
      },
      draw(x, y, w, s) {
        if (!c || c.s !== s || c.w !== w) b.measure(s, w);
        const { size, px, py, lines, tw } = c;
        const h = lines.length * size * 1.3 + py * 2, bw = tw + px * 2;
        const bx = alignX(o.align || e.align, x, w, bw);
        ctx.save();
        if (st === 'ribbon') {
          const tl = size * 0.8;
          ctx.beginPath();
          ctx.moveTo(bx - tl, y); ctx.lineTo(bx + bw + tl, y); ctx.lineTo(bx + bw, y + h / 2); ctx.lineTo(bx + bw + tl, y + h);
          ctx.lineTo(bx - tl, y + h); ctx.lineTo(bx, y + h / 2); ctx.closePath();
          ctx.fillStyle = e.p.accent; ctx.fill();
        } else {
          rr(ctx, bx, y, bw, h, e.rad(h));
          if (st === 'pill') { ctx.fillStyle = e.p.accent; ctx.fill(); }
          if (st === 'soft') { ctx.fillStyle = rgba(e.p.accent, e.dark ? 0.22 : 0.13); ctx.fill(); }
          if (st === 'outline') { ctx.strokeStyle = e.p.accent; ctx.lineWidth = Math.max(1, size * 0.1); ctx.stroke(); }
        }
        const tc = st === 'pill' || st === 'ribbon' ? onColor(e.p.accent) : (st === 'soft' && !e.dark ? mix(e.p.accent, '#000000', 0.25) : e.p.accent);
        ctx.fillStyle = tc;
        ctx.font = font(700, size, e.bodyFont); setLS(ctx, size * 0.12);
        ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
        lines.forEach((ln, i) => ctx.fillText(ln, bx + bw / 2 + size * 0.06, y + py + i * size * 1.3 + size * 0.68));
        ctx.restore();
      }
    };
    return b;
  }

  function FeatB(e, items, o) {
    items = (items || []).map(t => String(t).trim()).filter(Boolean);
    if (!items.length) return null;
    const st = o.style || 'check';
    if (st === 'pill') return PillsB(e, items, o);
    const ctx = e.ctx;
    const base = (o.size || 0.03) * e.s.bodyScale * e.u;
    const color = o.color || e.p.text;
    let c = null;
    const card = st === 'card';
    const b = {
      g: o.g == null ? 0.034 : o.g,
      measure(s, w) {
        const size = base * s;
        const iconW = st === 'number' ? size * 2.2 : st === 'dot' ? size * 1.1 : size * 1.75;
        const padX = card ? size * 0.9 : 0, padY = card ? size * 0.75 : 0;
        let cols = o.cols || 1;
        if (o.cols === 'auto') cols = (w > e.u * 0.95 && items.length >= 4) ? 2 : 1;
        const gapC = size * 1.2, rowGap = card ? size * 0.55 : size * 0.6;
        const colW = (w - gapC * (cols - 1)) / cols;
        const textW = Math.max(20, colW - iconW - padX * 2);
        ctx.font = font(o.weight || 500, size, e.bodyFont);
        let natural = 0;
        const cells = items.map(t => {
          const lines = wrap(ctx, t, textW);
          natural = Math.max(natural, maxWidth(ctx, lines));
          return { lines, h: Math.max(lines.length * size * 1.32, size * 1.3) + padY * 2 };
        });
        const rows = [];
        for (let i = 0; i < cells.length; i += cols) rows.push(Math.max(...cells.slice(i, i + cols).map(x => x.h)));
        const total = rows.reduce((a, h) => a + h, 0) + rowGap * (rows.length - 1);
        c = { s, w, size, iconW, padX, padY, cols, gapC, rowGap, colW, cells, rows, natural: natural + iconW + padX * 2 };
        return total;
      },
      draw(x, y, w, s) {
        if (!c || c.s !== s || c.w !== w) b.measure(s, w);
        const { size, iconW, padX, padY, cols, gapC, rowGap, colW, cells, rows } = c;
        const gw = cols === 1 ? Math.min(w, card ? w : c.natural) : w;
        const cw = cols === 1 ? gw : colW;
        const gx = alignX(o.align || e.align, x, w, gw);
        ctx.save();
        let cy = y;
        rows.forEach((rh, r) => {
          for (let k = 0; k < cols; k++) {
            const i = r * cols + k; const cell = cells[i];
            if (!cell) break;
            const cx = gx + k * (colW + gapC);
            if (card) {
              rr(ctx, cx, cy, cw, rh, e.crad(0.6));
              ctx.fillStyle = e.dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)'; ctx.fill();
              ctx.strokeStyle = rgba(e.p.text, 0.1); ctx.lineWidth = Math.max(1, size * 0.05); ctx.stroke();
            }
            const ty = cy + padY;
            const iy = ty + size * 0.66;
            const ix = cx + padX;
            if (st === 'number') {
              ctx.font = font(800, size * 1.05, e.headFont); ctx.fillStyle = e.p.accent;
              ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
              ctx.fillText(String(i + 1).padStart(2, '0'), ix, iy);
            } else if (st === 'dot') {
              ctx.fillStyle = e.p.accent; ctx.beginPath(); ctx.arc(ix + size * 0.25, iy, size * 0.2, 0, Math.PI * 2); ctx.fill();
            } else if (st === 'icons') {
              const list = o.icons || ['calendar', 'clock', 'pin', 'users'];
              drawIcon(ctx, list[i % list.length], ix, iy - size * 0.6, size * 1.2, e.p.accent, 2);
            } else {
              const nm = st === 'arrow' ? 'arrow' : st === 'x' ? 'xCircle' : 'checkCircle';
              drawIcon(ctx, nm, ix, iy - size * 0.6, size * 1.2, e.p.accent, 2.2);
            }
            ctx.font = font(o.weight || 500, size, e.bodyFont); ctx.fillStyle = color;
            ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
            cell.lines.forEach((ln, j) => ctx.fillText(ln, ix + iconW, ty + j * size * 1.32 + size * 0.68));
          }
          cy += rh + rowGap;
        });
        ctx.restore();
      }
    };
    return b;
  }

  function PillsB(e, items, o) {
    const ctx = e.ctx;
    const base = (o.size || 0.027) * e.s.bodyScale * e.u;
    let c = null;
    const b = {
      g: o.g == null ? 0.034 : o.g,
      measure(s, w) {
        const size = base * s, px = size * 0.95, py = size * 0.6, gap = size * 0.55;
        ctx.font = font(600, size, e.bodyFont);
        const pills = items.map(t => ({ t, w: ctx.measureText(t).width + px * 2 }));
        const rows = []; let row = [], rw = 0, over = false;
        pills.forEach(p => {
          if (p.w > w) over = true;
          if (row.length && rw + gap + p.w > w) { rows.push({ row, rw }); row = []; rw = 0; }
          rw += (row.length ? gap : 0) + p.w; row.push(p);
        });
        if (row.length) rows.push({ row, rw });
        const ph = size + py * 2;
        c = { s, w, size, px, py, gap, rows, ph };
        return rows.length * ph + (rows.length - 1) * gap + (over ? OVER : 0);
      },
      draw(x, y, w, s) {
        if (!c || c.s !== s || c.w !== w) b.measure(s, w);
        const { size, px, gap, rows, ph } = c;
        ctx.save();
        ctx.font = font(600, size, e.bodyFont); ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
        rows.forEach((r, i) => {
          let px0 = alignX(o.align || e.align, x, w, r.rw);
          const py0 = y + i * (ph + gap);
          r.row.forEach(p => {
            rr(ctx, px0, py0, p.w, ph, e.rad(ph));
            if (o.solid) { ctx.fillStyle = e.p.accent; ctx.fill(); ctx.fillStyle = onColor(e.p.accent); }
            else {
              ctx.fillStyle = e.dark ? 'rgba(255,255,255,0.1)' : rgba(e.p.accent, 0.1); ctx.fill();
              ctx.strokeStyle = rgba(e.p.accent, 0.55); ctx.lineWidth = Math.max(1, size * 0.07); ctx.stroke();
              ctx.fillStyle = e.p.text;
            }
            ctx.fillText(p.t, px0 + p.w / 2, py0 + ph / 2 + size * 0.04);
            px0 += p.w + gap;
          });
        });
        ctx.restore();
      }
    };
    return b;
  }

  function CtaB(e, text, o) {
    text = String(text || '').trim();
    if (!text) return null;
    const ctx = e.ctx;
    const st = o.style || 'solid';
    const base = 0.031 * e.s.bodyScale * e.u;
    let c = null;
    const b = {
      g: o.g == null ? 0.045 : o.g,
      measure(s, w) {
        const size = base * s;
        ctx.font = font(700, size, e.bodyFont); setLS(ctx, size * 0.02);
        const tw = ctx.measureText(text).width;
        setLS(ctx, 0);
        const link = st === 'link';
        const px = link ? 0 : size * 1.45, py = link ? size * 0.3 : size * 0.85;
        const arrow = (st === 'arrow' || link) ? size * 1.7 : 0;
        const bw = tw + px * 2 + arrow;
        c = { s, w, size, tw, px, py, arrow, bw };
        return size + py * 2 + (bw > w ? OVER : 0);
      },
      draw(x, y, w, s) {
        if (!c || c.s !== s || c.w !== w) b.measure(s, w);
        const { size, tw, px, py, arrow, bw } = c;
        const h = size + py * 2;
        const bx = alignX(o.align || e.align, x, w, bw);
        ctx.save();
        let tc = e.p.accent;
        if (st !== 'link') {
          rr(ctx, bx, y, bw, h, e.rad(h));
          if (st === 'outline') { ctx.strokeStyle = e.p.accent; ctx.lineWidth = Math.max(1, size * 0.11); ctx.stroke(); }
          else if (st === 'white') { ctx.fillStyle = e.p.text; ctx.fill(); tc = e.p.bg1; }
          else {
            if (st === 'glow') { ctx.shadowColor = e.p.accent; ctx.shadowBlur = size * 1.1 * e.k; }
            ctx.fillStyle = e.p.accent; ctx.fill(); tc = onColor(e.p.accent);
          }
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = tc;
        ctx.font = font(700, size, e.bodyFont); setLS(ctx, size * 0.02);
        ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        ctx.fillText(text, bx + px, y + h / 2 + size * 0.04);
        if (arrow) drawIcon(ctx, 'arrow', bx + px + tw + size * 0.55, y + h / 2 - size * 0.55, size * 1.1, tc, 2.4);
        if (st === 'link') { ctx.fillStyle = e.p.accent; ctx.fillRect(bx, y + h - size * 0.08, tw, size * 0.07); }
        ctx.restore();
      }
    };
    return b;
  }

  function DividerB(e, st) {
    const ctx = e.ctx;
    return {
      g: 0.03,
      measure(s) { return e.u * 0.02 * s; },
      draw(x, y, w, s) {
        const h = e.u * 0.02 * s, lw = e.u * 0.1 * s, t = Math.max(1, e.u * 0.005 * s);
        const cx = alignX(e.align, x, w, lw);
        ctx.save(); ctx.fillStyle = e.p.accent; ctx.strokeStyle = e.p.accent;
        if (st === 'diamond') {
          const m = cx + lw / 2, d = h * 0.45;
          ctx.fillRect(cx - lw * 0.4, y + h / 2 - t / 2, lw * 0.75, t);
          ctx.fillRect(m + lw * 0.15, y + h / 2 - t / 2, lw * 0.75, t);
          ctx.beginPath(); ctx.moveTo(m, y + h / 2 - d); ctx.lineTo(m + d, y + h / 2); ctx.lineTo(m, y + h / 2 + d); ctx.lineTo(m - d, y + h / 2); ctx.closePath(); ctx.fill();
        } else if (st === 'dots') {
          for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(cx + lw * 0.3 + i * lw * 0.2, y + h / 2, t * 1.2, 0, Math.PI * 2); ctx.fill(); }
        } else {
          ctx.fillRect(cx, y + h / 2 - t, lw, t * 2);
        }
        ctx.restore();
      }
    };
  }

  function StarsB(e) {
    const ctx = e.ctx;
    return {
      g: 0.03,
      measure(s) { return e.u * 0.04 * s; },
      draw(x, y, w, s) {
        const sz = e.u * 0.04 * s, gap = sz * 0.25, tot = sz * 5 + gap * 4;
        let sx = alignX(e.align, x, w, tot);
        ctx.save(); ctx.fillStyle = e.p.accent2 === e.p.text ? e.p.accent : '#F5B301';
        for (let i = 0; i < 5; i++) { starPath(ctx, sx + sz / 2, y + sz / 2, sz / 2, sz / 4.4, 5); ctx.fill(); sx += sz + gap; }
        ctx.restore();
      }
    };
  }

  function QuoteMarkB(e) {
    const ctx = e.ctx;
    return {
      g: 0.02,
      measure(s) { return e.v * 0.085 * s; },
      draw(x, y, w, s) {
        const size = e.v * 0.2 * s;
        ctx.save(); ctx.font = font(900, size, QUOTE_FONT); ctx.fillStyle = e.p.accent; ctx.textBaseline = 'top';
        ctx.textAlign = e.align;
        const ax = e.align === 'center' ? x + w / 2 : e.align === 'right' ? x + w : x;
        ctx.fillText('“', ax, y - size * 0.12);
        ctx.restore();
      }
    };
  }

  function AvatarB(e, name) {
    name = String(name || '').trim();
    if (!name) return null;
    const ctx = e.ctx;
    const parts = name.replace(/^[-—–\s]+/, '').split(/,(.+)/);
    const nm = parts[0].trim(), role = (parts[1] || '').trim();
    return {
      g: 0.035,
      measure(s) { return e.u * 0.09 * s; },
      draw(x, y, w, s) {
        const d = e.u * 0.09 * s, size = e.u * 0.032 * e.s.bodyScale * s;
        ctx.save();
        ctx.font = font(700, size, e.bodyFont); const nw = ctx.measureText(nm).width;
        ctx.font = font(400, size * 0.85, e.bodyFont); const rw = role ? ctx.measureText(role).width : 0;
        const gw = Math.min(w, d + size * 0.8 + Math.max(nw, rw));
        const gx = alignX(e.align, x, w, gw);
        ctx.save(); ctx.beginPath(); ctx.arc(gx + d / 2, y + d / 2, d / 2, 0, Math.PI * 2); ctx.clip();
        if (e.img.main && e.show('image')) drawCover(ctx, e.img.main, gx, y, d, d);
        else {
          ctx.fillStyle = e.p.accent; ctx.fillRect(gx, y, d, d);
          ctx.fillStyle = onColor(e.p.accent); ctx.font = font(700, d * 0.42, e.headFont); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(nm.split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase(), gx + d / 2, y + d / 2 + d * 0.03);
        }
        ctx.restore();
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        const tx = gx + d + size * 0.8;
        ctx.fillStyle = e.p.text; ctx.font = font(700, size, e.bodyFont);
        ctx.fillText(nm, tx, y + d / 2 - (role ? size * 0.55 : 0));
        if (role) { ctx.fillStyle = e.p.muted; ctx.font = font(400, size * 0.85, e.bodyFont); ctx.fillText(role, tx, y + d / 2 + size * 0.65); }
        ctx.restore();
      }
    };
  }

  function DateB(e, text) {
    text = String(text || '').trim();
    if (!text) return null;
    const ctx = e.ctx;
    const parts = text.split(/[\s|/]+/);
    const day = parts[0], rest = parts.slice(1).join(' ').toUpperCase();
    return {
      g: 0,
      measure(s) { return e.u * 0.19 * s; },
      draw(x, y, w, s) {
        const d = e.u * 0.19 * s;
        const bx = alignX(e.align, x, w, d);
        ctx.save();
        rr(ctx, bx, y, d, d, e.crad(0.8)); ctx.fillStyle = e.p.accent; ctx.fill();
        ctx.fillStyle = onColor(e.p.accent); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = font(800, d * (rest ? 0.42 : 0.3), e.headFont);
        fitLine(ctx, day, d * 0.86, 800, d * (rest ? 0.42 : 0.3), e.headFont);
        ctx.fillText(day, bx + d / 2, y + d * (rest ? 0.4 : 0.5));
        if (rest) { fitLine(ctx, rest, d * 0.84, 700, d * 0.16, e.bodyFont); ctx.fillText(rest, bx + d / 2, y + d * 0.76); }
        ctx.restore();
      }
    };
  }
  function fitLine(ctx, text, maxW, weight, size, fam) {
    ctx.font = font(weight, size, fam);
    const tw = ctx.measureText(text).width;
    if (tw > maxW) { size *= maxW / tw; ctx.font = font(weight, size, fam); }
    return size;
  }

  function TableB(e, header, rows) {
    rows = (rows || []).map(r => String(r).trim()).filter(Boolean);
    if (!rows.length) return null;
    const ctx = e.ctx;
    const cols = String(header || '').split(/\s+vs\.?\s+|\s*\|\s*/i).map(t => t.trim()).filter(Boolean);
    const L = cols[0] || 'Before', R = cols[1] || 'After';
    const pairs = rows.map(r => { const p = r.split('|'); return [p[0].trim(), (p[1] || '').trim()]; });
    const base = 0.028 * e.s.bodyScale * e.u;
    let c = null;
    const b = {
      g: 0.04,
      measure(s, w) {
        const size = base * s, gap = size * 1.2, colW = (w - gap) / 2, iw = size * 1.6, pad = size * 0.6;
        ctx.font = font(500, size, e.bodyFont);
        const cells = pairs.map(([a, z]) => {
          const la = wrap(ctx, a, colW - iw), lz = wrap(ctx, z, colW - iw);
          return { la, lz, h: Math.max(la.length, lz.length) * size * 1.3 + pad * 2 };
        });
        const hh = size * 2.4;
        c = { s, w, size, gap, colW, iw, pad, cells, hh };
        return hh + size * 0.5 + cells.reduce((a, x) => a + x.h, 0);
      },
      draw(x, y, w, s) {
        if (!c || c.s !== s || c.w !== w) b.measure(s, w);
        const { size, gap, colW, iw, pad, cells, hh } = c;
        ctx.save();
        ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
        rr(ctx, x, y, colW, hh, e.rad(hh)); ctx.fillStyle = rgba(e.p.text, 0.1); ctx.fill();
        rr(ctx, x + colW + gap, y, colW, hh, e.rad(hh)); ctx.fillStyle = e.p.accent; ctx.fill();
        fitLine(ctx, L.toUpperCase(), colW * 0.9, 700, size * 0.95, e.bodyFont); ctx.fillStyle = e.p.muted; ctx.fillText(L.toUpperCase(), x + colW / 2, y + hh / 2);
        fitLine(ctx, R.toUpperCase(), colW * 0.9, 700, size * 0.95, e.bodyFont); ctx.fillStyle = onColor(e.p.accent); ctx.fillText(R.toUpperCase(), x + colW + gap + colW / 2, y + hh / 2);
        let cy = y + hh + size * 0.5;
        ctx.textAlign = 'left';
        cells.forEach((cell, i) => {
          if (i) { ctx.fillStyle = rgba(e.p.text, 0.12); ctx.fillRect(x, cy, w, Math.max(1, size * 0.04)); }
          const ty = cy + pad;
          drawIcon(ctx, 'xCircle', x, ty + size * 0.05, size * 1.15, e.p.muted, 2);
          drawIcon(ctx, 'checkCircle', x + colW + gap, ty + size * 0.05, size * 1.15, e.p.accent, 2.2);
          ctx.font = font(500, size, e.bodyFont);
          ctx.fillStyle = e.p.muted; cell.la.forEach((ln, j) => ctx.fillText(ln, x + iw, ty + j * size * 1.3 + size * 0.68));
          ctx.fillStyle = e.p.text; cell.lz.forEach((ln, j) => ctx.fillText(ln, x + colW + gap + iw, ty + j * size * 1.3 + size * 0.68));
          cy += cell.h;
        });
        ctx.restore();
      }
    };
    return b;
  }

  function StepsB(e, items, o) {
    items = (items || []).map(t => String(t).trim()).filter(Boolean);
    if (!items.length) return null;
    const ctx = e.ctx;
    const base = 0.029 * e.s.bodyScale * e.u;
    let c = null;
    const b = {
      g: 0.045,
      measure(s, w) {
        const size = base * s, d = size * 2.1;
        const horiz = items.length <= 4 && w > e.u * 1.05;
        ctx.font = font(500, size, e.bodyFont);
        if (horiz) {
          const cw = w / items.length;
          const cells = items.map(t => wrap(ctx, t, cw * 0.88));
          const th = Math.max(...cells.map(l => l.length)) * size * 1.3;
          c = { s, w, size, d, horiz, cw, cells };
          return d + size * 0.8 + th;
        }
        const tw = w - d - size * 0.9;
        const cells = items.map(t => wrap(ctx, t, tw));
        const hs = cells.map(l => Math.max(d, l.length * size * 1.3));
        const gap = size * 0.9;
        c = { s, w, size, d, horiz, cells, hs, gap, tw };
        return hs.reduce((a, h) => a + h, 0) + gap * (items.length - 1);
      },
      draw(x, y, w, s) {
        if (!c || c.s !== s || c.w !== w) b.measure(s, w);
        const { size, d, horiz, cells } = c;
        ctx.save();
        ctx.textBaseline = 'middle';
        const num = (cx, cy, i) => {
          ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, Math.PI * 2); ctx.fillStyle = e.p.accent; ctx.fill();
          ctx.fillStyle = onColor(e.p.accent); ctx.font = font(800, size * 0.95, e.headFont); ctx.textAlign = 'center';
          ctx.fillText(String(i + 1), cx, cy + size * 0.05);
        };
        if (horiz) {
          const { cw } = c;
          ctx.fillStyle = rgba(e.p.accent, 0.45);
          ctx.fillRect(x + cw / 2, y + d / 2 - size * 0.06, cw * (items.length - 1), size * 0.12);
          cells.forEach((lines, i) => {
            const cx = x + cw * i + cw / 2;
            num(cx, y + d / 2, i);
            ctx.fillStyle = e.p.text; ctx.font = font(500, size, e.bodyFont); ctx.textAlign = 'center';
            lines.forEach((ln, j) => ctx.fillText(ln, cx, y + d + size * 0.8 + j * size * 1.3 + size * 0.65));
          });
        } else {
          const { hs, gap } = c;
          const gw = Math.min(w, d + size * 0.9 + Math.max(...cells.map(l => { ctx.font = font(500, size, e.bodyFont); return maxWidth(ctx, l); })));
          const gx = alignX(e.align, x, w, gw);
          let cy = y;
          ctx.fillStyle = rgba(e.p.accent, 0.4);
          ctx.fillRect(gx + d / 2 - size * 0.06, y + d / 2, size * 0.12, hs.slice(0, -1).reduce((a, h) => a + h + gap, 0));
          cells.forEach((lines, i) => {
            num(gx + d / 2, cy + d / 2, i);
            ctx.fillStyle = e.p.text; ctx.font = font(500, size, e.bodyFont); ctx.textAlign = 'left';
            const off = lines.length * size * 1.3 < d ? (d - lines.length * size * 1.3) / 2 : 0;
            lines.forEach((ln, j) => ctx.fillText(ln, gx + d + size * 0.9, cy + off + j * size * 1.3 + size * 0.65));
            cy += hs[i] + gap;
          });
        }
        ctx.restore();
      }
    };
    return b;
  }

  function FlowB(e, list, o) {
    if (!list.length) return null;
    const ctx = e.ctx;
    const base = (o.size || 0.025) * e.s.bodyScale * e.u;
    let c = null;
    const b = {
      g: o.g == null ? 0.04 : o.g,
      measure(s, w) {
        const size = base * s, gap = size * 1.5, iw = o.noIcons ? 0 : size * 1.5;
        const pad = o.pills ? size * 0.8 : 0;
        ctx.font = font(500, size, e.bodyFont);
        const items = list.map(it => ({ ...it, w: ctx.measureText(it.text).width + iw + pad * 2 }));
        const rows = []; let row = [], rw = 0, over = false;
        items.forEach(it => {
          if (it.w > w) over = true;
          if (row.length && rw + gap + it.w > w) { rows.push({ row, rw }); row = []; rw = 0; }
          rw += (row.length ? gap : 0) + it.w; row.push(it);
        });
        if (row.length) rows.push({ row, rw });
        const rh = size * (o.pills ? 2.2 : 1.5);
        c = { s, w, size, gap, iw, pad, rows, rh };
        return rows.length * rh + (rows.length - 1) * size * 0.5 + (over ? OVER : 0);
      },
      draw(x, y, w, s) {
        if (!c || c.s !== s || c.w !== w) b.measure(s, w);
        const { size, gap, iw, pad, rows, rh } = c;
        const color = o.color || e.p.text;
        ctx.save();
        ctx.font = font(500, size, e.bodyFont); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        rows.forEach((r, i) => {
          let ix = alignX(o.align || e.align, x, w, r.rw);
          const iy = y + i * (rh + size * 0.5);
          r.row.forEach(it => {
            if (o.pills) {
              rr(ctx, ix, iy, it.w, rh, e.rad(rh));
              ctx.fillStyle = e.dark ? 'rgba(255,255,255,0.1)' : rgba(e.p.text, 0.06); ctx.fill();
            }
            if (iw) drawIcon(ctx, it.icon, ix + pad, iy + rh / 2 - size * 0.55, size * 1.1, o.iconColor || e.p.accent, 2.2);
            ctx.fillStyle = color;
            ctx.fillText(it.text, ix + pad + iw, iy + rh / 2 + size * 0.04);
            ix += it.w + gap;
          });
        });
        ctx.restore();
      }
    };
    return b;
  }

  /* ---------------- Block factory from fields ---------------- */
  function contactList(e) {
    const out = [];
    if (e.show('website')) out.push({ icon: 'globe', text: e.f.website });
    if (e.show('phone')) out.push({ icon: 'phone', text: e.f.phone });
    if (e.show('whatsapp')) out.push({ icon: 'chat', text: e.f.whatsapp });
    return out;
  }
  const B = {
    tag: (e, o) => e.show('tag') && TagB(e, e.f.tag, { style: o.tagStyle }),
    mega: (e, o) => e.show('tag') && TextB(e, e.f.tag, { fam: e.headFont, weight: 900, size: 0.13 * e.u * e.s.headScale, color: e.p.accent, upper: true, lh: 1, fillWidth: true, fillMax: 1.1, g: 0 }),
    headline: (e, o) => e.show('headline') && TextB(e, e.f.headline, {
      fam: e.headFont, weight: e.s.weight, size: 0.092 * e.u * e.s.headScale * (o.hs || 1), color: e.p.text,
      lh: e.s.lineHeight * (o.lhk || 1), upper: e.s.upper, ls: e.s.letterSpacing, hl: e.s.highlight, italic: o.headItalic,
      fillWidth: o.fillWidth, wordLines: o.wordLines, fillMax: o.fillMax, g: o.headGap == null ? 0.03 : o.headGap
    }),
    subheadline: (e, o) => e.show('subheadline') && TextB(e, e.f.subheadline, {
      fam: o.subFont === 'head' ? e.headFont : e.bodyFont, weight: o.subWeight || 600, size: 0.041 * e.u * e.s.bodyScale * (o.ss || 1),
      color: o.subColor === 'text' ? e.p.text : o.subColor === 'muted' ? e.p.muted : e.p.accent, lh: 1.3, italic: o.subItalic, upper: o.subUpper, ls: o.subUpper ? 0.08 : 0, g: 0.024
    }),
    divider: (e, o) => o.divider ? DividerB(e, o.divider) : null,
    description: (e, o) => e.show('description') && TextB(e, e.f.description, {
      fam: e.bodyFont, weight: 400, size: 0.03 * e.u * e.s.bodyScale * (o.ds || 1), color: e.p.muted, lh: 1.5, g: 0.026
    }),
    quote: (e, o) => e.show('description') && TextB(e, e.f.description, {
      fam: e.headFont, weight: 500, size: 0.046 * e.u * e.s.bodyScale, color: e.p.text, lh: 1.38, italic: o.quoteItalic, g: 0.02
    }),
    features: (e, o) => e.show('features') && FeatB(e, e.f.features, { style: o.featStyle, cols: o.featCols || 'auto', icons: o.icons }),
    pills: (e, o) => e.show('features') && FeatB(e, e.f.features, { style: 'pill', solid: o.pillSolid }),
    steps: (e, o) => e.show('features') && StepsB(e, e.f.features, o),
    table: (e, o) => e.show('features') && TableB(e, e.show('subheadline') ? e.f.subheadline : '', e.f.features),
    cta: (e, o) => e.show('cta') && CtaB(e, e.f.cta, { style: o.ctaStyle }),
    contacts: (e, o) => FlowB(e, contactList(e), { pills: false }),
    stars: (e, o) => o.stars !== false ? StarsB(e) : null,
    quoteMark: (e) => QuoteMarkB(e),
    avatar: (e) => e.show('subheadline') && AvatarB(e, e.f.subheadline),
    date: (e) => e.show('tag') && DateB(e, e.f.tag)
  };
  function std(e, o, keys) {
    keys = keys || ['tag', 'headline', 'subheadline', 'divider', 'description', 'features', 'cta'];
    return keys.map(k => B[k] ? B[k](e, o) : null).filter(Boolean);
  }

  /* ---------------- Stack fitting ---------------- */
  function fit(e, items, w, h, minS) {
    let s = 1, hs = [], total = 0;
    const sp = e.s.spacing;
    for (let i = 0; i < 48; i++) {
      hs = items.map(it => it.measure(s, w));
      total = hs.reduce((a, b) => a + b, 0) + items.reduce((a, it, j) => a + (j ? it.g * e.v * s * sp : 0), 0);
      if (total <= h || s <= (minS || 0.25)) break;
      s *= 0.95;
    }
    return { s, hs, total };
  }
  function drawItems(e, items, f, x, y, w) {
    let cy = y;
    items.forEach((it, i) => {
      if (i) cy += it.g * e.v * f.s * e.s.spacing;
      it.draw(x, cy, w, f.s);
      cy += f.hs[i];
    });
  }
  function stack(e, items, box, valign) {
    items = items.filter(Boolean);
    if (!items.length || box.w <= 0 || box.h <= 0) return null;
    const f = fit(e, items, box.w, box.h);
    const y = valign === 'top' ? box.y : valign === 'bottom' ? box.y + box.h - f.total : box.y + (box.h - f.total) / 2;
    drawItems(e, items, f, box.x, y, box.w);
    return { s: f.s, y, bottom: y + f.total, h: f.total };
  }
  function narrow(e, box, k) {
    if (!k || k >= 1) return box;
    const w = box.w * k;
    return { x: alignX(e.align, box.x, box.w, w), y: box.y, w, h: box.h };
  }

  /* ---------------- Image boxes ---------------- */
  function placeholderArt(e, x, y, w, h) {
    const ctx = e.ctx;
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, mix(e.p.accent, e.p.bg1, 0.15)); g.addColorStop(1, mix(e.p.accent2, e.p.bg1, 0.35));
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    const m = Math.min(w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath(); ctx.arc(x + w * 0.72, y + h * 0.3, m * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.arc(x + w * 0.22, y + h * 0.82, m * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = m * 0.012;
    ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.55, m * 0.2, 0, Math.PI * 2); ctx.stroke();
  }
  function imageBox(e, x, y, w, h, shape, r) {
    const ctx = e.ctx;
    ctx.save();
    if (shape === 'circle') { ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2); }
    else if (shape === 'arch') archPath(ctx, x, y, w, h);
    else rr(ctx, x, y, w, h, r || 0);
    ctx.clip();
    if (e.img.main) drawCover(ctx, e.img.main, x, y, w, h); else placeholderArt(e, x, y, w, h);
    ctx.restore();
  }

  /* ---------------- Backgrounds ---------------- */
  function drawBackground(e) {
    const { ctx, W, H, p, s } = e;
    if (e.transparent) return;
    const t = s.bgType;
    if (t === 'linear' || t === 'spotlight') {
      const a = (s.bgAngle || 135) * Math.PI / 180;
      const L = Math.abs(W * Math.sin(a)) + Math.abs(H * Math.cos(a));
      const dx = Math.sin(a) * L / 2, dy = -Math.cos(a) * L / 2;
      const g = ctx.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy);
      g.addColorStop(0, p.bg1); if (p.bg3 && p.bg3 !== p.bg2) g.addColorStop(0.55, p.bg2); g.addColorStop(1, p.bg3 && p.bg3 !== p.bg2 ? p.bg3 : p.bg2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (t === 'spotlight') {
        const r = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, Math.max(W, H) * 0.8);
        r.addColorStop(0, rgba(p.accent, 0.28)); r.addColorStop(1, rgba(p.accent, 0));
        ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
      }
    } else if (t === 'radial') {
      const cx = W * (s.bgCx == null ? 0.5 : s.bgCx), cy = H * (s.bgCy == null ? 0.4 : s.bgCy);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * 0.75);
      g.addColorStop(0, p.bg2); g.addColorStop(1, p.bg1);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else if (t === 'mesh') {
      ctx.fillStyle = p.bg1; ctx.fillRect(0, 0, W, H);
      const r = rng(e.seed * 7 + 3);
      [p.bg2, p.accent, p.accent2, p.bg3].forEach((col, i) => {
        const x = W * (i % 2 ? 0.15 + r() * 0.3 : 0.6 + r() * 0.3), y = H * (i < 2 ? r() * 0.4 : 0.55 + r() * 0.4);
        const rad = e.u * (0.55 + r() * 0.35);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, rgba(col, 0.55)); g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });
    } else if (t === 'split') {
      ctx.fillStyle = p.bg1; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = p.bg2;
      if (W > H) ctx.fillRect(W * 0.64, 0, W * 0.36, H); else ctx.fillRect(0, H * 0.66, W, H * 0.34);
    } else if (t === 'diagonal') {
      ctx.fillStyle = p.bg1; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = p.bg2;
      ctx.beginPath(); ctx.moveTo(W * 0.58, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(W * 0.22, H); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillStyle = p.bg1; ctx.fillRect(0, 0, W, H);
    }
    if (e.img.bg && e.show('bgImage')) {
      drawCover(ctx, e.img.bg, 0, 0, W, H);
      ctx.fillStyle = rgba(p.bg1, s.bgOverlay == null ? 0.55 : s.bgOverlay);
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* ---------------- Decorations ---------------- */
  function at(e, pos) {
    const { W, H } = e;
    const m = { tl: [0, 0], tr: [W, 0], bl: [0, H], br: [W, H], c: [W / 2, H / 2], t: [W / 2, 0], b: [W / 2, H], l: [0, H / 2], r: [W, H / 2] };
    const v = m[pos || 'tr'] || m.tr;
    return { x: v[0], y: v[1] };
  }
  function col(e, c) { return e.p[c || 'accent'] || c || e.p.accent; }
  const DECOR = {
    blobs(e, d, r) {
      const { ctx, W, H } = e; const cols = [e.p.accent, e.p.accent2, e.p.bg2];
      for (let i = 0; i < (d.n || 3); i++) {
        const x = W * r(), y = H * r(), rad = e.u * (0.25 + r() * 0.35) * (d.size || 1);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        const cc = d.c ? col(e, d.c) : cols[i % 3];
        g.addColorStop(0, rgba(cc, d.a)); g.addColorStop(1, rgba(cc, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
    },
    rings(e, d) {
      const { ctx } = e; const o = at(e, d.pos);
      ctx.strokeStyle = rgba(col(e, d.c), d.a); ctx.lineWidth = e.u * 0.004;
      for (let i = 0; i < (d.n || 5); i++) { ctx.beginPath(); ctx.arc(o.x, o.y, e.u * (0.12 + i * 0.075) * (d.size || 1), 0, Math.PI * 2); ctx.stroke(); }
    },
    circles(e, d) {
      const { ctx } = e; const o = at(e, d.pos); const R = e.u * 0.36 * (d.size || 1);
      ctx.fillStyle = rgba(col(e, d.c), d.a);
      ctx.beginPath(); ctx.arc(o.x, o.y, R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = rgba(col(e, d.c2 || 'accent2'), d.a * 0.8);
      const sx = o.x < e.W / 2 ? o.x + R * 1.1 : o.x - R * 1.1, sy = o.y < e.H / 2 ? o.y + R * 0.95 : o.y - R * 0.95;
      ctx.beginPath(); ctx.arc(sx, sy, R * 0.22, 0, Math.PI * 2); ctx.fill();
    },
    dots(e, d) {
      const { ctx } = e; const o = at(e, d.pos); const sz = e.u * 0.32 * (d.size || 1), sp = e.u * 0.032;
      const x0 = o.x <= 0 ? e.pad * 0.4 : o.x >= e.W ? e.W - sz - e.pad * 0.4 : o.x - sz / 2;
      const y0 = o.y <= 0 ? e.pad * 0.4 : o.y >= e.H ? e.H - sz - e.pad * 0.4 : o.y - sz / 2;
      ctx.fillStyle = rgba(col(e, d.c), d.a);
      for (let x = 0; x <= sz; x += sp) for (let y = 0; y <= sz; y += sp) { ctx.beginPath(); ctx.arc(x0 + x, y0 + y, e.u * 0.0042, 0, Math.PI * 2); ctx.fill(); }
    },
    grid(e, d) {
      const { ctx, W, H } = e; const sp = e.u * 0.065;
      ctx.strokeStyle = rgba(col(e, d.c), d.a); ctx.lineWidth = Math.max(1 / e.k, e.u * 0.0015);
      ctx.beginPath();
      if (d.persp) {
        const hy = H * 0.68;
        for (let i = -12; i <= 12; i++) { ctx.moveTo(W / 2 + i * sp * 0.4, hy); ctx.lineTo(W / 2 + i * sp * 3, H); }
        for (let k = 0; k < 10; k++) { const y = hy + (H - hy) * Math.pow(k / 9, 1.8); ctx.moveTo(0, y); ctx.lineTo(W, y); }
      } else {
        for (let x = 0; x <= W; x += sp) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        for (let y = 0; y <= H; y += sp) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      }
      ctx.stroke();
    },
    waves(e, d) {
      const { ctx, W, H } = e;
      for (let k = 0; k < 3; k++) {
        const base = H - e.u * (0.06 + k * 0.05) * (d.size || 1), amp = e.u * 0.025, len = W / (1.3 + k * 0.4);
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W + 10; x += W / 60) ctx.lineTo(x, base + Math.sin(x / len * Math.PI * 2 + k) * amp);
        ctx.lineTo(W, H); ctx.closePath();
        ctx.fillStyle = rgba(col(e, k % 2 ? 'accent2' : d.c), d.a * (1 - k * 0.25)); ctx.fill();
      }
    },
    triangles(e, d, r) {
      const { ctx, W, H } = e;
      for (let i = 0; i < (d.n || 8); i++) {
        const edge = r();
        const x = edge < 0.5 ? (r() < 0.5 ? r() * W * 0.18 : W - r() * W * 0.18) : r() * W;
        const y = edge < 0.5 ? r() * H : (r() < 0.5 ? r() * H * 0.14 : H - r() * H * 0.14);
        const sz = e.u * (0.03 + r() * 0.07), rot = r() * Math.PI;
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * 0.87, sz / 2); ctx.lineTo(-sz * 0.87, sz / 2); ctx.closePath();
        if (i % 2) { ctx.fillStyle = rgba(col(e, i % 3 ? d.c : 'accent2'), d.a); ctx.fill(); }
        else { ctx.strokeStyle = rgba(col(e, d.c), d.a); ctx.lineWidth = e.u * 0.004; ctx.stroke(); }
        ctx.restore();
      }
    },
    stripes(e, d) {
      const { ctx } = e; const o = at(e, d.pos); const R = e.u * 0.34 * (d.size || 1);
      ctx.save(); ctx.beginPath(); ctx.arc(o.x, o.y, R, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = rgba(col(e, d.c), d.a); ctx.lineWidth = e.u * 0.008;
      for (let i = -R * 2; i < R * 2; i += e.u * 0.026) { ctx.beginPath(); ctx.moveTo(o.x + i, o.y - R); ctx.lineTo(o.x + i + R * 2, o.y + R); ctx.stroke(); }
      ctx.restore();
    },
    confetti(e, d, r) {
      const { ctx, W, H } = e; const cols = [e.p.accent, e.p.accent2, e.p.text, '#F472B6', '#FACC15'];
      for (let i = 0; i < (d.n || 46); i++) {
        const x = r() * W, y = r() < 0.5 ? r() * H * 0.22 : H - r() * H * 0.2;
        const sz = e.u * (0.008 + r() * 0.014);
        ctx.save(); ctx.translate(x, y); ctx.rotate(r() * Math.PI);
        ctx.fillStyle = rgba(cols[i % cols.length], d.a);
        if (i % 3) ctx.fillRect(-sz, -sz / 2.5, sz * 2, sz / 1.25); else { ctx.beginPath(); ctx.arc(0, 0, sz * 0.7, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
    },
    mandala(e, d) {
      const { ctx } = e; const o = at(e, d.pos || 'c'); const R = e.u * 0.46 * (d.size || 1);
      ctx.save(); ctx.translate(o.x, o.y);
      ctx.strokeStyle = rgba(col(e, d.c), d.a); ctx.fillStyle = rgba(col(e, d.c), d.a * 0.35); ctx.lineWidth = e.u * 0.0035;
      for (let ring = 0; ring < 4; ring++) {
        const n = 8 + ring * 4, rr0 = R * (0.22 + ring * 0.24), pl = R * 0.16;
        for (let k = 0; k < n; k++) {
          ctx.save(); ctx.rotate(k * Math.PI * 2 / n + ring * 0.2);
          ctx.beginPath(); ctx.ellipse(0, -rr0, pl * 0.32, pl * 0.75, 0, 0, Math.PI * 2);
          ring % 2 ? ctx.fill() : ctx.stroke();
          ctx.restore();
        }
        ctx.beginPath(); ctx.arc(0, 0, rr0 + pl * 0.9, 0, Math.PI * 2); ctx.stroke();
      }
      for (let k = 0; k < 36; k++) { const a = k * Math.PI / 18; ctx.beginPath(); ctx.arc(Math.cos(a) * R * 1.02, Math.sin(a) * R * 1.02, e.u * 0.006, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
    diyas(e, d) {
      const { ctx, W, H } = e; const n = d.n || 5, sz = e.u * 0.05;
      for (let i = 0; i < n; i++) {
        const x = W * (i + 0.5) / n, y = H - e.pad * (d.lift || 1.6) - sz * 0.2;
        ctx.save();
        ctx.fillStyle = col(e, d.c);
        ctx.beginPath(); ctx.ellipse(x, y, sz, sz * 0.45, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
        ctx.fillStyle = mix(col(e, d.c), '#000000', 0.25); ctx.fillRect(x - sz, y - sz * 0.06, sz * 2, sz * 0.12);
        ctx.shadowColor = '#FFB020'; ctx.shadowBlur = sz * 0.9 * e.k;
        const g = ctx.createRadialGradient(x, y - sz * 0.55, 0, x, y - sz * 0.55, sz * 0.6);
        g.addColorStop(0, '#FFF7C2'); g.addColorStop(0.5, '#FFC94A'); g.addColorStop(1, '#FF7A1A');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(x, y - sz * 1.25);
        ctx.quadraticCurveTo(x + sz * 0.38, y - sz * 0.45, x, y - sz * 0.15);
        ctx.quadraticCurveTo(x - sz * 0.38, y - sz * 0.45, x, y - sz * 1.25); ctx.fill();
        ctx.restore();
      }
    },
    sparkles(e, d, r) {
      const { ctx, W, H } = e;
      for (let i = 0; i < (d.n || 12); i++) {
        const x = r() * W, y = r() * H, sz = e.u * (0.008 + r() * 0.022);
        ctx.fillStyle = rgba(col(e, i % 3 ? d.c : 'accent2'), d.a * (0.5 + r() * 0.5));
        sparkle(ctx, x, y, sz); ctx.fill();
      }
    },
    hexagons(e, d) {
      const { ctx } = e; const o = at(e, d.pos); const R = e.u * 0.055 * (d.size || 1);
      ctx.lineWidth = e.u * 0.004;
      for (let q = 0; q < 4; q++) for (let k = 0; k < 4; k++) {
        const dx = o.x <= e.W / 2 ? 1 : -1, dy = o.y <= e.H / 2 ? 1 : -1;
        const cx = o.x + dx * (q * R * 1.75 + (k % 2) * R * 0.87), cy = o.y + dy * k * R * 1.5;
        if (q + k > 4) continue;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; i ? ctx.lineTo(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92) : ctx.moveTo(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92); }
        ctx.closePath();
        if ((q * 3 + k) % 4 === 0) { ctx.fillStyle = rgba(col(e, d.c), d.a * 0.7); ctx.fill(); }
        else { ctx.strokeStyle = rgba(col(e, d.c), d.a); ctx.stroke(); }
      }
    },
    neon(e, d) {
      const { ctx, W, H } = e; const c = col(e, d.c);
      ctx.save(); ctx.strokeStyle = rgba(c, d.a); ctx.lineWidth = e.u * 0.006; ctx.shadowColor = c; ctx.shadowBlur = e.u * 0.03 * e.k; ctx.lineCap = 'round';
      if (d.mode === 'corner') {
        const m = e.pad * 0.5, l = e.u * 0.22;
        ctx.beginPath(); ctx.moveTo(m, m + l); ctx.lineTo(m, m); ctx.lineTo(m + l, m);
        ctx.moveTo(W - m, H - m - l); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m - l, H - m); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(W / 2, H * 1.02, e.u * 0.55, Math.PI, 0); ctx.stroke();
        ctx.strokeStyle = rgba(col(e, 'accent2'), d.a * 0.8); ctx.shadowColor = col(e, 'accent2');
        ctx.beginPath(); ctx.arc(W / 2, H * 1.02, e.u * 0.68, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-10, H * 0.12); ctx.lineTo(W * 0.22, H * 0.12 - e.u * 0.12); ctx.stroke();
      }
      ctx.restore();
    },
    corners(e, d) {
      const { ctx, W, H } = e; const m = e.pad * 0.75, l = e.u * 0.11;
      ctx.save(); ctx.strokeStyle = rgba(col(e, d.c), d.a); ctx.fillStyle = rgba(col(e, d.c), d.a); ctx.lineWidth = e.u * 0.004;
      [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => {
        ctx.beginPath(); ctx.moveTo(x, y + sy * l); ctx.lineTo(x, y); ctx.lineTo(x + sx * l, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + sx * l * 0.25, y + sy * l * 0.7); ctx.quadraticCurveTo(x + sx * l * 0.25, y + sy * l * 0.25, x + sx * l * 0.7, y + sy * l * 0.25); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + sx * l * 0.25, y + sy * l * 0.25, e.u * 0.007, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    },
    frame(e, d) {
      const { ctx, W, H } = e; const m = e.pad * 0.42;
      ctx.strokeStyle = rgba(col(e, d.c), d.a); ctx.lineWidth = e.u * (d.double ? 0.004 : 0.006);
      ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
      if (d.double) { const m2 = m + e.u * 0.014; ctx.lineWidth = e.u * 0.002; ctx.strokeRect(m2, m2, W - 2 * m2, H - 2 * m2); }
    },
    orbits(e, d) {
      const { ctx } = e; const o = at(e, d.pos || 'c'); const R = e.u * 0.42 * (d.size || 1);
      ctx.save(); ctx.translate(o.x, o.y); ctx.lineWidth = e.u * 0.003;
      [0.3, -0.5, 1.1].forEach((rot, i) => {
        ctx.save(); ctx.rotate(rot); ctx.strokeStyle = rgba(col(e, i % 2 ? 'accent2' : d.c), d.a);
        ctx.beginPath(); ctx.ellipse(0, 0, R * (1 - i * 0.12), R * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = rgba(col(e, i % 2 ? 'accent2' : d.c), Math.min(1, d.a * 2.2));
        ctx.beginPath(); ctx.arc(R * (1 - i * 0.12) * Math.cos(i * 2), R * 0.36 * Math.sin(i * 2), e.u * 0.011, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    },
    bars(e, d) {
      const { ctx } = e; const o = at(e, d.pos || 'br'); const bw = e.u * 0.035, gap = e.u * 0.018;
      ctx.fillStyle = rgba(col(e, d.c), d.a);
      for (let i = 0; i < 6; i++) {
        const h = e.u * (0.06 + i * 0.045);
        const x = o.x >= e.W ? e.W - e.pad * 0.5 - (6 - i) * (bw + gap) : e.pad * 0.5 + i * (bw + gap);
        const y = o.y >= e.H ? e.H - h : 0;
        rr(ctx, x, y, bw, h, bw / 2); ctx.fill();
      }
    },
    arcs(e, d) {
      const { ctx, W, H } = e; ctx.lineWidth = e.u * 0.05 * (d.size || 1); ctx.lineCap = 'butt';
      ctx.strokeStyle = rgba(col(e, d.c), d.a);
      ctx.beginPath(); ctx.arc(0, 0, e.u * 0.3, 0, Math.PI / 2); ctx.stroke();
      ctx.strokeStyle = rgba(col(e, 'accent2'), d.a);
      ctx.beginPath(); ctx.arc(W, H, e.u * 0.38, Math.PI, Math.PI * 1.5); ctx.stroke();
      ctx.lineWidth = e.u * 0.012;
      ctx.beginPath(); ctx.arc(W, H, e.u * 0.5, Math.PI, Math.PI * 1.5); ctx.stroke();
    },
    zigzag(e, d) {
      const { ctx } = e; const o = at(e, d.pos);
      const x0 = o.x >= e.W ? e.W - e.pad - e.u * 0.24 : e.pad, y0 = o.y >= e.H ? e.H - e.pad * 2 : e.pad * 1.9;
      ctx.strokeStyle = rgba(col(e, d.c), d.a); ctx.lineWidth = e.u * 0.009; ctx.lineJoin = 'miter';
      for (let row = 0; row < 2; row++) {
        ctx.beginPath();
        for (let i = 0; i <= 8; i++) ctx.lineTo(x0 + i * e.u * 0.03, y0 + row * e.u * 0.035 + (i % 2 ? e.u * 0.02 : 0));
        ctx.stroke();
      }
    },
    squares(e, d) {
      const { ctx } = e; const o = at(e, d.pos);
      ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(Math.PI / 4); ctx.lineWidth = e.u * 0.004;
      for (let i = 0; i < 4; i++) { const s = e.u * (0.12 + i * 0.09) * (d.size || 1); ctx.strokeStyle = rgba(col(e, i % 2 ? 'accent2' : d.c), d.a); ctx.strokeRect(-s / 2, -s / 2, s, s); }
      ctx.restore();
    },
    circuit(e, d, r) {
      const { ctx, W, H } = e; const c = col(e, d.c);
      ctx.strokeStyle = rgba(c, d.a); ctx.fillStyle = rgba(c, Math.min(1, d.a * 1.6)); ctx.lineWidth = e.u * 0.003;
      for (let i = 0; i < (d.n || 7); i++) {
        const right = i % 2 === 0;
        let x = right ? W : 0, y = H * (0.08 + r() * 0.84);
        const l1 = e.u * (0.08 + r() * 0.16), l2 = e.u * (0.04 + r() * 0.08), dir = r() < 0.5 ? -1 : 1, sx = right ? -1 : 1;
        ctx.beginPath(); ctx.moveTo(x, y); x += sx * l1; ctx.lineTo(x, y); x += sx * l2; y += dir * l2; ctx.lineTo(x, y); x += sx * l1 * 0.6; ctx.lineTo(x, y); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, e.u * 0.008, 0, Math.PI * 2); ctx.fill();
      }
    },
    bokeh(e, d, r) {
      const { ctx, W, H } = e;
      for (let i = 0; i < (d.n || 9); i++) {
        const x = r() * W, y = r() * H, rad = e.u * (0.03 + r() * 0.09);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        const c = col(e, i % 2 ? 'accent2' : d.c || 'accent');
        g.addColorStop(0, rgba(c, d.a)); g.addColorStop(0.7, rgba(c, d.a * 0.5)); g.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
    },
    halftone(e, d) {
      const { ctx } = e; const o = at(e, d.pos); const R = e.u * 0.5 * (d.size || 1), sp = e.u * 0.03;
      ctx.fillStyle = rgba(col(e, d.c), d.a);
      for (let x = -R; x <= R; x += sp) for (let y = -R; y <= R; y += sp) {
        const dist = Math.hypot(x, y) / R; if (dist > 1) continue;
        ctx.beginPath(); ctx.arc(o.x + x, o.y + y, sp * 0.42 * (1 - dist), 0, Math.PI * 2); ctx.fill();
      }
    },
    bunting(e, d) {
      const { ctx, W } = e; const n = d.n || 11, sag = e.u * 0.05, y0 = e.u * 0.015;
      const cols = [e.p.accent, e.p.accent2, '#F472B6', '#22C55E', '#FACC15'];
      ctx.strokeStyle = rgba(e.p.text, 0.5); ctx.lineWidth = e.u * 0.002;
      ctx.beginPath(); ctx.moveTo(0, y0); ctx.quadraticCurveTo(W / 2, y0 + sag * 2, W, y0); ctx.stroke();
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, x = W * t, y = y0 + sag * 2 * 2 * t * (1 - t), fw = W / n * 0.38;
        ctx.fillStyle = rgba(cols[i % cols.length], d.a);
        ctx.beginPath(); ctx.moveTo(x - fw, y); ctx.lineTo(x + fw, y); ctx.lineTo(x, y + fw * 1.6); ctx.closePath(); ctx.fill();
      }
    },
    leaves(e, d) {
      const { ctx, W, H } = e; const sz = e.u * 0.12 * (d.size || 1);
      [[0, 0, 0.6], [W, H, -2.4], [W, 0, 2.2], [0, H, -0.7]].slice(0, d.n || 2).forEach(([x, y, rot], j) => {
        for (let i = 0; i < 4; i++) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(rot + (i - 1.5) * 0.38);
          ctx.fillStyle = rgba(col(e, (i + j) % 2 ? 'accent2' : d.c), d.a);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(sz * 0.5, -sz * 0.45, sz * 1.6, 0); ctx.quadraticCurveTo(sz * 0.5, sz * 0.45, 0, 0); ctx.fill();
          ctx.restore();
        }
      });
    },
    mountains(e, d) {
      const { ctx, W, H } = e; const base = H;
      [[0.3, 0.55, 'accent2'], [0.22, 1, d.c]].forEach(([hk, a, c], k) => {
        ctx.fillStyle = rgba(col(e, c), d.a * a);
        ctx.beginPath(); ctx.moveTo(0, base);
        const pts = k ? [[0, 0.1], [0.18, 0.55], [0.33, 0.25], [0.55, 0.9], [0.75, 0.35], [0.9, 0.6], [1, 0.2]] : [[0, 0.3], [0.25, 0.8], [0.45, 0.4], [0.7, 1], [1, 0.45]];
        pts.forEach(([px, py]) => ctx.lineTo(W * px, base - e.u * hk * py * (d.size || 1) - e.u * 0.04));
        ctx.lineTo(W, base); ctx.closePath(); ctx.fill();
      });
    },
    skyline(e, d, r) {
      const { ctx, W, H } = e; let x = 0;
      while (x < W) {
        const bw = e.u * (0.05 + r() * 0.07), bh = e.u * (0.08 + r() * 0.26) * (d.size || 1);
        ctx.fillStyle = rgba(col(e, d.c), d.a); ctx.fillRect(x, H - bh, bw - e.u * 0.006, bh);
        ctx.fillStyle = rgba(e.p.bg1, d.a * 0.6);
        for (let wy = H - bh + e.u * 0.02; wy < H - e.u * 0.02; wy += e.u * 0.03)
          for (let wx = x + e.u * 0.012; wx < x + bw - e.u * 0.02; wx += e.u * 0.022) ctx.fillRect(wx, wy, e.u * 0.008, e.u * 0.012);
        x += bw;
      }
    },
    cross(e, d, r) {
      const { ctx, W, H } = e;
      for (let i = 0; i < (d.n || 6); i++) {
        const x = (i % 2 ? 0.78 + r() * 0.2 : r() * 0.2) * W, y = r() * H, s = e.u * (0.02 + r() * 0.04);
        ctx.fillStyle = rgba(col(e, i % 3 ? d.c : 'accent2'), d.a);
        rr(ctx, x - s / 2, y - s * 1.5, s, s * 3, s * 0.2); ctx.fill();
        rr(ctx, x - s * 1.5, y - s / 2, s * 3, s, s * 0.2); ctx.fill();
      }
    },
    bigtext(e, d) {
      const { ctx } = e; const o = at(e, d.pos || 'r');
      const t = (d.text || (e.f.tag || e.f.headline || 'A').trim().split(/\s+/)[0] || 'A').slice(0, d.len || 3).toUpperCase();
      ctx.save(); ctx.font = font(900, e.u * 0.8 * (d.size || 1), e.headFont); ctx.fillStyle = rgba(col(e, d.c || 'text'), d.a);
      ctx.textBaseline = 'middle'; ctx.textAlign = o.x >= e.W ? 'right' : o.x <= 0 ? 'left' : 'center';
      ctx.fillText(t, o.x + (o.x >= e.W ? e.u * 0.06 : o.x <= 0 ? -e.u * 0.06 : 0), o.y);
      ctx.restore();
    },
    sunburst(e, d) {
      const { ctx } = e; const o = at(e, d.pos || 'c'); const R = Math.hypot(e.W, e.H); const n = d.n || 24;
      ctx.fillStyle = rgba(col(e, d.c), d.a);
      for (let i = 0; i < n; i += 2) {
        const a1 = i * Math.PI * 2 / n, a2 = (i + 1) * Math.PI * 2 / n;
        ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + Math.cos(a1) * R, o.y + Math.sin(a1) * R); ctx.lineTo(o.x + Math.cos(a2) * R, o.y + Math.sin(a2) * R); ctx.closePath(); ctx.fill();
      }
    },
    plus(e, d) {
      const { ctx } = e; const o = at(e, d.pos); const sp = e.u * 0.05, s = e.u * 0.012;
      ctx.fillStyle = rgba(col(e, d.c), d.a);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
        if (i + j > 5) continue;
        const x = o.x <= 0 ? e.pad * 0.5 + i * sp : e.W - e.pad * 0.5 - i * sp, y = o.y <= 0 ? e.pad * 0.5 + j * sp : e.H - e.pad * 0.5 - j * sp;
        ctx.fillRect(x - s, y - s * 0.22, s * 2, s * 0.44); ctx.fillRect(x - s * 0.22, y - s, s * 0.44, s * 2);
      }
    },
    crescent(e, d, r) {
      const { ctx } = e; const o = at(e, d.pos || 'tr');
      const R = e.u * 0.13 * (d.size || 1);
      const x = o.x >= e.W ? e.W - e.pad - R * 1.3 : o.x <= 0 ? e.pad + R * 1.3 : o.x, y = o.y <= 0 ? e.pad * 1.6 + R : o.y;
      ctx.save(); ctx.fillStyle = rgba(col(e, d.c), d.a); ctx.shadowColor = col(e, d.c); ctx.shadowBlur = R * 0.5 * e.k;
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.arc(x + R * 0.42, y - R * 0.2, R * 0.86, 0, Math.PI * 2, true); ctx.fill('evenodd');
      ctx.restore();
      ctx.fillStyle = rgba(col(e, d.c), d.a);
      for (let i = 0; i < 9; i++) { starPath(ctx, r() * e.W, r() * e.H * 0.45, e.u * 0.012, e.u * 0.005, 5); ctx.fill(); }
    },
    fireworks(e, d, r) {
      const { ctx, W, H } = e; ctx.lineCap = 'round';
      for (let b = 0; b < (d.n || 4); b++) {
        const x = W * (0.12 + r() * 0.76), y = H * (0.06 + r() * 0.3), R = e.u * (0.08 + r() * 0.08);
        const c = col(e, b % 2 ? 'accent2' : d.c);
        ctx.strokeStyle = rgba(c, d.a); ctx.lineWidth = e.u * 0.004;
        for (let k = 0; k < 16; k++) {
          const a = k * Math.PI / 8;
          ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * R * 0.35, y + Math.sin(a) * R * 0.35); ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); ctx.stroke();
        }
      }
    },
    lines(e, d) {
      const { ctx } = e; const o = at(e, d.pos);
      ctx.fillStyle = rgba(col(e, d.c), d.a);
      const w = e.u * 0.18, t = e.u * 0.004;
      for (let i = 0; i < 4; i++) {
        const x = o.x >= e.W ? e.W - e.pad - w + i * w * 0.15 : e.pad + i * w * 0.0;
        const y = o.y >= e.H ? e.H - e.pad * 2 - i * e.u * 0.022 : e.pad * 2.2 + i * e.u * 0.022;
        ctx.fillRect(x, y, w * (1 - i * 0.15), t);
      }
    },
    glow(e, d) {
      const { ctx } = e; const o = at(e, d.pos || 'tr'); const R = e.u * 0.8 * (d.size || 1);
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, R);
      g.addColorStop(0, rgba(col(e, d.c), d.a)); g.addColorStop(1, rgba(col(e, d.c), 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, e.W, e.H);
    },
    rangoli(e, d) {
      const { ctx } = e; const o = at(e, d.pos || 'bl'); const R = e.u * 0.2 * (d.size || 1);
      const cols = [e.p.accent, e.p.accent2, '#F472B6', '#22D3EE'];
      ctx.save(); ctx.translate(o.x, o.y);
      for (let ring = 4; ring >= 1; ring--) {
        ctx.fillStyle = rgba(cols[ring % 4], d.a);
        starPath(ctx, 0, 0, R * ring / 4, R * ring / 4 * 0.72, 8 + ring * 2, ring * 0.3); ctx.fill();
      }
      ctx.restore();
    }
  };
  function drawDecor(e) {
    const r = rng(e.seed * 31 + 17);
    const op = e.s.decorOpacity == null ? 1 : e.s.decorOpacity;
    (e.T.decor || []).forEach(d => {
      const fn = DECOR[d.t]; if (!fn) return;
      e.ctx.save();
      try { fn(e, { ...d, a: (d.a == null ? 0.3 : d.a) * op }, r); } finally { e.ctx.restore(); }
    });
  }

  /* ---------------- Layouts ---------------- */
  function splitGeom(e, o) {
    const { W, H } = e;
    const portrait = H > W * 1.12;
    let side = e.s.imagePos && e.s.imagePos !== 'auto' ? e.s.imagePos : (o.side || 'right');
    if (portrait && (side === 'left' || side === 'right')) side = o.pside || 'top';
    if (!portrait && (side === 'top' || side === 'bottom')) side = side === 'top' ? 'left' : 'right';
    const r = o.ratio || 0.45;
    const rk = portrait ? Math.min(r, 0.36) : r;
    const g = { side };
    if (side === 'right') { g.panel = { x: W * (1 - rk), y: 0, w: W * rk, h: H }; g.region = { x: 0, y: 0, w: W * (1 - rk), h: H }; }
    else if (side === 'left') { g.panel = { x: 0, y: 0, w: W * rk, h: H }; g.region = { x: W * rk, y: 0, w: W * (1 - rk), h: H }; }
    else if (side === 'top') { g.panel = { x: 0, y: 0, w: W, h: H * rk }; g.region = { x: 0, y: H * rk, w: W, h: H * (1 - rk) }; }
    else { g.panel = { x: 0, y: H * (1 - rk), w: W, h: H * rk }; g.region = { x: 0, y: 0, w: W, h: H * (1 - rk) }; }
    return g;
  }
  function solidCardColors(e) {
    const acc = lum(e.p.accent) > 0.45 ? mix(e.p.accent, '#000000', 0.45) : e.p.accent;
    const acc2 = lum(e.p.accent2) > 0.45 ? mix(e.p.accent2, '#000000', 0.45) : e.p.accent2;
    return { ...e.p, text: '#0F172A', muted: '#475569', accent: acc, accent2: acc2 };
  }
  function cardStack(e, makeItems, box, kind, valign) {
    const ctx = e.ctx; const cp = e.v * 0.065;
    const saved = e.p, savedDark = e.dark;
    if (kind === 'solid') { e.p = solidCardColors(e); e.dark = false; }
    const items = makeItems().filter(Boolean);
    const inner = { x: box.x + cp, w: box.w - cp * 2, h: box.h - cp * 2 };
    const f = fit(e, items, inner.w, inner.h);
    const ch = f.total + cp * 2;
    const cy = valign === 'top' ? box.y : box.y + (box.h - ch) / 2;
    ctx.save();
    if (kind === 'offset') { rr(ctx, box.x + e.u * 0.025, cy + e.u * 0.025, box.w, ch, e.crad(1)); ctx.fillStyle = saved.accent; ctx.fill(); }
    rr(ctx, box.x, cy, box.w, ch, e.crad(1));
    if (kind === 'glass') {
      ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = e.u * 0.06 * e.k; ctx.shadowOffsetY = e.u * 0.015 * e.k;
      ctx.fillStyle = savedDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)'; ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = savedDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)'; ctx.lineWidth = e.u * 0.003; ctx.stroke();
    } else if (kind === 'neon') {
      ctx.fillStyle = rgba(saved.bg1, 0.7); ctx.fill();
      ctx.shadowColor = saved.accent; ctx.shadowBlur = e.u * 0.035 * e.k;
      ctx.strokeStyle = saved.accent; ctx.lineWidth = e.u * 0.005; ctx.stroke();
    } else if (kind === 'outline') {
      ctx.strokeStyle = rgba(saved.text, 0.6); ctx.lineWidth = e.u * 0.004; ctx.stroke();
    } else {
      ctx.shadowColor = 'rgba(15,23,42,0.22)'; ctx.shadowBlur = e.u * 0.05 * e.k; ctx.shadowOffsetY = e.u * 0.012 * e.k;
      ctx.fillStyle = kind === 'tint' ? rgba(saved.bg2, 0.9) : '#FFFFFF'; ctx.fill();
    }
    ctx.restore();
    drawItems(e, items, f, inner.x, cy + cp, inner.w);
    e.p = saved; e.dark = savedDark;
    return { y: cy, h: ch };
  }

  const LAYOUTS = {
    hero: {
      draw(e, box, o) { stack(e, std(e, o, o.keys), narrow(e, box, o.maxW), o.valign || 'center'); }
    },
    minimal: {
      draw(e, box, o) {
        const top = stack(e, std(e, o, ['tag']), box, 'top');
        const y = top ? top.bottom + e.u * 0.05 : box.y;
        stack(e, std(e, { ...o, divider: o.divider || 'line', featStyle: o.featStyle || 'dot', ctaStyle: o.ctaStyle || 'link', hs: o.hs || 1.1 },
          ['headline', 'divider', 'subheadline', 'description', 'features', 'cta']), narrow(e, { x: box.x, y, w: box.w, h: box.y + box.h - y }, o.maxW || 0.92), 'bottom');
      }
    },
    split: {
      useImage: true,
      region(e, o) { return e.show('image') ? splitGeom(e, o).region : null; },
      back(e, o) {
        if (!e.show('image')) return;
        const { panel } = splitGeom(e, o); const ctx = e.ctx;
        if (o.panel === 'full' || !o.panel) { imageBox(e, panel.x, panel.y, panel.w, panel.h, 'rect', 0); return; }
        ctx.fillStyle = rgba(e.p.accent, e.dark ? 0.16 : 0.1); ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
        const m = Math.min(panel.w, panel.h) * 0.12;
        const ib = { x: panel.x + m, y: panel.y + m, w: panel.w - m * 2, h: panel.h - m * 2 };
        if (o.panel === 'circle') { const d = Math.min(ib.w, ib.h); imageBox(e, ib.x + (ib.w - d) / 2, ib.y + (ib.h - d) / 2, d, d, 'circle'); }
        else if (o.panel === 'arch') {
          const w = Math.min(ib.w, ib.h * 0.75), h = Math.min(ib.h, w * 1.5);
          const ax = ib.x + (ib.w - w) / 2, ay = ib.y + (ib.h - h) / 2;
          ctx.strokeStyle = rgba(e.p.accent, 0.8); ctx.lineWidth = e.u * 0.004;
          archPath(ctx, ax - e.u * 0.02, ay - e.u * 0.02, w + e.u * 0.04, h + e.u * 0.04); ctx.stroke();
          imageBox(e, ax, ay, w, h, 'arch');
        } else imageBox(e, ib.x, ib.y, ib.w, ib.h, 'rect', e.crad(1));
      },
      draw(e, box, o) { stack(e, std(e, { ...o, featCols: 1 }, o.keys), box, o.valign || 'center'); }
    },
    card: {
      draw(e, box, o) {
        const b = narrow(e, box, o.maxW || 1);
        cardStack(e, () => std(e, o, o.keys), b, o.card || 'glass', o.valign);
      }
    },
    editorial: {
      draw(e, box, o) {
        const ctx = e.ctx;
        const mast = e.show('tag') ? {
          g: 0, measure(s) { return e.u * 0.05 * s; },
          draw(x, y, w, s) {
            ctx.save(); ctx.font = font(700, e.u * 0.022 * s * e.s.bodyScale, e.bodyFont); setLS(ctx, e.u * 0.004);
            ctx.fillStyle = e.p.text; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
            ctx.fillText(String(e.f.tag).toUpperCase(), x, y + e.u * 0.018 * s);
            ctx.textAlign = 'right'; ctx.fillStyle = e.p.accent; ctx.fillText(o.mastRight || '— 01', x + w, y + e.u * 0.018 * s);
            ctx.fillStyle = e.p.text; ctx.fillRect(x, y + e.u * 0.042 * s, w, Math.max(1, e.u * 0.004 * s));
            ctx.restore();
          }
        } : null;
        const rule = { g: 0.035, measure(s) { return e.u * 0.004 * s; }, draw(x, y, w, s) { ctx.fillStyle = rgba(e.p.text, 0.35); ctx.fillRect(x, y, w, Math.max(1, e.u * 0.002)); } };
        const wide = box.w > box.h * 1.25;
        const oo = { ...o, hs: o.hs || 1.12, lhk: 0.95, featStyle: 'number', ctaStyle: 'link', subItalic: true, subFont: 'head', subWeight: 500, featCols: 1 };
        if (wide) {
          const top = stack(e, [mast, B.headline(e, oo), B.subheadline(e, oo)].filter(Boolean), { ...box, h: box.h * 0.55 }, 'top');
          const y = (top ? top.bottom : box.y) + e.u * 0.04;
          const colW = (box.w - e.u * 0.06) / 2, h = box.y + box.h - y;
          stack(e, [rule, B.description(e, oo), B.cta(e, oo)].filter(Boolean), { x: box.x, y, w: colW, h }, 'top');
          stack(e, [B.features(e, oo)].filter(Boolean), { x: box.x + colW + e.u * 0.06, y: y + e.u * 0.04, w: colW, h: h - e.u * 0.04 }, 'top');
        } else {
          stack(e, [mast, B.headline(e, oo), B.subheadline(e, oo), rule, B.description(e, oo), B.features(e, oo), B.cta(e, oo)].filter(Boolean), box, o.valign || 'top');
        }
      }
    },
    features: {
      draw(e, box, o) {
        stack(e, std(e, { featStyle: 'card', ...o, featCols: o.featCols || 'auto' }, ['tag', 'headline', 'subheadline', 'description', 'features', 'cta']), box, o.valign || 'center');
      }
    },
    grid: {
      draw(e, box, o) {
        const ctx = e.ctx;
        const items = e.show('features') ? (e.f.features || []).map(t => String(t).trim()).filter(Boolean).slice(0, 6) : [];
        if (!items.length) { stack(e, std(e, o), box, 'center'); return; }
        const top = stack(e, std(e, o, ['tag', 'headline', 'subheadline']), { ...box, h: box.h * 0.4 }, 'top');
        const cta = B.cta(e, o);
        const ctaH = cta ? cta.measure(top ? Math.max(0.6, top.s) : 1, box.w) : 0;
        const y0 = (top ? top.bottom : box.y) + e.u * 0.045;
        const area = { x: box.x, y: y0, w: box.w, h: box.y + box.h - y0 - (cta ? Math.min(ctaH, e.u * 0.2) + e.u * 0.04 : 0) };
        const n = items.length;
        let cols = n <= 2 ? n : (box.w > box.h * 1.25 ? 3 : 2);
        if (n === 3 && box.w < box.h * 1.25) cols = 1;
        if (cols === 3 && n === 4) cols = 2;
        const rows = Math.ceil(n / cols), gap = e.u * 0.026;
        const tw = (area.w - gap * (cols - 1)) / cols;
        const th = Math.min((area.h - gap * (rows - 1)) / rows, tw * (cols === 1 ? 0.35 : 0.9));
        const gy = area.y + Math.max(0, (area.h - (th * rows + gap * (rows - 1))) / 2);
        const icons = o.icons || ['zap', 'target', 'trend', 'shield', 'users', 'sparkles'];
        items.forEach((t, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const x = area.x + c * (tw + gap), y = gy + r * (th + gap);
          ctx.save();
          rr(ctx, x, y, tw, th, e.crad(0.8));
          ctx.fillStyle = o.tileSolid ? e.p.accent : (e.dark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.82)'); ctx.fill();
          ctx.strokeStyle = rgba(o.tileSolid ? e.p.accent : e.p.text, 0.12); ctx.lineWidth = Math.max(1, e.u * 0.002); ctx.stroke();
          const tc = o.tileSolid ? onColor(e.p.accent) : e.p.text;
          const pad = Math.min(tw, th) * 0.12;
          let big = null, label = t;
          if (o.mode === 'stats') {
            const p = t.split('|');
            if (p.length > 1) { big = p[0].trim(); label = p.slice(1).join('|').trim(); }
            else { const m = t.match(/^(\S*\d\S*)\s+(.+)$/); if (m) { big = m[1]; label = m[2]; } }
          }
          let size = Math.min(th * 0.17, tw * 0.11, e.u * 0.034) * e.s.bodyScale;
          const headH = big ? Math.min(th * 0.36, e.u * 0.09) : Math.min(th * 0.3, e.u * 0.075);
          const avail = th - pad * 2 - headH - pad * 0.5;
          let lines;
          for (let k = 0; k < 30; k++) { ctx.font = font(600, size, e.bodyFont); lines = wrap(ctx, label, tw - pad * 2); if (lines.length * size * 1.28 <= avail || size < 6) break; size *= 0.92; }
          const block = headH + pad * 0.5 + lines.length * size * 1.28;
          let cy = y + (th - block) / 2;
          const centered = cols > 1;
          const cx = centered ? x + tw / 2 : x + pad;
          if (big) {
            ctx.fillStyle = o.tileSolid ? tc : e.p.accent; ctx.textBaseline = 'middle'; ctx.textAlign = centered ? 'center' : 'left';
            fitLine(ctx, big, tw - pad * 2, 800, headH * 0.9, e.headFont);
            ctx.fillText(big, cx, cy + headH / 2);
          } else {
            const d = headH;
            const ix = centered ? cx - d / 2 : cx;
            ctx.beginPath(); ctx.arc(ix + d / 2, cy + d / 2, d / 2, 0, Math.PI * 2);
            ctx.fillStyle = o.tileSolid ? rgba(tc, 0.18) : rgba(e.p.accent, e.dark ? 0.25 : 0.14); ctx.fill();
            drawIcon(ctx, icons[i % icons.length], ix + d * 0.25, cy + d * 0.25, d * 0.5, o.tileSolid ? tc : e.p.accent, 2.2);
          }
          cy += headH + pad * 0.5;
          ctx.fillStyle = tc; ctx.font = font(600, size, e.bodyFont); ctx.textAlign = centered ? 'center' : 'left'; ctx.textBaseline = 'middle';
          lines.forEach((ln, j) => ctx.fillText(ln, cx, cy + j * size * 1.28 + size * 0.64));
          ctx.restore();
        });
        if (cta) {
          const s = top ? Math.max(0.6, top.s) : 1;
          const h = cta.measure(s, box.w);
          if (h < OVER) cta.draw(box.x, box.y + box.h - h, box.w, s);
        }
      }
    },
    offer: {
      draw(e, box, o) {
        const ctx = e.ctx;
        const land = box.w > box.h * 1.15;
        const tag = e.show('tag') ? String(e.f.tag || '').trim() : '';
        let bb = null, tb = box;
        const ticket = o.badge === 'ticket';
        if (tag) {
          if (ticket) {
            const w = land ? box.w * 0.46 : box.w * 0.92, h = land ? Math.min(box.h * 0.62, w * 0.6) : Math.min(box.h * 0.3, w * 0.42);
            bb = land ? { x: box.x + box.w - w, y: box.y + (box.h - h) / 2, w, h } : { x: box.x + (box.w - w) / 2, y: box.y, w, h };
          } else {
            const d = land ? Math.min(box.h * 0.95, box.w * 0.42) : Math.min(box.w * 0.62, box.h * 0.42);
            bb = land ? { x: box.x + box.w - d, y: box.y + (box.h - d) / 2, w: d, h: d } : { x: alignX(e.align, box.x, box.w, d), y: box.y, w: d, h: d };
          }
          tb = land ? { x: box.x, y: box.y, w: bb.x - box.x - e.u * 0.05, h: box.h } : { x: box.x, y: bb.y + bb.h + e.u * 0.045, w: box.w, h: box.y + box.h - bb.y - bb.h - e.u * 0.045 };
          ctx.save();
          const cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2, R = Math.min(bb.w, bb.h) / 2;
          let inner;
          if (ticket) {
            const n = bb.h * 0.14;
            ctx.beginPath(); ctx.moveTo(bb.x, bb.y); ctx.lineTo(bb.x + bb.w, bb.y); ctx.lineTo(bb.x + bb.w, cy - n);
            ctx.arc(bb.x + bb.w, cy, n, -Math.PI / 2, Math.PI / 2, true); ctx.lineTo(bb.x + bb.w, bb.y + bb.h); ctx.lineTo(bb.x, bb.y + bb.h); ctx.lineTo(bb.x, cy + n);
            ctx.arc(bb.x, cy, n, Math.PI / 2, -Math.PI / 2, true); ctx.closePath();
            ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = e.u * 0.04 * e.k; ctx.fillStyle = e.p.accent; ctx.fill(); ctx.shadowColor = 'transparent';
            ctx.setLineDash([e.u * 0.012, e.u * 0.01]); ctx.strokeStyle = rgba(onColor(e.p.accent), 0.6); ctx.lineWidth = e.u * 0.003;
            const m = bb.h * 0.12; ctx.strokeRect(bb.x + m * 1.6, bb.y + m, bb.w - m * 3.2, bb.h - m * 2); ctx.setLineDash([]);
            inner = { w: bb.w - m * 5, h: bb.h - m * 3.4 };
          } else if (o.badge === 'circle') {
            ctx.fillStyle = e.p.accent; ctx.beginPath(); ctx.arc(cx, cy, R * 0.92, 0, Math.PI * 2); ctx.fill();
            ctx.setLineDash([e.u * 0.014, e.u * 0.01]); ctx.strokeStyle = e.p.accent; ctx.lineWidth = e.u * 0.005;
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
            ctx.strokeStyle = rgba(onColor(e.p.accent), 0.5); ctx.lineWidth = e.u * 0.003; ctx.beginPath(); ctx.arc(cx, cy, R * 0.8, 0, Math.PI * 2); ctx.stroke();
            inner = { w: R * 1.25, h: R * 1.05 };
          } else {
            ctx.shadowColor = rgba(e.p.accent, 0.6); ctx.shadowBlur = e.u * 0.05 * e.k;
            starPath(ctx, cx, cy, R, R * 0.86, 22, 0); ctx.fillStyle = e.p.accent; ctx.fill(); ctx.shadowColor = 'transparent';
            ctx.strokeStyle = rgba(onColor(e.p.accent), 0.45); ctx.lineWidth = e.u * 0.003; ctx.beginPath(); ctx.arc(cx, cy, R * 0.74, 0, Math.PI * 2); ctx.stroke();
            inner = { w: R * 1.2, h: R * 1.0 };
          }
          let size = inner.h * 0.5, lines;
          for (let k = 0; k < 40; k++) {
            ctx.font = font(900, size, e.headFont);
            lines = wrap(ctx, tag.toUpperCase(), inner.w);
            if (lines.length * size * 1.0 <= inner.h && wordsFit(ctx, tag.toUpperCase(), inner.w)) break;
            size *= 0.93;
          }
          ctx.fillStyle = onColor(e.p.accent); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          lines.forEach((ln, i) => ctx.fillText(ln, cx, cy - (lines.length - 1) * size * 0.5 + i * size + size * 0.05));
          ctx.restore();
        }
        stack(e, std(e, o, ['headline', 'subheadline', 'description', 'features', 'cta']), tb, 'center');
      }
    },
    testimonial: {
      draw(e, box, o) {
        const oo = { ...o, hs: o.hs || 0.55, quoteItalic: o.quoteItalic };
        const make = () => [B.tag(e, oo), B.headline(e, oo), QuoteMarkB(e), B.quote(e, oo), StarsB(e), B.avatar(e)];
        if (o.card) cardStack(e, make, narrow(e, box, o.maxW || 1), o.card, 'center');
        else stack(e, make(), narrow(e, box, o.maxW), 'center');
      }
    },
    compare: {
      draw(e, box, o) {
        const make = () => std(e, o, ['tag', 'headline', 'description', 'table', 'cta']);
        if (o.card) cardStack(e, make, box, o.card, 'center');
        else stack(e, make(), box, 'center');
      }
    },
    announce: {
      draw(e, box, o) {
        const ctx = e.ctx;
        let b = box;
        const band = o.mode === 'band' && e.show('tag') && String(e.f.tag || '').trim();
        if (band) {
          const h = e.u * 0.1;
          ctx.save(); ctx.fillStyle = e.p.accent; ctx.fillRect(0, box.y, e.W, h);
          ctx.fillStyle = onColor(e.p.accent); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const t = String(e.f.tag).toUpperCase();
          fitLine(ctx, t, e.W - e.pad * 2, 800, h * 0.42, e.headFont); setLS(ctx, h * 0.06);
          ctx.fillText(t, e.W / 2, box.y + h / 2 + h * 0.03); ctx.restore();
          b = { ...box, y: box.y + h + e.u * 0.05, h: box.h - h - e.u * 0.05 };
        }
        const keys = band ? ['headline', 'divider', 'subheadline', 'description', 'features', 'cta'] : ['tag', 'headline', 'divider', 'subheadline', 'description', 'features', 'cta'];
        stack(e, std(e, { tagStyle: 'ribbon', divider: 'line', featStyle: 'dot', ...o }, keys), narrow(e, b, o.maxW), 'center');
      }
    },
    invite: {
      draw(e, box, o) {
        const ctx = e.ctx;
        const oo = { tagStyle: 'script', divider: 'diamond', ctaStyle: 'outline', subUpper: true, ss: 0.8, subColor: 'text', ...o };
        const items = std(e, oo, ['tag', 'headline', 'divider', 'subheadline', 'description', 'features', 'cta']);
        if (o.arch) {
          const w = Math.min(box.w * 0.92, box.h * 0.7), h = box.h;
          const ax = box.x + (box.w - w) / 2;
          ctx.save(); archPath(ctx, ax, box.y, w, h);
          ctx.fillStyle = e.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)'; ctx.fill();
          ctx.strokeStyle = rgba(e.p.accent, 0.7); ctx.lineWidth = e.u * 0.004; ctx.stroke(); ctx.restore();
          stack(e, items, { x: ax + w * 0.1, y: box.y + w * 0.28, w: w * 0.8, h: h - w * 0.28 - e.u * 0.05 }, 'center');
        } else stack(e, items, narrow(e, box, o.maxW || 0.9), 'center');
      }
    },
    quote: {
      draw(e, box, o) {
        const ctx = e.ctx;
        const oo = { hs: o.hs || 0.85, headItalic: o.italic, subColor: 'accent', ...o };
        const items = [o.mark !== false ? QuoteMarkB(e) : null, B.headline(e, oo), B.divider(e, { divider: o.divider || 'line' }), B.subheadline(e, oo), B.description(e, oo), B.cta(e, oo)].filter(Boolean);
        if (o.bar) {
          const bw = e.u * 0.014, inset = e.u * 0.06;
          const r = stack(e, items, { x: box.x + inset, y: box.y, w: box.w * (o.maxW || 0.92) - inset, h: box.h }, 'center');
          if (r) { ctx.fillStyle = e.p.accent; ctx.fillRect(box.x, r.y, bw, r.h); }
        } else stack(e, items, narrow(e, box, o.maxW || 0.9), 'center');
      }
    },
    showcase: {
      useImage: true,
      draw(e, box, o) {
        const ctx = e.ctx;
        const land = box.w > box.h * 1.1;
        const show = e.show('image');
        let ib = null, tb = box;
        if (show) {
          if (land) { const d = Math.min(box.h, box.w * 0.45); ib = { x: box.x + box.w - d, y: box.y + (box.h - d) / 2, w: d, h: d }; tb = { x: box.x, y: box.y, w: box.w - d - e.u * 0.06, h: box.h }; }
          else { const d = Math.min(box.w * 0.8, box.h * 0.48); ib = { x: box.x + (box.w - d) / 2, y: box.y, w: d, h: d }; tb = { x: box.x, y: box.y + d + e.u * 0.05, w: box.w, h: box.h - d - e.u * 0.05 }; }
          const { x, y, w, h } = ib;
          ctx.save();
          if (o.mode === 'podium') {
            const g = ctx.createRadialGradient(x + w / 2, y + h * 0.95, 0, x + w / 2, y + h * 0.95, w * 0.6);
            g.addColorStop(0, rgba(e.p.accent, 0.5)); g.addColorStop(1, rgba(e.p.accent, 0));
            ctx.fillStyle = g; ctx.fillRect(x - w * 0.2, y + h * 0.6, w * 1.4, h * 0.6);
            ctx.fillStyle = rgba(e.p.text, 0.12); ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.93, w * 0.46, h * 0.07, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            imageBox(e, x + w * 0.12, y, w * 0.76, h * 0.86, 'rect', e.crad(1.2));
          } else if (o.mode === 'tilted') {
            ctx.translate(x + w / 2, y + h / 2);
            ctx.save(); ctx.rotate(0.07); rr(ctx, -w * 0.42, -h * 0.42, w * 0.84, h * 0.84, e.crad(1)); ctx.fillStyle = e.p.accent; ctx.fill(); ctx.restore();
            ctx.rotate(-0.06); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = e.u * 0.05 * e.k;
            rr(ctx, -w * 0.42, -h * 0.42, w * 0.84, h * 0.84, e.crad(1)); ctx.fillStyle = e.p.bg1; ctx.fill(); ctx.shadowColor = 'transparent';
            ctx.translate(-(x + w / 2), -(y + h / 2));
            ctx.restore(); ctx.save();
            ctx.translate(x + w / 2, y + h / 2); ctx.rotate(-0.06); ctx.translate(-(x + w / 2), -(y + h / 2));
            imageBox(e, x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.8, 'rect', e.crad(0.8));
            ctx.restore();
          } else {
            const g = ctx.createRadialGradient(x + w / 2, y + h / 2, w * 0.3, x + w / 2, y + h / 2, w * 0.62);
            g.addColorStop(0, rgba(e.p.accent, 0.55)); g.addColorStop(1, rgba(e.p.accent, 0));
            ctx.fillStyle = g; ctx.fillRect(x - w * 0.2, y - h * 0.2, w * 1.4, h * 1.4);
            ctx.strokeStyle = rgba(e.p.accent, 0.8); ctx.lineWidth = e.u * 0.005;
            ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.47, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
            imageBox(e, x + w * 0.07, y + h * 0.07, w * 0.86, h * 0.86, 'circle');
          }
          const tag = e.show('tag') ? String(e.f.tag || '').trim() : '';
          if (tag) {
            const d = w * 0.3, bx = x + w - d * 0.75, by = y + d * 0.05;
            ctx.save(); ctx.fillStyle = e.p.accent2; ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = e.u * 0.03 * e.k;
            starPath(ctx, bx + d / 2, by + d / 2, d / 2, d * 0.44, 16, 0); ctx.fill(); ctx.shadowColor = 'transparent';
            ctx.fillStyle = onColor(e.p.accent2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            let size = d * 0.26, lines;
            for (let k = 0; k < 30; k++) { ctx.font = font(800, size, e.headFont); lines = wrap(ctx, tag.toUpperCase(), d * 0.66); if (lines.length * size <= d * 0.6 && wordsFit(ctx, tag.toUpperCase(), d * 0.66)) break; size *= 0.92; }
            lines.forEach((ln, i) => ctx.fillText(ln, bx + d / 2, by + d / 2 - (lines.length - 1) * size / 2 + i * size));
            ctx.restore();
          }
        }
        stack(e, std(e, { featStyle: 'pill', ...o }, show ? ['headline', 'subheadline', 'description', 'features', 'cta'] : ['tag', 'headline', 'subheadline', 'description', 'features', 'cta']), tb, show && !land ? 'top' : 'center');
      }
    },
    photo: {
      useImage: true,
      region(e, o) {
        if (o.mode !== 'side') return null;
        const { W, H } = e;
        return W >= H * 0.95 ? { x: 0, y: 0, w: W * 0.56, h: H } : { x: 0, y: H * 0.42, w: W, h: H * 0.58 };
      },
      back(e, o) {
        const ctx = e.ctx, { W, H } = e;
        if (o.mode === 'framed') return;
        if (e.show('image')) {
          if (e.img.main) drawCover(ctx, e.img.main, 0, 0, W, H); else placeholderArt(e, 0, 0, W, H);
        }
        if (o.mode === 'side') {
          const r = LAYOUTS.photo.region(e, o);
          ctx.fillStyle = rgba(e.p.bg1, 0.9); ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.fillStyle = e.p.accent; if (r.w < W) ctx.fillRect(r.w, 0, e.u * 0.012, H); else ctx.fillRect(0, r.y, W, e.u * 0.012);
        } else {
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, rgba(e.p.bg1, 0.55)); g.addColorStop(0.3, rgba(e.p.bg1, 0.1)); g.addColorStop(0.55, rgba(e.p.bg1, 0.55)); g.addColorStop(1, rgba(e.p.bg1, 0.96));
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        }
      },
      draw(e, box, o) {
        const ctx = e.ctx;
        if (o.mode === 'framed') {
          const land = box.w > box.h * 1.1;
          let tb = box;
          if (e.show('image')) {
            let fb;
            if (land) { const w = box.w * 0.46; fb = { x: box.x + box.w - w, y: box.y, w, h: box.h }; tb = { x: box.x, y: box.y, w: box.w - w - e.u * 0.06, h: box.h }; }
            else { const h = box.h * 0.5; fb = { x: box.x, y: box.y, w: box.w, h }; tb = { x: box.x, y: box.y + h + e.u * 0.05, w: box.w, h: box.h - h - e.u * 0.05 }; }
            const bw = e.u * 0.018;
            ctx.save(); ctx.translate(fb.x + fb.w / 2, fb.y + fb.h / 2); ctx.rotate(-0.025); ctx.translate(-(fb.x + fb.w / 2), -(fb.y + fb.h / 2));
            ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = e.u * 0.04 * e.k; ctx.shadowOffsetY = e.u * 0.01 * e.k;
            ctx.fillStyle = '#FFFFFF'; ctx.fillRect(fb.x, fb.y, fb.w, fb.h); ctx.shadowColor = 'transparent';
            imageBox(e, fb.x + bw, fb.y + bw, fb.w - bw * 2, fb.h - bw * 2, 'rect', 0);
            ctx.restore();
          }
          stack(e, std(e, o), tb, 'center');
          return;
        }
        stack(e, std(e, { featStyle: 'pill', ...o }, o.keys), narrow(e, box, o.maxW), o.mode === 'side' ? 'center' : 'bottom');
      }
    },
    bold: {
      draw(e, box, o) {
        const oo = { ...o, fillWidth: true, wordLines: o.mode === 'stack', fillMax: o.fillMax || 1.7, hs: 1.1, lhk: 0.92 };
        stack(e, std(e, oo, ['tag', 'headline', 'subheadline', 'description', 'cta']), box, o.valign || 'center');
      }
    },
    diagonal: {
      useImage: true,
      back(e, o) {
        const ctx = e.ctx, { W, H } = e;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(0, H * 0.66); ctx.lineTo(W, H * 0.5); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        ctx.fillStyle = e.p.accent; ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, H * 0.7); ctx.lineTo(W, H * 0.54); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        ctx.clip();
        if (e.show('image')) { if (e.img.main) drawCover(ctx, e.img.main, 0, H * 0.5, W, H * 0.5); else placeholderArt(e, 0, H * 0.5, W, H * 0.5); }
        ctx.restore();
      },
      draw(e, box, o) {
        const lim = e.H * 0.56 - e.u * 0.03 - box.y;
        stack(e, std(e, o, ['tag', 'headline', 'subheadline', 'description', 'cta']), { ...box, h: Math.min(box.h, lim) }, 'center');
      }
    },
    hiring: {
      draw(e, box, o) { stack(e, std(e, { ...o, pillSolid: o.pillSolid, hs: o.hs || 0.7 }, ['mega', 'headline', 'description', 'pills', 'subheadline', 'cta']), narrow(e, box, o.maxW), 'center'); }
    },
    event: {
      draw(e, box, o) { stack(e, std(e, { ...o, featStyle: 'icons', featCols: 1 }, ['date', 'headline', 'subheadline', 'description', 'features', 'cta']), narrow(e, box, o.maxW), 'center'); }
    },
    steps: {
      draw(e, box, o) { stack(e, std(e, o, ['tag', 'headline', 'subheadline', 'steps', 'cta']), box, o.valign || 'center'); }
    },
    chat: {
      draw(e, box, o) {
        const ctx = e.ctx;
        const land = box.w > box.h * 1.1;
        let tb, pb;
        if (land) { tb = { x: box.x, y: box.y, w: box.w * 0.52, h: box.h }; pb = { x: box.x + box.w * 0.58, y: box.y, w: box.w * 0.42, h: box.h }; }
        else { const th = box.h * 0.44; tb = { ...box, h: th }; pb = { x: box.x + box.w * 0.07, y: box.y + th + e.u * 0.04, w: box.w * 0.86, h: box.h - th - e.u * 0.04 }; }
        stack(e, std(e, o, ['tag', 'headline', 'subheadline', 'description', 'cta']), tb, land ? 'center' : 'top');
        const msgs = e.show('features') ? (e.f.features || []).map(t => String(t).trim()).filter(Boolean) : [];
        if (!msgs.length) return;
        ctx.save();
        const r = e.u * 0.04;
        ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = e.u * 0.05 * e.k; ctx.shadowOffsetY = e.u * 0.01 * e.k;
        rr(ctx, pb.x, pb.y, pb.w, pb.h, r); ctx.fillStyle = '#EFEAE2'; ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.clip();
        const hh = Math.min(e.u * 0.1, pb.h * 0.2);
        ctx.fillStyle = e.dark ? mix(e.p.bg2, '#000000', 0.2) : (lum(e.p.accent) > 0.5 ? mix(e.p.accent, '#000000', 0.5) : e.p.accent); ctx.fillRect(pb.x, pb.y, pb.w, hh);
        const hc = '#FFFFFF';
        const d = hh * 0.62;
        ctx.save(); ctx.beginPath(); ctx.arc(pb.x + hh * 0.3 + d / 2, pb.y + hh / 2, d / 2, 0, Math.PI * 2); ctx.clip();
        if (e.img.logo) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(pb.x, pb.y, pb.w, hh); const s = imgSize(e.img.logo); const k = Math.min(d * 0.8 / s.w, d * 0.8 / s.h); ctx.drawImage(e.img.logo, pb.x + hh * 0.3 + (d - s.w * k) / 2, pb.y + hh / 2 - s.h * k / 2, s.w * k, s.h * k); }
        else { ctx.fillStyle = e.p.accent2; ctx.fillRect(pb.x, pb.y, pb.w, hh); ctx.fillStyle = onColor(e.p.accent2); ctx.font = font(700, d * 0.45, e.headFont); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText((e.f.brand || 'B').trim().charAt(0).toUpperCase(), pb.x + hh * 0.3 + d / 2, pb.y + hh / 2 + d * 0.03); }
        ctx.restore();
        ctx.fillStyle = hc; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        fitLine(ctx, (e.f.brand || 'Business').trim(), pb.w - hh * 1.4 - d, 700, hh * 0.27, e.bodyFont);
        ctx.fillText((e.f.brand || 'Business').trim(), pb.x + hh * 0.5 + d, pb.y + hh * 0.4);
        ctx.font = font(400, hh * 0.19, e.bodyFont); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText('online', pb.x + hh * 0.5 + d, pb.y + hh * 0.7);
        const area = { x: pb.x + pb.w * 0.05, y: pb.y + hh + pb.w * 0.05, w: pb.w * 0.9, h: pb.h - hh - pb.w * 0.1 };
        let size = Math.min(e.u * 0.03, pb.w * 0.055) * e.s.bodyScale, layout;
        for (let k = 0; k < 40; k++) {
          ctx.font = font(400, size, e.bodyFont);
          const padX = size * 0.8, padY = size * 0.55, gap = size * 0.6;
          let total = 0;
          layout = msgs.map(m => { const lines = wrap(ctx, m, area.w * 0.74 - padX * 2); const h = lines.length * size * 1.3 + padY * 2; total += h + gap; return { lines, h, w: maxWidth(ctx, lines) + padX * 2, padX, padY, gap }; });
          if (total <= area.h || size < 5) break;
          size *= 0.93;
        }
        let y = area.y;
        layout.forEach((m, i) => {
          const out = i % 2 === 1;
          const x = out ? area.x + area.w - m.w : area.x;
          ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = size * 0.3 * e.k; ctx.shadowOffsetY = size * 0.08 * e.k;
          rr(ctx, x, y, m.w, m.h, size * 0.6); ctx.fillStyle = out ? '#D9FDD3' : '#FFFFFF'; ctx.fill(); ctx.shadowColor = 'transparent';
          ctx.fillStyle = '#111B21'; ctx.font = font(400, size, e.bodyFont); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          m.lines.forEach((ln, j) => ctx.fillText(ln, x + m.padX, y + m.padY + j * size * 1.3 + size * 0.66));
          y += m.h + m.gap;
        });
        ctx.restore();
      }
    }
  };

  /* ---------------- Header (logo / brand) & footer (contacts) ---------------- */
  function headerGeom(e) {
    const pos = e.s.logoPos || 'top-left';
    const hasLogo = e.show('logo'), hasBrand = e.show('brand') && (!e.img.logo || e.s.brandWithLogo);
    if (pos === 'none' || (!hasLogo && !hasBrand)) return null;
    return { pos, h: e.s.logoSize * e.v, top: pos.startsWith('top'), hasLogo, hasBrand };
  }
  function drawHeader(e, region, g, y) {
    const ctx = e.ctx;
    const h = g.h;
    const name = String(e.f.brand || '').trim();
    let lw = 0, logoW = 0, ts = h * 0.44;
    const img = g.hasLogo ? e.img.logo : null;
    if (g.hasLogo) {
      if (img) { const s = imgSize(img); logoW = Math.min(h * s.w / s.h, region.w * 0.5); } else logoW = h;
    }
    ctx.save();
    ctx.font = font(700, ts, e.headFont);
    let tw = g.hasBrand && name ? ctx.measureText(name).width : 0;
    const gap = logoW && tw ? h * 0.3 : 0;
    const maxW = region.w - e.pad * 2;
    if (logoW + gap + tw > maxW && tw) { ts *= Math.max(0.3, (maxW - logoW - gap) / tw); ctx.font = font(700, ts, e.headFont); tw = ctx.measureText(name).width; }
    lw = logoW + gap + tw;
    const al = g.pos.endsWith('center') ? 'center' : g.pos.endsWith('right') ? 'right' : 'left';
    const x = alignX(al, region.x + e.pad, maxW, lw);
    if (g.hasLogo) {
      if (img) { const s = imgSize(img); const k = Math.min(logoW / s.w, h / s.h); ctx.drawImage(img, x + (logoW - s.w * k) / 2, y + (h - s.h * k) / 2, s.w * k, s.h * k); }
      else {
        rr(ctx, x, y, h, h, h * 0.28); ctx.fillStyle = e.p.accent; ctx.fill();
        ctx.fillStyle = onColor(e.p.accent); ctx.font = font(800, h * 0.52, e.headFont); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText((name || 'B').charAt(0).toUpperCase(), x + h / 2, y + h / 2 + h * 0.03);
      }
    }
    if (tw) {
      ctx.fillStyle = e.p.text; ctx.font = font(700, ts, e.headFont); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(name, x + logoW + gap, y + h / 2 + ts * 0.04);
    }
    ctx.restore();
  }
  function footerGeom(e, region) {
    let type = e.T.footer || 'line';
    if (type === 'stack' && region.w >= region.h * 0.9) type = 'line';
    if (type === 'none') return null;
    const list = contactList(e);
    const note = e.show('footer') ? String(e.f.footer || '').trim() : '';
    if (!list.length && !note) return null;
    const bar = type === 'bar' || type === 'bar-dark';
    const al = type === 'stack' ? (e.align === 'center' ? 'center' : 'left') : (bar || type === 'pills' || e.align === 'center' ? 'center' : e.align);
    const flow = list.length ? (type === 'minimal'
      ? FlowB(e, [{ icon: 'globe', text: list.map(i => i.text).join('   •   ') }], { noIcons: true, align: al, g: 0, color: e.p.muted })
      : type === 'stack' ? null
        : FlowB(e, list, { pills: type === 'pills', align: al, g: 0, color: bar ? (type === 'bar' ? onColor(e.p.accent) : '#FFFFFF') : e.p.text, iconColor: bar ? (type === 'bar' ? onColor(e.p.accent) : e.p.accent) : e.p.accent })) : null;
    const w = region.w - e.pad * 2;
    let items = [];
    if (type === 'stack') items = list.map(it => FlowB(e, [it], { align: al, g: 0.012 }));
    else if (flow) items.push(flow);
    if (note) items.push(TextB(e, note, { fam: e.bodyFont, weight: 400, size: 0.021 * e.u * e.s.bodyScale, color: bar ? (type === 'bar' ? rgba(onColor(e.p.accent), 0.85) : 'rgba(255,255,255,0.75)') : e.p.muted, align: al, lh: 1.35, g: 0.014 }));
    items = items.filter(Boolean);
    const f = fit(e, items, w, e.u * 0.3, 0.4);
    const padY = bar ? e.u * 0.032 : 0;
    return { type, bar, items, f, h: f.total + padY * 2, padY, w };
  }
  function drawFooter(e, region, g) {
    const ctx = e.ctx;
    const y = region.y + region.h - (g.bar ? g.h : e.pad + g.h);
    if (g.bar) {
      ctx.save(); ctx.fillStyle = g.type === 'bar' ? e.p.accent : 'rgba(0,0,0,0.35)'; ctx.fillRect(region.x, y, region.w, g.h); ctx.restore();
    } else if (g.type === 'line') {
      ctx.save(); ctx.fillStyle = rgba(e.p.text, 0.2); ctx.fillRect(region.x + e.pad, y - e.u * 0.025, region.w - e.pad * 2, Math.max(1, e.u * 0.002)); ctx.restore();
    }
    drawItems(e, g.items, g.f, region.x + e.pad, y + g.padY, g.w);
    return y;
  }

  /* ---------------- Public render ---------------- */
  function makeEnv(ctx, design, T, res, k) {
    const st = design.style;
    const W = design.width, H = design.height;
    // Type unit: the short side, boosted a little for elongated formats so landscape and story posters fill out.
    const ratio = Math.max(W, H) / Math.min(W, H);
    const u = Math.min(W, H) * Math.min(1.25, 1 + (ratio - 1) * 0.3);
    const brand = res.brand || null;
    const p = {
      bg1: st.bg1, bg2: st.bg2 || st.bg1, bg3: st.bg3 || st.bg2 || st.bg1,
      text: st.text, muted: st.muted || mix(st.text, st.bg1, 0.35),
      accent: st.accent, accent2: st.accent2 || st.accent
    };
    if (st.useBrandColors && brand) { if (brand.primary) p.accent = brand.primary; if (brand.secondary) p.accent2 = brand.secondary; }
    const f = design.fields || {};
    const hidden = design.hidden || {};
    const img = res.images || {};
    const e = {
      ctx, W, H, u, v: Math.min(W, H), k, T, s: st, p, f, img, seed: st.seed || 1,
      dark: lum(p.bg1) < 0.35,
      pad: (st.padding == null ? 0.07 : st.padding) * u,
      headFont: st.useBrandFont && brand && brand.font ? brand.font : st.headFont,
      bodyFont: st.bodyFont,
      transparent: !!(st.transparent && T.transparentOk && !res.forceOpaque),
      show(key) {
        if (hidden[key]) return false;
        if (key === 'logo' || key === 'image' || key === 'decor' || key === 'bgImage') return true;
        const v = f[key];
        return Array.isArray(v) ? v.some(x => String(x).trim()) : !!String(v == null ? '' : v).trim();
      }
    };
    const al = st.align && st.align !== 'auto' ? st.align : (T.layout.align || 'left');
    e.align = al;
    e.rad = h => (st.radius == null ? 1 : st.radius) * h / 2;
    e.crad = m => (st.radius == null ? 1 : st.radius) * u * 0.045 * (m || 1);
    return e;
  }

  function render(canvas, design, T, res, opts) {
    opts = opts || {};
    const k = opts.scale || 1;
    const W = design.width, H = design.height;
    const cw = Math.max(1, Math.round(W * k)), ch = Math.max(1, Math.round(H * k));
    if (canvas.width !== cw) canvas.width = cw;
    if (canvas.height !== ch) canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    const e = makeEnv(ctx, design, T, res || {}, k);
    const L = LAYOUTS[T.layout.type] || LAYOUTS.hero;
    const o = T.layout;
    drawBackground(e);
    if (e.show('decor') && !o.decorFront) drawDecor(e);
    if (L.back) { ctx.save(); L.back(e, o); ctx.restore(); }
    if (e.show('decor') && o.decorFront) drawDecor(e);
    const region = (L.region && L.region(e, o)) || { x: 0, y: 0, w: W, h: H };
    const hg = headerGeom(e);
    const fg = footerGeom(e, region);
    let top = region.y + e.pad, bottom = region.y + region.h - e.pad;
    if (hg && hg.top) top += hg.h + e.v * 0.045;
    if (fg) bottom = region.y + region.h - (fg.bar ? fg.h + e.u * 0.045 : e.pad + fg.h + e.u * 0.05);
    let logoBottomY = null;
    if (hg && !hg.top) { logoBottomY = bottom - hg.h; bottom = logoBottomY - e.u * 0.035; }
    const box = { x: region.x + e.pad, y: top, w: region.w - e.pad * 2, h: Math.max(10, bottom - top) };
    ctx.save(); L.draw(e, box, o, region); ctx.restore();
    if (fg) { ctx.save(); drawFooter(e, region, fg); ctx.restore(); }
    if (hg) { ctx.save(); drawHeader(e, region, hg, hg.top ? region.y + e.pad * 0.85 : logoBottomY); ctx.restore(); }
    return canvas;
  }

  /* Fonts actually needed for a design, for preloading before export. */
  function fontsFor(design, T, brand) {
    const st = design.style;
    const head = st.useBrandFont && brand && brand.font ? brand.font : st.headFont;
    const set = new Map();
    const add = (fam, w) => { if (FONTS[fam]) set.set(fam + '|' + w, [fam, w]); };
    add(head, st.weight || 700); add(head, 800); add(head, 900); add(head, 700); add(head, 500);
    add(st.bodyFont, 400); add(st.bodyFont, 500); add(st.bodyFont, 600); add(st.bodyFont, 700);
    if (/script/.test(JSON.stringify(T.layout)) || T.layout.type === 'invite') add(SCRIPT_FONT, 400);
    if (['testimonial', 'quote'].includes(T.layout.type)) add(QUOTE_FONT, 900);
    return [...set.values()];
  }

  root.PosterRenderer = { render, fontsFor, font, FONTS, ICONS, onColor, mix, lum, rgba, LAYOUTS, DECOR };
})(typeof window !== 'undefined' ? window : globalThis);
