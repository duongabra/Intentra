// Grok API – used by POST /api/agent/chat (Part 5)

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const apiKey = process.env.GROK_API_KEY;

export function getGrokApiKey(): string | null {
  return apiKey || null;
}

/**
 * Call Grok with messages; returns raw content string.
 * Part 5 will use this with a prompt that asks for JSON [{ product_id, quantity }].
 */
export async function chatWithGrok(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
  if (!apiKey) throw new Error("GROK_API_KEY is not set");
  const res = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3-mini-beta",
      messages,
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok API error: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content ?? "";
  return content.trim();
}
