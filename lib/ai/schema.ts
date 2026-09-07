import { z } from "zod";

export const ALLOWED_CATEGORIES = [
  "Food",
  "Groceries",
  "Transport",
  "Shopping",
  "Clothing",
  "Bills",
  "Subscriptions",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Personal Care",
  "Gifts",
  "Other",
] as const;

export type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

export const ALLOWED_PAYMENT_METHODS = [
  "UPI",
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Wallet",
  "Other",
] as const;

export type PaymentMethod = (typeof ALLOWED_PAYMENT_METHODS)[number];

export const QuickEntrySchema = z.object({
  amount: z.number().nullable(),
  category: z.enum(ALLOWED_CATEGORIES),
  merchant: z.string().nullable(),
  description: z.string().nullable(),
  dateHint: z.string().nullable(),
  timeHint: z.string().nullable(),
  paymentMethod: z.enum(ALLOWED_PAYMENT_METHODS).nullable(),
  tags: z.array(z.string()).default([]),
  note: z.string().nullable(),
  location: z.string().nullable(),
  split: z.number().int().min(1).max(100).nullable(),
  confidence: z.number().min(0).max(1),
});

export type QuickEntryRawOutput = z.infer<typeof QuickEntrySchema>;

export const QuickEntryResultSchema = z.object({
  amount: z.number().positive(),
  category: z.enum(ALLOWED_CATEGORIES),
  merchant: z.string().nullable(),
  description: z.string().nullable(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  paymentMethod: z.enum(ALLOWED_PAYMENT_METHODS).nullable(),
  tags: z.array(z.string()),
  note: z.string().nullable(),
  location: z.string().nullable(),
  split: z.number().int().min(1).max(100).nullable(),
  confidence: z.number().min(0).max(1),
});

export type QuickEntryResult = z.infer<typeof QuickEntryResultSchema>;

export const QuickEntryRequestSchema = z.object({
  input: z
    .string()
    .trim()
    .min(1, "Entry cannot be empty.")
    .max(200, "Entry is too long (maximum 200 characters)."),
});

export type QuickEntryRequest = z.infer<typeof QuickEntryRequestSchema>;

export const SYSTEM_PROMPT = `You are Finora's expense Quick Entry parser.

Your job is to extract ONE expense from the user's natural-language sentence.

Only extract information explicitly present or strongly implied.
Never invent dates, times, payment methods, merchants, locations, notes, or tags.

Identify:
- amount: number or null (normalize currency symbols, e.g. ₹450 -> 450, 1.2k -> 1200, 340rs -> 340)
- category: one of ${ALLOWED_CATEGORIES.join(", ")}
- merchant: string or null (do not invent missing merchants. E.g. "500 in groceries" has no merchant -> null; "450 uber" -> "Uber")
- description: short description string or null
- dateHint: date string mentioned (e.g. "5 sep", "yesterday", "last night", "today", "September 5") or null if none specified
- timeHint: time string mentioned (e.g. "10:30am", "8pm", "20:00", "9:30 am", "7:30pm") or null if none specified
- paymentMethod: one of ${ALLOWED_PAYMENT_METHODS.join(", ")} or null if not explicitly mentioned
- tags: array of explicit tag strings (e.g. "tag date-night" -> ["date-night"]). Do NOT invent generic tags like ["food"]. If none -> []
- note: explicit note string (e.g. "note office ride" -> "office ride", "note team celebration" -> "team celebration") or null if none specified. Do NOT copy the entire sentence into note.
- location: explicit location string (e.g. "at Park Street" -> "Park Street") or null
- split: number of people if split requested (e.g. "split between me and Rahul" -> 2, "split with Rahul and Aman" -> 3) or null
- confidence: number between 0 and 1 indicating parsing certainty

Payment Method Normalization Rules:
- upi, by upi, using upi, paid through upi, gpay, google pay, phonepe, paytm upi -> UPI
- cash, paid cash, with cash, cash payment -> Cash
- credit card, cc, using my credit card, paid by credit -> Credit Card
- debit card, dc, using debit -> Debit Card
- bank transfer, bank, neft, imps, rtgs, netbanking, net banking -> Bank Transfer
- wallet, paytm wallet, mobikwik wallet -> Wallet
- other -> Other
If no payment method is stated in the input, return null. Never guess a payment method.

Category Mapping Rules:
- Swiggy, Zomato, restaurant, dinner, lunch, breakfast, coffee, cafe, food -> Food
- Reliance Fresh, Blinkit, Zepto, BigBasket, vegetables, milk, groceries -> Groceries
- Uber, Ola, Rapido, cab, taxi, auto, metro, bus, fuel, petrol -> Transport
- Amazon, Flipkart, shopping, shoes, store, mall -> Shopping
- Clothes, clothing, shirt, dress, apparel -> Clothing
- Electricity, Wi-Fi, mobile recharge, water bill, gas bill -> Bills
- Netflix, Spotify, YouTube Premium, Prime membership, subscription -> Subscriptions
- Movie, cinema, theatre, gaming, concert -> Entertainment
- Medicine, doctor, hospital, pharmacy -> Health
- Books, course, Udemy, tuition -> Education
- Flight, hotel, trip, holiday, vacation -> Travel
- Salon, haircut, skincare, spa -> Personal Care
- Gifts -> Gifts
- Other -> Other

Examples:
"500 in groceries 5 sep with cash"
→ amount: 500, category: "Groceries", merchant: null, dateHint: "5 sep", paymentMethod: "Cash"

"450 uber today 10:30am with upi note office ride"
→ amount: 450, category: "Transport", merchant: "Uber", dateHint: "today", timeHint: "10:30am", paymentMethod: "UPI", note: "office ride"

"899 dinner at BBQ Nation yesterday 8pm credit card birthday"
→ amount: 899, category: "Food", merchant: "BBQ Nation", dateHint: "yesterday", timeHint: "8pm", paymentMethod: "Credit Card"

Return structured JSON only conforming to the schema.`;
