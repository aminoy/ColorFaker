import { motion } from "framer-motion";
import { Clock, MapPin, Star } from "lucide-react";
import type { AnyStore, Restaurant } from "../types";

interface StoreCardProps {
  store: AnyStore;
  layout?: "horizontal" | "vertical" | "compact";
  onClick?: () => void;
}

const formatDistance = (m: number) => {
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
};

const isRestaurant = (s: AnyStore): s is Restaurant => s.category === "food";

const Badge = ({
  children,
  tone = "emerald",
}: {
  children: React.ReactNode;
  tone?: "emerald" | "midnight" | "soft";
}) => {
  const styles =
    tone === "emerald"
      ? "bg-emerald2-50 text-emerald2-700"
      : tone === "midnight"
        ? "bg-midnight-50 text-midnight-700"
        : "bg-white/85 text-midnight-700";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles}`}
    >
      {children}
    </span>
  );
};

export const StoreCard = ({
  store,
  layout = "vertical",
  onClick,
}: StoreCardProps) => {
  const tagline = store.tagline;

  const heroBg = {
    background: `linear-gradient(135deg, ${store.gradient[0]} 0%, ${store.gradient[1]} 100%)`,
  };

  if (layout === "horizontal") {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        type="button"
        className="flex w-[220px] shrink-0 flex-col gap-3 overflow-hidden rounded-2xl bg-white p-3 text-start shadow-card"
      >
        <div
          className="relative flex h-28 w-full items-end justify-between overflow-hidden rounded-xl p-3 text-white"
          style={heroBg}
        >
          <span className="text-3xl">{store.emoji}</span>
          <div className="flex flex-col items-end gap-1">
            {isRestaurant(store) && (
              <Badge tone="soft">
                <Clock size={10} /> Ready in {store.readyMinutes} min
              </Badge>
            )}
            {!isRestaurant(store) && store.newCollection && (
              <Badge tone="soft">New collection</Badge>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">{store.name}</p>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-midnight-700">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {store.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-midnight-500">
            {tagline}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-midnight-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} /> {formatDistance(store.distanceMeters)}
            </span>
            {isRestaurant(store) && store.noQueue && (
              <Badge tone="emerald">Popular</Badge>
            )}
            {!isRestaurant(store) && store.inStoreNow && (
              <Badge tone="emerald">In store now</Badge>
            )}
          </div>
        </div>
      </motion.button>
    );
  }

  if (layout === "compact") {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        type="button"
        className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-start shadow-soft"
      >
        <div
          className="grid h-14 w-14 place-items-center rounded-xl text-2xl text-white"
          style={heroBg}
        >
          {store.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">{store.name}</p>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-midnight-700">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {store.rating.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-midnight-500">{store.zone}</p>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-midnight-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} /> {formatDistance(store.distanceMeters)}
            </span>
            {isRestaurant(store) && (
              <span className="inline-flex items-center gap-1">
                <Clock size={11} /> {store.readyMinutes} min
              </span>
            )}
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      type="button"
      className="flex w-full flex-col gap-3 overflow-hidden rounded-2xl bg-white p-3 text-start shadow-card"
    >
      <div
        className="relative flex h-32 w-full items-end justify-between overflow-hidden rounded-xl p-3 text-white"
        style={heroBg}
      >
        <span className="text-3xl">{store.emoji}</span>
        <div className="flex flex-col items-end gap-1">
          {isRestaurant(store) ? (
            <>
              <Badge tone="soft">
                <Clock size={10} /> Ready in {store.readyMinutes} min
              </Badge>
              {store.noQueue && <Badge tone="emerald">No queue</Badge>}
            </>
          ) : (
            <>
              {store.inStoreNow && <Badge tone="soft">In store now</Badge>}
              {store.newCollection && (
                <Badge tone="emerald">New collection</Badge>
              )}
            </>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-ink">{store.name}</p>
          <span className="flex items-center gap-0.5 text-xs font-semibold text-midnight-700">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {store.rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-midnight-500">
          {tagline}
        </p>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-midnight-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} /> {formatDistance(store.distanceMeters)}
          </span>
          <span>· {store.zone}</span>
        </div>
      </div>
    </motion.button>
  );
};
