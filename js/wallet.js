/*!
 * Infinitia Links — Digital ID wallet page (hero experience).
 */
(function () {
  'use strict';

  var $ = UI.$, esc = UI.esc, icon = UI.icon;
  UI.init();

  var id = UI.currentStudentId();
  var student = Store.student(id);
  var templateId = Store.templateId();
  var b = Store.branding();

  $('#hero-inst').textContent = 'Live demo · ' + b.institution;
  $('#profile-cta').href = UI.pageUrl('profile.html', id);
  $('#verify-cta').href = UI.pageUrl('verify.html', id);
  $('#stage-hint').innerHTML = icon('flip') + 'Tap the card to flip · Tap the QR to verify';

  var card = Card.mount($('#stage'), {
    student: student,
    templateId: templateId,
    onQr: function () { go(UI.pageUrl('verify.html', id)); },
    onFlip: syncSide
  });

  function go(href) {
    document.body.classList.add('leaving');
    setTimeout(function () { location.href = href; }, 220);
  }

  /* ---------- Side toggle ---------- */
  var sideBtns = UI.$$('[data-side]');
  sideBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { card.setSide(btn.getAttribute('data-side')); });
  });
  function syncSide(side) {
    sideBtns.forEach(function (btn) {
      var on = btn.getAttribute('data-side') === side;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on);
    });
  }

  /* ---------- Action dock ---------- */
  var ACTIONS = [
    { key: 'flip', icon: 'flip', label: 'Flip card', run: function () { card.flip(); } },
    { key: 'download', icon: 'download', label: 'Download PNG', run: download },
    { key: 'wallet', icon: 'wallet', label: 'Add to Wallet', run: openAddWallet },
    { key: 'qr', icon: 'expand', label: 'Full-screen QR', run: openQR },
    { key: 'copy', icon: 'link', label: 'Copy profile link', run: function () { UI.copy(UI.publicUrl('profile', id), 'Demo profile link'); } },
    { key: 'share', icon: 'share', label: 'Share profile', run: shareProfile },
    { key: 'info', icon: 'building', label: 'Institution info', run: openInstitution },
    { key: 'profile', icon: 'user', label: 'Student profile', run: function () { go(UI.pageUrl('profile.html', id)); } }
  ];

  function renderDock() {
    var inWallet = Store.inWallet();
    $('#dock').innerHTML = ACTIONS.map(function (a) {
      var done = a.key === 'wallet' && inWallet;
      return '<button type="button" class="dock-btn' + (done ? ' is-done' : '') + '" data-action="' + a.key + '">' +
        '<span class="ico">' + icon(done ? 'check' : a.icon) + '</span>' + (done ? 'In Wallet' : a.label) + '</button>';
    }).join('');
    $('#wallet-cta').innerHTML = inWallet ? icon('check') + 'In your wallet' : icon('wallet') + 'Add to Wallet';
  }
  $('#dock').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    ACTIONS.filter(function (a) { return a.key === btn.getAttribute('data-action'); })[0].run(btn);
  });
  $('#wallet-cta').addEventListener('click', openAddWallet);
  var phoneAdd = $('#phone-add');
  phoneAdd.innerHTML = icon('plus');
  phoneAdd.addEventListener('click', openAddWallet);

  function download(btn) {
    var side = card.side;
    var label = btn && btn.lastChild;
    if (btn) { btn.disabled = true; label.textContent = 'Preparing…'; }
    Card.downloadPNG(student, templateId, side).then(function () {
      UI.toast('Sample ID downloaded (' + side + ' side)');
    }, function () {
      UI.toast('Could not create the PNG in this browser', 'error');
    }).then(function () {
      if (btn) { btn.disabled = false; label.textContent = 'Download PNG'; }
    });
  }

  function shareProfile() {
    UI.share({
      title: student.name + ' · ' + b.institution + ' (Demo)',
      text: 'View this sample student digital profile on Infinitia Links.',
      url: UI.publicUrl('profile', id)
    });
  }

  /* ---------- Full-screen QR ---------- */
  function openQR() {
    var url = UI.publicUrl('verify', id);
    var m = UI.modal({
      title: 'Verification QR', bare: true, size: 'sm', className: 'qr-full',
      body:
        '<div class="qr-full-top"><span class="eyebrow-sm" style="color:#7FB0FF;margin:0">Demo verification QR</span>' +
        '<div style="display:flex;gap:8px"><button class="icon-btn" type="button" data-fs aria-label="Enter full screen">' + icon('expand') + '</button>' +
        '<button class="icon-btn" type="button" data-close aria-label="Close">' + icon('x') + '</button></div></div>' +
        '<div class="qr-frame">' + QR.toSVG(url, { margin: 1, light: '#fff', label: 'Demo verification QR code' }) + '</div>' +
        '<div><h3>' + esc(student.name) + '</h3><p class="sub mono">' + esc(student.id) + ' · ' + esc(b.institution) + '</p></div>' +
        '<div class="url">' + esc(url) + '</div>' +
        '<div class="note">' + icon('alert') + '<span>Demo QR — opens a simulated verification page. It does not verify a real student.</span></div>' +
        '<div class="btns"><a class="btn btn-primary" href="' + UI.pageUrl('verify.html', id) + '">' + icon('shield') + 'Open verify</a>' +
        '<button class="btn btn-ghost" type="button" data-copy>' + icon('copy') + 'Copy link</button></div>'
    });
    $('[data-copy]', m.el).addEventListener('click', function () { UI.copy(url, 'Verification link'); });
    $('[data-fs]', m.el).addEventListener('click', function () {
      var el = $('.modal', m.el);
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen().catch(function () { UI.toast('Full screen is not available here', 'info'); });
      else UI.toast('Full screen is not available here', 'info');
    });
  }

  /* ---------- Institution ---------- */
  function openInstitution() {
    var depts = {}, progs = {};
    Store.PROGRAMMES.forEach(function (p) { depts[p.dept] = 1; progs[p.short] = p.name; });
    var logo = b.logo ? '<span class="inst-logo has-img"><img src="' + esc(b.logo) + '" alt=""></span>' : '<span class="inst-logo">' + esc(b.monogram) + '</span>';
    var m = UI.modal({
      title: 'Institution information', eyebrow: 'Fictional institution', size: 'md',
      body:
        '<div class="info-hero">' + logo + '<div><b style="font-size:17px">' + esc(b.institution) + '</b><p class="muted tiny">' + esc(b.motto) + '</p></div></div>' +
        '<div class="kv">' +
        '<div><span class="k">Campus</span><span class="v">' + esc(b.campus) + '</span></div>' +
        '<div><span class="k">Website</span><span class="v mono">' + esc(b.website) + '</span></div>' +
        '<div><span class="k">ID card support</span><span class="v">' + esc(b.supportEmail) + '</span></div>' +
        '<div><span class="k">Digital ID domain</span><span class="v mono">' + esc(b.domain) + '</span></div>' +
        '</div>' +
        '<h4 style="margin:18px 0 8px;font-size:14px">Departments</h4><div class="tag-list">' + Object.keys(depts).map(function (d) { return '<span class="chip">' + esc(d) + '</span>'; }).join('') + '</div>' +
        '<h4 style="margin:16px 0 8px;font-size:14px">Academic programmes</h4><div class="tag-list">' + Object.keys(progs).map(function (k) { return '<span class="chip chip-blue" title="' + esc(progs[k]) + '">' + esc(k) + '</span>'; }).join('') + '</div>' +
        '<div class="callout callout-blue" style="margin-top:18px">' + icon('sparkles') + '<span><b>Your institution here.</b> Infinitia Links can be deployed under your own crest, colours and a custom domain such as <span class="mono">id.yourcollege.edu</span>.</span></div>' +
        '<div class="callout" style="margin-top:10px">' + icon('alert') + '<span>Nova Institute of Technology is a fictional institution created for demonstration. It is not affiliated with any real college or university.</span></div>',
      footer: '<button class="btn btn-ghost" type="button" data-web>' + icon('globe') + 'Visit website</button><a class="btn btn-primary" href="admin.html">' + icon('grid') + 'Admin preview</a>'
    });
    $('[data-web]', m.el).addEventListener('click', function () {
      UI.toast(b.website + ' is a demo address — in production this opens the college website', 'info');
    });
  }

  /* ---------- Wallet ---------- */
  function openAddWallet() {
    if (Store.inWallet()) {
      var r = UI.modal({
        title: 'Already in your wallet', eyebrow: 'Infinitia Wallet · Simulated', size: 'sm',
        body: '<div class="add-wallet"><div class="aw-card">' + Card.html(student, templateId) + '</div><p>This sample card is saved in the simulated wallet on this device.</p></div>',
        footer: '<button class="btn btn-ghost" type="button" data-remove>' + icon('trash') + 'Remove</button><button class="btn btn-primary" type="button" data-view>' + icon('wallet') + 'View wallet</button>'
      });
      $('[data-remove]', r.el).addEventListener('click', function () {
        Store.setWallet(false); r.close(); renderDock(); renderPasses(); UI.toast('Removed from simulated wallet', 'info');
      });
      $('[data-view]', r.el).addEventListener('click', function () { r.close(); $('#wallet').scrollIntoView({ behavior: 'smooth' }); });
      return;
    }
    var m = UI.modal({
      title: 'Add to Infinitia Wallet', eyebrow: 'Simulated wallet', size: 'sm',
      body: '<div class="add-wallet"><div class="aw-card">' + Card.html(student, templateId) + '</div>' +
        '<div class="aw-slot">' + icon('wallet') + '</div>' +
        '<p>Save this sample ID to the simulated phone wallet. No real wallet app or account is used.</p></div>',
      footer: '<button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="button" data-add>' + icon('plus') + 'Add to Wallet</button>'
    });
    var addBtn = $('[data-add]', m.el);
    addBtn.addEventListener('click', function () {
      addBtn.disabled = true;
      var wrap = $('.add-wallet', m.el);
      wrap.classList.add('adding');
      setTimeout(function () {
        wrap.classList.add('done');
        $('.aw-slot', wrap).innerHTML = icon('check');
        $('p', wrap).textContent = 'Added! Your sample ID is now in the wallet.';
        Store.setWallet(true);
        renderDock();
      }, 850);
      setTimeout(function () {
        m.close();
        renderPasses(true);
        $('#wallet').scrollIntoView({ behavior: 'smooth', block: 'center' });
        UI.toast('Sample ID added to wallet');
      }, 1800);
    });
  }

  function renderPasses(animateNew) {
    var lib = UI.publicUrl('profile', id) + '#library';
    var html =
      '<button type="button" class="pass pass-simple pass-lib"><div class="pass-top"><span>Library Access</span><small>DEMO PASS</small></div>' +
      '<div class="pass-bot"><div><span>Member</span><b>' + esc(student.name) + '</b></div><span class="pass-qr">' + QR.toSVG(lib) + '</span></div></button>' +
      '<button type="button" class="pass pass-simple pass-event"><div class="pass-top"><span>Nova TechFest 2026</span><small>EVENT · DEMO</small></div>' +
      '<div class="pass-bot"><div><span>14 Nov · Main Auditorium</span><b>General Entry</b></div><span class="pass-qr">' + QR.toSVG(lib + '-event') + '</span></div></button>';
    if (Store.inWallet()) {
      html += '<button type="button" class="pass pass-id' + (animateNew ? ' pass-new' : '') + '" aria-label="Student ID pass">' + Card.html(student, templateId) + '</button>';
    } else {
      html += '<button type="button" class="pass pass-empty" data-add-pass>' + icon('plus') + '<b>Add your ' + esc(Store.branding().shortName) + ' ID</b><span>Tap to save the sample card here</span></button>';
    }
    $('#passes').innerHTML = html;
  }
  $('#passes').addEventListener('click', function (e) {
    var p = e.target.closest('.pass');
    if (!p) return;
    if (p.hasAttribute('data-add-pass')) return openAddWallet();
    if (p.classList.contains('pass-id')) return openQR();
    var was = p.classList.contains('expanded');
    UI.$$('.pass', $('#passes')).forEach(function (x) { x.classList.remove('expanded'); });
    if (!was) p.classList.add('expanded');
  });

  /* ---------- Templates ---------- */
  function renderTemplates() {
    var t = Store.template(templateId);
    $('#chip-template').innerHTML = icon('layers') + 'Design: ' + esc(t.name);
    $('#templates').innerHTML = Store.TEMPLATES.map(function (tp) {
      var on = tp.id === templateId;
      return '<button type="button" class="tpl' + (on ? ' active' : '') + '" data-tpl="' + tp.id + '" aria-pressed="' + on + '">' +
        Card.html(student, tp.id) + '<span class="tpl-name">' + esc(tp.name) + (on ? icon('check') : '') + '</span></button>';
    }).join('');
  }
  $('#templates').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-tpl]');
    if (!btn || btn.getAttribute('data-tpl') === templateId) return;
    templateId = btn.getAttribute('data-tpl');
    Store.setTemplate(templateId);
    card.update({ templateId: templateId });
    renderTemplates();
    renderStatus();
    if (Store.inWallet()) renderPasses();
    UI.toast(Store.template(templateId).name + ' design applied');
  });

  /* ---------- Status ---------- */
  function renderStatus() {
    var on = student.status === 'active';
    $('#status').innerHTML =
      '<div class="status-hero' + (on ? '' : ' off') + '"><span class="status-ring">' + icon(on ? 'check' : 'x') + '</span>' +
      '<div><b>' + (on ? 'Demo Active' : 'Demo Inactive') + '</b><span>' + (on ? 'Scans show this card as an active demo profile.' : 'This demo profile has been deactivated by the admin.') + '</span></div></div>' +
      '<div class="kv">' +
      '<div><span class="k">Student ID</span><span class="v mono">' + esc(student.id) + '</span></div>' +
      '<div><span class="k">Issued</span><span class="v">' + UI.fmtDate(student.issued) + '</span></div>' +
      '<div><span class="k">Valid through</span><span class="v">' + UI.fmtDate(student.validThru) + '</span></div>' +
      '<div><span class="k">Profile views</span><span class="v">' + UI.fmtNum(student.views) + '</span></div>' +
      '<div><span class="k">QR scans</span><span class="v">' + UI.fmtNum(student.scans) + '</span></div>' +
      '<div><span class="k">Card design</span><span class="v">' + esc(Store.template(templateId).name) + '</span></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">' +
      '<a class="btn btn-primary btn-sm" href="' + UI.pageUrl('verify.html', id) + '">' + icon('shield') + 'Open verification</a>' +
      '<button class="btn btn-ghost btn-sm" type="button" id="status-qr">' + icon('qr') + 'Show QR</button></div>';
    $('#status-qr').addEventListener('click', openQR);
  }

  /* ---------- Keyboard shortcuts ---------- */
  document.addEventListener('keydown', function (e) {
    if (document.body.classList.contains('modal-open') || /input|textarea|select/i.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'f') card.flip();
    if (e.key === 'q') openQR();
  });

  renderDock();
  renderTemplates();
  renderStatus();
  renderPasses();
})();
