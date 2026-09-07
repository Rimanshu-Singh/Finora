import { parseWithGroq } from "./groq";
import { parseWithGemini } from "./gemini";
import {
  ALLOWED_CATEGORIES,
  ALLOWED_PAYMENT_METHODS,
  type AllowedCategory,
  type PaymentMethod,
  type QuickEntryRawOutput,
  type QuickEntryResult,
  QuickEntryResultSchema,
} from "./schema";
import { TODAY } from "../format";

export class QuickEntryError extends Error {
  constructor(
    message = "Quick Entry isn't available right now. You can still enter the expense manually.",
  ) {
    super(message);
    this.name = "QuickEntryError";
  }
}

export class AmountNotFoundError extends Error {
  constructor(message = "I couldn't find an amount in that entry.") {
    super(message);
    this.name = "AmountNotFoundError";
  }
}

export function safeError(err: unknown): {
  name: string;
  message: string;
  status?: number;
} {
  if (err instanceof Error) {
    const errorObj: { name: string; message: string; status?: number } = {
      name: err.name,
      message: err.message.replace(/([a-zA-Z0-9_\-]{20,})/g, "[REDACTED]"),
    };
    if (
      "status" in err &&
      typeof (err as { status?: unknown }).status === "number"
    ) {
      errorObj.status = (err as { status: number }).status;
    }
    return errorObj;
  }
  return { name: "UnknownError", message: "An unknown error occurred" };
}

export function normalizeAmount(rawAmount: unknown): number | null {
  if (typeof rawAmount === "number") {
    if (Number.isFinite(rawAmount) && rawAmount > 0 && rawAmount <= 100000000) {
      return Math.round(rawAmount * 100) / 100;
    }
    return null;
  }

  if (typeof rawAmount === "string") {
    let str = rawAmount.trim().toLowerCase();
    str = str.replace(/[₹\s]|rs\.?|rupees/gi, "");

    const kMatch = str.match(/^([\d.]+)\s*k$/i);
    if (kMatch) {
      const val = parseFloat(kMatch[1]) * 1000;
      if (Number.isFinite(val) && val > 0 && val <= 100000000) {
        return Math.round(val * 100) / 100;
      }
      return null;
    }

    const val = parseFloat(str.replace(/,/g, ""));
    if (Number.isFinite(val) && val > 0 && val <= 100000000) {
      return Math.round(val * 100) / 100;
    }
  }

  return null;
}

export function normalizeCategory(category: string): AllowedCategory {
  const c = category.trim().toLowerCase();
  if (/^(food|dining|restaurant|dinner|lunch|breakfast|swiggy|zomato|cafe|coffee|snack)/.test(c)) {
    return "Food";
  }
  if (/^(grocer|fresh|blinkit|zepto|bigbasket|supermarket|vegetable|milk)/.test(c)) {
    return "Groceries";
  }
  if (/^(transport|cab|taxi|uber|ola|rapido|auto|rickshaw|metro|bus|fuel|petrol|diesel)/.test(c)) {
    return "Transport";
  }
  if (/^(clothing|clothes|shirt|dress|apparel|pants|shoes|footwear)/.test(c)) {
    return "Clothing";
  }
  if (/^(shopping|amazon|flipkart|store|mall)/.test(c)) {
    return "Shopping";
  }
  if (/^(bill|utility|utilities|electricity|wifi|wi-fi|recharge|water|gas)/.test(c)) {
    return "Bills";
  }
  if (/^(subscript|netflix|spotify|prime|youtube|hotstar)/.test(c)) {
    return "Subscriptions";
  }
  if (/^(entertain|movie|cinema|game|gaming|theatre|concert)/.test(c)) {
    return "Entertainment";
  }
  if (/^(health|med|doctor|hospital|pharmacy|clinic)/.test(c)) {
    return "Health";
  }
  if (/^(educat|course|udemy|book|tuition|school|college)/.test(c)) {
    return "Education";
  }
  if (/^(travel|flight|hotel|trip|stay|vacation)/.test(c)) {
    return "Travel";
  }
  if (/^(personal|salon|haircut|spa|skincare|grooming)/.test(c)) {
    return "Personal Care";
  }
  if (/^(gift|donation)/.test(c)) {
    return "Gifts";
  }

  const match = ALLOWED_CATEGORIES.find((cat) => cat.toLowerCase() === c);
  return match || "Other";
}

export function normalizePaymentMethod(
  pm: string | null | undefined,
  rawInput?: string,
): PaymentMethod | null {
  const check = (val: string): PaymentMethod | null => {
    const v = val.toLowerCase();
    if (/\b(cash|paid cash|with cash|by cash)\b/i.test(v)) return "Cash";
    if (/\b(upi|gpay|google pay|phonepe|paytm upi)\b/i.test(v)) return "UPI";
    if (/\b(credit card|credit|cc)\b/i.test(v)) return "Credit Card";
    if (/\b(debit card|debit|dc)\b/i.test(v)) return "Debit Card";
    if (/\b(bank transfer|bank|neft|imps|rtgs|netbanking|net banking)\b/i.test(v))
      return "Bank Transfer";
    if (/\b(wallet)\b/i.test(v)) return "Wallet";
    if (/\b(other)\b/i.test(v)) return "Other";
    return null;
  };

  if (pm) {
    const normalized = check(pm);
    if (normalized) return normalized;
    const exact = ALLOWED_PAYMENT_METHODS.find(
      (m) => m.toLowerCase() === pm.trim().toLowerCase(),
    );
    if (exact) return exact;
  }

  if (rawInput) {
    return check(rawInput);
  }

  return null;
}

