import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

const CROPS = [
  { name: "Rice", emoji: "🌾", category: "Grain" },
  { name: "Wheat", emoji: "🌾", category: "Grain" },
  { name: "Maize / Corn", emoji: "🌽", category: "Grain" },
  { name: "Sorghum", emoji: "🌾", category: "Grain" },
  { name: "Millet", emoji: "🌾", category: "Grain" },
  { name: "Barley", emoji: "🌾", category: "Grain" },
  { name: "Tomato", emoji: "🍅", category: "Vegetable" },
  { name: "Potato", emoji: "🥔", category: "Vegetable" },
  { name: "Onion", emoji: "🧅", category: "Vegetable" },
  { name: "Cassava", emoji: "🍠", category: "Root" },
  { name: "Sweet Potato", emoji: "🍠", category: "Root" },
  { name: "Yam", emoji: "🍠", category: "Root" },
  { name: "Cotton", emoji: "🌿", category: "Cash Crop" },
  { name: "Sugarcane", emoji: "🎋", category: "Cash Crop" },
  { name: "Coffee", emoji: "☕", category: "Cash Crop" },
  { name: "Tea", emoji: "🍵", category: "Cash Crop" },
  { name: "Cocoa", emoji: "🍫", category: "Cash Crop" },
  { name: "Tobacco", emoji: "🌿", category: "Cash Crop" },
  { name: "Groundnut / Peanut", emoji: "🥜", category: "Legume" },
  { name: "Soybean", emoji: "🌱", category: "Legume" },
  { name: "Chickpea", emoji: "🫘", category: "Legume" },
  { name: "Lentil", emoji: "🫘", category: "Legume" },
  { name: "Cowpea", emoji: "🫘", category: "Legume" },
  { name: "Banana / Plantain", emoji: "🍌", category: "Fruit" },
  { name: "Mango", emoji: "🥭", category: "Fruit" },
  { name: "Papaya", emoji: "🍈", category: "Fruit" },
  { name: "Citrus (Orange/Lemon)", emoji: "🍊", category: "Fruit" },
  { name: "Avocado", emoji: "🥑", category: "Fruit" },
  { name: "Pineapple", emoji: "🍍", category: "Fruit" },
  { name: "Watermelon", emoji: "🍉", category: "Fruit" },
  { name: "Grapes", emoji: "🍇", category: "Fruit" },
  { name: "Apple", emoji: "🍎", category: "Fruit" },
  { name: "Cabbage", emoji: "🥬", category: "Vegetable" },
  { name: "Spinach", emoji: "🥬", category: "Vegetable" },
  { name: "Pepper (Bell/Chili)", emoji: "🌶️", category: "Vegetable" },
  { name: "Eggplant", emoji: "🍆", category: "Vegetable" },
  { name: "Cucumber", emoji: "🥒", category: "Vegetable" },
  { name: "Okra", emoji: "🌿", category: "Vegetable" },
  { name: "Garlic", emoji: "🧄", category: "Vegetable" },
  { name: "Carrot", emoji: "🥕", category: "Vegetable" },
  { name: "Sunflower", emoji: "🌻", category: "Oil Crop" },
  { name: "Canola / Rapeseed", emoji: "🌼", category: "Oil Crop" },
  { name: "Palm Oil", emoji: "🌴", category: "Oil Crop" },
  { name: "Sesame", emoji: "🌿", category: "Oil Crop" },
  { name: "Rubber", emoji: "🌳", category: "Tree Crop" },
  { name: "Coconut", emoji: "🥥", category: "Tree Crop" },
  { name: "Cashew", emoji: "🌰", category: "Tree Crop" },
  { name: "Aloe Vera", emoji: "🌵", category: "Medicinal" },
  { name: "Turmeric", emoji: "🌿", category: "Spice" },
  { name: "Ginger", emoji: "🌿", category: "Spice" },
];

const CATEGORIES = ["All", "Grain", "Vegetable", "Fruit", "Legume", "Cash Crop", "Root", "Oil Crop", "Tree Crop", "Spice"];

const CAT_KEYS = {
  "All": "cat_all",
  "Grain": "cat_grain",
  "Vegetable": "cat_vegetable",
  "Fruit": "cat_fruit",
  "Legume": "cat_legume",
  "Cash Crop": "cat_cash",
  "Root": "cat_root",
  "Oil Crop": "cat_oil",
  "Tree Crop": "cat_tree",
  "Spice": "cat_spice"
};

const CROP_KEYS = {
  "Rice": "crop_rice",
  "Wheat": "crop_wheat",
  "Tomato": "crop_tomato",
  "Potato": "crop_potato",
  "Onion": "crop_onion",
  "Maize / Corn": "crop_maize",
  "Cotton": "crop_cotton",
  "Sugarcane": "crop_sugarcane",
  "Pepper (Bell/Chili)": "crop_chili",
  "Banana / Plantain": "crop_banana"
};

export default function CropSelector({ onCropSelected }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { langCode } = useLang();

  const filtered = CROPS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-5 mt-2">
          <h2 className="text-2xl font-bold text-[#1a5c2a]">{t("select_crop", langCode)}</h2>
          <p className="text-gray-500 text-sm mt-1">{t("select_crop_desc", langCode)}</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="input-crop-search"
            placeholder={t("search_crops", langCode)}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white border-[#c8e6c9] focus:border-[#4caf50] rounded-xl"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[#1a5c2a] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {t(CAT_KEYS[cat] || cat, langCode)}
            </button>
          ))}
        </div>

        {/* Crop grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((crop, i) => (
            <motion.button
              key={crop.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              onClick={() => onCropSelected(crop.name)}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-[#e8f5e9] hover:border-[#4caf50] hover:shadow-md transition-all text-left active:scale-95"
            >
              <span className="text-3xl">{crop.emoji}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm leading-tight">
                  {t(CROP_KEYS[crop.name] || crop.name, langCode)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t(CAT_KEYS[crop.category] || crop.category, langCode)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" />
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p>{t("no_crops_found", langCode)} "{search}"</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}