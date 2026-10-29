/* Infinitia Hub Poster Studio — application UI */
(function () {
  'use strict';
  const R = window.TemplateRegistry;
  const PR = window.PosterRenderer;
  const { SIZES, TEMPLATES, CATEGORIES, FAMILIES, TONES } = R;

  /* ================= Utilities ================= */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const clone = o => JSON.parse(JSON.stringify(o));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const slug = s => String(s || 'poster').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'poster';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const C = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const UI_ICONS = {
    search: [C(11, 11, 8), 'm21 21-4.3-4.3'],
    folder: ['M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'],
    palette: [C(13.5, 6.5, 0.6), C(17.5, 10.5, 0.6), C(8.5, 7.5, 0.6), C(6.5, 12.5, 0.6), 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z'],
    upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm17 8-5-5-5 5', 'M12 3v12'],
    download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
    plus: ['M5 12h14', 'M12 5v14'],
    back: ['m12 19-7-7 7-7', 'M19 12H5'],
    edit: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'],
    undo: ['M3 7v6h6', 'M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13'],
    redo: ['M21 7v6h-6', 'M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7'],
    reset: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
    copy: ['M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z', 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'],
    save: ['M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', 'M17 21v-8H7v8', 'M7 3v5h8'],
    eye: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', C(12, 12, 3)],
    eyeOff: ['M9.88 9.88a3 3 0 1 0 4.24 4.24', 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68', 'M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61', 'm2 2 20 20'],
    image: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', C(9, 9, 2), 'm21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21'],
    trash: ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'],
    fileIn: ['M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', 'M14 2v6h6', 'M12 12v6', 'm9 15 3 3 3-3'],
    fileOut: ['M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', 'M14 2v6h6', 'M12 18v-6', 'm9 15 3-3 3 3'],
    shuffle: ['M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22', 'm18 2 4 4-4 4', 'M2 6h1.9c1.5 0 2.9.9 3.6 2.2', 'M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8', 'm18 14 4 4-4 4'],
    layout: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M3 9h18', 'M9 21V9'],
    link: ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71']
  };
  function svg(name) {
    const paths = UI_ICONS[name] || PR.ICONS[name] || PR.ICONS.check;
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths.map(d => `<path d="${d}"/>`).join('')}</svg>`;
  }
  function hydrateIcons(root) { $$('[data-icon]', root).forEach(n => { if (!n.firstChild) n.innerHTML = svg(n.dataset.icon); }); }
  function h(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach(c => { if (c == null || c === false) return; n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  const ico = name => h('span', { class: 'ico', html: svg(name) });

  function toast(msg, type, action) {
    const box = $('#toasts');
    const t = h('div', { class: 'toast ' + (type || ''), role: type === 'error' ? 'alert' : 'status' }, h('span', { class: 'msg' }, msg));
    if (action) t.appendChild(h('button', { class: 'btn', type: 'button', onclick: () => { action.fn(); t.remove(); } }, action.label));
    t.appendChild(h('button', { class: 'x', type: 'button', 'aria-label': 'Dismiss', onclick: () => t.remove(), html: svg('x') }));
    box.appendChild(t);
    setTimeout(() => t.remove(), type === 'error' || action ? 9000 : 4200);
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: name, style: { display: 'none' } });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  /* ================= Local storage ================= */
  const KEYS = { designs: 'ihps.designs.v1', brands: 'ihps.brands.v1', settings: 'ihps.settings.v1', favs: 'ihps.favs.v1', opens: 'ihps.opens.v1' };
  let storageOK = true;
  try { localStorage.setItem('ihps.test', '1'); localStorage.removeItem('ihps.test'); } catch (e) { storageOK = false; }
  const memStore = {};
  const Store = {
    get(k, def) {
      try { const v = storageOK ? localStorage.getItem(k) : memStore[k]; return v == null ? def : JSON.parse(v); } catch (e) { return def; }
    },
    set(k, v) {
      const s = JSON.stringify(v);
      if (!storageOK) { memStore[k] = s; return { ok: false, reason: 'unavailable' }; }
      try { localStorage.setItem(k, s); return { ok: true }; }
      catch (e) { return { ok: false, reason: 'full' }; }
    }
  };

  /* ================= Image assets (IndexedDB, blobs) =================
   * Images are stored once as compressed blobs in IndexedDB and referenced by id from designs,
   * which keeps localStorage small. Falls back to memory if IndexedDB is unavailable. */
  const Assets = (function () {
    let dbp = null;
    const mem = new Map();
    const cache = new Map(); // id -> { url, img: Promise<HTMLImageElement> , el }
    let idbOK = true;
    function db() {
      if (dbp) return dbp;
      dbp = new Promise((res, rej) => {
        if (!window.indexedDB) { idbOK = false; rej(new Error('no idb')); return; }
        const rq = indexedDB.open('ihps-assets', 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore('assets', { keyPath: 'id' });
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => { idbOK = false; rej(rq.error); };
      });
      dbp.catch(() => { idbOK = false; });
      return dbp;
    }
    function tx(mode, fn) {
      return db().then(d => new Promise((res, rej) => {
        const t = d.transaction('assets', mode); const st = t.objectStore('assets');
        const r = fn(st); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
      }));
    }
    async function put(blob, meta) {
      const id = 'a_' + uid();
      const rec = { id, blob, type: blob.type, w: meta && meta.w, h: meta && meta.h, created: Date.now() };
      try { await tx('readwrite', st => st.put(rec)); } catch (e) { mem.set(id, rec); }
      return id;
    }
    async function get(id) {
      if (!id) return null;
      if (mem.has(id)) return mem.get(id);
      try { return await tx('readonly', st => st.get(id)) || null; } catch (e) { return null; }
    }
    function image(id) {
      if (!id) return Promise.resolve(null);
      if (cache.has(id)) return cache.get(id).img;
      const entry = {};
      entry.img = get(id).then(rec => {
        if (!rec || !rec.blob) return null;
        entry.url = URL.createObjectURL(rec.blob);
        return new Promise(res => {
          const im = new Image();
          im.onload = () => { entry.el = im; res(im); };
          im.onerror = () => res(null);
          im.src = entry.url;
        });
      });
      cache.set(id, entry);
      return entry.img;
    }
    function loaded(id) { const e = id && cache.get(id); return e && e.el || null; }
    function url(id) { const e = id && cache.get(id); return e && e.url || null; }
    function release(id) { const e = cache.get(id); if (e && e.url) URL.revokeObjectURL(e.url); cache.delete(id); }
    async function del(id) {
      release(id); mem.delete(id);
      try { await tx('readwrite', st => st.delete(id)); } catch (e) { /* ignore */ }
    }
    async function keys() { try { return await tx('readonly', st => st.getAllKeys()) || []; } catch (e) { return [...mem.keys()]; } }
    return { put, get, image, loaded, url, del, keys, release, get idbOK() { return idbOK; } };
  })();

  function loadImageFromURL(url) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('Could not read the image')); im.src = url; });
  }
  function canvasToBlob(c, type, q) {
    return new Promise((res, rej) => {
      try { c.toBlob(b => b ? res(b) : rej(new Error('The browser could not create the image')), type, q); }
      catch (e) { rej(e); }
    });
  }
  /* Downscale and compress an uploaded image; logos stay PNG to keep transparency. */
  async function processImage(file, kind) {
    if (!/^image\//.test(file.type)) throw new Error('Please choose an image file (PNG, JPG, WebP or SVG).');
    const maxSide = kind === 'logo' ? 1200 : 2600;
    const url = URL.createObjectURL(file);
    try {
      const im = await loadImageFromURL(url);
      let w = im.naturalWidth, hgt = im.naturalHeight;
      const isSvg = file.type === 'image/svg+xml';
      if (!w || !hgt) { w = 1024; hgt = 1024; }
      const k = Math.min(1, maxSide / Math.max(w, hgt), isSvg ? 1024 / Math.max(w, hgt) * 1.5 : 1);
      const keepOriginal = !isSvg && k === 1 && file.size < 1.5e6 && /png|jpeg|webp/.test(file.type);
      if (keepOriginal) return { blob: file, w, h: hgt };
      const tw = Math.max(1, Math.round(w * (isSvg ? Math.min(k, 1024 / Math.max(w, hgt)) * (Math.max(w, hgt) < 512 ? 2 : 1) : k)));
      const th = Math.max(1, Math.round(hgt * tw / w));
      const c = document.createElement('canvas'); c.width = tw; c.height = th;
      c.getContext('2d').drawImage(im, 0, 0, tw, th);
      const png = kind === 'logo' || file.type === 'image/png' && file.size < 4e6 || isSvg;
      const blob = await canvasToBlob(c, png ? 'image/png' : 'image/jpeg', 0.9);
      c.width = c.height = 0;
      return { blob, w: tw, h: th };
    } finally { URL.revokeObjectURL(url); }
  }
  async function fetchImageAsFile(url) {
    let resp;
    try { resp = await fetch(url, { mode: 'cors' }); }
    catch (e) { throw new Error('This image server blocks cross-origin use, so it cannot be exported. Download the image and upload it instead.'); }
    if (!resp.ok) throw new Error('Could not download that image (HTTP ' + resp.status + ').');
    const blob = await resp.blob();
    if (!/^image\//.test(blob.type)) throw new Error('That link is not an image.');
    return new File([blob], 'remote', { type: blob.type });
  }
  function pickFile(input) {
    return new Promise(res => {
      input.value = '';
      const done = () => { input.removeEventListener('change', done); res(input.files && input.files[0] || null); };
      input.addEventListener('change', done);
      input.click();
    });
  }
  const blobToDataURL = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
  const dataURLToBlob = async d => (await fetch(d)).blob();

  /* ================= Fonts ================= */
  const fontPromises = new Map();
  function loadFonts(list, timeout) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const ps = list.map(([fam, w]) => {
      const key = fam + '|' + w;
      if (!fontPromises.has(key)) fontPromises.set(key, document.fonts.load(`${w} 40px "${fam}"`, 'Aa₹').catch(() => []));
      return fontPromises.get(key);
    });
    return Promise.race([Promise.all(ps), sleep(timeout || 3000)]);
  }
  function fontLoaded(fam) {
    if (!document.fonts) return true;
    for (const f of document.fonts) if (f.family.replace(/["']/g, '') === fam && f.status === 'loaded') return true;
    return false;
  }

  /* ================= Brands & settings ================= */
  const DEFAULT_BRANDS = [
    { id: 'infinitia', name: 'Infinitia Hub', logo: null, website: '', whatsapp: '', phone: '', primary: '#6D28D9', secondary: '#2563EB', font: 'Poppins' },
    { id: 'aistudio', name: 'AI Studio Craft', logo: null, website: '', whatsapp: '', phone: '', primary: '#7C3AED', secondary: '#06B6D4', font: 'Outfit' }
  ];
  const S = {
    brands: Store.get(KEYS.brands, null) || clone(DEFAULT_BRANDS),
    settings: Store.get(KEYS.settings, { defaultBrand: 'infinitia' }),
    designs: Store.get(KEYS.designs, []),
    favs: new Set(Store.get(KEYS.favs, [])),
    opens: Store.get(KEYS.opens, {}),
    filters: { q: '', cat: 'all', format: 'all', tone: 'all', style: 'all', brand: 'all', sort: 'featured', fav: false },
    brandVersion: 1,
    view: 'gallery'
  };
  if (!Array.isArray(S.designs)) S.designs = [];
  const brandById = id => S.brands.find(b => b.id === id) || S.brands.find(b => b.id === S.settings.defaultBrand) || S.brands[0];
  const brandForTemplate = T => (T.brand !== 'Any' && S.brands.find(b => b.name === T.brand)) || brandById(S.settings.defaultBrand);
  function saveBrands() {
    const r = Store.set(KEYS.brands, S.brands); Store.set(KEYS.settings, S.settings);
    S.brandVersion++;
    thumbs.clear();
    $('#appBrand').textContent = brandById(S.settings.defaultBrand).name || 'Infinitia Hub';
    if (!r.ok) storageWarning(r.reason);
    return r.ok;
  }
  function storageWarning(reason, design) {
    const msg = reason === 'unavailable'
      ? 'Browser storage is unavailable (private mode?). Changes last until you close this tab — export your project to keep it.'
      : 'Browser storage is full. Delete old designs or export this project as JSON.';
    toast(msg, 'error', design ? { label: 'Export JSON', fn: () => exportProject(design) } : null);
  }

  /* ================= Design model ================= */
  function newDesign(T, brand, sizeKey) {
    brand = brand || brandForTemplate(T);
    const key = sizeKey || T.size;
    const sz = SIZES[key] || SIZES[T.size];
    return {
      id: uid(), name: T.name, templateId: T.id, brandId: brand.id,
      width: sz.w, height: sz.h, sizeKey: key,
      fields: R.defaultFields(T, brand), hidden: R.defaultHidden(T), style: R.defaultStyle(T),
      assets: { logo: null, main: null, bg: null },
      createdAt: Date.now(), updatedAt: Date.now()
    };
  }
  const templateOf = d => R.byId(d.templateId) || TEMPLATES[0];
  const effectiveLogo = d => d.assets.logo || (brandById(d.brandId) || {}).logo || null;
  function resources(d) {
    return {
      brand: brandById(d.brandId),
      images: { logo: Assets.loaded(effectiveLogo(d)), main: Assets.loaded(d.assets.main), bg: Assets.loaded(d.assets.bg) }
    };
  }
  function loadDesignImages(d) { return Promise.all([Assets.image(effectiveLogo(d)), Assets.image(d.assets.main), Assets.image(d.assets.bg)]); }
  function designFonts(d) {
    const T = templateOf(d), b = brandById(d.brandId);
    const list = PR.fontsFor(d, T, b);
    const head = d.style.useBrandFont && b && b.font ? b.font : d.style.headFont;
    if (['testimonial', 'quote', 'editorial'].includes(T.layout.type)) list.push([head, 'italic 500'], [head, 'italic 600'], [head, 'italic 700']);
    return list;
  }

  /* ================= Thumbnails ================= */
  const thumbs = (function () {
    const cache = new Map();
    const queue = [];
    let running = false;
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); enqueue(en.target); } });
    }, { rootMargin: '300px' }) : null;
    function key(T) { return T.id + ':' + S.brandVersion; }
    function enqueue(holder) { queue.push(holder); run(); }
    async function run() {
      if (running) return; running = true;
      while (queue.length) {
        const holder = queue.shift();
        if (!holder.isConnected) continue;
        try { await fill(holder); } catch (e) { console.error(e); }
        await sleep(0);
      }
      running = false;
    }
    async function render(T) {
      const k = key(T);
      if (cache.has(k)) return cache.get(k);
      const d = newDesign(T);
      await Promise.all([loadFonts(designFonts(d), 2500), loadDesignImages(d)]);
      const c = document.createElement('canvas');
      const scale = Math.min(2, (window.devicePixelRatio || 1)) * 300 / Math.max(d.width, d.height);
      PR.render(c, d, T, resources(d), { scale });
      cache.set(k, c);
      return c;
    }
    function copyOf(src) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); return c; }
    async function fill(holder) {
      const T = R.byId(holder.dataset.tpl);
      const c = await render(T);
      if (!holder.isConnected) return;
      const sk = holder.querySelector('.skeleton'); if (sk) sk.remove();
      const old = holder.querySelector('canvas'); if (old) old.remove();
      const node = c.parentNode ? copyOf(c) : c;
      node.setAttribute('role', 'img'); node.setAttribute('aria-label', 'Preview of ' + T.name);
      holder.prepend(node);
    }
    function attach(holder, T) {
      holder.dataset.tpl = T.id;
      const c = cache.get(key(T));
      if (c) { const node = c.parentNode ? copyOf(c) : c; node.setAttribute('role', 'img'); node.setAttribute('aria-label', 'Preview of ' + T.name); holder.prepend(node); return; }
      holder.prepend(h('div', { class: 'skeleton' }));
      if (io) io.observe(holder); else enqueue(holder);
    }
    return { attach, render, clear: () => cache.clear() };
  })();

  /* ================= Views ================= */
  function showView(v) {
    S.view = v;
    $('#galleryView').hidden = v !== 'gallery';
    $('#designsView').hidden = v !== 'designs';
    $('#editorView').hidden = v !== 'editor';
    document.body.dataset.view = v;
    window.scrollTo(0, 0);
    if (v === 'gallery') renderGallery();
    if (v === 'designs') renderDesigns();
  }
  async function leaveEditor(next) {
    if (S.view === 'editor' && ED.dirty) {
      const choice = await choiceModal('Unsaved changes', 'Save this design before leaving the editor?', [
        { label: 'Discard', value: 'discard', cls: 'danger' }, { label: 'Save & leave', value: 'save', cls: 'primary' }]);
      if (!choice) return false;
      if (choice === 'save' && !saveCurrent()) return false;
    }
    if (S.view === 'editor') ED.close();
    showView(next);
    return true;
  }

  /* ================= Gallery ================= */
  function formatOf(T) { return SIZES[T.size].format; }
  function sizeLabel(T) { const s = SIZES[T.size]; return `${s.w}×${s.h}`; }
  function filtered(ignoreCat) {
    const f = S.filters;
    const q = f.q.trim().toLowerCase();
    const terms = q ? q.split(/\s+/) : [];
    let list = TEMPLATES.filter(T => {
      if (!ignoreCat && f.cat !== 'all' && T.category !== f.cat) return false;
      if (f.format !== 'all' && formatOf(T) !== f.format) return false;
      if (f.tone !== 'all' && T.tone !== f.tone) return false;
      if (f.style !== 'all' && T.family !== f.style) return false;
      if (f.brand !== 'all' && T.brand !== f.brand) return false;
      if (f.fav && !S.favs.has(T.id)) return false;
      if (terms.length) {
        const hay = [T.name, T.category, FAMILIES[T.family], T.brand, TONES[T.tone], SIZES[T.size].label, T.text.headline, T.text.tag, ...T.keywords].join(' ').toLowerCase();
        if (!terms.every(t => hay.includes(t))) return false;
      }
      return true;
    });
    const pop = T => T.popularity + (S.opens[T.id] || 0) * 5;
    if (f.sort === 'popular') list.sort((a, b) => pop(b) - pop(a));
    else if (f.sort === 'newest') list.sort((a, b) => b.order - a.order);
    else if (f.sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }
  function renderCats() {
    const ul = $('#catList'); ul.innerHTML = '';
    const base = filtered(true);
    const count = c => c === 'all' ? base.length : base.filter(T => T.category === c).length;
    ['all', ...CATEGORIES].forEach(c => {
      ul.appendChild(h('li', null, h('button', {
        class: 'cat-btn', type: 'button', 'aria-current': S.filters.cat === c ? 'true' : 'false',
        onclick: () => { S.filters.cat = c; renderGallery(); }
      }, h('span', null, c === 'all' ? 'All Templates' : c), h('span', { class: 'n' }, String(count(c))))));
    });
  }
  function templateCard(T, opts) {
    opts = opts || {};
    const fav = S.favs.has(T.id);
    const thumb = h('button', { class: 'thumb', type: 'button', 'aria-label': (opts.pick ? 'Use ' : 'Edit ') + T.name, onclick: () => opts.onPick ? opts.onPick(T) : openTemplate(T) },
      h('span', { class: 'badge-fmt' }, sizeLabel(T)));
    const card = h('article', { class: 'card', role: 'listitem' },
      h('div', { style: { position: 'relative' } }, thumb,
        opts.pick ? null : h('button', {
          class: 'fav', type: 'button', 'aria-pressed': fav ? 'true' : 'false', 'aria-label': (fav ? 'Remove from' : 'Add to') + ' favorites', html: svg('heart'),
          onclick: e => { toggleFav(T.id); const on = S.favs.has(T.id); e.currentTarget.setAttribute('aria-pressed', on); e.currentTarget.setAttribute('aria-label', (on ? 'Remove from' : 'Add to') + ' favorites'); if (S.filters.fav) renderGallery(); }
        })),
      h('div', { class: 'card-body' },
        h('div', { class: 'card-title' }, T.name),
        h('div', { class: 'card-meta' }, h('span', null, T.category), opts.pick ? null : h('span', { class: 'tagchip' }, FAMILIES[T.family])),
        opts.pick ? null : h('div', { class: 'card-actions' },
          h('button', { class: 'btn small primary', type: 'button', onclick: () => openTemplate(T) }, ico('edit'), h('span', { class: 'lbl' }, 'Edit Design')))));
    thumbs.attach(thumb, T);
    return card;
  }
  function toggleFav(id) {
    S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id);
    Store.set(KEYS.favs, [...S.favs]);
  }
  function renderGallery() {
    renderCats();
    const list = filtered(false);
    const grid = $('#grid'); grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    list.forEach(T => frag.appendChild(templateCard(T)));
    grid.appendChild(frag);
    $('#emptyGallery').hidden = list.length > 0;
    const catName = S.filters.cat === 'all' ? '' : ` in ${S.filters.cat}`;
    $('#countPill').textContent = list.length === TEMPLATES.length ? `${TEMPLATES.length} templates` : `${list.length} of ${TEMPLATES.length} templates${catName}`;
  }
  function resetFilters() {
    Object.assign(S.filters, { q: '', cat: 'all', format: 'all', tone: 'all', style: 'all', brand: 'all', sort: 'featured', fav: false });
    $('#searchInput').value = ''; $('#fFormat').value = 'all'; $('#fTone').value = 'all'; $('#fStyle').value = 'all'; $('#fBrand').value = 'all'; $('#fSort').value = 'featured';
    $('#fFav').setAttribute('aria-pressed', 'false');
    renderGallery();
  }
  function initGallery() {
    const tone = $('#fTone'); tone.appendChild(h('option', { value: 'all' }, 'All colours'));
    Object.entries(TONES).forEach(([k, v]) => tone.appendChild(h('option', { value: k }, v)));
    const st = $('#fStyle'); st.appendChild(h('option', { value: 'all' }, 'All styles'));
    Object.entries(FAMILIES).forEach(([k, v]) => st.appendChild(h('option', { value: k }, v)));
    [['#fFormat', 'format'], ['#fTone', 'tone'], ['#fStyle', 'style'], ['#fBrand', 'brand'], ['#fSort', 'sort']].forEach(([sel, k]) =>
      $(sel).addEventListener('change', e => { S.filters[k] = e.target.value; renderGallery(); }));
    $('#fFav').addEventListener('click', e => { S.filters.fav = !S.filters.fav; e.currentTarget.setAttribute('aria-pressed', S.filters.fav); renderGallery(); });
    $('#fReset').addEventListener('click', resetFilters);
    $('#emptyReset').addEventListener('click', resetFilters);
    let tm;
    $('#searchInput').addEventListener('input', e => {
      clearTimeout(tm);
      tm = setTimeout(async () => {
        S.filters.q = e.target.value;
        if (S.view !== 'gallery') { if (!(await leaveEditor('gallery'))) return; }
        else renderGallery();
      }, 120);
    });
  }
  function openTemplate(T) {
    S.opens[T.id] = (S.opens[T.id] || 0) + 1; Store.set(KEYS.opens, S.opens);
    ED.open(newDesign(T), { fresh: true });
  }

  /* ================= My Designs ================= */
  function persistDesigns(design) {
    const r = Store.set(KEYS.designs, S.designs);
    if (!r.ok) storageWarning(r.reason, design);
    return r.ok;
  }
  async function renderDesigns() {
    const grid = $('#designGrid'); grid.innerHTML = '';
    const list = S.designs.slice().sort((a, b) => b.updatedAt - a.updatedAt);
    $('#emptyDesigns').hidden = list.length > 0;
    let bytes = 0; try { bytes = (localStorage.getItem(KEYS.designs) || '').length; } catch (e) { /* ignore */ }
    let info = `${list.length} saved design${list.length === 1 ? '' : 's'} · ${(bytes / 1024).toFixed(0)} KB of text in browser storage`;
    if (!storageOK) info = 'Browser storage is unavailable — designs will be lost when you close this tab. Export them as JSON.';
    $('#storageInfo').textContent = info;
    list.forEach(d => {
      const T = templateOf(d);
      const thumb = h('button', { class: 'thumb', type: 'button', 'aria-label': 'Open ' + d.name, onclick: () => ED.open(clone(d)) },
        h('div', { class: 'skeleton' }), h('span', { class: 'badge-fmt' }, `${d.width}×${d.height}`));
      const card = h('article', { class: 'card', role: 'listitem' }, thumb,
        h('div', { class: 'card-body' },
          h('div', { class: 'card-title' }, d.name),
          h('div', { class: 'card-meta' }, h('span', null, 'Edited ' + new Date(d.updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }))),
          h('div', { class: 'card-actions' },
            h('button', { class: 'btn small primary', type: 'button', onclick: () => ED.open(clone(d)) }, ico('edit'), h('span', { class: 'lbl' }, 'Open')),
            h('button', { class: 'btn small', type: 'button', title: 'Rename', 'aria-label': 'Rename ' + d.name, onclick: () => renameSaved(d) }, ico('edit')),
            h('button', { class: 'btn small', type: 'button', title: 'Duplicate', 'aria-label': 'Duplicate ' + d.name, onclick: () => duplicateSaved(d) }, ico('copy')),
            h('button', { class: 'btn small', type: 'button', title: 'Export JSON', 'aria-label': 'Export ' + d.name + ' as JSON', onclick: () => exportProject(d) }, ico('fileOut')),
            h('button', { class: 'btn small danger', type: 'button', title: 'Delete', 'aria-label': 'Delete ' + d.name, onclick: () => deleteSaved(d) }, ico('trash')))));
      grid.appendChild(card);
      (async () => {
        await Promise.all([loadFonts(designFonts(d), 2500), loadDesignImages(d)]);
        if (!thumb.isConnected) return;
        const c = document.createElement('canvas');
        PR.render(c, d, T, resources(d), { scale: Math.min(2, window.devicePixelRatio || 1) * 300 / Math.max(d.width, d.height) });
        const sk = thumb.querySelector('.skeleton'); if (sk) sk.remove();
        thumb.prepend(c);
      })();
    });
  }
  async function renameSaved(d) {
    const name = await promptModal('Rename design', 'Design name', d.name);
    if (!name) return;
    const x = S.designs.find(z => z.id === d.id); x.name = name; x.updatedAt = Date.now();
    persistDesigns(x); renderDesigns(); toast('Design renamed', 'success');
  }
  function duplicateSaved(d) {
    const copy = clone(d); copy.id = uid(); copy.name = d.name + ' (copy)'; copy.createdAt = copy.updatedAt = Date.now();
    S.designs.push(copy);
    if (persistDesigns(copy)) toast('Design duplicated', 'success');
    renderDesigns();
  }
  async function deleteSaved(d) {
    if (!(await confirmModal('Delete design?', `“${d.name}” will be removed from this browser. This cannot be undone.`, 'Delete', true))) return;
    S.designs = S.designs.filter(z => z.id !== d.id);
    persistDesigns();
    renderDesigns(); toast('Design deleted');
    gcAssets();
  }
  async function gcAssets() {
    const used = new Set();
    S.designs.forEach(d => Object.values(d.assets || {}).forEach(id => id && used.add(id)));
    S.brands.forEach(b => b.logo && used.add(b.logo));
    if (ED.design) { Object.values(ED.design.assets).forEach(id => id && used.add(id)); ED.history.forEach(s => { try { Object.values(JSON.parse(s).assets).forEach(id => id && used.add(id)); } catch (e) { /* ignore */ } }); }
    const all = await Assets.keys();
    for (const id of all) if (!used.has(id)) await Assets.del(id);
  }

  /* ================= Project JSON import/export ================= */
  async function exportProject(d) {
    try {
      const assets = {};
      const ids = { logo: effectiveLogo(d), main: d.assets.main, bg: d.assets.bg };
      for (const [k, id] of Object.entries(ids)) {
        if (!id) continue;
        const rec = await Assets.get(id);
        if (rec && rec.blob) assets[k] = await blobToDataURL(rec.blob);
      }
      const b = brandById(d.brandId);
      const file = {
        app: 'infinitia-hub-poster-studio', version: 1, exportedAt: new Date().toISOString(),
        design: { ...clone(d), assets: { logo: null, main: null, bg: null } }, assets,
        brand: { name: b.name, website: b.website, whatsapp: b.whatsapp, phone: b.phone, primary: b.primary, secondary: b.secondary, font: b.font }
      };
      downloadBlob(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }), `${slug(d.name)}.poster.json`);
      toast('Project exported as JSON', 'success');
    } catch (e) { console.error(e); toast('Could not export the project: ' + e.message, 'error'); }
  }
  async function importProject() {
    const file = await pickFile($('#fileJson'));
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || data.app !== 'infinitia-hub-poster-studio' || !data.design || !data.design.fields || !data.design.style) throw new Error('This file is not a Poster Studio project.');
      const d = data.design;
      if (!R.byId(d.templateId)) d.templateId = TEMPLATES[0].id;
      d.width = Math.max(100, Math.min(6000, +d.width || 1080)); d.height = Math.max(100, Math.min(6000, +d.height || 1350));
      d.hidden = d.hidden || {}; d.fields.features = Array.isArray(d.fields.features) ? d.fields.features.map(String) : [];
      d.assets = { logo: null, main: null, bg: null };
      for (const k of ['logo', 'main', 'bg']) {
        const src = data.assets && data.assets[k];
        if (typeof src === 'string' && src.startsWith('data:image/')) {
          const blob = await dataURLToBlob(src);
          d.assets[k] = await Assets.put(blob, {});
        }
      }
      if (!S.brands.some(b => b.id === d.brandId)) d.brandId = S.settings.defaultBrand;
      d.id = uid(); d.name = (d.name || 'Imported poster') + ' (imported)'; d.createdAt = d.updatedAt = Date.now();
      S.designs.push(d);
      persistDesigns(d);
      toast(`Imported “${d.name}”`, 'success', { label: 'Open', fn: () => ED.open(clone(d)) });
      if (S.view === 'designs') renderDesigns();
    } catch (e) { console.error(e); toast('Import failed: ' + (e instanceof SyntaxError ? 'the file is not valid JSON.' : e.message), 'error'); }
  }

  /* ================= Modal helpers ================= */
  const modal = $('#modal');
  let modalResolve = null;
  function openModal(title, body, foot, opts) {
    opts = opts || {};
    $('#modalTitle').textContent = title;
    const mb = $('#modalBody'); mb.innerHTML = ''; mb.appendChild(body);
    const mf = $('#modalFoot'); mf.innerHTML = ''; (foot || []).forEach(b => mf.appendChild(b));
    modal.classList.toggle('wide', !!opts.wide);
    hydrateIcons(modal);
    if (!modal.open) modal.showModal();
    return new Promise(res => { modalResolve = res; });
  }
  modal.addEventListener('close', () => { const r = modalResolve; modalResolve = null; if (r) r(modal.returnValue === 'cancel' ? null : modal.returnValue || null); modal.returnValue = ''; });
  modal.addEventListener('click', e => { if (e.target === modal) modal.close('cancel'); });
  function closeModal(value) { modal.close(value == null ? 'cancel' : value); }
  const mbtn = (label, value, cls) => h('button', { class: 'btn ' + (cls || ''), value, type: 'submit', formnovalidate: true }, label);
  function confirmModal(title, msg, ok, danger) {
    return openModal(title, h('p', null, msg), [mbtn('Cancel', 'cancel'), mbtn(ok || 'OK', 'ok', danger ? 'danger solid' : 'primary')]).then(v => v === 'ok');
  }
  function choiceModal(title, msg, choices) {
    return openModal(title, h('p', null, msg), [mbtn('Cancel', 'cancel'), ...choices.map(c => mbtn(c.label, c.value, c.cls))]);
  }
  function promptModal(title, label, value) {
    const input = h('input', { type: 'text', class: 'input', value: value || '', maxlength: 120, 'aria-label': label });
    const body = h('div', { class: 'field' }, h('label', null, label), input);
    const ok = mbtn('Save', 'ok', 'primary');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); closeModal('ok'); } });
    const p = openModal(title, body, [mbtn('Cancel', 'cancel'), ok]);
    setTimeout(() => { input.focus(); input.select(); }, 30);
    return p.then(v => v === 'ok' ? input.value.trim() || null : null);
  }

  /* ================= Brand Kit ================= */
  const FONT_LIST = Object.keys(PR.FONTS);
  function brandKit(focusId) {
    let current = brandById(focusId || S.settings.defaultBrand).id;
    const body = h('div', { class: 'brandkit' });
    function draw() {
      body.innerHTML = '';
      const b = brandById(current);
      const tabs = h('div', { class: 'brand-tabs', role: 'group', 'aria-label': 'Brands' },
        ...S.brands.map(x => h('button', { type: 'button', class: 'brand-tab', 'aria-pressed': x.id === current ? 'true' : 'false', onclick: () => { current = x.id; draw(); } }, x.name || 'Untitled brand')),
        h('button', { type: 'button', class: 'brand-tab', onclick: () => { const nb = { id: 'b_' + uid(), name: 'New Brand', logo: null, website: '', whatsapp: '', phone: '', primary: '#0EA5E9', secondary: '#F97316', font: 'Poppins' }; S.brands.push(nb); saveBrands(); current = nb.id; draw(); } }, '+ Add brand'));
      const set = (k, v) => { b[k] = v; saveBrands(); afterBrandChange(); };
      const text = (k, label, ph, hint) => h('div', { class: 'field' }, h('label', { for: 'bk-' + k }, label),
        h('input', { id: 'bk-' + k, type: 'text', value: b[k] || '', placeholder: ph, oninput: e => set(k, e.target.value) }), hint ? h('span', { class: 'hint' }, hint) : null);
      const colour = (k, label) => h('div', { class: 'field' }, h('label', null, label), colorInput(b[k], v => set(k, v), label));
      const logoUrl = Assets.url(b.logo);
      const logoBox = h('div', { class: 'asset' },
        h('div', { class: 'prev', style: logoUrl ? { backgroundImage: `url("${logoUrl}")` } : null }),
        h('div', { class: 'meta' }, h('strong', null, 'Logo'), b.logo ? 'Shown on every poster that uses this brand' : 'No logo yet — a monogram placeholder is used'),
        h('div', { class: 'acts' },
          h('button', { type: 'button', class: 'btn small', onclick: async () => { if (await uploadBrandLogo(b)) draw(); } }, ico('upload'), b.logo ? 'Replace' : 'Upload'),
          b.logo ? h('button', { type: 'button', class: 'btn small danger', onclick: () => { b.logo = null; saveBrands(); afterBrandChange(); draw(); } }, 'Remove') : null));
      if (b.logo && !logoUrl) Assets.image(b.logo).then(() => { if (modal.open) draw(); });
      body.append(tabs,
        h('p', { class: 'note' }, 'Brand details fill in automatically on new posters. Leave a field empty to keep the template placeholder. Nothing here is sent anywhere — it is stored in this browser.'),
        text('name', 'Brand name', 'Your brand name'), logoBox,
        h('div', { class: 'two' }, text('website', 'Website', 'www.yourwebsite.com'), text('phone', 'Phone number', '+00 00000 00000')),
        text('whatsapp', 'WhatsApp number', '+00 00000 00000', 'Shown with a chat icon on posters.'),
        h('div', { class: 'two' }, colour('primary', 'Primary colour'), colour('secondary', 'Secondary colour')),
        h('div', { class: 'field' }, h('label', { for: 'bk-font' }, 'Preferred heading font'),
          h('select', { id: 'bk-font', onchange: e => set('font', e.target.value) }, ...FONT_LIST.map(f => h('option', { value: f, selected: f === b.font }, f)))),
        h('div', { class: 'row gap', style: { flexWrap: 'wrap' } },
          h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: S.settings.defaultBrand === b.id, onchange: e => { if (e.target.checked) { S.settings.defaultBrand = b.id; saveBrands(); } draw(); } }), 'Default brand for new posters'),
          S.brands.length > 1 ? h('button', { type: 'button', class: 'btn small danger', style: { marginLeft: 'auto' }, onclick: async () => {
            S.brands = S.brands.filter(x => x.id !== b.id);
            if (S.settings.defaultBrand === b.id) S.settings.defaultBrand = S.brands[0].id;
            saveBrands(); current = S.brands[0].id; afterBrandChange(); draw();
          } }, ico('trash'), 'Delete brand') : null));
      hydrateIcons(body);
    }
    draw();
    openModal('Brand Kit', body, [mbtn('Done', 'ok', 'primary')]);
  }
  function afterBrandChange() {
    if (S.view === 'editor' && ED.design) { ED.refreshImages(); ED.panels(); ED.draw(); }
  }
  async function uploadBrandLogo(b) {
    const file = await pickFile($('#fileLogo'));
    if (!file) return false;
    try {
      const { blob, w, h: hh } = await processImage(file, 'logo');
      b.logo = await Assets.put(blob, { w, h: hh });
      await Assets.image(b.logo);
      saveBrands(); afterBrandChange();
      toast(`Logo added to ${b.name || 'brand'}`, 'success');
      return true;
    } catch (e) { toast(e.message, 'error'); return false; }
  }

  /* ================= New poster ================= */
  function newPosterModal() {
    let size = 'ig-portrait';
    let brand = S.settings.defaultBrand;
    const presets = h('div', { class: 'presets' });
    const drawPresets = () => {
      presets.innerHTML = '';
      Object.entries(SIZES).forEach(([k, s]) => presets.appendChild(sizePresetButton(k, s, k === size, () => { size = k; drawPresets(); })));
    };
    drawPresets();
    const body = h('div', null,
      h('p', { class: 'muted' }, 'Choose a format and start from a clean layout, or browse the template gallery.'),
      presets,
      h('div', { class: 'field', style: { marginTop: '12px' } }, h('label', { for: 'np-brand' }, 'Brand'),
        h('select', { id: 'np-brand', onchange: e => { brand = e.target.value; } }, ...S.brands.map(b => h('option', { value: b.id, selected: b.id === brand }, b.name)))));
    const browse = h('button', { type: 'button', class: 'btn', onclick: () => { closeModal(); leaveEditor('gallery'); } }, 'Browse templates');
    const create = h('button', { type: 'button', class: 'btn primary', onclick: () => { closeModal(); ED.open(newDesign(R.BLANK, brandById(brand), size), { fresh: true }); } }, 'Create blank poster');
    openModal('New Poster', body, [browse, create]);
  }
  function sizePresetButton(k, s, active, onclick) {
    const r = s.w / s.h, bw = r >= 1 ? 24 : Math.round(24 * r), bh = r >= 1 ? Math.round(24 / r) : 24;
    return h('button', { type: 'button', class: 'preset', 'aria-pressed': active ? 'true' : 'false', onclick },
      h('span', { class: 'shape' }, h('i', { style: { width: bw + 'px', height: bh + 'px' } })),
      h('span', null, h('strong', null, s.label), h('span', null, `${s.w} × ${s.h} px`)));
  }

  /* ================= Reusable controls ================= */
  function colorInput(value, onchange, label) {
    const norm = v => /^#[0-9a-f]{6}$/i.test(v) ? v : null;
    const pick = h('input', { type: 'color', value: norm(value) || '#000000', 'aria-label': label });
    const text = h('input', { type: 'text', value: (value || '').toUpperCase(), maxlength: 7, 'aria-label': label + ' hex value', spellcheck: 'false' });
    pick.addEventListener('input', () => { text.value = pick.value.toUpperCase(); onchange(pick.value); });
    text.addEventListener('change', () => { let v = text.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + v.slice(1).split('').map(c => c + c).join(''); if (norm(v)) { pick.value = v; text.value = v.toUpperCase(); onchange(v); } else text.value = pick.value.toUpperCase(); });
    return h('div', { class: 'color' }, pick, text);
  }

  /* ================= Editor ================= */
  const GRADIENTS = [
    ['Infinitia', '#6D28D9', '#2563EB', '#FFFFFF', '#E0E7FF'], ['Aurora', '#0F172A', '#312E81', '#FFFFFF', '#C7D2FE'], ['Sunset', '#F97316', '#DB2777', '#FFFFFF', '#FFE4E6'],
    ['Ocean', '#0EA5E9', '#1E40AF', '#FFFFFF', '#DBEAFE'], ['Mint', '#ECFDF5', '#A7F3D0', '#064E3B', '#047857'], ['Peach', '#FFF7ED', '#FED7AA', '#431407', '#9A3412'],
    ['Lavender', '#F5F3FF', '#DDD6FE', '#2E1065', '#6B21A8'], ['Noir Gold', '#0B0B0F', '#292524', '#F5F5F4', '#D6D3D1'], ['Forest', '#14532D', '#065F46', '#F0FDF4', '#BBF7D0'],
    ['Crimson', '#7F1D1D', '#DC2626', '#FFFFFF', '#FECACA'], ['Grape', '#3B0764', '#7E22CE', '#FAF5FF', '#E9D5FF'], ['Sky', '#E0F2FE', '#7DD3FC', '#0C4A6E', '#0369A1'],
    ['Steel', '#F8FAFC', '#CBD5E1', '#0F172A', '#475569'], ['Neon', '#05010F', '#1A0B3B', '#FFFFFF', '#C4B5FD'], ['Teal', '#134E4A', '#0D9488', '#F0FDFA', '#99F6E4'],
    ['Sand', '#FEF3C7', '#FCD34D', '#451A03', '#92400E'], ['Rose', '#FFF1F2', '#FDA4AF', '#4C0519', '#9F1239'], ['Midnight', '#020617', '#1E3A8A', '#F8FAFC', '#BFDBFE']
  ];
  const FIELD_LABELS = {
    brand: 'Brand name', logo: 'Logo', tag: 'Tag / badge', headline: 'Headline', subheadline: 'Subheadline', description: 'Description',
    features: 'Feature list', cta: 'Call to action', website: 'Website', phone: 'Phone', whatsapp: 'WhatsApp', footer: 'Footer text',
    image: 'Main image', bgImage: 'Background image', decor: 'Decorative shapes'
  };

  const ED = {
    design: null, T: null, history: [], hi: -1, dirty: false, savedSnapshot: null, lastKey: null, lastTime: 0, raf: 0, tab: 'content',

    open(design, opts) {
      opts = opts || {};
      this.design = design; this.T = templateOf(design);
      this.history = []; this.hi = -1; this.lastKey = null;
      this.snapshot(true);
      this.savedSnapshot = opts.fresh ? null : this.history[0];
      this.dirty = !!opts.fresh && false;
      this.isSaved = S.designs.some(d => d.id === design.id);
      showView('editor');
      this.setTab(this.tab);
      this.panels();
      this.updateChrome();
      this.draw();
      loadDesignImages(design).then(() => this.draw());
      loadFonts(designFonts(design), 4000).then(() => this.draw());
    },
    close() { this.design = null; this.T = null; this.history = []; },
    refreshImages() { if (this.design) loadDesignImages(this.design).then(() => { this.draw(); this.panels(); }); },

    snapshot(force) {
      const s = JSON.stringify(this.design);
      if (!force && this.history[this.hi] === s) return;
      this.history = this.history.slice(0, this.hi + 1);
      this.history.push(s);
      if (this.history.length > 100) this.history.shift();
      this.hi = this.history.length - 1;
    },
    commit(key) {
      const now = Date.now();
      const s = JSON.stringify(this.design);
      if (key && key === this.lastKey && now - this.lastTime < 900 && this.hi > 0 && this.hi === this.history.length - 1) this.history[this.hi] = s;
      else this.snapshot();
      this.lastKey = key; this.lastTime = now;
      this.markDirty();
      this.draw();
    },
    markDirty() {
      this.dirty = this.history[this.hi] !== this.savedSnapshot;
      this.updateChrome();
    },
    undo() { if (this.hi > 0) { this.hi--; this.restore(); } },
    redo() { if (this.hi < this.history.length - 1) { this.hi++; this.restore(); } },
    restore() {
      this.design = JSON.parse(this.history[this.hi]);
      this.T = templateOf(this.design);
      this.lastKey = null;
      this.markDirty(); this.panels(); this.draw();
      loadDesignImages(this.design).then(() => this.draw());
      loadFonts(designFonts(this.design), 3000).then(() => this.draw());
    },
    updateChrome() {
      if (!this.design) return;
      $('#edNameText').textContent = this.design.name;
      $('#edDirty').hidden = !this.dirty;
      $('#edUndo').disabled = this.hi <= 0;
      $('#edRedo').disabled = this.hi >= this.history.length - 1;
      $('#stageMeta').textContent = `${this.design.width} × ${this.design.height} px · ${this.T.name}`;
    },

    draw() {
      if (!this.design) return;
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => {
        if (!this.design) return;
        const d = this.design;
        const inner = $('#stage .stage-inner');
        const aw = Math.max(80, inner.clientWidth - 8), ah = Math.max(80, inner.clientHeight - 8);
        const s = Math.min(aw / d.width, ah / d.height);
        const cv = $('#preview');
        cv.style.width = Math.round(d.width * s) + 'px';
        cv.style.height = Math.round(d.height * s) + 'px';
        const k = Math.min(s * (window.devicePixelRatio || 1), 1.5);
        try { PR.render(cv, d, this.T, resources(d), { scale: k }); }
        catch (e) { console.error(e); }
        cv.setAttribute('aria-label', `Poster preview: ${d.fields.headline || d.name}`);
      });
    },

    setTab(tab) {
      this.tab = tab;
      $$('.ed-left .tab').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false'));
      $$('.ed-left .tabpanel').forEach(p => { p.hidden = p.dataset.panel !== tab; });
    },

    /* ---- panel building ---- */
    panels() {
      if (!this.design) return;
      const keepScroll = $('.ed-left').scrollTop;
      const open = new Set($$('.ed-left details[open], #edRight details[open]').map(d => d.dataset.id));
      this.contentPanel(); this.designPanel(); this.brandPanel(); this.sizePanel(); this.rightPanel();
      $$('.ed-left details, #edRight details').forEach(d => { if (open.has(d.dataset.id)) d.open = true; });
      hydrateIcons($('#editorView'));
      $('.ed-left').scrollTop = keepScroll;
    },
    group(id, title, open, ...kids) {
      return h('details', { class: 'group', 'data-id': id, open: open || undefined }, h('summary', null, title), h('div', { class: 'group-body' }, ...kids));
    },
    eye(key) {
      const d = this.design;
      const off = !!d.hidden[key];
      return h('button', {
        type: 'button', class: 'eye', title: off ? 'Show on poster' : 'Hide from poster', 'aria-label': (off ? 'Show ' : 'Hide ') + FIELD_LABELS[key], 'aria-pressed': off ? 'false' : 'true',
        html: svg(off ? 'eyeOff' : 'eye'),
        onclick: () => { d.hidden[key] = !d.hidden[key]; if (!d.hidden[key]) delete d.hidden[key]; this.commit(); this.panels(); }
      });
    },
    textField(key, opts) {
      opts = opts || {};
      const d = this.design;
      const id = 'f-' + key;
      const val = key === 'features' ? (d.fields.features || []).join('\n') : d.fields[key] || '';
      const input = opts.area || key === 'features'
        ? h('textarea', { id, rows: opts.rows || 3, placeholder: opts.ph || '' }, val)
        : h('input', { id, type: 'text', value: val, placeholder: opts.ph || '' });
      input.addEventListener('input', () => {
        d.fields[key] = key === 'features' ? input.value.split('\n') : input.value;
        if (key === 'features') d.fields.features = d.fields.features.filter((x, i, a) => x.trim() || i < a.length - 1);
        this.commit('f:' + key);
      });
      input.addEventListener('blur', () => { if (key === 'features') { d.fields.features = d.fields.features.map(s => s.trim()).filter(Boolean); } });
      return h('div', { class: 'field' + (d.hidden[key] ? ' off' : '') },
        h('div', { class: 'field-head' }, h('label', { for: id }, opts.label || FIELD_LABELS[key]), this.eye(key)),
        input, opts.hint ? h('span', { class: 'hint' }, opts.hint) : null);
    },
    assetField(slot, label, hint) {
      const d = this.design;
      const id = slot === 'logo' ? effectiveLogo(d) : d.assets[slot];
      const fromBrand = slot === 'logo' && !d.assets.logo && id;
      const url = Assets.url(id);
      if (id && !url) Assets.image(id).then(() => this.panels());
      const eyeKey = slot === 'main' ? 'image' : slot === 'bg' ? 'bgImage' : 'logo';
      const acts = h('div', { class: 'acts' },
        h('button', { type: 'button', class: 'btn small', onclick: () => this.upload(slot) }, ico('upload'), id && !fromBrand ? 'Replace' : 'Upload'),
        slot !== 'logo' ? h('button', { type: 'button', class: 'btn small', title: 'Use an image link', 'aria-label': 'Use image from a link', onclick: () => this.fromURL(slot) }, ico('link')) : null,
        d.assets[slot] ? h('button', { type: 'button', class: 'btn small danger', 'aria-label': 'Remove ' + label, onclick: () => { d.assets[slot] = null; this.commit(); this.panels(); } }, ico('trash')) : null);
      return h('div', { class: 'field' },
        h('div', { class: 'field-head' }, h('span', { class: 'lab' }, label), this.eye(eyeKey)),
        h('div', { class: 'asset' },
          h('div', { class: 'prev', style: url ? { backgroundImage: `url("${url}")` } : null }),
          h('div', { class: 'meta' }, h('strong', null, id ? (fromBrand ? 'From Brand Kit' : 'Uploaded') : 'None'), hint),
          acts));
    },
    async upload(slot) {
      const file = await pickFile(slot === 'logo' ? $('#fileLogo') : $('#fileImage'));
      if (!file) return;
      try {
        const { blob, w, h: hh } = await processImage(file, slot === 'logo' ? 'logo' : 'photo');
        const id = await Assets.put(blob, { w, h: hh });
        await Assets.image(id);
        this.design.assets[slot] = id;
        const key = slot === 'main' ? 'image' : slot === 'bg' ? 'bgImage' : 'logo';
        delete this.design.hidden[key];
        this.commit(); this.panels();
        toast(slot === 'logo' ? 'Logo added' : 'Image added', 'success');
        if (!Assets.idbOK) toast('Image storage is unavailable in this browser; images stay only until you close the tab. Export the project to keep them.', 'warn');
      } catch (e) { toast(e.message, 'error'); }
    },
    async fromURL(slot) {
      const url = await promptModal('Use image from a link', 'Image URL (https://…)', '');
      if (!url) return;
      try {
        const file = await fetchImageAsFile(url);
        const { blob, w, h: hh } = await processImage(file, 'photo');
        const id = await Assets.put(blob, { w, h: hh });
        await Assets.image(id);
        this.design.assets[slot] = id; this.commit(); this.panels();
        toast('Image added', 'success');
      } catch (e) { toast(e.message, 'warn'); }
    },
    contentPanel() {
      const p = $('.tabpanel[data-panel="content"]'); p.innerHTML = '';
      const L = this.T.layout.type;
      const featHint = { compare: 'One row per line: left side | right side', chat: 'One chat message per line — alternates customer and business', event: 'Date, time and venue — one per line', hiring: 'One role per line', steps: 'One step per line' }[L]
        || (this.T.layout.mode === 'stats' ? 'One per line. Use “value | label” for big numbers, e.g. 24/7 | Support' : 'One item per line');
      const tagHint = { event: 'Calendar badge, e.g. “24 NOV”', offer: 'Badge text, e.g. “50% OFF”', hiring: 'Large heading, e.g. “WE’RE HIRING”', showcase: 'Corner badge, e.g. “NEW” or a price' }[L];
      const subHint = { testimonial: 'Name, role — shown next to the avatar', compare: 'Column titles, e.g. “Before vs After”' }[L];
      const descHint = L === 'testimonial' ? 'The quote' : null;
      p.append(
        this.group('text', 'Text', true,
          this.textField('tag', { hint: tagHint }),
          this.textField('headline', { area: true, rows: 2 }),
          this.textField('subheadline', { hint: subHint }),
          this.textField('description', { area: true, rows: 3, hint: descHint }),
          this.textField('features', { rows: 4, hint: featHint }),
          this.textField('cta')),
        this.group('contact', 'Contact & footer', true,
          this.textField('brand', { hint: 'Shown next to the logo or monogram' }),
          this.textField('website', { ph: R.PLACEHOLDER.website }),
          this.textField('phone', { ph: R.PLACEHOLDER.phone }),
          this.textField('whatsapp', { ph: R.PLACEHOLDER.whatsapp }),
          this.textField('footer', { hint: 'Small print, e.g. terms or address' })),
        this.group('images', 'Images', true,
          this.assetField('logo', 'Logo', 'PNG with transparency works best. Aspect ratio is preserved.'),
          this.assetField('main', 'Main image', this.T.usesImage ? 'Fills the photo area of this layout.' : 'This layout has no photo area; used as avatar where relevant.'),
          this.assetField('bg', 'Background image', 'Covers the whole poster under a colour overlay.'),
          this.design.assets.bg ? this.range('Background overlay', 'bgOverlay', 0, 1, 0.05, v => Math.round(v * 100) + '%') : null));
    },
    styleSet(key, v, noPanels) { this.design.style[key] = v; this.commit('s:' + key); if (!noPanels) this.panels(); },
    range(label, key, min, max, step, fmt) {
      const v = this.design.style[key];
      const id = 'r-' + key;
      const out = h('output', { for: id }, fmt(v));
      const input = h('input', { id, type: 'range', min, max, step, value: v });
      input.addEventListener('input', () => { const x = parseFloat(input.value); out.textContent = fmt(x); this.design.style[key] = x; this.commit('s:' + key); });
      return h('div', { class: 'field' }, h('label', { for: id }, label), h('div', { class: 'range' }, input, out));
    },
    select(label, key, options, onchange) {
      const id = 's-' + key;
      const sel = h('select', { id, onchange: e => onchange ? onchange(e.target.value) : this.styleSet(key, e.target.value) },
        ...options.map(([v, l]) => h('option', { value: v, selected: String(this.design.style[key]) === String(v) }, l)));
      return h('div', { class: 'field' }, h('label', { for: id }, label), sel);
    },
    colour(label, key) {
      return h('div', { class: 'field' }, h('span', { class: 'lab' }, label), colorInput(this.design.style[key], v => { this.design.style[key] = v; this.commit('s:' + key); }, label));
    },
    check(label, key, onchange) {
      return h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!this.design.style[key], onchange: e => onchange ? onchange(e.target.checked) : this.styleSet(key, e.target.checked) }), label);
    },
    designPanel() {
      const p = $('.tabpanel[data-panel="design"]'); p.innerHTML = '';
      const st = this.design.style;
      const swatches = h('div', { class: 'swatches' }, ...GRADIENTS.map(([n, a, b, tx, mu]) => h('button', {
        type: 'button', class: 'swatch', title: n, 'aria-label': 'Gradient ' + n, style: { background: `linear-gradient(135deg, ${a}, ${b})` },
        onclick: () => { Object.assign(st, { bgType: 'linear', bgAngle: 135, bg1: a, bg2: b, bg3: b, text: tx, muted: mu }); this.commit(); this.panels(); }
      })));
      const fonts = FONT_LIST.map(f => [f, f]);
      const align = h('div', { class: 'field' }, h('span', { class: 'lab' }, 'Text alignment'),
        h('div', { class: 'seg', role: 'group', 'aria-label': 'Text alignment' }, ...[['auto', 'Auto'], ['left', 'Left'], ['center', 'Center'], ['right', 'Right']].map(([v, l]) =>
          h('button', { type: 'button', 'aria-pressed': (st.align || 'auto') === v ? 'true' : 'false', onclick: () => this.styleSet('align', v) }, l))));
      const pct = v => Math.round(v * 100) + '%';
      p.append(
        this.group('bg', 'Background', true,
          h('div', { class: 'field' }, h('span', { class: 'lab' }, 'Gradient presets'), swatches),
          this.select('Background style', 'bgType', [['solid', 'Solid colour'], ['linear', 'Linear gradient'], ['radial', 'Radial glow'], ['mesh', 'Mesh blend'], ['split', 'Two-tone split'], ['diagonal', 'Diagonal split'], ['spotlight', 'Spotlight']]),
          h('div', { class: 'two' }, this.colour('Colour 1', 'bg1'), this.colour('Colour 2', 'bg2')),
          st.bgType === 'linear' || st.bgType === 'spotlight' ? this.range('Gradient angle', 'bgAngle', 0, 360, 5, v => Math.round(v) + '°') : null,
          this.T.transparentOk ? this.check('Transparent background (PNG only)', 'transparent') : null),
        this.group('colors', 'Text & accent colours', true,
          h('div', { class: 'two' }, this.colour('Text', 'text'), this.colour('Secondary text', 'muted')),
          h('div', { class: 'two' }, this.colour('Accent', 'accent'), this.colour('Accent 2', 'accent2'))),
        this.group('type', 'Typography', false,
          this.select('Headline font', 'headFont', fonts, v => { this.styleSet('headFont', v); loadFonts(designFonts(this.design)).then(() => this.draw()); }),
          this.select('Body font', 'bodyFont', fonts, v => { this.styleSet('bodyFont', v); loadFonts(designFonts(this.design)).then(() => this.draw()); }),
          this.range('Headline size', 'headScale', 0.5, 1.8, 0.05, pct),
          this.range('Body text size', 'bodyScale', 0.6, 1.6, 0.05, pct),
          this.select('Headline weight', 'weight', [[400, 'Regular'], [500, 'Medium'], [600, 'Semibold'], [700, 'Bold'], [800, 'Extra bold'], [900, 'Black']], v => this.styleSet('weight', +v)),
          align,
          this.select('Headline highlight', 'highlight', [['none', 'None'], ['accentLast', 'Accent last word'], ['gradient', 'Gradient text'], ['marker', 'Marker'], ['underline', 'Underline'], ['outline', 'Outline lines']]),
          this.check('UPPERCASE headline', 'upper')),
        this.group('spacing', 'Spacing & shape', false,
          this.range('Line height', 'lineHeight', 0.85, 1.6, 0.01, v => v.toFixed(2)),
          this.range('Letter spacing', 'letterSpacing', -0.05, 0.2, 0.005, v => (v * 100).toFixed(1) + '%'),
          this.range('Space between elements', 'spacing', 0.4, 2, 0.05, pct),
          this.range('Poster padding', 'padding', 0.03, 0.15, 0.005, pct),
          this.range('Corner radius', 'radius', 0, 1, 0.05, pct)),
        this.group('elements', 'Logo, image & decoration', false,
          this.select('Logo position', 'logoPos', [['top-left', 'Top left'], ['top-center', 'Top centre'], ['top-right', 'Top right'], ['bottom-left', 'Bottom left'], ['bottom-center', 'Bottom centre'], ['bottom-right', 'Bottom right'], ['none', 'Hidden']]),
          this.range('Logo size', 'logoSize', 0.04, 0.18, 0.005, pct),
          this.T.usesImage ? this.select('Image placement', 'imagePos', [['auto', 'Template default'], ['left', 'Left'], ['right', 'Right'], ['top', 'Top'], ['bottom', 'Bottom']]) : null,
          this.check('Show decorative shapes', 'decorOn', v => { if (v) delete this.design.hidden.decor; else this.design.hidden.decor = true; this.commit(); this.panels(); }),
          this.range('Decoration strength', 'decorOpacity', 0, 2, 0.05, pct),
          h('button', { type: 'button', class: 'btn small', onclick: () => this.styleSet('seed', Math.floor(Math.random() * 997) + 1) }, ico('shuffle'), 'Shuffle decoration')));
      $('input[type=checkbox]', p.querySelector('[data-id="elements"]')).checked = !this.design.hidden.decor;
    },
    brandPanel() {
      const p = $('.tabpanel[data-panel="brand"]'); p.innerHTML = '';
      const d = this.design;
      const b = brandById(d.brandId);
      p.append(
        h('div', { class: 'field' }, h('label', { for: 'ed-brand' }, 'Brand for this poster'),
          h('select', { id: 'ed-brand', onchange: e => this.applyBrand(e.target.value) }, ...S.brands.map(x => h('option', { value: x.id, selected: x.id === d.brandId }, x.name)))),
        h('button', { type: 'button', class: 'btn', onclick: () => this.applyBrand(d.brandId, true) }, ico('reset'), 'Re-apply brand details'),
        h('p', { class: 'note' }, 'Brand details fill the brand name, website, phone and WhatsApp fields, and the brand logo is used unless you upload one for this poster.'),
        this.check(`Use brand colours (${b.primary} / ${b.secondary})`, 'useBrandColors'),
        this.check(`Use brand font (${b.font})`, 'useBrandFont', v => { this.styleSet('useBrandFont', v); loadFonts(designFonts(this.design)).then(() => this.draw()); }),
        this.check('Show brand name next to an uploaded logo', 'brandWithLogo'),
        h('button', { type: 'button', class: 'btn', onclick: () => brandKit(d.brandId) }, ico('palette'), 'Edit Brand Kit'));
    },
    applyBrand(id, force) {
      const d = this.design;
      const old = brandById(d.brandId), nb = brandById(id);
      const map = { brand: 'name', website: 'website', phone: 'phone', whatsapp: 'whatsapp' };
      Object.entries(map).forEach(([f, k]) => {
        const cur = d.fields[f];
        const wasDefault = !cur || cur === old[k] || cur === R.PLACEHOLDER[f];
        if ((force || wasDefault) && nb[k]) d.fields[f] = nb[k];
        else if ((force || wasDefault) && !nb[k] && f !== 'brand') d.fields[f] = R.PLACEHOLDER[f];
      });
      d.brandId = nb.id;
      loadDesignImages(d).then(() => this.draw());
      this.commit(); this.panels();
      toast(`Brand details from ${nb.name} applied`, 'success');
    },
    sizePanel() {
      const p = $('.tabpanel[data-panel="size"]'); p.innerHTML = '';
      const d = this.design;
      const presets = h('div', { class: 'presets' });
      Object.entries(SIZES).forEach(([k, s]) => presets.appendChild(sizePresetButton(k, s, d.sizeKey === k && d.width === s.w && d.height === s.h, () => this.setSize(s.w, s.h, k))));
      const w = h('input', { type: 'number', id: 'cw', min: 200, max: 6000, value: d.width });
      const hh = h('input', { type: 'number', id: 'ch', min: 200, max: 6000, value: d.height });
      p.append(presets,
        this.group('custom', 'Custom size', d.sizeKey === 'custom',
          h('div', { class: 'two' }, h('div', { class: 'field' }, h('label', { for: 'cw' }, 'Width (px)'), w), h('div', { class: 'field' }, h('label', { for: 'ch' }, 'Height (px)'), hh)),
          h('button', { type: 'button', class: 'btn', onclick: () => this.setSize(+w.value, +hh.value, 'custom') }, 'Apply custom size'),
          h('p', { class: 'hint muted' }, 'Between 200 and 6000 px per side, up to about 16 megapixels in total.')),
        h('p', { class: 'note' }, 'Layouts adapt to the format automatically and keep text inside safe margins.'));
    },
    setSize(w, hh, key) {
      w = Math.round(w); hh = Math.round(hh);
      if (!(w >= 200 && hh >= 200 && w <= 6000 && hh <= 6000)) { toast('Width and height must be between 200 and 6000 px.', 'error'); return; }
      if (w * hh > 16.7e6) { toast('That size is too large for browsers to export reliably (max ~16 megapixels).', 'error'); return; }
      Object.assign(this.design, { width: w, height: hh, sizeKey: key });
      this.commit(); this.panels();
    },
    rightPanel() {
      const p = $('#edRight'); p.innerHTML = '';
      const d = this.design, T = this.T;
      const tplCanvas = h('canvas', { 'aria-hidden': 'true' });
      thumbs.render(T).then(c => { tplCanvas.width = c.width; tplCanvas.height = c.height; tplCanvas.getContext('2d').drawImage(c, 0, 0); });
      const items = ['logo', 'brand', 'tag', 'headline', 'subheadline', 'description', 'features', 'cta'];
      if (T.usesImage || d.assets.main) items.push('image');
      items.push('website', 'phone', 'whatsapp', 'footer', 'decor');
      if (d.assets.bg) items.push('bgImage');
      const hasContent = k => {
        if (['logo', 'image', 'decor', 'bgImage'].includes(k)) return true;
        const v = d.fields[k]; return Array.isArray(v) ? v.some(x => String(x).trim()) : !!String(v || '').trim();
      };
      const layers = h('div', { class: 'layers' }, ...items.map(k => h('div', { class: 'layer' + (d.hidden[k] ? ' off' : '') + (hasContent(k) ? '' : ' empty') },
        h('button', { type: 'button', class: 'name', onclick: () => this.focusField(k), title: hasContent(k) ? 'Edit' : 'Empty — click to add text' }, FIELD_LABELS[k] + (hasContent(k) ? '' : ' (empty)')),
        this.eye(k))));
      const jpegQ = h('select', { 'aria-label': 'JPEG quality', class: 'input', style: { height: '32px', minHeight: '32px', padding: '0 8px', width: 'auto' } },
        h('option', { value: '0.95' }, 'High'), h('option', { value: '0.85', selected: true }, 'Standard'), h('option', { value: '0.7' }, 'Small'));
      const pk = printScale(d);
      p.append(
        h('section', null, h('div', { class: 'rp-title' }, 'Template'),
          h('div', { class: 'tpl-current' }, tplCanvas, h('div', { class: 'meta' }, h('strong', null, T.id === 'blank' ? 'Blank poster' : T.name), FAMILIES[T.family] || '')),
          h('button', { type: 'button', class: 'btn block small', style: { marginTop: '10px' }, onclick: () => this.pickTemplate() }, ico('layout'), 'Change template')),
        h('section', null, h('div', { class: 'rp-title' }, 'Download'),
          h('div', { class: 'export-box' },
            h('button', { type: 'button', class: 'btn primary block', onclick: () => exportImage('png') }, ico('download'), `PNG · ${d.width}×${d.height}`),
            h('div', { class: 'row gap' }, h('button', { type: 'button', class: 'btn block', style: { flex: 1 }, onclick: () => exportImage('jpeg', +jpegQ.value) }, ico('download'), 'JPEG'), jpegQ),
            h('button', { type: 'button', class: 'btn block', onclick: () => exportImage('print') }, ico('download'), `Print PNG · ${Math.round(d.width * pk)}×${Math.round(d.height * pk)}`),
            h('button', { type: 'button', class: 'btn block', onclick: () => exportProject(this.design) }, ico('fileOut'), 'Project JSON'))),
        this.group('layers', 'Layers', true, layers));
    },
    focusField(k) {
      const map = { logo: 'images', image: 'images', bgImage: 'images', decor: null };
      if (k === 'decor') { this.setTab('design'); const g = $('.ed-left [data-id="elements"]'); if (g) { g.open = true; g.scrollIntoView({ block: 'nearest' }); } return; }
      this.setTab('content');
      const g = map[k] ? $(`.ed-left [data-id="${map[k]}"]`) : $('#f-' + k) && $('#f-' + k).closest('details');
      if (g) g.open = true;
      const f = $('#f-' + k);
      if (f) { f.focus(); f.scrollIntoView({ block: 'center' }); }
      else if (g) g.scrollIntoView({ block: 'nearest' });
    },
    pickTemplate() {
      let keep = true, q = '', cat = this.T.category;
      const grid = h('div', { class: 'picker-grid', role: 'list' });
      const draw = () => {
        grid.innerHTML = '';
        const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
        TEMPLATES.filter(T => (cat === 'all' || T.category === cat) && terms.every(t => [T.name, T.category, FAMILIES[T.family], ...T.keywords].join(' ').toLowerCase().includes(t)))
          .forEach(T => grid.appendChild(templateCard(T, { pick: true, onPick: T2 => { closeModal(); this.switchTemplate(T2, keep); } })));
        if (!grid.children.length) grid.appendChild(h('p', { class: 'muted' }, 'No templates match.'));
      };
      const body = h('div', null,
        h('div', { class: 'two' },
          h('input', { type: 'search', class: 'input', placeholder: 'Search templates', 'aria-label': 'Search templates', oninput: e => { q = e.target.value; draw(); } }),
          h('select', { class: 'input', 'aria-label': 'Category', onchange: e => { cat = e.target.value; draw(); } },
            h('option', { value: 'all' }, 'All categories'), ...CATEGORIES.map(c => h('option', { value: c, selected: c === cat }, c)))),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: true, onchange: e => { keep = e.target.checked; } }), 'Keep my text, contacts and images'),
        grid);
      draw();
      openModal('Change template', body, [], { wide: true });
    },
    switchTemplate(T, keep) {
      const d = this.design;
      const brand = brandById(d.brandId);
      const fresh = newDesign(T, brand);
      const oldDefaults = R.defaultFields(this.T, brand);
      d.templateId = T.id;
      d.style = fresh.style;
      if (keep) {
        // Keep only text the user changed; untouched sample copy follows the new template.
        Object.keys(fresh.fields).forEach(k => {
          const v = d.fields[k];
          const empty = Array.isArray(v) ? !v.some(x => String(x).trim()) : !String(v || '').trim();
          if (empty || JSON.stringify(v) === JSON.stringify(oldDefaults[k])) d.fields[k] = fresh.fields[k];
        });
      } else { d.fields = fresh.fields; d.hidden = fresh.hidden; }
      this.T = T;
      this.commit(); this.panels();
      loadFonts(designFonts(d), 3000).then(() => this.draw());
      toast(`Switched to “${T.name}”`, 'success');
    },
    async reset() {
      if (!(await confirmModal('Reset to template?', 'Text and design settings go back to the template defaults. Your size and uploaded images are kept. You can undo this.', 'Reset'))) return;
      const d = this.design;
      const fresh = newDesign(this.T, brandById(d.brandId), d.sizeKey);
      d.fields = fresh.fields; d.style = fresh.style; d.hidden = fresh.hidden;
      this.commit(); this.panels();
      toast('Reset to template');
    },
    duplicate() {
      const copy = clone(this.design);
      copy.id = uid(); copy.name = this.design.name + ' (copy)'; copy.createdAt = copy.updatedAt = Date.now();
      S.designs.push(copy);
      if (persistDesigns(copy)) toast(`Saved a copy as “${copy.name}”`, 'success', { label: 'Open copy', fn: () => { this.dirty = false; ED.open(clone(copy)); } });
    },
    async rename() {
      const n = await promptModal('Rename design', 'Design name', this.design.name);
      if (!n) return;
      this.design.name = n; this.commit();
    }
  };

  function saveCurrent() {
    const d = ED.design;
    if (!d) return false;
    d.updatedAt = Date.now();
    const copy = clone(d);
    const i = S.designs.findIndex(x => x.id === d.id);
    if (i >= 0) S.designs[i] = copy; else S.designs.push(copy);
    const ok = persistDesigns(copy);
    ED.history[ED.hi] = JSON.stringify(d);
    ED.savedSnapshot = ED.history[ED.hi];
    ED.markDirty();
    if (ok) toast(`Saved “${d.name}” to My Designs`, 'success');
    return ok || !storageOK;
  }

  /* ================= Export ================= */
  function printScale(d) {
    return Math.round(Math.max(1, Math.min(3, Math.sqrt(16e6 / (d.width * d.height)), 8192 / Math.max(d.width, d.height))) * 100) / 100;
  }
  async function exportImage(kind, quality) {
    const d = ED.design; if (!d) return;
    const T = ED.T;
    const type = kind === 'jpeg' ? 'image/jpeg' : 'image/png';
    const btns = $$('#edRight .export-box .btn, #edDownload');
    btns.forEach(b => { b.disabled = true; });
    const c = document.createElement('canvas');
    try {
      const fl = designFonts(d);
      await loadFonts(fl, 5000);
      if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, sleep(3000)]);
      const missingFonts = [...new Set(fl.map(f => f[0]))].filter(f => !fontLoaded(f));
      await loadDesignImages(d);
      const missingImg = ['main', 'bg'].filter(k => d.assets[k] && !Assets.loaded(d.assets[k]));
      const k = kind === 'print' ? printScale(d) : 1;
      PR.render(c, d, T, { ...resources(d), forceOpaque: kind === 'jpeg' }, { scale: k });
      let blob;
      try { blob = await canvasToBlob(c, type, quality || 0.92); }
      catch (e) {
        if (e && e.name === 'SecurityError') toast('Export blocked: an image or font comes from another website that does not allow it. Upload the image file instead of linking it.', 'error');
        else toast('Could not create the image. Try a smaller size or a different browser.', 'error');
        return;
      }
      const name = `${slug(d.name)}-${c.width}x${c.height}${kind === 'print' ? '-print' : ''}.${kind === 'jpeg' ? 'jpg' : 'png'}`;
      downloadBlob(blob, name);
      toast(`${kind === 'jpeg' ? 'JPEG' : 'PNG'} downloaded · ${c.width}×${c.height}px`, 'success');
      if (missingFonts.length) toast(`Font${missingFonts.length > 1 ? 's' : ''} ${missingFonts.join(', ')} could not be loaded (offline?), so a system font was used.`, 'warn');
      if (missingImg.length) toast('One image could not be loaded and was left out. Re-upload it and export again.', 'warn');
    } catch (e) {
      console.error(e); toast('Export failed: ' + e.message, 'error');
    } finally {
      c.width = c.height = 0;
      btns.forEach(b => { b.disabled = false; });
    }
  }

  /* ================= Wiring ================= */
  function init() {
    hydrateIcons(document);
    $('#appBrand').textContent = brandById(S.settings.defaultBrand).name || 'Infinitia Hub';
    initGallery();
    $('#homeBtn').addEventListener('click', () => leaveEditor('gallery'));
    $('#myDesignsBtn').addEventListener('click', () => leaveEditor('designs'));
    $('#brandKitBtn').addEventListener('click', () => brandKit());
    $('#importLogoBtn').addEventListener('click', () => uploadBrandLogo(brandById(S.view === 'editor' && ED.design ? ED.design.brandId : S.settings.defaultBrand)));
    $('#newPosterBtn').addEventListener('click', newPosterModal);
    $('#designsNewBtn').addEventListener('click', newPosterModal);
    $('#emptyBrowse').addEventListener('click', () => showView('gallery'));
    $('#importProjectBtn').addEventListener('click', importProject);

    $('#edBack').addEventListener('click', () => leaveEditor('gallery'));
    $('#edName').addEventListener('click', () => ED.rename());
    $('#edUndo').addEventListener('click', () => ED.undo());
    $('#edRedo').addEventListener('click', () => ED.redo());
    $('#edReset').addEventListener('click', () => ED.reset());
    $('#edDuplicate').addEventListener('click', () => ED.duplicate());
    $('#edSave').addEventListener('click', saveCurrent);
    $('#edDownload').addEventListener('click', () => exportImage('png'));
    $$('.ed-left .tab').forEach(b => b.addEventListener('click', () => ED.setTab(b.dataset.tab)));
    $('.ed-left .tabs').addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const tabs = $$('.ed-left .tab'); const i = tabs.findIndex(t => t.dataset.tab === ED.tab);
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      ED.setTab(n.dataset.tab); n.focus();
    });

    document.addEventListener('keydown', e => {
      if (S.view !== 'editor' || modal.open) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && document.activeElement.type !== 'range' && document.activeElement.type !== 'checkbox';
      const key = e.key.toLowerCase();
      if (key === 's') { e.preventDefault(); saveCurrent(); }
      else if (!typing && key === 'z' && !e.shiftKey) { e.preventDefault(); ED.undo(); }
      else if (!typing && (key === 'y' || (key === 'z' && e.shiftKey))) { e.preventDefault(); ED.redo(); }
    });
    window.addEventListener('resize', () => ED.draw());
    if (window.ResizeObserver) new ResizeObserver(() => ED.draw()).observe($('#stage'));
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => ED.draw());
    window.addEventListener('beforeunload', e => { if (S.view === 'editor' && ED.dirty) { e.preventDefault(); e.returnValue = ''; } });

    showView('gallery');
    if (!storageOK) toast('Browser storage is unavailable, so designs cannot be saved between visits. Use Project JSON export to keep your work.', 'warn');
    S.brands.forEach(b => b.logo && Assets.image(b.logo));
    setTimeout(gcAssets, 4000);
  }

  window.PosterStudio = { S, ED, Assets, exportImage, saveCurrent, newDesign, importProject, exportProject };
  init();
})();
