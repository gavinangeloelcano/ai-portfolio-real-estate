'use client';
import { useEffect, useState } from 'react';
import type React from 'react';
import { toFubPayload } from '../../lib/integrations/followupboss';
import { addDoc, listDocs, searchDocs, type RAGDoc } from '../../lib/rag/memory';
import { addChunks, semanticSearch, listChunks, type RAGChunk } from '../../lib/rag/semantic';
import { postJSON } from '../../lib/client/api';

export default function RealEstatePage() {
  const fallbackBg = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80';
  const configuredBg = (process as any).env.NEXT_PUBLIC_RE_BG_URL as string | undefined;
  const [bgUrl, setBgUrl] = useState<string>(configuredBg || fallbackBg);

  // Preload and fallback if the configured image fails to load (e.g., Google redirect URLs won't work as images)
  useEffect(() => {
    if (!configuredBg) return;
    const img = new Image();
    img.onload = () => setBgUrl(configuredBg);
    img.onerror = () => setBgUrl(fallbackBg);
    img.src = configuredBg;
  }, [configuredBg]);
  const [messages, setMessages] = useState<Array<{role:'user'|'assistant', content:string}>>([
    { role: 'assistant', content: 'Hi! I can help qualify leads and answer property questions.' }
  ]);
  const [input, setInput] = useState('Do you have 3BR homes near downtown under $600k?');
  const [copyOut, setCopyOut] = useState<string>('');
  const [ragDocs, setRagDocs] = useState<RAGDoc[]>(listDocs());
  const [citations, setCitations] = useState<string[]>([]);
  const [matchedChunks, setMatchedChunks] = useState<RAGChunk[]>([]);
  const [leadPreview, setLeadPreview] = useState<string>('');

  async function send() {
    // Advanced RAG: semantic search over chunks
    const foundChunks = semanticSearch(input, 3);
    setMatchedChunks(foundChunks);
    setCitations(foundChunks.map(c => c.name));
    const context = {
      domain: 'real-estate',
      kb: { name: 'Agent FAQ' },
      rag: foundChunks.map(c => c.content).join('\n\n'),
      promptPrefix: [
        'You are a senior real estate assistant.',
        'Produce structured listings without mentioning real-time limitations.',
        'Provide 3-5 concise entries with address (sample), price, beds/baths, key features, and a one-liner.',
        'Close with one clarifying question if essential.'
      ].join('\n')
    } as const;
    const resp = await postJSON<{message:string}>('/api/ai', {
      mode: 'chat',
      input: { messages: [...messages, { role: 'user', content: input }], context }
    });
    setMessages((m: Array<{role:'user'|'assistant', content:string}>) => [...m, { role: 'user', content: input }, { role: 'assistant', content: resp.message }]);
    setInput('');
    // Demo: fabricate a lead payload when user expresses interest
    if (/\b(interested|tour|call|email)\b/i.test(input)) {
      const lead = toFubPayload({ firstName: 'Taylor', email: 'taylor@example.com', phone: '+1 555 555 5555', message: input, source: 'Portfolio Demo' });
      setLeadPreview(JSON.stringify(lead, null, 2));
    }
  }
  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const type = file.name.endsWith('.csv') ? 'csv' : file.name.endsWith('.md') ? 'faq' : 'policy';
      const docId = Math.random().toString(36).slice(2);
      addDoc({ id: docId, name: file.name, content, type });
      addChunks(docId, file.name, content);
      setRagDocs(listDocs());
    };
    reader.readAsText(file);
  }

  async function loadSample(name: 'faq'|'csv') {
    const base = '/src/sample-data';
    const file = name === 'faq' ? `${base}/real-estate-faq.md` : `${base}/listings.csv`;
    try {
      const res = await fetch(file);
      const content = await res.text();
      const docId = Math.random().toString(36).slice(2);
      const fname = name === 'faq' ? 'real-estate-faq.md' : 'listings.csv';
      addDoc({ id: docId, name: fname, content, type: name });
      addChunks(docId, fname, content);
      setRagDocs(listDocs());
    } catch {
      // no-op
    }
  }

  async function genListing() {
    const out = await postJSON<{versions:string[]}>('/api/ai', {
      input: { task: 'listing-copy', data: { address: '742 Evergreen Terrace', beds: 4, baths: 3, sqft: 2300, features: ['renovated kitchen', 'large backyard', '2-car garage'] } }
    });
    setCopyOut(out.versions.join('\n\n')); 
  }

  return (
    <>
  <div className="bg-image" style={{ backgroundImage: `url(${bgUrl})`, opacity: 0.49 }}></div>
  <div className="bg-overlay" style={{ background: 'linear-gradient(120deg, rgba(11,13,16,0.85) 55%, rgba(40,44,52,0.75) 100%)' }}></div>
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <nav className="pill-nav">
            <a href="#services">Services</a>
            <a href="#areas">Areas</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#contact">Contact</a>
          </nav>
          <h1>Move Up. Live Well.</h1>
          <p>
            Full-service representation for buyers, sellers, and investors across the metro. We combine local market
            expertise with modern AI tools to surface opportunities faster, craft better listings, and keep deals moving.
          </p>
          <div style={{display:'flex',gap:12,marginTop:16}}>
            <a className="btn" href="#contact">Get started</a>
            <a className="btn btn-outline" href="#services">See services</a>
          </div>
        </div>
      </div>

      {/* Services */}
      <section id="services" className="section container">
        <h2>Services</h2>
        <div className="section-grid">
          <div className="card"><h3>Buyer Representation</h3><p>Curated tours, comps-backed offers, and strategy to win in competitive situations without overpaying.</p></div>
          <div className="card"><h3>Seller Marketing</h3><p>Listing prep, pro photography, and AI-assisted copy that highlights value and drives qualified traffic.</p></div>
          <div className="card"><h3>Relocation</h3><p>Neighborhood match, schools and commute fit, plus virtual showings to streamline out-of-state moves.</p></div>
          <div className="card"><h3>Investment</h3><p>Deal screening, rent comps, and scenario modeling for long-term holds, flips, and STRs.</p></div>
        </div>
      </section>

      {/* Areas */}
      <section id="areas" className="section container">
        <h2>Areas We Serve</h2>
        <div className="row" style={{flexWrap:'wrap'}}>
          {['Downtown Core','East District','North Hills','Riverside','Tech Ridge','Old Town'].map(a => (
            <span key={a} style={{
              border:'1px solid var(--border)', borderRadius:999, padding:'8px 12px', marginRight:8, marginBottom:8,
              background:'#0f1218'
            }}>{a}</span>
          ))}
        </div>
      </section>

      {/* Keep existing AI demo content */}
      <div className="container" style={{position:'relative',zIndex:2}}>
      <div className="row">
        {(process as any).env.NEXT_PUBLIC_HIDE_RAG !== '1' && (
        <div className="card" style={{flex:'1 1 340px'}}>
          <h3>Upload CSV/FAQ/Policy for RAG</h3>
          <p style={{color:'var(--muted)'}}>Optional: load samples to see citations.</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button className="btn btn-outline" onClick={() => loadSample('faq')}>Load Sample FAQ</button>
            <button className="btn btn-outline" onClick={() => loadSample('csv')}>Load Sample CSV</button>
          </div>
          <input style={{marginTop:8}} type="file" accept=".csv,.md,.txt" onChange={handleUpload} />
          <ul style={{marginTop:8}}>
            {ragDocs.map(d => <li key={d.id}>{d.name} <span style={{color:'var(--muted)'}}>{d.type}</span></li>)}
          </ul>
        </div>
        )}
        <div className="card" style={{flex:'1 1 340px'}}>
          <h3>Lead-Qualifying Chat</h3>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{height:220,overflow:'auto',border:'1px solid var(--border)',borderRadius:8,padding:8}}>
              {messages.map((m: {role:'user'|'assistant'; content:string}, i: number) => (
                <div key={i} style={{marginBottom:8}}>
                  <strong style={{color:m.role==='assistant'?'#58a6ff':'#e6edf3'}}>{m.role}</strong>: {m.content}
                </div>
              ))}
              {citations.length > 0 && (
                <div style={{marginTop:8, fontSize:12, color:'var(--muted)'}}>
                  <strong>Citations:</strong> {citations.join(', ')}
                  {matchedChunks.length > 0 && (
                    <details style={{marginTop:4}}>
                      <summary>Matched Passages</summary>
                      <ul>
                        {matchedChunks.map(c => <li key={c.id}><strong>{c.name}:</strong> <span style={{color:'#58a6ff'}}>{c.content}</span></li>)}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:8}}>
              <input className="input" style={{flex:1}} value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setInput(e.target.value)} />
              <button className="btn" onClick={send}>Send</button>
            </div>
          </div>
        </div>
        <div className="card" style={{flex:'1 1 340px'}}>
          <h3>Listing Description Generator</h3>
          <button className="btn" onClick={genListing}>Generate Sample</button>
          {copyOut && <pre style={{marginTop:8, whiteSpace:'pre-wrap'}}>{copyOut}</pre>}
        </div>
        <div className="card" style={{flex:'1 1 340px'}}>
          <h3>CRM Handoff (Follow Up Boss — demo payload)</h3>
          {leadPreview ? <pre>{leadPreview}</pre> : <p>Say “I am interested” in chat to see a ready-to-send lead payload.</p>}
        </div>
      </div>
      
      {/* Testimonials */}
      <section id="testimonials" className="section" style={{paddingTop:28}}>
        <h2>Testimonials</h2>
        <div className="section-grid">
          <div className="card"><p>“We toured on Saturday and had an accepted offer by Monday. Great strategy and communication.”</p><small style={{color:'var(--muted)'}}>— Morgan R.</small></div>
          <div className="card"><p>“The listing copy and photos were on point. We had multiple offers the first weekend.”</p><small style={{color:'var(--muted)'}}>— Daniel K.</small></div>
          <div className="card"><p>“Relocating was smooth—clear neighborhood guidance and video tours saved us multiple trips.”</p><small style={{color:'var(--muted)'}}>— Priya S.</small></div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section" style={{paddingBottom:40}}>
        <h2>Contact</h2>
        <div className="row">
          <div className="card" style={{flex:'1 1 360px'}}>
            <h3>Book a call</h3>
            <p>Tell us about your timeline and goals. We’ll respond the same day.</p>
            <a className="btn" href="#">Schedule a consult</a>
          </div>
          <div className="card" style={{flex:'1 1 360px'}}>
            <h3>Quick details</h3>
            <p><strong>Email:</strong> hello@example.com<br/><strong>Phone:</strong> (555) 555‑5555<br/><strong>Hours:</strong> Mon–Sat, 9am–6pm</p>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
