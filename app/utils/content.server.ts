import { z } from "zod";
import siteData from "../../content/site.json";
import interestsData from "../../content/interests.json";
import booksData from "../../content/books.json";
import nowData from "../../content/now.json";
import thenData from "../../content/then.json";
import {
  SiteSchema,
  InterestSchema,
  BookSectionSchema,
  NowSnapshotSchema,
} from "./schemas";

export const SITE = SiteSchema.parse(siteData);
export const INTERESTS = z.array(InterestSchema).parse(interestsData);
export const BOOKS = z.array(BookSectionSchema).parse(booksData);
export const NOW = NowSnapshotSchema.parse(nowData);
export const THEN = z.array(NowSnapshotSchema).parse(thenData);

export const SITE_URL = "https://tkoren.com";
