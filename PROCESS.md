# Process overview

## What I built

**When Humans Vanish** — a static explainer built around one claim: human
absence isn't uniform decay. How fast a place changes depends on how much its
present condition is being held up by continuous human maintenance. Four places
carry the argument — the NYC subway, a nuclear power plant, the Great Wall, and
undisturbed tropical rainforest — each with its own slider from day 1 to year
500, then a comparison view that puts any subset of them at the same moment.
Time is the only mechanic; the checkboxes choose what's visible, not a second
thing to interact with. Every stop is marked `observed` or `inferred` and cites a
real source. The home page is a crowd drawing you click, which detonates into the
explainer.

## The moments that mattered

### A green check over a blank page

I swapped the four hand-drawn SVGs for real photography and asked for AVIF to
keep the payload down. Every sensor stayed green — typecheck, build, lint, 78
tests — and the home page rendered as an empty cream rectangle. The file was a
valid AVIF: correct `naturalWidth`, `decode()` resolved, no error event, and
because a `<picture>` treats a successfully-decoded `<source>` as final, it never
fell back to the JPEG. Drawn to a canvas it gave 0 opaque pixels out of 1600.
The obvious fix was to change the format and move on. Instead the finding went
into `CLAUDE.md` as a rule about the one image tool this machine has, alongside
the alpha-channel trap that had flattened the burst PNG to an opaque white block
([`b4538ef`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-AuroraSunDev/commit/b4538ef)).
The lesson that outlives `sips`: an asset pipeline can only be verified by
rendering the page and sampling pixels.

### The checkbox that did nothing

Unticking a place in the comparison view had no visible effect. The JS was
correct — it set `hidden` — but the browser's own `[hidden] { display: none }`
lives in the UA stylesheet, and any author `display` declaration outranks it
regardless of specificity, so `.place-visual { display: flex }` kept "hidden"
cards on screen. Rather than only adding the missing rule, I added a test that
reads the **built** CSS in `dist/`, because that is where the cascade actually
resolves. Closing the gap smoothly needed the same care: a card must leave
layout entirely for the others to move up, which no property transition can
animate, so it runs inside a view transition. I verified it by measuring card
positions before and after each toggle
([`0ec3f4e`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-AuroraSunDev/commit/0ec3f4e)).

### Not bending the evidence to fit the assets

The grounded data has seven cited stops; the photography came as ten frames. The
obvious move was to make one match the other. Both were wrong: adding stops
would have invented citations, dropping frames would have made the drag feel
stepped. So one continuous slider is bucketed two independent ways — coarser for
text and citations, finer for frames — each a pure function with its own unit
tests
([`342fd87...b4538ef`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-AuroraSunDev/compare/342fd87...b4538ef)).

### Tests that check the contract, not the conclusion

Every stop carries `evidence` and `sourceIds`, and a spec test asserts that no
claim can cite a source that isn't in `SOURCES`. I also deleted two tests I'd
planned: one asserting a monotonic "transformation" score, one requiring the
rainforest's peak to be the lowest. Both encoded the conclusion I wanted rather
than the contract the site owes, so the surviving test only asserts that every
place moves somewhere — never how far
([`342fd87`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-AuroraSunDev/commit/342fd87)).
