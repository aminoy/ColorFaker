export type ScreenId =
  | "splash"
  | "home"
  | "food"
  | "restaurant"
  | "cart"
  | "tracking"
  | "retail"
  | "store"
  | "map"
  | "profile";

export type Language = "en" | "ar";

export type FulfilmentMode = "pickup" | "delivery" | "table";
export type PaymentMode = "card" | "applepay";

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distanceMeters: number;
  readyMinutes: number;
  noQueue: boolean;
  category: "food";
  tagline: string;
  gradient: [string, string];
  emoji: string;
  zone: string;
}

export interface RetailStore {
  id: string;
  name: string;
  category: "Fashion" | "Gifts" | "Perfumes" | "Services";
  rating: number;
  distanceMeters: number;
  inStoreNow: boolean;
  newCollection: boolean;
  tagline: string;
  gradient: [string, string];
  emoji: string;
  zone: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceSar: number;
  category: string;
  emoji: string;
  gradient: [string, string];
}

export interface CartItem {
  itemId: string;
  name: string;
  priceSar: number;
  quantity: number;
  emoji: string;
  gradient: [string, string];
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  gradient: [string, string];
  emoji: string;
}

export interface Order {
  id: string;
  storeName: string;
  status: "received" | "preparing" | "ready" | "completed";
  etaMinutes: number;
  placedAt: number;
}

export type AnyStore = Restaurant | RetailStore;
