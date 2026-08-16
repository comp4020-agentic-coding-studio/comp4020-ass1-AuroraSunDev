# Process overview

## What I built

**When Humans Vanish** — a static explainer built around one claim: how fast a
place changes without us depends on how much continuous human work was holding
it up. New York, a nuclear plant, the Great Wall and undisturbed rainforest
each carry a slider from day 1 to year 500; a comparison view then puts any
subset at the same moment. Time is the only mechanic; the checkboxes choose
what's visible. Every stop is marked `observed` or `inferred` and cites a
source. But the rates are the argument, not the conclusion: run far enough and
all four arrive somewhere similar, which the closing section is for. The home
page is a crowd drawing you click, which detonates into the explainer.

## The moments that mattered

### A green check over a blank page

I swapped the four hand-drawn SVGs for real photography and asked for AVIF to
keep the payload down. Every sensor stayed green — typecheck, build, lint, 78
tests — and the home page rendered as an empty cream rectangle. The file was a
valid AVIF: correct `naturalWidth`, `decode()` resolved, no error event, and
because a `<picture>` treats a successfully-decoded `<source>` as final, it never
fell back to the JPEG. Drawn to a canvas: 0 opaque pixels out of 1600.
The obvious fix was to change format and move on. Instead it went
into `CLAUDE.md` as a rule about this machine's one image tool, alongside
the alpha-channel trap that had flattened the burst PNG to white
([`b4538ef`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-AuroraSunDev/commit/b4538ef)).
The lesson that outlives `sips`: an asset pipeline can only be verified by
rendering the page and sampling pixels.

### The checkbox that did nothing

Unticking a place in the comparison view did nothing. The JS was
correct — it set `hidden` — but the browser's own `[hidden] { display: none }`
lives in the UA stylesheet, and any author `display` declaration outranks it
whatever its specificity, so `.place-visual { display: flex }` kept "hidden"
cards on screen. Rather than only adding the missing rule, I added a test that
reads the **built** CSS in `dist/`, where the cascade resolves. Closing
the gap needed the same care: a card must leave layout entirely for the
others to move up, which no property transition can animate, so it runs inside a
view transition, verified by measuring card positions across each toggle
([`0ec3f4e`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-AuroraSunDev/commit/0ec3f4e)).

### A clever fix that new information made wrong

The grounded data had seven cited stops; the artwork came as ten frames. Rather
than invent citations or drop frames, I bucketed one continuous slider two
ways — coarser for text, finer for images
([`342fd87...b4538ef`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-AuroraSunDev/compare/342fd87...b4538ef)).
Right for what I knew; wrong once I read the notes the scenes were drawn from,
which set out ten specific time points. Mid-slider, the caption read "1 year"
over the year-20 drawing. I deleted the machinery rather than defend it — ten
stops, ten frames, the frame derived from the stop so they cannot drift — and
the test that asserted the decoupling now asserts they agree.

### Tests that check the contract, not the conclusion

Every stop carries `evidence` and `sourceIds`, and a spec test asserts no
claim can cite a source that isn't in `SOURCES`. I also deleted two planned
tests: a monotonic "transformation" score, and one requiring the rainforest's
peak to be lowest. Both encoded the conclusion I wanted rather than the contract
the site owes, so what survives asserts only that every place moves somewhere —
never how far
([`342fd87`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-AuroraSunDev/commit/342fd87)).
