import { NextRequest } from 'next/server';
import { mockChat, mockGenerate } from '../../../lib/ai/mock';
import { geminiChat, geminiGenerate } from '../../../lib/ai/providers/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { mode, input } = await req.json();
  const hasGemini = !!process.env.GOOGLE_API_KEY;
  if (mode === 'chat') {
    const resp = hasGemini ? await geminiChat(input.messages, input.context) : await mockChat(input);
    return new Response(JSON.stringify(resp), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  const out = hasGemini ? await geminiGenerate(input.task, input.data) : await mockGenerate(input);
  return new Response(JSON.stringify(out), { status: 200, headers: { 'content-type': 'application/json' } });
}
