import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CartItem,
  FulfilmentMode,
  Language,
  MenuItem,
  Order,
  PaymentMode,
  ScreenId,
} from "../types";

interface AppState {
  language: Language;
  setLanguage: (l: Language) => void;
  dir: "ltr" | "rtl";

  screen: ScreenId;
  navigate: (s: ScreenId) => void;

  selectedRestaurantId: string | null;
  selectRestaurant: (id: string | null) => void;

  selectedStoreId: string | null;
  selectStore: (id: string | null) => void;

  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  updateQty: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
  cartCount: number;
  cartTotal: number;

  fulfilment: FulfilmentMode;
  setFulfilment: (m: FulfilmentMode) => void;
  payment: PaymentMode;
  setPayment: (m: PaymentMode) => void;

  order: Order | null;
  placeOrder: () => void;
  clearOrder: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [screen, setScreen] = useState<ScreenId>("splash");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fulfilment, setFulfilment] = useState<FulfilmentMode>("pickup");
  const [payment, setPayment] = useState<PaymentMode>("card");
  const [order, setOrder] = useState<Order | null>(null);

  // splash → home transition
  useEffect(() => {
    if (screen === "splash") {
      const t = setTimeout(() => setScreen("home"), 1900);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const dir: "ltr" | "rtl" = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const setLanguage = useCallback((l: Language) => setLanguageState(l), []);
  const navigate = useCallback((s: ScreenId) => setScreen(s), []);
  const selectRestaurant = useCallback(
    (id: string | null) => setSelectedRestaurantId(id),
    [],
  );
  const selectStore = useCallback(
    (id: string | null) => setSelectedStoreId(id),
    [],
  );

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          priceSar: item.priceSar,
          quantity: 1,
          emoji: item.emoji,
          gradient: item.gradient,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.itemId === itemId
            ? { ...c, quantity: Math.max(0, c.quantity + delta) }
            : c,
        )
        .filter((c) => c.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((s, c) => s + c.quantity, 0),
    [cart],
  );
  const cartTotal = useMemo(
    () => cart.reduce((s, c) => s + c.priceSar * c.quantity, 0),
    [cart],
  );

  const placeOrder = useCallback(() => {
    setOrder({
      id: `JO-${Math.floor(100000 + Math.random() * 900000)}`,
      storeName: "Saffron & Cedar",
      status: "received",
      etaMinutes: 12,
      placedAt: Date.now(),
    });
    setCart([]);
    setScreen("tracking");
  }, []);

  const clearOrder = useCallback(() => setOrder(null), []);

  const value: AppState = {
    language,
    setLanguage,
    dir,
    screen,
    navigate,
    selectedRestaurantId,
    selectRestaurant,
    selectedStoreId,
    selectStore,
    cart,
    addToCart,
    updateQty,
    removeItem,
    cartCount,
    cartTotal,
    fulfilment,
    setFulfilment,
    payment,
    setPayment,
    order,
    placeOrder,
    clearOrder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
