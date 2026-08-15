#!/usr/bin/env python3
"""Build the BID Trust strategy dossier as a single self-contained HTML page.

Reads docs/*.md plus models/OUTPUT.md and emits design/strategy-dossier.html.

    pip install markdown
    python3 design/build-dossier.py

The HTML is generated - edit the markdown in docs/, not the output file.
"""
import os, re, glob, html
import markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "design", "strategy-dossier.html")
REPO = "https://github.com/kishore9490/Kishore-Mohankumar/blob/claude/bid-trust-strategy-ah940a"

md = markdown.Markdown(extensions=["tables", "fenced_code", "sane_lists", "attr_list"])

files = sorted(glob.glob(os.path.join(ROOT, "docs", "*.md")))

def rewrite_links(text):
    # cross-doc .md links -> in-page anchors
    text = re.sub(r'\]\((?:\.\./docs/)?(\d\d)-[a-z0-9-]+\.md(?:#[^)]*)?\)', r'](#s\1)', text)
    # repo file links -> github
    text = re.sub(r'\]\(\.\./(design/[^)]+|models/[^)]*)\)', r'](%s/\1)' % REPO, text)
    text = re.sub(r'\]\((design/[^)]+|models/[^)]*)\)', r'](%s/\1)' % REPO, text)
    return text

def slug(s):
    s = re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
    return s

sections = []
for path in files:
    raw = open(path).read()
    m = re.match(r'#\s*(\d\d)\s*·\s*(.+?)\n', raw)
    num, title = m.group(1), m.group(2).strip()
    body_md = rewrite_links(raw[m.end():].strip())
    md.reset()
    body = md.convert(body_md)
    sections.append({"num": num, "title": title, "body": body, "id": "s" + num})

# appendix: generated model output
raw = open(os.path.join(ROOT, "models", "OUTPUT.md")).read()
raw = re.sub(r'^#\s.*\n', '', raw, count=1)
raw = rewrite_links(raw)
md.reset()
sections.append({"num": "A", "title": "Appendix — Generated Model Output",
                 "body": md.convert(raw.strip()), "id": "sA"})

def enhance(bodyhtml):
    # wrap tables for horizontal scroll
    bodyhtml = bodyhtml.replace("<table>", '<div class="scroll"><table>').replace("</table>", "</table></div>")
    # classify blockquotes by their content
    def bq(m):
        inner = m.group(1)
        plain = re.sub(r'<[^>]+>', '', inner)
        if "⚠" in plain:
            cls = "warn"
        elif "⚖" in plain:
            cls = "counsel"
        elif len(plain.strip()) < 260:
            cls = "thesis"
        else:
            cls = "note"
        return '<blockquote class="%s">%s</blockquote>' % (cls, inner)
    bodyhtml = re.sub(r'<blockquote>(.*?)</blockquote>', bq, bodyhtml, flags=re.S)
    # heading anchors
    def hx(m):
        lvl, txt = m.group(1), m.group(2)
        plain = re.sub(r'<[^>]+>', '', txt)
        return '<h%s id="%s">%s</h%s>' % (lvl, slug(plain)[:60], txt, lvl)
    bodyhtml = re.sub(r'<h([234])>(.*?)</h\1>', hx, bodyhtml, flags=re.S)
    return bodyhtml

nav = "\n".join(
    '<li><a href="#%s"><span class="n">%s</span><span class="t">%s</span></a></li>'
    % (s["id"], s["num"], html.escape(s["title"]))
    for s in sections)

body_parts = []
for s in sections:
    body_parts.append(
        '<section id="%s">\n<header class="sec-head">'
        '<p class="eyebrow">Section %s</p><h2>%s</h2></header>\n%s\n</section>'
        % (s["id"], s["num"], html.escape(s["title"]), enhance(s["body"])))

