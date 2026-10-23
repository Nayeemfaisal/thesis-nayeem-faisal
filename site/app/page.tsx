"use client";

import { useEffect, type CSSProperties } from "react";

const education = [
  { code: "PSC", period: "2013", title: "Primary Education Certificate", place: "Bangladesh national curriculum", detail: "Government-issued primary education examination certificate—the formal completion of primary education.", focus: ["Foundational learning", "National examination"] },
  { code: "JSC", period: "Lower-secondary stage", title: "Junior School Certificate", place: "Bangladesh", detail: "The transition from primary education into a broader lower-secondary curriculum and structured assessment.", focus: ["General studies", "Academic progression"] },
  { code: "SSC", period: "Within the 2013–2020 school period", title: "Secondary School Certificate", place: "Bangladesh", detail: "Completion of the secondary-school stage during the education period shown on the public LinkedIn profile.", focus: ["Secondary education", "Certificate stage"] },
  { code: "HSC", period: "2021–2023", title: "Higher Secondary Certificate", place: "Bangladesh", detail: "Higher-secondary study completed before the move into multidisciplinary university education in Germany.", focus: ["Higher secondary", "University preparation"] },
  { code: "BSc", period: "2024–2027", title: "International Information Systems", place: "Technische Hochschule Augsburg", detail: "A multidisciplinary bachelor’s programme combining information systems and IT subjects. The public LinkedIn profile currently reports an overall grade of 1.2.", focus: ["Software development", "Databases", "Information systems", "Technology & business"] },
];

const work = [
  { number: "01", type: "WORKING SOFTWARE", title: "THA Q&A Hub", copy: "An interactive student-support prototype with verified knowledge search, a transparent review queue and human approval.", href: "/tha-hub", link: "Open live software →", accent: "cyan" },
  { number: "02", type: "APPLIED EXPERIENCE", title: "THA Internship", copy: "Practical experience in the applied, research-oriented environment of the Technical University of Applied Sciences Augsburg.", href: "/internship", link: "Explore experience →", accent: "violet" },
  { number: "03", type: "BACHELOR’S THESIS", title: "EV Battery Intelligence", copy: "A reproducible research catalogue mapping 67 open datasets for battery health, ageing, safety and data-driven modelling.", href: "/thesis", link: "Open thesis wiki →", accent: "red" },
];

