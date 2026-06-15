import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/useLang.jsx";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const { langCode } = useLang();

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-[#1a5c2a] text-white text-xs font-medium flex items-center justify-center gap-2 pt-safe-top py-2 px-4"
        >
          <WifiOff className="w-3.5 h-3.5" />
          {t("status_offline", langCode)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}