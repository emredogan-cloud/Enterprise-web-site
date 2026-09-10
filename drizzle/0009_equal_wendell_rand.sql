-- The free-book queue gains a `sending` state.
--
-- It is the double-send guard: the fulfilment action claims a row by moving it
-- to `sending` with a conditional UPDATE, so a second click, a second tab or a
-- retry loses the race instead of mailing the reader a second copy.
--
-- IF NOT EXISTS because this value was applied to production by hand before the
-- code that writes it was deployed — the order matters, and re-running this
-- must be a no-op rather than an error.
ALTER TYPE "public"."free_book_request_status" ADD VALUE IF NOT EXISTS 'sending' BEFORE 'fulfilled';
