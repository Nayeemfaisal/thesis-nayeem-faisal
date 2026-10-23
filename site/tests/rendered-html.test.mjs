import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the portfolio with complete metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Nayeem Faisal — Data, Intelligence &amp; Ideas<\/title>/i);
  assert.match(html, /Connecting data,/);
  assert.match(html, /Explore my work/);
  assert.match(html, /EV Battery Intelligence/);
  assert.match(html, /TuTime/);
  assert.match(html, /Let&#x27;s build/);
  assert.match(html, /property="og:image" content="https:\/\/nayeemfaisal\.com\/og\.png"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("keeps the thesis and software routes available", async () => {
  const [thesis, hub] = await Promise.all([render("/thesis"), render("/tha-hub")]);
  assert.equal(thesis.status, 200);
  assert.equal(hub.status, 200);
  assert.match(await thesis.text(), /Engineering the/);
  assert.match(await hub.text(), /THA Q&amp;A Hub/);
});
