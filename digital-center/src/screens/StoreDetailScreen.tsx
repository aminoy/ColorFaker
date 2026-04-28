import { motion } from "framer-motion";
import { ChevronLeft, MessageCircle, Navigation, Star, Store } from "lucide-react";
import { useApp } from "../context/AppContext";
import { featuredProducts, retailStores } from "../data/mockData";

export const StoreDetailScreen = () => {
  const { selectedStoreId, navigate, language } = useApp();
  const store =
    retailStores.find((s) => s.id === selectedStoreId) || retailStores[0];

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div
        className="relative h-56 w-full overflow-hidden rounded-b-[2rem] text-white"
        style={{
          background: `linear-gradient(135deg, ${store.gradient[0]} 0%, ${store.gradient[1]} 100%)`,
        }}
      >
        <div className="absolute -right-12 -top-10 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-black/25 blur-2xl" />
        <div className="relative flex items-center justify-between px-5 pt-12">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate("retail")}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/20 ring-1 ring-white/25 backdrop-blur"
            aria-label={language === "ar" ? "رجوع" : "Back"}
          >
            <ChevronLeft
              size={22}
              className={language === "ar" ? "rotate-180" : ""}
            />
          </motion.button>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur">
            {store.zone}
          </span>
        </div>
        <div className="absolute bottom-6 left-5 text-5xl">{store.emoji}</div>
      </div>

      <section className="relative z-10 -mt-12 px-5">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-midnight-500">
                {store.category}
              </p>
              <h1 className="text-xl font-semibold text-ink">{store.name}</h1>
              <p className="mt-1 text-xs text-midnight-500">{store.tagline}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-emerald2-50 px-2 py-1 text-xs font-semibold text-emerald2-700">
              <Star size={12} className="fill-emerald2-500 text-emerald2-500" />
              {store.rating.toFixed(1)}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">
            {language === "ar" ? "منتجات مميزة" : "Featured products"}
          </h3>
          <span className="text-[11px] text-midnight-500">
            {language === "ar" ? "متوفر الآن" : "Available now"}
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              className="flex w-44 shrink-0 flex-col gap-3 rounded-2xl bg-white p-3 shadow-soft"
            >
              <div
                className="grid h-28 w-full place-items-center rounded-xl text-4xl text-white"
                style={{
                  background: `linear-gradient(135deg, ${p.gradient[0]} 0%, ${p.gradient[1]} 100%)`,
                }}
              >
                {p.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{p.name}</p>
                <p className="mt-1 text-xs font-semibold text-emerald2-700">
                  {p.priceSar} SAR
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5">
        <div className="grid grid-cols-3 gap-2">
          <ActionPill
            Icon={Store}
            label={language === "ar" ? "زيارة" : "Visit Store"}
            tone="primary"
            onClick={() => navigate("map")}
          />
          <ActionPill
            Icon={MessageCircle}
            label={language === "ar" ? "اطلب منتج" : "Request Item"}
          />
          <ActionPill
            Icon={Navigation}
            label={language === "ar" ? "إرشادي" : "Navigate"}
            onClick={() => navigate("map")}
          />
        </div>
      </section>
    </div>
  );
};

const ActionPill = ({
  Icon,
  label,
  tone = "default",
  onClick,
}: {
  Icon: typeof Store;
  label: string;
  tone?: "default" | "primary";
  onClick?: () => void;
}) => {
  const cls =
    tone === "primary"
      ? "bg-emerald-gradient text-white shadow-glow"
      : "bg-white text-midnight-700 shadow-soft";
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      type="button"
      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-xs font-semibold ${cls}`}
    >
      <Icon size={18} />
      <span className="text-[11px]">{label}</span>
    </motion.button>
  );
};
