// Infinitia Links — Enterprise Digital Identity presentation (pptxgenjs, structured deck)
const pptxgen = require('pptxgenjs');
const path = require('path');
const sizeOf = require('image-size').imageSize || require('image-size');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const OUT = path.resolve(__dirname, '../Infinitia_Links_Enterprise_Digital_Identity_Presentation.pptx');
const E = f => path.join(__dirname, 'build/embed', f);
const BR = f => path.resolve(__dirname, '../visual-assets/brand', f);
const IC = (n, c = 'blue') => path.join(__dirname, 'build/icons', `${n}-${c}.png`);

const THEME = {
  name: 'Infinitia Links',
  headFontFace: 'Calibri', bodyFontFace: 'Calibri',
  colors: { dk1: '0B1433', lt1: 'FFFFFF', dk2: '5B6683', lt2: 'F3F6FC', accent1: '1463FF', accent2: '00B4F5', accent3: '7B2CF5', accent4: '12B76A', accent5: 'F59E0B', accent6: 'E5484D', hlink: '1463FF', folHlink: '7B2CF5' }
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'Infinitia Links — Enterprise Digital Identity & Verification Platform';
pres.author = 'Infinitia Hub';
pres.company = 'Infinitia Hub';
pres.subject = 'Enterprise proposal';
const C = pres.SchemeColor;
const W = 13.333, H = 7.5, M = 0.6;

/* ---------- Layouts ---------- */
const DARK_BG = { path: path.join(__dirname, 'build/bg-dark.png') };
pres.defineSlideMaster({
  title: 'COVER', background: DARK_BG,
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.65, w: 6.4, h: 1.65, fontSize: 38, bold: true, color: C.background1, align: 'left', valign: 'top', margin: 0 }, text: '' } }]
});
pres.defineSlideMaster({
  title: 'STATEMENT', background: DARK_BG,
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.1, w: 11.6, h: 2.0, fontSize: 38, bold: true, color: C.background1, align: 'left', valign: 'top', margin: 0 }, text: '' } }]
});
pres.defineSlideMaster({
  title: 'CLOSING', background: DARK_BG,
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.75, w: 7.0, h: 1.4, fontSize: 34, bold: true, color: C.background1, align: 'left', valign: 'top', margin: 0 }, text: '' } }]
});
pres.defineSlideMaster({
  title: 'CONTENT', background: { color: 'FFFFFF' },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: M, y: 0.42, w: 9, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 2, margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.72, w: 11.6, h: 0.75, fontSize: 30, bold: true, color: C.text1, align: 'left', valign: 'top', margin: 0 }, text: '' } },
    { image: { path: BR('infinitia-links-wordmark.png'), x: M, y: 7.0, w: 1.3, h: 1.3 * 152 / 1094 } },
    { text: { text: 'Enterprise Digital Identity Platform  ·  An enterprise digital identity solution by Infinitia Hub', options: { x: 2.1, y: 6.93, w: 8, h: 0.3, fontSize: 10, color: C.text2, margin: 0, valign: 'middle' } } }
  ],
  slideNumber: { x: 12.2, y: 6.93, w: 0.55, h: 0.3, fontSize: 10, color: C.text2, align: 'right' }
});

/* ---------- Helpers ---------- */
function fit(file, x, y, w, h, align = 'c') {
  const d = sizeOf(file), r = Math.min(w / d.width, h / d.height);
  const iw = d.width * r, ih = d.height * r;
  const ix = align === 'l' ? x : align === 'r' ? x + w - iw : x + (w - iw) / 2;
  return { path: file, x: ix, y: y + (h - ih) / 2, w: iw, h: ih };
}
function img(s, file, x, y, w, h, align, name) { s.addImage({ ...fit(file, x, y, w, h, align), objectName: name || path.basename(file) }); }
function tile(s, icon, x, y, size = 0.5, tone = 'soft') {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: size, h: size, rectRadius: size * 0.28, fill: { color: tone === 'solid' ? C.accent1 : tone === 'dark' ? C.text1 : C.background2 }, line: { type: 'none' }, objectName: 'icon tile' });
  const p = size * 0.24;
  s.addImage({ path: IC(icon, tone === 'soft' ? 'blue' : 'white'), x: x + p, y: y + p, w: size - 2 * p, h: size - 2 * p, objectName: icon + ' icon' });
}
function panel(s, x, y, w, h, fill = 'soft') {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.16, fill: { color: fill === 'white' ? C.background1 : C.background2 }, line: fill === 'white' ? { color: 'E3E8F2', width: 0.75 } : { type: 'none' }, objectName: 'panel' });
}
function text(s, t, x, y, w, h, o = {}) { s.addText(t, { x, y, w, h, margin: 0, isTextBox: true, valign: 'top', fontSize: 14, color: C.text1, ...o }); }
function feature(s, icon, title, body, x, y, w, o = {}) {
  tile(s, icon, x, y, 0.48, o.tone);
  text(s, title, x + 0.66, y - 0.02, w - 0.66, 0.32, { fontSize: 15, bold: true, color: o.dark ? C.background1 : C.text1 });
  if (body) text(s, body, x + 0.66, y + 0.3, w - 0.66, o.bh || 0.62, { fontSize: 12.5, color: o.dark ? C.background1 : C.text2, transparency: o.dark ? 25 : 0 });
}
function bullets(s, items, x, y, w, h, o = {}) {
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: i < items.length - 1, paraSpaceAfter: 7 } })), { x, y, w, h, margin: 0, isTextBox: true, valign: 'top', fontSize: o.fontSize || 14, color: o.color || C.text1 });
}
function pill(s, label, x, y, w, kind = 'blue') {
  const fill = { blue: C.background2, dark: C.text1, opt: C.background1 }[kind];
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.32, rectRadius: 0.16, fill: { color: fill }, line: kind === 'opt' ? { color: C.text2, width: 0.75, dashType: 'dash' } : { type: 'none' } });
  text(s, label, x, y, w, 0.32, { fontSize: 10.5, bold: true, align: 'center', valign: 'middle', color: kind === 'dark' ? C.background1 : kind === 'opt' ? C.text2 : C.accent1, charSpacing: 1 });
}
let sec = '';
function content(kicker, title, notes) {
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: sec });
  s.addText(kicker.toUpperCase(), { placeholder: 'kicker' });
  s.addText(title, { placeholder: 'title' });
  if (notes) s.addNotes(notes);
  return s;
}
function section(t) { sec = t; pres.addSection({ title: t }); }

