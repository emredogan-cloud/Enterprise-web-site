/**
 * Placeholder book-sample HTML.
 *
 * Rendered by `SampleViewer` whenever a book has no real sample to show
 * (currently always, because R2 sample-fetching is not yet wired — see
 * SUB-PR 1.3 report). Once `book.sampleKey` is set and the storage layer
 * is provisioned, the book-detail page will fetch the real sample from R2
 * at SSG time and fall back to this constant only when a key is missing.
 *
 * The content is deliberately on-brand: literary, calm, in our voice,
 * exercises the full typography palette (h2, h3, p, blockquote) so the
 * Tailwind Typography defaults are visible end-to-end.
 */
export const PLACEHOLDER_SAMPLE_HTML = `
<h2>Chapter 1 — On gathering</h2>

<p>The first time I tried to read a book I had bought online, I was twenty-two and broke and very persuaded that I had finally figured out how to live. The book — its title is unimportant now, though it lent itself to a certain weather — arrived in my inbox as an attachment, a small grey icon glowing against the white of the screen. I clicked, and it opened.</p>

<p>I read three pages, and then the file forgot who I was. It asked me for a password. It told me, in formal language, that I did not have permission to view what I had paid for.</p>

<h3>A small private war</h3>

<p>I spent the next four hours in a quiet, methodical fury, downloading utilities, copying files, trying every credential I had ever owned. The book eventually surrendered. By then I no longer wanted to read it.</p>

<p>This book is about the small private war you are not supposed to have with the things you own.</p>

<blockquote>
<p>Ownership is the simplest of all relationships, and almost everyone working at scale is making it complicated on purpose.</p>
</blockquote>

<p>I will try, over the chapters that follow, to be useful rather than dramatic. There will be tools. There will be habits. There will be, on more than one occasion, a footnote about copyright law that I hope you will skim. But the through-line, the thing I want you to keep, is that a book — a digital book — can be a simple, durable, private object. You can put it on a shelf. The shelf can live on your laptop or your phone or, eventually, the laptop your daughter borrows. The book stays.</p>
`.trim();
