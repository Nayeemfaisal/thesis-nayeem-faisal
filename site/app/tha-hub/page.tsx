"use client";

import { FormEvent, useMemo, useState } from "react";

const verifiedAnswers = [
  { tag: "Exams", question: "Where can I find official examination dates?", answer: "Use the THA examination schedule and your faculty portal as the authoritative source. Always confirm changes in the official system.", source: "THA study portal" },
  { tag: "Study", question: "How should a student contact a professor?", answer: "Use the professor’s official THA contact details, include your programme and module, and write a concise question with the relevant context.", source: "Professor-reviewed guidance" },
  { tag: "Support", question: "Can this hub make academic decisions?", answer: "No. The prototype organises information and routes questions. Final academic and administrative decisions remain with authorised THA staff.", source: "Prototype governance rule" },
];

type QueueItem = { id: number; question: string; status: "Awaiting review" | "Approved" };

export default function ThaHub() {
  const [query, setQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([
    { id: 1, question: "Can I receive an answer when the examination plan changes?", status: "Awaiting review" },
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
    setQueue((items) => [...items, { id: Date.now(), question: clean, status: "Awaiting review" }]);
    setQuestion("");
    setNotice("Question added to the professor-review queue.");
  }

  function approve(id: number) {
    setQueue((items) => items.map((item) => item.id === id ? { ...item, status: "Approved" } : item));
  }

  return (
    <main className="hubShell">
      <div className="hubGlow hubGlowOne"/><div className="hubGlow hubGlowTwo"/>
      <header className="hubTopbar">
        <a href="/" className="hubBrand"><span>NF</span><strong>THA Q&amp;A HUB</strong><i>CONCEPT / LIVE DEMO</i></a>
        <nav aria-label="Hub navigation"><a href="#knowledge">Knowledge</a><a href="#workflow">Workflow</a><a href="/">Battery thesis ↗</a></nav>
      </header>

      <section className="hubHero">
        <div>
          <p className="hubKicker"><span/> STUDENT SUPPORT · HUMAN REVIEW · SOURCE FIRST</p>
          <h1>One place to ask.<br/><em>One source of truth.</em></h1>
          <p className="hubLead">A working software prototype for finding verified university guidance, submitting unanswered questions, and keeping professors in control of every published response.</p>
          <div className="hubActions"><a href="#demo">Try the live demo</a><a href="#workflow">See how it works</a></div>
        </div>
        <aside className="hubPulseCard">
          <div className="hubPulseTop"><span>KNOWLEDGE SIGNAL</span><b>LIVE</b></div>
          <div className="hubOrb"><i/><span>3</span><small>verified answers</small></div>
          <div className="hubMiniStats"><span><b>{queue.filter(i=>i.status === "Awaiting review").length}</b> awaiting review</span><span><b>{queue.filter(i=>i.status === "Approved").length}</b> approved</span></div>
        </aside>
      </section>

      <section className="hubDemo" id="demo">
        <div className="hubDemoHead"><div><p>INTERACTIVE PROTOTYPE</p><h2>Test the workflow.</h2></div><div className="hubMode" role="group" aria-label="Choose demo role"><button className={mode === "student" ? "active" : ""} onClick={()=>setMode("student")}>Student view</button><button className={mode === "professor" ? "active" : ""} onClick={()=>setMode("professor")}>Professor review</button></div></div>
        {mode === "student" ? <div className="hubStudent">
          <section className="hubSearch" id="knowledge"><label htmlFor="hub-search">Search verified knowledge</label><div><input id="hub-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try ‘exam’, ‘contact’ or ‘decision’"/><kbd>{results.length} matches</kbd></div></section>
          <div className="hubAnswerGrid">{results.map((item)=><article key={item.question}><span>{item.tag}</span><h3>{item.question}</h3><p>{item.answer}</p><small>✓ {item.source}</small></article>)}</div>
          <form className="hubAsk" onSubmit={submitQuestion}><div><span>NOT FOUND?</span><h3>Send a question for human review.</h3><p>The demo adds your question to the professor queue on this device. It does not send personal data or contact THA.</p></div><div><textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Write a clear university question…" aria-label="Question for review"/><button type="submit">Add to review queue →</button>{notice && <output>{notice}</output>}</div></form>
        </div> : <div className="hubQueue">
          <div className="hubQueueHead"><span>REVIEW QUEUE</span><p>Answers remain unpublished until a professor or authorised staff member approves them.</p></div>
          {queue.length ? queue.map(item=><article key={item.id}><div><span className={item.status === "Approved" ? "approved" : "waiting"}>{item.status}</span><h3>{item.question}</h3><p>Suggested action: verify against an official THA source, edit the response, then approve.</p></div>{item.status === "Awaiting review" ? <button onClick={()=>approve(item.id)}>Mark reviewed</button> : <b>✓ Reviewed</b>}</article>) : <p>No questions in the queue.</p>}
        </div>}
      </section>

      <section className="hubWorkflow" id="workflow"><p>CONTROLLED INFORMATION FLOW</p><h2>Fast for students.<br/>Accountable for staff.</h2><div>{[["01","Search","Students check a concise, verified knowledge base first."],["02","Ask","Unanswered questions enter a transparent review queue."],["03","Review","A professor validates the source and edits the response."],["04","Publish","Only approved guidance becomes reusable knowledge."]].map(([n,t,c])=><article key={n}><b>{n}</b><span>{t}</span><p>{c}</p></article>)}</div></section>
      <section className="hubBoundary"><b>PROTOTYPE STATUS</b><p>Designed and developed by Nayeem Faisal as an independent software concept. This demonstration is not an official THA system, does not use live university data, and does not replace authorised academic advice.</p><a href="https://www.tha.de/" target="_blank" rel="noreferrer">Visit official THA website ↗</a></section>
      <footer className="hubFooter"><span>THA Q&amp;A HUB / NAYEEM FAISAL</span><a href="/">Return to EV Battery Intelligence →</a></footer>
    </main>
  );
}
