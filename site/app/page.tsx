"use client";

import { useCallback, useEffect, useState } from "react";
import PortfolioScene from "./PortfolioScene";
import AskNayeem from "./AskNayeem";

const interests = [
  { label: "Software development", href: "/tha-hub", detail: "Explore the working THA Q&A software prototype" },
  { label: "Data engineering", href: "/thesis#research", detail: "Explore the thesis data and validation workflow" },
  { label: "Artificial intelligence", href: "/thesis#findings", detail: "See the LSTM and XGBoost model comparison" },
  { label: "Research", href: "/thesis#method", detail: "Read the evidence and reproducibility method" },
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
    <div className={`nf-loader ${ready ? "is-ready" : ""}`} aria-hidden={ready}><span>NF</span><i/><small>Preparing the experience</small></div>
    <header className="nf-nav">
      <a href="#top" className="nf-logo" aria-label="Nayeem Faisal home">NF<span>°</span></a>
      <nav aria-label="Primary navigation"><a href="#about">About</a><a href="#work">Work</a><a href="#capabilities">Capabilities</a><a href="/internship">Experience</a></nav>
      <a href="#ask" className="nf-navContact">Ask Nayeem ↗</a>
    </header>

    <section className="nf-hero" id="top">
      <PortfolioScene onReady={sceneReady}/>
      <div className="nf-heroMeta"><span>PORTFOLIO / 2026</span><span>AUGSBURG, GERMANY</span></div>
      <div className="nf-heroCopy"><p>Nayeem Faisal</p><h1><span>Connecting data,</span><br/><em>intelligence,</em><br/><span>and ideas.</span></h1><a href="#work">Explore my work <span>↓</span></a></div>
      <p className="nf-scrollNote">SCROLL TO FORM THE SYSTEM</p>
    </section>

    <section className="nf-about nf-reveal" id="about">
      <p className="nf-label">01 / ABOUT</p>
      <div><h2>An emerging technology professional working where systems, information and people meet.</h2><p>I study International Information Systems at Technische Hochschule Augsburg. My interests span software development, data pipelines, artificial intelligence and research—with a focus on turning complex information into useful, understandable systems.</p></div>
    </section>

    <div className="nf-marquee" aria-hidden="true"><div><span>DATA INTO DIRECTION</span><i>✦</i><span>RESEARCH INTO EVIDENCE</span><i>✦</i><span>IDEAS INTO SYSTEMS</span><i>✦</i><span>DATA INTO DIRECTION</span><i>✦</i><span>RESEARCH INTO EVIDENCE</span><i>✦</i><span>IDEAS INTO SYSTEMS</span><i>✦</i></div></div>

    <section className="nf-work" id="work">
      <header className="nf-reveal"><p className="nf-label">02 / SELECTED WORK</p><h2>Ideas made<br/>operational.</h2></header>
      <article className="nf-project nf-projectBlue nf-reveal" data-link="available">
        <div className="nf-projectIndex">01</div><div className="nf-projectCopy"><p>ENERGY FORECASTING · BACHELOR&apos;S THESIS</p><h3>Lithium Battery RUL Forecasting</h3><span>Original research combining real battery data, a 100,000-row synthetic dataset, exploratory analysis, and comparative LSTM and XGBoost modelling.</span><a href="/thesis">Explore the final thesis ↗</a></div>
        <div className="nf-projectVisual" aria-hidden="true"><i/><i/><i/><b>100k</b><small>SYNTHETIC ROWS / RUL RESEARCH</small></div>
      </article>
      <article className="nf-project nf-projectLight nf-reveal">
        <div className="nf-projectIndex">02</div><div className="nf-projectCopy"><p>PRODUCT CONCEPT · TIME TRACKING</p><h3>TuTime</h3><span>A tutor time-tracking project exploring clear activity records, usable workflows and reliable information structure. Further public documentation is being prepared.</span><span className="nf-unavailable">PUBLIC LINK — COMING SOON</span></div>
        <div className="nf-projectVisual nf-time" aria-hidden="true"><i/><i/><i/><b>08:42</b><small>TUTOR SESSION / ACTIVE</small></div>
      </article>
      <article className="nf-project nf-projectDark nf-reveal" data-link="available">
        <div className="nf-projectIndex">03</div><div className="nf-projectCopy"><p>WORKING SOFTWARE · KNOWLEDGE INTERFACE</p><h3>THA Q&amp;A Hub</h3><span>An independent student-support prototype that explores verified knowledge search, transparent review and human approval.</span><a href="/tha-hub">Open the working interface ↗</a></div>
        <div className="nf-projectVisual nf-nodes" aria-hidden="true"><i/><i/><i/><i/><b>Q/A</b><small>HUMAN-IN-THE-LOOP</small></div>
      </article>
    </section>

    <section className="nf-capabilities nf-reveal" id="capabilities">
      <p className="nf-label">03 / INTERESTS &amp; CAPABILITIES</p>
      <div className="nf-capList">{interests.map((item, index)=><a href={item.href} key={item.label} aria-label={`${item.label}: ${item.detail}`}><span>0{index+1}</span><h3>{item.label}</h3><small>{item.detail}</small><i>↗</i></a>)}</div>
      <p className="nf-capNote">I am developing these capabilities through university study, independent projects and applied research. They describe my direction—not inflated claims of mastery.</p>
    </section>

    <AskNayeem />

    <section className="nf-contact nf-reveal" id="contact">
      <p className="nf-label">05 / CONTACT</p><h2>Let&apos;s build<br/><em><span>something</span> <span>meaningful.</span></em></h2>
      <div className="nf-contactGrid"><div><span>CONNECT</span><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={github} target="_blank" rel="noreferrer">GitHub ↗</a></div><div><span>DIRECT</span><a className="nf-email" href={`mailto:${email}`}>{email} ↗</a></div><div><span>LOCATION</span><p>Augsburg, Germany</p><p>Open to meaningful conversations</p></div></div>
      <a className="nf-emailCta" href={`mailto:${email}`}><span>START A CONVERSATION</span><b>↗</b></a>
      <a className="nf-portrait" href={linkedin} target="_blank" rel="noreferrer"><img src="/nayeem-faisal-portrait-hd.png" alt="Nayeem Faisal"/><span>VIEW PROFILE ↗</span></a>
    </section>
    <footer className="nf-footer"><a href="#top">NAYEEM FAISAL</a><span>INTERNATIONAL INFORMATION SYSTEMS</span><span>© 2026</span></footer>
  </main>;
}