const MONTH_MAP: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

export function resolveDateHint(hint: string | null | undefined): string | null {
  if (!hint || !hint.trim()) return null;
  const h = hint.toLowerCase().trim();

  // TODAY is "2026-09-07" (Monday)
  if (
    h.includes("yesterday") ||
    h.includes("last night") ||
    h.includes("prev day") ||
    h.includes("previous day")
  ) {
    return "2026-09-06";
  }

  if (
    h.includes("today") ||
    h.includes("this morning") ||
    h.includes("this afternoon") ||
    h.includes("tonight")
  ) {
    return TODAY;
  }

  // Weekdays relative to Monday 2026-09-07
  if (h.includes("sunday")) return "2026-09-06";
  if (h.includes("saturday")) return "2026-09-05";
  if (h.includes("friday")) return "2026-09-04";
  if (h.includes("thursday")) return "2026-09-03";
  if (h.includes("wednesday")) return "2026-09-02";
  if (h.includes("tuesday")) return "2026-09-01";
  if (h.includes("monday")) return TODAY;

  // Pattern: "5 sep" or "7 September" or "Sept 7" or "September 7" or "5th sep"
  const dateRegex =
    /(?:(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+))|(?:([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?)/i;
  const match = h.match(dateRegex);
  if (match) {
    const dayStr = match[1] || match[4];
    const monthStr = (match[2] || match[3])?.toLowerCase();
    if (dayStr && monthStr && MONTH_MAP[monthStr]) {
      const day = parseInt(dayStr, 10);
      if (day >= 1 && day <= 31) {
        return `2026-${MONTH_MAP[monthStr]}-${String(day).padStart(2, "0")}`;
      }
    }
  }

  // Standard YYYY-MM-DD
  const isoMatch = h.match(/\b(202\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    return isoMatch[0];
  }

  return null;
}

export function resolveTimeHint(hint: string | null | undefined): string | null {
  if (!hint || !hint.trim()) return null;
  const h = hint.toLowerCase().trim();

  // Pattern: "10:30am", "8pm", "9:30 am", "8:00 pm"
  const match12 = h.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const meridian = match12[3].toLowerCase();
    if (meridian === "pm" && hours < 12) hours += 12;
    if (meridian === "am" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // Pattern: "20:00", "09:30", "13:24"
  const match24 = h.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return null;
}

export async function parseQuickEntry(input: string): Promise<QuickEntryResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Entry cannot be empty.");
  }
  if (trimmed.length > 200) {
    throw new Error("Entry is too long (maximum 200 characters).");
  }

  let rawResult: QuickEntryRawOutput;

  // Primary: Groq
  try {
    rawResult = await parseWithGroq(trimmed);
  } catch (groqError) {
    console.error("[Quick Entry] Groq failed", safeError(groqError));

    // Fallback: Gemini
    try {
      rawResult = await parseWithGemini(trimmed);
    } catch (geminiError) {
      console.error(
        "[Quick Entry] Gemini fallback failed",
        safeError(geminiError),
      );
      throw new QuickEntryError();
    }
  }

  // Normalize amount
  const validAmount = normalizeAmount(rawResult.amount);
  if (!validAmount) {
    throw new AmountNotFoundError();
  }

  // Confidence handling
  let finalCategory = normalizeCategory(rawResult.category);
  const finalMerchant = rawResult.merchant?.trim() || null;
  const finalDescription = rawResult.description?.trim() || null;

  if (rawResult.confidence < 0.75) {
    // If confidence is lower, avoid guessing unclear fields
    if (!finalMerchant) {
      finalCategory = "Other";
    }
  }

  // Server-side deterministic date resolution
  const resolvedDate =
    resolveDateHint(rawResult.dateHint) || resolveDateHint(trimmed);

  // Server-side deterministic time resolution
  const resolvedTime =
    resolveTimeHint(rawResult.timeHint) || resolveTimeHint(trimmed);

  // Server-side deterministic payment method resolution
  const resolvedPaymentMethod = normalizePaymentMethod(
    rawResult.paymentMethod,
    trimmed,
  );

  // Clean tags
  const cleanTags = Array.isArray(rawResult.tags)
    ? rawResult.tags.map((t) => t.trim()).filter(Boolean)
    : [];

  // Note, location, split
  const cleanNote = rawResult.note?.trim() || null;
  const cleanLocation = rawResult.location?.trim() || null;
  const cleanSplit =
    typeof rawResult.split === "number" && rawResult.split >= 1
      ? Math.round(rawResult.split)
      : null;

  const normalized: QuickEntryResult = {
    amount: validAmount,
    category: finalCategory,
    merchant: finalMerchant,
    description: finalDescription,
    date: resolvedDate,
    time: resolvedTime,
    paymentMethod: resolvedPaymentMethod,
    tags: cleanTags,
    note: cleanNote,
    location: cleanLocation,
    split: cleanSplit,
    confidence: rawResult.confidence,
  };

  return QuickEntryResultSchema.parse(normalized);
}
