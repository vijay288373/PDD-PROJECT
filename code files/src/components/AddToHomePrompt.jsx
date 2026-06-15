import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/useLang.jsx";

export default function AddToHomePrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const { langCode } = useLang();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      const scanCount = parseInt(localStorage.getItem("scan_count") || "0", 10);
      if (scanCount >= 2) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    const savedPrompt = prompt;
    setPrompt(null);
    savedPrompt.prompt();
    const { outcome } = await savedPrompt.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-50 bg-white rounded-2xl shadow-xl border border-[#c8e6c9] p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-[#1a5c2a] rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-[#4ade80]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800">{t("app_name", langCode)}</p>
            <p className="text-xs text-gray-500 truncate">{t("status_add_home", langCode)}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="bg-[#1a5c2a] text-white text-xs font-semibold px-3 py-2 rounded-xl min-h-[48px]"
            >
              Add
            </button>
            <button onClick={() => setShow(false)} className="text-gray-400 min-h-[48px] px-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}