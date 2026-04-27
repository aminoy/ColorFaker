import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface ProgressTrackerProps {
  steps: string[];
  currentIndex: number;
}

export const ProgressTracker = ({
  steps,
  currentIndex,
}: ProgressTrackerProps) => {
  return (
    <ol className="relative space-y-5">
      {steps.map((step, idx) => {
        const done = idx < currentIndex;
        const active = idx === currentIndex;
        const last = idx === steps.length - 1;
        return (
          <li key={step} className="flex items-start gap-3">
            <div className="relative flex flex-col items-center">
              <motion.span
                initial={false}
                animate={{
                  scale: active ? 1.05 : 1,
                  backgroundColor: done || active ? "#3DAF8D" : "#FFFFFF",
                }}
                className="grid h-8 w-8 place-items-center rounded-full ring-2 ring-emerald2-500 shadow-soft"
              >
                {done ? (
                  <Check size={16} className="text-white" strokeWidth={2.6} />
                ) : (
                  <span
                    className={`text-xs font-bold ${
                      active ? "text-white" : "text-midnight-500"
                    }`}
                  >
                    {idx + 1}
                  </span>
                )}
              </motion.span>
              {!last && (
                <span
                  className={`mt-1 h-10 w-0.5 ${
                    done ? "bg-emerald2-500" : "bg-midnight-100"
                  }`}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={`text-sm font-semibold ${
                  active || done ? "text-ink" : "text-midnight-500"
                }`}
              >
                {step}
              </p>
              {active && (
                <p className="text-[11px] font-medium text-emerald2-700">
                  In progress…
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
