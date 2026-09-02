// Build korenblit-resume.tex from resume.json + preamble.tex.
// Minimal academic style (no summary, no color). Edit content in
// resume.json (and styling in preamble.tex), then run:
//   node build_tex.cjs && pdflatex korenblit-resume.tex
const fs = require("fs");

const data = JSON.parse(fs.readFileSync(`${__dirname}/resume.json`, "utf8"));
const preamble = fs.readFileSync(`${__dirname}/preamble.tex`, "utf8").trimEnd();

// ── text escaping ────────────────────────────────────────
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
// "Jan 2026 - Present" -> "Jan 2026\,--\,Present"
const dateRange = (d) => d.replace(/ - /g, "\\,--\\,");

// ── header (name + contact, no summary) ──────────────────
const contact = data.contact
  .map((c) => (c.href ? `\\href{${c.href}}{${tex(c.text)}}` : tex(c.text)))
  .join("\\sep ");

let body = "";
body += contact
  ? `\\headerblock{${tex(data.name)}}{${contact}}\n\n`
  : `\\headeronly{${tex(data.name)}}\n\n`;

// ── education ────────────────────────────────────────────
body += `\\section{Education}\n`;
data.education.forEach((ed, i) => {
  if (i > 0) body += `\\vspace{8pt}\n\n`;
  body += `\\textbf{${tex(ed.school)}}\\hfill\\daterange{${dateRange(ed.dates)}}\\\\\n`;
  body += `${tex(ed.degree)}`;
  if (ed.note) body += ` ({\\small ${tex(ed.note)}})`;
  body += `\\par\n`;
});
body += `\n`;

// ── publications ─────────────────────────────────────────
if (data.publications && data.publications.length) {
  body += `\\section{Publications}\n`;
  data.publications.forEach((p, i) => {
    if (i > 0) body += `\\vspace{9pt}\n\n`;
    body += `\\textbf{${tex(p.title)}}\\hfill\\daterange{${p.year}}\\\\\n`;
    if (p.authors) body += `{\\small ${tex(p.authors)}}\\\\\n`;
    let meta = `\\textit{${tex(p.venue)}}`;
    if (p.status) meta += `. ${tex(p.status)}`;
    if (p.links) {
      const linkStr = p.links
        .map((l) => `{\\small \\href{${l.href}}{${escPlain(l.text)}}}`)
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
body += `\\section{Experience}\n`;
data.experience.forEach((e, i) => {
  if (i > 0) body += `\\vspace{8pt}\n\n`;
  if (e.roles) {
    body += `\\textbf{${tex(e.org)}}\\hfill\\daterange{${dateRange(e.dates)}}\\\\\n`;
    body += e.roles
      .map((r) => `\\textit{${tex(r.title)}} ({\\small ${tex(r.when)}})`)
      .join("\\sep ") + "\n";
  } else {
    const roleStr = e.role ? `\\sep \\textit{${tex(e.role)}}` : "";
    body += `\\textbf{${tex(e.org)}}${roleStr}\\hfill\\daterange{${dateRange(e.dates)}}\n`;
  }
  body += `\\begin{itemize}\n`;
  (e.bullets || []).forEach((b) => (body += `  \\item ${tex(b)}\n`));
  body += `\\end{itemize}\n\n`;
});

const out = `${preamble}\n\n% ═════════════════════════════════════════════════════════\n\\begin{document}\n\n${body}\n\\end{document}\n`;
fs.writeFileSync(`${__dirname}/korenblit-resume.tex`, out);
console.log("✓ korenblit-resume.tex written from resume.json");