/* ======================================================================== */
section('Introduction');

// 1. Cover
{
  const s = pres.addSlide({ masterName: 'COVER', sectionTitle: sec });
  s.addImage({ ...fit(BR('infinitia-links-logo-white.png'), M, 0.6, 2.1, 1.7, 'l'), objectName: 'Infinitia Links logo' });
  s.addText('Enterprise Digital Identity & Verification Platform', { placeholder: 'title' });
  text(s, 'A centralised digital identity, verification and workforce information platform for universities, healthcare, corporates, financial services and field workforces.', M, 4.35, 6.6, 1.0, { fontSize: 16, color: C.background1, transparency: 20 });
  text(s, 'One link. Infinite possibilities.', M, 5.45, 6, 0.4, { fontSize: 16, italic: true, bold: true, color: C.accent2 });
  s.addImage({ ...fit(BR('infinitia-hub-logo-white.png'), M, 6.15, 0.95, 0.75, 'l'), objectName: 'Infinitia Hub logo' });
  text(s, 'An enterprise digital identity solution by Infinitia Hub\ninfinitialinks.com', M + 1.15, 6.3, 5, 0.6, { fontSize: 11.5, color: C.background1, transparency: 25 });
  img(s, E('hero-phones.png'), 7.0, 0.55, 6.1, 6.4, 'c', 'Digital ID mockups on three phones');
  s.addNotes('Opening. Infinitia Links is a configurable platform: every employee gets a secure, mobile-accessible digital identity with a unique QR code; the organisation issues, verifies, updates, suspends and revokes those identities centrally. All people and organisations shown in this deck are fictional demonstrations.');
}

// 2. Challenge
{
  const s = content('The challenge', 'Physical ID cards were never designed for today’s workforce',
    'Frame the problem in the audience’s language: cost and delay of physical cards, the difficulty of checking whether a card is still valid, and the risk of cards staying in circulation after someone leaves. Avoid quoting numbers we cannot substantiate.');
  const items = [
    ['idcard', 'Slow, costly to reissue', 'Printing, reprinting and replacing lost or outdated cards takes time and budget.'],
    ['alert', 'Hard to verify on the spot', 'A printed card cannot tell a verifier whether it is still valid today.'],
    ['ban', 'Leavers’ cards stay in circulation', 'Cards of suspended or exited staff can still look authentic.'],
    ['users', 'Fragmented records', 'Identity details live in spreadsheets, HR systems and ID vendors — rarely in sync.'],
    ['pin', 'Field staff, unverifiable', 'Customers have little way to confirm that a field visitor is genuinely authorised.'],
    ['building', 'Inconsistent branding', 'Multiple campuses or branches issue different-looking cards over time.']
  ];
  items.forEach((it, i) => {
    const col = i % 3, row = Math.floor(i / 3), x = M + col * 4.1, y = 1.95 + row * 2.3;
    panel(s, x, y, 3.85, 2.05);
    tile(s, it[0], x + 0.3, y + 0.3, 0.55);
    text(s, it[1], x + 0.3, y + 1.0, 3.3, 0.35, { fontSize: 16, bold: true });
    text(s, it[2], x + 0.3, y + 1.38, 3.3, 0.6, { fontSize: 12.5, color: C.text2 });
  });
}

// 3. Vision
{
  const s = pres.addSlide({ masterName: 'STATEMENT', sectionTitle: sec });
  text(s, 'OUR VISION', M, 0.6, 6, 0.3, { fontSize: 12, bold: true, color: C.accent2, charSpacing: 3 });
  s.addText('Every employee carries a verifiable identity. Every organisation controls it centrally.', { placeholder: 'title' });
  const pillars = [['idcard', 'Digital first', 'A secure, branded identity on every phone — reducing dependence on physical cards.'], ['shield', 'Verifiable anywhere', 'A unique QR that checks live credential status with the issuing organisation.'], ['grid', 'Centrally governed', 'Issue, renew, suspend and revoke from one console, with a full audit trail.']];
  pillars.forEach((p, i) => {
    const x = M + i * 4.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 3.75, w: 3.85, h: 2.6, rectRadius: 0.18, fill: { color: C.background1, transparency: 92 }, line: { color: C.background1, transparency: 80, width: 0.75 } });
    tile(s, p[0], x + 0.32, 4.07, 0.6, 'solid');
    text(s, p[1], x + 0.32, 4.85, 3.2, 0.4, { fontSize: 18, bold: true, color: C.background1 });
    text(s, p[2], x + 0.32, 5.3, 3.2, 0.9, { fontSize: 13.5, color: C.background1, transparency: 22 });
  });
  s.addNotes('The vision in one sentence. Three pillars: digital first, verifiable anywhere, centrally governed.');
}

