import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { JABAL_OMAR_CENTER } from "../data/mockData";
import type { AnyStore } from "../types";

interface RealMapProps {
  stores: AnyStore[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userPosition: { lat: number; lng: number } | null;
}

const buildStoreIcon = (store: AnyStore, active: boolean): L.DivIcon => {
  const c1 = store.gradient[0];
  const c2 = store.gradient[1];
  const size = active ? 44 : 36;
  return L.divIcon({
    className: "jo-pin",
    html: `
      <div class="jo-pin-wrap${active ? " jo-pin-active" : ""}" style="width:${size}px;height:${size}px;">
        <div class="jo-pin-inner" style="background:linear-gradient(135deg,${c1} 0%,${c2} 100%)">
          <span>${store.emoji}</span>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const userIcon: L.DivIcon = L.divIcon({
  className: "jo-user-pin",
  html: `
    <div class="jo-user-wrap">
      <span class="jo-user-pulse"></span>
      <span class="jo-user-dot"></span>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const Recenter = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 17, { duration: 0.6 });
  }, [lat, lng, map]);
  return null;
};

const FixViewport = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

const distanceMeters = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number => {
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

export const RealMap = ({
  stores,
  selectedId,
  onSelect,
  userPosition,
}: RealMapProps) => {
  const center: [number, number] = [
    JABAL_OMAR_CENTER.lat,
    JABAL_OMAR_CENTER.lng,
  ];

  // Show user marker only if reasonably close to the destination (< 5 km).
  const showUser =
    !!userPosition && distanceMeters(JABAL_OMAR_CENTER, userPosition) < 5000;

  const selected = stores.find((s) => s.id === selectedId);
  const flyTarget = selected
    ? { lat: selected.lat, lng: selected.lng }
    : JABAL_OMAR_CENTER;

  return (
    <div className="absolute inset-0 bg-midnight-700">
      <MapContainer
        center={center}
        zoom={17}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom
        className="absolute inset-0 h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={20}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <FixViewport />
        <Recenter lat={flyTarget.lat} lng={flyTarget.lng} />

        {stores.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={buildStoreIcon(s, s.id === selectedId)}
            eventHandlers={{
              click: () => onSelect(s.id),
            }}
          />
        ))}

        {showUser && userPosition && (
          <Marker
            position={[userPosition.lat, userPosition.lng]}
            icon={userIcon}
            interactive={false}
          />
        )}
      </MapContainer>

      {/* Tiny attribution chip — required by tile provider terms */}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-1 left-1 z-[400] rounded-md bg-black/40 px-1.5 py-0.5 text-[9px] text-white/70 backdrop-blur"
      >
        © OSM · CARTO
      </a>
    </div>
  );
};
