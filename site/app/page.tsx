"use client";

import { useCallback, useEffect, useState } from "react";
import PortfolioScene from "./PortfolioScene";

const interests = ["Software development", "Data engineering", "Artificial intelligence", "Research"];
const linkedin = "https://de.linkedin.com/in/nayeem-faisal-721619296";
const github = "https://github.com/Nayeemfaisal";

export default function Home() {
  const [ready, setReady] = useState(false);
  const sceneReady = useCallback(() => setReady(true), []);
  useEffect(() => { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; }, []);

  return <main className="nf-site">
    <div className={`nf-loader ${ready ? "is-ready" : ""}`} aria-hidden={ready}><span>NF</span><i/><small>Preparing the experience</small></div>
    <header className="nf-nav">
      <a href="#top" className="nf-logo" aria-label="Nayeem Faisal home">NF<span>°</span></a>
      <nav aria-label="Primary navigation"><a href="#about">About</a><a href="#work">Work</a><a href="#capabilities">Capabilities</a></nav>
      <a href="#contact" className="nf-navContact">Let&apos;s talk ↗</a>
    </header>

    <section className="nf-hero" id="top">
      <PortfolioScene onReady={sceneReady}/>
      <div className="nf-heroMeta"><span>PORTFOLIO / 2026</span><span>AUGSBURG, GERMANY</span></div>
      <div className="nf-heroCopy"><p>Nayeem Faisal</p><h1>Connecting data,<br/><em>intelligence,</em><br/>and ideas.</h1><a href="#work">Explore my work <span>↓</span></a></div>
      <p className="nf-scrollNote">SCROLL TO FORM THE SYSTEM</p>
    </section>

    <section className="nf-about" id="about">
      <p className="nf-label">01 / ABOUT</p>
      <div><h2>An emerging technology professional working where systems, information and people meet.</h2><p>I study International Information Systems at Technische Hochschule Augsburg. My interests span software development, data pipelines, artificial intelligence and research—with a focus on turning complex information into useful, understandable systems.</p></div>
    </section>

    <section className="nf-work" id="work">
      <header><p className="nf-label">02 / SELECTED WORK</p><h2>Ideas made<br/>operational.</h2></header>
      <article className="nf-project nf-projectBlue">
        <div className="nf-projectIndex">01</div><div className="nf-projectCopy"><p>RESEARCH DATA PIPELINE · BACHELOR&apos;S THESIS</p><h3>EV Battery Intelligence</h3><span>A reproducible research catalogue and data pipeline for discovering, comparing and preparing open battery datasets for health, ageing, safety and modelling research.</span><a href="/thesis">Explore the thesis experience ↗</a></div>
        <div className="nf-projectVisual" aria-hidden="true"><i/><i/><i/><b>67</b><small>DATA SOURCES / RESEARCH MAP</small></div>
      </article>
      <article className="nf-project nf-projectLight">
        <div className="nf-projectIndex">02</div><div className="nf-projectCopy"><p>PRODUCT CONCEPT · TIME TRACKING</p><h3>TuTime</h3><span>A tutor time-tracking project exploring clear activity records, usable workflows and reliable information structure. Further public documentation is being prepared.</span><span className="nf-unavailable">PUBLIC LINK — COMING SOON</span></div>
        <div className="nf-projectVisual nf-time" aria-hidden="true"><i/><i/><i/><b>08:42</b><small>TUTOR SESSION / ACTIVE</small></div>
      </article>
      <article className="nf-project nf-projectDark">
        <div className="nf-projectIndex">03</div><div className="nf-projectCopy"><p>WORKING SOFTWARE · KNOWLEDGE INTERFACE</p><h3>THA Q&amp;A Hub</h3><span>An independent student-support prototype that explores verified knowledge search, transparent review and human approval.</span><a href="/tha-hub">Open the working interface ↗</a></div>
        <div className="nf-projectVisual nf-nodes" aria-hidden="true"><i/><i/><i/><i/><b>Q/A</b><small>HUMAN-IN-THE-LOOP</small></div>
      </article>
    </section>

    <section className="nf-capabilities" id="capabilities">
      <p className="nf-label">03 / INTERESTS &amp; CAPABILITIES</p>
      <div className="nf-capList">{interests.map((item, index)=><div key={item}><span>0{index+1}</span><h3>{item}</h3><i>↗</i></div>)}</div>
      <p className="nf-capNote">I am developing these capabilities through university study, independent projects and applied research. They describe my direction—not inflated claims of mastery.</p>
    </section>

    <section className="nf-contact" id="contact">
      <p className="nf-label">04 / CONTACT</p><h2>Let&apos;s build<br/><em>something meaningful.</em></h2>
      <div className="nf-contactGrid"><div><span>CONNECT</span><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={github} target="_blank" rel="noreferrer">GitHub ↗</a></div><div><span>DIRECT</span><p>Email — add address</p><p>CV — add document</p></div><div><span>LOCATION</span><p>Augsburg, Germany</p><p>Open to meaningful conversations</p></div></div>
      <a className="nf-portrait" href={linkedin} target="_blank" rel="noreferrer"><img src="/nayeem-faisal-portrait-hd.png" alt="Nayeem Faisal"/><span>VIEW PROFILE ↗</span></a>
    </section>
    <footer className="nf-footer"><a href="#top">NAYEEM FAISAL</a><span>INTERNATIONAL INFORMATION SYSTEMS</span><span>© 2026</span></footer>
  </main>;
}
