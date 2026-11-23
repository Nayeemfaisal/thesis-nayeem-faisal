"use client";

import { FormEvent, useState } from "react";

export default function AskNayeem() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("Portfolio");
  const [question, setQuestion] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || state === "sending") return;
    setState("sending"); setNotice("");
    const response = await fetch("/api/contact", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name, topic, question, website}) }).catch(()=>null);
    const result = response ? await response.json().catch(()=>({})) : {};
    if (!response?.ok) { setState("error"); setNotice(result.error || "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut."); return; }
    if (result.url) window.open(result.url, "_blank", "noopener,noreferrer");
    setState("sent"); setNotice(result.delivery === "whatsapp" ? "WhatsApp wurde mit Ihrer Nachricht geöffnet. Drücken Sie dort auf Senden, um Nayeem zu benachrichtigen." : "Vielen Dank – Ihre Frage wurde Nayeem über WhatsApp gesendet."); setQuestion("");
  }

  return <section className="nf-ask" id="ask">
    <div className="nf-askIntro"><p className="nf-label">04 / NAYEEM FRAGEN</p><h2>Beginnen Sie einen echten<br/><em>Austausch.</em></h2><p>Fragen Sie mich zu meiner Thesis, Softwarekonzepten, meinem Studium oder einer möglichen Zusammenarbeit. Ihre Nachricht wird hier vorbereitet und sicher über WhatsApp gesendet.</p></div>
    <form onSubmit={submit} className="nf-askForm">
      <label><span>Ihr Name</span><input value={name} onChange={(event)=>setName(event.target.value)} placeholder="Wie darf ich Sie ansprechen?" autoComplete="name"/></label>
      <label><span>Thema</span><select value={topic} onChange={(event)=>setTopic(event.target.value)}><option>Portfolio</option><option>Bachelorarbeit</option><option>Forschungszusammenarbeit</option><option>Softwareprojekt</option><option>Sonstiges</option></select></label>
      <label className="nf-hp" aria-hidden="true"><span>Website</span><input value={website} onChange={(event)=>setWebsite(event.target.value)} tabIndex={-1} autoComplete="off"/></label>
      <label className="nf-askQuestion"><span>Ihre Frage</span><textarea value={question} onChange={(event)=>setQuestion(event.target.value.slice(0, 600))} placeholder="Worüber möchten Sie sprechen?" required/><small>{question.length} / 600</small></label>
      <button type="submit" disabled={state === "sending" || !question.trim()}>{state === "sending" ? "Wird gesendet…" : "Über WhatsApp an Nayeem senden"}</button>
      <p className={state === "error" ? "is-error" : ""} role="status">{notice || "Ihre Nachricht wird privat vorbereitet und über WhatsApp übermittelt."}</p>
    </form>
  </section>;
}
