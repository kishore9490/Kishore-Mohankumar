/*!
 * Infinitia Links — student digital profile page.
 */
(function () {
  'use strict';

  var $ = UI.$, esc = UI.esc, icon = UI.icon;
  UI.init();

  var id = UI.currentStudentId();
  var s = Store.student(id);
  var b = Store.branding();
  var templateId = Store.templateId();
  var on = s.status === 'active';
  Store.recordView(id);

  var SHORTCUTS = [
    { key: 'web', icon: 'globe', title: 'College website', sub: b.website, color: 'linear-gradient(135deg,#2F6BFF,#38BDF8)' },
    { key: 'library', icon: 'book', title: 'Library portal', sub: 'Catalogue & e-resources', color: 'linear-gradient(135deg,#0F766E,#14B8A6)' },
    { key: 'lms', icon: 'cap', title: 'Learning (LMS)', sub: 'Courses & assignments', color: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
    { key: 'support', icon: 'support', title: 'Student support', sub: 'Help desk & wellbeing', color: 'linear-gradient(135deg,#E11D48,#F97316)' }
  ];

  var ANNOUNCEMENTS = [
    { icon: 'megaphone', title: 'Mid-semester break schedule published', text: 'Classes pause for one week. Check your department page for details.', when: '2 days ago' },
    { icon: 'book', title: 'Library extended hours during exam prep', text: 'Reading rooms open until 11 pm from next Monday (sample notice).', when: '4 days ago' },
    { icon: 'sparkles', title: 'Hackathon registrations are open', text: 'Form teams of up to four. Mentors from the Computer Science department.', when: '1 week ago' }
  ];

  var EVENTS = [
    { id: 'techfest', mon: 'NOV', day: '14', title: 'Nova TechFest 2026', text: 'Main Auditorium · 10:00 am · Projects, robotics & talks' },
    { id: 'ai-talk', mon: 'NOV', day: '20', title: 'Guest lecture: AI in Education', text: 'Seminar Hall B · 2:30 pm' },
    { id: 'sports', mon: 'DEC', day: '03', title: 'Inter-department sports meet', text: 'Campus Grounds · All day' },
    { id: 'culture', mon: 'DEC', day: '12', title: 'Cultural evening & alumni meet', text: 'Open-air Theatre · 6:00 pm' }
  ];

  function logoHTML(cls) {
    return b.logo ? '<span class="inst-logo has-img ' + (cls || '') + '"><img src="' + esc(b.logo) + '" alt=""></span>' : '<span class="inst-logo ' + (cls || '') + '">' + esc(b.monogram) + '</span>';
  }

  function render() {
    var e = s.emergency || {};
    var verifyUrl = UI.publicUrl('verify', id);
    $('#profile').innerHTML =
      '<div class="container"><div class="profile-cover"></div>' +
      '<section class="profile-head">' +
      '<div class="avatar-xl"><img src="' + Card.avatarURL(s, 400) + '" alt="Illustrated sample avatar for ' + esc(s.name) + '"></div>' +
      '<div><span class="eyebrow-sm">Student digital profile · Demo</span><h1>' + esc(s.name) + '</h1>' +
      '<p class="meta">' + esc(s.programme) + ' · ' + esc(s.year) + '</p>' +
      '<div class="profile-chips"><span class="chip mono">' + icon('idcard') + esc(s.id) + '</span>' +
      '<span class="chip ' + (on ? 'chip-green' : 'chip-red') + '">' + icon(on ? 'check' : 'x') + (on ? 'Demo Active' : 'Demo Inactive') + '</span>' +
      '<span class="chip">' + icon('building') + esc(b.institution) + '</span></div></div>' +
      '<div class="profile-actions">' +
      '<a class="btn btn-primary" href="' + UI.pageUrl('index.html', id) + '">' + icon('idcard') + 'View digital ID</a>' +
      '<button class="btn btn-ghost" type="button" data-act="share">' + icon('share') + 'Share</button>' +
      '<button class="btn btn-ghost" type="button" data-act="copy">' + icon('link') + 'Copy link</button></div>' +
      '</section>' +

      '<div class="profile-grid"><div class="stack">' +

      // Academic info
      '<section class="panel"><div class="panel-head"><span class="panel-ic">' + icon('cap') + '</span><div><h2>Academic information</h2><p>Sample record for demonstration</p></div></div>' +
      '<div class="info-grid">' +
      item('Programme', s.programme) + item('Short name', s.programmeShort) + item('Department', s.department) +
      item('Year of study', s.year) + item('Academic year', s.academicYear) + item('Institution email', s.email) +
      '</div></section>' +

      // Shortcuts
      '<section class="panel" id="library"><div class="panel-head"><span class="panel-ic">' + icon('bolt') + '</span><div><h2>Campus shortcuts</h2><p>Demonstration shortcuts — no real systems are connected</p></div></div>' +
      '<div class="shortcuts">' + SHORTCUTS.map(function (sc) {
        return '<button type="button" class="shortcut" data-sc="' + sc.key + '"><span class="ico" style="background:' + sc.color + '">' + icon(sc.icon) + '</span><b>' + esc(sc.title) + '</b><span>' + esc(sc.sub) + '</span></button>';
      }).join('') + '</div></section>' +

      // Announcements
      '<section class="panel"><div class="panel-head"><span class="panel-ic">' + icon('megaphone') + '</span><div><h2>Campus announcements</h2><p>Sample notices</p></div></div>' +
      '<div class="list">' + ANNOUNCEMENTS.map(function (a) {
        return '<div class="list-item"><span class="ico">' + icon(a.icon) + '</span><div><b>' + esc(a.title) + '</b><p>' + esc(a.text) + '</p></div><span class="when">' + esc(a.when) + '</span></div>';
      }).join('') + '</div></section>' +

      // Events
      '<section class="panel"><div class="panel-head"><span class="panel-ic">' + icon('calendar') + '</span><div><h2>Events &amp; activities</h2><p>Mark interest to see how engagement works</p></div></div>' +
      '<div class="list" id="events"></div></section>' +

      '</div><div class="stack">' +

      // Digital ID
      '<section class="panel"><div class="panel-head"><span class="panel-ic">' + icon('idcard') + '</span><div><h2>Digital ID</h2><p>' + esc(Store.template(templateId).name) + ' design</p></div></div>' +
      '<a href="' + UI.pageUrl('index.html', id) + '" aria-label="Open digital ID card">' + Card.html(s, templateId) + '</a>' +
      '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><a class="btn btn-soft btn-sm" href="' + UI.pageUrl('index.html', id) + '">' + icon('flip') + 'Open &amp; flip</a>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-act="download">' + icon('download') + 'Download PNG</button></div></section>' +

      // QR
      '<section class="panel"><div class="panel-head"><span class="panel-ic">' + icon('shield') + '</span><div><h2>QR verification</h2><p>Scan or tap to open the demo verification</p></div></div>' +
      '<div class="qr-panel"><a class="qr-box" href="' + UI.pageUrl('verify.html', id) + '" aria-label="Open demo verification">' + QR.toSVG(verifyUrl, { label: 'Demo verification QR code' }) + '</a>' +
      '<p class="tiny muted mono" style="word-break:break-all">' + esc(verifyUrl) + '</p>' +
      '<a class="btn btn-primary btn-block" href="' + UI.pageUrl('verify.html', id) + '">' + icon('scan') + 'Simulate a scan</a></div></section>' +

      // Institution
      '<section class="panel"><div class="panel-head"><span class="panel-ic">' + icon('building') + '</span><div><h2>Institution details</h2><p>Fictional institution</p></div></div>' +
      '<div class="info-hero" style="margin-bottom:6px">' + logoHTML() + '<div><b>' + esc(b.institution) + '</b><p class="tiny muted">' + esc(b.motto) + '</p></div></div>' +
      '<div class="kv">' +
      '<div><span class="k">Campus</span><span class="v">' + esc(b.campus) + '</span></div>' +
      '<div><span class="k">Website</span><span class="v mono">' + esc(b.website) + '</span></div>' +
      '<div><span class="k">ID support</span><span class="v">' + esc(b.supportEmail) + '</span></div></div></section>' +

      // Emergency
      '<section class="panel"><div class="panel-head"><span class="panel-ic" style="background:rgba(244,63,94,.12);color:var(--red)">' + icon('phone') + '</span><div><h2>Emergency contacts</h2><p>Fictional demo data — do not call</p></div></div>' +
      '<div class="emergency">' +
      emg('user', e.name || 'Demo Guardian', (e.relation || 'Guardian') + ' · ' + (e.phone || '')) +
      emg('shield', 'Campus Security (demo)', 'Ext. 100 · 24 × 7') +
      emg('support', 'Health Centre (demo)', 'Ext. 220 · 8 am – 8 pm') +
      '</div></section>' +

      '</div></div></div>';

    renderEvents();
  }

  function item(label, val) { return '<div class="info-item"><span>' + esc(label) + '</span><b>' + esc(val) + '</b></div>'; }
  function emg(ic, name, sub) {
    return '<div class="emg"><span class="ico">' + icon(ic) + '</span><div><b>' + esc(name) + '</b><span>' + esc(sub) + '</span></div>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-act="call" aria-label="Call ' + esc(name) + ' (demo)">' + icon('phone') + '</button></div>';
  }

  function renderEvents() {
    $('#events').innerHTML = EVENTS.map(function (ev) {
      var going = Store.eventInterest(ev.id);
      return '<div class="list-item event-row"><div class="date-badge"><small>' + ev.mon + '</small><b>' + ev.day + '</b></div>' +
        '<div><b>' + esc(ev.title) + '</b><p>' + esc(ev.text) + '</p></div>' +
        '<button type="button" class="btn btn-sm ' + (going ? 'btn-soft' : 'btn-ghost') + '" data-event="' + ev.id + '">' + icon(going ? 'check' : 'plus') + '<span>' + (going ? 'Interested' : 'Interest') + '</span></button></div>';
    }).join('');
  }

  function openShortcut(key) {
    var sc = SHORTCUTS.filter(function (x) { return x.key === key; })[0];
    var hosts = { web: b.website, library: 'library.' + b.website.replace(/^www\./, ''), lms: 'learn.' + b.website.replace(/^www\./, ''), support: 'support.' + b.website.replace(/^www\./, '') };
    UI.modal({
      title: sc.title, eyebrow: 'Demo shortcut', size: 'sm',
      body: '<div class="info-hero"><span class="inst-logo" style="background:' + sc.color + '">' + icon(sc.icon) + '</span><div><b>' + esc(sc.title) + '</b><p class="tiny muted mono">' + esc(hosts[key]) + '</p></div></div>' +
        '<p class="muted">In a live deployment this shortcut opens the institution\'s own ' + esc(sc.title.toLowerCase()) + '. Institutions choose which links appear on every student profile.</p>' +
        '<div class="callout" style="margin-top:14px">' + icon('info') + '<span>This is a demonstration shortcut. It does not connect to any real portal or account.</span></div>',
      footer: '<button class="btn btn-primary" type="button" data-close>Got it</button>'
    });
  }

  $('#profile').addEventListener('click', function (e) {
    var t = e.target.closest('[data-act],[data-sc],[data-event]');
    if (!t) return;
    if (t.hasAttribute('data-sc')) return openShortcut(t.getAttribute('data-sc'));
    if (t.hasAttribute('data-event')) {
      var going = Store.toggleEvent(t.getAttribute('data-event'));
      renderEvents();
      return UI.toast(going ? 'Marked as interested (demo)' : 'Interest removed', going ? 'success' : 'info');
    }
    var act = t.getAttribute('data-act');
    if (act === 'share') UI.share({ title: s.name + ' · ' + b.institution + ' (Demo)', text: 'View this sample student digital profile on Infinitia Links.', url: UI.publicUrl('profile', id) });
    if (act === 'copy') UI.copy(UI.publicUrl('profile', id), 'Demo profile link');
    if (act === 'download') Card.downloadPNG(s, templateId, 'front').then(function () { UI.toast('Sample ID downloaded'); });
    if (act === 'call') UI.toast('Demo contact — calling is disabled in this preview', 'info');
  });

  document.title = s.name + ' · Student Profile · Infinitia Links (Demo)';
  render();
})();
