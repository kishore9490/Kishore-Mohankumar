/* Infinitia Links — proposal mockup generator. All people and organisations are FICTIONAL. */
(function () {
  'use strict';

  var P = {
    x: '<path d="M18 6 6 18M6 6l12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20M16 15h2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.9"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    grid: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    idcard: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16a3 3 0 0 1 6 0M14 10h4M14 14h4"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16v-8"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A5.6 5.6 0 0 0 22 9.8C22 5.5 17.5 2 12 2Z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M16 13H8M16 17H8"/>',
    mega: '<path d="m3 11 18-5v12L3 14v-3Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4M12 17h.01"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    chev: '<path d="m9 18 6-6-6-6"/>', back: '<path d="m15 18-6-6 6-6"/>',
    more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    nfc: '<path d="M6 8.3a6 6 0 0 1 0 7.4M9.5 6a10 10 0 0 1 0 12M13 3.8a14 14 0 0 1 0 16.4"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    api: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    cloud: '<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4.3 12 3.5 3.5 0 0 0 5.5 19Z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    sos: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5Z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    nav: '<path d="m3 11 19-9-9 19-2-8-8-2Z"/>'
  };
  function ic(n, c) { return '<svg class="ic ' + (c || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (P[n] || '') + '</svg>'; }

  /* Faceless professional avatar (no real people) */
  function avatar(a) {
    var id = 'g' + Math.random().toString(36).slice(2, 8);
    var back = a.style === 'long' ? '<path d="M30 52 C27 28 40 22 50 22 C61 22 73 28 70 52 L73 92 L27 92 Z" fill="' + a.hair + '"/>' : '';
    var hair = {
      short: '<path d="M32.5 50 C31 30 41 25.5 50 25.5 C60 25.5 69.5 30.5 67.5 50 C65 41 58 37 50 37.5 C42 37.5 35.5 41.5 32.5 50Z" fill="' + a.hair + '"/>',
      side: '<path d="M32.5 51 C30.5 31 41 25 51 25.5 C61 26 70 31 67.5 49 C63 39 52 35.5 43 38.5 C38 40.5 34.5 45 32.5 51Z" fill="' + a.hair + '"/>',
      long: '<path d="M32.5 49 C33 30 43 26 51 26.5 C60 27 67.5 32.5 67.5 49 C61 40 54 36.5 46 38.5 C40 40 36 44 32.5 49Z" fill="' + a.hair + '"/>',
      bun: '<path d="M32.5 50 C31 31 41 26 50 26 C60 26 69 31 67.5 50 C64 41 58 37.5 50 38 C42 38 36 41.5 32.5 50Z" fill="' + a.hair + '"/><circle cx="50" cy="21" r="8" fill="' + a.hair + '"/>',
      bald: '<path d="M33 46 C34 33 42 28.5 50 28.5 C58 28.5 66 33 67 46 C63 40 57 37.5 50 37.5 C43 37.5 37 40 33 46Z" fill="' + a.hair + '" opacity=".55"/>'
    }[a.style];
    var extra = a.coat ? '<path d="M12 120 C14 96 30 83 42 81 L50 104 L58 81 C70 83 86 96 88 120Z" fill="#fff"/><path d="M42 81 L50 104 L58 81" fill="none" stroke="#D9DEE8" stroke-width="1.2"/>' : '';
    return '<svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + a.bg[0] + '"/><stop offset="1" stop-color="' + a.bg[1] + '"/></linearGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a.skin + '"/><stop offset="1" stop-color="' + shade(a.skin, -0.08) + '"/></linearGradient></defs>' +
      '<rect width="100" height="120" fill="url(#' + id + ')"/><circle cx="50" cy="52" r="40" fill="#fff" opacity=".22"/>' + back +
      '<path d="M8 120 C10 96 28 81 50 81 C72 81 90 96 92 120Z" fill="' + a.shirt + '"/>' + extra +
      (a.coat ? '' : '<path d="M41 81.5 L50 96 L59 81.5Z" fill="' + (a.collar || '#fff') + '"/>') +
      '<rect x="44" y="63" width="12" height="21" rx="5" fill="' + shade(a.skin, -0.12) + '"/>' +
      '<ellipse cx="33.5" cy="54" rx="3.2" ry="4.5" fill="' + shade(a.skin, -0.05) + '"/><ellipse cx="66.5" cy="54" rx="3.2" ry="4.5" fill="' + shade(a.skin, -0.05) + '"/>' +
      '<ellipse cx="50" cy="51" rx="16.5" ry="19.5" fill="url(#' + id + 's)"/>' + hair +
      (a.glasses ? '<g fill="none" stroke="' + a.hair + '" stroke-width="1.3" opacity=".75"><rect x="38" y="49" width="9.5" height="6.5" rx="2.6"/><rect x="52.5" y="49" width="9.5" height="6.5" rx="2.6"/><path d="M47.5 52h5"/></g>' : '') +
      '</svg>';
  }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    return 'rgb(' + Math.round(r + (t - r) * p) + ',' + Math.round(g + (t - g) * p) + ',' + Math.round(b + (t - b) * p) + ')';
  }

  /* ---------- Fictional people & organisations ---------- */
  var PEOPLE = {
    professor: { name: 'Dr. Meera Raghavan', des: 'Professor', dep: 'Department of Computer Science', org: 'Aldervale University', short: 'AU', sub: 'Faculty Identity', id: 'AVU-FAC-0427', branch: 'Main Campus', cat: 'Teaching Faculty', joined: '12 Jul 2015', valid: '30 Jun 2027', tpl: 't-university', token: '7hQ2xK9aPzW4',
      av: { skin: '#C98E68', hair: '#1E1612', style: 'bun', shirt: '#4A1022', collar: '#E9D9B5', bg: ['#F3E7D6', '#E3CFB0'], glasses: true } },
    admin: { name: 'Sanjay Kulkarni', des: 'Administrative Officer', dep: 'Office of the Registrar', org: 'Brightmere College of Engineering', short: 'BC', sub: 'Staff Identity', id: 'BCE-ADM-1182', branch: 'City Campus', cat: 'Administrative Staff', joined: '03 Jan 2019', valid: '31 Mar 2027', tpl: 't-white', token: 'Rm8Tq3VbL6sN',
      av: { skin: '#B97E58', hair: '#231A15', style: 'side', shirt: '#2B4C8C', bg: ['#E3ECFF', '#C9D9FB'] } },
    corporate: { name: 'Priya Nair', des: 'Senior Product Engineer', dep: 'Platform Engineering', org: 'Orbitra Technologies', short: 'OT', sub: 'Employee Identity', id: 'ORB-E-20931', branch: 'Bengaluru Tech Park', cat: 'Full-time Employee', joined: '18 Aug 2021', valid: '31 Dec 2026', tpl: 't-corporate', token: 'Kf5Lp9ZcR2tY',
      av: { skin: '#D6A07A', hair: '#1B1411', style: 'long', shirt: '#1D2B53', bg: ['#DCE8FF', '#B8CEFF'] } },
    hospital: { name: 'Anjali Thomas', des: 'Staff Nurse', dep: 'Critical Care Unit', org: 'Halcyon Care Hospital', short: 'HC', sub: 'Staff Identity', id: 'HCH-N-3304', branch: 'Main Hospital', cat: 'Nursing Staff', joined: '09 May 2020', valid: '31 May 2027', tpl: 't-health', token: 'Wd7Nh2KqP8xE',
      av: { skin: '#C48A63', hair: '#2A1D16', style: 'bun', shirt: '#0E7C76', bg: ['#DDF5F1', '#B9E8E0'], coat: true } },
    field: { name: 'Rahul Verma', des: 'Field Service Engineer', dep: 'Customer Field Operations', org: 'Northwind Field Services', short: 'NW', sub: 'Field Staff Identity', id: 'NWF-FE-5521', branch: 'Pune West Region', cat: 'Field Workforce', joined: '21 Feb 2022', valid: '28 Feb 2027', tpl: 't-dark', token: 'Pz4Gc8Hm1VqJ',
      av: { skin: '#B07650', hair: '#15100D', style: 'short', shirt: '#2A3140', bg: ['#E6E3DA', '#CFC8B6'] } },
    agent: { name: 'Imran Shaikh', des: 'Authorised Collection Executive', dep: 'Trustline Recovery Services · for Kestrel Finserv', org: 'Kestrel Finserv', short: 'KF', sub: 'Authorised Agent Identity', id: 'KFS-AGT-0786', branch: 'Thane Zone (lender-approved)', cat: 'Agency Personnel', joined: '01 Apr 2024', valid: '31 Mar 2027', tpl: 't-finance', token: 'Ty6Bv3QwN9mK',
      av: { skin: '#BE845D', hair: '#1A1310', style: 'short', shirt: '#0D3B4F', bg: ['#DDF3EE', '#B9E3D9'], glasses: false } }
  };
  var TPL_NAMES = { 't-corporate': 'Premium Corporate Blue', 't-white': 'Modern Minimal White', 't-dark': 'Premium Dark', 't-university': 'University Institutional', 't-health': 'Healthcare Professional', 't-finance': 'Financial Services' };

  function demoUrl(p) { return 'https://verify.example/demo/' + p.token; }
  function qr(p) { return QR.toSVG('DEMO-ONLY https://verify.example/demo/' + p.token, { label: 'Demonstration QR' }); }

  function card(p, tpl) {
    tpl = tpl || p.tpl;
    var banded = tpl === 't-university' || tpl === 't-health' || tpl === 't-white';
    return '<div class="cw"><div class="card ' + tpl + '">' + (banded ? '<div class="band"></div>' : '') + '<div class="pattern"></div><div class="wm">DEMO</div>' +
      '<div class="head"><span class="crest">' + p.short + '</span><div class="org"><b>' + p.org + '</b><span>' + p.sub + '</span></div></div>' +
      '<div class="photo">' + avatar(p.av) + '</div>' +
      '<div class="cwho"><b>' + p.name + '</b><span class="des">' + p.des + '</span><span class="dep">' + p.dep + '</span></div>' +
      '<div class="grid"><div><span>Employee ID</span><b class="mono">' + p.id + '</b></div><div><span>' + (p === PEOPLE.agent ? 'Service area' : 'Branch / Location') + '</span><b>' + p.branch + '</b></div>' +
      '<div><span>Category</span><b>' + p.cat + '</b></div><div><span>Valid until</span><b>' + p.valid + '</b></div></div>' +
      '<div class="bottom"><div class="qr">' + qr(p) + '</div><div class="st"><span class="pill active"><i></i>Active</span><small>Scan to verify live status<br>Demo QR · not a live link</small></div></div>' +
      '<div class="foot"><span>Demo · Not valid ID</span><em>Powered by Infinitia Links</em></div></div></div>';
  }

  function phoneShell(inner, opts) {
    opts = opts || {};
    return '<div class="phone"><div class="screen" style="' + (opts.bg ? 'background:' + opts.bg : '') + '"><div class="island"></div>' +
      '<div class="sbar" style="color:' + (opts.sbar || '#0B1433') + '"><span>9:41</span><span class="r"><i style="height:5px"></i><i style="height:8px"></i><i style="height:11px"></i><span class="bat"></span></span></div>' +
      inner + '<div class="home-ind"></div></div></div>';
  }

  function phoneId(p) {
    return phoneShell(
      '<div class="appbar"><span class="ab-btn">' + ic('back') + '</span><div style="text-align:center"><b>Digital ID</b><small>' + p.org + '</small></div><span class="ab-btn">' + ic('more') + '</span></div>' +
      card(p) +
      '<div class="phone-actions"><div class="pa"><span>' + ic('qr') + '</span>Show QR</div><div class="pa"><span>' + ic('share') + '</span>Share</div><div class="pa"><span>' + ic('link') + '</span>Links</div><div class="pa"><span>' + ic('download') + '</span>Save</div></div>' +
      '<div style="margin-top:12px"><div class="demo-strip">Demonstration · fictional employee &amp; organisation</div></div>');
  }

  function phoneVerify(p, bad) {
    var rows = [['Name', p.name], ['Employee ID', '<span class="mono">' + p.id + '</span>'], ['Designation', p.des], ['Organisation', p.org], ['Department', p.dep], [p === PEOPLE.agent ? 'Service area' : 'Branch', p.branch], ['Valid until', p.valid], ['Issued by', p.org]];
    if (p === PEOPLE.agent) rows.splice(5, 1, ['Engaged via', 'Trustline Recovery Services']), rows.splice(4, 1);
    var agent = p === PEOPLE.agent && !bad;
    return phoneShell(
      '<div class="urlbar">' + ic('lock') + '<span>verify.example/demo/' + p.token.slice(0, 6) + '…</span></div>' +
      '<div class="vhead"><small>INFINITIA LINKS · DEMO</small><h3>Identity Verification</h3></div>' +
      '<div class="vstatus' + (bad ? ' bad' : '') + '"><span class="vbadge">' + ic(bad ? 'x' : 'check') + '</span><div><b style="color:' + (bad ? 'var(--red)' : 'var(--green)') + '">' + (bad ? 'NOT ACTIVE · REVOKED' : 'VERIFIED · ACTIVE') + '</b><span>' + (bad ? 'Revoked by issuing organisation · 14 Oct 2026' : 'Checked 30 Oct 2026, 10:42 IST') + '</span></div></div>' +
      '<div class="vperson"><span class="av">' + avatar(p.av) + '</span><div><b>' + p.name + '</b><span>' + p.des + '</span></div></div>' +
      '<div class="vtable">' + rows.slice(1, agent ? 7 : 8).map(function (r) { return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('') + '</div>' +
      (agent
        ? '<div class="vbtns"><span class="vbtn p">' + ic('phone') + 'Official helpline</span><span class="vbtn">' + ic('msg') + 'Raise complaint</span><span class="vbtn" style="grid-column:1/-1">' + ic('clock') + 'Request a callback from Kestrel Finserv</span></div>'
        : '<div class="vnote">' + ic('shield') + '<span>Verification confirms the credential\'s current status with the issuing organisation. It does not by itself prove the identity of the person presenting it.</span></div>') +
      '<div class="vfoot">DEMO page · fictional data · Powered by Infinitia Links</div>');
  }

  function phoneLinks(p) {
    var L = [['HR portal', 'Opens your existing HR system', 'users', '#1463FF'], ['Leave management', 'Existing leave portal', 'cal', '#7B2CF5'], ['IT & facilities helpdesk', 'Raise a ticket', 'help', '#00A3E0'], ['Staff handbook', 'Policies & guidelines', 'book', '#0E7C76'], ['Official circulars', '3 new this week', 'mega', '#E07B00'], ['Training resources', 'Learning portal', 'cap', '#4F46E5']];
    var L2 = [['Emergency information', 'Security & medical contacts', 'alert', '#E5484D'], ['Feedback & grievance', 'Confidential channel', 'msg', '#0B1433']];
    function rows(arr) { return arr.map(function (r) { return '<div class="lrow"><span class="li" style="background:' + r[3] + '">' + ic(r[2]) + '</span><div><b>' + r[0] + '</b><span>' + r[1] + '</span></div><span class="go">' + ic('chev') + '</span></div>'; }).join(''); }
    return phoneShell(
      '<div class="appbar"><span class="ab-btn">' + ic('back') + '</span><div style="text-align:center"><b>Staff Links</b><small>' + p.org + '</small></div><span class="ab-btn">' + ic('search') + '</span></div>' +
      '<div class="lhead"><span class="av">' + avatar(p.av) + '</span><div><b>' + p.name + '</b><span>' + p.des + ' · ' + p.id + '</span></div><span class="pill active" style="margin-left:auto;font-size:10px;padding:4px 9px;gap:5px"><i style="width:6px;height:6px"></i>Active</span></div>' +
      '<div class="lsec">WORK &amp; SERVICES</div><div class="llist">' + rows(L) + '</div>' +
      '<div class="lsec">SUPPORT</div><div class="llist">' + rows(L2) + '</div>' +
      '<div class="vfoot" style="margin-top:10px">Links open the organisation\'s own systems · Demo</div>');
  }

  /* ---------- Admin shell ---------- */
  var NAV = [['grid', 'Overview'], ['users', 'Employees'], ['upload', 'Bulk onboarding'], ['idcard', 'Credentials'], ['scan', 'Verification'], ['list', 'Staff directory'], ['building', 'Organisation'], ['lock', 'Security & audit']];
  function browser(url, active, content) {
    return '<div class="browser"><div class="chrome"><div class="dots"><i></i><i></i><i></i></div><div class="addr">' + ic('lock') + url + '</div><div style="width:60px"></div></div>' +
      '<div class="app"><aside class="side"><div class="brand" style="display:grid;gap:7px"><img src="../../visual-assets/brand/infinitia-links-wordmark-white.png" style="height:21px" alt="Infinitia Links"><span style="font-size:10px;color:#8E9AC0;letter-spacing:.16em;font-weight:700">ADMIN CONSOLE</span></div>' +
      '<div class="orgsw"><span class="crest">OT</span><div><b>Orbitra Technologies</b><span>Demo organisation</span></div></div>' +
      NAV.map(function (n) { return '<div class="nav' + (n[1] === active ? ' on' : '') + '">' + ic(n[0]) + n[1] + '</div>'; }).join('') +
      '<div class="sfoot">Sample data for demonstration. All names and organisations are fictional.</div></aside>' +
      '<main class="main">' + content + '</main></div></div>';
  }
  var ME = avatar({ skin: '#C98E68', hair: '#2A1D16', style: 'side', shirt: '#1463FF', bg: ['#E3ECFF', '#C9D9FB'] });
  function topbar(title, sub, right) {
    return '<div class="top"><div><h2>' + title + '</h2><p>' + sub + '</p></div><div class="sp"></div>' + (right || '<div class="search">' + ic('search') + 'Search employees, IDs…</div>') +
      '<span class="btn" style="width:38px;padding:0;justify-content:center">' + ic('bell') + '</span><span class="me">' + ME + '</span></div>';
  }

  var STAFF = [
    ['Priya Nair', 'Senior Product Engineer', 'Platform Engineering', 'Bengaluru', 'ORB-E-20931', 'active', { skin: '#D6A07A', hair: '#1B1411', style: 'long', shirt: '#1D2B53', bg: ['#DCE8FF', '#B8CEFF'] }],
    ['Arjun Mehta', 'Engineering Manager', 'Platform Engineering', 'Bengaluru', 'ORB-E-11872', 'active', { skin: '#C08660', hair: '#1A1310', style: 'short', shirt: '#334155', bg: ['#E6EEF9', '#CBD8EE'] }],
    ['Fatima Sheikh', 'HR Business Partner', 'People & Culture', 'Mumbai', 'ORB-E-14310', 'active', { skin: '#C99272', hair: '#20160F', style: 'long', shirt: '#7B2CF5', bg: ['#EEE6FF', '#D9C9FD'] }],
    ['Karthik Iyer', 'Security Analyst', 'Information Security', 'Chennai', 'ORB-E-17654', 'susp', { skin: '#A86F4A', hair: '#15100D', style: 'side', shirt: '#0F766E', bg: ['#DDF3EE', '#B9E3D9'] }],
    ['Neha Joshi', 'Finance Associate', 'Finance', 'Pune', 'ORB-C-30211', 'exp', { skin: '#D9A884', hair: '#3A2A20', style: 'bun', shirt: '#B45309', bg: ['#FDF0DC', '#F7DDB3'] }],
    ['Vikram Rao', 'Facilities Supervisor', 'Administration', 'Hyderabad', 'ORB-C-30458', 'rev', { skin: '#9E6744', hair: '#191210', style: 'bald', shirt: '#475569', bg: ['#ECEEF2', '#D5DAE3'] }],
    ['Sneha Pillai', 'UX Designer', 'Product Design', 'Bengaluru', 'ORB-E-21544', 'active', { skin: '#CF9A74', hair: '#241812', style: 'bun', shirt: '#DB2777', bg: ['#FCE7F3', '#F7C7DE'] }],
    ['Rohan Desai', 'Sales Director', 'Enterprise Sales', 'Mumbai', 'ORB-E-09931', 'active', { skin: '#BC8660', hair: '#2B2019', style: 'side', shirt: '#0B1433', bg: ['#E3ECFF', '#C9D9FB'] }, true],
    ['Lakshmi Menon', 'Customer Success Lead', 'Customer Success', 'Kochi', 'ORB-E-19902', 'active', { skin: '#B98059', hair: '#1D1511', style: 'long', shirt: '#0EA5E9', bg: ['#E0F2FE', '#B5E0FB'] }]
  ];
  var ST = { active: ['c-active', 'Active'], susp: ['c-susp', 'Suspended'], exp: ['c-exp', 'Expired'], rev: ['c-rev', 'Revoked'] };
  function chip(s) { return '<span class="chip ' + ST[s][0] + '"><i></i>' + ST[s][1] + '</span>'; }

  function bars(vals, w, h, color, opts) {
    opts = opts || {};
    var max = Math.max.apply(null, vals), bw = w / vals.length, out = '';
    vals.forEach(function (v, i) {
      var bh = v / max * (h - 18);
      out += '<rect x="' + (i * bw + bw * 0.18) + '" y="' + (h - bh) + '" width="' + bw * 0.64 + '" height="' + bh + '" rx="' + Math.min(4, bw * 0.3) + '" fill="' + (i === vals.length - 1 && opts.hl ? '#12B76A' : color) + '"/>';
    });
    return '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + h + '"><defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00B4F5"/><stop offset="1" stop-color="#1463FF"/></linearGradient></defs>' +
      [0.25, 0.5, 0.75].map(function (f) { return '<line x1="0" x2="' + w + '" y1="' + (h - (h - 18) * f) + '" y2="' + (h - (h - 18) * f) + '" stroke="#EEF1F6"/>'; }).join('') + out + '</svg>';
  }
  function area(vals, w, h) {
    var max = Math.max.apply(null, vals) * 1.1, step = w / (vals.length - 1);
    var pts = vals.map(function (v, i) { return [i * step, h - v / max * (h - 10)]; });
    var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
    return '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + h + '"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1463FF" stop-opacity=".28"/><stop offset="1" stop-color="#1463FF" stop-opacity="0"/></linearGradient></defs>' +
      [0.25, 0.5, 0.75].map(function (f) { return '<line x1="0" x2="' + w + '" y1="' + (h * f) + '" y2="' + (h * f) + '" stroke="#EEF1F6"/>'; }).join('') +
      '<path d="' + d + ' L' + w + ' ' + h + ' L0 ' + h + 'Z" fill="url(#ag)"/><path d="' + d + '" fill="none" stroke="#1463FF" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<circle cx="' + pts[pts.length - 1][0] + '" cy="' + pts[pts.length - 1][1] + '" r="5" fill="#fff" stroke="#1463FF" stroke-width="2.5"/></svg>';
  }
  function donut(parts, size) {
    var r = size / 2 - 14, c = 2 * Math.PI * r, off = 0, total = parts.reduce(function (s, p) { return s + p[0]; }, 0);
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="transform:rotate(-90deg)">' + parts.map(function (p) {
      var len = p[0] / total * c, s = '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + p[1] + '" stroke-width="22" stroke-dasharray="' + len + ' ' + (c - len) + '" stroke-dashoffset="' + (-off) + '"/>';
      off += len; return s;
    }).join('') + '</svg>';
  }
  var SCANS = [212, 248, 231, 276, 302, 188, 140, 265, 291, 310, 296, 334, 205, 162, 288, 319, 342, 330, 361, 221, 174, 309, 336, 358, 349, 372, 240, 196, 341, 368];

  function dashOverview() {
    var k = [['users', 'Total employees', '2,480', 'Sample org', true], ['check', 'Active IDs', '2,312', '93.2% of total'], ['pause', 'Suspended IDs', '41', 'Review pending'], ['clock', 'Expired IDs', '127', '58 due for renewal'], ['idcard', 'Issued (30 days)', '86', '+12 this week'], ['scan', 'Verifications (30d)', '8,446', 'Sample data']];
    return browser('admin.example/orbitra/overview', 'Overview',
      topbar('Overview', 'Digital identity programme at a glance · sample data', '<div class="search">' + ic('search') + 'Search employees, IDs…</div><span class="btn p">' + ic('plus') + 'Add employee</span>') +
      '<div class="kpis">' + k.map(function (x) { return '<div class="kpi' + (x[4] ? ' hero' : '') + '"><span class="ki">' + ic(x[0]) + '</span><span>' + x[1] + '</span><b>' + x[2] + '</b><small' + (x[0] === 'pause' || x[0] === 'clock' ? ' style="color:#A86500"' : '') + '>' + x[3] + '</small></div>'; }).join('') + '</div>' +
      '<div class="g2"><div class="panel"><div class="ph"><div><h4>QR verifications · last 30 days</h4><div class="sub">Server-side status checks of issued credentials</div></div><div class="sp legend"><span><i style="background:#1463FF"></i>Daily scans</span></div></div>' + bars(SCANS, 640, 190, 'url(#bg1)') +
      '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:#98A0B5;margin-top:6px"><span>1 Oct</span><span>8 Oct</span><span>15 Oct</span><span>22 Oct</span><span>30 Oct</span></div></div>' +
      '<div class="panel"><div class="ph"><div><h4>Credential status</h4><div class="sub">All issued identities</div></div></div><div style="display:flex;gap:18px;align-items:center">' + donut([[2312, '#12B76A'], [41, '#F59E0B'], [127, '#A9B1C4'], [0.0001, '#E5484D']], 160) +
      '<div style="display:grid;gap:9px;font-size:12px">' + [['#12B76A', 'Active', '2,312'], ['#F59E0B', 'Suspended', '41'], ['#A9B1C4', 'Expired', '127'], ['#E5484D', 'Revoked (YTD)', '19']].map(function (r) { return '<div style="display:flex;gap:8px;align-items:center"><i style="width:10px;height:10px;border-radius:3px;background:' + r[0] + '"></i><span style="color:#6B7591;width:96px">' + r[1] + '</span><b>' + r[2] + '</b></div>'; }).join('') + '</div></div></div></div>' +
      '<div class="g2" style="margin-top:14px"><div class="panel"><div class="ph"><div><h4>Recently issued identities</h4><div class="sub">Last 5 credentials generated</div></div><span class="sp btn sm">View all</span></div>' +
      '<table class="tbl"><tr><th>Employee</th><th>Employee ID</th><th>Branch</th><th>Issued</th><th>Status</th></tr>' +
      STAFF.slice(0, 5).map(function (s, i) { return '<tr><td><div class="who"><span class="av">' + avatar(s[6]) + '</span><div><b>' + s[0] + '</b><span>' + s[1] + '</span></div></div></td><td class="mono">' + s[4] + '</td><td>' + s[3] + '</td><td>' + (28 - i * 3) + ' Oct 2026</td><td>' + chip(i === 4 ? 'active' : s[5] === 'exp' ? 'active' : s[5]) + '</td></tr>'; }).join('') + '</table></div>' +
      '<div class="panel"><div class="ph"><div><h4>Needs attention</h4><div class="sub">Lifecycle tasks</div></div></div><div class="mini-list">' +
      [['clock', '58 IDs expire in the next 30 days', 'c-susp', 'Renew'], ['pause', '41 suspended IDs awaiting review', 'c-susp', 'Review'], ['upload', '14 import rows need correction', 'c-err', 'Fix'], ['users', '6 new joiners without a photo', 'c-blue', 'Upload'], ['shield', '2 admin role changes this week', 'c-blue', 'Audit']].map(function (r) { return '<div class="row"><span style="color:#6B7591">' + ic(r[0]) + '</span>' + r[1] + '<span class="chip ' + r[2] + '">' + r[3] + '</span></div>'; }).join('') + '</div></div></div>');
  }

  function dashBulk() {
    var errs = [['37', 'Ravi Kumar', 'department', 'Department is empty', 'Choose from 14 configured departments'], ['112', 'Asha Verghese', 'employee_id', 'Duplicate employee ID ORB-E-18820', 'ID already issued to another employee'], ['205', 'Manoj Rathi', 'joining_date', 'Invalid date "31/02/2024"', 'Use DD-MM-YYYY'], ['318', 'Divya Shetty', 'photo', 'Photo file not found', 'Upload divya_shetty.jpg or remove reference'], ['441', 'Tarun Bose', 'branch', 'Unknown branch "Kolkatta"', 'Did you mean “Kolkata”?']];
    return browser('admin.example/orbitra/bulk-onboarding', 'Bulk onboarding',
      topbar('Bulk onboarding', 'Import employees from Excel / CSV and generate identities in one batch', '<span class="btn">' + ic('download') + 'Download template</span><span class="btn p">' + ic('upload') + 'New import</span>') +
      '<div class="panel" style="margin-bottom:14px"><div class="steps"><div class="step done"><span class="n">' + ic('check') + '</span>Upload file</div><div class="step-line done"></div><div class="step done"><span class="n">' + ic('check') + '</span>Map columns</div><div class="step-line done"></div><div class="step on"><span class="n">3</span>Validate records</div><div class="step-line"></div><div class="step"><span class="n">4</span>Generate identities</div><div class="step-line"></div><div class="step"><span class="n">5</span>Activate &amp; notify</div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 2fr;gap:14px"><div class="file"><span class="fi">XLSX</span><div><b style="font-size:13px">new_joiners_oct_2026.xlsx</b><div style="font-size:11px;color:#6B7591">512 rows · 11 columns mapped · uploaded 10:31</div></div></div>' +
      '<div class="bigstat"><div><b>512</b><span>Rows read</span></div><div style="background:#ECFAF3"><b style="color:#0B8F52">498</b><span>Ready to generate</span></div><div style="background:#FFF1F1"><b style="color:#C0262D">14</b><span>Need correction</span></div><div><b>0</b><span>Duplicates merged</span></div></div></div></div>' +
      '<div class="g2"><div class="panel"><div class="ph"><div><h4>Validation errors</h4><div class="sub">Invalid rows are held back — valid rows can proceed</div></div><span class="sp btn sm">' + ic('download') + 'Error report (.xlsx)</span></div>' +
      '<table class="tbl"><tr><th>Row</th><th>Employee</th><th>Field</th><th>Issue</th><th>Suggested fix</th></tr>' + errs.map(function (e) { return '<tr><td class="mono">' + e[0] + '</td><td><b>' + e[1] + '</b></td><td><span class="chip c-err">' + e[2] + '</span></td><td>' + e[3] + '</td><td style="color:#6B7591">' + e[4] + '</td></tr>'; }).join('') + '</table>' +
      '<div style="font-size:11px;color:#6B7591;margin-top:8px">Showing 5 of 14 · all names are fictional sample records</div></div>' +
      '<div class="panel"><div class="ph"><div><h4>Batch actions</h4><div class="sub">Apply to selected or imported records</div></div></div>' +
      '<div style="display:grid;gap:9px">' + [['idcard', 'Generate 498 identities', 'Default template · Premium Corporate Blue', 'p'], ['check', 'Bulk activation', 'Activate on joining date', ''], ['refresh', 'Bulk renewal', 'Extend validity for selected IDs', ''], ['pause', 'Bulk suspension', 'Requires reason & approval', '']].map(function (b) {
        return '<div style="display:flex;gap:11px;align-items:center;padding:11px;border-radius:13px;' + (b[3] ? 'background:#1463FF;color:#fff' : 'box-shadow:inset 0 0 0 1px #E6EAF3') + '"><span style="width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:' + (b[3] ? 'rgba(255,255,255,.18)' : '#EEF3FF') + ';color:' + (b[3] ? '#fff' : '#1463FF') + '">' + ic(b[0]) + '</span><div><b style="font-size:12.5px">' + b[1] + '</b><div style="font-size:11px;opacity:.75">' + b[2] + '</div></div></div>';
      }).join('') + '</div></div></div>');
  }

  function dashDirectory() {
    var people = STAFF.filter(function (s) { return s[5] === 'active'; }).concat([STAFF[3]]).slice(0, 6);
    return browser('directory.example/orbitra', 'Staff directory',
      topbar('Staff directory', 'Searchable directory of approved professional information', '<div class="search" style="width:340px">' + ic('search') + 'Search by name or employee ID…</div>') +
      '<div style="display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:14px"><div style="min-width:0"><div class="filters">' + [['Department', 'All departments'], ['Designation', 'Any'], ['Branch', 'Bengaluru']].map(function (f) { return '<span class="sel"><span style="color:#6B7591;font-weight:500">' + f[0] + ':</span>' + f[1] + ic('chev') + '</span>'; }).join('') + '<span class="sel" style="margin-left:auto">' + ic('filter') + '2,312 active staff</span></div>' +
      '<div class="dir-grid">' + people.map(function (s) {
        return '<div class="dcard"><div class="top2"><span class="av">' + avatar(s[6]) + '</span><div><b>' + s[0] + '</b><div class="d1">' + s[1] + '</div><div class="d2">' + s[2] + ' · ' + s[3] + '</div></div></div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center"><span class="mono" style="font-size:11px;color:#6B7591">' + s[4] + '</span>' + chip('active') + '</div>' +
          '<div class="acts"><span class="btn sm">' + ic('mail') + 'Email</span><span class="btn sm">' + ic('phone') + 'Office</span><span class="btn sm" style="margin-left:auto">' + ic('shield') + 'Verify</span></div></div>';
      }).join('') + '</div></div>' +
      '<div class="panel"><div class="ph"><div><h4>Directory privacy</h4><div class="sub">Organisation decides what is visible</div></div></div>' +
      [['Photograph', 1], ['Designation', 1], ['Department', 1], ['Branch / location', 1], ['Official email', 1], ['Office extension', 1], ['Personal mobile', 0], ['Emergency contact', 0], ['Date of birth', 0]].map(function (r) { return '<div class="vis-row">' + r[0] + (r[1] ? '' : '<span>Hidden</span>') + '<span class="toggle' + (r[1] ? ' on' : '') + '"></span></div>'; }).join('') +
      '<div style="margin-top:12px;font-size:11px;color:#6B7591;line-height:1.45">Visibility: <b style="color:#0B1433">Signed-in staff only</b>. Public listing can be disabled entirely.</div></div></div>');
  }

  function dashStatus() {
    var p = PEOPLE.corporate;
    return browser('admin.example/orbitra/employees/ORB-E-17654', 'Credentials',
      topbar('Credential status', 'Issue, suspend, renew or revoke — changes reflect on the next QR scan', '<span class="btn">' + ic('refresh') + 'Renew ID</span><span class="btn">' + ic('edit') + 'Edit employee</span>') +
      '<div style="display:grid;grid-template-columns:300px minmax(0,1fr);gap:14px;align-items:start"><div class="panel" style="display:grid;gap:12px;justify-items:center;text-align:center;align-content:start">' +
      '<div style="width:110px;height:128px;border-radius:20px;overflow:hidden">' + avatar(STAFF[3][6]) + '</div><div><b style="font-size:17px">Karthik Iyer</b><div style="font-size:12px;color:#1463FF;font-weight:600">Security Analyst</div><div style="font-size:11.5px;color:#6B7591">Information Security · Chennai</div></div>' + chip('susp') +
      '<div style="width:100%;text-align:left;display:grid;gap:0;font-size:12px">' + [['Employee ID', 'ORB-E-17654'], ['Credential ref', 'cr_9fK2…x7Q'], ['Issued', '04 Jan 2024'], ['Valid until', '31 Dec 2026'], ['Template', 'Premium Corporate Blue']].map(function (r) { return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #E6EAF3"><span style="color:#6B7591">' + r[0] + '</span><b class="' + (r[0].indexOf('ID') > -1 || r[0].indexOf('ref') > -1 ? 'mono' : '') + '">' + r[1] + '</b></div>'; }).join('') + '</div></div>' +
      '<div style="display:grid;gap:14px"><div class="panel"><div class="ph"><div><h4>Change credential status</h4><div class="sub">Every change is logged with actor, reason and timestamp</div></div></div>' +
      '<div class="seg">' + [['c-active', 'Active', 'Verifies as valid'], ['c-susp', 'Suspended', 'Temporarily not valid · reversible'], ['c-exp', 'Expired', 'Validity date has passed'], ['c-rev', 'Revoked', 'Permanently invalid']].map(function (s, i) { return '<div class="' + (i === 1 ? 'sel2' : '') + '"><span class="chip ' + s[0] + '" style="width:max-content"><i></i>' + s[1] + '</span><small>' + s[2] + '</small></div>'; }).join('') + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:12px"><div class="field"><label>Reason</label><div class="inp">Pending internal review' + ic('chev') + '</div></div><div class="field"><label>Effective</label><div class="inp">Immediately' + ic('chev') + '</div></div><div class="field"><label>Approved by</label><div class="inp">HR Admin · F. Sheikh</div></div></div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><span class="btn">Cancel</span><span class="btn p">' + ic('check') + 'Apply status change</span></div></div>' +
      '<div class="g2" style="grid-template-columns:1fr 1fr"><div class="panel"><div class="ph"><div><h4>Status history</h4><div class="sub">Credential lifecycle</div></div></div><div class="timeline">' +
      [['#F59E0B', 'pause', 'Suspended', '29 Oct 2026, 16:05 · by F. Sheikh (HR Admin) · Pending review'], ['#12B76A', 'refresh', 'Renewed until 31 Dec 2026', '02 Jan 2026 · bulk renewal batch #118'], ['#1463FF', 'idcard', 'Photo updated', '14 Jun 2025 · by employee request'], ['#12B76A', 'check', 'Issued & activated', '04 Jan 2024 · bulk import batch #072']].map(function (t) { return '<div class="tl"><span class="dot" style="background:' + t[0] + '">' + ic(t[1]) + '</span><div><b>' + t[2] + '</b><span>' + t[3] + '</span></div></div>'; }).join('') + '</div></div>' +
      '<div class="panel"><div class="ph"><div><h4>What a verifier sees now</h4><div class="sub">Live result for this credential</div></div></div>' +
      '<div style="display:flex;gap:12px;align-items:center;padding:14px;border-radius:14px;background:#FFF8EB;box-shadow:inset 0 0 0 1px #F7D9A0"><span style="width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#F59E0B;color:#fff">' + ic('pause') + '</span><div><b style="color:#A86500;letter-spacing:.04em">NOT ACTIVE · SUSPENDED</b><div style="font-size:11.5px;color:#6B7591">Contact Orbitra Technologies to confirm</div></div></div>' +
      '<div style="font-size:11.5px;color:#6B7591;margin-top:12px;line-height:1.5">Suspended, expired and revoked credentials never display as valid. Personal details are withheld on non-active results.</div></div></div></div></div>');
  }

  function dashAnalytics() {
    var hist = [['30 Oct, 10:42', 'Priya Nair', 'ORB-E-20931', 'active', 'Mobile browser · Bengaluru'], ['30 Oct, 10:37', 'Rohan Desai', 'ORB-E-09931', 'active', 'Mobile browser · Mumbai'], ['30 Oct, 10:21', 'Karthik Iyer', 'ORB-E-17654', 'susp', 'Mobile browser · Chennai'], ['30 Oct, 09:58', 'Vikram Rao', 'ORB-C-30458', 'rev', 'Desktop browser · Hyderabad'], ['30 Oct, 09:44', 'Lakshmi Menon', 'ORB-E-19902', 'active', 'Mobile browser · Kochi'], ['30 Oct, 09:31', 'Neha Joshi', 'ORB-C-30211', 'exp', 'Mobile browser · Pune']];
    var br = [['Bengaluru', 3120], ['Mumbai', 1840], ['Pune', 1210], ['Chennai', 980], ['Hyderabad', 760], ['Kochi', 536]];
    return browser('admin.example/orbitra/verification', 'Verification',
      topbar('Verification analytics', 'How and where issued credentials are being verified · sample data', '<span class="sel">' + ic('cal') + 'Last 30 days' + ic('chev') + '</span><span class="btn">' + ic('download') + 'Export</span>') +
      '<div class="kpis" style="grid-template-columns:repeat(4,1fr)">' + [['scan', 'Total scans (30d)', '8,446', '+9% vs prior period', true], ['chart', 'Scans today', '372', 'Peak 11:00–12:00'], ['idcard', 'Unique credentials verified', '1,904', '82% of active IDs'], ['alert', 'Not-active results', '63', 'Suspended / expired / revoked']].map(function (x) { return '<div class="kpi' + (x[4] ? ' hero' : '') + '"><span class="ki">' + ic(x[0]) + '</span><span>' + x[1] + '</span><b>' + x[2] + '</b><small' + (x[0] === 'alert' ? ' style="color:#C0262D"' : '') + '>' + x[3] + '</small></div>'; }).join('') + '</div>' +
      '<div class="g2"><div class="panel"><div class="ph"><div><h4>Daily verifications</h4><div class="sub">1 – 30 Oct 2026</div></div></div>' + area(SCANS, 640, 180) + '</div>' +
      '<div class="panel"><div class="ph"><div><h4>Scans by branch</h4><div class="sub">Branch of the verified credential</div></div></div><div style="display:grid;gap:11px">' + br.map(function (b) { return '<div style="display:grid;grid-template-columns:80px 1fr 44px;gap:10px;align-items:center;font-size:12px"><span>' + b[0] + '</span><div class="bar-h"><i style="width:' + (b[1] / 3120 * 100) + '%"></i></div><b style="text-align:right">' + b[1].toLocaleString('en-IN') + '</b></div>'; }).join('') + '</div></div></div>' +
      '<div class="panel" style="margin-top:14px"><div class="ph"><div><h4>Verification history</h4><div class="sub">Source shown as device type and approximate city only — no verifier identity is stored</div></div><span class="sp btn sm">' + ic('filter') + 'Filter</span></div>' +
      '<table class="tbl"><tr><th>Date &amp; time</th><th>Credential</th><th>Employee ID</th><th>Result</th><th>Source (privacy-safe)</th></tr>' + hist.map(function (h) { return '<tr><td>' + h[0] + '</td><td><b>' + h[1] + '</b></td><td class="mono">' + h[2] + '</td><td>' + (h[3] === 'active' ? '<span class="chip c-active"><i></i>Verified · Active</span>' : chip(h[3])) + '</td><td style="color:#6B7591">' + h[4] + '</td></tr>'; }).join('') + '</table></div>');
  }

  /* ---------- Diagrams ---------- */
  function architecture() {
    function boxes(list, cols, opt) {
      return '<div class="boxes" style="grid-template-columns:repeat(' + cols + ',1fr)">' + list.map(function (b) { return '<div class="box' + (opt ? ' opt' : '') + '"><span class="bi">' + ic(b[0]) + '</span><div><b>' + b[1] + '</b><span>' + b[2] + '</span></div></div>'; }).join('') + '</div>';
    }
    return '<div class="dg"><div style="display:flex;align-items:center;justify-content:space-between"><div><div class="dg-title">Platform architecture · logical view</div><div style="font-size:26px;font-weight:800;margin-top:6px;letter-spacing:-.02em">Infinitia Links Digital Identity Platform</div></div><img src="../../visual-assets/brand/infinitia-links-logo.png" style="height:70px"></div>' +
      '<div class="layer"><div class="lab">People<small>Who uses it</small></div>' + boxes([['user', 'Employees & staff', 'View and share their digital ID and service links'], ['scan', 'Verifiers', 'Customers, visitors, security — scan the QR, no login'], ['shield', 'Organisation admins', 'HR, registry, IT — manage identities by role']], 3) + '</div>' +
      '<div class="arrow-down">▼</div>' +
      '<div class="layer"><div class="lab">Experiences<small>Secure web, mobile-first</small></div>' + boxes([['idcard', 'Digital ID card', 'Branded, mobile-accessible identity'], ['shield', 'Verification page', 'Live status from a unique, non-guessable link'], ['grid', 'Admin console', 'Issue, manage, audit'], ['list', 'Staff directory & links', 'Optional, privacy-controlled']], 4) + '</div>' +
      '<div class="arrow-down">▼</div>' +
      '<div class="layer"><div class="lab">Platform services<small>Multi-organisation core</small></div>' + boxes([['idcard', 'Identity & credential service', 'Lifecycle: issue · renew · suspend · revoke · expire'], ['scan', 'Verification service', 'Server-side status checks, rate limiting'], ['palette', 'Branding & template engine', 'Per-organisation logos, colours, layouts'], ['upload', 'Bulk onboarding', 'Excel/CSV import, validation, batch actions'], ['chart', 'Analytics', 'Scan statistics with privacy safeguards'], ['lock', 'Access control & audit', 'Role-based access, activity and status logs']], 3) + '</div>' +
      '<div class="arrow-down">▼</div>' +
      '<div class="layer"><div class="lab">Data<small>Organisation-isolated</small></div>' + boxes([['db', 'Identity records', 'Per-organisation data segregation'], ['file', 'Photo & asset storage', 'Access-controlled storage'], ['refresh', 'Backup & recovery', 'Scheduled backups, retention policy'], ['lock', 'Encryption in transit', 'HTTPS/TLS for every request']], 4) + '</div>' +
      '<div class="layer" style="margin-top:22px"><div class="lab" style="background:#fff;color:#0B1433;box-shadow:inset 0 0 0 1.5px #C9D2E6">Optional integrations<small style="color:#6B7591">Separately scoped</small></div>' + boxes([['api', 'REST API', 'For approved systems'], ['key', 'Single Sign-On', 'Existing identity provider'], ['users', 'HRMS / ERP sync', 'Employee master data'], ['nfc', 'NFC & access control', 'Hardware required'], ['pin', 'Field-force / GPS', 'Consent, duty-hours only']], 5, true) + '</div></div>';
  }

  var STAGES = [['Discovery & registration', 'Goals, scope, stakeholders, data owners', 'Week 1'], ['Branding & configuration', 'Logo, colours, templates, visibility rules', 'Week 1–2'], ['Departments & branches', 'Org structure, roles, admin users', 'Week 2'], ['Employee data preparation', 'Template, photos, data cleansing', 'Customer-led'], ['Bulk employee import', 'Validation, error reports, corrections', 'Week 2–3'], ['Identity generation', 'IDs, unique credential links, QR codes', 'Week 3'], ['QR verification setup', 'Public fields, status messages, limits', 'Week 3'], ['Pilot deployment', 'One department or branch, feedback', 'Week 3–4'], ['Full rollout', 'Phased by branch, communications', 'Week 4+'], ['Ongoing administration', 'Joiners, leavers, renewals, support', 'Continuous']];
  function workflow(bare) {
    return '<div class="dg" style="background:#F6F8FE">' + (bare ? '' : '<div class="dg-title">Enterprise onboarding workflow</div><div style="font-size:26px;font-weight:800;margin:6px 0 22px;letter-spacing:-.02em">From discovery to steady-state administration in ten stages</div>') +
      '<div class="flow">' + STAGES.map(function (s, i) { return '<div class="fstep"><span class="num">' + (i + 1) + '</span><span class="phase">' + s[2].toUpperCase() + '</span><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('') + '</div>' +
      '<div style="font-size:12.5px;color:#6B7591;margin-top:18px">Indicative only. Actual timelines depend on data readiness, internal approvals, integration requirements and deployment scope.</div></div>';
  }

  function nfcIllus() {
    var p = PEOPLE.corporate;
    return '<div class="illus"><div class="optional-flag">OPTIONAL INTEGRATION · HARDWARE REQUIRED</div>' +
      '<div style="position:absolute;left:170px;top:90px;transform:rotate(-8deg)"><div style="width:220px">' + card(p) + '</div></div>' +
      '<svg style="position:absolute;left:440px;top:240px" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="#1463FF" stroke-linecap="round"><path d="M40 50a42 42 0 0 1 0 60" stroke-width="7" opacity=".9"/><path d="M68 30a72 72 0 0 1 0 100" stroke-width="7" opacity=".6"/><path d="M96 12a100 100 0 0 1 0 136" stroke-width="7" opacity=".35"/></svg>' +
      '<div style="position:absolute;left:640px;top:150px;width:240px;height:380px;border-radius:34px;background:linear-gradient(160deg,#1B2442,#0A0E1C);box-shadow:0 40px 70px -30px rgba(11,20,51,.6);display:grid;justify-items:center;align-content:center;gap:18px;color:#fff">' +
      '<div style="width:140px;height:140px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#1463FF,#0B1433 70%);box-shadow:0 0 0 10px rgba(20,99,255,.15),0 0 0 22px rgba(20,99,255,.07)"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">' + P.nfc + '</svg></div>' +
      '<div style="text-align:center"><b style="font-size:17px">Door / reader</b><div style="font-size:12px;color:#9FB0DA;margin-top:4px">Third-party access hardware</div></div>' +
      '<div style="padding:8px 14px;border-radius:12px;background:rgba(18,183,106,.2);color:#4BE3A0;font-weight:700;font-size:13px">Credential status: Active</div></div>' +
      '<div class="tagbox" style="left:640px;top:560px"><span class="ti">' + ic('idcard') + '</span><div><b>NFC-enabled physical card</b><span>Card carries a reference, not personal data</span></div></div>' +
      '<div class="tagbox" style="left:70px;top:548px"><span class="ti">' + ic('api') + '</span><div><b>Status via API</b><span>Reader system checks Infinitia Links credential status</span></div></div>' +
      '<div class="tagbox" style="left:860px;top:70px;flex-direction:column;align-items:flex-start;width:210px"><b>Separately required</b><span>• NFC cards &amp; encoding<br>• Readers / controllers<br>• Access-control software<br>• Integration scope &amp; SLA</span></div></div>';
  }

  function gpsIllus() {
    var map = '<svg width="1100" height="640" style="position:absolute;inset:0"><defs><pattern id="gridp" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="#E2E8F5" stroke-width="1"/></pattern></defs><rect width="1100" height="640" fill="url(#gridp)"/>' +
      '<path d="M0 420 C200 380 300 470 520 430 S860 330 1100 380" fill="none" stroke="#DCE4F4" stroke-width="26"/><path d="M380 0 C400 160 340 300 420 640" fill="none" stroke="#DCE4F4" stroke-width="20"/><path d="M700 0 C690 200 760 380 720 640" fill="none" stroke="#E6ECF8" stroke-width="16"/>' +
      '<circle cx="560" cy="330" r="190" fill="rgba(20,99,255,.07)" stroke="#1463FF" stroke-width="2.5" stroke-dasharray="10 8"/>' +
      '<path d="M470 360 C500 300 540 330 560 290 S640 250 660 300" fill="none" stroke="#7B2CF5" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10"/></svg>';
    function pin(x, y, label, c) { return '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;transform:translate(-50%,-100%);display:grid;justify-items:center"><span style="padding:5px 10px;border-radius:10px;background:#fff;font-size:11.5px;font-weight:700;box-shadow:0 8px 16px -10px rgba(11,20,51,.5);margin-bottom:6px;white-space:nowrap">' + label + '</span><svg width="30" height="36" viewBox="0 0 24 30"><path d="M12 29s10-9 10-17A10 10 0 0 0 2 12c0 8 10 17 10 17Z" fill="' + c + '"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg></div>'; }
    return '<div class="illus">' + map + '<div class="optional-flag">OPTIONAL · DUTY-BASED · CONSENT-DRIVEN</div>' +
      pin(560, 300, 'Service visit · 10:40', '#1463FF') + pin(670, 305, 'Assigned area', '#7B2CF5') +
      '<div class="tagbox" style="left:400px;top:120px"><span class="ti">' + ic('pin') + '</span><div><b>Authorised service area</b><span>Geofence defined by the organisation</span></div></div>' +
      '<div style="position:absolute;right:70px;top:90px;width:250px;border-radius:26px;padding:16px;background:#fff;box-shadow:0 30px 60px -30px rgba(11,20,51,.55)">' +
      '<div style="display:flex;gap:10px;align-items:center"><div style="width:42px;height:48px;border-radius:12px;overflow:hidden">' + avatar(PEOPLE.field.av) + '</div><div><b style="font-size:13.5px">Rahul Verma</b><div style="font-size:11px;color:#6B7591">Field Service Engineer</div></div></div>' +
      '<div style="margin-top:14px;padding:12px;border-radius:14px;background:#F5F8FF;display:flex;align-items:center;gap:10px"><div><b style="font-size:13px">On duty</b><div style="font-size:11px;color:#6B7591">Location shared 09:00–18:00</div></div><span class="toggle on" style="margin-left:auto"></span></div>' +
      '<div style="margin-top:10px;font-size:11px;color:#6B7591;line-height:1.5">' + ic('eye') + ' Employee can see when location is shared. Off-duty: never collected.</div></div>' +
      '<div class="tagbox" style="left:60px;top:500px;flex-direction:column;align-items:flex-start;width:300px"><b>Privacy controls</b><span>Explicit permission · duty hours only · limited retention · visible indicator · organisation policy</span></div>' +
      '<div class="tagbox" style="right:60px;bottom:50px;flex-direction:column;align-items:flex-start;width:280px"><b>Separately required</b><span>Mobile app or field-force platform, location services and integration scope. A QR code alone does not track location.</span></div></div>';
  }

  function heroComposite() {
    return '<div style="position:relative;width:1300px;height:940px">' +
      '<div style="position:absolute;left:60px;top:120px;transform:rotate(-7deg) scale(.86);transform-origin:center">' + phoneId(PEOPLE.professor) + '</div>' +
      '<div style="position:absolute;left:820px;top:120px;transform:rotate(7deg) scale(.86);transform-origin:center">' + phoneId(PEOPLE.hospital) + '</div>' +
      '<div style="position:absolute;left:450px;top:20px;z-index:2">' + phoneId(PEOPLE.corporate) + '</div>' +
      '<div class="tagbox" style="left:880px;top:40px;z-index:3"><span class="ti" style="background:#12B76A;color:#fff">' + ic('check') + '</span><div><b>Verified · Active</b><span>Live status on every scan</span></div></div>' +
      '<div class="tagbox" style="left:200px;top:850px;z-index:3"><span class="ti">' + ic('palette') + '</span><div><b>Your brand, your templates</b><span>One platform, many organisations</span></div></div></div>';
  }

  function brandingRow() {
    var list = [PEOPLE.professor, PEOPLE.corporate, PEOPLE.hospital, PEOPLE.agent];
    return '<div style="width:1400px;padding:34px;border-radius:30px;background:#F6F8FE"><div class="dg-title">One platform · many organisations</div><div style="font-size:26px;font-weight:800;margin:6px 0 4px;letter-spacing:-.02em">Each organisation keeps its own identity</div><div style="font-size:14px;color:#6B7591;margin-bottom:22px">Logo, colours, template, fields and visibility are configured per organisation. Data stays segregated.</div>' +
      '<div style="display:flex;gap:28px;justify-content:space-between">' + list.map(function (p) { return '<figure style="margin:0;display:grid;gap:12px;justify-items:center"><div style="width:300px">' + card(p) + '</div><figcaption style="text-align:center;font-weight:700;font-size:14px">' + p.org + '<small style="display:block;font-weight:500;color:#6B7591;font-size:12px">' + TPL_NAMES[p.tpl] + ' template</small></figcaption></figure>'; }).join('') + '</div></div>';
  }

  /* ---------- Assemble ---------- */
  var out = [];
  function add(id, html) { out.push('<div class="asset" id="' + id + '">' + html + '</div>'); }
  add('hero-phones', heroComposite());
  add('phone-university-id', phoneId(PEOPLE.professor));
  add('phone-corporate-id', phoneId(PEOPLE.corporate));
  add('phone-hospital-id', phoneId(PEOPLE.hospital));
  add('phone-field-executive-id', phoneId(PEOPLE.field));
  add('phone-recovery-agent-id', phoneId(PEOPLE.agent));
  add('phone-college-admin-id', phoneId(PEOPLE.admin));
  add('verification-page-active', phoneVerify(PEOPLE.corporate));
  add('verification-page-revoked', phoneVerify(STAFF_PERSON(), true));
  add('verification-page-agent', phoneVerify(PEOPLE.agent));
  add('staff-service-links', phoneLinks(PEOPLE.corporate));
  Object.keys(PEOPLE).forEach(function (k) { add('card-' + k, card(PEOPLE[k])); });
  add('admin-dashboard', dashOverview());
  add('bulk-upload', dashBulk());
  add('staff-directory', dashDirectory());
  add('credential-status', dashStatus());
  add('verification-analytics', dashAnalytics());
  add('multi-org-branding', brandingRow());
  add('nfc-integration', nfcIllus());
  add('gps-field-integration', gpsIllus());
  add('platform-architecture', architecture());
  add('onboarding-workflow', workflow());
  add('onboarding-workflow-steps', workflow(true));
  document.body.innerHTML = out.join('');

  function STAFF_PERSON() {
    var s = STAFF[5];
    return { name: s[0], des: s[1], dep: s[2], org: 'Orbitra Technologies', branch: s[3], id: s[4], valid: '31 Dec 2026', token: 'Vr3Xk8Cq2LmZ', av: s[6] };
  }
  window.TEMPLATE_NAMES = TPL_NAMES;
})();
