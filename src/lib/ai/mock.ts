export async function mockChat(input: { messages: Array<{ role: 'user'|'assistant'|'system', content: string }>, context?: any }) {
  const last = input.messages[input.messages.length - 1]?.content || '';
  const prefix = input?.context?.domain === 'real-estate' ? '🏠' : input?.context?.domain === 'ecommerce' ? '🛍️' : '🤖';
  return {
    message: `${prefix} Mock reply: ${last.slice(0, 200)}`,
    citations: input?.context?.kb ? [`Based on ${input.context.kb.name}`] : []
  };
}

export async function mockGenerate(input: { task: string, data: any }) {
  switch (input.task) {
    case 'listing-copy': {
      const { address = '123 Main St', beds = 3, baths = 2, sqft = 1800, features = [] } = input.data || {};
      return {
        versions: [
          `Charming ${beds}BR/${baths}BA home at ${address} with ${sqft} sqft. ${features.slice(0,3).join(', ')}.`,
          `Sophisticated living near ${address}. ${beds} beds, ${baths} baths, ${sqft} sqft — ${features.slice(0,4).join(', ')}.`,
          `Luxury at ${address}: ${beds} bed, ${baths} bath, ${sqft} sqft. Highlights: ${features.join(', ')}.`
        ]
      };
    }
    case 'product-copy': {
      const { title = 'Premium Hoodie', bullets = [], materials = 'cotton blend', voice = 'confident' } = input.data || {};
      return {
        title: `${title} — ${voice} edition`,
        description: `${title} crafted from ${materials}. ${bullets.slice(0,5).join(' ')}`,
        metaTitle: `${title} | Shop Now`,
        metaDescription: `Discover ${title} with ${materials}.`,
        faq: [
          { q: 'What is the fit?', a: 'True to size.' },
          { q: 'How to care?', a: 'Machine wash cold.' }
        ]
      };
    }
    case 'review-summary': {
      const { reviews = [] } = input.data || {};
      const pros = new Set<string>();
      const cons = new Set<string>();
      for (const r of reviews) {
        const text = String(r.text || '').toLowerCase();
        if (text.includes('soft')) pros.add('soft fabric');
        if (text.includes('fit')) pros.add('great fit');
        if (text.includes('late') || text.includes('shipping')) cons.add('slow shipping');
      }
      return { pros: Array.from(pros), cons: Array.from(cons), themes: ['quality', 'fit', 'delivery'] };
    }
    default:
      return { note: `Unhandled task: ${input.task}` };
  }
}
