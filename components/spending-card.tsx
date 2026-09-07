"use client";

import { useState } from "react";
import Link from "next/link";
import { Utensils, ChevronRight, Check, Copy, Shield, Snowflake, X, Eye, EyeOff } from "lucide-react";
import { useLedger } from "./provider";
import { money, sum, MONTH } from "@/lib/format";
import type { Period } from "@/lib/types";

interface SpendingCardProps {
  spent: number;
  period: Period;
  onPeriodChange?: (period: Period) => void;
  yesterdaySpent: number;
  todaySpent: number;
}

export function SpendingCard({
  spent,
  period,
  onPeriodChange,
  yesterdaySpent,
  todaySpent,
}: SpendingCardProps) {
  const { data, notify } = useLedger();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const currency = data.settings.currency;
  const locale = data.settings.locale;

  // Calculate monthly stats for budget tracker
  const monthlyExpenses = data.expenses.filter((e) => e.date.startsWith(MONTH));
  const monthlyTotal = sum(monthlyExpenses);
  const budgetLimit = data.budgets.find((b) => !b.categoryId)?.limit ?? 30000;
  const budgetUsedPct = Math.min(100, Math.round((monthlyTotal / budgetLimit) * 100)) || 64;
  const budgetLeftPct = Math.max(0, 100 - budgetUsedPct);

  // Top category calculation (Food)
  const foodExpenses = monthlyExpenses.filter((e) => e.categoryId === "food");
  const foodTotal = sum(foodExpenses);
  const foodPct = monthlyTotal > 0 ? Math.round((foodTotal / monthlyTotal) * 100) : 32;

  // Comparison with yesterday
  const diff = Math.abs(yesterdaySpent - todaySpent);
  const isLess = todaySpent <= yesterdaySpent;

  const handleCopyCardNumber = () => {
    navigator.clipboard.writeText("5412 7523 9081 5894");
    setCopied(true);
    notify("Copied Mastercard ending in 5894 to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="sleek-spending-card-container">
        <div
          className="sleek-spending-card"
          onClick={() => setShowDetailsModal(true)}
          role="button"
          tabIndex={0}
          title="Tap to view card details"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowDetailsModal(true);
            }
          }}
        >
          {/* Ambient Warm Horizon Glow in Bottom-Right */}
          <div className="card-ambient-glow" aria-hidden="true" />
          <div className="card-glass-sheen" aria-hidden="true" />

          {/* Concentric Vector Arcs Emanating from Ambient Glow */}
          <svg
            className="card-concentric-svg"
            viewBox="0 0 700 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="510" cy="340" r="140" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.2" />
            <circle cx="510" cy="340" r="210" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.2" />
            <circle cx="510" cy="340" r="280" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1.2" />
            <circle cx="510" cy="340" r="350" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1.2" />
            <circle cx="510" cy="340" r="430" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="1.2" />
          </svg>

          {/* Card Inner Content */}
          <div className="card-inner">
            {/* Top Row: Amount on Left, Gold EMV Chip & Contactless on Right */}
            <div className="card-top-section">
              <div className="card-spent-block">
                <button
                  type="button"
                  className="card-eyebrow-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPeriodChange) {
                      const periods: Period[] = ["Today", "Week", "Month", "Year"];
                      const next = periods[(periods.indexOf(period) + 1) % periods.length];
                      onPeriodChange(next);
                    }
                  }}
                  title="Click to switch period"
                >
                  <span className="card-eyebrow-label">
                    {period === "Today" ? "SPENT THIS MONTH" : `SPENT THIS ${period.toUpperCase()}`}
                  </span>
                </button>

                <div className="card-amount-line">
                  <span className="card-amount-value hero-amount">
                    {isHidden ? "••••••" : money(spent, currency, locale)}
                  </span>
                  <button
                    type="button"
                    className="card-hide-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsHidden(!isHidden);
                    }}
                    title={isHidden ? "Show spent amount" : "Hide spent amount"}
                    aria-label={isHidden ? "Show spent amount" : "Hide spent amount"}
                  >
                    {isHidden ? (
                      <EyeOff size={15} strokeWidth={1.8} />
                    ) : (
                      <Eye size={15} strokeWidth={1.8} />
                    )}
                  </button>
                </div>

                {/* Trend Badge */}
                <div
                  className={`card-trend-pill ${isLess ? "trend-down" : "trend-up"}`}
                  title={`${money(diff, currency, locale)} ${isLess ? "less" : "more"} than yesterday`}
                >
                  <span className="trend-pill-icon">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                  </span>
                  <span className="trend-pill-amount">
                    {isHidden ? "••••" : money(diff, currency, locale)}
                  </span>
                  <span className="trend-pill-sub">
                    {isLess ? "less" : "more"} than yesterday
                  </span>
                </div>
              </div>

              {/* Gold EMV Chip & Contactless Waves on Top-Right */}
              <div className="card-chip-group">
                <div className="gold-emv-chip" aria-hidden="true">
                  <div className="chip-inner-pattern" />
                </div>
                <svg
                  className="contactless-waves-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                </svg>
              </div>
            </div>

            {/* Middle Row: Budget Progress on Left, Food Category Pill on Right */}
            <div className="card-middle-section">
              {/* Budget Tracker */}
              <div className="card-budget-tracker">
                <div className="budget-pie-icon" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2.5" />
                    <path
                      d="M12 2A10 10 0 0 1 22 12H12V2Z"
                      fill="#f59e0b"
                    />
                    <path
                      d="M12 12L19 19A10 10 0 0 1 12 22V12Z"
                      fill="#d97706"
                    />
                  </svg>
                </div>
                <div className="budget-progress-column">
                  <div className="budget-label-row">
                    <span className="budget-label-text">
                      Budget <strong>{budgetUsedPct}%</strong> used
                    </span>
                  </div>
                  <div className="budget-track-row">
                    <div className="budget-track-bar">
                      <div
                        className="budget-track-fill"
                        style={{ width: `${budgetUsedPct}%` }}
                      />
                    </div>
                    <span className="budget-left-text">{budgetLeftPct}% left</span>
                  </div>
                </div>
              </div>

              {/* Category Pill Button on Middle-Right */}
              <Link
                href="/categories"
                className="card-category-pill"
                onClick={(e) => e.stopPropagation()}
                title="View Category Breakdown"
              >
                <Utensils size={14} className="cat-pill-icon" />
                <span className="cat-pill-text">Food • {foodPct}%</span>
                <ChevronRight size={13} className="cat-pill-chevron" />
              </Link>
            </div>

            {/* Bottom Row: Masked Card Digits on Left, Mastercard Emblem on Right */}
            <div className="card-bottom-section">
              <div className="card-number-dots-group">
                <span className="dots-cluster">••••</span>
                <span className="dots-cluster">••••</span>
                <span className="dots-cluster">••••</span>
                <span className="digits-visible">5894</span>
              </div>

              {/* Authentic Mastercard Emblem */}
              <div className="mastercard-emblem" aria-label="Mastercard">
                <div className="mc-circles-wrapper" aria-hidden="true">
                  <span className="mc-circle mc-red" />
                  <span className="mc-circle mc-amber" />
                </div>
                <span className="mc-wordmark">mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Card Details Modal */}
      {showDetailsModal && (
        <div
          className="card-modal-backdrop"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="card-modal-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Card details"
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Finora Black Metal</h3>
                <span className="modal-badge">World Elite Mastercard</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDetailsModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Virtual Card Preview */}
            <div className={`virtual-card-preview ${isFrozen ? "frozen" : ""}`}>
              <div className="vc-top">
                <span className="vc-chip" />
                <span className="vc-brand">Mastercard</span>
              </div>
              <div className="vc-number">
                5412 •••• •••• 5894
              </div>
              <div className="vc-bottom">
                <div>
                  <div className="vc-label">CARDHOLDER</div>
                  <div className="vc-val">{data.settings.name}</div>
                </div>
                <div>
                  <div className="vc-label">EXPIRES</div>
                  <div className="vc-val">09/29</div>
                </div>
                <div>
                  <div className="vc-label">CVV</div>
                  <div className="vc-val">{isFrozen ? "•••" : "742"}</div>
                </div>
              </div>
              {isFrozen && (
                <div className="frozen-overlay">
                  <Snowflake size={24} />
                  <span>Card is frozen</span>
                </div>
              )}
            </div>

            {/* Card Limit Tracker */}
            <div className="card-limit-box">
              <div className="limit-header">
                <span>Monthly Card Limit</span>
                <span className="limit-numbers">
                  {money(1284, currency, locale)} / {money(150000, currency, locale)}
                </span>
              </div>
              <div className="limit-progress-bar">
                <div
                  className="limit-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.round((1284 / 150000) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Card Actions */}
            <div className="card-actions-grid">
              <button
                type="button"
                className="card-action-tile"
                onClick={handleCopyCardNumber}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span>{copied ? "Copied!" : "Copy Number"}</span>
              </button>
              <button
                type="button"
                className={`card-action-tile ${isFrozen ? "active-frozen" : ""}`}
                onClick={() => {
                  setIsFrozen(!isFrozen);
                  notify(
                    !isFrozen
                      ? "Card temporarily frozen for online purchases"
                      : "Card unlocked successfully"
                  );
                }}
              >
                <Snowflake size={18} />
                <span>{isFrozen ? "Unfreeze Card" : "Freeze Card"}</span>
              </button>
              <button
                type="button"
                className="card-action-tile"
                onClick={() => {
                  notify("Security settings updated");
                }}
              >
                <Shield size={18} />
                <span>Protection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
