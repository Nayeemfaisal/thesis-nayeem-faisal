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
    if (!response?.ok) { setState("error"); setNotice(result.error || "The message could not be sent. Please try again."); return; }
    if (result.url) window.open(result.url, "_blank", "noopener,noreferrer");
    setState("sent"); setNotice(result.delivery === "whatsapp" ? "WhatsApp is ready with your message—press Send there to notify Nayeem." : "Thank you — your question was sent to Nayeem on WhatsApp."); setQuestion("");
  }

  return <section className="nf-ask" id="ask">
    <div className="nf-askIntro"><p className="nf-label">04 / ASK NAYEEM</p><h2>Start a real<br/><em>conversation.</em></h2><p>Ask about my thesis, software concepts, studies or a possible collaboration. Your message is prepared here and sent securely through WhatsApp.</p></div>
    <form onSubmit={submit} className="nf-askForm">
      <label><span>Your name</span><input value={name} onChange={(event)=>setName(event.target.value)} placeholder="How should I address you?" autoComplete="name"/></label>
      <label><span>Topic</span><select value={topic} onChange={(event)=>setTopic(event.target.value)}><option>Portfolio</option><option>Bachelor&apos;s thesis</option><option>Research collaboration</option><option>Software project</option><option>Other</option></select></label>
      <label className="nf-hp" aria-hidden="true"><span>Website</span><input value={website} onChange={(event)=>setWebsite(event.target.value)} tabIndex={-1} autoComplete="off"/></label>
      <label className="nf-askQuestion"><span>Your question</span><textarea value={question} onChange={(event)=>setQuestion(event.target.value.slice(0, 600))} placeholder="What would you like to discuss?" required/><small>{question.length} / 600</small></label>
      <button type="submit" disabled={state === "sending" || !question.trim()}>{state === "sending" ? "Sending…" : "Send to Nayeem on WhatsApp ↗"}</button>
      <p className={state === "error" ? "is-error" : ""} role="status">{notice || "Your message is prepared privately and delivered through WhatsApp."}</p>
    </form>
  </section>;
}
