import { ChevronLeft, MapPin, User } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import type { ScreenId } from "../types";

interface HeaderProps {
  variant?: "home" | "page";
  title?: string;
  subtitle?: string;
  greeting?: string;
  location?: string;
  onBack?: () => void;
  backTo?: ScreenId;
}

export const Header = ({
  variant = "home",
  title,
  subtitle,
  greeting,
  location,
  onBack,
  backTo,
}: HeaderProps) => {
  const { navigate, language } = useApp();

  const handleBack = () => {
    if (onBack) onBack();
    else if (backTo) navigate(backTo);
    else navigate("home");
  };

  if (variant === "page") {
    return (
      <header className="bg-cloud px-5 pt-12 pb-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleBack}
            className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft text-midnight-700"
            aria-label={language === "ar" ? "رجوع" : "Back"}
          >
            <ChevronLeft
              size={22}
              className={language === "ar" ? "rotate-180" : ""}
            />
          </motion.button>
          <div className="flex-1">
            {subtitle && (
              <p className="text-xs font-medium text-midnight-500">
                {subtitle}
              </p>
            )}
            <h1 className="text-xl font-semibold text-ink">{title}</h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative overflow-hidden rounded-b-[2rem] bg-midnight-gradient px-5 pt-12 pb-7 text-white">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald2/30 blur-3xl" />
      <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">{greeting}</p>
          <div className="mt-1 flex items-center gap-1.5 text-base font-semibold">
            <MapPin size={16} className="text-emerald2-300" />
            <span>{location}</span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate("profile")}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur"
          aria-label={language === "ar" ? "الحساب" : "Profile"}
        >
          <User size={20} className="text-white" />
        </motion.button>
      </div>
      <div className="relative mt-5">
        <h2 className="text-2xl font-semibold leading-snug tracking-tight">
          {language === "ar"
            ? "أهلاً بك في وجهة جبل عمر"
            : "Welcome to Jabal Omar Destination"}
        </h2>
        <p className="mt-1 text-sm text-white/75">
          {language === "ar"
            ? "كل شيء حولك، في تطبيق واحد."
            : "Everything around you, in one app."}
        </p>
      </div>
    </header>
  );
};
