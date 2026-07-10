// Build cv.html from resume.json: a draggable layout sandbox.
// Drag sections, entries, and bullets to reorder. Click "Copy layout"
// to get the arrangement, then hand it back to polish into the PDF.
//   node build_html.cjs   ->   open cv.html
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(`${__dirname}/resume.json`, "utf8"));

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function bullets(arr, extra) {
  const items = (arr || []).map((b) => `<li draggable="true">${esc(b)}</li>`);
  if (extra) items.push(`<li draggable="true">${esc(extra)}</li>`);
  return items.length ? `<ul class="bullets" data-sortable>${items.join("")}</ul>` : "";
}

// ── entry renderers ──────────────────────────────────────
function eduEntry(ed) {
  return `<div class="entry" draggable="true" data-key="${esc(ed.school)}">
    <div class="head"><span class="l"><b>${esc(ed.school)}</b></span><span class="r">${esc(ed.dates)}</span></div>
    <div class="sub">${esc(ed.degree)}</div></div>`;
}
function pubEntry(p) {
  return `<div class="entry" draggable="true" data-key="${esc(p.title)}">
    <div class="head"><span class="l"><b>${esc(p.title)}</b></span><span class="r">${esc(p.year)}</span></div>
    <div class="sub"><i>${esc(p.venue)}</i>. ${esc(p.status)}</div>
    ${bullets(p.bullets)}</div>`;
}
function expEntry(e) {
  const stackLine = e.stack ? `Stack: ${e.stack.join(", ")}` : null;
  const roleLine = e.roles
    ? e.roles.map((r) => `<i>${esc(r.title)}</i> (${esc(r.when)})`).join(" | ")
    : `<i>${esc(e.role)}</i>`;
  const headLeft = e.roles || !e.role ? `<b>${esc(e.org)}</b>` : `<b>${esc(e.org)}</b> | ${roleLine}`;
  const sub = e.roles ? `<div class="sub">${roleLine}</div>` : "";
  return `<div class="entry" draggable="true" data-key="${esc(e.org)}">
    <div class="head"><span class="l">${headLeft}</span><span class="r">${esc(e.dates)}</span></div>
    ${sub}${bullets(e.bullets, stackLine)}</div>`;
}

// ── sections (draggable as a group too) ──────────────────
const sections = [
  { label: "Education", html: data.education.map(eduEntry).join("") },
  { label: "Publications", html: (data.publications || []).map(pubEntry).join("") },
  { label: "Experience", html: data.experience.map(expEntry).join("") },
];

const secHtml = sections
  .map(
    (s) => `<section class="sec" draggable="true" data-key="${s.label}">
    <div class="lbl">${s.label}</div>
    <div class="entries" data-sortable>${s.html}</div>
  </section>`,
  )
  .join("\n");

const page = `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(data.name)} — layout</title>
<style>
  :root{ --ink:#111; }
  *{ box-sizing:border-box; }
  body{ font-family: "Charter","Georgia",serif; color:var(--ink); background:#f4f3f0; margin:0; padding:24px; }
  .bar{ max-width:8.5in; margin:0 auto 14px; display:flex; gap:10px; align-items:center; font-family:system-ui,sans-serif; font-size:13px; color:#555; }
  .bar button{ font:inherit; padding:6px 12px; border:1px solid #bbb; background:#fff; border-radius:6px; cursor:pointer; }
  .bar button:hover{ background:#eee; }
  #cv{ max-width:8.5in; margin:0 auto; background:#fff; padding:0.5in 0.65in 0.5in 1.75in; box-shadow:0 1px 6px rgba(0,0,0,.12); position:relative; }
  header .name{ font-size:22px; font-weight:700; }
  header hr{ border:none; border-top:0.5px solid #000; margin:5px 0 8px; }
  .sec{ display:block; position:relative; padding:7px 0; }
  .lbl{ position:absolute; left:-1.1in; width:0.85in; top:11px; font-variant:small-caps; font-size:12px; letter-spacing:.02em; }
  .entry{ padding:4px 6px; margin:0 -6px; border-radius:5px; }
  .head{ display:flex; justify-content:space-between; gap:12px; }
  .head .r{ font-size:12px; white-space:nowrap; }
  .sub{ font-size:14px; }
  .bullets{ margin:3px 0 0; padding-left:16px; }
  .bullets li{ font-size:14px; margin:2px 0; list-style:"– "; padding-left:2px; }
  /* drag affordances */
  [draggable="true"]{ cursor:grab; }
  .entry:hover,.sec:hover>.lbl{ background:#f2f6ff; }
  .bullets li:hover{ background:#f2f6ff; }
  .dragging{ opacity:.4; }
  .over{ outline:2px dashed #6a8ec8; outline-offset:2px; }
  #out{ max-width:8.5in; margin:14px auto 0; font-family:ui-monospace,monospace; font-size:12px; white-space:pre-wrap; background:#fff; border:1px solid #ddd; border-radius:6px; padding:10px; display:none; }
</style></head>
<body>
  <div class="bar">
    <button id="copy">Copy layout</button>
    <span>Drag any section, entry, or bullet to reorder. Then Copy layout and paste it back to me.</span>
  </div>
  <div id="cv">
    <header><div class="name">${esc(data.name)}</div><hr></header>
    <div class="sections" data-sortable>
${secHtml}
    </div>
  </div>
  <pre id="out"></pre>
<script>
  // generic reorder within each [data-sortable] over its direct [draggable] children
  let dragged=null;
  document.querySelectorAll('[data-sortable]').forEach(function(box){
    box.addEventListener('dragover', function(e){
      if(!dragged) return;
      if(![...box.children].includes(dragged)) return; // only reorder within same list
      e.preventDefault();
      const after=getAfter(box,e.clientY);
      if(after==null) box.appendChild(dragged); else box.insertBefore(dragged,after);
    });
  });
  document.addEventListener('dragstart', function(e){
    const t=e.target.closest('[draggable="true"]'); if(!t) return;
    dragged=t; t.classList.add('dragging'); e.stopPropagation();
  });
  document.addEventListener('dragend', function(e){
    if(dragged) dragged.classList.remove('dragging'); dragged=null;
  });
  function getAfter(box,y){
    const els=[...box.children].filter(c=>c!==dragged && c.getAttribute('draggable')==='true');
    let best=null,bestOff=-Infinity;
    for(const el of els){
      const r=el.getBoundingClientRect(); const off=y-(r.top+r.height/2);
      if(off<0 && off>bestOff){ bestOff=off; best=el; }
    }
    return best;
  }
  // export current arrangement
  document.getElementById('copy').addEventListener('click', function(){
    const out={sections:[]};
    document.querySelectorAll('.sections > .sec').forEach(function(sec){
      const s={section:sec.dataset.key, entries:[]};
      sec.querySelectorAll('.entries > .entry').forEach(function(en){
        const bl=[...en.querySelectorAll('.bullets > li')].map(li=>li.textContent.trim().slice(0,60));
        s.entries.push({entry:en.dataset.key, bullets:bl});
      });
      out.sections.push(s);
    });
    const txt=JSON.stringify(out,null,2);
    const pre=document.getElementById('out'); pre.style.display='block'; pre.textContent=txt;
    navigator.clipboard&&navigator.clipboard.writeText(txt);
  });
</script>
</body></html>`;

fs.writeFileSync(`${__dirname}/cv.html`, page);
console.log("✓ cv.html written from resume.json");