// 4. Introducing
{
  const s = content('Introducing Infinitia Links', 'More than an ID card — a complete workforce identity platform',
    'Position this as more than an ID card generator: it is the system of record for workforce identity credentials, with verification, lifecycle management and optional directory and service links.');
  text(s, 'Organisations issue each employee a secure, mobile-accessible digital identity with a unique QR code — then manage, verify, update, suspend and deactivate it from one administrative dashboard.', M, 1.75, 6.2, 1.1, { fontSize: 16, color: C.text2 });
  const f = [['idcard', 'Digital identity cards', 'Branded templates per organisation'], ['shield', 'QR verification', 'Live, server-side status checks'], ['grid', 'Admin console', 'Full credential lifecycle & audit'], ['list', 'Directory & service links', 'Optional, privacy-controlled']];
  f.forEach((x, i) => feature(s, x[0], x[1], x[2], M + (i % 2) * 3.2, 3.15 + Math.floor(i / 2) * 1.15, 3.1, { bh: 0.4 }));
  text(s, 'Infinitia Hub  ›  Infinitia Links  ›  “Powered by Infinitia Links” on every identity page', M, 5.65, 6.4, 0.35, { fontSize: 12, bold: true, color: C.accent1 });
  text(s, 'The organisation’s brand leads. Infinitia Links appears as a discreet endorsement.', M, 6.0, 6.4, 0.35, { fontSize: 12, color: C.text2 });
  img(s, E('phone-corporate-id.png'), 7.15, 1.55, 2.85, 5.25, 'c', 'Corporate digital ID on phone');
  img(s, E('verification-page-active.png'), 10.05, 1.55, 2.85, 5.25, 'c', 'Verification page on phone');
}

// 5. How it works
{
  const s = content('How the platform works', 'Four steps, one continuously verifiable identity',
    'Walk the lifecycle: issue, carry, verify, manage. Emphasise that status changes take effect at the next scan because verification is server-side.');
  const steps = [['upload', 'Issue', 'Admins add employees individually or by Excel/CSV import; identities are generated on the organisation’s template.'], ['idcard', 'Carry', 'Each employee opens their digital ID on a phone via a secure link — no physical card required.'], ['scan', 'Verify', 'Anyone scans the QR code and sees the live credential status from the issuing organisation.'], ['refresh', 'Manage', 'Renew, suspend, revoke or update centrally. Every change is logged and reflected on the next scan.']];
  steps.forEach((st, i) => {
    const x = M + i * 3.07;
    panel(s, x, 1.95, 2.85, 3.2, 'white');
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 2.25, w: 0.62, h: 0.62, fill: { color: C.accent1 }, line: { type: 'none' } });
    text(s, String(i + 1), x + 0.3, 2.25, 0.62, 0.62, { fontSize: 18, bold: true, color: C.background1, align: 'center', valign: 'middle' });
    s.addImage({ path: IC(st[0], 'blue'), x: x + 2.15, y: 2.33, w: 0.45, h: 0.45 });
    text(s, st[1], x + 0.3, 3.1, 2.3, 0.45, { fontSize: 22, bold: true });
    text(s, st[2], x + 0.3, 3.6, 2.35, 1.45, { fontSize: 13, color: C.text2 });
  });
  panel(s, M, 5.45, 12.1, 1.15);
  tile(s, 'shield', M + 0.3, 5.75, 0.52, 'solid');
  text(s, 'Verification is server-side.', M + 1.05, 5.68, 10.6, 0.35, { fontSize: 15, bold: true });
  text(s, 'A suspended, expired or revoked credential stops showing as valid the moment its status changes — even if an old screenshot of the card is still circulating.', M + 1.05, 6.02, 10.7, 0.5, { fontSize: 12.5, color: C.text2 });
}

section('Product experience');

// 6. Digital ID experience
{
  const s = content('Digital staff ID', 'A premium identity experience on every phone',
    'Point to the card: organisation branding, photograph, name, employee ID, designation, department, branch, category, validity, QR and live status. Emergency contact and joining date appear only where the organisation authorises them.');
  img(s, E('phone-university-id.png'), M, 1.55, 3.6, 5.3, 'c', 'University staff ID on phone');
  const groups = [
    ['palette', 'Organisation branding', 'Logo, colours and template chosen by the organisation'],
    ['user', 'Employee details', 'Photo, full name, unique employee ID, designation, department'],
    ['building', 'Placement', 'Branch or location, employment category, joining date where appropriate'],
    ['clock', 'Validity', 'Expiry date and current credential status shown on the card'],
    ['qr', 'Unique QR code', 'Opens a secure verification link for that credential only'],
    ['phone', 'Contacts', 'Official contact; emergency contact only where authorised']
  ];
  groups.forEach((g, i) => feature(s, g[0], g[1], g[2], 4.75 + (i % 2) * 4.15, 1.85 + Math.floor(i / 2) * 1.5, 3.95, { bh: 0.7 }));
  pill(s, 'ALL SAMPLE IDENTITIES IN THIS DECK ARE FICTIONAL · DEMO', 4.75, 6.4, 5.4, 'blue');
}

