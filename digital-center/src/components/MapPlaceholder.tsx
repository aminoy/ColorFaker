import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { AnyStore } from "../types";

interface MapPlaceholderProps {
  stores: AnyStore[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

const positions = [
  { top: "18%", left: "22%" },
  { top: "30%", left: "62%" },
  { top: "48%", left: "38%" },
  { top: "58%", left: "72%" },
  { top: "70%", left: "20%" },
  { top: "78%", left: "55%" },
];

export const MapPlaceholder = ({
  stores,
  selectedId,
  onSelect,
}: MapPlaceholderProps) => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-midnight-gradient">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* fake building shapes */}
      <div className="absolute left-6 top-20 h-32 w-44 rounded-2xl bg-white/5 ring-1 ring-white/10" />
      <div className="absolute right-6 top-32 h-40 w-32 rounded-2xl bg-white/5 ring-1 ring-white/10" />
      <div className="absolute left-12 bottom-32 h-28 w-56 rounded-2xl bg-white/5 ring-1 ring-white/10" />
      <div className="absolute -right-6 bottom-24 h-40 w-40 rounded-full bg-emerald2/15 blur-3xl" />
      <div className="absolute left-1/2 top-1/3 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald2-500 shadow-glow">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald2-500/60" />
      </div>
      <p className="absolute left-1/2 top-[36%] -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
        You · Food Court
      </p>

      {stores.slice(0, positions.length).map((s, i) => {
        const pos = positions[i];
        const active = s.id === selectedId;
        return (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: active ? 1.1 : 1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
            aria-label={s.name}
          >
            <span
              className={`grid h-10 w-10 place-items-center rounded-full ring-2 ${
                active
                  ? "bg-emerald-gradient ring-white shadow-glow"
                  : "bg-white ring-emerald2-500/50 shadow-card"
              }`}
            >
              <MapPin
                size={18}
                className={active ? "text-white" : "text-emerald2-700"}
                strokeWidth={2.4}
              />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
