"use client";

import { useMemo, useState } from "react";

const datasets = [
  { id: 1, title: "Home storage field measurements", area: "Field data", chemistry: "System-level", scale: "14B points", source: "Zenodo", href: "https://zenodo.org/records/12091223" },
  { id: 2, title: "LFP battery systems in real operation", area: "Health monitoring", chemistry: "LFP", scale: "133M rows", source: "Zenodo", href: "https://zenodo.org/records/13715694" },
  { id: 3, title: "Battery Failure Databank", area: "Safety", chemistry: "Li-ion", scale: "100+ tests", source: "NREL", href: "https://www.nrel.gov/transportation/battery-failure.html" },
  { id: 7, title: "EV real-driving ageing profiles", area: "Degradation", chemistry: "NMC", scale: "28 months", source: "OSF", href: "https://osf.io/qsabn/" },
  { id: 14, title: "NASA Battery Data Set", area: "Prognostics", chemistry: "Li-ion", scale: "Multi-cell", source: "NASA", href: "https://phm-datasets.s3.amazonaws.com/NASA/5.+Battery+Data+Set.zip" },
  { id: 26, title: "Early cycle-life prediction", area: "Machine learning", chemistry: "LFP", scale: "124 cells", source: "Matr.io", href: "https://data.matr.io/1/" },
  { id: 52, title: "1,000+ battery CT scans", area: "Imaging", chemistry: "Mixed", scale: "1,015 scans", source: "Figshare", href: "https://plus.figshare.com/articles/dataset/25330501" },
  { id: 67, title: "Diffusion-like overpotentials", area: "Electrochemistry", chemistry: "NCM622", scale: "EIS + GITT", source: "Harvard Dataverse", href: "https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/CIS2J4" },
];

const themes = [
  ["State estimation", "SOC, SOH and remaining useful life", "01"],
  ["Degradation", "Ageing pathways and lifetime prediction", "02"],
  ["Safety", "Failure, thermal runaway and diagnostics", "03"],
  ["Field evidence", "Real vehicles and stationary systems", "04"],
];

