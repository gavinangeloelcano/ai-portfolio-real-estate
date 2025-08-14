// Advanced RAG: chunking and semantic similarity (mock embeddings for demo)
export type RAGChunk = { id: string; docId: string; name: string; content: string; embedding: number[] };

const chunks: RAGChunk[] = [];

function simpleChunk(text: string, docId: string, name: string): RAGChunk[] {
  // Split by paragraphs or lines, max 300 chars per chunk
  const parts = text.split(/\n\n|\n/).filter(Boolean);
  return parts.map((p, i) => ({
    id: `${docId}-${i}`,
    docId,
    name,
    content: p.slice(0, 300),
    embedding: mockEmbed(p)
  }));
}

function mockEmbed(text: string): number[] {
  // Simple hash-based mock embedding for demo
  let sum = 0;
  for (let i = 0; i < text.length; ++i) sum += text.charCodeAt(i);
  return [sum % 1000, text.length % 100, text.split(' ').length % 50];
}

export function addChunks(docId: string, name: string, text: string) {
  const newChunks = simpleChunk(text, docId, name);
  chunks.push(...newChunks);
}

export function semanticSearch(query: string, topK = 3): RAGChunk[] {
  const qEmbed = mockEmbed(query);
  // Cosine similarity (mock)
  function sim(a: number[], b: number[]) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; ++i) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-6);
  }
  return chunks
    .map(c => ({ ...c, score: sim(qEmbed, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function listChunks() {
  return chunks;
}
