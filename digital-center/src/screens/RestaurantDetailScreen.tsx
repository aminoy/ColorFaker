import { motion } from "framer-motion";
import { ChevronLeft, Clock, MapPin, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { MenuItemCard } from "../components/MenuItemCard";
import { StickyCartBar } from "../components/StickyCartBar";
import { useApp } from "../context/AppContext";
import { restaurantMenus, restaurants } from "../data/mockData";

export const RestaurantDetailScreen = () => {
  const { selectedRestaurantId, navigate, language } = useApp();
  const restaurant =
    restaurants.find((r) => r.id === selectedRestaurantId) || restaurants[0];
  const menu = restaurantMenus[restaurant.id] || restaurantMenus["r-saffron"];

  const categories = useMemo(() => {
    return Array.from(new Set(menu.map((m) => m.category)));
  }, [menu]);

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const filtered = menu.filter((m) => m.category === activeCategory);

  return (
    <div className="relative pb-6">
      <div
        className="relative h-64 w-full overflow-hidden rounded-b-[2rem] text-white"
        style={{
          background: `linear-gradient(135deg, ${restaurant.gradient[0]} 0%, ${restaurant.gradient[1]} 100%)`,
        }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-black/20 blur-2xl" />
        <div className="relative flex items-center justify-between px-5 pt-16">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate("food")}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/25 backdrop-blur"
            aria-label={language === "ar" ? "رجوع" : "Back"}
          >
            <ChevronLeft
              size={22}
              className={language === "ar" ? "rotate-180" : ""}
            />
          </motion.button>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur">
            {restaurant.zone}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center">
          <span className="text-6xl drop-shadow-lg">{restaurant.emoji}</span>
        </div>
      </div>

      <div className="relative z-10 -mt-10 px-5">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-midnight-500">
                {restaurant.cuisine}
              </p>
              <h1 className="text-xl font-semibold text-ink">{restaurant.name}</h1>
              <p className="mt-1 text-xs text-midnight-500">{restaurant.tagline}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald2-50">
              <span className="flex flex-col items-center text-emerald2-700">
                <Star size={14} className="fill-emerald2-500 text-emerald2-500" />
                <span className="text-xs font-bold">
                  {restaurant.rating.toFixed(1)}
                </span>
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat
              icon={<MapPin size={14} />}
              label={language === "ar" ? "المسافة" : "Distance"}
              value={`${restaurant.distanceMeters} m`}
            />
            <Stat
              icon={<Clock size={14} />}
              label={language === "ar" ? "وقت التحضير" : "Prep time"}
              value={`${restaurant.readyMinutes} min`}
            />
            <Stat
              icon={<span className="text-xs">●</span>}
              label={language === "ar" ? "الطابور" : "Queue"}
              value={restaurant.noQueue ? "No queue" : "Short"}
              tone="emerald"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          const active = c === activeCategory;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-midnight-700 text-white shadow-card"
                  : "bg-white text-midnight-700 shadow-soft"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 px-5">
        {filtered.map((m) => (
          <MenuItemCard key={m.id} item={m} />
        ))}
      </div>

      <StickyCartBar />
    </div>
  );
};

const Stat = ({
  icon,
  label,
  value,
  tone = "midnight",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "midnight" | "emerald";
}) => {
  return (
    <div className="rounded-xl bg-cloud px-3 py-2">
      <div
        className={`flex items-center gap-1 text-[10px] font-medium ${
          tone === "emerald" ? "text-emerald2-700" : "text-midnight-500"
        }`}
      >
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
};
