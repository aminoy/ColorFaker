import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { MenuItem } from "../types";

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard = ({ item }: MenuItemCardProps) => {
  const { addToCart, language } = useApp();
  const [pulse, setPulse] = useState(false);

  const handleAdd = () => {
    addToCart(item);
    setPulse(true);
    setTimeout(() => setPulse(false), 700);
  };

  return (
    <div className="flex items-stretch gap-3 rounded-2xl bg-white p-3 shadow-soft">
      <div
        className="grid h-20 w-20 shrink-0 place-items-center rounded-xl text-3xl text-white"
        style={{
          background: `linear-gradient(135deg, ${item.gradient[0]} 0%, ${item.gradient[1]} 100%)`,
        }}
      >
        {item.emoji}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-sm font-semibold leading-tight text-ink">
            {item.name}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] text-midnight-500">
            {item.description}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-midnight-700">
            {item.priceSar} <span className="text-[11px] text-midnight-500">SAR</span>
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            type="button"
            aria-label={`${language === "ar" ? "أضف" : "Add"} ${item.name}`}
            className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-emerald-gradient text-white shadow-glow"
          >
            <AnimatePresence mode="wait">
              {pulse ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Check size={18} strokeWidth={2.6} />
                </motion.span>
              ) : (
                <motion.span
                  key="plus"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Plus size={18} strokeWidth={2.6} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