// 7. Gallery
{
  const s = content('ID card design gallery', 'Six templates, configurable to each organisation’s brand',
    'Templates are starting points. Each organisation configures logo, colours, fields and layout. Sample identities are fictional and labelled DEMO.');
  const cards = [['card-corporate.png', 'Premium Corporate Blue', 'Corporate employee'], ['card-admin.png', 'Modern Minimal White', 'College administrative staff'], ['card-field.png', 'Premium Dark', 'Field executive'], ['card-professor.png', 'University Institutional', 'University professor'], ['card-hospital.png', 'Healthcare Professional', 'Hospital employee'], ['card-agent.png', 'Financial Services', 'Loan recovery agent']];
  const cw = 1.86, gap = 0.19;
  cards.forEach((c, i) => {
    const x = M + i * (cw + gap);
    img(s, E(c[0]), x, 1.7, cw, 2.96, 'c', c[1] + ' template');
    text(s, c[1], x, 4.85, cw, 0.5, { fontSize: 13, bold: true, align: 'center' });
    text(s, c[2], x, 5.35, cw, 0.3, { fontSize: 11, color: C.text2, align: 'center' });
  });
  panel(s, M, 5.95, 12.1, 0.72);
  text(s, 'Every template supports: organisation logo · photograph · name · employee ID · designation · department · branch · category · validity · unique QR · live status · official contact', M + 0.3, 5.95, 11.5, 0.72, { fontSize: 12.5, color: C.text2, valign: 'middle' });
}

// 8. QR workflow
{
  const s = content('QR verification', 'A six-step workflow that always checks live status',
    'Stress the safeguard: QR verification confirms credential status with the issuing organisation; it does not independently prove the physical identity of the person presenting the card. Verifiers should still compare the photograph.');
  const steps = [['idcard', 'ID presented', 'Employee shows their digital or printed ID'], ['scan', 'QR scanned', 'Any phone camera, no app or login'], ['link', 'Secure link opens', 'Unique, non-guessable credential URL'], ['db', 'Status checked', 'Server-side lookup, never in the QR itself'], ['user', 'Details shown', 'Only fields the organisation approves'], ['check', 'Verdict', 'Active · Suspended · Expired · Revoked']];
  steps.forEach((st, i) => {
    const x = M + i * 2.03;
    tile(s, st[0], x, 1.85, 0.62, i === 5 ? 'solid' : 'soft');
    if (i < 5) s.addShape(pres.shapes.LINE, { x: x + 0.72, y: 2.16, w: 1.2, h: 0, line: { color: C.accent2, width: 1.5, dashType: 'dash' } });
    text(s, (i + 1) + '. ' + st[1], x, 2.65, 1.9, 0.35, { fontSize: 14, bold: true });
    text(s, st[2], x, 3.0, 1.85, 0.75, { fontSize: 12, color: C.text2 });
  });
  text(s, 'Built-in safeguards', M, 4.15, 5, 0.4, { fontSize: 18, bold: true });
  const sg = [['key', 'Unique, non-guessable identifiers'], ['db', 'Server-side verification only'], ['ban', 'Revoked IDs never appear valid'], ['eye', 'Confidential data never exposed'], ['lock', 'Anti-tampering & rate limiting'], ['clock', 'Verification timestamp on every result']];
  sg.forEach((g, i) => {
    const x = M + (i % 3) * 4.05, y = 4.7 + Math.floor(i / 3) * 0.72;
    tile(s, g[0], x, y, 0.42);
    text(s, g[1], x + 0.58, y, 3.4, 0.42, { fontSize: 13.5, valign: 'middle' });
  });
  panel(s, M, 6.2, 12.1, 0.5);
  text(s, 'QR verification confirms credential status. It does not independently prove the physical identity of the person presenting it.', M + 0.3, 6.2, 11.6, 0.5, { fontSize: 12, italic: true, color: C.text2, valign: 'middle' });
}

// 9. Verifier experience
{
  const s = content('Customer & visitor verification', 'What a verifier sees — in seconds, without an app',
    'Two outcomes on the same page design: verified-active, and not-active (revoked). Non-active results withhold personal details.');
  img(s, E('verification-page-active.png'), M, 1.5, 3.1, 5.35, 'c', 'Verified active result');
  img(s, E('verification-page-revoked.png'), M + 3.25, 1.5, 3.1, 5.35, 'c', 'Revoked result');
  text(s, 'The verification page shows', 7.2, 1.75, 5.5, 0.4, { fontSize: 18, bold: true });
  bullets(s, ['Verified / Not Active status, prominently', 'Employee photograph and name', 'Employee ID, designation, department, branch', 'Organisation and issuing organisation', 'Validity date and verification timestamp'], 7.2, 2.3, 5.5, 2.3, { fontSize: 14 });
  panel(s, 7.2, 4.75, 5.5, 1.9);
  tile(s, 'shield', 7.45, 5.0, 0.48, 'solid');
  text(s, 'Designed for trust', 8.1, 4.98, 4.4, 0.35, { fontSize: 15, bold: true });
  text(s, 'Suspended, expired and revoked credentials are clearly marked as not active. Only fields approved by the organisation are ever displayed.', 8.1, 5.33, 4.4, 1.2, { fontSize: 12.5, color: C.text2 });
}

// 10. Admin dashboard
{
  const s = content('Enterprise admin dashboard', 'One console for the entire identity lifecycle',
    'Modules: overview, employee management, bulk management, verification analytics, organisation management, security and audit. Figures on screen are sample data.');
  img(s, E('admin-dashboard.png'), M, 1.55, 8.3, 5.25, 'l', 'Admin dashboard overview');
  const mods = [['grid', 'Overview', 'Totals, active, suspended, expired, recently issued, verifications'], ['users', 'Employee management', 'Add, edit, photo, department, branch, designation, renew'], ['idcard', 'Credential status', 'Activate · suspend · expire · revoke, with history'], ['building', 'Organisation', 'Profile, logo, colours, templates, branches, roles'], ['lock', 'Security & audit', 'Role-based access, activity and access logs']];
  mods.forEach((m, i) => feature(s, m[0], m[1], m[2], 9.2, 1.65 + i * 1.03, 3.55, { bh: 0.62 }));
}

