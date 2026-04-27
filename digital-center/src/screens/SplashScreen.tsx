import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";

export const SplashScreen = () => {
  const { language } = useApp();

  return (
    <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-midnight-gradient text-white">
      <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald2/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur shadow-glow">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-gradient text-2xl font-bold tracking-tight">
            JO
          </div>
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.4em] text-white/60">
          Jabal Omar
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {language === "ar" ? "المركز الرقمي" : "Digital Center"}
        </h1>
        <p className="mt-2 max-w-[260px] text-center text-xs text-white/65">
          {language === "ar"
            ? "وجهتك الذكية لكل ما يحدث داخل جبل عمر"
            : "Your smart concierge for everything inside the destination"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-16 z-10 flex gap-1.5"
        aria-label="Loading"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-emerald2-300"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      <p className="absolute bottom-8 z-10 text-[10px] uppercase tracking-[0.3em] text-white/50">
        QR · Geo · Language detected
      </p>
    </div>
  );
};
