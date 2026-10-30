/*!
 * Infinitia Links — Institution admin preview.
 * Local sample data only; nothing here connects to institutional systems.
 */
(function () {
  'use strict';

  var $ = UI.$, $$ = UI.$$, esc = UI.esc, icon = UI.icon;
  UI.init();

  var root = $('#admin');
  var PAGE_SIZE = 10;
  var ui = { view: 'overview', q: '', dept: '', status: '', page: 1, importRows: [] };

  var VIEWS = [
    { key: 'overview', icon: 'grid', label: 'Overview', title: 'Dashboard overview', sub: 'A snapshot of your institution\'s digital identity programme (sample data).' },
    { key: 'students', icon: 'users', label: 'Student profiles', title: 'Student profiles', sub: 'Create, edit, activate or deactivate demo digital IDs.' },
    { key: 'import', icon: 'upload', label: 'Bulk import', title: 'Bulk student import', sub: 'Upload a CSV to create many demo profiles at once.' },
    { key: 'branding', icon: 'palette', label: 'Branding', title: 'College branding', sub: 'Your name, crest, colours and custom domain — applied across every card and page.' },
    { key: 'templates', icon: 'layers', label: 'ID templates', title: 'Digital ID templates', sub: 'Choose the default card design issued to students.' }
  ];

  function logoHTML(b) {
    return b.logo ? '<span class="inst-logo has-img"><img src="' + esc(b.logo) + '" alt=""></span>' : '<span class="inst-logo">' + esc(b.monogram) + '</span>';
  }

  /* ---------- Layout ---------- */
  function renderLayout() {
    var b = Store.branding();
    root.innerHTML =
      '<aside class="admin-side">' +
      '<div class="admin-inst">' + logoHTML(b) + '<div><b>' + esc(b.institution) + '</b><span>Admin preview · Demo</span></div></div>' +
      '<nav class="admin-nav" aria-label="Admin sections">' + VIEWS.map(function (v) {
        return '<button type="button" data-view="' + v.key + '">' + icon(v.icon) + v.label + '</button>';
      }).join('') + '</nav>' +
      '<div class="callout side-note">' + icon('info') + '<span>All records are local sample data stored in this browser. No institutional integration is implied.</span></div>' +
      '<button class="btn btn-ghost btn-sm side-note" type="button" data-reset>' + icon('refresh') + 'Reset demo data</button>' +
      '</aside>' +
      '<section class="admin-main"><div class="admin-head"><div><h1 id="view-title"></h1><p id="view-sub"></p></div><div class="btns" id="view-btns"></div></div>' +
      VIEWS.map(function (v) { return '<div class="view" id="view-' + v.key + '"></div>'; }).join('') +
      '</section>';
  }

  function show(view) {
    ui.view = view;
    var v = VIEWS.filter(function (x) { return x.key === view; })[0] || VIEWS[0];
    $$('[data-view]', root).forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === v.key); });
    $$('.view', root).forEach(function (el) { el.classList.toggle('active', el.id === 'view-' + v.key); });
    $('#view-title').textContent = v.title;
    $('#view-sub').textContent = v.sub;
    $('#view-btns').innerHTML =
      '<button class="btn btn-ghost btn-sm" type="button" data-export>' + icon('download') + 'Export list</button>' +
      '<button class="btn btn-primary btn-sm" type="button" data-new>' + icon('plus') + 'New profile</button>';
    ({ overview: renderOverview, students: renderStudents, import: renderImport, branding: renderBranding, templates: renderTemplates })[v.key]();
    if (location.hash !== '#' + v.key) history.replaceState(null, '', '#' + v.key);
  }

  /* ---------- Overview ---------- */
  function renderOverview() {
    var t = Store.totals(), st = Store.state;
    var kpis = [
      { k: 'ids', label: 'Total student digital IDs', icon: 'idcard', val: t.ids, note: 'Sample cohort', hero: true },
      { k: 'active', label: 'Active demo profiles', icon: 'check', val: t.active, note: Math.round(t.active / Math.max(1, t.ids) * 100) + '% of IDs' },
      { k: 'scans', label: 'QR scans', icon: 'scan', val: t.scans, note: '+' + st.scanSeries[6] + ' today' },
      { k: 'views', label: 'Profile views', icon: 'eye', val: t.views, note: '+12% this week' },
      { k: 'depts', label: 'Departments', icon: 'building', val: Object.keys(t.depts).length, note: 'With issued IDs' },
      { k: 'progs', label: 'Academic programmes', icon: 'cap', val: Object.keys(t.progs).length, note: 'UG & PG' }
    ];
    var depts = Object.keys(t.depts).sort(function (a, b) { return t.depts[b] - t.depts[a]; });
    var maxD = Math.max.apply(null, depts.map(function (d) { return t.depts[d]; }));
    var maxS = Math.max.apply(null, st.scanSeries);
    var days = [];
    for (var i = 6; i >= 0; i--) days.push(new Date(Date.now() - i * 864e5).toLocaleDateString('en-GB', { weekday: 'short' }));

    $('#view-overview').innerHTML =
      '<div class="kpis">' + kpis.map(function (k) {
        return '<div class="kpi' + (k.hero ? ' hero-kpi' : '') + '"><span class="ico">' + icon(k.icon) + '</span><span>' + k.label + '</span><b data-count="' + k.val + '">0</b><small>' + esc(k.note) + '</small></div>';
      }).join('') + '</div>' +
      '<div class="dash-grid">' +
      '<div class="panel"><div class="panel-head"><span class="panel-ic">' + icon('building') + '</span><div><h3>Digital IDs by department</h3><p>Issued sample IDs</p></div></div>' +
      '<div class="bars">' + depts.map(function (d) {
        return '<div class="bar-row"><span title="' + esc(d) + '">' + esc(d) + '</span><div class="bar-track"><div class="bar-fill" data-w="' + (t.depts[d] / maxD * 100) + '"></div></div><b>' + t.depts[d] + '</b></div>';
      }).join('') + '</div></div>' +
      '<div class="panel"><div class="panel-head"><span class="panel-ic">' + icon('scan') + '</span><div><h3>QR scans · last 7 days</h3><p>Simulated verification traffic</p></div></div>' +
      '<div class="cols">' + st.scanSeries.map(function (v, i) {
        return '<div class="col"><em>' + v + '</em><div class="col-bar' + (i === 6 ? ' today' : '') + '" data-h="' + (v / maxS * 100) + '"></div><span>' + (i === 6 ? 'Today' : days[i]) + '</span></div>';
      }).join('') + '</div></div>' +
      '<div class="panel"><div class="panel-head"><span class="panel-ic">' + icon('clock') + '</span><div><h3>Recent activity</h3><p>Actions in this demo</p></div></div>' +
      '<div class="activity list">' + st.activity.slice(0, 6).map(function (a) {
        return '<div class="list-item"><span class="ico">' + icon(a.icon) + '</span><div><b style="font-size:13.5px">' + esc(a.msg) + '</b></div><span class="when">' + UI.timeAgo(a.t) + '</span></div>';
      }).join('') + '</div></div>' +
      '<div class="panel"><div class="panel-head"><span class="panel-ic">' + icon('bolt') + '</span><div><h3>Quick actions</h3><p>Common admin tasks</p></div></div>' +
      '<div class="shortcuts" style="grid-template-columns:repeat(2,1fr)">' +
      qa('new', 'plus', 'Create profile', 'Add a demo student', 'linear-gradient(135deg,#2F6BFF,#38BDF8)') +
      qa('import', 'upload', 'Bulk import', 'Upload a CSV', 'linear-gradient(135deg,#0F766E,#14B8A6)') +
      qa('branding', 'palette', 'Branding', 'Crest, colours, domain', 'linear-gradient(135deg,#4F46E5,#7C3AED)') +
      qa('export', 'download', 'Export list', 'Download CSV', 'linear-gradient(135deg,#E11D48,#F97316)') +
      '</div></div>' +
      '</div>';

    $$('[data-count]', root).forEach(function (el) { UI.animateCount(el, +el.getAttribute('data-count')); });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        $$('.bar-fill', root).forEach(function (el) { el.style.width = el.getAttribute('data-w') + '%'; });
        $$('.col-bar', root).forEach(function (el) { el.style.height = Math.max(6, el.getAttribute('data-h') * 1.15) + 'px'; });
      });
    });
  }
  function qa(act, ic, title, sub, bg) {
    return '<button type="button" class="shortcut" data-qa="' + act + '"><span class="ico" style="background:' + bg + '">' + icon(ic) + '</span><b>' + title + '</b><span>' + sub + '</span></button>';
  }

  /* ---------- Students ---------- */
  function filtered() {
    var q = ui.q.toLowerCase();
    return Store.students().filter(function (s) {
      if (ui.dept && s.department !== ui.dept) return false;
      if (ui.status && s.status !== ui.status) return false;
      return !q || (s.name + ' ' + s.id + ' ' + s.programme + ' ' + s.programmeShort + ' ' + s.email).toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderStudents() {
    var depts = {};
    Store.PROGRAMMES.forEach(function (p) { depts[p.dept] = 1; });
    Store.students().forEach(function (s) { depts[s.department] = 1; });
    var el = $('#view-students');
    if (!el.firstChild) {
      el.innerHTML =
        '<div class="toolbar">' +
        '<label class="search">' + icon('search') + '<input class="input" type="search" id="st-q" placeholder="Search name, ID, programme or email" aria-label="Search students"></label>' +
        '<select class="select" id="st-dept" aria-label="Filter by department"><option value="">All departments</option>' +
        Object.keys(depts).sort().map(function (d) { return '<option>' + esc(d) + '</option>'; }).join('') + '</select>' +
        '<select class="select" id="st-status" aria-label="Filter by status"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>' +
        '</div><div class="table-wrap"><table class="table"><thead><tr>' +
        '<th>Student</th><th>Student ID</th><th>Programme</th><th>Year</th><th>Active</th><th>Scans</th><th style="text-align:right">Actions</th>' +
        '</tr></thead><tbody id="st-body"></tbody></table></div><div class="table-foot" id="st-foot"></div>';
      $('#st-q').addEventListener('input', function (e) { ui.q = e.target.value; ui.page = 1; renderRows(); });
      $('#st-dept').addEventListener('change', function (e) { ui.dept = e.target.value; ui.page = 1; renderRows(); });
      $('#st-status').addEventListener('change', function (e) { ui.status = e.target.value; ui.page = 1; renderRows(); });
    }
    renderRows();
  }

  function renderRows() {
    var list = filtered();
    var pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    ui.page = Math.min(ui.page, pages);
    var slice = list.slice((ui.page - 1) * PAGE_SIZE, ui.page * PAGE_SIZE);
    $('#st-body').innerHTML = slice.length ? slice.map(function (s) {
      var on = s.status === 'active';
      return '<tr data-id="' + esc(s.id) + '">' +
        '<td><div class="who"><img src="' + Card.avatarURL(s, 120) + '" alt=""><div><b>' + esc(s.name) + '</b><span>' + esc(s.email) + '</span></div></div></td>' +
        '<td class="mono" style="font-size:13px">' + esc(s.id) + '</td>' +
        '<td><b style="font-size:13.5px">' + esc(s.programmeShort) + '</b><div class="tiny muted">' + esc(s.department) + '</div></td>' +
        '<td>' + esc(s.year) + '</td>' +
        '<td><label class="switch" title="' + (on ? 'Deactivate' : 'Activate') + ' demo profile"><input type="checkbox" data-toggle' + (on ? ' checked' : '') + ' aria-label="Active status for ' + esc(s.name) + '"><i></i></label></td>' +
        '<td>' + UI.fmtNum(s.scans) + '</td>' +
        '<td><div class="row-actions">' +
        '<button class="icon-btn" type="button" data-row="qr" title="Generate demo QR" aria-label="Generate demo QR">' + icon('qr') + '</button>' +
        '<button class="icon-btn" type="button" data-row="card" title="Preview ID card" aria-label="Preview ID card">' + icon('idcard') + '</button>' +
        '<button class="icon-btn" type="button" data-row="edit" title="Edit details" aria-label="Edit details">' + icon('edit') + '</button>' +
        '<button class="icon-btn" type="button" data-row="delete" title="Delete profile" aria-label="Delete profile">' + icon('trash') + '</button>' +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="7" class="empty">No demo profiles match your filters.</td></tr>';
    $('#st-foot').innerHTML = '<span>Showing ' + (list.length ? (ui.page - 1) * PAGE_SIZE + 1 : 0) + '–' + Math.min(ui.page * PAGE_SIZE, list.length) + ' of ' + list.length + ' demo profiles</span>' +
      '<div class="pager"><button class="btn btn-ghost btn-sm" type="button" data-pg="-1"' + (ui.page <= 1 ? ' disabled' : '') + '>Previous</button>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-pg="1"' + (ui.page >= pages ? ' disabled' : '') + '>Next</button></div>';
  }

  root.addEventListener('change', function (e) {
    if (!e.target.hasAttribute('data-toggle')) return;
    var id = e.target.closest('tr').getAttribute('data-id');
    var s = Store.updateStudent(id, { status: e.target.checked ? 'active' : 'inactive' });
    Store.log('power', 'Demo profile ' + (e.target.checked ? 'activated' : 'deactivated') + ': ' + s.name);
    UI.toast(s.name + ' ' + (e.target.checked ? 'activated' : 'deactivated'), e.target.checked ? 'success' : 'warn');
  });

  /* ---------- Student form ---------- */
  function studentForm(existing) {
    var isNew = !existing;
    var draft = existing ? JSON.parse(JSON.stringify(existing)) : {
      id: Store.nextId(), name: '', programme: Store.PROGRAMMES[0].name, programmeShort: Store.PROGRAMMES[0].short, department: Store.PROGRAMMES[0].dept,
      year: 'First Year', academicYear: '2026–2027', email: '', status: 'active', issued: new Date().toISOString().slice(0, 10), validThru: '2027-05-31',
      views: 0, scans: 0, avatar: Store.randomAvatar(), emergency: { name: 'Demo Guardian (fictional)', relation: 'Parent / Guardian', phone: '+00 000 000 0000' }
    };
    var m = UI.modal({
      title: isNew ? 'Create demo student profile' : 'Edit student details', eyebrow: isNew ? 'New profile' : draft.id, size: 'lg',
      body:
        '<div class="preview-card-modal"><div id="f-preview" style="max-width:440px;width:100%;margin:0 auto"></div>' +
        '<div style="display:flex;justify-content:center"><button class="btn btn-soft btn-sm" type="button" data-shuffle>' + icon('sparkles') + 'Shuffle avatar</button></div></div>' +
        '<form class="form-grid" id="f" novalidate style="margin-top:18px">' +
        field('Full name', '<input class="input" name="name" required maxlength="40" value="' + esc(draft.name) + '" placeholder="e.g. Priya Raman" autofocus>', 'full') +
        field('Student ID', '<input class="input mono" name="id" ' + (isNew ? '' : 'readonly ') + 'value="' + esc(draft.id) + '">', '', 'Must start with DEMO-') +
        field('Institution email', '<input class="input" name="email" type="email" value="' + esc(draft.email) + '" placeholder="auto: firstname.demo@example.com">') +
        field('Programme', '<select class="select" name="programme">' + Store.PROGRAMMES.map(function (p) {
          return '<option value="' + esc(p.short) + '"' + (p.short === draft.programmeShort ? ' selected' : '') + '>' + esc(p.name) + '</option>';
        }).join('') + '</select>', 'full') +
        field('Year', '<select class="select" name="year">' + Store.YEARS.map(function (y) { return '<option' + (y === draft.year ? ' selected' : '') + '>' + y + '</option>'; }).join('') + '</select>') +
        field('Academic year', '<input class="input" name="academicYear" value="' + esc(draft.academicYear) + '">') +
        field('Emergency contact (fictional)', '<input class="input" name="eName" value="' + esc(draft.emergency.name) + '">') +
        field('Emergency phone (fictional)', '<input class="input" name="ePhone" value="' + esc(draft.emergency.phone) + '">') +
        '<div class="field full" style="display:flex;align-items:center;gap:12px"><label class="switch"><input type="checkbox" name="active"' + (draft.status === 'active' ? ' checked' : '') + '><i></i></label><span style="font-weight:600;font-size:14px">Demo profile active</span></div>' +
        '</form>',
      footer: '<button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="button" data-save>' + icon('check') + (isNew ? 'Create profile' : 'Save changes') + '</button>'
    });
    var f = $('#f', m.el);

    function read() {
      var p = Store.PROGRAMMES.filter(function (x) { return x.short === f.programme.value; })[0];
      draft.name = f.name.value.trim();
      draft.id = f.id.value.trim().toUpperCase();
      draft.programme = p.name; draft.programmeShort = p.short; draft.department = p.dept;
      draft.year = f.year.value;
      draft.academicYear = f.academicYear.value.trim() || '2026–2027';
      draft.email = f.email.value.trim() || (draft.name ? Store.emailFor(draft.name.split(' ')[0]) : '');
      draft.emergency = { name: f.eName.value.trim(), relation: draft.emergency.relation, phone: f.ePhone.value.trim() };
      draft.status = f.active.checked ? 'active' : 'inactive';
    }
    function preview() {
      read();
      var shown = JSON.parse(JSON.stringify(draft));
      if (!shown.name) shown.name = 'Student Name';
      $('#f-preview', m.el).innerHTML = Card.html(shown, Store.templateId());
    }
    f.addEventListener('input', preview);
    f.addEventListener('change', preview);
    $('[data-shuffle]', m.el).addEventListener('click', function () { draft.avatar = Store.randomAvatar(); preview(); });
    $('[data-save]', m.el).addEventListener('click', function () {
      read();
      $$('.field', f).forEach(function (x) { x.classList.remove('err'); });
      var bad = null;
      if (!draft.name) bad = ['name', 'Please enter the student\'s name'];
      else if (!/^DEMO-[A-Z0-9-]{3,}$/.test(draft.id)) bad = ['id', 'Student ID must start with DEMO-'];
      else if (isNew && Store.student(draft.id)) bad = ['id', 'That demo ID already exists'];
      if (bad) {
        f[bad[0]].closest('.field').classList.add('err');
        f[bad[0]].focus();
        return UI.toast(bad[1], 'error');
      }
      if (isNew) Store.addStudent(draft);
      else { Store.updateStudent(draft.id, draft); Store.log('edit', 'Student details updated: ' + draft.name); }
      m.close();
      UI.toast(isNew ? 'Demo profile created for ' + draft.name : 'Changes saved');
      if (isNew) resetFilters();
      show(isNew ? 'students' : ui.view);
    });
    preview();
  }

  function resetFilters() {
    ui.q = ''; ui.dept = ''; ui.status = ''; ui.page = 1;
    ['#st-q', '#st-dept', '#st-status'].forEach(function (sel) { var el = $(sel); if (el) el.value = ''; });
  }

  function field(label, control, cls, hint) {
    return '<div class="field ' + (cls || '') + '"><label>' + label + '</label>' + control + (hint ? '<span class="hint">' + hint + '</span>' : '') + '</div>';
  }

  /* ---------- QR + card preview ---------- */
  function openQR(s) {
    var url = UI.publicUrl('verify', s.id);
    Store.log('qr', 'Demo QR generated for ' + s.id);
    var m = UI.modal({
      title: 'Demo QR for ' + s.name, eyebrow: 'Generate demo QR', size: 'sm',
      body: '<div class="qr-gen"><div class="qr-box">' + QR.toSVG(url, { margin: 1, light: '#fff' }) + '</div>' +
        '<p class="tiny muted mono" style="word-break:break-all">' + esc(url) + '</p>' +
        '<div class="btns"><button class="btn btn-primary btn-sm" type="button" data-dl>' + icon('download') + 'Download PNG</button>' +
        '<button class="btn btn-ghost btn-sm" type="button" data-cp>' + icon('copy') + 'Copy link</button>' +
        '<a class="btn btn-ghost btn-sm" href="' + UI.pageUrl('verify.html', s.id) + '">' + icon('shield') + 'Test scan</a></div>' +
        '<p class="tiny muted">Opens the simulated verification page. Not an official credential.</p></div>'
    });
    $('[data-cp]', m.el).addEventListener('click', function () { UI.copy(url, 'Verification link'); });
    $('[data-dl]', m.el).addEventListener('click', function () {
      var size = QR.matrix(url).length, cell = 16, pad = 4 * cell, c = document.createElement('canvas');
      c.width = c.height = size * cell + pad * 2;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      QR.drawToCanvas(ctx, url, pad, pad, size * cell);
      c.toBlob(function (blob) { UI.downloadBlob(blob, 'demo-qr-' + s.id.toLowerCase() + '.png'); UI.toast('QR code downloaded'); });
    });
  }

  function openCard(s) {
    var tpl = Store.templateId();
    var m = UI.modal({
      title: s.name, eyebrow: 'Digital ID preview', size: 'lg',
      body: '<div class="tpl-admin" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))"><div>' + Card.html(s, tpl) + '</div><div>' + Card.html(s, tpl, { side: 'back' }) + '</div></div>',
      footer: '<a class="btn btn-ghost" href="' + UI.pageUrl('index.html', s.id) + '">' + icon('external') + 'Open in wallet</a>' +
        '<button class="btn btn-primary" type="button" data-dl>' + icon('download') + 'Download front PNG</button>'
    });
    $('[data-dl]', m.el).addEventListener('click', function () { Card.downloadPNG(s, tpl, 'front').then(function () { UI.toast('Sample ID downloaded'); }); });
  }

  /* ---------- Export ---------- */
  function csvCell(v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function exportCSV() {
    var rows = [['student_id', 'name', 'programme', 'programme_short', 'department', 'year', 'academic_year', 'email', 'status', 'qr_scans', 'profile_views', 'note']];
    Store.students().forEach(function (s) {
      rows.push([s.id, s.name, s.programme, s.programmeShort, s.department, s.year, s.academicYear, s.email, s.status, s.scans, s.views, 'DEMO - not valid for identification']);
    });
    var csv = '﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
    UI.downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'nova-demo-students.csv');
    Store.log('download', 'Demo student list exported (' + Store.students().length + ' rows)');
    UI.toast('Exported ' + Store.students().length + ' demo profiles');
  }

  /* ---------- Bulk import ---------- */
  var SAMPLE_CSV = 'name,programme_short,year,email,status\n' +
    'Priya Raman,BCA,First Year,,active\n' +
    'Kunal Bhatt,B.Tech CSE,Third Year,kunal.demo@example.com,active\n' +
    'Leela Menon,B.Des,Second Year,,active\n' +
    'Farhan Ali,MBA,First Year,,active\n' +
    'Sneha Kulkarni,B.Sc DS,First Year,,inactive\n' +
    ',BBA,Second Year,,active';

  function parseCSV(text) {
    var rows = [], row = [], cell = '', q = false;
    text = text.replace(/^﻿/, '');
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (x) { return x.trim(); }); });
  }

  function validate(text) {
    var rows = parseCSV(text);
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    var col = function (n) { return head.indexOf(n); };
    if (col('name') === -1) return [{ error: 'Missing "name" column in header row' }];
    return rows.slice(1).map(function (r) {
      var get = function (n) { var i = col(n); return i === -1 ? '' : (r[i] || '').trim(); };
      var out = { name: get('name'), programme: get('programme_short') || 'BCA', year: get('year') || 'First Year', email: get('email'), status: (get('status') || 'active').toLowerCase() };
      var p = Store.PROGRAMMES.filter(function (x) { return x.short.toLowerCase() === out.programme.toLowerCase(); })[0];
      if (!out.name) out.error = 'Name is required';
      else if (!p) out.error = 'Unknown programme "' + out.programme + '"';
      else if (Store.YEARS.indexOf(out.year) === -1) out.error = 'Year must be e.g. "First Year"';
      else if (out.status !== 'active' && out.status !== 'inactive') out.error = 'Status must be active or inactive';
      out.p = p;
      return out;
    });
  }

  function renderImport() {
    var el = $('#view-import');
    if (el.firstChild) return renderImportPreview();
    el.innerHTML =
      '<div class="import-grid"><div class="panel">' +
      '<div class="panel-head"><span class="panel-ic">' + icon('file') + '</span><div><h3>Upload CSV</h3><p>Columns: name, programme_short, year, email, status</p></div></div>' +
      '<ol class="steps" style="margin-bottom:16px"><li>Download the template or load the sample file.</li><li>Drop a CSV below, or paste rows into the editor.</li><li>Review validation, then import valid rows.</li></ol>' +
      '<label class="dropzone" id="drop"><span class="ico">' + icon('upload') + '</span><b>Drop a CSV file here</b><span>or click to browse · processed locally in your browser</span>' +
      '<input type="file" id="file" accept=".csv,text/csv" class="sr-only"></label>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0">' +
      '<button class="btn btn-soft btn-sm" type="button" id="imp-sample">' + icon('sparkles') + 'Load sample CSV</button>' +
      '<button class="btn btn-ghost btn-sm" type="button" id="imp-tpl">' + icon('download') + 'Download template</button></div>' +
      '<textarea class="textarea" id="imp-text" spellcheck="false" aria-label="CSV contents" placeholder="name,programme_short,year,email,status"></textarea>' +
      '<p class="tiny muted" style="margin-top:8px">Valid programme codes: ' + Store.PROGRAMMES.map(function (p) { return esc(p.short); }).join(', ') + '</p>' +
      '</div><div class="panel"><div class="panel-head"><span class="panel-ic">' + icon('check') + '</span><div><h3>Preview &amp; validation</h3><p id="imp-summary">Nothing loaded yet</p></div></div>' +
      '<div id="imp-preview"></div></div></div>';

    var drop = $('#drop'), text = $('#imp-text');
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
    drop.addEventListener('drop', function (e) { if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]); });
    $('#file').addEventListener('change', function (e) { if (e.target.files[0]) readFile(e.target.files[0]); e.target.value = ''; });
    $('#imp-sample').addEventListener('click', function () { text.value = SAMPLE_CSV; update(); UI.toast('Sample CSV loaded', 'info'); });
    $('#imp-tpl').addEventListener('click', function () {
      UI.downloadBlob(new Blob(['name,programme_short,year,email,status\nFirstname Lastname,BCA,First Year,,active\n'], { type: 'text/csv' }), 'infinitia-import-template.csv');
      UI.toast('Template downloaded');
    });
    text.addEventListener('input', update);
    function readFile(file) {
      if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') return UI.toast('Please choose a .csv file', 'error');
      var r = new FileReader();
      r.onload = function () { text.value = r.result; update(); UI.toast('Loaded ' + file.name, 'info'); };
      r.readAsText(file);
    }
    function update() { ui.importRows = validate(text.value); renderImportPreview(); }
    renderImportPreview();
  }

  function renderImportPreview() {
    var rows = ui.importRows, ok = rows.filter(function (r) { return !r.error; });
    $('#imp-summary').textContent = rows.length ? ok.length + ' valid · ' + (rows.length - ok.length) + ' with errors' : 'Nothing loaded yet';
    $('#imp-preview').innerHTML = rows.length ?
      '<div class="table-wrap"><table class="table" style="min-width:520px"><thead><tr><th>Name</th><th>Programme</th><th>Year</th><th>Result</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td>' + esc(r.name || '—') + '</td><td>' + esc(r.programme || '') + '</td><td>' + esc(r.year || '') + '</td><td>' +
          (r.error ? '<span class="preview-err">' + esc(r.error) + '</span>' : '<span class="preview-ok">Ready</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<button class="btn btn-primary btn-block" type="button" id="imp-go" style="margin-top:14px"' + (ok.length ? '' : ' disabled') + '>' + icon('upload') + 'Import ' + ok.length + ' demo profile' + (ok.length === 1 ? '' : 's') + '</button>'
      : '<div class="empty">' + icon('file') + '<p style="margin-top:8px">Load the sample CSV to see validation in action.</p></div>';
    var go = $('#imp-go');
    if (go) go.addEventListener('click', function () {
      var r = Math.random;
      ok.forEach(function (row) {
        var first = row.name.split(' ')[0];
        Store.state.students.unshift({
          id: Store.nextId(), name: row.name, programme: row.p.name, programmeShort: row.p.short, department: row.p.dept,
          year: row.year, academicYear: '2026–2027', email: row.email || Store.emailFor(first), status: row.status,
          issued: new Date().toISOString().slice(0, 10), validThru: '2027-05-31', views: 0, scans: 0,
          avatar: Store.randomAvatar(r), emergency: { name: 'Demo Guardian (fictional)', relation: 'Parent / Guardian', phone: '+00 000 000 0000' }
        });
      });
      Store.log('upload', 'Bulk import: ' + ok.length + ' sample students added');
      UI.toast(ok.length + ' demo profiles imported');
      ui.importRows = [];
      $('#imp-text').value = '';
      resetFilters();
      show('students');
    });
  }

  /* ---------- Branding ---------- */
  var PRESETS = [['#0A1433', '#2F6BFF'], ['#3B0A45', '#C026D3'], ['#052E2B', '#14B8A6'], ['#3A0D0D', '#DC2626'], ['#1F2937', '#D97706'], ['#0B3B2E', '#65A30D']];

  function renderBranding() {
    var b = JSON.parse(JSON.stringify(Store.branding()));
    $('#view-branding').innerHTML =
      '<div class="brand-grid"><div class="panel"><form class="form-grid" id="bf" novalidate>' +
      '<div class="field full"><label>Crest / logo</label><div class="logo-upload"><span id="bf-logo"></span>' +
      '<label class="btn btn-ghost btn-sm">' + icon('upload') + 'Upload image<input type="file" accept="image/*" id="bf-file" class="sr-only"></label>' +
      '<button class="btn btn-ghost btn-sm" type="button" id="bf-rmlogo">' + icon('trash') + 'Remove</button></div><span class="hint">PNG or SVG, processed locally. Leave empty to use the monogram.</span></div>' +
      field('Institution name', '<input class="input" name="institution" maxlength="48" value="' + esc(b.institution) + '">', 'full') +
      field('Short name', '<input class="input" name="shortName" maxlength="20" value="' + esc(b.shortName) + '">') +
      field('Monogram', '<input class="input" name="monogram" maxlength="2" value="' + esc(b.monogram) + '">') +
      field('Motto', '<input class="input" name="motto" maxlength="60" value="' + esc(b.motto) + '">', 'full') +
      field('Campus address', '<input class="input" name="campus" maxlength="70" value="' + esc(b.campus) + '">', 'full') +
      field('Website', '<input class="input" name="website" value="' + esc(b.website) + '">') +
      field('ID support email', '<input class="input" name="supportEmail" value="' + esc(b.supportEmail) + '">') +
      field('Custom domain for digital IDs', '<input class="input mono" name="domain" value="' + esc(b.domain) + '">', 'full', 'Used in QR codes and share links when opened from disk, e.g. id.yourcollege.edu') +
      field('Primary colour', '<div class="color-field"><input type="color" name="primary" value="' + esc(b.primary) + '"><input class="input mono" name="primaryHex" value="' + esc(b.primary) + '"></div>') +
      field('Accent colour', '<div class="color-field"><input type="color" name="accent" value="' + esc(b.accent) + '"><input class="input mono" name="accentHex" value="' + esc(b.accent) + '"></div>') +
      '<div class="field full"><label>Colour presets</label><div class="swatches">' + PRESETS.map(function (p, i) {
        return '<button type="button" class="swatch" data-preset="' + i + '" style="background:linear-gradient(135deg,' + p[0] + ' 50%,' + p[1] + ' 50%)" aria-label="Preset ' + (i + 1) + '"></button>';
      }).join('') + '</div></div>' +
      '</form></div>' +
      '<div class="panel brand-preview"><div class="panel-head"><span class="panel-ic">' + icon('eye') + '</span><div><h3>Live preview</h3><p>Shown with the “Institution Brand” template</p></div></div>' +
      '<div class="preview-stage"><div id="bf-card"></div><div class="domain-preview">' + icon('lock') + '<span class="mono" id="bf-domain"></span></div></div>' +
      '<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><button class="btn btn-primary" type="button" id="bf-save">' + icon('check') + 'Save branding</button>' +
      '<button class="btn btn-ghost" type="button" id="bf-default">' + icon('refresh') + 'Restore defaults</button>' +
      '<button class="btn btn-ghost" type="button" id="bf-use">' + icon('layers') + 'Use brand template</button></div></div></div>';

    var f = $('#bf');
    function isHex(v) { return /^#[0-9a-f]{6}$/i.test(v); }
    function read() {
      ['institution', 'shortName', 'monogram', 'motto', 'campus', 'website', 'supportEmail', 'domain'].forEach(function (k) { b[k] = f[k].value.trim() || Store.DEFAULT_BRANDING[k]; });
      b.monogram = b.monogram.toUpperCase();
      b.primary = f.primary.value; b.accent = f.accent.value;
    }
    function preview() {
      read();
      var saved = Store.state.branding;
      Store.state.branding = b;
      try {
        $('#bf-card').innerHTML = Card.html(Store.student(Store.DEFAULT_ID) || Store.students()[0], 'institution');
        $('#bf-domain').textContent = 'https://' + b.domain.replace(/^https?:\/\//, '') + '/verify/' + Store.DEFAULT_ID;
        $('#bf-logo').innerHTML = logoHTML(b);
      } finally { Store.state.branding = saved; }
    }
    f.addEventListener('input', function (e) {
      if (e.target.name === 'primaryHex' && isHex(e.target.value)) f.primary.value = e.target.value;
      if (e.target.name === 'accentHex' && isHex(e.target.value)) f.accent.value = e.target.value;
      if (e.target.name === 'primary') f.primaryHex.value = e.target.value;
      if (e.target.name === 'accent') f.accentHex.value = e.target.value;
      preview();
    });
    $$('[data-preset]', f).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = PRESETS[+btn.getAttribute('data-preset')];
        f.primary.value = f.primaryHex.value = p[0];
        f.accent.value = f.accentHex.value = p[1];
        preview();
      });
    });
    $('#bf-file').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) return UI.toast('Please choose an image file', 'error');
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var k = Math.min(1, 192 / Math.max(img.width, img.height)), c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          b.logo = c.toDataURL('image/png');
          preview();
          UI.toast('Logo added to preview — save to apply', 'info');
        };
        img.onerror = function () { UI.toast('Could not read that image', 'error'); };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
    $('#bf-rmlogo').addEventListener('click', function () { b.logo = null; preview(); });
    $('#bf-save').addEventListener('click', function () {
      read();
      Store.setBranding(b);
      renderLayout(); show('branding');
      UI.toast('Branding saved — applied to all demo pages');
    });
    $('#bf-default').addEventListener('click', function () {
      UI.confirm('Restore default branding?', 'This resets the name, colours, logo and domain to the Nova Institute of Technology sample.', 'Restore').then(function (yes) {
        if (!yes) return;
        Store.setBranding(JSON.parse(JSON.stringify(Store.DEFAULT_BRANDING)));
        renderLayout(); show('branding');
        UI.toast('Default branding restored', 'info');
      });
    });
    $('#bf-use').addEventListener('click', function () {
      Store.setTemplate('institution');
      UI.toast('Institution Brand template set as default');
    });
    preview();
  }

  /* ---------- Templates ---------- */
  function renderTemplates() {
    var cur = Store.templateId(), s = Store.student(Store.DEFAULT_ID) || Store.students()[0];
    $('#view-templates').innerHTML = '<div class="tpl-admin">' + Store.TEMPLATES.map(function (t) {
      var on = t.id === cur;
      return '<div class="tpl-card' + (on ? ' active' : '') + '">' + Card.html(s, t.id) +
        '<div class="row"><div><h3>' + esc(t.name) + '</h3><p>' + esc(t.desc) + '</p></div>' +
        (on ? '<span class="chip chip-blue">' + icon('check') + 'Default</span>' : '<button class="btn btn-ghost btn-sm" type="button" data-tpl="' + t.id + '">Set default</button>') +
        '</div><button class="btn btn-soft btn-sm" type="button" data-tplprev="' + t.id + '">' + icon('eye') + 'Preview front &amp; back</button></div>';
    }).join('') + '</div>';
  }

  /* ---------- Global events ---------- */
  root.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-view]'))) return show(t.getAttribute('data-view'));
    if (e.target.closest('[data-new]')) return studentForm(null);
    if (e.target.closest('[data-export]')) return exportCSV();
    if ((t = e.target.closest('[data-qa]'))) {
      var a = t.getAttribute('data-qa');
      if (a === 'new') return studentForm(null);
      if (a === 'export') return exportCSV();
      return show(a);
    }
    if ((t = e.target.closest("[data-pg]"))) { ui.page += +t.getAttribute("data-pg"); return renderRows(); }
    if ((t = e.target.closest('[data-tpl]'))) {
      Store.setTemplate(t.getAttribute('data-tpl'));
      Store.log('layers', 'Default ID template set to ' + Store.template().name);
      renderTemplates();
      return UI.toast(Store.template().name + ' is now the default design');
    }
    if ((t = e.target.closest('[data-tplprev]'))) {
      var s = Store.student(Store.DEFAULT_ID) || Store.students()[0], id = t.getAttribute('data-tplprev');
      return UI.modal({
        title: Store.template(id).name, eyebrow: 'Template preview', size: 'lg',
        body: '<div class="tpl-admin" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))"><div>' + Card.html(s, id) + '</div><div>' + Card.html(s, id, { side: 'back' }) + '</div></div>'
      });
    }
    if ((t = e.target.closest('[data-row]'))) {
      var st = Store.student(t.closest('tr').getAttribute('data-id'));
      var act = t.getAttribute('data-row');
      if (act === 'qr') return openQR(st);
      if (act === 'card') return openCard(st);
      if (act === 'edit') return studentForm(st);
      if (act === 'delete') {
        return UI.confirm('Delete ' + st.name + '?', 'This removes the demo profile from this browser. You can restore everything with “Reset demo data”.', 'Delete', true).then(function (yes) {
          if (!yes) return;
          Store.removeStudent(st.id);
          Store.log('trash', 'Demo profile deleted: ' + st.name);
          renderRows();
          UI.toast('Demo profile deleted', 'info');
        });
      }
    }
    if (e.target.closest('[data-reset]')) {
      UI.confirm('Reset all demo data?', 'Restores the original sample students, branding, template and statistics on this device.', 'Reset', true).then(function (yes) {
        if (!yes) return;
        Store.reset();
        ui = { view: ui.view, q: '', dept: '', status: '', page: 1, importRows: [] };
        renderLayout(); show(ui.view);
        UI.toast('Demo data reset', 'info');
      });
    }
  });

  renderLayout();
  show((location.hash || '#overview').slice(1));
})();