// 11. Bulk onboarding
{
  const s = content('Bulk employee onboarding', 'Hundreds of identities in a single, validated batch',
    'Excel/CSV import with column mapping and validation. Invalid rows are held back with a downloadable error report while valid rows proceed. Bulk activation, renewal and suspension follow the same pattern.');
  img(s, E('bulk-upload.png'), 4.55, 1.55, 8.2, 5.25, 'r', 'Bulk onboarding screen');
  const st = [['upload', 'Excel / CSV import', 'Standard template or mapped columns'], ['check', 'Validation & error reports', 'Missing fields, duplicates, invalid dates'], ['idcard', 'Bulk ID generation', 'On the organisation’s default template'], ['refresh', 'Bulk activate · renew · suspend', 'With reasons and approvals']];
  st.forEach((x, i) => feature(s, x[0], x[1], x[2], M, 1.8 + i * 1.2, 3.75, { bh: 0.6 }));
}

// 12. Directory
{
  const s = content('Digital staff directory · optional', 'Find the right person — with privacy set by the organisation',
    'Optional module. The organisation decides which fields are visible and to whom (public, signed-in staff only, or disabled).');
  img(s, E('staff-directory.png'), M, 1.55, 8.3, 5.25, 'l', 'Staff directory');
  const f = [['search', 'Search', 'By employee name or employee ID'], ['filter', 'Filter', 'By department, designation or branch'], ['mail', 'Official contact', 'Email or office line, where authorised'], ['eye', 'Visibility controls', 'Organisation chooses every visible field']];
  f.forEach((x, i) => feature(s, x[0], x[1], x[2], 9.2, 1.8 + i * 1.2, 3.55, { bh: 0.6 }));
}

// 13. Communication links
{
  const s = content('Staff communication & service links', 'The identity page becomes a gateway to existing systems',
    'These links connect to the organisation’s existing systems. Infinitia Links is not an HRMS, payroll or attendance system.');
  img(s, E('staff-service-links.png'), M, 1.5, 3.3, 5.35, 'c', 'Staff service links on phone');
  const L = [['users', 'HR portal'], ['cal', 'Leave management portal'], ['help', 'Internal helpdesk'], ['book', 'Staff handbook'], ['mega', 'Official circulars'], ['cap', 'Training resources'], ['cal', 'Event registrations'], ['globe', 'Department websites'], ['alert', 'Emergency information'], ['msg', 'Feedback & grievance']];
  L.forEach((l, i) => {
    const x = 4.4 + (i % 2) * 4.2, y = 1.8 + Math.floor(i / 2) * 0.82;
    panel(s, x, y, 3.95, 0.66);
    s.addImage({ path: IC(l[0], 'blue'), x: x + 0.22, y: y + 0.17, w: 0.32, h: 0.32 });
    text(s, l[1], x + 0.72, y, 3.1, 0.66, { fontSize: 14, bold: true, valign: 'middle' });
  });
  text(s, 'Links open the organisation’s existing systems. Infinitia Links does not replace an HRMS, payroll or attendance platform.', 4.4, 6.05, 8.2, 0.6, { fontSize: 12.5, italic: true, color: C.text2 });
}

section('Use cases');

function useCase(kicker, title, phone, phoneName, items, sideNote, notes) {
  const s = content(kicker, title, notes);
  img(s, E(phone), 9.25, 1.45, 3.5, 5.4, 'c', phoneName);
  items.forEach((it, i) => feature(s, it[0], it[1], it[2], M + (i % 2) * 4.3, 1.8 + Math.floor(i / 2) * 1.32, 4.05, { bh: 0.7 }));
  if (sideNote) { panel(s, M, 5.85, 8.35, 0.8); text(s, sideNote, M + 0.3, 5.85, 7.9, 0.8, { fontSize: 12.5, color: C.text2, valign: 'middle' }); }
  return s;
}

// 14. Education
useCase('Universities & colleges', 'One identity platform across campuses, faculties and staff', 'phone-university-id.png', 'University professor digital ID',
  [['cap', 'Faculty & professors', 'Verified academic identity with department and designation'], ['building', 'Administrative staff', 'Registrar, examination, accounts and support staff'], ['users', 'Multi-campus institutions', 'Branches and constituent colleges under one console'], ['shield', 'Visitor-facing verification', 'Parents, examiners and partners can verify staff quickly'], ['list', 'Academic directory', 'Optional faculty directory with approved details'], ['link', 'Campus service links', 'LMS, library, circulars and helpdesk shortcuts']],
  'Universities · engineering, medical, dental, nursing & pharmacy colleges · schools · autonomous & research institutions',
  'Education segment. Same platform; each institution configures its own branding, roles and templates.');

// 15. Healthcare
useCase('Healthcare', 'Trusted identification across wards, shifts and visiting consultants', 'phone-hospital-id.png', 'Hospital staff digital ID',
  [['heart', 'Clinical & nursing staff', 'Department and role visible at a glance'], ['user', 'Visiting consultants', 'Time-bound credentials with clear validity'], ['shield', 'Patient-facing trust', 'Patients and families can confirm staff status'], ['refresh', 'Rapid deactivation', 'Exits and contract ends reflected on the next scan'], ['building', 'Multi-facility groups', 'Hospitals, clinics and diagnostic centres'], ['alert', 'Emergency information', 'Links to internal emergency protocols']],
  'Hospitals · clinics · diagnostic centres · medical institutions · healthcare staff and visiting consultants',
  'Healthcare segment. Emphasise visiting consultants and time-bound validity.');

