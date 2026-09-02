# Legacy (ES5) Support — Retired

The ES5 rendering engine was retired 2026-09-02. All hosts now render on the headless Chrome engine with full ES6/7+ support — no action required for your existing pages.

## What changed

All pages, regardless of their previous ES5 setting, now render on headless Chrome. The pre-rendering engine behavior has evolved; some pages may render differently than before.

## What to do

If a page renders differently than before, purge its cache so the new engine generates a fresh snapshot. For questions, [contact support](https://ostr.io/support).

## Related

- [Strip JavaScript](strip-javascript.md)
- [Client optimization](optimization.md)
- [Cache purge](cache-purge.md)
