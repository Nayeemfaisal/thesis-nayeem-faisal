"use client";

import { FormEvent, useMemo, useState } from "react";

const verifiedAnswers = [
  { tag: "Prüfungen", question: "Wo finde ich die offiziellen Prüfungstermine?", answer: "Verwenden Sie den THA-Prüfungsplan und das Portal Ihrer Fakultät als verbindliche Quellen. Prüfen Sie Änderungen immer im offiziellen System.", source: "THA-Studienportal" },
  { tag: "Studium", question: "Wie sollte eine Studentin oder ein Student eine Professorin oder einen Professor kontaktieren?", answer: "Verwenden Sie die offiziellen THA-Kontaktdaten, nennen Sie Studiengang und Modul und formulieren Sie eine kurze Frage mit dem erforderlichen Kontext.", source: "Von Lehrenden geprüfter Hinweis" },
  { tag: "Unterstützung", question: "Kann dieser Hub akademische Entscheidungen treffen?", answer: "Nein. Der Prototyp organisiert Informationen und leitet Fragen weiter. Endgültige akademische und administrative Entscheidungen verbleiben bei autorisierten THA-Mitarbeitenden.", source: "Governance-Regel des Prototyps" },
];

type QueueItem = { id: number; question: string; status: "Prüfung ausstehend" | "Freigegeben" };

