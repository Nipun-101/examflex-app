"use client";

import { useState } from "react";
import {
  AnalysisInsightGauge,
  type GaugeSegment,
  type GaugeTick,
} from "@/components/analysis/analysis-insight-gauge";
import {
  GOAL_STEP,
  accuracyView,
  marksView,
  nextGoalView,
  timeView,
  type LatestMockMetrics,
} from "@/lib/analysis/latest-mock-metrics";

type InsightKey = "accuracy" | "time" | "marks" | "goal";

const CHIP_LABELS: Record<InsightKey, string> = {
  accuracy: "Accuracy",
  time: "Time",
  marks: "Marks",
  goal: "Next goal",
};

type Insight = {
  big: string;
  caption: string;
  detail: string;
  pill: string;
  gauge: {
    needle?: number;
    fillTo?: number;
    fillClassName?: string;
    segments?: readonly GaugeSegment[];
    denseTicks?: boolean;
    ticks?: readonly GaugeTick[];
    startLabel: string;
    endLabel: string;
    ariaLabel: string;
  };
};

function fmt(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function signed(value: number): string {
  return value >= 0 ? `+${fmt(value)}` : `−${fmt(Math.abs(value))}`;
}

function markingText(m: LatestMockMetrics): string {
  return m.negativeMarking > 0
    ? `Right answers earn ${signed(m.marksPerCorrect)}, wrong ones cost −${fmt(m.negativeMarking)}.`
    : `Each right answer earns ${signed(m.marksPerCorrect)}.`;
}

function buildInsights(m: LatestMockMetrics): Partial<Record<InsightKey, Insight>> {
  const result: Partial<Record<InsightKey, Insight>> = {};

  const acc = accuracyView(m);
  if (acc) {
    const pct = Math.round(acc.accuracy01 * 100);
    const be = acc.breakEven01 === null ? null : Math.round(acc.breakEven01 * 100);
    result.accuracy = {
      big: `${pct}%`,
      caption: "accuracy",
      detail: `${m.correct} correct of ${m.attempted} attempted. ${markingText(m)}`,
      pill:
        be === null
          ? "No negative marking, so every attempt is free"
          : acc.accuracy01 * 100 >= be
            ? `Break-even is ${be}%, and you are above it`
            : `Break-even is ${be}%, and you are below it`,
      gauge: {
        needle: acc.accuracy01,
        fillTo: acc.accuracy01,
        ticks:
          acc.breakEven01 === null
            ? []
            : [{ ratio: acc.breakEven01, label: `Break-even ${be}%` }],
        startLabel: "0%",
        endLabel: "100%",
        ariaLabel: `Accuracy ${pct} percent`,
      },
    };
  }

  const t = timeView(m);
  if (t) {
    const used = t.usedMinutes < 1 ? "<1" : String(Math.round(t.usedMinutes));
    result.time = {
      big: `${used} min`,
      caption: `of ${Math.round(t.durationMinutes)} used`,
      detail:
        t.avgSecondsPerAttempted === null
          ? "You did not attempt any question."
          : `An average of ${Math.round(t.avgSecondsPerAttempted)} seconds on each question you attempted.`,
      pill: `A full mock gives you ${Math.round(t.allottedSecondsPerQuestion)} seconds per question`,
      gauge: {
        needle: t.used01,
        fillTo: t.used01,
        startLabel: "0 min",
        endLabel: `${Math.round(t.durationMinutes)} min`,
        ariaLabel: `${used} minutes used of ${Math.round(t.durationMinutes)}`,
      },
    };
  }

  const mv = marksView(m);
  result.marks = {
    big: fmt(mv.leftOnTable),
    caption: "marks left on the table",
    detail:
      `${m.skipped} skipped ${m.skipped === 1 ? "question" : "questions"} at ${fmt(m.marksPerCorrect)} marks each.` +
      (mv.penalty > 0 ? ` Wrong answers cost ${fmt(mv.penalty)} more.` : ""),
    pill: `Every 10 skips you turn into right answers: ${signed(mv.perTenSkips)} marks`,
    gauge: {
      denseTicks: true,
      segments: [
        {
          from: 0,
          to: mv.earnedGross / m.maxScore,
          className: "text-study-lime",
        },
        {
          from: mv.earnedGross / m.maxScore,
          to: (mv.earnedGross + mv.wrongPotential) / m.maxScore,
          className: "text-study-peach",
        },
      ],
      startLabel: "0",
      endLabel: `${fmt(m.maxScore)} marks`,
      ariaLabel: `${fmt(mv.leftOnTable)} of ${fmt(m.maxScore)} marks left on the table`,
    },
  };

  const goal = nextGoalView(m);
  if (!goal.done) {
    const ticks: GaugeTick[] = [];
    for (let v = GOAL_STEP; v < m.maxScore; v += GOAL_STEP) {
      ticks.push({
        ratio: v / m.maxScore,
        long: true,
        ...(v === goal.milestone ? { label: String(v) } : {}),
      });
    }
    result.goal = {
      big: String(goal.correctNeeded),
      caption: `more correct ${goal.correctNeeded === 1 ? "answer" : "answers"} to reach ${fmt(goal.milestone)}`,
      detail: `You are at ${fmt(goal.score)} now. Each correct answer adds ${fmt(m.marksPerCorrect)} ${m.marksPerCorrect === 1 ? "mark" : "marks"}.`,
      pill: `Next milestone: ${fmt(goal.milestone)} marks`,
      gauge: {
        needle: goal.score01,
        fillTo: goal.milestone01,
        fillClassName: "text-study-lime/35",
        ticks,
        startLabel: "0",
        endLabel: fmt(m.maxScore),
        ariaLabel: `${fmt(goal.score)} marks, next milestone ${fmt(goal.milestone)}`,
      },
    };
  }

  return result;
}

const ORDER: readonly InsightKey[] = ["accuracy", "time", "marks", "goal"];

type Props = {
  label: string;
  metrics: LatestMockMetrics;
};

export function AnalysisLatestMockInsights({ label, metrics }: Props) {
  const insights = buildInsights(metrics);
  const available = ORDER.filter((key) => insights[key]);
  const [selected, setSelected] = useState<InsightKey>("accuracy");
  const activeKey = insights[selected] ? selected : available[0];
  const active = activeKey ? insights[activeKey] : undefined;
  if (!active || !activeKey) return null;

  return (
    <section className="rounded-[18px] bg-study-ink px-4 py-5 text-white sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-5 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8 sm:gap-y-4">
        <div
          role="group"
          aria-label="Latest mock insight"
          className="order-1 flex flex-wrap gap-2 sm:col-start-2 sm:row-start-1 sm:justify-end"
        >
          {available.map((key) => {
            const on = key === activeKey;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => setSelected(key)}
                className={`h-8 rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                  on
                    ? "border-study-lime bg-study-lime text-study-ink"
                    : "border-white/25 text-study-on-dark hover:border-white/50"
                }`}
              >
                {CHIP_LABELS[key]}
              </button>
            );
          })}
        </div>

        <div className="order-2 flex justify-center sm:col-start-2 sm:row-start-2 sm:justify-end">
          <AnalysisInsightGauge {...active.gauge} />
        </div>

        <div className="order-3 min-w-0 sm:col-start-1 sm:row-span-2 sm:row-start-1">
          <p className="text-[0.625rem] font-semibold tracking-wide text-study-lime uppercase">
            {label}
          </p>
          <p className="mt-4 font-display text-[3rem] font-semibold leading-none tracking-tight text-white lg:text-[4.5rem]">
            {active.big}
          </p>
          <p className="mt-3 font-display text-lg font-semibold text-white lg:text-xl">
            {active.caption}
          </p>
          <p className="mt-2 max-w-md text-[0.8125rem] leading-[1.45] text-study-on-dark">
            {active.detail}
          </p>
          <p className="mt-4 inline-block rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-study-lime">
            {active.pill}
          </p>
        </div>
      </div>
    </section>
  );
}
