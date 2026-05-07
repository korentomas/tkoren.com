export const SITE_URL = "https://tkoren.com";

export const SITE = {
  name: "Tomás Korenblit",
  alternateName: "Tomas Korenblit",
  title: "Bayesian Data Scientist",
  bio: "Bayesian Data Scientist @ Buenos Aires.",
  email: "tomaskorenblit@gmail.com",
  image: "/optimized-images/also_me-800w-90q.webp",
  resumeUrl: "/resume/16-04-2026.pdf",
  description:
    "Tomás Korenblit, Bayesian Data Scientist. Notes on books, ideas, and what I'm working on.",
  shortDescription: "Bayesian Data Scientist.",
  knowsAbout: [
    "Causal Inference",
    "Bayesian Statistics",
    "Data Science",
    "AI Safety",
    "Software Engineering",
  ],
  social: {
    github: "https://github.com/korentomas",
    linkedin: "https://linkedin.com/in/tomaskorenblit",
  },
} as const;

/* Books
   Short, opinionated. Add/remove freely.
   "note" is your one-line take on why it's here. */
export type Book = {
  title: string;
  author: string;
  note?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

export const BOOKS: { section: string; items: Book[] }[] = [
  {
    section: "Causal & Bayesian",
    items: [
      {
        title: "The Book of Why",
        author: "Judea Pearl & Dana Mackenzie",
      },
      {
        title: "Bayesian Analysis with Python",
        author: "Osvaldo Martin",
      },
    ],
  },
  {
    section: "Non-fiction",
    items: [
      {
        title: "El nudo de la conciencia",
        author: "Enzo Tagliazucchi",
      },
    ],
  },
  {
    section: "Fiction",
    items: [
      {
        title: "The Pearl",
        author: "John Steinbeck",
      },
      {
        title: "Cat's Cradle",
        author: "Kurt Vonnegut",
      },
    ],
  },
];

/* Interests
   Plain list. Each entry is a heading + short paragraph. */
export type Interest = { title: string; body: string };

export const INTERESTS: Interest[] = [
  {
    title: "Causal inference",
    body: "Priors are awesome, online learning? Incredible. I live a Bayesian life, thinking of all events as they adapt my knowledge.",
  },
  {
    title: "AI safety",
    body: "Alignment and interpretability? Fascinating problems. My take: LLMs alone won't safely get us there. We need to understand what these systems are doing inside before we trust what's coming out.",
  },
  {
    title: "Recreational thinking",
    body: "Send me an email if you want to chat! I mean it.",
  },
];

/* Now
   A snapshot of what I'm up to. Edit often. */
export type NowSection = {
  heading: string;
  body: string;
  link?: { href: string; label: string };
};

export type NowSnapshot = {
  date: string;
  sections: NowSection[];
};

export const NOW: NowSnapshot = {
  date: "2026-05-06",
  sections: [
    {
      heading: "Work",
      body: "Doing the BlueDot Technical AI Safety course, facilitated by BAISH (Buenos Aires AI Safety Hub).",
    },
    {
      heading: "Reading",
      body: "El infinito en un junco by Irene Vallejo.",
    },
    {
      heading: "Writing",
      body: "Drafting a paper on which instructions LLMs actually retain across long coding sessions (Not All Instructions Are Forgotten Equal). Bayesian ordered logistic over 244 compliance observations; treatment effects span an order of magnitude across instruction types.",
      link: {
        href: "/papers/not_all_instructions.pdf",
        label: "Read the draft (PDF)",
      },
    },
    {
      heading: "Thinking about",
      body: "AI safety, particularly how you tell whether a system has internalized a rule versus pattern-matched around it.",
    },
  ],
};

/* Then
   Archive of past /now snapshots. Most recent first.
   When you update NOW, push the previous snapshot to the top of this array. */
export const THEN: NowSnapshot[] = [];
