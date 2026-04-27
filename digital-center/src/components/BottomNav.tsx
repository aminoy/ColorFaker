import { motion } from "framer-motion";
import { Compass, Home, Map, Receipt, User } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { ScreenId } from "../types";

interface NavItem {
  id: ScreenId;
  label: string;
  Icon: typeof Home;
}

const items: NavItem[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "retail", label: "Explore", Icon: Compass },
  { id: "tracking", label: "Orders", Icon: Receipt },
  { id: "map", label: "Map", Icon: Map },
  { id: "profile", label: "Profile", Icon: User },
];

const itemsAr: Record<ScreenId, string> = {
  home: "الرئيسية",
  retail: "اكتشف",
  tracking: "طلباتي",
  map: "الخريطة",
  profile: "حسابي",
  splash: "",
  food: "",
  restaurant: "",
  cart: "",
  store: "",
};

export const BottomNav = () => {
  const { screen, navigate, language } = useApp();

  const isActive = (id: ScreenId): boolean => {
    if (id === "home") return screen === "home";
    if (id === "retail") return screen === "retail" || screen === "store";
    if (id === "tracking") return screen === "tracking";
    if (id === "map") return screen === "map";
    if (id === "profile") return screen === "profile";
    return false;
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3 pt-2">
      <div className="flex items-center justify-between rounded-3xl bg-white/95 px-2 py-2 shadow-lift backdrop-blur">
        {items.map(({ id, label, Icon }) => {
          const active = isActive(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => navigate(id)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-1.5"
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-x-2 inset-y-0 rounded-2xl bg-emerald-gradient shadow-glow"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={`relative z-10 flex h-7 w-7 items-center justify-center transition-colors ${
                  active ? "text-white" : "text-midnight-600"
                }`}
              >
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <span
                className={`relative z-10 text-[11px] font-medium transition-colors ${
                  active ? "text-white" : "text-midnight-600/80"
                }`}
              >
                {language === "ar" ? itemsAr[id] : label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
