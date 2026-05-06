import type { Language } from "../types";

export interface Point {
  lat: number;
  lng: number;
}

export type StepIcon = "start" | "left" | "right" | "straight" | "arrive";

export interface Step {
  instruction: string;
  distanceMeters: number;
  icon: StepIcon;
}

export interface Route {
  path: Point[];
  steps: Step[];
  totalMeters: number;
  etaMinutes: number;
}

const haversine = (a: Point, b: Point): number => {
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

const bearingDeg = (a: Point, b: Point): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const toDeg = (x: number) => (x * 180) / Math.PI;
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

const compassEn = [
  "north",
  "north-east",
  "east",
  "south-east",
  "south",
  "south-west",
  "west",
  "north-west",
];
const compassAr = [
  "شمالاً",
  "شمال شرق",
  "شرقاً",
  "جنوب شرق",
  "جنوباً",
  "جنوب غرب",
  "غرباً",
  "شمال غرب",
];

const compassLabel = (deg: number, lang: Language): string => {
  const idx = Math.round(deg / 45) % 8;
  return (lang === "ar" ? compassAr : compassEn)[idx];
};

const turnKind = (
  prev: number,
  next: number,
): "left" | "right" | "straight" => {
  const diff = ((next - prev + 540) % 360) - 180;
  if (diff > 25) return "right";
  if (diff < -25) return "left";
  return "straight";
};

// Nudge the midpoint perpendicular to the direct line so the path looks
// like indoor walkways instead of a straight line through buildings.
export const buildPath = (start: Point, end: Point): Point[] => {
  const dx = end.lng - start.lng;
  const dy = end.lat - start.lat;
  const len = Math.hypot(dx, dy) || 1;
  const offset = 0.00018; // ~20 m perpendicular bend
  const px = (-dy / len) * offset;
  const py = (dx / len) * offset;
  const mid1 = {
    lat: start.lat + dy * 0.33 + py * 0.6,
    lng: start.lng + dx * 0.33 + px * 0.6,
  };
  const mid2 = {
    lat: start.lat + dy * 0.66 + py,
    lng: start.lng + dx * 0.66 + px,
  };
  return [start, mid1, mid2, end];
};

export const buildRoute = (
  start: Point,
  end: Point,
  endName: string,
  lang: Language,
): Route => {
  const path = buildPath(start, end);
  const steps: Step[] = [];
  let total = 0;
  let prevBearing: number | null = null;

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const dist = haversine(a, b);
    if (dist < 1) continue;
    const bear = bearingDeg(a, b);
    total += dist;
    const dir = compassLabel(bear, lang);
    const m = Math.max(1, Math.round(dist));

    if (prevBearing === null) {
      steps.push({
        instruction:
          lang === "ar"
            ? `ابدأ بالاتجاه ${dir} لمسافة ${m} م`
            : `Head ${dir} for ${m} m`,
        distanceMeters: dist,
        icon: "start",
      });
    } else {
      const t = turnKind(prevBearing, bear);
      const verb =
        lang === "ar"
          ? t === "left"
            ? "انعطف يساراً"
            : t === "right"
              ? "انعطف يميناً"
              : "تابع مباشرة"
          : t === "left"
            ? "Turn left"
            : t === "right"
              ? "Turn right"
              : "Continue straight";
      steps.push({
        instruction:
          lang === "ar" ? `${verb} لمسافة ${m} م` : `${verb} for ${m} m`,
        distanceMeters: dist,
        icon: t,
      });
    }
    prevBearing = bear;
  }

  steps.push({
    instruction:
      lang === "ar"
        ? `لقد وصلت إلى ${endName}`
        : `You have arrived at ${endName}`,
    distanceMeters: 0,
    icon: "arrive",
  });

  // Indoor walking pace ~1.1 m/s = 66 m/min
  const etaMinutes = Math.max(1, Math.round(total / 66));

  return { path, steps, totalMeters: total, etaMinutes };
};
