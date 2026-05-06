import { motion } from "framer-motion";
import {
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  MapPin,
  X,
} from "lucide-react";
import type { Route, StepIcon } from "../data/wayfinding";
import { useApp } from "../context/AppContext";

interface DirectionsPanelProps {
  destinationName: string;
  destinationZone: string;
  destinationEmoji: string;
  destinationGradient: [string, string];
  route: Route;
  startLabel: string;
  onClose: () => void;
}

const iconFor = (icon: StepIcon) => {
  switch (icon) {
    case "start":
      return MapPin;
    case "left":
      return CornerUpLeft;
    case "right":
      return CornerUpRight;
    case "straight":
      return ArrowUp;
    case "arrive":
      return Flag;
  }
};

export const DirectionsPanel = ({
  destinationName,
  destinationZone,
  destinationEmoji,
  destinationGradient,
  route,
  startLabel,
  onClose,
}: DirectionsPanelProps) => {
  const { language } = useApp();

  return (
    <motion.section
      key={destinationName}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="absolute bottom-24 left-3 right-3 z-[500] flex max-h-[60vh] flex-col overflow-hidden rounded-3xl bg-white shadow-lift"
    >
      <div
        className="relative px-4 pt-3 pb-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${destinationGradient[0]} 0%, ${destinationGradient[1]} 100%)`,
        }}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/40" />
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl backdrop-blur">
            {destinationEmoji}
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-widest text-white/70">
              {language === "ar" ? "الوجهة" : "Directions to"}
            </p>
            <p className="text-base font-semibold">{destinationName}</p>
            <p className="text-[11px] text-white/80">{destinationZone}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={language === "ar" ? "إغلاق" : "Close"}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/20 ring-1 ring-white/25 backdrop-blur"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 ring-1 ring-white/20 backdrop-blur">
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-widest text-white/65">
              {language === "ar" ? "من" : "From"}
            </span>
            <span className="text-xs font-semibold">{startLabel}</span>
          </div>
          <span className="mx-2 text-white/40">·</span>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-widest text-white/65">
              {language === "ar" ? "المسافة" : "Distance"}
            </span>
            <span className="text-xs font-semibold">
              {Math.round(route.totalMeters)} m
            </span>
          </div>
          <span className="mx-2 text-white/40">·</span>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-widest text-white/65">
              {language === "ar" ? "الوقت" : "ETA"}
            </span>
            <span className="text-xs font-semibold">
              {route.etaMinutes} min
            </span>
          </div>
        </div>
      </div>

      <ol className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {route.steps.map((step, idx) => {
          const Icon = iconFor(step.icon);
          const isArrive = step.icon === "arrive";
          return (
            <li
              key={idx}
              className={`flex items-start gap-3 rounded-2xl p-3 ${
                isArrive ? "bg-emerald2-50" : "bg-cloud"
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white ${
                  isArrive ? "bg-emerald-gradient" : "bg-midnight-700"
                }`}
              >
                <Icon size={16} strokeWidth={2.4} />
              </span>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold leading-tight ${
                    isArrive ? "text-emerald2-700" : "text-ink"
                  }`}
                >
                  {step.instruction}
                </p>
                {!isArrive && (
                  <p className="mt-0.5 text-[11px] text-midnight-500">
                    {language === "ar"
                      ? `الخطوة ${idx + 1} من ${route.steps.length - 1}`
                      : `Step ${idx + 1} of ${route.steps.length - 1}`}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </motion.section>
  );
};