// 16. Corporate
useCase('Corporate', 'Consistent identity for every office, branch and contractor', 'phone-corporate-id.png', 'Corporate employee digital ID',
  [['building', 'Multi-branch organisations', 'Branch-level administration and reporting'], ['users', 'Employees & contractors', 'Different categories, templates and validity'], ['refresh', 'Onboarding & offboarding', 'Issue on day one, revoke on exit'], ['shield', 'Visitor & client trust', 'Clients can confirm staff identity status'], ['palette', 'Group branding', 'Business groups with multiple brands'], ['chart', 'Administrative visibility', 'Who holds an active credential, at any time']],
  'IT companies · manufacturing · corporate offices · business groups · multi-branch organisations',
  'Corporate segment.');

// 17. Field & recovery
{
  const s = content('Field executives & loan recovery agents', 'Customers can confirm a field visitor is genuinely authorised',
    'Most sensitive use case. The lending organisation provides and approves the agent’s authorisation details; Infinitia Links displays them and their status. Borrower information is never shown.');
  img(s, E('phone-recovery-agent-id.png'), M, 1.45, 2.95, 5.4, 'c', 'Recovery agent digital ID');
  img(s, E('verification-page-agent.png'), M + 3.0, 1.45, 2.95, 5.4, 'c', 'Agent verification page');
  text(s, 'Agent identity module', 7.0, 1.7, 5.7, 0.4, { fontSize: 18, bold: true });
  bullets(s, ['Employer and agency information', 'Designation and authorised service area', 'Active / suspended / expired status', 'Customer complaint and callback links', 'Official company contact', 'Verification history for the organisation'], 7.0, 2.2, 5.7, 2.4, { fontSize: 13.5 });
  panel(s, 7.0, 4.55, 5.75, 2.1);
  tile(s, 'lock', 7.25, 4.8, 0.48, 'dark');
  text(s, 'Never shown on public pages', 7.9, 4.78, 4.7, 0.35, { fontSize: 15, bold: true });
  text(s, 'Borrower account numbers, loan amounts, personal financial information or any confidential customer details. Agent authorisation and lender assignments are provided and approved by the organisation — Infinitia Links does not authorise agents.', 7.9, 5.13, 4.7, 1.45, { fontSize: 12, color: C.text2 });
}

section('Platform & governance');

// 18. Optional integrations
{
  const s = content('Optional advanced integrations', 'Extend the platform when you need to — scoped separately',
    'These are optional capabilities or future integrations, not automatically available. Hardware, apps, third-party APIs and subscriptions may be separately required. A normal QR code does not provide NFC, biometric attendance, physical access or continuous GPS tracking.');
  const it = [['nfc', 'NFC-enabled ID cards'], ['wallet', 'Mobile wallet credentials'], ['clock', 'Attendance system integration'], ['key', 'Physical access control'], ['users', 'Visitor management'], ['pin', 'GPS & field-force platforms'], ['globe', 'Geofencing'], ['sos', 'Emergency SOS'], ['api', 'REST API integration'], ['lock', 'Single Sign-On (SSO)'], ['db', 'Existing HRMS integration'], ['cap', 'University ERP integration']];
  it.forEach((x, i) => {
    const col = i % 3, row = Math.floor(i / 3), xx = M + col * 2.55, y = 1.8 + row * 1.0;
    panel(s, xx, y, 2.4, 0.82, 'white');
    s.addImage({ path: IC(x[0], 'violet'), x: xx + 0.2, y: y + 0.24, w: 0.34, h: 0.34 });
    text(s, x[1], xx + 0.7, y, 1.6, 0.82, { fontSize: 12.5, bold: true, valign: 'middle' });
  });
  img(s, E('nfc-integration.png'), 8.4, 1.75, 4.35, 2.55, 'c', 'NFC integration illustration');
  img(s, E('gps-field-integration.png'), 8.4, 4.35, 4.35, 2.55, 'c', 'GPS field integration illustration');
  panel(s, M, 5.85, 7.55, 0.82);
  text(s, 'NFC readers, access-control hardware, GPS services, mobile apps, third-party APIs and their subscriptions may be separately required. A standard QR code does not provide NFC, biometric attendance, physical access or continuous GPS tracking.', M + 0.25, 5.85, 7.1, 0.82, { fontSize: 11.5, color: C.text2, valign: 'middle' });
}

// 19. Security & privacy
{
  const s = content('Security, privacy & governance', 'Identity data is sensitive — governance is built in, not bolted on',
    'Each deployment must be configured according to applicable data-protection law and the customer’s own policies. We make no claim of ISO, SOC or other certifications in this proposal.');
  const c = [['lock', 'Role-based administrative access'], ['key', 'Unique credential identifiers'], ['scan', 'QR verification controls'], ['ban', 'Credential revocation'], ['clock', 'Expiry management'], ['list', 'Audit trails'], ['eye', 'Data minimisation'], ['building', 'Organisation-controlled visibility'], ['check', 'Consent & transparency'], ['file', 'Retention & deletion policies'], ['globe', 'Secure transmission (HTTPS/TLS)'], ['refresh', 'Backup & recovery']];
  c.forEach((x, i) => {
    const col = i % 3, row = Math.floor(i / 3), xx = M + col * 2.75, y = 1.8 + row * 0.98;
    tile(s, x[0], xx, y, 0.46);
    text(s, x[1], xx + 0.62, y - 0.04, 2.05, 0.55, { fontSize: 13, bold: true, valign: 'middle' });
  });
  panel(s, 9.05, 1.7, 3.7, 4.95);
  tile(s, 'pin', 9.3, 1.95, 0.48, 'solid');
  text(s, 'Location features', 9.95, 1.95, 2.6, 0.45, { fontSize: 15, bold: true, valign: 'middle' });
  bullets(s, ['Explicit permission from the employee', 'Duty-based controls — never off-duty', 'Limited, defined retention', 'Transparent, visible sharing indicator', 'Configured to the organisation’s policy'], 9.3, 2.65, 3.25, 2.4, { fontSize: 12.5 });
  text(s, 'Each deployment is configured to applicable data-protection laws and the customer’s policies. No certification is claimed here.', 9.3, 5.35, 3.25, 1.1, { fontSize: 11.5, italic: true, color: C.text2 });
}

