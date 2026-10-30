/*!
 * Infinitia Links — simulated QR verification page.
 * Never claims to verify a real student: every result is labelled DEMO.
 */
(function () {
  'use strict';

  var $ = UI.$, esc = UI.esc, icon = UI.icon;
  UI.init();

  var b = Store.branding();
  var box = $('#verify-card');
  var timers = [];

  function header(sub) {
    return '<div class="verify-top"><span class="badge-ic">' + icon('shield') + '</span>' +
      '<div><h1>DEMO IDENTITY VERIFICATION</h1><p>' + esc(sub) + '</p></div></div>';
  }

  function verify(id, animate) {
    timers.forEach(clearTimeout);
    timers = [];
    var s = Store.student(id);
    history.replaceState(null, '', UI.pageUrl('verify.html', id));
    renderSim(id);

    if (!s) {
      box.innerHTML = header('Simulated scan result') +
        '<div class="verify-body"><div class="not-found result-in">' + icon('alert') +
        '<h2>No demo record found</h2><p class="muted">The code <span class="mono">' + esc(id) + '</span> does not match any sample profile in this demo.</p>' +
        '<div class="demo-warning" style="text-align:left">' + icon('alert') + '<div><b>This is a demonstration verification service.</b><p>It cannot verify real students or official credentials.</p></div></div></div></div>';
      return;
    }

    if (animate) {
      var steps = ['Reading QR code', 'Looking up demo record', 'Checking demo status'];
      box.innerHTML = header('Simulated scan in progress…') +
        '<div class="scan-state"><div class="scan-box">' + QR.toSVG(UI.publicUrl('verify', id)) + '</div>' +
        '<b>Verifying demo credential…</b><div class="scan-steps">' +
        steps.map(function (t) { return '<div>' + icon('check') + t + '</div>'; }).join('') + '</div></div>';
      UI.$$('.scan-steps div', box).forEach(function (el, i) {
        timers.push(setTimeout(function () { el.classList.add('on'); }, 350 + i * 420));
      });
      timers.push(setTimeout(function () { showResult(s); }, 1700));
    } else {
      showResult(s);
    }
  }

  function showResult(s) {
    Store.recordScan(s.id);
    var on = s.status === 'active';
    var ref = 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    var now = new Date();
    box.innerHTML = header('Simulated result · ' + b.institution) +
      '<div class="verify-body result-in">' +
      '<div class="verdict"><span class="avatar-md"><img src="' + Card.avatarURL(s, 240) + '" alt="Illustrated sample avatar"></span>' +
      '<div><h2>' + esc(s.name) + '</h2><p class="muted mono" style="font-size:13px;margin:2px 0 10px">' + esc(s.id) + '</p>' +
      '<span class="big-status' + (on ? '' : ' off') + '">' + icon(on ? 'check' : 'x') + (on ? 'DEMO ACTIVE' : 'DEMO INACTIVE') + '</span></div></div>' +
      '<div class="demo-warning" role="alert">' + icon('alert') + '<div><b>This is a demonstration identity card. It is not an official student credential.</b>' +
      '<p>Nova Institute of Technology is fictional. This page does not verify any real person, enrolment or institution.</p></div></div>' +
      '<div class="verify-table">' +
      row('Institution', b.institution) +
      row('Student', s.name) +
      row('Student ID', '<span class="mono">' + esc(s.id) + '</span>', true) +
      row('Programme', s.programmeShort) +
      row('Department', s.department) +
      row('Academic year', s.academicYear + ' · ' + s.year) +
      row('Status', on ? 'DEMO ACTIVE' : 'DEMO INACTIVE (deactivated by demo admin)') +
      '</div>' +
      '<div class="verify-meta"><span>' + icon('clock') + 'Checked ' + now.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) + '</span>' +
      '<span>' + icon('file') + 'Ref ' + ref + '</span><span>' + icon('lock') + 'Simulated by Infinitia Links</span></div>' +
      '<div class="verify-actions">' +
      '<a class="btn btn-primary" href="' + UI.pageUrl('profile.html', s.id) + '">' + icon('user') + 'View demo profile</a>' +
      '<a class="btn btn-ghost" href="' + UI.pageUrl('index.html', s.id) + '">' + icon('idcard') + 'View card</a>' +
      '<button class="btn btn-ghost" type="button" data-rescan>' + icon('refresh') + 'Scan again</button></div>' +
      '</div>';
    $('[data-rescan]', box).addEventListener('click', function () { verify(s.id, true); });
  }

  function row(k, v, raw) { return '<div><span>' + esc(k) + '</span><b>' + (raw ? v : esc(v)) + '</b></div>'; }

  function renderSim(activeId) {
    var q = ($('#sim-search').value || '').toLowerCase();
    var list = Store.students().filter(function (s) {
      return !q || (s.name + ' ' + s.id + ' ' + s.programmeShort).toLowerCase().indexOf(q) !== -1;
    });
    $('#sim-list').innerHTML = list.length ? list.map(function (s) {
      var on = s.status === 'active';
      return '<button type="button" class="sim-item' + (s.id === activeId ? ' active' : '') + '" data-id="' + esc(s.id) + '">' +
        '<img src="' + Card.avatarURL(s, 120) + '" alt=""><div><b>' + esc(s.name) + '</b><span class="mono">' + esc(s.id) + '</span></div>' +
        '<span class="chip ' + (on ? 'chip-green' : 'chip-red') + '">' + (on ? 'Active' : 'Inactive') + '</span></button>';
    }).join('') : '<p class="muted center tiny" style="padding:20px">No sample students match.</p>';
  }

  $('#sim-list').addEventListener('click', function (e) {
    var it = e.target.closest('[data-id]');
    if (!it) return;
    verify(it.getAttribute('data-id'), true);
    if (window.innerWidth < 1000) box.scrollIntoView({ behavior: 'smooth' });
  });
  $('#sim-search').addEventListener('input', function () { renderSim(UI.param('id')); });

  verify(UI.param('id') || Store.DEFAULT_ID, true);
})();
