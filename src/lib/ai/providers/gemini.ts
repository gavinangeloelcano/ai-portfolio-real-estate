import { GoogleGenerativeAI } from '@google/generative-ai';

export type ChatMessage = { role: 'user' | 'assistant' | 'system', content: string };

function getClient() {
	const key = process.env.GOOGLE_API_KEY;
	if (!key) return null;
	return new GoogleGenerativeAI(key);
}

export async function geminiChat(messages: ChatMessage[], context?: any) {
	const client = getClient();
	if (!client) {
		const last = messages[messages.length - 1]?.content || '';
		return { message: `Gemini mock (no key): ${last.slice(0, 200)}` };
	}
	const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

	// Base behavior: stay helpful and actionable even without live data.
	const defaultInstruction =
		"Act as a proactive domain expert. Provide concrete, plausible examples when data isn't available. Do not mention lack of real-time access or browsing. If content is illustrative, add a single first-line note: 'Mock examples for demo'. Keep answers concise and structured with bullets, and include 1 clarifying question only if essential.";

	// Gemini only accepts roles: 'user', 'model', 'function', 'system'. Map 'assistant' -> 'model'.
	let history = messages
		.map(m => ({
			role: (m.role === 'assistant' ? 'model' : m.role) as 'user' | 'model' | 'function' | 'system',
			parts: [{ text: m.content }]
		}))
		.filter(m => ['user', 'model', 'function', 'system'].includes(m.role));
	if (history.length === 0 || history[0].role !== 'user') {
		history = [
			{ role: 'user', parts: [{ text: 'Hello, I am the user.' }] },
			...history
		];
	}
	const chat = model.startChat({ history });
	let prompt = messages[messages.length-1]?.content || '';
	if (context?.rag) {
		prompt = `${defaultInstruction}\n\nUse the following context to answer and cite sources if relevant:\n\n${context.rag}\n\nUser: ${prompt}`;
	} else if (context?.promptPrefix) {
		prompt = `${defaultInstruction}\n\n${context.promptPrefix}\n\n${prompt}`;
	} else {
		prompt = `${defaultInstruction}\n\n${prompt}`;
	}
	const res = await chat.sendMessage(prompt);
	const text = (await res.response.text()) || '';
	return { message: text };
}

export async function geminiGenerate(task: string, data: any) {
	const client = getClient();
	if (!client) {
		return { note: `Gemini mock (no key) for ${task}`, data };
	}
	const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
	const defaultInstruction =
		"Act as a proactive domain expert. Provide concrete, plausible examples when data isn't available. Do not mention lack of real-time access or browsing. If content is illustrative, add a single first-line note: 'Mock examples for demo'. Keep answers concise and structured with bullets, and include 1 clarifying question only if essential.";
	let prompt = `${defaultInstruction}\n\nYou are an expert ${task} generator. Data: ${JSON.stringify(data)}`;
	if (data?.rag) {
		prompt = `${defaultInstruction}\n\nUse the following context to generate and cite sources if relevant:\n\n${data.rag}\n\nTask: ${task}\nData: ${JSON.stringify(data)}`;
	}
	const res = await model.generateContent(prompt);
	const text = (await res.response.text()) || '';
	return { text };
}
