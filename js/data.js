/*!
 * Infinitia Links — local demo data & storage.
 * Everything here is FICTIONAL sample data. Nothing is sent anywhere;
 * changes are saved to this browser's localStorage only.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'infinitia.links.demo';
  var VERSION = 3;
  var DEFAULT_ID = 'DEMO-2026-1042';

  var DEFAULT_BRANDING = {
    institution: 'Nova Institute of Technology',
    shortName: 'Nova Tech',
    monogram: 'N',
    motto: 'Knowledge · Innovation · Character',
    campus: 'Demo Campus, 1 Innovation Avenue, Sample City',
    website: 'www.nova-institute.example',
    domain: 'id.nova-institute.example',
    supportEmail: 'idcards@nova-institute.example',
    primary: '#0A1433',
    accent: '#2F6BFF',
    logo: null
  };

  var PROGRAMMES = [
    { name: 'Bachelor of Computer Applications', short: 'BCA', dept: 'Computer Science', years: 3 },
    { name: 'B.Tech Computer Science & Engineering', short: 'B.Tech CSE', dept: 'Computer Science', years: 4 },
    { name: 'Master of Computer Applications', short: 'MCA', dept: 'Computer Science', years: 2 },
    { name: 'B.Tech Electronics & Communication', short: 'B.Tech ECE', dept: 'Electronics', years: 4 },
    { name: 'B.Tech Mechanical Engineering', short: 'B.Tech ME', dept: 'Mechanical Engineering', years: 4 },
    { name: 'B.Sc Data Science', short: 'B.Sc DS', dept: 'Data Science', years: 3 },
    { name: 'Bachelor of Business Administration', short: 'BBA', dept: 'Management Studies', years: 3 },
    { name: 'Bachelor of Design', short: 'B.Des', dept: 'Design', years: 4 }
  ];

  var YEARS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];

  var TEMPLATES = [
    { id: 'midnight', name: 'Midnight Navy', desc: 'Deep navy with an electric-blue glow', bg: ['#08112B', '#102361', '#1C47B8'], text: '#FFFFFF', muted: 'rgba(226,234,255,.68)', accent: '#7FB0FF', glow: 'rgba(61,139,255,.55)', foot: 'rgba(3,8,26,.45)', dark: true },
    { id: 'electric', name: 'Electric Blue', desc: 'Bright, energetic and modern', bg: ['#0A2FB8', '#2F6BFF', '#33B5F5'], text: '#FFFFFF', muted: 'rgba(235,243,255,.78)', accent: '#C7E4FF', glow: 'rgba(125,211,252,.6)', foot: 'rgba(4,22,92,.35)', dark: true },
    { id: 'pearl', name: 'Pearl White', desc: 'Clean, minimal and print-friendly', bg: ['#FFFFFF', '#F3F6FE', '#DCE6FF'], text: '#0A1433', muted: 'rgba(10,20,51,.58)', accent: '#2F6BFF', glow: 'rgba(47,107,255,.22)', foot: 'rgba(10,20,51,.06)', dark: false },
    { id: 'aurora', name: 'Aurora', desc: 'Violet-to-teal gradient for creative campuses', bg: ['#1A1446', '#4A1F92', '#0E7C93'], text: '#FFFFFF', muted: 'rgba(237,233,254,.72)', accent: '#7DE8F7', glow: 'rgba(103,232,249,.45)', foot: 'rgba(12,8,40,.4)', dark: true },
    { id: 'graphite', name: 'Graphite Gold', desc: 'Executive dark finish with gold details', bg: ['#0E1013', '#1C2026', '#2B3038'], text: '#F6F1E4', muted: 'rgba(246,241,228,.62)', accent: '#D9B46C', glow: 'rgba(217,180,108,.32)', foot: 'rgba(0,0,0,.35)', dark: true },
    { id: 'institution', name: 'Institution Brand', desc: 'Uses the colours set in Branding', brand: true, dark: true }
  ];

  var SKIN = ['#F2CBA8', '#E2AE88', '#C98C63', '#A9704C', '#8B5737'];
  var HAIR = ['#17110D', '#2A1C14', '#3D2A1E', '#5B3B26', '#1F1A2E'];
  var STYLES = ['short', 'side', 'long', 'bun', 'curly', 'wave'];
  var SHIRTS = ['#1E3A8A', '#2F6BFF', '#0EA5E9', '#4F46E5', '#0F766E', '#B45309', '#BE123C', '#0F172A'];
  var BACKDROPS = [['#DCE7FF', '#B6C9FF'], ['#E0F2FE', '#B5E0FB'], ['#EDE9FE', '#D4CBFD'], ['#DCFCE7', '#B6EDCB'], ['#FEF3C7', '#FBE09A'], ['#FCE7F3', '#F7C7DE']];

  var NAMES = [
    ['Diya', 'Patel', 'f'], ['Ishaan', 'Verma', 'm'], ['Ananya', 'Iyer', 'f'], ['Kabir', 'Mehta', 'm'],
    ['Meera', 'Nair', 'f'], ['Vihaan', 'Reddy', 'm'], ['Saanvi', 'Gupta', 'f'], ['Arjun', 'Rao', 'm'],
    ['Kiara', 'Singh', 'f'], ['Reyansh', 'Joshi', 'm'], ['Aditi', 'Kulkarni', 'f'], ['Dhruv', 'Malhotra', 'm'],
    ['Navya', 'Menon', 'f'], ['Aryan', 'Kapoor', 'm'], ['Tara', 'Bose', 'f'], ['Rohan', 'Das', 'm'],
    ['Nisha', 'Pillai', 'f'], ['Yash', 'Chauhan', 'm'], ['Zara', 'Khan', 'f'], ['Advait', 'Desai', 'm'],
    ['Myra', 'Shetty', 'f'], ['Krish', 'Agarwal', 'm'], ['Ira', 'Banerjee', 'f'], ['Aditya', 'Mishra', 'm'],
    ['Prisha', 'Jain', 'f'], ['Siddharth', 'Rao', 'm'], ['Riya', 'Thomas', 'f'], ['Vivaan', 'Saxena', 'm'],
    ['Anika', 'Bhat', 'f'], ['Laksh', 'Arora', 'm'], ['Pari', 'Sinha', 'f'], ['Om', 'Tiwari', 'm'],
    ['Sara', 'Fernandes', 'f'], ['Neil', "D'Souza", 'm'], ['Avni', 'Hegde', 'f']
  ];

  // Deterministic pseudo-random generator so the demo always looks the same.
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

  function randomAvatar(r, gender) {
    r = r || Math.random;
    var styles = gender === 'f' ? ['long', 'bun', 'wave', 'curly'] : gender === 'm' ? ['short', 'side', 'curly'] : STYLES;
    return { skin: pick(r, SKIN), hair: pick(r, HAIR), style: pick(r, styles), shirt: pick(r, SHIRTS), backdrop: pick(r, BACKDROPS) };
  }

  function emailFor(first) {
    return first.toLowerCase().replace(/[^a-z]/g, '') + '.demo@example.com';
  }

  function seedStudents() {
    var list = [{
      id: DEFAULT_ID,
      name: 'Aarav Sharma',
      programme: 'Bachelor of Computer Applications',
      programmeShort: 'BCA',
      department: 'Computer Science',
      year: 'Second Year',
      academicYear: '2026–2027',
      email: 'aarav.demo@example.com',
      status: 'active',
      issued: '2026-07-15',
      validThru: '2027-05-31',
      views: 342,
      scans: 128,
      avatar: { skin: '#C98C63', hair: '#17110D', style: 'side', shirt: '#1E3A8A', backdrop: ['#DCE7FF', '#B6C9FF'] },
      emergency: { name: 'Rohan Sharma (fictional)', relation: 'Guardian', phone: '+00 000 000 0000' }
    }];
    var r = rng(2026);
    NAMES.forEach(function (n, i) {
      var p = pick(r, PROGRAMMES);
      var yr = YEARS[Math.floor(r() * p.years)];
      list.push({
        id: 'DEMO-2026-' + (1043 + i * 7),
        name: n[0] + ' ' + n[1],
        programme: p.name,
        programmeShort: p.short,
        department: p.dept,
        year: yr,
        academicYear: '2026–2027',
        email: emailFor(n[0]),
        status: r() < 0.88 ? 'active' : 'inactive',
        issued: '2026-07-' + String(10 + Math.floor(r() * 18)).padStart(2, '0'),
        validThru: '2027-05-31',
        views: 20 + Math.floor(r() * 220),
        scans: 4 + Math.floor(r() * 90),
        avatar: randomAvatar(r, n[2]),
        emergency: { name: 'Demo Guardian (fictional)', relation: 'Parent / Guardian', phone: '+00 000 000 0000' }
      });
    });
    return list;
  }

  function seed() {
    var now = Date.now(), h = 3600 * 1000;
    return {
      version: VERSION,
      branding: JSON.parse(JSON.stringify(DEFAULT_BRANDING)),
      template: 'midnight',
      wallet: false,
      scanSeries: [138, 162, 151, 197, 224, 180, 236],
      extraViews: 2860,
      extraScans: 940,
      events: {},
      students: seedStudents(),
      activity: [
        { t: now - 2 * h, icon: 'scan', msg: 'Demo QR scanned for DEMO-2026-1042' },
        { t: now - 5 * h, icon: 'user', msg: 'Demo profile viewed: Aarav Sharma' },
        { t: now - 26 * h, icon: 'upload', msg: 'Bulk import: 35 sample students added' },
        { t: now - 50 * h, icon: 'palette', msg: 'Branding updated for Nova Institute of Technology' }
      ]
    };
  }

  var state = null;

  function load() {
    if (state) return state;
    var s = null;
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (raw) s = JSON.parse(raw);
    } catch (e) { s = null; }
    if (!s || s.version !== VERSION || !Array.isArray(s.students)) s = seed();
    state = s;
    return state;
  }

  function save() {
    try { global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: keep in memory */ }
  }

  function log(icon, msg) {
    var s = load();
    s.activity.unshift({ t: Date.now(), icon: icon, msg: msg });
    s.activity = s.activity.slice(0, 30);
  }

  var Store = {
    DEFAULT_ID: DEFAULT_ID,
    PROGRAMMES: PROGRAMMES,
    YEARS: YEARS,
    TEMPLATES: TEMPLATES,
    DEFAULT_BRANDING: DEFAULT_BRANDING,
    randomAvatar: function () { return randomAvatar(Math.random); },
    emailFor: emailFor,

    get state() { return load(); },
    save: save,
    log: function (icon, msg) { log(icon, msg); save(); },

    students: function () { return load().students; },
    student: function (id) {
      var list = load().students;
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return null;
    },
    addStudent: function (s) { load().students.unshift(s); log('plus', 'Demo profile created: ' + s.name); save(); },
    updateStudent: function (id, patch) {
      var s = Store.student(id);
      if (!s) return null;
      Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
      save();
      return s;
    },
    removeStudent: function (id) {
      var s = load();
      s.students = s.students.filter(function (x) { return x.id !== id; });
      save();
    },
    nextId: function () {
      var max = 1000;
      load().students.forEach(function (s) {
        var m = /^DEMO-\d{4}-(\d+)$/.exec(s.id);
        if (m) max = Math.max(max, parseInt(m[1], 10));
      });
      return 'DEMO-2026-' + (max + 1);
    },

    branding: function () { return load().branding; },
    setBranding: function (b) { load().branding = b; log('palette', 'Branding updated for ' + b.institution); save(); },

    templateId: function () { return load().template; },
    setTemplate: function (id) { load().template = id; save(); },
    template: function (id) {
      id = id || load().template;
      for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].id === id) return TEMPLATES[i];
      return TEMPLATES[0];
    },

    inWallet: function () { return !!load().wallet; },
    setWallet: function (v) { load().wallet = !!v; save(); },

    eventInterest: function (id) { return !!load().events[id]; },
    toggleEvent: function (id) { var e = load().events; e[id] = !e[id]; save(); return e[id]; },

    recordView: function (id) {
      var s = Store.student(id);
      if (s) { s.views++; save(); }
    },
    recordScan: function (id) {
      var st = load(), s = Store.student(id);
      if (s) s.scans++;
      st.scanSeries[st.scanSeries.length - 1]++;
      log('scan', 'Demo QR scanned for ' + id);
      save();
    },

    totals: function () {
      var st = load(), views = st.extraViews, scans = st.extraScans, active = 0, depts = {}, progs = {};
      st.students.forEach(function (s) {
        views += s.views; scans += s.scans;
        if (s.status === 'active') active++;
        depts[s.department] = (depts[s.department] || 0) + 1;
        progs[s.programmeShort] = (progs[s.programmeShort] || 0) + 1;
      });
      return { ids: st.students.length, active: active, views: views, scans: scans, depts: depts, progs: progs };
    },

    reset: function () { state = seed(); save(); }
  };

  global.Store = Store;
})(window);
