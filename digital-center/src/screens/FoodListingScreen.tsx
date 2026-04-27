import { useMemo, useState } from "react";
import { FilterChips } from "../components/FilterChips";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { StoreCard } from "../components/StoreCard";
import { useApp } from "../context/AppContext";
import { restaurants } from "../data/mockData";

const filters = ["Distance", "Rating", "Ready Time", "Cuisine"];

export const FoodListingScreen = () => {
  const { language, navigate, selectRestaurant } = useApp();
  const [active, setActive] = useState("Distance");

  const sorted = useMemo(() => {
    const copy = [...restaurants];
    if (active === "Rating") copy.sort((a, b) => b.rating - a.rating);
    else if (active === "Ready Time")
      copy.sort((a, b) => a.readyMinutes - b.readyMinutes);
    else if (active === "Cuisine")
      copy.sort((a, b) => a.cuisine.localeCompare(b.cuisine));
    else copy.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return copy;
  }, [active]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Header
        variant="page"
        title={language === "ar" ? "المطاعم" : "Food"}
        subtitle={
          language === "ar" ? "وجبات جاهزة قريباً منك" : "Hot meals near you"
        }
        backTo="home"
      />
      <SearchBar
        placeholder={
          language === "ar"
            ? "ابحث عن مطعم أو طبق"
            : "Search restaurants, dishes"
        }
        showFilter={false}
      />
      <FilterChips options={filters} active={active} onChange={setActive} />
      <div className="flex flex-col gap-3 px-5">
        {sorted.map((r) => (
          <StoreCard
            key={r.id}
            store={r}
            layout="vertical"
            onClick={() => {
              selectRestaurant(r.id);
              navigate("restaurant");
            }}
          />
        ))}
      </div>
    </div>
  );
};
