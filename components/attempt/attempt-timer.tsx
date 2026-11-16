import { Clock } from "lucide-react";
import { formatClock, timerTone, type TimerTone } from "@/lib/mocks/attempt-format";

type AttemptTimerProps = {
  secondsLeft: number;
};

const TONE_CLASS: Record<TimerTone, string> = {
  normal: "border-study-divider bg-white text-study-ink",
  warning: "border-study-peach-ink/40 bg-study-peach text-study-peach-ink",
  critical: "border-study-peach-ink bg-study-peach text-study-peach-ink",
};

export function AttemptTimer({ secondsLeft }: AttemptTimerProps) {
  const tone = timerTone(secondsLeft);
  return (
    <div
      role="timer"
      aria-label={`Time left ${formatClock(secondsLeft)}`}
      className={`inline-flex h-11 items-center gap-1.5 rounded-[10px] border px-3 transition-colors sm:h-10 ${TONE_CLASS[tone]} ${
        tone === "critical" ? "font-bold" : ""
      }`}
    >
      <Clock className="h-4 w-4" aria-hidden />
      <span className="text-sm font-semibold tabular-nums">
        {formatClock(secondsLeft)}
      </span>
    </div>
  );
}
