// Watch resume.json and recompile the PDF on every save.
// Usage: node watch_resume.cjs
// Pipeline per change: build_tex.cjs -> pdflatex (x2 for refs).
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const dir = __dirname;
const src = path.join(dir, "resume.json");

function build() {
  const t = new Date().toLocaleTimeString();
  try {
    execFileSync("node", ["build_tex.cjs"], { cwd: dir, stdio: "pipe" });
    for (let i = 0; i < 2; i++) {
      execFileSync("pdflatex", ["-interaction=nonstopmode", "korenblit-resume.tex"], {
        cwd: dir,
        stdio: "pipe",
      });
    }
    console.log(`[${t}] ok -> korenblit-resume.pdf`);
  } catch (e) {
    console.error(`[${t}] BUILD FAILED`);
    const out = (e.stdout || e.stderr || Buffer.from("")).toString();
    // print last lines of latex/json error
    console.error(out.split("\n").slice(-15).join("\n"));
  }
}

let timer = null;
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(build, 150); // debounce editor multi-write
}

build(); // initial
fs.watch(src, schedule);
console.log(`watching ${path.basename(src)} ... (Ctrl+C to stop)`);