CSS = r"""
:root{
  color-scheme: light dark;
  --ground:#FBFCFD;
  --surface:#F1F5F9;
  --surface-2:#E8EEF5;
  --ink:#0B1F3A;
  --ink-2:#455A72;
  --ink-3:#78899E;
  --rule:#D9E2EC;
  --rule-soft:#E9EFF5;
  --verify:#0E7A34;
  --verify-bg:#EDF8F1;
  --caution:#8A5A05;
  --caution-bg:#FDF6E8;
  --adverse:#B32D33;
  --adverse-bg:#FCEFEF;
  --counsel:#4A3D8F;
  --counsel-bg:#F1EFFA;

  --serif:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,"Times New Roman",serif;
  --sans:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;

  --rail:288px;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --ground:#071528;
    --surface:#0E2440;
    --surface-2:#143054;
    --ink:#EDF3F9;
    --ink-2:#A9BCD1;
    --ink-3:#71879F;
    --rule:#1D3A5E;
    --rule-soft:#152C4A;
    --verify:#48D183;
    --verify-bg:rgba(29,185,84,.10);
    --caution:#F0AE43;
    --caution-bg:rgba(245,166,35,.10);
    --adverse:#FF7A7F;
    --adverse-bg:rgba(229,72,77,.10);
    --counsel:#A99CF0;
    --counsel-bg:rgba(120,105,220,.12);
  }
}
:root[data-theme="dark"]{
  --ground:#071528;
  --surface:#0E2440;
  --surface-2:#143054;
  --ink:#EDF3F9;
  --ink-2:#A9BCD1;
  --ink-3:#71879F;
  --rule:#1D3A5E;
  --rule-soft:#152C4A;
  --verify:#48D183;
  --verify-bg:rgba(29,185,84,.10);
  --caution:#F0AE43;
  --caution-bg:rgba(245,166,35,.10);
  --adverse:#FF7A7F;
  --adverse-bg:rgba(229,72,77,.10);
  --counsel:#A99CF0;
  --counsel-bg:rgba(120,105,220,.12);
}

*{box-sizing:border-box}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){ html{scroll-behavior:auto} *{transition:none!important;animation:none!important} }

body{
  margin:0; background:var(--ground); color:var(--ink);
  font-family:var(--serif); font-size:17.5px; line-height:1.68;
  -webkit-font-smoothing:antialiased;
}

/* ---------- masthead ---------- */
.masthead{
  border-bottom:1px solid var(--rule);
  padding:52px 32px 40px; background:var(--surface);
}
.mast-inner{max-width:1180px;margin:0 auto;display:flex;flex-wrap:wrap;gap:36px;align-items:flex-end;justify-content:space-between}
.brand{display:flex;align-items:center;gap:11px;margin-bottom:22px}
.mark{width:26px;height:26px;border-radius:7px;background:var(--verify);display:grid;place-items:center;flex:none}
.mark svg{width:14px;height:14px;display:block}
.wordmark{font-family:var(--sans);font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
.wordmark span{color:var(--ink-3);font-weight:500}
.masthead h1{
  font-family:var(--serif); font-size:clamp(34px,5.2vw,54px); line-height:1.08;
  font-weight:600; letter-spacing:-.02em; margin:0; text-wrap:balance; max-width:16ch;
}
.tagline{
  font-family:var(--sans); font-size:13px; letter-spacing:.13em; text-transform:uppercase;
  color:var(--verify); margin:18px 0 0; font-weight:600;
}
.mast-meta{font-family:var(--sans);font-size:12.5px;color:var(--ink-2);line-height:2;font-variant-numeric:tabular-nums;min-width:230px}
.mast-meta b{color:var(--ink);font-weight:600}
.mast-meta div{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid var(--rule-soft);padding:5px 0}

/* ---------- shell ---------- */
.shell{max-width:1180px;margin:0 auto;padding:0 32px;display:flex;gap:56px;align-items:flex-start}

/* ---------- contents rail ---------- */
.toc{
  width:var(--rail); flex:none; position:sticky; top:0; max-height:100vh;
  overflow-y:auto; padding:40px 0 60px; font-family:var(--sans);
}
.toc h2{
  font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-3);
  margin:0 0 14px; font-weight:700;
}
.toc ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.toc a{
  display:flex;gap:12px;align-items:baseline;text-decoration:none;color:var(--ink-2);
  font-size:13px;line-height:1.4;padding:7px 10px 7px 9px;border-left:2px solid transparent;
  border-radius:0 5px 5px 0; transition:background .12s,color .12s,border-color .12s;
}
.toc a:hover{background:var(--surface);color:var(--ink)}
.toc a.active{border-left-color:var(--verify);color:var(--ink);background:var(--surface);font-weight:600}
.toc .n{font-family:var(--mono);font-size:10.5px;color:var(--ink-3);flex:none;width:18px;font-variant-numeric:tabular-nums}
.toc a.active .n{color:var(--verify)}
.toc-toggle{display:none}

/* ---------- main ---------- */
main{flex:1;min-width:0;padding:40px 0 120px;max-width:74ch}
.lede{
  font-size:20px;line-height:1.62;color:var(--ink-2);border-bottom:1px solid var(--rule);
  padding-bottom:32px;margin:0 0 8px;
}
.lede strong{color:var(--ink);font-weight:600}

section{padding-top:64px;scroll-margin-top:24px}
.sec-head{border-bottom:2px solid var(--ink);padding-bottom:14px;margin-bottom:30px}
.eyebrow{
  font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--ink-3);margin:0 0 8px;font-variant-numeric:tabular-nums;
}
.sec-head h2{
  font-size:clamp(25px,3.4vw,33px);line-height:1.16;font-weight:600;letter-spacing:-.015em;
  margin:0;text-wrap:balance;
}

h3{font-size:22px;line-height:1.3;font-weight:600;letter-spacing:-.01em;margin:46px 0 14px;text-wrap:balance}
h4{
  font-family:var(--sans);font-size:13px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  color:var(--ink-2);margin:36px 0 12px;
}
p{margin:0 0 18px}
a{color:var(--ink);text-decoration:underline;text-decoration-color:var(--rule);text-underline-offset:3px}
a:hover{text-decoration-color:var(--verify)}
strong{font-weight:600}
hr{border:0;border-top:1px solid var(--rule);margin:44px 0}
ul,ol{margin:0 0 18px;padding-left:1.3em}
li{margin-bottom:8px}
li::marker{color:var(--ink-3)}

/* ---------- data & code ---------- */
code{
  font-family:var(--mono);font-size:.845em;background:var(--surface-2);
  padding:.14em .4em;border-radius:4px;
}
pre{
  font-family:var(--mono);background:var(--surface);border:1px solid var(--rule);
  border-radius:9px;padding:20px 22px;overflow-x:auto;font-size:12.6px;line-height:1.62;
  margin:0 0 24px;color:var(--ink-2);
}
pre code{background:none;padding:0;font-size:inherit;color:inherit}

.scroll{overflow-x:auto;margin:0 0 26px;border:1px solid var(--rule);border-radius:9px}
table{border-collapse:collapse;width:100%;font-family:var(--sans);font-size:13.2px;line-height:1.5}
th,td{text-align:left;padding:11px 15px;border-bottom:1px solid var(--rule-soft);vertical-align:top}
th{
  background:var(--surface);font-weight:700;font-size:11px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-2);white-space:nowrap;
}
td{font-variant-numeric:tabular-nums;color:var(--ink-2)}
td strong{color:var(--ink)}
tr:last-child td{border-bottom:0}
tbody tr:hover td{background:var(--surface)}

/* ---------- callouts: the product's own semantic states ---------- */
blockquote{margin:0 0 26px;padding:18px 22px;border-left:3px solid;border-radius:0 9px 9px 0}
blockquote p{margin:0 0 12px}
blockquote p:last-child{margin:0}
blockquote.thesis{
  border-color:var(--verify);background:var(--verify-bg);font-size:19.5px;line-height:1.5;
  font-weight:600;color:var(--ink);letter-spacing:-.008em;
}
blockquote.note{border-color:var(--rule);background:var(--surface);color:var(--ink-2);font-size:16.5px}
blockquote.warn{border-color:var(--caution);background:var(--caution-bg);font-size:16.5px}
blockquote.warn strong,blockquote.warn h3{color:var(--caution)}
blockquote.counsel{border-color:var(--counsel);background:var(--counsel-bg);font-size:16.5px}
blockquote.counsel strong{color:var(--counsel)}
blockquote h3{font-size:16px;margin:0 0 10px;font-family:var(--sans);letter-spacing:0}

/* ---------- footer ---------- */
footer{
  border-top:1px solid var(--rule);background:var(--surface);
  padding:44px 32px 60px;font-family:var(--sans);font-size:13px;color:var(--ink-2);
}
.foot-inner{max-width:1180px;margin:0 auto;display:flex;flex-wrap:wrap;gap:32px;justify-content:space-between}
.foot-inner p{margin:0 0 8px;max-width:56ch;line-height:1.7}
footer b{color:var(--ink)}

:focus-visible{outline:2px solid var(--verify);outline-offset:2px;border-radius:3px}

/* ---------- responsive ---------- */
@media (max-width:1000px){
  .shell{display:block;padding:0 24px}
  main{max-width:none;padding-top:20px}
  .toc{
    position:static;width:auto;max-height:none;padding:20px 0 0;
    border-bottom:1px solid var(--rule);
  }
  .toc-toggle{
    display:flex;align-items:center;justify-content:space-between;width:100%;
    background:var(--surface);border:1px solid var(--rule);border-radius:9px;
    padding:13px 16px;font-family:var(--sans);font-size:13px;font-weight:700;
    color:var(--ink);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;
  }
  .toc-toggle .chev{transition:transform .16s}
  .toc[data-open="true"] .chev{transform:rotate(180deg)}
  .toc ol{display:none;padding:12px 0 20px}
  .toc[data-open="true"] ol{display:flex}
  .toc h2{display:none}
  .masthead{padding:40px 24px 32px}
  footer{padding:36px 24px 48px}
}
@media (max-width:620px){
  body{font-size:16.5px}
  .lede{font-size:18px}
  section{padding-top:48px}
}
"""

