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
  assert.match(html, /<title>Nayeem Faisal – Daten, Intelligenz und Ideen<\/title>/i);
  assert.match(html, /Daten,/);
  assert.match(html, /Meine Projekte entdecken/);
  assert.match(html, /RUL-Prognose für Lithium-Batterien/);
  assert.match(html, /TuTime/);
  assert.match(html, /etwas[\s\S]*Sinnvolles entwickeln/);
  assert.match(html, /mailto:nayeem\.faisal@tha\.de/);
  assert.doesNotMatch(html, /CV — add document|Email — add address/);
  assert.match(html, /property="og:image" content="https:\/\/nayeemfaisal\.com\/og\.jpg"/);
  assert.match(html, /class="nf-logo"[^>]*>[\s\S]*?nayeem-logo\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("keeps the thesis and software routes available", async () => {
  const [thesis, hub, internship] = await Promise.all([render("/thesis"), render("/tha-hub"), render("/internship")]);
  assert.equal(thesis.status, 200);
  assert.equal(hub.status, 200);
  assert.equal(internship.status, 200);
  const thesisHtml = await thesis.text();
  assert.match(thesisHtml, /Entwicklung und Bewertung von Machine-Learning-Modellen/);
  assert.match(thesisHtml, /87-seitige/);
  assert.match(thesisHtml, /WISSENSINDEX/);
  assert.match(thesisHtml, /Eine zusammenhängende Nachweiskette/);
  assert.match(thesisHtml, /WEG ZU STÄRKERER AKADEMISCHER VALIDIERUNG/);
  assert.match(thesisHtml, /empfohlene Erweiterungen und keine bereits erreichten Ergebnisse/);
  assert.match(thesisHtml, /Leckagefreie Tests auf Batterieebene/);
  assert.match(thesisHtml, /Lesen wie in einem Buch/);
  assert.match(thesisHtml, /thesis-book-cover\.png/);
  assert.match(thesisHtml, /Prof. Dr. Fiorentino Valerio Conte/);
  assert.doesNotMatch(thesisHtml, /Jana Görmer-Redding/);
  assert.doesNotMatch(thesisHtml, /prof-jana-goermer-redding\.webp/);
  assert.match(thesisHtml, /ALLEINIGER HAUPTBETREUER/);
  assert.match(thesisHtml, /nayeem-faisal-thesis-portrait-2026\.png/);
  assert.match(thesisHtml, /Prof. Dr. Stephan Zimmermann/);
  assert.match(thesisHtml, /ERGEBNISSE DER FORSCHUNG/);
  assert.match(thesisHtml, /ERGEBNISSE DER ARBEIT/);
  assert.match(thesisHtml, /0\.012 → 0\.236/);
  assert.match(thesisHtml, /correlation-matrix-comparison\.png/);
  assert.match(thesisHtml, /actual-vs-predicted-rul\.png/);
  const hubHtml = await hub.text();
  assert.match(hubHtml, /THA Q&amp;A Hub/);
  assert.match(hubHtml, /Geprüftes Wissen durchsuchen/);
  assert.match(hubHtml, /Zur Prüfwarteschlange hinzufügen/);
  assert.match(await internship.text(), /Lernen durch Entwicklung/);
});

test("renders the battery RUL CSV prototype", async () => {
  const response = await render("/thesis/prototype");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Batterie-RUL-Labor/);
  assert.match(html, /battery-rul-lab-logo\.png/);
  assert.match(html, /Bis zu 512 GB Dateigröße · Analyse von 100\.000 Zeilen/);
  assert.match(html, /Hochladen\. Prüfen\. Auswerten\./);
  assert.match(html, /UNIVERSELLER CSV-ANALYSATOR/);
  assert.match(html, /Jede CSV-Datei erhält ein Datenqualitätsprofil/);
  assert.match(html, /HANDBUCH FÜR EXTERNE TESTPERSONEN/);
  assert.match(html, /Unabhängige Prüfung von Batteriedaten/);
  assert.match(html, /AUSGABE A/);
  assert.match(html, /AUSGABE B/);
  assert.match(html, /AUSGABE C/);
  assert.match(html, /CSV-Datensatz hier ablegen/);
  assert.match(html, /maximal 512 GB · blockweise Analyse von bis zu 100\.000 Zeilen/);
  assert.match(html, /Verarbeitung[\s\S]*Im Browser/);
  assert.match(html, /Forschungsprototyp/);
  assert.match(html, /kein zertifiziertes Batteriemanagementsystem/i);
});
