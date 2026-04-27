import { motion } from "framer-motion";
import { Layers, Navigation, X } from "lucide-react";
import { useMemo, useState } from "react";
import { MapPlaceholder } from "../components/MapPlaceholder";
import { useApp } from "../context/AppContext";
import { restaurants, retailStores } from "../data/mockData";

export const MapScreen = () => {
  const { navigate, selectStore, selectRestaurant, language } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(
    "r-saffron",
  );
  const [layer, setLayer] = useState<"all" | "food" | "retail">("all");

  const all = useMemo(() => {
    if (layer === "food") return [...restaurants];
    if (layer === "retail") return [...retailStores];
    return [...restaurants, ...retailStores];
  }, [layer]);

  const selected = all.find((s) => s.id === selectedId) || all[0];

  const goToDetail = () => {
    if (!selected) return;
    if (selected.category === "food") {
      selectRestaurant(selected.id);
      navigate("restaurant");
    } else {
      selectStore(selected.id);
      navigate("store");
    }
  };

  return (
    <div className="relative h-[100dvh]">
      <MapPlaceholder
        stores={all}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <div className="absolute inset-x-0 top-0 px-5 pt-12">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("home")}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-card text-midnight-700"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-card">
            {(["all", "food", "retail"] as const).map((l) => {
              const active = l === layer;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLayer(l)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    active
                      ? "bg-midnight-700 text-white"
                      : "text-midnight-700"
                  }`}
                >
                  {l === "all"
                    ? language === "ar"
                      ? "الكل"
                      : "All"
                    : l === "food"
                      ? language === "ar"
                        ? "طعام"
                        : "Food"
                      : language === "ar"
                        ? "متاجر"
                        : "Retail"}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Layers"
            className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-card text-midnight-700"
          >
            <Layers size={20} />
          </button>
        </div>
      </div>

      {selected && (
        <motion.section
          key={selected.id}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="absolute bottom-24 left-3 right-3 rounded-3xl bg-white p-4 shadow-lift"
        >
          <div className="mb-1 h-1 w-10 rounded-full bg-midnight-100 mx-auto" />
          <div className="flex items-center gap-3">
            <div
              className="grid h-14 w-14 place-items-center rounded-2xl text-2xl text-white"
              style={{
                background: `linear-gradient(135deg, ${selected.gradient[0]} 0%, ${selected.gradient[1]} 100%)`,
              }}
            >
              {selected.emoji}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">{selected.name}</p>
              <p className="text-[11px] text-midnight-500">{selected.zone}</p>
            </div>
            <span className="rounded-full bg-emerald2-50 px-2 py-1 text-[11px] font-semibold text-emerald2-700">
              {selected.distanceMeters} m
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={goToDetail}
              className="rounded-xl bg-cloud px-3 py-3 text-sm font-semibold text-midnight-700"
            >
              {language === "ar" ? "تفاصيل" : "Details"}
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-gradient px-3 py-3 text-sm font-semibold text-white shadow-glow"
            >
              <Navigation size={16} />
              {language === "ar" ? "إرشادي" : "Navigate"}
            </motion.button>
          </div>
        </motion.section>
      )}
    </div>
  );
};
