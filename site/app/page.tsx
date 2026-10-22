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
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Thesis Wiki home"><span className="brandMark">NF</span><span>Thesis Wiki</span></a>
        <nav aria-label="Primary navigation"><a href="#catalogue">Catalogue</a><a href="#method">Method</a><a href="#author">Author</a></nav>
        <a className="repoLink" href="https://github.com/Nayeemfaisal/thesis-nayeem-faisal" target="_blank" rel="noreferrer">View repository ↗</a>
      </header>
      <section className="hero" id="top">
        <div className="heroCopy">
          <p className="eyebrow"><span /> Nayeem Faisal · Bachelor’s thesis research</p>
          <h1>A living knowledge base for <em>battery intelligence.</em></h1>
          <p className="lede">An LLM-ready research wiki mapping open battery datasets across health estimation, ageing, safety, imaging and electrochemical modelling.</p>
          <div className="heroActions"><a className="primary" href="#catalogue">Explore datasets</a><a className="secondary" href="#method">Read the protocol</a></div>
          <dl className="metrics"><div><dt>67</dt><dd>curated datasets</dd></div><div><dt>8</dt><dd>research themes</dd></div><div><dt>Open</dt><dd>source catalogue</dd></div></dl>
        </div>
        <aside className="heroPanel" aria-label="Featured research note">
          <div className="panelTop"><span>RESEARCH NOTE / 001</span><span className="status">Active</span></div>
          <p className="quote">“Which public datasets are robust enough for reproducible battery health modelling?”</p>
          <div className="signal"><span>Core dimensions</span><div><i style={{width:"88%"}}/><i style={{width:"72%"}}/><i style={{width:"94%"}}/></div></div>
          <ul><li>Documentation quality</li><li>Licence compatibility</li><li>Leakage-safe evaluation</li></ul>
        </aside>
      </section>
      <section className="themes" aria-label="Research themes">
        {themes.map(([title, copy, number]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{copy}</p></article>)}
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
      <section className="author" id="author">
        <img src="/nayeem-faisal.png" alt="Nayeem Faisal" />
        <div><p className="eyebrow"><span /> About the researcher</p><h2>Nayeem Faisal</h2><p className="role">Bachelor’s thesis researcher · Battery data & intelligent systems</p><p>This wiki is the public research companion to my bachelor’s thesis. I am building a transparent map of open battery evidence and a reproducible path from dataset discovery to trustworthy modelling.</p><div className="authorLinks"><a href="https://github.com/Nayeemfaisal" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://github.com/Nayeemfaisal/thesis-nayeem-faisal" target="_blank" rel="noreferrer">Research repository ↗</a></div></div>
      </section>
      <footer><div className="brand"><span className="brandMark">NF</span><span>Thesis Wiki</span></div><p>Open battery research, carefully mapped.</p><span>© 2026 Nayeem Faisal</span></footer>
    </main>
  );
}
