import type { Product } from "@/types";
import type { AgentChatItem } from "@/types";

const JSON_REQUIRED = `Respond with ONLY a JSON array of selected items, no other text or markdown. Format:
[{"product_id": "<uuid>", "quantity": <number>}, ...]
Use the exact product_id from the list. Quantity must be a positive integer.`;

export function buildFoodPrompt(userMessage: string, products: Product[]): string {
  const list = products
    .map((p) => `- id: ${p.id} | name: ${p.name} | price: ${p.price} VND | category: ${p.category}`)
    .join("\n");
  return `You are a shopping assistant. The user wants to buy food/ingredients. Below is the product list (id, name, price VND, category). Select the best matching products and quantities for the user's request.

Product list:
${list}

User request: ${userMessage}

${JSON_REQUIRED}`;
}

/** Parse Grok response into AgentChatItem[]. Extracts JSON from code block or raw. */
export function parseFoodResponse(raw: string): AgentChatItem[] {
  const trimmed = raw.trim();
  let jsonStr = trimmed;
  const codeMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();
  try {
    const arr = JSON.parse(jsonStr) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (x): x is AgentChatItem =>
          x != null &&
          typeof x === "object" &&
          typeof (x as AgentChatItem).product_id === "string" &&
          typeof (x as AgentChatItem).quantity === "number" &&
          (x as AgentChatItem).quantity > 0
      )
      .map((x) => ({ product_id: String(x.product_id).trim(), quantity: Math.floor(x.quantity) }));
  } catch {
    return [];
  }
}
