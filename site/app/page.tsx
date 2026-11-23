"use client";

import { useCallback, useEffect, useState } from "react";
import PortfolioScene from "./PortfolioScene";
import AskNayeem from "./AskNayeem";

const interests = [
  { label: "Softwareentwicklung", href: "/tha-hub", detail: "Den funktionsfähigen THA-Q&A-Softwareprototyp erkunden" },
  { label: "Datenengineering", href: "/thesis#research", detail: "Daten- und Validierungsablauf der Thesis erkunden" },
  { label: "Künstliche Intelligenz", href: "/thesis#findings", detail: "Vergleich der LSTM- und XGBoost-Modelle ansehen" },
  { label: "Forschung", href: "/thesis#research", detail: "Nachweis- und Reproduzierbarkeitsmethode lesen" },
];
const linkedin = "https://de.linkedin.com/in/nayeem-faisal-721619296";
const github = "https://github.com/Nayeemfaisal";
const email = "nayeem.faisal@tha.de";

export default function Home() {
  const [ready, setReady] = useState(false);
  const sceneReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = [...document.querySelectorAll<HTMLElement>(".nf-reveal")];
    root.classList.add("nf-motion-ready");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10%", threshold: .08 });
    revealElements.forEach((element) => observer.observe(element));

    let frame = 0;
    const updateScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        root.style.setProperty("--nf-scroll", `${max > 0 ? scrollY / max : 0}`);
        frame = 0;
      });
    };
    const updatePointer = (event: PointerEvent) => {
      if (reducedMotion) return;
      root.style.setProperty("--nf-pointer-x", `${event.clientX}px`);
      root.style.setProperty("--nf-pointer-y", `${event.clientY}px`);
    };
    updateScroll();
    addEventListener("scroll", updateScroll, { passive: true });
    addEventListener("resize", updateScroll, { passive: true });
    addEventListener("pointermove", updatePointer, { passive: true });
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      removeEventListener("scroll", updateScroll);
      removeEventListener("resize", updateScroll);
      removeEventListener("pointermove", updatePointer);
      root.classList.remove("nf-motion-ready");
    };
  }, []);

  return <main className="nf-site">
    <div className="nf-progress" aria-hidden="true" />
    <div className="nf-cursorAura" aria-hidden="true" />
    <div className={`nf-loader ${ready ? "is-ready" : ""}`} aria-hidden={ready}><img src="/nayeem-logo.png" alt=""/><i/><small>Website wird vorbereitet</small></div>
    <header className="nf-nav">
      <a href="#top" className="nf-logo" aria-label="Startseite von Nayeem Faisal"><img src="/nayeem-logo.png" alt=""/><span><b>NAYEEM</b><small>FAISAL</small></span></a>
      <nav aria-label="Hauptnavigation"><a href="#about">Über mich</a><a href="#work">Projekte</a><a href="#capabilities">Kompetenzen</a><a href="/internship">Erfahrung</a></nav>
      <a href="#ask" className="nf-navContact">Nayeem fragen</a>
    </header>

    <section className="nf-hero" id="top">
      <PortfolioScene onReady={sceneReady}/>
      <div className="nf-heroMeta"><span>PORTFOLIO / 2026</span><span>AUGSBURG, DEUTSCHLAND</span></div>
      <div className="nf-heroCopy"><p>Nayeem Faisal</p><h1><span>Daten,</span><br/><em>Intelligenz</em><br/><span>und Ideen verbinden.</span></h1><a href="#work">Meine Projekte entdecken <span>↓</span></a></div>
      <div className="nf-heroMark" aria-hidden="true"><img src="/nayeem-logo.png" alt=""/><span>PERSÖNLICHES ZEICHEN</span><small>DATEN · INTELLIGENZ · SYSTEME</small></div>
      <p className="nf-scrollNote">SCROLLEN, UM DAS SYSTEM ZU FORMEN</p>
    </section>

    <section className="nf-about nf-reveal" id="about">
      <p className="nf-label">01 / ÜBER MICH</p>
      <div><h2>Ein angehender Technologieexperte an der Schnittstelle von Systemen, Informationen und Menschen.</h2><p>Ich studiere Internationale Wirtschaftsinformatik an der Technischen Hochschule Augsburg. Meine Interessen umfassen Softwareentwicklung, Datenpipelines, künstliche Intelligenz und Forschung – mit dem Ziel, komplexe Informationen in nützliche und verständliche Systeme zu überführen.</p></div>
    </section>

    <div className="nf-marquee" aria-hidden="true"><div><span>DATEN GEBEN RICHTUNG</span><i>✦</i><span>FORSCHUNG SCHAFFT NACHWEISE</span><i>✦</i><span>IDEEN WERDEN SYSTEME</span><i>✦</i><span>DATEN GEBEN RICHTUNG</span><i>✦</i><span>FORSCHUNG SCHAFFT NACHWEISE</span><i>✦</i><span>IDEEN WERDEN SYSTEME</span><i>✦</i></div></div>

    <section className="nf-work" id="work">
      <header className="nf-reveal"><p className="nf-label">02 / AUSGEWÄHLTE PROJEKTE</p><h2>Ideen werden<br/>anwendbar.</h2></header>
      <article className="nf-project nf-projectBlue nf-reveal" data-link="available">
        <div className="nf-projectIndex">01</div><div className="nf-projectCopy"><p>ENERGIEPROGNOSE · BACHELORARBEIT</p><h3>RUL-Prognose für Lithium-Batterien</h3><span>Eigenständige Forschung mit realen Batteriedaten, einem synthetischen Datensatz mit 100.000 Zeilen, explorativer Analyse sowie vergleichender LSTM- und XGBoost-Modellierung.</span><a href="/thesis">Finale Thesis erkunden</a></div>
        <div className="nf-projectVisual" aria-hidden="true"><i/><i/><i/><b>100k</b><small>SYNTHETISCHE ZEILEN / RUL-FORSCHUNG</small></div>
      </article>
      <article className="nf-project nf-projectLight nf-reveal">
        <div className="nf-projectIndex">02</div><div className="nf-projectCopy"><p>PRODUKTKONZEPT · ZEITERFASSUNG</p><h3>TuTime</h3><span>Ein Zeiterfassungsprojekt für Tutorien mit klaren Aktivitätsnachweisen, nutzbaren Arbeitsabläufen und einer verlässlichen Informationsstruktur. Weitere öffentliche Dokumentation wird vorbereitet.</span><span className="nf-unavailable">ÖFFENTLICHER LINK – DEMNÄCHST</span></div>
        <div className="nf-projectVisual nf-time" aria-hidden="true"><i/><i/><i/><b>08:42</b><small>TUTORIUM / AKTIV</small></div>
      </article>
      <article className="nf-project nf-projectDark nf-reveal" data-link="available">
        <div className="nf-projectIndex">03</div><div className="nf-projectCopy"><p>FUNKTIONSFÄHIGE SOFTWARE · WISSENSSCHNITTSTELLE</p><h3>THA Q&amp;A Hub</h3><span>Ein unabhängiger Unterstützungsprototyp für Studierende mit geprüfter Wissenssuche, transparenter Überprüfung und menschlicher Freigabe.</span><a href="/tha-hub">Funktionsfähige Oberfläche öffnen</a></div>
        <div className="nf-projectVisual nf-nodes" aria-hidden="true"><i/><i/><i/><i/><b>F/A</b><small>MENSCHLICHE KONTROLLE</small></div>
      </article>
    </section>

    <section className="nf-capabilities nf-reveal" id="capabilities">
      <p className="nf-label">03 / INTERESSEN &amp; KOMPETENZEN</p>
      <div className="nf-capList">{interests.map((item, index)=><a href={item.href} key={item.label} aria-label={`${item.label}: ${item.detail}`}><span>0{index+1}</span><h3>{item.label}</h3><small>{item.detail}</small><i>↗</i></a>)}</div>
      <p className="nf-capNote">Ich entwickle diese Kompetenzen durch mein Studium, eigenständige Projekte und angewandte Forschung. Sie beschreiben meine fachliche Richtung und keine überhöhten Behauptungen vollständiger Beherrschung.</p>
    </section>

    <AskNayeem />

    <section className="nf-contact nf-reveal" id="contact">
      <p className="nf-label">05 / KONTAKT</p><h2>Lassen Sie uns<br/><em><span>etwas</span> <span>Sinnvolles entwickeln.</span></em></h2>
      <div className="nf-contactGrid"><div><span>VERNETZEN</span><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={github} target="_blank" rel="noreferrer">GitHub</a></div><div><span>DIREKT</span><a className="nf-email" href={`mailto:${email}`}>{email}</a></div><div><span>STANDORT</span><p>Augsburg, Deutschland</p><p>Offen für einen fachlichen Austausch</p></div></div>
      <a className="nf-emailCta" href={`mailto:${email}`}><span>GESPRÄCH BEGINNEN</span><b>↗</b></a>
      <a className="nf-portrait" href={linkedin} target="_blank" rel="noreferrer"><img src="/nayeem-brand-portrait.webp" alt="Nayeem Faisal"/><span>PROFIL ANSEHEN</span></a>
    </section>
    <footer className="nf-footer"><a href="#top" className="nf-footerBrand"><img src="/nayeem-logo.png" alt=""/>NAYEEM FAISAL</a><span>INTERNATIONALE WIRTSCHAFTSINFORMATIK</span><span>© 2026</span></footer>
  </main>;
}
