import { Compass, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Header } from "../components/Header";
import { OfferCard } from "../components/OfferCard";
import { QuickActionCard } from "../components/QuickActionCard";
import { SearchBar } from "../components/SearchBar";
import { StoreCard } from "../components/StoreCard";
import { useApp } from "../context/AppContext";
import {
  greetingByHour,
  greetingByHourAr,
  offers,
  restaurants,
  retailStores,
} from "../data/mockData";
import type { AnyStore } from "../types";

export const HomeScreen = () => {
  const { navigate, selectRestaurant, selectStore, language } = useApp();
  const hour = new Date().getHours();
  const greeting =
    language === "ar" ? greetingByHourAr(hour) : greetingByHour(hour);
  const location =
    language === "ar" ? "بالقرب من ساحة الطعام" : "Near Food Court";

  const trending: AnyStore[] = [
    restaurants[0],
    restaurants[4],
    retailStores[0],
    restaurants[3],
  ];
  const nearby = [...restaurants, ...retailStores]
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 5);

  const handleStoreClick = (s: AnyStore) => {
    if (s.category === "food") {
      selectRestaurant(s.id);
      navigate("restaurant");
    } else {
      selectStore(s.id);
      navigate("store");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      <Header greeting={greeting} location={location} />
      <SearchBar />

      <section className="px-5">
        <div className="grid grid-cols-3 gap-3">
          <QuickActionCard
            label={language === "ar" ? "اطلب طعام" : "Order Food"}
            sublabel={language === "ar" ? "+60 خيار" : "60+ options"}
            Icon={UtensilsCrossed}
            gradient={["#3DAF8D", "#2F9577"]}
            onClick={() => navigate("food")}
          />
          <QuickActionCard
            label={language === "ar" ? "تسوّق الآن" : "Shop Now"}
            sublabel={language === "ar" ? "بوتيكات حصرية" : "Boutiques"}
            Icon={ShoppingBag}
            gradient={["#374C5F", "#1F2C39"]}
            onClick={() => navigate("retail")}
          />
          <QuickActionCard
            label={language === "ar" ? "استكشف" : "Explore"}
            sublabel={language === "ar" ? "تجارب وأماكن" : "Experiences"}
            Icon={Compass}
            gradient={["#475F76", "#374C5F"]}
            onClick={() => navigate("map")}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between px-5">
          <div>
            <h3 className="text-base font-semibold text-ink">
              {language === "ar" ? "الأكثر رواجاً" : "Trending Now"}
            </h3>
            <p className="text-xs text-midnight-500">
              {language === "ar" ? "خيارات سريعة وشهيرة" : "Quick & popular picks"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("food")}
            className="text-xs font-semibold text-emerald2-700"
          >
            {language === "ar" ? "عرض الكل" : "See all"}
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [&::-webkit-scrollbar]:hidden">
          {trending.map((s) => (
            <StoreCard
              key={s.id}
              store={s}
              layout="horizontal"
              onClick={() => handleStoreClick(s)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between px-5">
          <h3 className="text-base font-semibold text-ink">
            {language === "ar" ? "عروض اليوم" : "Offers Today"}
          </h3>
          <button
            type="button"
            className="text-xs font-semibold text-emerald2-700"
          >
            {language === "ar" ? "كل العروض" : "All offers"}
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [&::-webkit-scrollbar]:hidden">
          {offers.map((o) => (
            <OfferCard key={o.id} offer={o} />
          ))}
        </div>
      </section>

      <section className="px-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">
            {language === "ar" ? "بالقرب منك" : "Nearby"}
          </h3>
          <span className="text-[11px] font-medium text-midnight-500">
            {language === "ar" ? "حسب المسافة" : "Sorted by distance"}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {nearby.map((s) => (
            <StoreCard
              key={s.id}
              store={s}
              layout="compact"
              onClick={() => handleStoreClick(s)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
