// Build korenblit-resume.tex from resume.json + preamble.tex.
// Edit content in resume.json (and styling in preamble.tex), then run:
//   node build_tex.cjs && pdflatex korenblit-resume.tex
const fs = require("fs");

const data = JSON.parse(fs.readFileSync(`${__dirname}/resume.json`, "utf8"));
const preamble = fs.readFileSync(`${__dirname}/preamble.tex`, "utf8").trimEnd();

// ── text escaping ────────────────────────────────────────
// `backticks` -> \mono{}, → -> $\to$, and LaTeX specials escaped.
function escPlain(t) {
  return t
    .replace(/([&%#_])/g, "\\$1")
    .replace(/\$/g, "\\$")
    .replace(/→/g, "$\\to$");
}
function tex(s) {
  return s
    .split(/(`[^`]*`)/)
    .map((p) =>
      p.startsWith("`") && p.endsWith("`")
        ? `\\mono{${escPlain(p.slice(1, -1))}}`
        : escPlain(p),
    )
    .join("");
}
// "Jan 2026 - Present" -> "Jan 2026\,--\,Present" (thin-spaced en dash)
const dateRange = (d) => d.replace(/ - /g, "\\,--\\,");
// stack chip: thin-space multi-word items ("Python 3.13" -> "Python\,3.13")
const chip = (s) => escPlain(s).replace(/ /g, "\\,");

// ── header ───────────────────────────────────────────────
const contact = data.contact
  .map((c) => (c.href ? `\\href{${c.href}}{${tex(c.text)}}` : tex(c.text)))
  .join("%\n  \\sep\n  ");

let body = "";
body += `{\\fontsize{26}{30}\\selectfont ${tex(data.name)}}\\par\n`;
body += `\\vspace{6pt}\n{\\small\\color{accent}\\mono{%\n  ${contact}%\n}}\\par\n`;
body += `\\vspace{8pt}\n{\\color{accent}%\n  ${tex(data.summary)}%\n}\\par\n\n`;

// ── publications ─────────────────────────────────────────
if (data.publications && data.publications.length) {
  body += `\\section{Publications}\n\n`;
  data.publications.forEach((p, i) => {
    if (i > 0) body += `\\vspace{4pt}\n\n`;
    body += `\\textbf{${tex(p.title)}}%\n\\hfill\\daterange{${p.year}}\\\\\n`;
    let meta = `\\textit{${tex(p.venue)}}\\sep ${tex(p.status)}`;
    if (p.links) {
      const linkStr = p.links
        .map((l) => `{\\small\\color{accent}\\mono{\\href{${l.href}}{${escPlain(l.text)}}}}`)
        .join("\\enspace ");
      meta += `\\hfill ${linkStr}`;
    }
    body += `${meta}\n`;
    body += `\\begin{itemize}\n`;
    p.bullets.forEach((b) => (body += `  \\item ${tex(b)}\n`));
    body += `\\end{itemize}\n\n`;
  });
}

// ── experience ───────────────────────────────────────────
body += `\\section{Experience}\n\n`;
data.experience.forEach((e, i) => {
  if (i > 0) body += `\\vspace{4pt}\n\n`;
  if (e.roles) {
    body += `\\textbf{${tex(e.org)}}%\n\\hfill\\daterange{${dateRange(e.dates)}}\\\\\n`;
    body += e.roles
      .map((r) => `\\textit{${tex(r.title)}}\\,{\\small\\mono{(${tex(r.when)})}}`)
      .join("%\n\\sep\n") + "\n";
  } else {
    body += `\\textbf{${tex(e.org)}}\\sep ${tex(e.role)}%\n\\hfill\\daterange{${dateRange(e.dates)}}\n`;
  }
  if ((e.bullets && e.bullets.length) || e.stack) {
    body += `\\begin{itemize}\n`;
    (e.bullets || []).forEach((b) => (body += `  \\item ${tex(b)}\n`));
    if (e.stack) {
      body += `  \\item {\\small\\color{accent}\\mono{%\n        ${e.stack.map(chip).join("\\sep ")}}}\n`;
    }
    body += `\\end{itemize}\n\n`;
  } else {
    body += `\n`;
  }
});

// ── education ────────────────────────────────────────────
body += `\\section{Education}\n\n`;
data.education.forEach((ed, i) => {
  if (i > 0) body += `\\vspace{2pt}\n`;
  body += `\\textbf{${tex(ed.degree)}}\\sep\n${tex(ed.school)}%\n\\hfill\\daterange{${dateRange(ed.dates)}}\\par\n`;
  if (ed.note) body += `{\\small\\color{accent}${tex(ed.note)}}\\par\n`;
});
body += `\n`;

// ── skills ───────────────────────────────────────────────
body += `\\section{Skills}\n\n`;
data.skills.forEach((s, i) => {
  const sep = i < data.skills.length - 1 ? "\\\\[2pt]" : "";
  const val = s.mono ? `\\mono{${escPlain(s.value)}}` : tex(s.value);
  body += `{\\color{accent}${tex(s.label)}\\,:}\\enspace\n${val}${sep}\n`;
});

const out = `${preamble}\n\n% ═════════════════════════════════════════════════════════\n\\begin{document}\n\n${body}\n\\end{document}\n`;
fs.writeFileSync(`${__dirname}/korenblit-resume.tex`, out);
console.log("✓ korenblit-resume.tex written from resume.json");
