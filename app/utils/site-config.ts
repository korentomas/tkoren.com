import { z } from "zod";
import siteData from "../../content/site.json";
import interestsData from "../../content/interests.json";
import booksData from "../../content/books.json";
import nowData from "../../content/now.json";
import thenData from "../../content/then.json";
import researchData from "../../content/research.json";
import writingData from "../../content/writing.json";
import {
  SiteSchema,
  InterestSchema,
  BookSectionSchema,
  NowSnapshotSchema,
  ResearchEntrySchema,
  WritingPieceSchema,
} from "./schemas";

export const SITE = SiteSchema.parse(siteData);
export const SITE_URL = "https://tkoren.com";
export const INTERESTS = z.array(InterestSchema).parse(interestsData);
export const BOOKS = z.array(BookSectionSchema).parse(booksData);
export const NOW = NowSnapshotSchema.parse(nowData);
export const THEN = z.array(NowSnapshotSchema).parse(thenData);
export const RESEARCH = z.array(ResearchEntrySchema).parse(researchData);
export const WRITING = z.array(WritingPieceSchema).parse(writingData);

export type { Site, Book, BookSection, Interest, NowSection, NowSnapshot, ResearchEntry, WritingPiece } from "./schemas";
