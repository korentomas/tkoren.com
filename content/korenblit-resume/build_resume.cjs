const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  ExternalHyperlink, TabStopType, TabStopPosition,
} = require("docx");

// ============================================================
// DESIGN PHILOSOPHY
// ============================================================
// Inspired by Japanese minimalism (ma, kanso, shibui) and
// Josh Puckett's product design sensibility:
//
// MA (間)   — Intentional whitespace. Space is not absence,
//             it is an active design element. Generous margins,
//             breathing room between sections.
//
// KANSO (簡素) — Simplicity. Every element earns its place.
//                No decorative noise. Clean hierarchy.
//
// SHIBUI (渋い) — Subtle sophistication. High contrast with
//                  restraint. One accent color, used sparingly.
//                  Typography does the heavy lifting.
//
// Josh Puckett's approach: clarity of purpose, bold typography,
// functional beauty, nothing flashy but everything intentional.
// ============================================================

// --- PALETTE ---
// Warm, restrained. Matches the portfolio's Tanizaki warmth.
// One accent (ai-iro indigo), everything else warm neutral.
const INK = "2D2D2B";       // Warm near-black — not pure black, it breathes
const STONE = "55524E";     // Warm dark gray — earthy, not clinical
const MIST = "8A8785";      // Warm medium gray — for dates, tertiary
const CLOUD = "D5D2CC";     // Warm light gray — subtle dividers
const ACCENT = "3D5167";    // Ai-iro (藍色) — deep indigo slate, used sparingly

// --- TYPOGRAPHY ---
// Georgia throughout — kanso. One font, one voice.
// Warmth, humanity, gravitas. Matches the portfolio's serif soul.
const DISPLAY_FONT = "Georgia";
const BODY_FONT = "Georgia";

// --- SPACING (DXA units, 1440 = 1 inch) ---
const PAGE_W = 12240;       // US Letter
const PAGE_H = 15840;
const MARGIN_TOP = 1080;    // 0.75" — generous top margin
const MARGIN_BOTTOM = 900;  // 0.625"
const MARGIN_LEFT = 1200;   // ~0.83"
const MARGIN_RIGHT = 1200;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT; // 9840

// Two-column: left (experience) gets ~63%, right (meta) gets ~37%
const LEFT_W = 6200;
const GAP = 400;            // Column gap — ma between columns
const RIGHT_W = CONTENT_W - LEFT_W - GAP; // 3240

const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ============================================================
// DESIGN COMPONENTS
// ============================================================

// Section heading — quiet authority, thin rule below
// Color is STONE not ACCENT — shibui: reserve accent for one moment
function sectionTitle(text, { first = false } = {}) {
  return new Paragraph({
    spacing: { before: first ? 40 : 300, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: CLOUD, space: 4 } },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 17,           // 8.5pt — quiet, not shouting
        color: STONE,
        font: BODY_FONT,
        characterSpacing: 60, // Gentle tracking — ma, not megaphone
      }),
    ],
  });
}

// Job title — bold, clear hierarchy, generous ma above
function roleTitle(text) {
  return new Paragraph({
    spacing: { before: 180, after: 0 },
    children: [
      new TextRun({ text, bold: true, size: 19, color: INK, font: BODY_FONT }),
    ],
  });
}

// Company + date on same line, separated by pipe
function roleMeta(company, date) {
  return new Paragraph({
    spacing: { before: 20, after: 50 },
    children: [
      new TextRun({ text: company, size: 16, color: STONE, font: BODY_FONT }),
      new TextRun({ text: `  |  ${date}`, size: 16, color: MIST, font: BODY_FONT }),
    ],
  });
}

// Bullet — standard dot, invisible by design
function bullet(text) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    indent: { left: 180, hanging: 180 },
    children: [
      new TextRun({ text: "\u2022  ", size: 16, color: MIST, font: BODY_FONT }),
      new TextRun({ text, size: 16, color: STONE, font: BODY_FONT }),
    ],
  });
}

// Sidebar section label — quieter tracking than main headings
function sidebarLabel(text) {
  return new Paragraph({
    spacing: { before: 200, after: 40 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 15,
        color: STONE,
        font: BODY_FONT,
        characterSpacing: 40,
      }),
    ],
  });
}

// Sidebar body text
function sidebarText(text) {
  return new Paragraph({
    spacing: { before: 0, after: 20 },
    children: [
      new TextRun({ text, size: 15, color: STONE, font: BODY_FONT }),
    ],
  });
}

// ============================================================
// CONTENT
// ============================================================

