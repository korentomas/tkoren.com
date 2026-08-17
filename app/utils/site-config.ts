import { z } from "zod";
import siteData from "../../content/site.json";
import researchData from "../../content/research.json";

const SiteSchema = z.object({
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
    orcid: z.string().url(),
  }),
  homeBio: z.string().min(1),
});
export type Site = z.infer<typeof SiteSchema>;

const ResearchEntrySchema = z.object({
  title: z.string().min(1),
  venue: z.string().min(1),
  authors: z.string().optional(),
  status: z.string().optional(),
  summary: z.string().min(1),
  note: z.string().optional(),
  links: z
    .array(z.object({ href: z.string().min(1), label: z.string().min(1) }))
    .optional(),
});
export type ResearchEntry = z.infer<typeof ResearchEntrySchema>;

export const SITE = SiteSchema.parse(siteData);
export const SITE_URL = "https://tkoren.com";
export const RESEARCH = z.array(ResearchEntrySchema).parse(researchData);