export default function ThaHub() {
  const [query, setQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([
    { id: 1, question: "Kann ich eine Antwort erhalten, wenn sich der Prüfungsplan ändert?", status: "Prüfung ausstehend" },
  ]);
  const [mode, setMode] = useState<"student" | "professor">("student");
  const [notice, setNotice] = useState("");

  const results = useMemo(() => verifiedAnswers.filter((item) =>
    `${item.tag} ${item.question} ${item.answer}`.toLowerCase().includes(query.toLowerCase())
  ), [query]);

  function submitQuestion(event: FormEvent) {
    event.preventDefault();
    const clean = question.trim();
    if (!clean) return;
    setQueue((items) => [...items, { id: Date.now(), question: clean, status: "Prüfung ausstehend" }]);
    setQuestion("");
    setNotice("Die Frage wurde der Prüfwarteschlange hinzugefügt.");
  }

  function approve(id: number) {
    setQueue((items) => items.map((item) => item.id === id ? { ...item, status: "Freigegeben" } : item));
  }

  return (
    <main className="hubShell">
      <div className="hubGlow hubGlowOne"/><div className="hubGlow hubGlowTwo"/>
      <header className="hubTopbar">
        <a href="/" className="hubBrand"><span>NF</span><strong>THA FRAGEN-UND-ANTWORTEN-HUB</strong><i>KONZEPT / VORFÜHRUNG</i></a>
        <nav aria-label="Navigation des Hubs"><a href="#knowledge">Wissen</a><a href="#workflow">Ablauf</a><a href="/thesis">Batterie-Bachelorarbeit</a></nav>
      </header>

      <section className="hubHero">
        <div>
          <p className="hubKicker"><span/> STUDIERENDENHILFE · MENSCHLICHE PRÜFUNG · QUELLEN ZUERST</p>
          <h1>Ein Ort für Fragen.<br/><em>Eine verlässliche Wissensquelle.</em></h1>
          <p className="hubLead">Ein funktionsfähiger Softwareprototyp zum Finden geprüfter Hochschulhinweise, Einreichen unbeantworteter Fragen und zur Kontrolle aller veröffentlichten Antworten durch Lehrende.</p>
          <div className="hubActions"><a href="#demo">Vorführung testen</a><a href="#workflow">Funktionsweise ansehen</a></div>
        </div>
        <aside className="hubPulseCard">
          <div className="hubPulseTop"><span>WISSENSSIGNAL</span><b>AKTIV</b></div>
          <div className="hubOrb"><i/><span>3</span><small>geprüfte Antworten</small></div>
          <div className="hubMiniStats"><span><b>{queue.filter(i=>i.status === "Prüfung ausstehend").length}</b> ausstehend</span><span><b>{queue.filter(i=>i.status === "Freigegeben").length}</b> freigegeben</span></div>
        </aside>
      </section>

      <section className="hubDemo" id="demo">
        <div className="hubDemoHead"><div><p>INTERAKTIVER PROTOTYP</p><h2>Arbeitsablauf testen.</h2></div><div className="hubMode" role="group" aria-label="Rolle für die Demo auswählen"><button className={mode === "student" ? "active" : ""} onClick={()=>setMode("student")}>Studierendenansicht</button><button className={mode === "professor" ? "active" : ""} onClick={()=>setMode("professor")}>Prüfansicht</button></div></div>
        {mode === "student" ? <div className="hubStudent">
          <section className="hubSearch" id="knowledge"><label htmlFor="hub-search">Geprüftes Wissen durchsuchen</label><div><input id="hub-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Zum Beispiel ‚Prüfung‘, ‚Kontakt‘ oder ‚Entscheidung‘"/><kbd>{results.length} Treffer</kbd></div></section>
          <div className="hubAnswerGrid">{results.map((item)=><article key={item.question}><span>{item.tag}</span><h3>{item.question}</h3><p>{item.answer}</p><small>✓ {item.source}</small></article>)}</div>
          <form className="hubAsk" onSubmit={submitQuestion}><div><span>NICHT GEFUNDEN?</span><h3>Frage zur menschlichen Prüfung einreichen.</h3><p>Die Demo fügt Ihre Frage auf diesem Gerät der Prüfwarteschlange hinzu. Sie sendet keine persönlichen Daten und kontaktiert die THA nicht.</p></div><div><textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Formulieren Sie eine klare Hochschulfrage …" aria-label="Frage zur Prüfung"/><button type="submit">Zur Prüfwarteschlange hinzufügen</button>{notice && <output>{notice}</output>}</div></form>
        </div> : <div className="hubQueue">
          <div className="hubQueueHead"><span>PRÜFWARTESCHLANGE</span><p>Antworten bleiben unveröffentlicht, bis sie von einer Professorin, einem Professor oder autorisierten Mitarbeitenden freigegeben werden.</p></div>
          {queue.length ? queue.map(item=><article key={item.id}><div><span className={item.status === "Freigegeben" ? "approved" : "waiting"}>{item.status}</span><h3>{item.question}</h3><p>Empfohlene Aktion: mit einer offiziellen THA-Quelle abgleichen, Antwort bearbeiten und anschließend freigeben.</p></div>{item.status === "Prüfung ausstehend" ? <button onClick={()=>approve(item.id)}>Als geprüft markieren</button> : <b>✓ Geprüft</b>}</article>) : <p>Keine Fragen in der Warteschlange.</p>}
        </div>}
      </section>

      <section className="hubWorkflow" id="workflow"><p>KONTROLLIERTER INFORMATIONSFLUSS</p><h2>Schnell für Studierende.<br/>Nachvollziehbar für Mitarbeitende.</h2><div>{[["01","Suchen","Studierende prüfen zunächst eine kompakte, verifizierte Wissensbasis."],["02","Fragen","Unbeantwortete Fragen gelangen in eine transparente Prüfwarteschlange."],["03","Prüfen","Eine Lehrperson validiert die Quelle und bearbeitet die Antwort."],["04","Veröffentlichen","Nur freigegebene Hinweise werden zu wiederverwendbarem Wissen."]].map(([n,t,c])=><article key={n}><b>{n}</b><span>{t}</span><p>{c}</p></article>)}</div></section>
      <section className="hubBoundary"><b>STATUS DES PROTOTYPS</b><p>Von Nayeem Faisal als unabhängiges Softwarekonzept gestaltet und entwickelt. Diese Demonstration ist kein offizielles THA-System, verwendet keine Live-Hochschuldaten und ersetzt keine autorisierte akademische Beratung.</p><a href="https://www.tha.de/" target="_blank" rel="noreferrer">Offizielle THA-Website besuchen</a></section>
      <footer className="hubFooter"><span>THA Q&amp;A HUB / NAYEEM FAISAL</span><a href="/">Zurück zum Portfolio</a></footer>
    </main>
  );
}
