import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import astroConfig from "../astro.config";
import { PLACES } from "../src/data/places";
import { TIMELINE } from "../src/data/timeline";
import { SOURCES } from "../src/data/sources";
import { FRAME_COUNT, SLIDER_RESOLUTION, getStateForPlace } from "../src/lib/interaction";

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

      it("has a non-empty label and description on every stop", () => {
        for (const stop of place.stops) {
          expect(stop.label.length).toBeGreaterThan(0);
          expect(stop.description.length).toBeGreaterThan(0);
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

      // Replaces an assertion about each place's numeric `visual` object. Those
      // numbers drove the generated SVGs; once real artwork replaced them the
      // field was read by nothing but this test, so it was removed rather than
      // extended to forty invented values. What matters now is that a stop and
      // its drawn frame are the same moment, which is what this holds.
      it("has one stop per drawn frame, so no caption can describe a different frame", () => {
        expect(place.stops).toHaveLength(FRAME_COUNT);
        for (let frameIndex = 1; frameIndex <= FRAME_COUNT; frameIndex++) {
          const framePath = resolve(`public/scenes/${place.id}/${frameIndex}.jpg`);
          expect(
            existsSync(framePath),
            `${place.id} stop ${frameIndex} has no frame at public/scenes/${place.id}/${frameIndex}.jpg`,
          ).toBe(true);
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
  // The explainer moved off index.html when the intro splash took the home
  // page; index.html is asserted separately below.
  const distPath = resolve("dist/explainer.html");
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
      expect(slider?.getAttribute("max")).toBe(String(SLIDER_RESOLUTION));
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

  // Guards a bug that shipped: unchecking a place set the `hidden` attribute,
  // but the browser's [hidden] { display: none } lives in the UA stylesheet and
  // any author `display` outranks it — so `.place-visual { display: flex }` kept
  // unchecked places on screen. Asserted against the built CSS, because that is
  // where the cascade actually resolves.
  it("ships a rule that collapses an unchecked place, beating .place-visual's display:flex", () => {
    const cssDir = resolve("dist/_astro");
    const css = readdirSync(cssDir)
      .filter((name) => name.endsWith(".css"))
      .map((name) => readFileSync(resolve(cssDir, name), "utf8"))
      .join("\n");

    expect(css.length, "found no built CSS to check").toBeGreaterThan(0);
    expect(
      css,
      ".place-visual[hidden] must set display:none, or unchecking a compare toggle does nothing",
    ).toMatch(/\.place-visual\[hidden\]\s*\{[^}]*display:\s*none/);
  });

  // Was one button whose meaning flipped as you pressed it. Play and Pause are
  // now separate controls, so what's held here is the contract rather than the
  // old markup: both exist, and the built page starts stopped.
  it("renders separate play and pause controls, with no autoplay on load", () => {
    for (const [testid, role] of [
      ["compare-play", "play"],
      ["compare-pause", "pause"],
    ]) {
      const button = doc.querySelector(`[data-testid="${testid}"]`);
      expect(button, `the comparison needs a ${role} control`).toBeTruthy();

      // These are icon-only, so there is no text to fall back on: drop the
      // aria-label and the control silently announces as just "button".
      const name = button?.getAttribute("aria-label")?.trim() ?? button?.textContent?.trim();
      expect(
        name?.length,
        `the ${role} control draws an icon, so it needs an accessible name`,
      ).toBeGreaterThan(0);

      // The glyph must not leak into that name.
      for (const svg of button?.querySelectorAll("svg") ?? []) {
        expect(
          svg.getAttribute("aria-hidden"),
          `the ${role} icon should be hidden from the accessibility tree`,
        ).toBe("true");
      }
    }

    const controls = doc.querySelector('[data-testid="compare-controls"]');
    expect(
      controls?.getAttribute("data-playing"),
      "the page must arrive stopped — nothing animates until the visitor asks",
    ).toBe("false");
  });

  it("links home without a root-absolute path", () => {
    const brand = doc.querySelector(".site-header-brand")?.getAttribute("href");
    expect(brand, "the explainer needs a link back home").toBeTruthy();
    expect(brand, `"${brand}" is root-absolute — it 404s under the Pages base path`).not.toMatch(
      /^\//,
    );
    expect(existsSync(resolve("dist/index.html"))).toBe(true);
  });
});

// The home page is the intro splash. Its whole job is to be clickable and then
// hand off, so what's worth holding is that the trigger exists, the copy is
// exact, and every route and asset it names actually shipped — the failure mode
// that passes locally and 404s under the Pages base path.
describe("built page: the intro splash", () => {
  const base = (astroConfig.base ?? "/").replace(/\/$/, "");
  const doc = new JSDOM(readFileSync(resolve("dist/index.html"), "utf8")).window.document;

  // Holds the contract rather than the wording, which has already changed once:
  // a real button, a visible label set one line per span, a name that doesn't run
  // the lines together, and a hint that actually resolves.
  it("renders a trigger the visitor can click, labelled one line per span", () => {
    const trigger = doc.querySelector('[data-testid="vanish-trigger"]');
    expect(trigger, "the intro needs a trigger to click").toBeTruthy();
    expect(trigger?.tagName).toBe("BUTTON");

    const lines = [...(trigger?.querySelectorAll("span") ?? [])].map((span) =>
      span.textContent?.trim(),
    );
    expect(lines.length, "the label should be one span per rendered line").toBeGreaterThan(0);
    for (const line of lines) {
      expect(line?.length, "a label line is empty").toBeGreaterThan(0);
    }

    // The spans are display:block, so losing the whitespace between them would
    // look identical while making a screen reader announce "clickme".
    const accessibleName = trigger?.textContent?.replace(/\s+/g, " ").trim();
    expect(accessibleName, "the label lines run together in the accessible name").toBe(
      lines.join(" "),
    );

    const hintId = trigger?.getAttribute("aria-describedby");
    if (hintId) {
      expect(doc.getElementById(hintId), `aria-describedby="${hintId}" points at nothing`).toBeTruthy();
    }
  });

  it("renders the burst layer and the line the sequence ends on", () => {
    expect(doc.querySelector('[data-testid="intro-boom"]')).toBeTruthy();
    expect(doc.querySelector('[data-testid="intro-line"]')?.textContent?.trim()).toBe(
      "When humans vanish in a second",
    );
  });

  it("offers a skip route to a page that was actually built", () => {
    const href = doc.querySelector('[data-testid="intro-skip"]')?.getAttribute("href");
    expect(href, "the intro needs a skip link so nobody is trapped in it").toBeTruthy();
    expect(href, `"${href}" is root-absolute — it 404s under the Pages base path`).not.toMatch(
      /^\//,
    );
    expect(existsSync(resolve("dist", (href ?? "").replace(/^\.\//, "")))).toBe(true);
  });

  it("points every image at a file that shipped under the base path", () => {
    const urls = [
      ...[...doc.querySelectorAll("source")].map((el) => el.getAttribute("srcset")),
      ...[...doc.querySelectorAll("img")].map((el) => el.getAttribute("src")),
    ].filter((url): url is string => Boolean(url));

    expect(urls.length, "the splash renders no images at all").toBeGreaterThan(0);
    for (const url of urls) {
      expect(url, `"${url}" is not served from under the base path`).toMatch(
        new RegExp(`^${base}/`),
      );
      const relativePath = url.slice(base.length + 1);
      expect(
        existsSync(resolve("dist", relativePath)),
        `${url} points at dist/${relativePath}, which was not built`,
      ).toBe(true);
    }
  });
});