export default function Home() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="portfolioShell" onPointerMove={(event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
      event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    }}>
      <div className="portfolioStars" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i}/>)}</div>
      <div className="portfolioOrbit" aria-hidden="true"><i/><i/><i/><b/></div>
      <div className="solarSystem" aria-hidden="true"><div className="sun"/><div className="planetOrbit orbitOne"><i/></div><div className="planetOrbit orbitTwo"><i/></div><div className="planetOrbit orbitThree"><i/></div><div className="planetOrbit orbitFour"><i/></div></div>
      <header className="portfolioNav">
        <a className="portfolioBrand" href="#home"><img src="/nayeem-faisal-portrait-hd.png" alt=""/><span>NAYEEM FAISAL</span></a>
        <nav aria-label="Primary navigation"><a href="#education">Education</a><a href="#work">Current work</a><a href="#profile">Profile</a></nav>
        <a className="portfolioContact" href="https://de.linkedin.com/in/nayeem-faisal-721619296" target="_blank" rel="noreferrer">LinkedIn ↗</a>
      </header>

      <section className="portfolioHero" id="home">
        <div className="portfolioHeroCopy">
          <p className="portfolioKicker"><span/> INTERNATIONAL INFORMATION SYSTEMS · APPLIED INTELLIGENCE</p>
          <h1><span>Building systems</span><em>for what comes next.</em></h1>
          <p>I’m Nayeem Faisal—a multidisciplinary bachelor’s student at THA working across software, data, applied research and intelligent systems.</p>
          <div className="portfolioActions"><a href="#work">Explore my work</a><a href="#education">Follow my journey</a></div>
          <dl><div><dt>1.2</dt><dd>Current overall grade</dd></div><div><dt>3</dt><dd>Active work streams</dd></div><div><dt>2</dt><dd>Working languages</dd></div></dl>
        </div>
        <div className="portraitStage">
          <div className="portraitRings"><i/><i/><i/></div>
          <img src="/nayeem-faisal-portrait-hd.png" alt="Nayeem Faisal"/>
          <div className="portraitTelemetry"><span>PROFILE / NF–001</span><b>ACTIVE</b><small>Munich · Augsburg · Bangladesh</small></div>
        </div>
      </section>

      <div className="portfolioTicker"><div><span>SOFTWARE ENGINEERING</span><i/><span>DATA SYSTEMS</span><i/><span>BATTERY RESEARCH</span><i/><span>APPLIED AI</span><i/><span>HUMAN-CENTRED PRODUCTS</span><i/></div><div aria-hidden="true"><span>SOFTWARE ENGINEERING</span><i/><span>DATA SYSTEMS</span><i/><span>BATTERY RESEARCH</span><i/><span>APPLIED AI</span><i/><span>HUMAN-CENTRED PRODUCTS</span><i/></div></div>

      <section className="educationJourney" id="education">
        <div className="portfolioSectionHead"><p>EDUCATION TRAJECTORY</p><h2>From foundational learning<br/>to applied technology.</h2><span>My public LinkedIn record provides the periods below. Undisclosed institution names and grades are intentionally not guessed.</span></div>
        <div className="educationTrack">
          {education.map((item,index)=><article key={item.code} style={{"--step":index} as CSSProperties}><div className="educationCode"><small>0{index + 1}</small>{item.code}</div><div className="educationLine"><i/></div><div className="educationBody"><b>{item.period}</b><h3>{item.title}</h3><span>{item.place}</span><p>{item.detail}</p><div className="educationTags">{item.focus.map(tag=><em key={tag}>{tag}</em>)}</div></div></article>)}
        </div>
        <a className="sourceLink" href="https://de.linkedin.com/in/nayeem-faisal-721619296" target="_blank" rel="noreferrer">View the source profile on LinkedIn ↗</a>
      </section>

      <section className="currentWork" id="work">
        <div className="portfolioSectionHead light"><p>RUNNING WORK / 2026</p><h2>Three directions.<br/>One evolving practice.</h2><span>Software building, applied experience and bachelor’s research—kept separate, connected by a common systems mindset.</span></div>
        <div className="workGrid">{work.map(item=><a className={`workCard ${item.accent}`} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} key={item.number}><div><b>{item.number}</b><span>{item.type}</span></div><h3>{item.title}</h3><p>{item.copy}</p><strong>{item.link}</strong><i/></a>)}</div>
      </section>

      <section className="portfolioProfile" id="profile">
        <div className="profileImageWrap"><img src="/nayeem-faisal-portrait-hd.png" alt="Nayeem Faisal"/><span>NF / 2026</span></div>
        <div><p className="portfolioKicker"><span/> PROFILE</p><h2>Curious across disciplines.<br/>Focused on useful outcomes.</h2><p>My academic path combines information systems, software development, databases, data engineering and the relationship between technology and organisations. Current work explores research software, reliable information flows and battery-data intelligence.</p><div className="languageRow"><span><b>English</b> Professional working proficiency</span><span><b>German</b> Elementary proficiency</span></div><div className="portfolioLinks"><a href="https://de.linkedin.com/in/nayeem-faisal-721619296" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://github.com/Nayeemfaisal" target="_blank" rel="noreferrer">GitHub ↗</a></div></div>
      </section>

      <footer className="portfolioFooter"><div className="portfolioBrand"><img src="/nayeem-faisal-portrait-hd.png" alt=""/><span>NAYEEM FAISAL</span></div><p>Building software, research and intelligent systems.</p><span>© 2026</span></footer>
    </main>
  );
}