JS = r"""
(function(){
  var toc=document.querySelector('.toc');
  var btn=document.querySelector('.toc-toggle');
  if(btn){btn.addEventListener('click',function(){
    var open=toc.getAttribute('data-open')==='true';
    toc.setAttribute('data-open',open?'false':'true');
    btn.setAttribute('aria-expanded',open?'false':'true');
  });}
  var links={};
  document.querySelectorAll('.toc a').forEach(function(a){links[a.getAttribute('href').slice(1)]=a;});
  var seen=[];
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var id=e.target.id;
      if(e.isIntersecting){ if(seen.indexOf(id)<0) seen.push(id); }
      else { var i=seen.indexOf(id); if(i>=0) seen.splice(i,1); }
    });
    if(!seen.length) return;
    var order=Object.keys(links);
    seen.sort(function(a,b){return order.indexOf(a)-order.indexOf(b);});
    Object.keys(links).forEach(function(k){links[k].classList.remove('active');});
    if(links[seen[0]]) links[seen[0]].classList.add('active');
  },{rootMargin:'-10% 0px -70% 0px'});
  document.querySelectorAll('main section').forEach(function(s){io.observe(s);});
  document.querySelectorAll('.toc a').forEach(function(a){
    a.addEventListener('click',function(){
      if(window.matchMedia('(max-width:1000px)').matches){
        toc.setAttribute('data-open','false');
        if(btn) btn.setAttribute('aria-expanded','false');
      }
    });
  });
})();
"""

