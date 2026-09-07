"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { useLedger } from "@/components/provider";
import { money, sum, TODAY } from "@/lib/format";
import type { Expense } from "@/lib/types";

// ============================================================================
// Types & Chart Configuration
// ============================================================================

export interface SpendingRhythmChartProps {
  expenses?: Expense[];
  className?: string;
}

export interface DailySpendingPoint {
  date: string;       // "1 Sept"
  shortDate: string;  // "1 Sep"
  fullDate: string;   // "2026-09-01"
  spending: number;
  diffFromAvg: number;
  isToday: boolean;
}

const chartConfig = {
  spending: {
    label: "Spending",
    theme: {
      light: "#18181b",
      dark: "#f4f4f5",
    },
  },
} satisfies ChartConfig;

// ============================================================================
// Helper Functions
// ============================================================================

export function formatCompactCurrency(val: number): string {
  if (val === 0) return "₹0";
  if (val >= 1000) {
    const k = val / 1000;
    return `₹${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return `₹${Math.round(val)}`;
}

export function calculateAverage(values: number[]): number {
  if (!values.length) return 0;
  const total = values.reduce((a, b) => a + b, 0);
  return Math.round(total / values.length);
}

export function calculateWeekChange(currentTotal: number, prevTotal: number) {
  if (prevTotal === 0) {
    return {
      pct: currentTotal > 0 ? "100.0" : "0.0",
      isHigher: currentTotal > 0,
    };
  }
  const diff = currentTotal - prevTotal;
  const pct = Math.abs((diff / prevTotal) * 100).toFixed(1);
  return {
    pct,
    isHigher: diff > 0,
  };
}

// ============================================================================
// Custom Reference Line Label
// ============================================================================

interface AverageLabelProps {
  viewBox?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  dailyAvgFormatted: string;
}

function AverageReferenceLabel({ viewBox, dailyAvgFormatted }: AverageLabelProps) {
  if (!viewBox || viewBox.x === undefined || viewBox.y === undefined || !viewBox.width) {
    return null;
  }

  const { x, y, width } = viewBox;
  const pillWidth = 118;
  const pillHeight = 20;
  const labelX = x + width - pillWidth - 6;
  const labelY = y - pillHeight / 2;

  return (
    <g className="average-ref-badge-group">
      <rect
        x={labelX}
        y={labelY}
        width={pillWidth}
        height={pillHeight}
        rx={4}
        className="avg-pill-bg"
      />
      <text
        x={labelX + pillWidth / 2}
        y={labelY + 14}
        textAnchor="middle"
        className="avg-pill-text"
      >
        Daily avg {dailyAvgFormatted}
      </text>
    </g>
  );
}

// ============================================================================
// Custom Active Dot Component
// ============================================================================

interface ActiveDotProps {
  cx?: number;
  cy?: number;
}

function CustomActiveDot({ cx, cy }: ActiveDotProps) {
  if (cx === undefined || cy === undefined) return null;

  return (
    <g className="chart-active-dot-group">
      {/* Soft translucent outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill="var(--spending-line)"
        fillOpacity={0.12}
      />
      {/* Main interactive dot */}
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="var(--spending-dot-fill)"
        stroke="var(--spending-dot-border)"
        strokeWidth={2}
      />
      {/* Inner center dot */}
      <circle
        cx={cx}
        cy={cy}
        r={1.8}
        fill="var(--spending-dot-border)"
      />
    </g>
  );
}

// ============================================================================
// Custom shadcn Tooltip
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: DailySpendingPoint;
  }>;
  dailyAvg: number;
  currency: string;
  locale: string;
}

function CustomRhythmTooltip({
  active,
  payload,
  dailyAvg,
  currency,
  locale,
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const point = payload[0].payload;
  const spent = point.spending;
  const diff = Math.abs(spent - dailyAvg);
  const isAbove = spent >= dailyAvg;

  return (
    <div className="rhythm-tooltip-card">
      <div className="rhythm-tooltip-header">
        <span className="tooltip-date">{point.date}</span>
        {point.isToday && <span className="tooltip-today-tag">Today</span>}
      </div>

      <div className="rhythm-tooltip-body">
        <div className="tooltip-amount-group">
          <span className="tooltip-spent-amount">
            {money(spent, currency, locale)}
          </span>
          <span className="tooltip-spent-label">Spent</span>
        </div>

        {dailyAvg > 0 && (
          <div
            className={`tooltip-avg-diff ${
              isAbove ? "diff-above" : "diff-below"
            }`}
          >
            <span>
              {money(diff, currency, locale)}{" "}
              {isAbove ? "above daily average" : "below daily average"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main SpendingRhythmChart Component
// ============================================================================

export function SpendingRhythmChart({
  expenses: propExpenses,
  className,
}: SpendingRhythmChartProps) {
  const { data } = useLedger();
  const expenses = propExpenses ?? data.expenses;
  const currency = data.settings.currency;
  const locale = data.settings.locale;

  // Responsive state for mobile axes
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 7-day data pipeline ending at TODAY
  const days = 7;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const rawData: DailySpendingPoint[] = React.useMemo(() => {
    const points: DailySpendingPoint[] = [];
    const baseDate = new Date(`${TODAY}T12:00:00`);

    for (let i = 0; i < days; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - (days - 1 - i));
      const isoDate = d.toISOString().slice(0, 10);

      const dayExpenses = expenses.filter((e) => e.date === isoDate);
      const dayTotal = sum(dayExpenses);

      const dayNum = d.getDate();
      const monthIdx = d.getMonth();

      points.push({
        date: `${dayNum} ${monthNames[monthIdx]}`,
        shortDate: `${dayNum} ${shortMonthNames[monthIdx]}`,
        fullDate: isoDate,
        spending: dayTotal,
        diffFromAvg: 0,
        isToday: isoDate === TODAY,
      });
    }

    return points;
  }, [expenses]);

  // Aggregate stats
  const spendingValues = React.useMemo(
    () => rawData.map((d) => d.spending),
    [rawData]
  );

  const thisWeekTotal = React.useMemo(
    () => spendingValues.reduce((a, b) => a + b, 0),
    [spendingValues]
  );

  const dailyAvg = React.useMemo(
    () => calculateAverage(spendingValues),
    [spendingValues]
  );

  const chartData = React.useMemo(
    () =>
      rawData.map((d) => ({
        ...d,
        diffFromAvg: d.spending - dailyAvg,
      })),
    [rawData, dailyAvg]
  );

  // Previous 7-day total (days -13 to -7)
  const prevWeekTotal = React.useMemo(() => {
    const baseDate = new Date(`${TODAY}T12:00:00`);
    let total = 0;
    for (let i = 7; i < 14; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const isoDate = d.toISOString().slice(0, 10);
      total += sum(expenses.filter((e) => e.date === isoDate));
    }
    return total;
  }, [expenses]);

  const { pct, isHigher } = React.useMemo(
    () => calculateWeekChange(thisWeekTotal, prevWeekTotal),
    [thisWeekTotal, prevWeekTotal]
  );

  const maxVal = React.useMemo(
    () => Math.max(1000, ...spendingValues),
    [spendingValues]
  );

  // Format Y-axis bounds cleanly with round intervals
  const yDomainMax = React.useMemo(() => {
    const padded = maxVal * 1.15;
    return Math.max(1000, Math.ceil(padded / 1000) * 1000);
  }, [maxVal]);

  const formattedDailyAvg = React.useMemo(
    () => money(dailyAvg, currency, locale),
    [dailyAvg, currency, locale]
  );

  // XAxis responsive tick formatter
  const formatXAxisTick = (tickVal: string, index: number) => {
    if (isMobile) {
      return index % 2 === 0 ? tickVal.replace("Sept", "Sep") : "";
    }
    return tickVal;
  };

  return (
    <section className={`spending-rhythm-section ${className || ""}`}>
      {/* Header & Integrated Weekly Summary */}
      <div className="spending-rhythm-header">
        <div className="header-text-group">
          <h2 className="spending-rhythm-title">Spending rhythm</h2>
          <p className="spending-rhythm-subtitle">
            Your week, one day at a time.
          </p>
        </div>

        <div className="header-actions-group">
          {/* Subdued Financial Summary */}
          <div className="weekly-summary-badge" aria-label="Weekly spending summary">
            <div className="weekly-amount-stack">
              <span className="weekly-amount-val">
                {money(thisWeekTotal, currency, locale)}
              </span>
              <span className="weekly-amount-label">this week</span>
            </div>

            <div
              className={`weekly-comparison-pill ${
                isHigher ? "spending-increased" : "spending-decreased"
              }`}
              title={`${pct}% ${isHigher ? "more" : "less"} than last week`}
            >
              {isHigher ? (
                <TrendingUp size={12} className="trend-arrow-icon" />
              ) : (
                <TrendingDown size={12} className="trend-arrow-icon" />
              )}
              <span>{pct}% vs last week</span>
            </div>
          </div>

          <Link href="/analytics" className="insights-action-link">
            <span>View insights</span>
            <ArrowUpRight size={14} className="insights-arrow-glyph" />
          </Link>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="spending-rhythm-chart-wrapper">
        <ChartContainer
          config={chartConfig}
          className="spending-rhythm-chart-canvas"
        >
          <AreaChart
            data={chartData}
            margin={{ top: 18, right: 14, left: -14, bottom: 4 }}
          >
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--spending-fill, var(--color-spending))"
                  stopOpacity="var(--spending-fill-opacity-top, 0.14)"
                />
                <stop
                  offset="50%"
                  stopColor="var(--spending-fill, var(--color-spending))"
                  stopOpacity="var(--spending-fill-opacity-mid, 0.04)"
                />
                <stop
                  offset="100%"
                  stopColor="var(--spending-fill, var(--color-spending))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            {/* Subtle Horizontal-Only Grid */}
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 6"
              stroke="var(--spending-grid)"
            />

            {/* X-Axis */}
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={{
                fill: "var(--muted)",
                fontSize: 11.5,
                fontFamily: "inherit",
              }}
              interval="preserveStartEnd"
              tickFormatter={formatXAxisTick}
            />

            {/* Y-Axis */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{
                fill: "var(--muted)",
                fontSize: 10.5,
                fontFamily: "inherit",
              }}
              domain={[0, yDomainMax]}
              tickFormatter={formatCompactCurrency}
            />

            {/* Refined Daily Average Line with Surface-Pill Badge */}
            {dailyAvg > 0 && (
              <ReferenceLine
                y={dailyAvg}
                stroke="var(--spending-average)"
                strokeDasharray="5 5"
                strokeWidth={1.2}
                label={
                  <AverageReferenceLabel
                    dailyAvgFormatted={formattedDailyAvg}
                  />
                }
              />
            )}

            {/* Premium shadcn Tooltip with Subtle Hover Cursor */}
            <ChartTooltip
              cursor={{
                stroke: "var(--spending-cursor)",
                strokeWidth: 1.2,
                strokeDasharray: "3 3",
              }}
              content={
                <CustomRhythmTooltip
                  dailyAvg={dailyAvg}
                  currency={currency}
                  locale={locale}
                />
              }
            />

            {/* Main Smooth Area Line */}
            <Area
              type="monotone"
              dataKey="spending"
              stroke="var(--spending-line, var(--color-spending))"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="url(#spendingGradient)"
              fillOpacity={1}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
              dot={(dotProps: { cx?: number; cy?: number; payload?: DailySpendingPoint }) => {
                const { cx, cy, payload } = dotProps;
                if (payload?.isToday && cx && cy) {
                  return (
                    <circle
                      key={`today-${payload.date}`}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill="var(--spending-line)"
                      opacity={0.65}
                    />
                  );
                }
                return null;
              }}
              activeDot={<CustomActiveDot />}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </section>
  );
}
