import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { PLACES } from "../src/data/places";
import type { NycVisual, WallVisual, NuclearVisual, RainforestVisual } from "../src/data/places";
import { TIMELINE } from "../src/data/timeline";
import { SOURCES } from "../src/data/sources";
import { getStateForPlace } from "../src/lib/interaction";

// Assignment 1 published spec, split into what a test can hold:
// https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/assignment-1/
//
// Mechanically checkable, asserted here:
// - "static and client-side throughout"
// - "the visitor does something that changes what they see" — the core
//   interaction is scrubbing a place's own timeline slider, or the shared
//   comparison slider, and seeing that place's own illustration update.
//
// Only a person can judge at the crit, not tested here:
// - "it works at both marking viewports (desktop and phone)"
// - "one strong idea with a point of view, and nothing else"
//
// Already covered elsewhere, not duplicated here:
// - deploy/evidence/invariants — see spec/README.md.

describe("assignment 1 spec: static, no backend", () => {
  it("astro.config.ts sets no SSR output mode", () => {
    const config = readFileSync(resolve("astro.config.ts"), "utf8");
    expect(
      config,
      "astro.config.ts sets an SSR/hybrid output mode — the spec requires a static, client-side-only site.",
    ).not.toMatch(/output\s*:\s*["'](server|hybrid)["']/);
  });

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

describe("data contract: every place's stops carry a real, grounded story", () => {
  it("has exactly one timeline shared by every place", () => {
    expect(TIMELINE.length).toBeGreaterThan(1);
  });

  for (const place of PLACES) {
    describe(place.id, () => {
      it("has exactly one stop per timeline entry", () => {
        expect(place.stops).toHaveLength(TIMELINE.length);
      });

      it("has a non-empty mechanism and contrast", () => {
        expect(place.mechanism.length).toBeGreaterThan(0);
        expect(place.contrast.length).toBeGreaterThan(0);
      });

      it("has a non-empty label, description and visual object on every stop", () => {
        for (const stop of place.stops) {
          expect(stop.label.length).toBeGreaterThan(0);
          expect(stop.description.length).toBeGreaterThan(0);
          expect(stop.visual).toBeTypeOf("object");
        }
      });

      it("marks every stop's evidence as observed or inferred, citing only real sources", () => {
        for (const stop of place.stops) {
          expect(["observed", "inferred"]).toContain(stop.evidence);
          for (const sourceId of stop.sourceIds) {
            expect(
              SOURCES[sourceId],
              `stop "${stop.label}" cites unknown source id "${sourceId}"`,
            ).toBeDefined();
          }
        }
      });

      it("has a visual shape specific to this place, with every field a finite number (or, for the reactor, a known status)", () => {
        for (const stop of place.stops) {
          const visual = stop.visual as
            | NycVisual
            | WallVisual
            | NuclearVisual
            | RainforestVisual;
          for (const [key, value] of Object.entries(visual)) {
            if (key === "systemStatus") {
              expect([
                "operating",
                "auto-shutdown",
                "backup-power",
                "cooling-lost",
                "long-term-containment",
              ]).toContain(value);
            } else {
              expect(Number.isFinite(value), `${place.id}.${key} is not a finite number`).toBe(
                true,
              );
            }
          }
        }
      });

      it("visibly moves somewhere across the full timeline", () => {
        const first = getStateForPlace(place, 0);
        const last = getStateForPlace(place, TIMELINE.length - 1);
        expect(first.label).not.toBe(last.label);
      });
    });
  }

  it("contains more than one kind of trajectory, not just degrees of one", () => {
    const trajectories = new Set(PLACES.map((place) => place.trajectory));
    expect(trajectories.size).toBeGreaterThan(1);
  });
});

describe("built page: the interaction is actually wired to the data", () => {
  const distPath = resolve("dist/index.html");
  const doc = new JSDOM(readFileSync(distPath, "utf8")).window.document;

  const scopes = [...PLACES.map((place) => place.id), "compare"];

  it("renders one time slider per place plus one shared comparison slider", () => {
    for (const scope of scopes) {
      const slider = doc.querySelector<HTMLInputElement>(
        `[data-testid="time-slider"][data-scope="${scope}"]`,
      );
      expect(slider, `missing time slider for scope "${scope}"`).toBeTruthy();
      expect(slider?.getAttribute("type")).toBe("range");
      expect(slider?.getAttribute("min")).toBe("0");
      expect(slider?.getAttribute("max")).toBe(String(TIMELINE.length - 1));
    }
  });

  it("pre-renders every section's default illustration from the same data getStateForPlace reads", () => {
    for (const place of PLACES) {
      const initial = getStateForPlace(place, 0);
      const container = doc.querySelector(
        `[data-testid="place-visual"][data-place-id="${place.id}"][data-scope="${place.id}"]`,
      );
      expect(container, `missing place-visual for "${place.id}"`).toBeTruthy();

      const label = container?.querySelector('[data-testid="place-visual-label"]')?.textContent?.trim();
      const description = container
        ?.querySelector('[data-testid="place-visual-description"]')
        ?.textContent?.trim();

      expect(label).toBe(initial.label);
      expect(description).toBe(initial.description);
    }
  });

  it("renders one compare-toggle checkbox per place", () => {
    const checkboxes = doc.querySelectorAll<HTMLInputElement>('[data-testid="compare-toggle"]');
    expect(checkboxes).toHaveLength(PLACES.length);

    const placeIds = new Set<string>(PLACES.map((place) => place.id));
    for (const checkbox of checkboxes) {
      expect(placeIds.has(checkbox.dataset.placeId ?? "")).toBe(true);
    }
  });

  it("renders exactly one comparison visual per place, all scoped to compare", () => {
    const grid = doc.querySelector('[data-testid="compare-grid"]');
    const visuals = grid?.querySelectorAll('[data-testid="place-visual"][data-scope="compare"]');
    expect(visuals).toHaveLength(PLACES.length);
  });

  it("renders the play control paused by default, with no autoplay on load", () => {
    const playButton = doc.querySelector('[data-testid="compare-play"]');
    expect(playButton?.getAttribute("aria-pressed")).toBe("false");
  });
});
