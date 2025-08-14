'use client';
import { useState } from 'react';
import { toShopifyCSV, toShopifyJSON, type ShopifyProduct } from '../../lib/integrations/shopify';
import { addDoc, listDocs, searchDocs, type RAGDoc } from '../../lib/rag/memory';
import { addChunks, semanticSearch, type RAGChunk } from '../../lib/rag/semantic';
import { postJSON } from '../../lib/client/api';

type Review = { rating: number; text: string };

export default function EcommercePage() {
  const [sku, setSku] = useState('Hoodie-Pro');
  const [voice, setVoice] = useState('confident');
  const [result, setResult] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [exportCSV, setExportCSV] = useState<string>('');
  const [exportJSON, setExportJSON] = useState<string>('');
  const [ragDocs, setRagDocs] = useState<RAGDoc[]>(listDocs());
  const [citations, setCitations] = useState<string[]>([]);
  const [matchedChunks, setMatchedChunks] = useState<RAGChunk[]>([]);

  function download(name: string, content: string, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function genCopy() {
    // Advanced RAG: semantic search over chunks
    const foundChunks = semanticSearch(sku, 3);
    setMatchedChunks(foundChunks);
    setCitations(foundChunks.map(c => c.name));
    const out = await postJSON<any>('/api/ai', {
      input: { task: 'product-copy', data: { title: sku, bullets: ['Soft feel.', 'Modern fit.', 'All-season.'], materials: 'organic cotton', voice, rag: foundChunks.map(c => c.content).join('\n\n') } }
    });
    setResult(out);
    // Prepare Shopify export (DTC friendly fields)
    const product: ShopifyProduct = {
      Handle: sku.toLowerCase().replace(/\s+/g,'-'),
      Title: out.title || sku,
      Body: (out.description || '').concat('\n\n— Crafted for everyday comfort —'),
      Vendor: 'Demo Brand',
      Type: 'Apparel',
      Tags: 'hoodie,unisex,organic',
      Published: false,
      'SEO Title': out.metaTitle || `${sku} | Demo Brand`,
      'SEO Description': out.metaDescription || `Discover ${sku}.`
    };
    setExportCSV(toShopifyCSV([product]));
    setExportJSON(toShopifyJSON([product]));
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

  async function summarize() {
    const reviews: Review[] = [
      { rating: 5, text: 'Super soft and the fit is perfect!' },
      { rating: 4, text: 'Good quality but shipping was late.' },
      { rating: 5, text: 'Great fit, love the fabric.' }
    ];
    const out = await postJSON<any>('/api/ai', { input: { task: 'review-summary', data: { reviews } } });
    setSummary(out);
  }

  return (
    <>
      <div className="bg-image" style={{backgroundImage:'url(https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80)'}}></div>
      <div className="bg-overlay"></div>
      <div className="container" style={{position:'relative',zIndex:2}}>
      <h1 style={{letterSpacing:0.5}}>E-commerce — DTC Demo</h1>
      <p style={{color:'var(--muted)'}}>On-brand product copy, SEO, and Shopify-ready exports. English only.</p>
      <div className="card" style={{marginBottom:16}}>
        <h3>Upload CSV/FAQ/Policy for RAG</h3>
        <input type="file" accept=".csv,.md,.txt" onChange={handleUpload} />
        <ul style={{marginTop:8}}>
          {ragDocs.map(d => <li key={d.id}>{d.name} <span style={{color:'var(--muted)'}}>{d.type}</span></li>)}
        </ul>
      </div>
      <div className="row">
        <div className="card" style={{flex:'1 1 340px'}}>
          <h3>Product Copy + SEO</h3>
          <div className="field">
            <label>SKU/Title</label>
            <input className="input" value={sku} onChange={(e)=>setSku((e.target as HTMLInputElement).value)} />
          </div>
          <div className="field">
            <label>Brand Voice</label>
            <select className="input" value={voice} onChange={(e)=>setVoice((e.target as HTMLSelectElement).value)}>
              <option value="confident">Confident</option>
              <option value="playful">Playful</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          <button className="btn" onClick={genCopy}>Generate</button>
          {result && (
            <div style={{marginTop:12}}>
              <h4>{result.title}</h4>
              <p>{result.description}</p>
              <pre>{JSON.stringify({ metaTitle: result.metaTitle, metaDescription: result.metaDescription, faq: result.faq }, null, 2)}</pre>
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
              <h4>Shopify Export</h4>
              <details>
                <summary>CSV</summary>
                <pre>{exportCSV}</pre>
                <button className="btn" onClick={() => download(`${productHandle(sku)}.csv`, exportCSV, 'text/csv')}>Download CSV</button>
              </details>
              <details>
                <summary>JSON</summary>
                <pre>{exportJSON}</pre>
                <button className="btn" onClick={() => download(`${productHandle(sku)}.json`, exportJSON, 'application/json')}>Download JSON</button>
              </details>
            </div>
          )}
        </div>
        <div className="card" style={{flex:'1 1 340px'}}>
          <h3>Review Summarizer</h3>
          <button className="btn" onClick={summarize}>Summarize Sample Reviews</button>
          {summary && (
            <pre style={{marginTop:12}}>{JSON.stringify(summary, null, 2)}</pre>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

function productHandle(s: string) {
  return s.toLowerCase().replace(/\s+/g,'-');
}
