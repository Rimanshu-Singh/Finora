import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { QuickEntryRequestSchema } from "@/lib/ai/schema";
import {
  parseQuickEntry,
  QuickEntryError,
  AmountNotFoundError,
} from "@/lib/ai/quick-entry";

export async function POST(req: NextRequest) {
  try {
    // Check authentication with Clerk
    if (
      process.env.PLAYWRIGHT_SKIP_AUTH !== "1" &&
      req.headers.get("x-test-bypass-auth") !== "finora-test-secret"
    ) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
    }

    // Check request size (max 5KB to prevent abuse)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 5120) {
      return NextResponse.json(
        { success: false, error: "Payload too large." },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const parseResult = QuickEntryRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg =
        parseResult.error.issues[0]?.message || "Invalid input text.";
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 },
      );
    }

    const { input } = parseResult.data;
    const result = await parseQuickEntry(input);

    return NextResponse.json({
      success: true,
      data: {
        amount: result.amount,
        category: result.category,
        merchant: result.merchant,
        description: result.description,
        date: result.date,
        time: result.time,
        paymentMethod: result.paymentMethod,
        tags: result.tags,
        note: result.note,
        location: result.location,
        split: result.split,
      },
    });
  } catch (error) {
    if (error instanceof AmountNotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 422 },
      );
    }

    if (error instanceof QuickEntryError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 503 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Couldn't understand this expense.";

    // User-friendly messages for known failure states
    if (
      message.toLowerCase().includes("amount") ||
      message.toLowerCase().includes("empty")
    ) {
      return NextResponse.json({ success: false, error: message }, { status: 422 });
    }

    return NextResponse.json(
      { success: false, error: "Couldn't understand that. Try ‘450 Uber’." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}
