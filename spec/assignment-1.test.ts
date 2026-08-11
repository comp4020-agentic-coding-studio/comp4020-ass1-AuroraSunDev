import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Assignment 1 published spec, split into what a test can hold:
// https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/assignment-1/
//
// Mechanically checkable, asserted here:
// - "static and client-side throughout" (the other half of that line, "the
//   starter's invariant checks pass", is covered by spec/invariants.test.ts)
//
// Not yet testable — no core interaction has been chosen yet, add this once
// you've built one:
// - "the visitor does something that changes what they see — state the core
//   interaction plainly enough to write a test for it". Once you know what
//   that interaction is, give its trigger a stable hook (a `data-testid`, the
//   same convention spec/starter.test.ts uses for `data-testid="intro"`) and
//   assert the observable state actually changes when it fires.
//
// Only a person can judge at the crit, not tested here:
// - "it works at both marking viewports (desktop and phone)" — the marker
//   opens the live URL at 1920x1080 and 390x844, uses the interaction, resizes
//   mid-use and tabs through it. A viewport meta tag existing is not the same
//   claim; that's already an invariant.
// - "one strong idea with a point of view, and nothing else"
//
// Already covered elsewhere, not duplicated here:
// - "deployed and live at its public GitHub Pages URL by the deadline" — the
//   CI deploy job checks the live URL returns 200; `preflight` checks it again
//   before submission.
// - "the starter's invariant checks pass" — spec/invariants.test.ts.
// - "evidence of process is in the repo..." — `pnpm check:evidence`.

describe("assignment 1 spec: static, no backend", () => {
  it("astro.config.ts sets no SSR output mode", () => {
    const config = readFileSync(resolve("astro.config.ts"), "utf8");
    expect(
      config,
      "astro.config.ts sets an SSR/hybrid output mode — the spec requires a static, client-side-only site.",
    ).not.toMatch(/output\s*:\s*["'](server|hybrid)["']/);
  });

  // Only these @astrojs/* packages give Astro a server-rendering target
  // (https://docs.astro.build/en/guides/on-demand-rendering/#server-adapters).
  // Everything else under the @astrojs/* scope — mdx, sitemap, react, vue,
  // tailwind, partytown, and so on — is a static-safe integration and must
  // not be flagged just for sharing the npm scope.
  const SSR_ADAPTERS = new Set([
    "@astrojs/node",
    "@astrojs/vercel",
    "@astrojs/netlify",
    "@astrojs/cloudflare",
    "@astrojs/deno",
  ]);

  it("has no server-rendering adapter installed", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const adapters = Object.keys(deps).filter((name) => SSR_ADAPTERS.has(name));

    expect(
      adapters,
      `found SSR adapter(s): ${adapters.join(", ")} — the spec requires a static, client-side-only site.`,
    ).toEqual([]);
  });
});

describe("assignment 1 spec: core interaction", () => {
  it("TODO — replace with a real test once you've chosen your core interaction (see the header comment in this file)", () => {
    expect(
      false,
      "no core interaction chosen yet — this test is a deliberate placeholder, not a bug",
    ).toBe(true);
  });
});
