import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  label: string;
  sublabel?: string;
  Icon: LucideIcon;
  gradient: [string, string];
  onClick: () => void;
}

export const QuickActionCard = ({
  label,
  sublabel,
  Icon,
  gradient,
  onClick,
}: QuickActionCardProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      className="group relative flex flex-1 flex-col items-start gap-3 overflow-hidden rounded-2xl p-4 text-start text-white shadow-card"
      style={{
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      }}
      aria-label={label}
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl transition-all group-hover:scale-110" />
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div className="relative">
        <p className="text-sm font-semibold leading-tight">{label}</p>
        {sublabel && (
          <p className="mt-0.5 text-[11px] text-white/75">{sublabel}</p>
        )}
      </div>
    </motion.button>
  );
};
