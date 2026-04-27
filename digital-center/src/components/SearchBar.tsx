import { Search, SlidersHorizontal } from "lucide-react";
import { useApp } from "../context/AppContext";

interface SearchBarProps {
  placeholder?: string;
  showFilter?: boolean;
}

export const SearchBar = ({
  placeholder,
  showFilter = true,
}: SearchBarProps) => {
  const { language } = useApp();
  const ph =
    placeholder ||
    (language === "ar"
      ? "ابحث عن المطاعم والمتاجر"
      : "Search food, brands, stores");

  return (
    <div className="-mt-6 px-5">
      <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-card">
        <Search size={18} className="text-midnight-500" />
        <input
          type="text"
          placeholder={ph}
          aria-label={ph}
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-midnight-400"
        />
        {showFilter && (
          <button
            type="button"
            aria-label={language === "ar" ? "تصفية" : "Filter"}
            className="grid h-9 w-9 place-items-center rounded-xl bg-cloud text-midnight-700"
          >
            <SlidersHorizontal size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
