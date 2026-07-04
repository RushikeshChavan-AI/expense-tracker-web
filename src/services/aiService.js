import axios from "axios";
import { todayISO } from "../utils/format";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function buildSystemPrompt(categories) {
  const categoryList = categories.map((c) => `${c.id} (${c.name}, ${c.type})`).join(", ");
  return `You are a finance assistant that extracts structured transaction data from a user's natural-language message.
Today's date is ${todayISO()} (YYYY-MM-DD).
Available categories: ${categoryList}.
Respond ONLY with a single valid JSON object, no markdown, no code fences, no explanation, matching exactly this shape:
{
  "type": "income" | "expense",
  "amount": number,
  "category": "<one of the category ids above, best match>",
  "description": "<short human description>",
  "date": "YYYY-MM-DD",
  "confidence": number between 0 and 1
}
Rules:
- Infer "income" for money received (salary, freelance, gifts) and "expense" for money spent.
- Resolve relative dates like "today", "yesterday", "last Monday" against today's date.
- If no date is mentioned, use today's date.
- Pick the closest matching category id from the list. If nothing fits well, use "other".
- amount must be a plain number, no currency symbols or commas.
- If the message does not describe a financial transaction at all, respond with {"error": "not_a_transaction"}.`;
}

/**
 * Sends the user's free-form message to OpenAI and parses the structured
 * transaction it returns. Throws a descriptive Error on any failure so the
 * UI can show a friendly message.
 */
export async function parseTransactionMessage(message, categories, apiKey) {
  if (!apiKey) {
    throw new Error(
      "No OpenAI API key configured. Add VITE_OPENAI_API_KEY to your .env file to enable the AI assistant."
    );
  }

  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        model: "gpt-4o-mini",
        temperature: 0.1,
        messages: [
          { role: "system", content: buildSystemPrompt(categories) },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content?.trim() || "";
    const cleaned = raw.replace(/^```json/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.error) {
      throw new Error("I couldn't find a transaction in that message. Try something like 'Spent ₹500 on food today'.");
    }

    if (!parsed.type || !parsed.amount || !parsed.category) {
      throw new Error("The AI response was incomplete. Please rephrase your message and try again.");
    }

    return {
      type: parsed.type === "income" ? "income" : "expense",
      amount: Math.abs(Number(parsed.amount)) || 0,
      category: categories.some((c) => c.id === parsed.category) ? parsed.category : "other",
      description: parsed.description || message,
      date: parsed.date || todayISO(),
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
    };
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      if (status === 401) throw new Error("Invalid OpenAI API key. Please check your .env configuration.");
      if (status === 429) throw new Error("OpenAI rate limit reached. Please wait a moment and try again.");
      throw new Error(`OpenAI request failed (${status}). Please try again.`);
    }
    if (err.code === "ECONNABORTED") {
      throw new Error("The request timed out. Please check your connection and try again.");
    }
    if (err instanceof SyntaxError) {
      throw new Error("Couldn't understand the AI's response. Please try rephrasing your message.");
    }
    throw err;
  }
}
