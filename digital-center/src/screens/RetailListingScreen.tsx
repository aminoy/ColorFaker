import { useMemo, useState } from "react";
import { FilterChips } from "../components/FilterChips";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { StoreCard } from "../components/StoreCard";
import { useApp } from "../context/AppContext";
import { retailStores } from "../data/mockData";

const categories = ["All", "Fashion", "Gifts", "Perfumes", "Services"];

export const RetailListingScreen = () => {
  const { language, selectStore, navigate } = useApp();
  const [active, setActive] = useState("All");

  const filtered = useMemo(() => {
    const base = retailStores;
    const cat = active === "All" ? base : base.filter((s) => s.category === active);
    return [...cat].sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [active]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Header
        variant="page"
        title={language === "ar" ? "اكتشف" : "Explore"}
        subtitle={
          language === "ar"
            ? "متاجر، عطور، خدمات وأكثر"
            : "Boutiques, services & more"
        }
        backTo="home"
      />
      <SearchBar
        placeholder={
          language === "ar"
            ? "ابحث عن متجر أو علامة"
            : "Search brands & stores"
        }
        showFilter={false}
      />
      <FilterChips options={categories} active={active} onChange={setActive} />
      <div className="flex flex-col gap-3 px-5">
        {filtered.map((s) => (
          <StoreCard
            key={s.id}
            store={s}
            layout="vertical"
            onClick={() => {
              selectStore(s.id);
              navigate("store");
            }}
          />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl bg-white p-5 text-center text-sm text-midnight-500 shadow-soft">
            {language === "ar"
              ? "لا توجد نتائج لهذه الفئة."
              : "No stores in this category yet."}
          </p>
        )}
      </div>
    </div>
  );
};
