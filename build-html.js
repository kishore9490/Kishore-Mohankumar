// Build an interactive, editable HTML version of the Mathera Tech IDD.
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = '/home/user/Kishore-Mohankumar';
const md = fs.readFileSync(path.join(ROOT, 'Mathera-Tech-IDD.md'), 'utf8');
const logoB64 = fs.readFileSync(path.join(ROOT, 'assets/matheratech-logo.png')).toString('base64');
const logoURI = 'data:image/png;base64,' + logoB64;

// ---- GitHub-style slugger ----
const seen = {};
function slug(text) {
  let s = text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')   // strip punctuation & emoji
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (seen[s] != null) { seen[s]++; s = s + '-' + seen[s]; } else { seen[s] = 0; }
  return s;
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- Custom renderer ----
const nav = []; // {level, text, id}
const renderer = new marked.Renderer();

renderer.code = function (code, infostring) {
  const lang = (infostring || '').trim().split(/\s+/)[0];
  if (lang === 'mermaid') {
    return '<div class="diagram-wrap"><pre class="mermaid">' + esc(code) + '</pre></div>\n';
  }
  return '<pre class="codeblock"><code>' + esc(code) + '</code></pre>\n';
};

renderer.heading = function (text, level, raw) {
  const id = slug(raw);
  if (level === 2) nav.push({ level, text, id });
  return `<h${level} id="${id}"><a class="anchor" href="#${id}" aria-label="link">#</a>${text}</h${level}>\n`;
};

marked.setOptions({ renderer, gfm: true, breaks: false });

let body = marked.parse(md);

// Embed logo
body = body.split('assets/matheratech-logo.png').join(logoURI);

// ---- Build sidebar nav ----
const navHtml = nav.map(n =>
  `<a class="nav-link" href="#${n.id}" data-target="${n.id}">${n.text.replace(/<[^>]+>/g, '')}</a>`
).join('\n');

// ---- Full page template ----
const html = `<style>
:root{
  --paper:#faf8f4; --surface:#ffffff; --surface-2:#f4efe7; --ink:#211c18; --muted:#6f645a;
  --line:#e5ddd0; --line-strong:#d4c8b6;
  --gold:#b8863f; --gold-soft:#d8b271; --gold-bg:#f6ecd9; --charcoal:#2b2320;
  --ok:#2e7d32; --ok-bg:#e6f2e6; --warn:#b26a00; --warn-bg:#fbecd6; --crit:#c62828; --crit-bg:#f8e3e3;
  --info:#1c6ea4; --info-bg:#e3eef6;
  --font-sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --font-mono:ui-monospace,"SF Mono","Cascadia Code",Menlo,Consolas,monospace;
  --sidebar-w:288px; --shadow:0 1px 3px rgba(43,35,32,.08),0 8px 24px rgba(43,35,32,.06);
}
@media (prefers-color-scheme:dark){
  :root{
    --paper:#17130f; --surface:#201a15; --surface-2:#2a2219; --ink:#efe7dc; --muted:#a99d8e;
    --line:#38301f; --line-strong:#4a3f2c;
    --gold:#d8b271; --gold-soft:#b8863f; --gold-bg:#2e2517; --charcoal:#efe7dc;
    --ok:#7ec488; --ok-bg:#1c2c1d; --warn:#e0a04b; --warn-bg:#33260f; --crit:#e98080; --crit-bg:#331a1a;
    --info:#77b3d9; --info-bg:#152530;
  }
}
:root[data-theme="dark"]{
  --paper:#17130f; --surface:#201a15; --surface-2:#2a2219; --ink:#efe7dc; --muted:#a99d8e;
  --line:#38301f; --line-strong:#4a3f2c;
  --gold:#d8b271; --gold-soft:#b8863f; --gold-bg:#2e2517; --charcoal:#efe7dc;
  --ok:#7ec488; --ok-bg:#1c2c1d; --warn:#e0a04b; --warn-bg:#33260f; --crit:#e98080; --crit-bg:#331a1a;
  --info:#77b3d9; --info-bg:#152530;
}
:root[data-theme="light"]{
  --paper:#faf8f4; --surface:#ffffff; --surface-2:#f4efe7; --ink:#211c18; --muted:#6f645a;
  --line:#e5ddd0; --line-strong:#d4c8b6;
  --gold:#b8863f; --gold-soft:#d8b271; --gold-bg:#f6ecd9; --charcoal:#2b2320;
  --ok:#2e7d32; --ok-bg:#e6f2e6; --warn:#b26a00; --warn-bg:#fbecd6; --crit:#c62828; --crit-bg:#f8e3e3;
  --info:#1c6ea4; --info-bg:#e3eef6;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-sans);
  font-size:15.5px;line-height:1.65;-webkit-font-smoothing:antialiased;scroll-padding-top:80px}

/* ---- Toolbar ---- */
.toolbar{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:12px;
  padding:10px 20px;background:color-mix(in srgb,var(--surface) 88%,transparent);
  backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid var(--line);}
.toolbar .brand{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:-.01em}
.toolbar .brand img{height:22px;width:auto;display:block}
.toolbar .spacer{flex:1}
.btn{appearance:none;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);
  font:inherit;font-size:13.5px;font-weight:600;padding:7px 13px;border-radius:8px;cursor:pointer;
  display:inline-flex;align-items:center;gap:7px;transition:.15s ease;white-space:nowrap}
.btn:hover{border-color:var(--gold);color:var(--gold)}
.btn:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.btn.primary{background:var(--gold);border-color:var(--gold);color:#fff}
.btn.primary:hover{filter:brightness(1.06);color:#fff}
.btn.active{background:var(--gold-bg);border-color:var(--gold);color:var(--gold)}
.badge{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  padding:3px 9px;border-radius:999px;background:var(--crit-bg);color:var(--crit)}

/* ---- Layout ---- */
.layout{display:grid;grid-template-columns:var(--sidebar-w) minmax(0,1fr);gap:0;align-items:start}
.sidebar{position:sticky;top:57px;height:calc(100vh - 57px);overflow-y:auto;
  border-right:1px solid var(--line);padding:22px 14px 60px;background:var(--surface)}
.sidebar h4{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
  margin:0 8px 10px;font-weight:700}
.nav-link{display:block;padding:6px 10px;border-radius:7px;color:var(--muted);text-decoration:none;
  font-size:13px;line-height:1.4;border-left:2px solid transparent}
.nav-link:hover{background:var(--surface-2);color:var(--ink)}
.nav-link.active{color:var(--gold);background:var(--gold-bg);border-left-color:var(--gold);font-weight:600}

.content{padding:0 clamp(20px,4vw,64px) 120px;min-width:0}
.doc{max-width:900px;margin:0 auto}

/* ---- Editing ---- */
.doc[contenteditable="true"]{outline:none}
body.editing .doc{background:linear-gradient(var(--surface),var(--surface));
  box-shadow:inset 0 0 0 2px var(--gold-soft);border-radius:12px;padding:8px 20px}
body.editing .doc :is(td,th,p,li,h1,h2,h3,h4,span){border-radius:4px}
body.editing .doc :is(td,th):hover{box-shadow:inset 0 0 0 1.5px var(--gold-soft)}
body.editing .doc :is(p,li):hover{box-shadow:inset 0 0 0 1px var(--gold-soft)}
.edit-hint{display:none}
body.editing .edit-hint{display:inline-flex}

/* ---- Typography ---- */
.doc h1{font-size:2.1rem;line-height:1.15;letter-spacing:-.02em;text-wrap:balance;margin:.4em 0 .3em}
.doc h2{font-size:1.55rem;letter-spacing:-.015em;text-wrap:balance;margin:2.4em 0 .5em;
  padding-top:1.1em;border-top:1px solid var(--line);scroll-margin-top:76px}
.doc h2:first-of-type{border-top:none}
.doc h3{font-size:1.2rem;letter-spacing:-.01em;margin:1.7em 0 .4em;color:var(--charcoal)}
.doc h4{font-size:1.02rem;margin:1.3em 0 .3em;color:var(--charcoal)}
.doc p{margin:.7em 0}
.doc a{color:var(--gold);text-decoration:none}
.doc a:hover{text-decoration:underline}
.anchor{opacity:0;margin-left:-1em;padding-right:.35em;color:var(--gold-soft);text-decoration:none;font-weight:400}
.doc :is(h2,h3,h4):hover .anchor{opacity:.6}
.doc strong{color:var(--charcoal);font-weight:700}
.doc hr{border:none;border-top:1px solid var(--line);margin:2.2em 0}
.doc ul,.doc ol{padding-left:1.3em;margin:.7em 0}
.doc li{margin:.28em 0}
.doc img{max-width:100%;height:auto}

/* Cover */
.doc>div[align="center"]:first-child{background:linear-gradient(160deg,var(--surface),var(--surface-2));
  border:1px solid var(--line);border-radius:16px;padding:44px 32px;margin-bottom:8px;box-shadow:var(--shadow)}
.doc>div[align="center"]:first-child img{filter:drop-shadow(0 2px 6px rgba(0,0,0,.12))}
:root[data-theme="dark"] .doc>div[align="center"] img,
@media (prefers-color-scheme:dark){.doc>div[align="center"] img{background:#faf8f4;border-radius:8px;padding:12px 18px}}

/* Inline code */
.doc code{font-family:var(--font-mono);font-size:.86em;background:var(--surface-2);
  border:1px solid var(--line);padding:.08em .4em;border-radius:5px;color:var(--charcoal)}
.doc pre.codeblock{font-family:var(--font-mono);font-size:.82rem;background:var(--charcoal);color:#f0e9dd;
  padding:16px 18px;border-radius:10px;overflow-x:auto;line-height:1.55}
.doc pre.codeblock code{background:none;border:none;color:inherit;padding:0}

/* ---- Tables ---- */
.table-scroll{overflow-x:auto;margin:1.1em 0;border:1px solid var(--line);border-radius:10px;box-shadow:var(--shadow)}
.doc table{border-collapse:collapse;width:100%;font-size:13.5px;font-variant-numeric:tabular-nums}
.doc thead th{background:var(--gold-bg);color:var(--charcoal);text-align:left;font-weight:700;
  padding:10px 13px;border-bottom:2px solid var(--gold-soft);white-space:nowrap}
.doc tbody td{padding:9px 13px;border-bottom:1px solid var(--line);vertical-align:top}
.doc tbody tr:nth-child(even){background:var(--surface-2)}
.doc tbody tr:hover{background:var(--gold-bg)}
.doc tbody tr:last-child td{border-bottom:none}

/* ---- Callouts (from blockquotes) ---- */
.doc blockquote{margin:1.2em 0;padding:14px 18px;border-radius:10px;border:1px solid var(--line);
  border-left:4px solid var(--muted);background:var(--surface-2)}
.doc blockquote p{margin:.35em 0}
.doc blockquote.c-warn{border-left-color:var(--warn);background:var(--warn-bg)}
.doc blockquote.c-crit{border-left-color:var(--crit);background:var(--crit-bg)}
.doc blockquote.c-ok{border-left-color:var(--ok);background:var(--ok-bg)}
.doc blockquote.c-tip{border-left-color:var(--info);background:var(--info-bg)}
.doc blockquote.c-note{border-left-color:var(--gold);background:var(--gold-bg)}

/* ---- Diagrams ---- */
.diagram-wrap{overflow-x:auto;margin:1.4em 0;padding:20px;background:var(--surface);
  border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);text-align:center}
.diagram-wrap pre.mermaid{margin:0;display:inline-block;min-width:min(100%,320px)}

/* Page breaks: subtle on screen */
div[style*="page-break"]{height:0;margin:0}

/* ---- Print ---- */
@media print{
  .toolbar,.sidebar,.edit-hint,.anchor{display:none!important}
  .layout{display:block}
  .content{padding:0}
  body{background:#fff;font-size:11pt}
  .doc{max-width:none}
  .doc h2{border-top:none}
  div[style*="page-break"]{height:auto;page-break-after:always}
  .diagram-wrap,.table-scroll{box-shadow:none;break-inside:avoid}
  .doc h2,.doc h3{break-after:avoid}
}

/* ---- Toast ---- */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);
  background:var(--charcoal);color:#faf8f4;padding:11px 20px;border-radius:10px;font-size:14px;
  font-weight:600;opacity:0;pointer-events:none;transition:.3s ease;z-index:100;box-shadow:var(--shadow)}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

@media (max-width:920px){
  .layout{grid-template-columns:1fr}
  .sidebar{display:none}
  .toolbar .brand span.full{display:none}
}
</style>

<div class="toolbar">
  <div class="brand"><img src="${logoURI}" alt="MathEra Tech"/><span class="full">IDD Portal</span></div>
  <span class="badge">Internal · Confidential</span>
  <span class="edit-hint badge" style="background:var(--gold-bg);color:var(--gold)">✎ Edit Mode — click any text to change it</span>
  <div class="spacer"></div>
  <button class="btn" id="editBtn" title="Toggle edit mode">✎ Edit</button>
  <button class="btn" id="dlBtn" title="Download this page as HTML with your edits">⇩ Download</button>
  <button class="btn" id="printBtn" title="Print or save as PDF">⎙ Print / PDF</button>
  <button class="btn" id="themeBtn" title="Toggle light/dark">◑ Theme</button>
</div>

<div class="layout">
  <aside class="sidebar" aria-label="Table of contents">
    <h4>Contents</h4>
    <nav id="toc">
${navHtml}
    </nav>
  </aside>
  <div class="content">
    <main class="doc" id="doc">
${body}
    </main>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
(function(){
  // Wrap tables for horizontal scroll
  document.querySelectorAll('.doc table').forEach(function(t){
    if(t.parentElement.classList.contains('table-scroll'))return;
    var w=document.createElement('div');w.className='table-scroll';
    t.parentNode.insertBefore(w,t);w.appendChild(t);
  });

  // Classify callouts by leading emoji
  var map=[['⚠️','c-warn'],['🔴','c-crit'],['✅','c-ok'],['💡','c-tip'],['📌','c-note'],
           ['💠','c-tip'],['🟡','c-note'],['🛡️','c-note']];
  document.querySelectorAll('.doc blockquote').forEach(function(b){
    var txt=b.textContent.trim();
    for(var i=0;i<map.length;i++){ if(txt.indexOf(map[i][0])===0 || txt.slice(0,3).indexOf(map[i][0])>-1){ b.classList.add(map[i][1]); return; } }
    if(/critical|no backup|risk/i.test(txt.slice(0,40))) b.classList.add('c-crit');
    else b.classList.add('c-note');
  });

  var toast=document.getElementById('toast');
  function say(m){toast.textContent=m;toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},2200);}

  // Edit mode
  var doc=document.getElementById('doc');
  var editBtn=document.getElementById('editBtn');
  var editing=false;
  editBtn.addEventListener('click',function(){
    editing=!editing;
    doc.contentEditable=editing?'true':'false';
    document.body.classList.toggle('editing',editing);
    editBtn.classList.toggle('active',editing);
    editBtn.textContent=editing?'✓ Done':'✎ Edit';
    say(editing?'Edit mode on — click any field to change it':'Edit mode off');
    if(editing) doc.focus();
  });

  // Theme toggle
  var themeBtn=document.getElementById('themeBtn');
  themeBtn.addEventListener('click',function(){
    var cur=document.documentElement.getAttribute('data-theme');
    var next = cur==='dark' ? 'light' : (cur==='light' ? 'dark' :
      (window.matchMedia('(prefers-color-scheme:dark)').matches?'light':'dark'));
    document.documentElement.setAttribute('data-theme',next);
    say('Theme: '+next);
  });

  // Print
  document.getElementById('printBtn').addEventListener('click',function(){window.print();});

  // Download current (edited) HTML
  document.getElementById('dlBtn').addEventListener('click',function(){
    var wasEditing=editing;
    if(wasEditing){doc.contentEditable='false';document.body.classList.remove('editing');}
    var clone=document.documentElement.outerHTML;
    var blob=new Blob(['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mathera Tech IDD v1.0</title></head><body>'
      + document.body.innerHTML + '</body></html>'],{type:'text/html'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download='Mathera-Tech-IDD-v1.0.html';a.click();URL.revokeObjectURL(a.href);
    if(wasEditing){doc.contentEditable='true';document.body.classList.add('editing');}
    say('Downloaded HTML with your edits');
  });

  // Active TOC highlight on scroll
  var links=Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var byId={};links.forEach(function(l){byId[l.dataset.target]=l;});
  var heads=Array.prototype.slice.call(document.querySelectorAll('.doc h2[id]'));
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        links.forEach(function(l){l.classList.remove('active');});
        var l=byId[e.target.id]; if(l){l.classList.add('active');
          l.scrollIntoView({block:'nearest'});}
      }
    });
  },{rootMargin:'-70px 0px -70% 0px',threshold:0});
  heads.forEach(function(h){obs.observe(h);});
})();
</script>`;

fs.writeFileSync(path.join(ROOT, 'Mathera-Tech-IDD.html'), html, 'utf8');
console.log('Wrote Mathera-Tech-IDD.html');
console.log('Sections in nav:', nav.length);
console.log('Size (KB):', Math.round(html.length/1024));
