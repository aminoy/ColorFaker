import { motion } from "framer-motion";
import type { Offer } from "../types";

interface OfferCardProps {
  offer: Offer;
  onClick?: () => void;
}

export const OfferCard = ({ offer, onClick }: OfferCardProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="relative flex w-[260px] shrink-0 items-center gap-3 overflow-hidden rounded-2xl p-4 text-left text-white shadow-card"
      style={{
        background: `linear-gradient(135deg, ${offer.gradient[0]} 0%, ${offer.gradient[1]} 100%)`,
      }}
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 text-2xl">
        {offer.emoji}
      </div>
      <div className="relative flex-1">
        <p className="text-sm font-semibold leading-tight">{offer.title}</p>
        <p className="mt-0.5 text-[11px] text-white/80">{offer.subtitle}</p>
      </div>
      <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/95 text-[11px] font-bold text-emerald2-700">
        {offer.discount}
      </div>
    </motion.button>
  );
};
