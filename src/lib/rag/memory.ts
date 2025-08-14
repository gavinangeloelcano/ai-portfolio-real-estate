// Simple in-memory RAG store for demo purposes
export type RAGDoc = { id: string; name: string; content: string; type: 'csv'|'faq'|'policy' };

const docs: RAGDoc[] = [];

export function addDoc(doc: RAGDoc) {
  docs.push(doc);
}

export function listDocs() {
  return docs;
}

export function searchDocs(query: string): RAGDoc[] {
  const q = query.toLowerCase();
  return docs.filter(d => d.content.toLowerCase().includes(q));
}

export function clearDocs() {
  docs.length = 0;
}