export default function Home() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => datasets.filter((item) =>
    `${item.title} ${item.area} ${item.chemistry} ${item.source}`.toLowerCase().includes(query.toLowerCase())
  ), [query]);

  return (
    <main className="thesisShell" onPointerMove={(event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
      event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    }}>
      <div className="ambientLight" aria-hidden="true" />
      <div className="energyRail" aria-hidden="true"><i/><i/><i/></div>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Thesis Wiki home"><span className="brandMark">NF</span><span>EV Intelligence / Thesis Wiki</span></a>
        <nav aria-label="Primary navigation"><a href="#catalogue">Catalogue</a><a href="#method">Method</a><a href="#profile">Profile</a><a href="#author">Author</a></nav>
        <a className="repoLink" href="https://github.com/Nayeemfaisal/thesis-nayeem-faisal" target="_blank" rel="noreferrer">View repository ↗</a>
      </header>
      <section className="hero" id="top">
        <div className="heroCopy">
          <p className="eyebrow"><span /> Thesis research & curation by Nayeem Faisal</p>
          <h1><span>Engineering the</span> <em>electric future.</em></h1>
          <p className="lede">An LLM-ready intelligence layer for open battery data—built to accelerate research in EV health, ageing, safety and next-generation energy systems.</p>
          <div className="heroActions"><a className="primary" href="#catalogue">Explore datasets</a><a className="secondary" href="#method">Read the protocol</a></div>
          <dl className="metrics"><div><dt>67</dt><dd>curated datasets</dd></div><div><dt>EV</dt><dd>industry relevance</dd></div><div><dt>AI</dt><dd>ready knowledge</dd></div></dl>
        </div>
        <aside className="heroPanel" aria-label="Featured research note">
          <div className="panelTop"><span>NAYEEM FAISAL / RESEARCH NOTE 001</span><span className="status">Active</span></div>
          <p className="quote">“Which public datasets are robust enough for reproducible battery health modelling?”</p>
          <div className="signal"><span>Core dimensions</span><div><i style={{width:"88%"}}/><i style={{width:"72%"}}/><i style={{width:"94%"}}/></div></div>
          <ul><li>Documentation quality</li><li>Licence compatibility</li><li>Leakage-safe evaluation</li></ul>
          <div className="cellCore" aria-hidden="true"><i/><i/><i/><b>EV</b></div>
        </aside>
      </section>
      <section className="themes" aria-label="Research themes">
        {themes.map(([title, copy, number]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{copy}</p></article>)}
      </section>
      <div className="dataMarquee" aria-label="Research capabilities"><div><span>OPEN BATTERY DATA</span><i/> <span>STATE OF HEALTH</span><i/> <span>DEGRADATION INTELLIGENCE</span><i/> <span>SAFETY ANALYTICS</span><i/> <span>REPRODUCIBLE MODELLING</span><i/> <span>EV RESEARCH</span><i/></div><div aria-hidden="true"><span>OPEN BATTERY DATA</span><i/> <span>STATE OF HEALTH</span><i/> <span>DEGRADATION INTELLIGENCE</span><i/> <span>SAFETY ANALYTICS</span><i/> <span>REPRODUCIBLE MODELLING</span><i/> <span>EV RESEARCH</span><i/></div></div>
      <section className="industry" id="industry">
        <div className="industryIntro">
          <p className="eyebrow"><span /> EV-scale research potential</p>
          <h2>Built around the questions global EV leaders face.</h2>
          <p>The catalogue brings together public evidence that can support exploratory research for major EV manufacturers and battery teams—from early degradation signals to fleet-aware health models.</p>
        </div>
        <div className="industryGrid">
          <article><b>01</b><span>Battery health</span><p>Benchmark SOC, SOH and remaining-life methods across chemistries and duty cycles.</p></article>
          <article><b>02</b><span>Fast charging</span><p>Study efficiency, thermal response and degradation under demanding charge protocols.</p></article>
          <article><b>03</b><span>Fleet intelligence</span><p>Bridge laboratory experiments with field measurements and realistic driving profiles.</p></article>
          <article><b>04</b><span>Safety systems</span><p>Explore fault signatures, abuse testing and thermal-runaway evidence.</p></article>
        </div>
        <p className="industryNote"><strong>Research-use statement:</strong> These third-party datasets may be relevant to large EV companies, including global vehicle and battery manufacturers, after independent validation for licensing, quality, representativeness, safety and the intended engineering use. This project is independent and is not affiliated with or endorsed by Tesla or any vehicle manufacturer.</p>
      </section>
      <section className="catalogue" id="catalogue">
        <div className="sectionHead"><div><p className="eyebrow"><span /> Knowledge catalogue</p><h2>Dataset index</h2></div><p>Search a representative selection from the complete 67-entry catalogue. Every record links back to its authoritative source.</p></div>
        <label className="search"><span>⌕</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search by topic, chemistry or repository…" aria-label="Search datasets"/><kbd>{filtered.length} results</kbd></label>
        <div className="table" role="table" aria-label="Battery datasets">
          <div className="tableRow tableHeader" role="row"><span>#</span><span>Dataset</span><span>Research area</span><span>Chemistry</span><span>Scale</span><span>Source</span></div>
          {filtered.map((d) => <a className="tableRow" role="row" href={d.href} target="_blank" rel="noreferrer" key={d.id}><span>{String(d.id).padStart(2,"0")}</span><strong>{d.title}</strong><span>{d.area}</span><span>{d.chemistry}</span><span>{d.scale}</span><span>{d.source} ↗</span></a>)}
        </div>
        <a className="allLink" href="https://github.com/Nayeemfaisal/thesis-nayeem-faisal#available-datasets" target="_blank" rel="noreferrer">Browse all 67 dataset records <span>→</span></a>
      </section>
      <section className="method" id="method">
        <div><p className="eyebrow light"><span /> Research method</p><h2>Evidence before experiments.</h2><p>Each candidate moves through a documented review process before entering a thesis experiment.</p></div>
        <ol><li><b>01</b><span><strong>Discover</strong>Find stable, authoritative sources.</span></li><li><b>02</b><span><strong>Verify</strong>Record licences, versions and bias.</span></li><li><b>03</b><span><strong>Compare</strong>Assess relevance and data quality.</span></li><li><b>04</b><span><strong>Reproduce</strong>Track splits, seeds and checksums.</span></li></ol>
      </section>
      <section className="profile" id="profile">
        <div className="profileIntro">
          <p className="eyebrow"><span /> Beyond the thesis</p>
          <h2>Research, experience and product thinking.</h2>
          <p>Selected links connecting this battery research with my wider academic experience and practical software concepts.</p>
        </div>
        <div className="profileGrid">
          <a href="https://de.linkedin.com/in/nayeem-faisal-721619296" target="_blank" rel="noreferrer"><b>01 / PROFESSIONAL PROFILE</b><h3>LinkedIn</h3><p>My academic path, professional experience, research interests and current work at THA.</p><span>View profile ↗</span></a>
          <a href="https://www.tha.de/" target="_blank" rel="noreferrer"><b>02 / INTERNSHIP</b><h3>Technische Hochschule Augsburg</h3><p>Applied research and professional experience within THA’s practice-oriented academic environment.</p><span>Visit THA ↗</span></a>
          <a href="/tha-hub"><b>03 / WORKING SOFTWARE</b><h3>THA Q&amp;A Hub</h3><p>Try the interactive student-support prototype with verified knowledge search and a professor-review workflow.</p><span>Open live demo →</span></a>
        </div>
        <p className="profileNote">The THA Q&amp;A Hub is an independent prototype concept and is not presented as an official THA service.</p>
      </section>
      <section className="author" id="author">
        <img src="/nayeem-faisal.png" alt="Nayeem Faisal" />
        <div><p className="eyebrow"><span /> Researcher & thesis author</p><h2>Nayeem Faisal</h2><p className="role">Bachelor’s thesis researcher · Battery data & intelligent systems</p><p>All thesis research, catalogue curation, dataset review, comparative analysis and wiki development presented here are conducted by Nayeem Faisal. The underlying third-party datasets and published findings remain the work of their cited authors and institutions.</p><div className="authorLinks"><a href="https://de.linkedin.com/in/nayeem-faisal-721619296" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://github.com/Nayeemfaisal" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://github.com/Nayeemfaisal/thesis-nayeem-faisal" target="_blank" rel="noreferrer">Research repository ↗</a></div></div>
      </section>
      <footer><div className="brand"><span className="brandMark">NF</span><span>EV Intelligence / Thesis Wiki</span></div><p>Thesis research and curation by Nayeem Faisal · Independent of manufacturers.</p><span>© 2026 Nayeem Faisal</span></footer>
    </main>
  );
}
