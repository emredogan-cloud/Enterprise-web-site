---
title: "Why we built a Digital Bookstore"
date: "2026-05-20"
category: "Behind the Scenes"
excerpt: "Buying a digital book online today is split between rented-forever ebook stores and big-tech ecosystems. We wanted a third option: buy a book once, download it, and read it anywhere — yours to keep."
---

Buying a digital book online today is almost always one of two things.

Either you rent it from a big-tech ecosystem that can revoke it on a Sunday afternoon — there is a famous case of an ebook store remotely deleting a novel from customers' devices, and the irony of the title is too obvious to belabor. Or you buy it from a self-publishing storefront that locks it behind a proprietary app, so the file is technically yours but practically only readable on one company's hardware.

We wanted a third option.

## The principle: buy once, keep forever

A digital book should feel like a paperback. Once you've paid for it, the file is yours. You can download it, you can re-download it years later, you can read it in any PDF reader on any device. There is no "license" that expires, no app you have to keep installed, no account you have to keep active just to keep reading what you already bought.

That single principle drives almost every decision in the platform:

- **One-time purchase, not subscription.** You buy the book; you don't rent access to a catalog.
- **PDF, not a walled format.** PDF is the most portable, longest-lived consumer document format ever invented.
- **Online reading is a convenience, not a gate.** You can read in-browser if you want to. You can also download and never sign in again. The download is the real product.

## Protection without locks

The honest tension with "buy once, keep forever" is piracy. Hard DRM (Adobe DRM, Readium LCP) makes a file unreadable without an active license check, which is exactly the rented-forever experience we wanted to avoid. We chose **social DRM** instead — each downloaded PDF carries the buyer's name and order ID stamped into a footer. The file is a normal PDF. It opens in any reader. But if it shows up on a piracy site, it is *traceable*, and most readers know better than to spread something with their own name on it.

This is the same approach that O'Reilly, No Starch Press, and Pragmatic Bookshelf have used successfully for over a decade. It treats readers like adults.

## What's next

This blog will be a small notebook of decisions like that one — the choices behind the storefront, the engineering trade-offs we made, and occasional reading-guide pieces about the books we sell. The goal is not to publish a lot. The goal is to publish things that are worth reading.

If you came here from a book page: thank you for buying it. If you came here from a search engine: welcome — start with [the catalog](/books).
