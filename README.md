# ai-portfolio-real-estate
Advanced AI-powered real estate demo: lead-qualifying chat, listing generator, CRM handoff, and RAG search. Built with Next.js, Gemini AI, and a professional UI.
# AI Portfolio Pro — Web App

This app demonstrates two product lines with switchable demo data and mockable AI.

Features
- Real Estate: Chat widget (embed), listing copy generator, follow-up copilot
- E-commerce: Product copy/SEO, review summarizer, support copilot
- Project selector (Real Estate / E-commerce) with preloaded datasets
- Local mock AI responses for instant demos

Run (mock AI)
1) Install Node 18+ and PNPM
2) pnpm install
3) pnpm dev
4) Open http://localhost:3000

Switch to real AI
- Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env
- In settings, choose provider = openai/anthropic

Test
- pnpm test (unit), pnpm test:e2e (smoke)
