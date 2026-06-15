import { useState } from "react";
import { motion } from "framer-motion";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

const CROPS = [
  "Rice","Wheat","Maize / Corn","Sorghum","Millet","Barley","Tomato","Potato","Onion",
  "Cassava","Sweet Potato","Yam","Cotton","Sugarcane","Coffee","Tea","Cocoa","Tobacco",
  "Groundnut / Peanut","Soybean","Chickpea","Lentil","Cowpea","Banana / Plantain",
  "Mango","Papaya","Citrus (Orange/Lemon)","Avocado","Pineapple","Watermelon","Grapes",
  "Apple","Cabbage","Spinach","Pepper (Bell/Chili)","Eggplant","Cucumber","Okra",
  "Garlic","Carrot","Sunflower","Canola / Rapeseed","Palm Oil","Sesame","Rubber",
  "Coconut","Cashew","Aloe Vera","Turmeric","Ginger"
];

export default function CropPickerModal({ onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const { langCode } = useLang();
  const filtered = CROPS.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white w-full max-w-lg mx-auto rounded-t-3xl p-5 max-h-[70vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">{t("profile_select_crop", langCode)}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("profile_search_crops", langCode)}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="overflow-y-auto flex-1">
          {filtered.map(crop => (
            <button
              key={crop}
              onClick={() => onSelect(crop)}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#e8f5e9] text-gray-800 text-sm transition-colors"
            >
              {crop}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}