// 20. Deployment workflow
{
  const s = content('Deployment workflow', 'A structured ten-stage path from discovery to steady state',
    'Timelines are indicative and depend on data readiness, approvals, integration requirements and scope.');
  img(s, E('onboarding-workflow-steps.png'), M, 1.7, 12.1, 5.0, 'c', 'Ten-stage onboarding workflow');
}

// 21. Scalability
{
  const s = content('Enterprise scalability', 'From a single department to thousands of employees',
    'Indicative rollout plans by size. Actual timelines depend on data readiness, approvals, integration requirements and deployment scope.');
  const hdr = ['Deployment size', 'Typical pilot', 'Rollout approach', 'Indicative timeline*'].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: 13 } }));
  const rows = [['100 employees', 'Full group', 'Single-phase launch', '2 – 3 weeks'], ['500 employees', '1 department', 'Two phases', '3 – 5 weeks'], ['2,000 employees', '1 branch or faculty', 'Phased by branch', '5 – 8 weeks'], ['5,000 employees', '1–2 branches', 'Phased by region / unit', '8 – 12 weeks']].map((r, i) => r.map((t, j) => ({ text: t, options: { fontSize: 13, bold: j === 0, color: C.text1, fill: { color: i % 2 ? C.background1 : C.background2 } } })));
  s.addTable([hdr, ...rows], { x: M, y: 1.75, w: 7.6, colW: [1.95, 1.75, 2.05, 1.85], rowH: 0.52, border: { type: 'solid', color: 'E3E8F2', pt: 0.75 }, margin: [0.06, 0.12, 0.06, 0.12], valign: 'middle', objectName: 'Rollout plan table' });
  text(s, '*Indicative only. Depends on data readiness, approvals, integration requirements and deployment scope.', M, 4.5, 7.6, 0.5, { fontSize: 11.5, italic: true, color: C.text2 });
  panel(s, 8.6, 1.75, 4.15, 4.9);
  text(s, 'Designed to scale', 8.9, 2.0, 3.6, 0.4, { fontSize: 18, bold: true });
  const sc = [['building', 'Multi-organisation', 'Many organisations, each with segregated data and branding'], ['users', 'Multi-branch', 'Branch-level administrators and reporting'], ['upload', 'Batch operations', 'Import, renew and suspend thousands of records'], ['shield', 'Role-based delegation', 'HQ, branch and department admin roles']];
  sc.forEach((x, i) => feature(s, x[0], x[1], x[2], 8.9, 2.6 + i * 1.0, 3.65, { bh: 0.6 }));
  text(s, 'Each organisation configures its own branding, templates, structure, permissions and administrative controls.', M, 5.2, 7.6, 0.8, { fontSize: 14, color: C.text1 });
}

section('Commercials & value');

// 22. Commercial model
{
  const s = content('Commercial model', 'A transparent, modular pricing framework',
    'All prices are placeholders to be quoted after discovery. No figure in this deck is an approved quotation.');
  const hdr = ['Component', 'Basis', 'Price'].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: 13 } }));
  const rows = [['Initial setup & onboarding', 'One-time', '₹[To be quoted]'], ['Branding & configuration', 'One-time', '₹[To be quoted]'], ['Per-employee annual subscription', 'Per employee / year', '₹[To be quoted]'], ['Enterprise annual subscription', 'Per organisation / year', '₹[To be quoted]'], ['API & integration', 'Per integration', 'Separately quoted'], ['NFC / GPS hardware', 'Per device / card', 'Separately quoted'], ['Custom development', 'Per scope', 'Based on scope']].map((r, i) => r.map((t, j) => ({ text: t, options: { fontSize: 13, bold: j === 2, color: j === 2 ? C.accent1 : C.text1, fill: { color: i % 2 ? C.background1 : C.background2 } } })));
  s.addTable([hdr, ...rows], { x: M, y: 1.75, w: 7.7, colW: [3.4, 2.3, 2.0], rowH: 0.5, border: { type: 'solid', color: 'E3E8F2', pt: 0.75 }, margin: [0.06, 0.12, 0.06, 0.12], valign: 'middle', objectName: 'Pricing framework table' });
  text(s, 'Revenue models', 8.75, 1.75, 4, 0.4, { fontSize: 18, bold: true });
  const rm = [['cal', 'Annual subscription'], ['users', 'Per-employee licensing'], ['building', 'Enterprise licensing'], ['upload', 'Initial onboarding'], ['api', 'Integration services'], ['plus', 'Optional premium modules']];
  rm.forEach((x, i) => { tile(s, x[0], 8.75, 2.3 + i * 0.66, 0.44); text(s, x[1], 9.35, 2.3 + i * 0.66, 3.4, 0.44, { fontSize: 14, valign: 'middle' }); });
  text(s, 'All figures are placeholders and will be quoted after discovery. Nothing here is an approved quotation.', M, 5.95, 7.7, 0.6, { fontSize: 11.5, italic: true, color: C.text2 });
}

