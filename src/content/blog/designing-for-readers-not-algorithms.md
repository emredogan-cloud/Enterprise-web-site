---
title: "Designing for readers, not algorithms"
date: "2026-05-14"
category: "Behind the Scenes"
excerpt: "On typography, margins, contrast, and the little details that make a reading interface disappear. The opposite of optimising for thirty-second scrolls."
---

Most reading interfaces on the modern web are not actually optimized for reading. They are optimized for *measurement* — for the engagement metric, the dwell time, the session length. The little design decisions that come out of that optimisation are subtle but recognisable: column widths that pull the eye sideways, line-heights tuned for skimming, link colours that fight the body text for attention. The result reads quickly because it is meant to be left quickly.

We tried, on this site, to make exactly the opposite set of decisions.

## Typography that disappears

A good reading face does not announce itself. We use Fraunces for serif headlines and Geist Sans for body — both modern, both wide-ranging, neither shouting. The body sets at sixteen to eighteen pixels with a comfortable measure of around sixty-eight characters; long enough to carry an argument without forcing your eye into a snake-like pattern.

Letter-spacing on body text is exactly zero. There is a fashion at the moment for slightly negative tracking on body copy — it looks "tight" and "designed" in a static screenshot. In practice it makes letters fuse together at the spacings most people read at. We resisted the fashion.

## Contrast, gently

The body text is not pure white on pure black. It is a warm off-white (`#e6e6e0`) on a near-black green (`#07110b`). Two reasons. First, pure-white on pure-black causes a sharp afterimage that costs you a quarter-second between sentences — over the length of an essay that adds up. Second, the warm off-white reads like ink-on-paper rather than monitor-on-night, which is the right metaphor for a bookstore.

Headlines push a little brighter; muted text drops to a calm `#a7a7a0`. Three-tone hierarchy is enough for almost any editorial surface. Adding a fourth tier almost always means you have a content problem disguised as a design problem.

## Margins that are doing something

Whitespace is not absence. It is the structural element that tells your eye what to do next. The vertical rhythm on this site is built around an eight-pixel grid; the section gaps are deliberately a hair larger than feels comfortable on a first design pass, because a hair larger is what feels right by the second paragraph.

If you are reading this paragraph and noticing it as a separate thought — and not as a continuation of the one before it — that is the spacing working.

## Things we removed

A long list, but a few worth naming:

- **Pop-up newsletter overlays.** If we have earned an email from you, you will find the form at the bottom. If we have not, we should not interrupt the second paragraph of an essay to ask.
- **Side-rail "related posts" widgets.** They distract during reading; they encourage you to leave the piece you are *currently* in for one you might like better. Reading is not a content recommendation problem.
- **Reading progress bars.** Modern UX cliché. The scrollbar already does this job. A bright bar at the top of the page is just a polite version of nagging you to keep going.

What is left, hopefully, is something that gets out of the way.

## What the metrics will say about this

Probably that fewer people make it to the end of any individual essay. Probably that fewer people click the second post in a session. Probably that the dwell-time-per-page goes up — which is the metric that actually matters for a site whose value proposition is "stuff worth reading."

We are willing to take the trade. If you came here from a book detail page, the [catalog](/books) is one tab away. If you found us through search, [welcome](/) — and thank you for reading this far.
