// Groq API – used by POST /api/agent/chat (OpenAI-compatible)

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export function getGroqApiKey(): string | null {
  return process.env.GROQ_API_KEY || null;
}

/**
 * Call Groq with messages; returns raw content string.
 * Uses llama-3.1-8b-instant (fast, free-tier friendly).
 */
export async function chatWithGroq(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} ${err}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  return content.trim();
}
