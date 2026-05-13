import { z } from "zod";
import interestsData from "../../content/interests.json";
import booksData from "../../content/books.json";
import nowData from "../../content/now.json";
import thenData from "../../content/then.json";
import {
  InterestSchema,
  BookSectionSchema,
  NowSnapshotSchema,
} from "./schemas";
export { SITE, SITE_URL } from "./site-config";

export const INTERESTS = z.array(InterestSchema).parse(interestsData);
export const BOOKS = z.array(BookSectionSchema).parse(booksData);
export const NOW = NowSnapshotSchema.parse(nowData);
export const THEN = z.array(NowSnapshotSchema).parse(thenData);
