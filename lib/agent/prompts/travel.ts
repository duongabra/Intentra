import type { TravelListing } from "@/types";
import type { AgentTravelItem } from "@/types";

const JSON_REQUIRED = `Respond with ONLY a JSON array of selected flights/tickets, no other text or markdown. Format:
[{"listing_id": "<uuid>", "quantity": <number>}, ...]
Use the exact listing_id from the list. Quantity = number of passengers/tickets.`;

export function buildTravelPrompt(userMessage: string, listings: TravelListing[]): string {
  const list = listings
    .map(
      (l) =>
        `- id: ${l.id} | ${l.name} | ${l.from_location} → ${l.to_location} | ${l.price} VND | ${l.departure_at ?? "—"}`
    )
    .join("\n");
  return `You are a flight booking assistant. The user wants to buy flight tickets. Below is the available flights list (id, name, route, price VND). Select the best matching flight(s) and quantity (passengers) for the user's request.

Flights list:
${list}

User request: ${userMessage}

${JSON_REQUIRED}`;
}

export function parseTravelResponse(raw: string): AgentTravelItem[] {
  const trimmed = raw.trim();
  let jsonStr = trimmed;
  const codeMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();
  try {
    const arr = JSON.parse(jsonStr) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (x): x is AgentTravelItem =>
          x != null &&
          typeof x === "object" &&
          typeof (x as AgentTravelItem).listing_id === "string" &&
          typeof (x as AgentTravelItem).quantity === "number" &&
          (x as AgentTravelItem).quantity > 0
      )
      .map((x) => ({
        listing_id: String(x.listing_id).trim(),
        quantity: Math.floor(x.quantity),
      }));
  } catch {
    return [];
  }
}
