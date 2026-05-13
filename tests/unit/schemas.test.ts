import { describe, it, expect } from "vitest";
import {
  SiteSchema,
  BookSchema,
  BookSectionSchema,
  InterestSchema,
  NowSnapshotSchema,
} from "~/utils/schemas";

describe("SiteSchema", () => {
  it("accepts a valid site object", () => {
    const result = SiteSchema.safeParse({
      name: "Tomás Korenblit",
      alternateName: "Tomas Korenblit",
      title: "Bayesian Data Scientist",
      bio: "Bayesian Data Scientist @ Buenos Aires.",
      email: "tomaskorenblit@gmail.com",
      image: "/optimized-images/also_me-800w-90q.webp",
      resumeUrl: "/resume/16-04-2026.pdf",
      description: "desc",
      shortDescription: "short desc",
      knowsAbout: ["AI Safety"],
      social: { github: "https://github.com/korentomas", linkedin: "https://linkedin.com/in/x" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects when email is missing", () => {
    const result = SiteSchema.safeParse({ name: "x" });
    expect(result.success).toBe(false);
  });
});

describe("BookSchema", () => {
  it("requires title and author, makes note/rating optional", () => {
    expect(BookSchema.safeParse({ title: "x", author: "y" }).success).toBe(true);
    expect(BookSchema.safeParse({ title: "x" }).success).toBe(false);
  });
});

describe("InterestSchema", () => {
  it("requires title and body", () => {
    expect(InterestSchema.safeParse({ title: "x", body: "y" }).success).toBe(true);
    expect(InterestSchema.safeParse({ title: "x" }).success).toBe(false);
  });
});

describe("NowSnapshotSchema", () => {
  it("accepts a snapshot with date and sections", () => {
    const result = NowSnapshotSchema.safeParse({
      date: "2026-05-13",
      sections: [{ heading: "Work", body: "thing" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a section with an optional link", () => {
    const result = NowSnapshotSchema.safeParse({
      date: "2026-05-13",
      sections: [
        { heading: "Writing", body: "x", link: { href: "/a.pdf", label: "PDF" } },
      ],
    });
    expect(result.success).toBe(true);
  });
});
