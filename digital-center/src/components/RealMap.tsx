import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import { JABAL_OMAR_CENTER } from "../data/mockData";
import type { Point } from "../data/wayfinding";
import type { AnyStore, DestinationPlace } from "../types";

export type MapPin = AnyStore | DestinationPlace;

interface RealMapProps {
  pins: MapPin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userPosition: Point | null;
  routePath?: Point[] | null;
  routeStart?: Point | null;
  flyTo?: Point | null;
}

const buildPinIcon = (pin: MapPin, active: boolean): L.DivIcon => {
  const c1 = pin.gradient[0];
  const c2 = pin.gradient[1];
  const size = active ? 44 : 36;
  return L.divIcon({
    className: "jo-pin",
    html: `
      <div class="jo-pin-wrap${active ? " jo-pin-active" : ""}" style="width:${size}px;height:${size}px;">
        <div class="jo-pin-inner" style="background:linear-gradient(135deg,${c1} 0%,${c2} 100%)">
          <span>${pin.emoji}</span>
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

const startIcon: L.DivIcon = L.divIcon({
  className: "jo-start-pin",
  html: `<div class="jo-start-wrap"><span></span></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
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

const FitRoute = ({ path }: { path: Point[] }) => {
  const map = useMap();
  useEffect(() => {
    if (path.length < 2) return;
    const bounds = L.latLngBounds(path.map((p) => [p.lat, p.lng]));
    map.flyToBounds(bounds, {
      padding: [80, 80],
      duration: 0.8,
      maxZoom: 18,
    });
  }, [path, map]);
  return null;
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

export const RealMap = ({
  pins,
  selectedId,
  onSelect,
  userPosition,
  routePath,
  routeStart,
  flyTo,
}: RealMapProps) => {
  const center: [number, number] = [
    JABAL_OMAR_CENTER.lat,
    JABAL_OMAR_CENTER.lng,
  ];

  const showUser =
    !!userPosition && distanceMeters(JABAL_OMAR_CENTER, userPosition) < 5000;

  const flyTarget = flyTo || JABAL_OMAR_CENTER;
  const hasRoute = !!routePath && routePath.length >= 2;

  return (
    <div className="absolute inset-0 bg-[#e6ecf2]">
      <MapContainer
        center={center}
        zoom={17}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom
        className="absolute inset-0 h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={20}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <FixViewport />
        {hasRoute ? (
          <FitRoute path={routePath!} />
        ) : (
          <Recenter lat={flyTarget.lat} lng={flyTarget.lng} />
        )}

        {hasRoute && (
          <>
            <Polyline
              positions={routePath!.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: "#3DAF8D",
                weight: 6,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "1, 14",
              }}
            />
            <Polyline
              positions={routePath!.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: "#3DAF8D",
                weight: 14,
                opacity: 0.18,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {routeStart && (
              <Marker
                position={[routeStart.lat, routeStart.lng]}
                icon={startIcon}
                interactive={false}
              />
            )}
          </>
        )}

        {pins.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={buildPinIcon(p, p.id === selectedId)}
            eventHandlers={{ click: () => onSelect(p.id) }}
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
