import { motion } from "framer-motion";

interface FilterChipsProps {
  options: string[];
  active: string;
  onChange: (next: string) => void;
}

export const FilterChips = ({ options, active, onChange }: FilterChipsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden">
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(opt)}
            type="button"
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-midnight-700 text-white shadow-card"
                : "bg-white text-midnight-700 shadow-soft"
            }`}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
};
