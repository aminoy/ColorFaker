import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useApp } from "../context/AppContext";

export const StickyCartBar = () => {
  const { cartCount, cartTotal, navigate, language } = useApp();

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="absolute bottom-24 left-0 right-0 z-20 px-5"
        >
          <button
            type="button"
            onClick={() => navigate("cart")}
            className="flex w-full items-center justify-between rounded-2xl bg-emerald-gradient px-4 py-3 text-white shadow-glow"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20">
                <ShoppingBag size={18} />
              </span>
              {language === "ar"
                ? `عرض السلة (${cartCount} عناصر)`
                : `View Cart (${cartCount} ${cartCount === 1 ? "item" : "items"})`}
            </span>
            <span className="text-sm font-semibold">
              {cartTotal} <span className="text-[11px] opacity-80">SAR</span>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
