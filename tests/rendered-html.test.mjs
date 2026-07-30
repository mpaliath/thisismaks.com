import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);

test("exports the introduction homepage as standalone HTML", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");

  assert.match(html, /<title>Maks — Notes on design and technology<\/title>/i);
  assert.match(html, /An open reading circle/);
  assert.match(html, /This is me/);
  assert.match(html, /Reveal more/);
  assert.match(html, /Progress stays in this browser/);
  assert.ok(
    html.indexOf("This is me") <
      html.indexOf("A field guide to creative momentum"),
  );
  assert.doesNotMatch(html, /vinext|wrangler|codex-preview|chatgpt-auth/i);
});

test("generates one static article page for every Markdown post", async () => {
  const expectedPosts = [
    "building-a-calmer-internet",
    "what-i-learned-shipping-small",
    "a-field-guide-to-creative-momentum",
    "this-is-me",
  ];

  for (const slug of expectedPosts) {
    const html = await readFile(
      new URL(`journal/${slug}/index.html`, outputRoot),
      "utf8",
    );

    assert.match(html, /All notes/);
    assert.match(html, /Back to the journal/);
    assert.doesNotMatch(html, /^---$/m);
  }
});

test("includes Azure configuration and social assets", async () => {
  const config = JSON.parse(
    await readFile(new URL("staticwebapp.config.json", outputRoot), "utf8"),
  );

  assert.deepEqual(config.routes, [
    { route: "/*", allowedRoles: ["anonymous"] },
  ]);
  assert.equal(config.globalHeaders["X-Content-Type-Options"], "nosniff");

  await Promise.all([
    access(new URL("og.png", outputRoot)),
    access(new URL("favicon.svg", outputRoot)),
    access(new URL("_next/", outputRoot)),
  ]);
});
