const fs = require("fs");
const PDFDocument = require("pdfkit");

// ============================================================
// DESIGN — identical to build_resume.cjs
// ============================================================

const INK = "#2D2D2B";
const STONE = "#55524E";
const MIST = "#8A8785";
const CLOUD = "#D5D2CC";
const ACCENT = "#3D5167";

const FONT_REG = "/System/Library/Fonts/Supplemental/Georgia.ttf";
const FONT_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf";

const PAGE_W = 612;
const MARGIN = { top: 50, bottom: 42, left: 52, right: 52 };
const CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right;
const LEFT_W = 322;
const COL_GAP = 18;
const RIGHT_X = MARGIN.left + LEFT_W + COL_GAP;
const RIGHT_W = CONTENT_W - LEFT_W - COL_GAP;

// ============================================================
// HELPERS — all return the new Y position after drawing
// ============================================================

let doc; // set in main()

function textHeight(text, font, size, width) {
  doc.font(font).fontSize(size);
  return doc.heightOfString(text, { width });
}

function drawSection(label, x, y, w) {
  const tracked = label.toUpperCase();
  doc.font(FONT_BOLD).fontSize(9.5).fillColor(STONE);
  doc.text(tracked, x, y, { width: w, characterSpacing: 3 });
  const h = doc.heightOfString(tracked, { width: w, characterSpacing: 3 });
  const lineY = y + h + 2;
  doc.save().strokeColor(CLOUD).lineWidth(0.4)
    .moveTo(x, lineY).lineTo(x + w, lineY).stroke().restore();
  return lineY + 5;
}

function drawRole(title, company, date, bullets, x, y, w) {
  // Title
  doc.font(FONT_BOLD).fontSize(10.5).fillColor(INK);
  doc.text(title, x, y, { width: w });
  y += doc.heightOfString(title, { width: w }) + 1;

  // Meta line
  doc.font(FONT_REG).fontSize(9);
  const metaText = company + "  |  " + date;
  doc.fillColor(STONE).text(metaText, x, y, { width: w });
  y += doc.heightOfString(metaText, { width: w }) + 3;

  // Bullets
  const bulletIndent = 11;
  for (const b of bullets) {
    const fullText = "\u2022  " + b;
    doc.font(FONT_REG).fontSize(9).fillColor(STONE);
    doc.text(fullText, x, y, { width: w, indent: 0 });
    y += doc.heightOfString(fullText, { width: w }) + 2;
  }

  return y + 2;
}

function drawSidebarLabel(text, x, y, w) {
  const tracked = text.toUpperCase();
  doc.font(FONT_BOLD).fontSize(8.5).fillColor(STONE);
  doc.text(tracked, x, y, { width: w, characterSpacing: 2.5 });
  return y + doc.heightOfString(tracked, { width: w, characterSpacing: 2.5 }) + 2;
}

function drawSidebarItem(text, x, y, w) {
  doc.font(FONT_REG).fontSize(8.5).fillColor(STONE);
  doc.text(text, x, y, { width: w });
  return y + doc.heightOfString(text, { width: w }) + 1;
}

// ============================================================
// MAIN
// ============================================================

