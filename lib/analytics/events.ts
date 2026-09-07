/**
 * Typed Finora PostHog Event Registry
 * Strict Privacy Rule: NEVER include raw financial amounts, merchant names,
 * descriptions, notes, locations, or account numbers in analytics payloads.
 */

export type FinoraEvent =
  | "dashboard_viewed"
  | "expense_create_started"
  | "expense_created"
  | "expense_updated"
  | "expense_deleted"
  | "quick_entry_used"
  | "quick_entry_succeeded"
  | "quick_entry_failed"
  | "budget_created"
  | "budget_updated"
  | "budget_deleted"
  | "transactions_viewed"
  | "analytics_viewed"
  | "budgets_viewed"
  | "category_filter_used";

export interface ExpenseEventProperties {
  payment_method_present?: boolean;
  merchant_present?: boolean;
  tags_count?: number;
  has_note?: boolean;
  has_location?: boolean;
  is_split?: boolean;
  used_quick_entry?: boolean;
  category?: string; // category slug or name (high-level grouping only)
}

export interface QuickEntryEventProperties {
  latency_ms?: number;
  fallback_used?: boolean;
  fields_detected_count?: number;
}
