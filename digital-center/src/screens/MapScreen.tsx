import { motion } from "framer-motion";
import { Layers, Locate, Navigation, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RealMap } from "../components/RealMap";
import { useApp } from "../context/AppContext";
import { restaurants, retailStores } from "../data/mockData";

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; lat: number; lng: number }
  | { status: "denied" }
  | { status: "unavailable" };

export const MapScreen = () => {
  const { navigate, selectStore, selectRestaurant, language } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>("r-saffron");
  const [layer, setLayer] = useState<"all" | "food" | "retail">("all");
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeo({ status: "unavailable" });
      return;
    }
    setGeo({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setGeo({
          status: "ok",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) =>
        setGeo({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
        }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

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

  const userPosition =
    geo.status === "ok" ? { lat: geo.lat, lng: geo.lng } : null;

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      <RealMap
        stores={all}
        selectedId={selectedId}
        onSelect={setSelectedId}
        userPosition={userPosition}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] px-5 pt-12">
        <div className="pointer-events-auto flex items-center justify-between">
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
                    active ? "bg-midnight-700 text-white" : "text-midnight-700"
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

        <div className="mt-3 flex items-center justify-between">
          <span className="pointer-events-none rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
            {language === "ar"
              ? "وجهة جبل عمر"
              : "Jabal Omar Destination"}
          </span>
          <button
            type="button"
            onClick={requestLocation}
            disabled={geo.status === "loading"}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-midnight-700 shadow-card disabled:opacity-60"
          >
            <Locate
              size={13}
              className={
                geo.status === "loading" ? "animate-spin text-emerald2-700" : ""
              }
            />
            {geo.status === "ok"
              ? language === "ar"
                ? "موقعي"
                : "My location"
              : geo.status === "loading"
                ? language === "ar"
                  ? "جارِ التحديد..."
                  : "Locating…"
                : language === "ar"
                  ? "حدد موقعي"
                  : "Locate me"}
          </button>
        </div>

        {(geo.status === "denied" || geo.status === "unavailable") && (
          <p className="pointer-events-none mt-2 inline-block rounded-md bg-black/40 px-2 py-1 text-[10px] text-white/80 backdrop-blur">
            {language === "ar"
              ? geo.status === "denied"
                ? "تم رفض إذن الموقع — تم التركيز على الوجهة"
                : "تعذر تحديد الموقع — تم التركيز على الوجهة"
              : geo.status === "denied"
                ? "Location permission denied — centered on destination"
                : "Location unavailable — centered on destination"}
          </p>
        )}
      </div>

      {selected && (
        <motion.section
          key={selected.id}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="absolute bottom-24 left-3 right-3 z-[500] rounded-3xl bg-white p-4 shadow-lift"
        >
          <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-midnight-100" />
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
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`;
                window.open(url, "_blank", "noopener,noreferrer");
              }}
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
