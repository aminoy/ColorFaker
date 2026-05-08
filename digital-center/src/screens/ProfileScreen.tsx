import { motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Globe2,
  Heart,
  HelpCircle,
  LogOut,
  Receipt,
  Settings,
  Sparkles,
} from "lucide-react";
import { Header } from "../components/Header";
import { useApp } from "../context/AppContext";

export const ProfileScreen = () => {
  const { language, setLanguage, navigate } = useApp();

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Header
        variant="page"
        title={language === "ar" ? "حسابي" : "My Profile"}
        subtitle={
          language === "ar"
            ? "الإعدادات والتفضيلات"
            : "Preferences & settings"
        }
        backTo="home"
      />

      <section className="mx-5 overflow-hidden rounded-3xl bg-midnight-gradient p-5 text-white shadow-lift">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-gradient text-lg font-bold">
            AS
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Aisha Saleh</p>
            <p className="text-[11px] text-white/70">
              {language === "ar"
                ? "عضوية ذهبية · Jabal Omar Club"
                : "Gold member · Jabal Omar Club"}
            </p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
            <Sparkles size={16} />
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label={language === "ar" ? "نقاط" : "Points"} value="2,420" />
          <Stat label={language === "ar" ? "زيارات" : "Visits"} value="14" />
          <Stat label={language === "ar" ? "مفضلة" : "Saved"} value="9" />
        </div>
      </section>

      <section className="mx-5 rounded-2xl bg-white p-2 shadow-soft">
        <Row
          Icon={Globe2}
          label={language === "ar" ? "اللغة" : "Language"}
          value={language === "ar" ? "العربية" : "English"}
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          rightHint
        />
        <Row
          Icon={Receipt}
          label={language === "ar" ? "الطلبات" : "Orders"}
          onClick={() => navigate("tracking")}
        />
        <Row
          Icon={Heart}
          label={language === "ar" ? "المفضلة" : "Favorites"}
        />
        <Row
          Icon={Bell}
          label={language === "ar" ? "الإشعارات" : "Notifications"}
        />
        <Row
          Icon={Settings}
          label={language === "ar" ? "الإعدادات" : "Settings"}
        />
      </section>

      <section className="mx-5 rounded-2xl bg-white p-2 shadow-soft">
        <Row
          Icon={HelpCircle}
          label={language === "ar" ? "الدعم" : "Help & Support"}
        />
        <Row
          Icon={LogOut}
          label={language === "ar" ? "تسجيل الخروج" : "Sign out"}
          tone="danger"
        />
      </section>

      <p className="mx-5 mt-2 text-center text-[10px] uppercase tracking-[0.4em] text-midnight-400">
        JODNA · v0.1
      </p>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white/10 py-2 ring-1 ring-white/10 backdrop-blur">
    <p className="text-base font-semibold">{value}</p>
    <p className="text-[10px] uppercase tracking-widest text-white/60">
      {label}
    </p>
  </div>
);

const Row = ({
  Icon,
  label,
  value,
  onClick,
  tone,
  rightHint,
}: {
  Icon: typeof Bell;
  label: string;
  value?: string;
  onClick?: () => void;
  tone?: "danger";
  rightHint?: boolean;
}) => (
  <motion.button
    whileTap={{ scale: 0.985 }}
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-cloud ${
      tone === "danger" ? "text-red-500" : "text-midnight-700"
    }`}
  >
    <span
      className={`grid h-9 w-9 place-items-center rounded-xl ${
        tone === "danger" ? "bg-red-50" : "bg-cloud"
      }`}
    >
      <Icon size={16} />
    </span>
    <span className="flex-1 text-sm font-semibold text-ink">{label}</span>
    {value && (
      <span className="rounded-full bg-emerald2-50 px-2 py-1 text-[11px] font-semibold text-emerald2-700">
        {value}
      </span>
    )}
    {!value && (
      <ChevronRight size={16} className={rightHint ? "opacity-60" : ""} />
    )}
  </motion.button>
);
