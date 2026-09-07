import { GoogleGenAI, Type } from "@google/genai";
import {
  ALLOWED_CATEGORIES,
  ALLOWED_PAYMENT_METHODS,
  QuickEntrySchema,
  type QuickEntryRawOutput,
  SYSTEM_PROMPT,
} from "./schema";

const GEMINI_TIMEOUT_MS = 7000;

export async function parseWithGemini(input: string): Promise<QuickEntryRawOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key") {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const ai = new GoogleGenAI({ apiKey });

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Gemini request timed out after ${GEMINI_TIMEOUT_MS}ms`));
    }, GEMINI_TIMEOUT_MS);
    if (typeof timer.unref === "function") {
      timer.unref();
    }
  });

  const apiCallPromise = (async () => {
    const response = await ai.models.generateContent({
      model,
      contents: input,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: {
              type: Type.NUMBER,
              nullable: true,
              description: "Positive amount or null if absent",
            },
            category: {
              type: Type.STRING,
              enum: [...ALLOWED_CATEGORIES],
              description: "Expense category",
            },
            merchant: { type: Type.STRING, nullable: true },
            description: { type: Type.STRING, nullable: true },
            dateHint: { type: Type.STRING, nullable: true },
            timeHint: { type: Type.STRING, nullable: true },
            paymentMethod: {
              type: Type.STRING,
              enum: [...ALLOWED_PAYMENT_METHODS],
              nullable: true,
              description: "Payment method or null if not explicitly mentioned",
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Explicit tags",
            },
            note: { type: Type.STRING, nullable: true },
            location: { type: Type.STRING, nullable: true },
            split: { type: Type.INTEGER, nullable: true },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score between 0 and 1",
            },
          },
          required: [
            "amount",
            "category",
            "merchant",
            "description",
            "dateHint",
            "timeHint",
            "paymentMethod",
            "tags",
            "note",
            "location",
            "split",
            "confidence",
          ],
        },
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned empty response");
    }

    const parsed = JSON.parse(text);
    return QuickEntrySchema.parse(parsed);
  })();

  return await Promise.race([apiCallPromise, timeoutPromise]);
}
