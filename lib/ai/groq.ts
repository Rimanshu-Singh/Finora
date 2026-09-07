import Groq from "groq-sdk";
import { QuickEntrySchema, type QuickEntryRawOutput, SYSTEM_PROMPT } from "./schema";

const GROQ_TIMEOUT_MS = 5000;

export async function parseWithGroq(input: string): Promise<QuickEntryRawOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_groq_api_key") {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
  const client = new Groq({ apiKey });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const chatCompletion = await client.chat.completions.create(
      {
        model,
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT}\n\nRespond with a JSON object matching this schema:
{
  "amount": number or null,
  "category": string (one of the 14 allowed categories),
  "merchant": string or null,
  "description": string or null,
  "dateHint": string or null,
  "timeHint": string or null,
  "paymentMethod": string or null (one of "UPI", "Cash", "Credit Card", "Debit Card", "Bank Transfer", "Wallet", "Other", or null),
  "tags": array of strings,
  "note": string or null,
  "location": string or null,
  "split": number or null,
  "confidence": number between 0 and 1
}`,
          },
          {
            role: "user",
            content: input,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      },
      { signal: controller.signal },
    );

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned empty response");
    }

    const parsed = JSON.parse(content);
    return QuickEntrySchema.parse(parsed);
  } finally {
    clearTimeout(timeoutId);
  }
}
