import "server-only";

import { tool } from "ai";
import { z } from "zod";

import * as ctx from "./catalog-context";

/**
 * The Valice Press concierge’s tools.
 *
 * WHY TOOLS RATHER THAN A CATALOG IN THE PROMPT
 * A model asked "do you have anything on Greek handwriting?" from memory will
 * invent a plausible title, because inventing plausible titles is exactly what
 * it is good at. Every factual question here is answered by a deterministic
 * function over the site's own queries instead. The model's job is to decide
 * WHICH function to call and to write the sentence around the answer — never
 * to supply the answer.
 */

export const ASSISTANT_MODEL = "gpt-4.1-mini";

/** Ceiling on a single reply, so one question cannot run away with the budget. */
export const MAX_STEPS = 6;

export function createAssistantTools() {
  return {
    searchBooks: tool({
      description:
        "Search the Valice Press catalogue by subject, title, author or keyword. " +
        "ALWAYS use this before answering any question about whether a book exists. " +
        "An empty result means the press does not publish anything matching.",
      inputSchema: z.object({
        query: z.string().min(1).describe("Subject, title, author or keyword"),
      }),
      execute: async ({ query }) => {
        const books = await ctx.findBooks(query);
        return {
          matchCount: books.length,
          books,
          note:
            books.length === 0
              ? "No match. Say plainly that Valice Press does not have a book on this, and do not suggest a title that is not in this list."
              : undefined,
        };
      },
    }),

    getBook: tool({
      description:
        "Full detail for one book by its slug: description, page count, ISBN, every edition " +
        "and where each is bought, and whether a PDF exists. Use after searchBooks.",
      inputSchema: z.object({ slug: z.string().min(1) }),
      execute: async ({ slug }) => {
        const book = await ctx.bookDetail(slug);
        return book ?? { error: "No published book with that slug." };
      },
    }),

    listCategories: tool({
      description: "Every collection the press publishes, with how many books each holds.",
      inputSchema: z.object({}),
      execute: async () => ({ categories: await ctx.categories() }),
    }),

    listAllBooks: tool({
      description:
        "The entire published catalogue. Use for broad questions like 'what do you publish' " +
        "or 'which books are free right now'.",
      inputSchema: z.object({}),
      execute: async () => {
        const books = await ctx.allBooks();
        return { total: books.length, books };
      },
    }),

    getCampaign: tool({
      description:
        "The live state of the free-ebook promotion and how a reader requests a PDF. " +
        "ALWAYS use this before saying anything about books being free.",
      inputSchema: z.object({}),
      execute: async () => ctx.campaign(),
    }),

    getCart: tool({
      description:
        "What is in THIS visitor's own cart right now. Use when they ask about their cart or basket.",
      inputSchema: z.object({}),
      execute: async () => ctx.cart(),
    }),

    listCompanions: tool({
      description:
        "The free companion pages that accompany printed books (practice sheets, extra material).",
      inputSchema: z.object({}),
      execute: async () => ({ companions: ctx.companions() }),
    }),
  };
}
