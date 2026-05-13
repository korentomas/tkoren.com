import { z } from "zod";

export const SiteSchema = z.object({
  name: z.string().min(1),
  alternateName: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().min(1),
  email: z.string().email(),
  image: z.string().min(1),
  resumeUrl: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  knowsAbout: z.array(z.string()).min(1),
  social: z.object({
    github: z.string().url(),
    linkedin: z.string().url(),
  }),
  homeBio: z.string().min(1),
});
export type Site = z.infer<typeof SiteSchema>;

export const BookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  note: z.string().optional(),
  rating: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .optional(),
});
export type Book = z.infer<typeof BookSchema>;

export const BookSectionSchema = z.object({
  section: z.string().min(1),
  items: z.array(BookSchema),
});
export type BookSection = z.infer<typeof BookSectionSchema>;

export const InterestSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});
export type Interest = z.infer<typeof InterestSchema>;

export const NowSectionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  link: z
    .object({ href: z.string().min(1), label: z.string().min(1) })
    .optional(),
});
export type NowSection = z.infer<typeof NowSectionSchema>;

export const NowSnapshotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  sections: z.array(NowSectionSchema),
});
export type NowSnapshot = z.infer<typeof NowSnapshotSchema>;