function main() {
  doc = new PDFDocument({
    size: "LETTER",
    margins: MARGIN,
    info: {
      Title: "Tom\u00e1s Pablo Korenblit - Resume",
      Author: "Tom\u00e1s Pablo Korenblit",
    },
  });

  const OUTPUT = process.argv[2] || "./Korenblit_Resume_2026.pdf";
  doc.pipe(fs.createWriteStream(OUTPUT));

  doc.registerFont("Georgia", FONT_REG);
  doc.registerFont("Georgia-Bold", FONT_BOLD);

  let y = MARGIN.top;

  // ── NAME ──
  doc.font(FONT_BOLD).fontSize(22).fillColor(INK);
  doc.text("Tom\u00e1s Pablo Korenblit", MARGIN.left, y, { width: CONTENT_W });
  y += doc.heightOfString("Tom\u00e1s Pablo Korenblit", { width: CONTENT_W }) + 4;

  // ── SUBTITLE ──
  doc.font(FONT_REG).fontSize(10.5).fillColor(ACCENT);
  doc.text("Bayesian Data Scientist & Engineer", MARGIN.left, y, { width: CONTENT_W });
  y += doc.heightOfString("Bayesian Data Scientist & Engineer", { width: CONTENT_W }) + 6;

  // ── SUMMARY ──
  const summary = "Data scientist specializing in Bayesian inference, hierarchical modeling, and causal reasoning. Builds end-to-end systems from statistical models to production data pipelines in Python, SQL, and GCP.";
  doc.font(FONT_REG).fontSize(9).fillColor(STONE);
  doc.text(summary, MARGIN.left, y, { width: CONTENT_W });
  y += doc.heightOfString(summary, { width: CONTENT_W }) + 8;

  // ── CONTACT ──
  doc.font(FONT_REG).fontSize(8.5);
  const contactPlain = "Buenos Aires, Argentina | tomaskorenblit@gmail.com | +54 11 2156 1770 | GitHub | LinkedIn | ORCID";
  const contactH = doc.heightOfString(contactPlain, { width: CONTENT_W });
  doc.fillColor(MIST).text("Buenos Aires, Argentina", MARGIN.left, y, { width: CONTENT_W, continued: true });
  doc.fillColor(CLOUD).text(" | ", { continued: true });
  doc.fillColor(STONE).text("tomaskorenblit@gmail.com", { link: "mailto:tomaskorenblit@gmail.com", continued: true });
  doc.fillColor(CLOUD).text(" | ", { continued: true });
  doc.fillColor(STONE).text("+54 11 2156 1770", { continued: true });
  doc.fillColor(CLOUD).text(" | ", { continued: true });
  doc.fillColor(ACCENT).text("GitHub", { link: "https://github.com/korentomas", continued: true });
  doc.fillColor(CLOUD).text(" | ", { continued: true });
  doc.fillColor(ACCENT).text("LinkedIn", { link: "https://www.linkedin.com/in/tomaskorenblit/", continued: true });
  doc.fillColor(CLOUD).text(" | ", { continued: true });
  doc.fillColor(ACCENT).text("ORCID", { link: "https://orcid.org/0009-0002-5682-8475" });
  y += contactH + 10;

  // ── DIVIDER ──
  doc.save().strokeColor(CLOUD).lineWidth(0.5)
    .moveTo(MARGIN.left, y).lineTo(PAGE_W - MARGIN.right, y).stroke().restore();
  y += 8;

  // ============================================================
  // LEFT COLUMN
  // ============================================================
  let lY = y;

  lY = drawSection("Experience", MARGIN.left, lY, LEFT_W);

  lY = drawRole(
    "Partner, Data Scientist & Full-Stack Engineer",
    "Ascendancy", "Jan 2026 - Present",
    [
      "Architecting a network intelligence platform that maps and scores relationship paths for institutional clients targeting Fortune 500 events.",
      "Designed the data ingestion backend (LinkedIn, email, investment data) powering the platform's relationship scoring engine.",
      "Established CI/CD pipelines, development standards, and automated workflows as founding engineer of a greenfield team.",
    ],
    MARGIN.left, lY, LEFT_W,
  );

  lY = drawRole(
    "Software Engineer",
    "Invisible Technologies", "Jun - Dec 2025",
    [
      "Shipped an AI-assisted design platform for reinforcement learning from human feedback (RLHF), serving 4 major AI labs including Google, Meta, and Anthropic.",
      "Built versioning, self-healing pipelines, and GCP integration for batch data management across campaigns.",
    ],
    MARGIN.left, lY, LEFT_W,
  );

  lY = drawRole(
    "Coding QC Analyst & AI Data Trainer",
    "Invisible Technologies", "Dec 2022 - Jun 2025",
    [
      "Created validation dashboards (Looker, Python, Apps Script) for coding training data, adopted company-wide as daily QC tooling.",
      "Oversaw data quality across 150+ annotators in coding quality operations.",
    ],
    MARGIN.left, lY, LEFT_W,
  );

  lY = drawRole(
    "Lead Generator & Data Scientist",
    "Klouser (B2B lead generation)", "Nov 2021 - Oct 2022",
    [
      "Increased daily lead generation 5x (10 to 50) building a classification-driven prospect system (Python, PostgreSQL, Scikit-learn).",
      "Trained a text classifier on 6,000 client profiles for automated prospect scoring; integrated billing with Xero.",
    ],
    MARGIN.left, lY, LEFT_W,
  );

  lY = drawSection("Bayesian Projects", MARGIN.left, lY + 2, LEFT_W);

  lY = drawRole(
    "Player Skill Estimation: V\u00e9lez Sarsfield",
    "Argentine Football | Hierarchical Bayesian Models | PyMC", "2025",
    [
      "Estimated player skill over time for a top-division football club using hierarchical Bayesian models; identified structural causes of a mid-season point collapse. Ported TrueSkillThroughTime rating library from Julia to PyMC.",
    ],
    MARGIN.left, lY, LEFT_W,
  );

  lY = drawRole(
    "Lineup Optimization: Portland Trail Blazers",
    "NBA | Thompson Sampling | Live Experiment", "2025",
    [
      "Modeled young-player development minutes via Thompson sampling for an NBA team, producing stint-based lineup recommendations. Findings shared with media analyst Tom Haberstroh.",
    ],
    MARGIN.left, lY, LEFT_W,
  );

  lY = drawSection("Publications", MARGIN.left, lY + 2, LEFT_W);

  lY = drawRole(
    "Not All Instructions Are Forgotten Equal",
    "JAIIO 2026 (ASAID) | Accepted, camera-ready in preparation", "2026",
    [
      "Bayesian hierarchical ordered-logit study of how LLMs lose adherence to in-context instructions over long coding conversations; per-instruction effects span more than an order of magnitude. Open-source benchmark built on Inspect AI.",
    ],
    MARGIN.left, lY, LEFT_W,
  );

  // ============================================================
  // RIGHT COLUMN
  // ============================================================
  let rY = y;

  rY = drawSection("Skills", RIGHT_X, rY, RIGHT_W);

  const skillGroups = [
    ["Data Science", ["Statistical Modeling | GLMs", "Causal Inference | Bayesian", "Hierarchical Models | PyMC", "Thompson Sampling", "Regression | Hypothesis Testing"]],
    ["Programming", ["Proficient: Python | SQL", "Experienced: C++ | JavaScript", "Node.js | React | Shell"]],
    ["Libraries", ["PyMC | Pandas | NumPy", "Scikit-Learn | StatsModels", "Matplotlib | Plotly | Flask"]],
    ["Tools", ["Git | Docker | GCP", "GitHub Actions | CI/CD", "PowerBI | Vercel"]],
    ["Languages", ["English - bilingual", "Spanish - native", "Hebrew - beginner"]],
  ];

  for (const [label, items] of skillGroups) {
    rY = drawSidebarLabel(label, RIGHT_X, rY + 4, RIGHT_W);
    for (const item of items) {
      rY = drawSidebarItem(item, RIGHT_X, rY, RIGHT_W);
    }
  }

  // Education
  rY = drawSection("Education", RIGHT_X, rY + 4, RIGHT_W);

  const uniText = "UNSAM (Buenos Aires)";
  doc.font(FONT_BOLD).fontSize(9.5).fillColor(INK);
  doc.text(uniText, RIGHT_X, rY, { width: RIGHT_W });
  rY += doc.heightOfString(uniText, { width: RIGHT_W }) + 1;

  doc.font(FONT_REG).fontSize(8.5).fillColor(STONE);
  doc.text("BSc Data Science", RIGHT_X, rY, { width: RIGHT_W });
  rY += doc.heightOfString("BSc Data Science", { width: RIGHT_W }) + 1;

  doc.font(FONT_REG).fontSize(8).fillColor(MIST);
  doc.text("Expected Jun 2027", RIGHT_X, rY, { width: RIGHT_W });
  rY += doc.heightOfString("Expected Jun 2027", { width: RIGHT_W }) + 6;

  doc.font(FONT_BOLD).fontSize(9.5).fillColor(INK);
  doc.text("BlueDot Impact", RIGHT_X, rY, { width: RIGHT_W });
  rY += doc.heightOfString("BlueDot Impact", { width: RIGHT_W }) + 1;

  doc.font(FONT_REG).fontSize(8.5).fillColor(STONE);
  doc.text("Technical AI Safety course", RIGHT_X, rY, { width: RIGHT_W });
  rY += doc.heightOfString("Technical AI Safety course", { width: RIGHT_W }) + 1;

  doc.font(FONT_REG).fontSize(8).fillColor(MIST);
  doc.text("2026", RIGHT_X, rY, { width: RIGHT_W });
  rY += doc.heightOfString("2026", { width: RIGHT_W }) + 6;

  // Reference
  rY = drawSection("Reference", RIGHT_X, rY, RIGHT_W);

  doc.font(FONT_BOLD).fontSize(9).fillColor(INK);
  doc.text("Kamron Palizban", RIGHT_X, rY, { width: RIGHT_W });
  rY += doc.heightOfString("Kamron Palizban", { width: RIGHT_W }) + 1;

  doc.font(FONT_REG).fontSize(8.5).fillColor(STONE);
  doc.text("CEO, Ascendancy", RIGHT_X, rY, { width: RIGHT_W });
  rY += doc.heightOfString("CEO, Ascendancy", { width: RIGHT_W }) + 1;

  doc.font(FONT_REG).fontSize(8.5).fillColor(STONE);
  doc.text("kamron@ascendancy.co", RIGHT_X, rY, { width: RIGHT_W });

  doc.end();
  console.log(`\u2713 PDF created: ${OUTPUT}`);
}

main();