TICK = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7.3 5.4 10.4 12 3.6" stroke="#06220F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

page = f"""<title>BID Trust Strategy</title>
<style>{CSS}</style>

<div class="masthead">
  <div class="mast-inner">
    <div>
      <div class="brand">
        <span class="mark">{TICK}</span>
        <span class="wordmark">BID <span>TRUST</span></span>
      </div>
      <h1>Business Identity &amp; Due Diligence</h1>
      <p class="tagline">Trust, backed by verification.</p>
    </div>
    <div class="mast-meta">
      <div><span>Document</span><b>Strategy &amp; architecture</b></div>
      <div><span>Sections</span><b>19 + appendix</b></div>
      <div><span>Status</span><b>Pre-build</b></div>
      <div><span>Date</span><b>15 Aug 2026</b></div>
    </div>
  </div>
</div>

<div class="shell">
  <nav class="toc" data-open="false" aria-label="Contents">
    <button class="toc-toggle" aria-expanded="false">Contents <span class="chev">▾</span></button>
    <h2>Contents</h2>
    <ol>{nav}</ol>
  </nav>

  <main>
    <p class="lede">An industry-agnostic enterprise trust, verification and due-diligence
    infrastructure platform. This is the complete strategy, product architecture, business
    model and go-to-market plan — <strong>the platform stays horizontal; industry
    differences live in configurable verification policies, never in separate products.</strong></p>

    {"".join(body_parts)}
  </main>
</div>

<footer>
  <div class="foot-inner">
    <div>
      <p><b>Nothing here is legal, financial or regulatory advice.</b> Every price is a starting
      price for modelling, not a market price. Every provider cost is a placeholder pending
      quotation. Items marked ⚖ require qualified counsel before launch.</p>
      <p>Source, financial model and design files:
      <a href="{REPO.replace('/blob/', '/tree/')}">github.com/kishore9490/Kishore-Mohankumar</a></p>
    </div>
    <div>
      <p><b>The four things to validate first</b><br>
      Provider quotations including reuse rights · Legal opinion on data-source access ·
      Three paid pilots measuring vendor completion · Thirty buyers asked whether they would
      accept another buyer's verification.</p>
    </div>
  </div>
</footer>

<script>{JS}</script>
"""

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w").write(page)
print("wrote", OUT, len(page), "bytes,", len(sections), "sections")
