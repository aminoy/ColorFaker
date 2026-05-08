import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Locate,
  Navigation,
  Route as RouteIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DirectionsPanel } from "../components/DirectionsPanel";
import { RealMap, type MapPin } from "../components/RealMap";
import { useApp } from "../context/AppContext";
import {
  JABAL_OMAR_CENTER,
  places,
  restaurants,
  retailStores,
} from "../data/mockData";
import { buildRoute, type Point, type Route } from "../data/wayfinding";

type Layer = "all" | "food" | "retail" | "places";

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; lat: number; lng: number }
  | { status: "denied" }
  | { status: "unavailable" };

const layerLabel = (l: Layer, lang: "en" | "ar"): string => {
  if (lang === "ar") {
    return l === "all"
      ? "الكل"
      : l === "food"
        ? "طعام"
        : l === "retail"
          ? "متاجر"
          : "أماكن";
  }
  return l === "all"
    ? "All"
    : l === "food"
      ? "Food"
      : l === "retail"
        ? "Retail"
        : "Places";
};

// Fallback "you are here" reference when geolocation isn't available —
// the destination's main lobby intersection.
const FALLBACK_START: Point = {
  lat: JABAL_OMAR_CENTER.lat - 0.0002,
  lng: JABAL_OMAR_CENTER.lng - 0.00025,
};

const distanceMeters = (a: Point, b: Point): number => {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const MapScreen = () => {
  const { navigate, selectStore, selectRestaurant, language } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>("r-najd");
  const [layer, setLayer] = useState<Layer>("all");
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [routeToId, setRouteToId] = useState<string | null>(null);

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

  const allPins: MapPin[] = useMemo(() => {
    if (layer === "food") return [...restaurants];
    if (layer === "retail") return [...retailStores];
    if (layer === "places") return [...places];
    return [...restaurants, ...retailStores, ...places];
  }, [layer]);

  const selected = useMemo(
    () => allPins.find((s) => s.id === selectedId) || allPins[0],
    [allPins, selectedId],
  );

  const userPosition: Point | null =
    geo.status === "ok" ? { lat: geo.lat, lng: geo.lng } : null;
  const userIsNear =
    userPosition !== null &&
    distanceMeters(JABAL_OMAR_CENTER, userPosition) < 5000;

  const routeStart: Point = userIsNear && userPosition ? userPosition : FALLBACK_START;
  const startLabel =
    userIsNear
      ? language === "ar"
        ? "موقعك الحالي"
        : "Your location"
      : language === "ar"
        ? "اللوبي الرئيسي · طابق 1"
        : "Main Lobby · L1";

  const routeTarget = useMemo(
    () => (routeToId ? allPins.find((p) => p.id === routeToId) : null),
    [routeToId, allPins],
  );

  const route: Route | null = useMemo(() => {
    if (!routeTarget) return null;
    const name =
      language === "ar" && "nameAr" in routeTarget && routeTarget.nameAr
        ? routeTarget.nameAr
        : routeTarget.name;
    return buildRoute(
      routeStart,
      { lat: routeTarget.lat, lng: routeTarget.lng },
      name,
      language,
    );
  }, [routeStart, routeTarget, language]);

  const startWayfinding = (id: string) => {
    setSelectedId(id);
    setRouteToId(id);
  };

  const stopWayfinding = () => setRouteToId(null);

  const goToDetail = () => {
    if (!selected || "kind" in selected) return;
    if (selected.category === "food") {
      selectRestaurant(selected.id);
      navigate("restaurant");
    } else if (
      selected.category === "Fashion" ||
      selected.category === "Gifts" ||
      selected.category === "Perfumes" ||
      selected.category === "Services"
    ) {
      selectStore(selected.id);
      navigate("store");
    }
  };

  const isPlace = selected && "description" in selected;

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      <RealMap
        pins={allPins}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          if (routeToId) setRouteToId(id);
        }}
        userPosition={userPosition}
        routePath={route?.path}
        routeStart={route ? routeStart : null}
        flyTo={selected ? { lat: selected.lat, lng: selected.lng } : null}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] px-5 pt-16">
        <div className="pointer-events-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate("home")}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-card text-midnight-700"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-card">
            {(["all", "food", "retail", "places"] as const).map((l) => {
              const active = l === layer;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLayer(l)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    active ? "bg-midnight-700 text-white" : "text-midnight-700"
                  }`}
                >
                  {layerLabel(l, language)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setLayer("places")}
            aria-label={language === "ar" ? "أماكن الوجهة" : "Destination places"}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-card text-midnight-700"
          >
            <Building2 size={18} />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="pointer-events-none rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
            {language === "ar" ? "وجهة جبل عمر" : "Jabal Omar Destination"}
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

      <AnimatePresence mode="wait">
        {route && routeTarget ? (
          <DirectionsPanel
            key="dir"
            destinationName={
              language === "ar" && "nameAr" in routeTarget && routeTarget.nameAr
                ? routeTarget.nameAr
                : routeTarget.name
            }
            destinationZone={routeTarget.zone}
            destinationEmoji={routeTarget.emoji}
            destinationGradient={routeTarget.gradient}
            route={route}
            startLabel={startLabel}
            onClose={stopWayfinding}
          />
        ) : (
          selected && (
            <motion.section
              key={selected.id}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
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
                  <p className="text-sm font-semibold text-ink">
                    {language === "ar" &&
                    "nameAr" in selected &&
                    selected.nameAr
                      ? selected.nameAr
                      : selected.name}
                  </p>
                  <p className="text-[11px] text-midnight-500">
                    {selected.zone}
                  </p>
                </div>
                {!isPlace && "distanceMeters" in selected && (
                  <span className="rounded-full bg-emerald2-50 px-2 py-1 text-[11px] font-semibold text-emerald2-700">
                    {selected.distanceMeters} m
                  </span>
                )}
              </div>
              {isPlace && "description" in selected && (
                <p className="mt-2 text-[11px] text-midnight-500">
                  {language === "ar" &&
                  "descriptionAr" in selected &&
                  selected.descriptionAr
                    ? selected.descriptionAr
                    : selected.description}
                </p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {!isPlace ? (
                  <button
                    type="button"
                    onClick={goToDetail}
                    className="rounded-xl bg-cloud px-3 py-3 text-sm font-semibold text-midnight-700"
                  >
                    {language === "ar" ? "تفاصيل" : "Details"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`;
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-cloud px-3 py-3 text-sm font-semibold text-midnight-700"
                  >
                    <Navigation size={14} />
                    {language === "ar" ? "خرائط Google" : "Google Maps"}
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => startWayfinding(selected.id)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-gradient px-3 py-3 text-sm font-semibold text-white shadow-glow"
                >
                  <RouteIcon size={16} />
                  {language === "ar" ? "إرشادي داخلي" : "Directions"}
                </motion.button>
              </div>
            </motion.section>
          )
        )}
      </AnimatePresence>
    </div>
  );
};