// 23. Business value
{
  const s = content('Business value', 'What organisations gain', 'Benefits are qualitative. We do not quote savings figures without a customer-specific assessment.');
  const b = [['idcard', 'Less physical card replacement'], ['upload', 'Faster credential issuance'], ['grid', 'Centralised identity management'], ['scan', 'Faster identity verification'], ['refresh', 'Better lifecycle management'], ['users', 'Easier onboarding & offboarding'], ['chart', 'Improved administrative visibility'], ['palette', 'Consistent organisation branding'], ['phone', 'Convenient mobile access'], ['list', 'Verification auditability']];
  b.forEach((x, i) => {
    const col = i % 5, row = Math.floor(i / 5), xx = M + col * 2.45, y = 1.85 + row * 2.05;
    panel(s, xx, y, 2.25, 1.8);
    tile(s, x[0], xx + 0.25, y + 0.25, 0.52);
    text(s, x[1], xx + 0.25, y + 0.9, 1.85, 0.8, { fontSize: 14, bold: true });
  });
  panel(s, M, 6.05, 12.1, 0.62, 'white');
  text(s, 'ROI is assessed per organisation with transparent assumptions (headcount, card replacement frequency, issuance effort). No savings are claimed in advance.', M + 0.3, 6.05, 11.6, 0.62, { fontSize: 12, color: C.text2, valign: 'middle' });
}

// 24. Why
{
  const s = content('Why Infinitia Links', 'Built for identity, designed for trust',
    'Close the argument with differentiators that are true of the proposition: purpose-built, configurable, privacy-first, honest about scope.');
  const w = [['shield', 'Purpose-built for verification', 'Live, server-side credential status — not just a printable card'], ['palette', 'Your brand first', 'White-labelled templates; Infinitia Links stays discreet'], ['building', 'One platform, every sector', 'Education, healthcare, corporate, finance and field workforce'], ['lock', 'Privacy by configuration', 'Organisations decide every visible field'], ['upload', 'Fast to deploy', 'Bulk onboarding and a structured ten-stage rollout'], ['link', 'Connects, doesn’t replace', 'Links to your existing HR, LMS and service systems']];
  w.forEach((x, i) => {
    const col = i % 3, row = Math.floor(i / 3), xx = M + col * 4.1, y = 1.85 + row * 2.4;
    panel(s, xx, y, 3.85, 2.15, 'white');
    tile(s, x[0], xx + 0.3, y + 0.3, 0.56, 'solid');
    text(s, x[1], xx + 0.3, y + 1.0, 3.3, 0.4, { fontSize: 16, bold: true });
    text(s, x[2], xx + 0.3, y + 1.4, 3.3, 0.65, { fontSize: 12.5, color: C.text2 });
  });
}

// 25. Closing
{
  const s = pres.addSlide({ masterName: 'CLOSING', sectionTitle: sec });
  s.addImage({ ...fit(BR('infinitia-links-logo-white.png'), M, 0.6, 2.1, 1.7, 'l'), objectName: 'Infinitia Links logo' });
  s.addText('Let’s design your organisation’s digital identity', { placeholder: 'title' });
  const steps = [['1', 'Discovery call', 'Goals, scope and data readiness'], ['2', 'Pilot scope', 'One department or branch'], ['3', 'Tailored proposal', 'Configuration, timeline and quotation']];
  steps.forEach((st, i) => {
    const y = 4.45 + i * 0.68;
    s.addShape(pres.shapes.OVAL, { x: M, y, w: 0.46, h: 0.46, fill: { color: C.accent1 }, line: { type: 'none' } });
    text(s, st[0], M, y, 0.46, 0.46, { fontSize: 14, bold: true, align: 'center', valign: 'middle', color: C.background1 });
    text(s, st[1] + '  —  ' + st[2], M + 0.65, y, 6.5, 0.46, { fontSize: 15, valign: 'middle', color: C.background1 });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.3, y: 2.0, w: 4.4, h: 3.6, rectRadius: 0.2, fill: { color: C.background1, transparency: 92 }, line: { color: C.background1, transparency: 80, width: 0.75 } });
  text(s, 'CONTACT', 8.65, 2.3, 3.8, 0.3, { fontSize: 11, bold: true, color: C.accent2, charSpacing: 3 });
  text(s, [{ text: 'infinitialinks.com', options: { hyperlink: { url: 'https://infinitialinks.com/' }, color: C.background1, bold: true, fontSize: 22, breakLine: true } }, { text: ' ', options: { fontSize: 8, breakLine: true } }, { text: 'Name: [To be added]', options: { breakLine: true } }, { text: 'Email: [To be added]', options: { breakLine: true } }, { text: 'Phone: [To be added]' }], 8.65, 2.7, 3.8, 2.0, { fontSize: 14, color: C.background1, transparency: 15 });
  s.addImage({ ...fit(BR('infinitia-hub-logo-white.png'), 8.65, 4.75, 1.0, 0.7, 'l'), objectName: 'Infinitia Hub logo' });
  text(s, 'An enterprise digital identity solution by Infinitia Hub', 9.8, 4.8, 2.8, 0.6, { fontSize: 11, color: C.background1, transparency: 25 });
  text(s, 'One link. Infinite possibilities.', 8.3, 6.2, 4.4, 0.4, { fontSize: 16, italic: true, bold: true, color: C.accent2, align: 'right' });
  text(s, 'All people, organisations, QR codes and figures shown are fictional demonstrations.', M, 6.85, 7.5, 0.3, { fontSize: 10, color: C.background1, transparency: 45 });
  s.addNotes('Close with three next steps and invite a discovery call. Contact details are placeholders to be filled in before sending.');
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('wrote', OUT);
})();
