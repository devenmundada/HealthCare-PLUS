import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// GPT-OSS 120B on Groq: free tier, fast inference, strong reasoning quality —
// good enough for general medical guidance when paired with a careful system prompt.
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are Healthcare+ AI Assistant, a medical information assistant for users in India.

Rules you must always follow:
- You are not a doctor. You never give a definitive diagnosis or prescribe medication doses.
- Keep answers clear, practical, and specific to the user's question — no filler.
- When relevant, mention Indian context: common OTC medicine names available in India, when to go to a government vs private hospital, Ayushman Bharat/PM-JAY where it applies.
- Always include a short "when to seek immediate/emergency care" note when symptoms could be serious.
- Never claim certainty about a diagnosis. Use language like "this could suggest" rather than "you have".
- Keep responses under ~300 words unless the user asks for more detail.
- Format with markdown: **bold** for headings, short bullet lists for steps/symptoms.
- End every substantive medical answer with a one-line disclaimer: "This is general information, not a medical diagnosis — please consult a qualified doctor."
- If the user describes a medical emergency (chest pain, severe bleeding, difficulty breathing, stroke symptoms, loss of consciousness, suicidal intent), lead with telling them to call emergency services (112 in India) or go to the nearest ER immediately.`;

export class GroqService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async chat(message: string, history: ChatTurn[] = []): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map((turn) => ({ role: turn.role, content: turn.content })),
      { role: 'user', content: message },
    ];

    const response = await axios.post<{ choices?: { message?: { content?: string } }[] }>(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 700,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq');
    }
    return content;
  }
}

export const groqService = new GroqService();
