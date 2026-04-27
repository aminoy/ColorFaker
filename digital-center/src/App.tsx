import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "./components/AppShell";
import { AppProvider, useApp } from "./context/AppContext";
import { CartScreen } from "./screens/CartScreen";
import { FoodListingScreen } from "./screens/FoodListingScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MapScreen } from "./screens/MapScreen";
import { OrderTrackingScreen } from "./screens/OrderTrackingScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { RestaurantDetailScreen } from "./screens/RestaurantDetailScreen";
import { RetailListingScreen } from "./screens/RetailListingScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { StoreDetailScreen } from "./screens/StoreDetailScreen";

const screenComponents = {
  splash: SplashScreen,
  home: HomeScreen,
  food: FoodListingScreen,
  restaurant: RestaurantDetailScreen,
  cart: CartScreen,
  tracking: OrderTrackingScreen,
  retail: RetailListingScreen,
  store: StoreDetailScreen,
  map: MapScreen,
  profile: ProfileScreen,
} as const;

const Router = () => {
  const { screen } = useApp();
  const Screen = screenComponents[screen];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="min-h-full"
      >
        <Screen />
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppShell>
        <Router />
      </AppShell>
    </AppProvider>
  );
};

export default App;