const leftContent = [
  sectionTitle("Experience", { first: true }),

  roleTitle("Partner, Data Scientist & Full-Stack Engineer"),
  roleMeta("Ascendancy", "Jan 2026 - Present"),
  bullet("Architecting a network intelligence platform that maps and scores relationship paths for institutional clients targeting Fortune 500 events."),
  bullet("Designed the data ingestion backend (LinkedIn, email, investment data) powering the platform's relationship scoring engine."),
  bullet("Established CI/CD pipelines, development standards, and automated workflows as founding engineer of a greenfield team."),

  roleTitle("Software Engineer"),
  roleMeta("Invisible Technologies", "Jun - Dec 2025"),
  bullet("Shipped an AI-assisted design platform for reinforcement learning from human feedback (RLHF), serving 4 major AI labs including Google, Meta, and Anthropic."),
  bullet("Built versioning, self-healing pipelines, and GCP integration for batch data management across campaigns."),

  roleTitle("Coding QC Analyst & AI Data Trainer"),
  roleMeta("Invisible Technologies", "Dec 2022 - Jun 2025"),
  bullet("Created validation dashboards (Looker, Python, Apps Script) for coding training data, adopted company-wide as daily QC tooling."),
  bullet("Oversaw data quality across 150+ annotators in coding quality operations."),

  roleTitle("Lead Generator & Data Scientist"),
  roleMeta("Klouser (B2B lead generation)", "Nov 2021 - Oct 2022"),
  bullet("Increased daily lead generation 5x (10 to 50) building a classification-driven prospect system (Python, PostgreSQL, Scikit-learn)."),
  bullet("Trained a text classifier on 6,000 client profiles for automated prospect scoring; integrated billing with Xero."),

  sectionTitle("Bayesian Projects"),

  roleTitle("Player Skill Estimation: V\u00e9lez Sarsfield"),
  roleMeta("Argentine Football | Hierarchical Bayesian Models | PyMC", "2025"),
  bullet("Estimated player skill over time for a top-division football club using hierarchical Bayesian models; identified structural causes of a mid-season point collapse. Ported TrueSkillThroughTime rating library from Julia to PyMC."),

  roleTitle("Lineup Optimization: Portland Trail Blazers"),
  roleMeta("NBA | Thompson Sampling | Live Experiment", "2025"),
  bullet("Modeled young-player development minutes via Thompson sampling for an NBA team, producing stint-based lineup recommendations. Findings shared with media analyst Tom Haberstroh."),

  sectionTitle("Publications"),

  roleTitle("Not All Instructions Are Forgotten Equal"),
  roleMeta("JAIIO 2026 (ASAID) | Accepted, camera-ready in preparation", "2026"),
  bullet("Bayesian hierarchical ordered-logit study of how LLMs lose adherence to in-context instructions over long coding conversations; per-instruction effects span more than an order of magnitude. Open-source benchmark built on Inspect AI."),
];

const rightContent = [
  sectionTitle("Skills", { first: true }),

  sidebarLabel("Data Science"),
  sidebarText("Statistical Modeling | GLMs"),
  sidebarText("Causal Inference | Bayesian"),
  sidebarText("Hierarchical Models | PyMC"),
  sidebarText("Thompson Sampling"),
  sidebarText("Regression | Hypothesis Testing"),

  sidebarLabel("Programming"),
  sidebarText("Proficient: Python | SQL"),
  sidebarText("Experienced: C++ | JavaScript"),
  sidebarText("Node.js | React | Shell"),

  sidebarLabel("Libraries"),
  sidebarText("PyMC | Pandas | NumPy"),
  sidebarText("Scikit-Learn | StatsModels"),
  sidebarText("Matplotlib | Plotly | Flask"),

  sidebarLabel("Tools"),
  sidebarText("Git | Docker | GCP"),
  sidebarText("GitHub Actions | CI/CD"),
  sidebarText("PowerBI | Vercel"),

  sidebarLabel("Languages"),
  sidebarText("English - bilingual"),
  sidebarText("Spanish - native"),
  sidebarText("Hebrew - beginner"),

  sectionTitle("Education"),

  new Paragraph({
    spacing: { before: 120, after: 0 },
    children: [
      new TextRun({ text: "UNSAM (Buenos Aires)", bold: true, size: 17, color: INK, font: BODY_FONT }),
    ],
  }),
  sidebarText("BSc Data Science"),
  new Paragraph({
    spacing: { before: 0, after: 20 },
    children: [
      new TextRun({ text: "Expected Jun 2027", size: 14, color: MIST, font: BODY_FONT }),
    ],
  }),

  new Paragraph({
    spacing: { before: 120, after: 0 },
    children: [
      new TextRun({ text: "BlueDot Impact", bold: true, size: 17, color: INK, font: BODY_FONT }),
    ],
  }),
  sidebarText("Technical AI Safety course"),
  new Paragraph({
    spacing: { before: 0, after: 20 },
    children: [
      new TextRun({ text: "2026", size: 14, color: MIST, font: BODY_FONT }),
    ],
  }),

  sectionTitle("Reference"),

  new Paragraph({
    spacing: { before: 120, after: 0 },
    children: [
      new TextRun({ text: "Kamron Palizban", bold: true, size: 16, color: INK, font: BODY_FONT }),
    ],
  }),
  sidebarText("CEO, Ascendancy"),
  sidebarText("kamron@ascendancy.co"),
];

