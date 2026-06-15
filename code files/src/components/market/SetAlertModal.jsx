import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function SetAlertModal({ crop, currentPrice, unit, region, onClose }) {
  const [targetPrice, setTargetPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!targetPrice || isNaN(Number(targetPrice))) return;
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.PriceAlert.create({
        uid: user.email,
        crop,
        target_price: Number(targetPrice),
        unit: unit || "quintal",
        region: region || "",
        market: "",
        triggered: false,
        is_active: true,
      });
      setSaved(true);
      setTimeout(onClose, 1200);
    } catch {}
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#1a5c2a]" />
              <h3 className="font-bold text-[#1a5c2a] text-lg">Set Price Alert</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="bg-[#f0faf2] rounded-2xl p-4 mb-5">
            <p className="text-xs text-gray-500 mb-1">Crop</p>
            <p className="font-bold text-gray-800">{crop}</p>
            {currentPrice && (
              <p className="text-xs text-gray-500 mt-1">
                Current price: <span className="font-semibold text-[#1a5c2a]">₹{currentPrice?.toLocaleString("en-IN")} / {unit || "quintal"}</span>
              </p>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">Alert me when price reaches or exceeds:</p>
          <div className="relative mb-5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
            <Input
              type="number"
              placeholder="e.g. 2500"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              className="pl-8 border-[#c8e6c9] focus:border-[#4caf50] rounded-xl text-lg font-bold"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ {unit || "quintal"}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || saved || !targetPrice}
            className={`w-full h-12 rounded-full font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              saved ? "bg-green-500" : "bg-[#1a5c2a] hover:bg-[#2d7a40] disabled:opacity-50"
            }`}
          >
            {saved ? (
              <><Check className="w-5 h-5" /> Alert Saved!</>
            ) : saving ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <><Bell className="w-4 h-4" /> Set Alert</>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}