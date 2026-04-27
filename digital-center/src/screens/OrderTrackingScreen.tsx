import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { ProgressTracker } from "../components/ProgressTracker";
import { useApp } from "../context/AppContext";

const stepKeys = ["received", "preparing", "ready", "completed"] as const;

const stepLabels: Record<string, string[]> = {
  en: ["Received", "Preparing", "Ready", "Completed"],
  ar: ["تم الاستلام", "قيد التحضير", "جاهز", "تم الإنجاز"],
};

export const OrderTrackingScreen = () => {
  const { order, language, navigate } = useApp();
  const [seconds, setSeconds] = useState(
    order ? order.etaMinutes * 60 : 12 * 60,
  );

  useEffect(() => {
    if (!order) return;
    const t = setInterval(
      () => setSeconds((s) => (s > 0 ? s - 1 : 0)),
      1000,
    );
    return () => clearInterval(t);
  }, [order]);

  const stepIndex = useMemo(() => {
    if (!order) return 0;
    const elapsed = order.etaMinutes * 60 - seconds;
    if (seconds <= 0) return 3;
    if (elapsed < 60) return 0;
    if (elapsed < order.etaMinutes * 60 * 0.6) return 1;
    return 2;
  }, [order, seconds]);

  const labels = stepLabels[language] || stepLabels.en;

  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Header
        variant="page"
        title={language === "ar" ? "تتبّع الطلب" : "Order Tracking"}
        subtitle={
          language === "ar" ? "معلومات الطلب الحالية" : "Live status updates"
        }
        backTo="home"
      />

      {!order ? (
        <div className="mx-5 rounded-2xl bg-white p-6 text-center shadow-soft">
          <p className="text-sm text-midnight-500">
            {language === "ar"
              ? "لا يوجد طلبات حالياً."
              : "No active orders right now."}
          </p>
          <button
            type="button"
            onClick={() => navigate("food")}
            className="mt-4 rounded-xl bg-emerald-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow"
          >
            {language === "ar" ? "اطلب الآن" : "Order something"}
          </button>
        </div>
      ) : (
        <>
          <section className="mx-5 overflow-hidden rounded-3xl bg-midnight-gradient p-5 text-white shadow-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/60">
                  {language === "ar" ? "الوصول خلال" : "Arriving in"}
                </p>
                <motion.p
                  key={`${mm}:${ss}`}
                  initial={{ opacity: 0.4, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-4xl font-semibold tracking-tight"
                >
                  {mm}:{ss}
                </motion.p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-gradient text-white shadow-glow">
                <Sparkles size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur">
              <div>
                <p className="text-[11px] text-white/65">
                  {language === "ar" ? "المتجر" : "Store"}
                </p>
                <p className="text-sm font-semibold">{order.storeName}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/65">
                  {language === "ar" ? "رقم الطلب" : "Order ID"}
                </p>
                <p className="text-sm font-semibold">#{order.id}</p>
              </div>
            </div>
          </section>

          <section className="mx-5 rounded-2xl bg-white p-5 shadow-soft">
            <h3 className="mb-4 text-sm font-semibold text-ink">
              {language === "ar" ? "خطوات الطلب" : "Order steps"}
            </h3>
            <ProgressTracker
              steps={stepKeys.map((_, i) => labels[i])}
              currentIndex={stepIndex}
            />
          </section>

          <div className="mx-5 mt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("home")}
              type="button"
              className="w-full rounded-2xl bg-midnight-700 px-5 py-4 text-sm font-semibold text-white shadow-card"
            >
              {language === "ar" ? "العودة للرئيسية" : "Back to Home"}
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
};