// ============================================================
// DOCUMENT ASSEMBLY
// ============================================================

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: BODY_FONT, size: 20 } },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: {
            top: MARGIN_TOP,
            bottom: MARGIN_BOTTOM,
            left: MARGIN_LEFT,
            right: MARGIN_RIGHT,
          },
        },
      },
      children: [
        // === NAME — large, serif, grounded ===
        new Paragraph({
          spacing: { after: 0 },
          children: [
            new TextRun({
              text: "Tom\u00e1s Pablo Korenblit",
              bold: true,
              size: 40,           // 20pt — commanding but not loud
              color: INK,
              font: DISPLAY_FONT,
            }),
          ],
        }),

        // === SUBTITLE — the single accent moment ===
        new Paragraph({
          spacing: { before: 30, after: 40 },
          children: [
            new TextRun({
              text: "Bayesian Data Scientist & Engineer",
              size: 19,
              color: ACCENT,
              font: BODY_FONT,
            }),
          ],
        }),

        // === SUMMARY — positions the candidate in 6 seconds ===
        new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({
              text: "Data scientist specializing in Bayesian inference, hierarchical modeling, and causal reasoning. Builds end-to-end systems from statistical models to production data pipelines in Python, SQL, and GCP.",
              size: 16,
              color: STONE,
              font: BODY_FONT,
            }),
          ],
        }),

        // === CONTACT LINE — understated ===
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: "Buenos Aires, Argentina", size: 15, color: MIST, font: BODY_FONT }),
            new TextRun({ text: "  |  ", size: 15, color: CLOUD, font: BODY_FONT }),
            new TextRun({ text: "tomaskorenblit@gmail.com", size: 15, color: STONE, font: BODY_FONT }),
            new TextRun({ text: "  |  ", size: 15, color: CLOUD, font: BODY_FONT }),
            new TextRun({ text: "+54 11 2156 1770", size: 15, color: STONE, font: BODY_FONT }),
            new TextRun({ text: "  |  ", size: 15, color: CLOUD, font: BODY_FONT }),
            new ExternalHyperlink({
              children: [new TextRun({ text: "GitHub", style: "Hyperlink", size: 15, font: BODY_FONT })],
              link: "https://github.com/korentomas",
            }),
            new TextRun({ text: "  |  ", size: 15, color: CLOUD, font: BODY_FONT }),
            new ExternalHyperlink({
              children: [new TextRun({ text: "LinkedIn", style: "Hyperlink", size: 15, font: BODY_FONT })],
              link: "https://www.linkedin.com/in/tomaskorenblit/",
            }),
            new TextRun({ text: "  ·  ", size: 15, color: CLOUD, font: BODY_FONT }),
            new ExternalHyperlink({
              children: [new TextRun({ text: "ORCID", style: "Hyperlink", size: 15, font: BODY_FONT })],
              link: "https://orcid.org/0009-0002-5682-8475",
            }),
          ],
        }),

        // === DIVIDER — thin, full-width, warm gray (not accent) ===
        new Paragraph({
          spacing: { before: 40, after: 20 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: CLOUD, space: 6 } },
          children: [],
        }),

        // === TWO-COLUMN LAYOUT ===
        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [LEFT_W, GAP, RIGHT_W],
          rows: [
            new TableRow({
              children: [
                // LEFT COLUMN
                new TableCell({
                  borders: noBorders,
                  width: { size: LEFT_W, type: WidthType.DXA },
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  children: leftContent,
                }),
                // GAP COLUMN — pure ma
                new TableCell({
                  borders: noBorders,
                  width: { size: GAP, type: WidthType.DXA },
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  children: [new Paragraph({ children: [] })],
                }),
                // RIGHT COLUMN
                new TableCell({
                  borders: noBorders,
                  width: { size: RIGHT_W, type: WidthType.DXA },
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  children: rightContent,
                }),
              ],
            }),
          ],
        }),
      ],
    },
  ],
});

// ============================================================
// OUTPUT
// ============================================================

const OUTPUT_PATH = process.argv[2] || "./Korenblit_Resume_2026.docx";

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`\u2713 Resume created: ${OUTPUT_PATH}`);
});
