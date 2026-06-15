import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CropPickerModal from "@/components/profile/CropPickerModal";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

const CROP_EMOJI = {
  Rice: "🌾", Wheat: "🌾", "Maize / Corn": "🌽", Tomato: "🍅", Potato: "🥔",
  Onion: "🧅", Cotton: "🌿", Sugarcane: "🎋", Coffee: "☕", Tea: "🍵",
  "Banana / Plantain": "🍌", Mango: "🥭", Soybean: "🌱", Chickpea: "🫘",
  Default: "🌿"
};

export default function MyCropsSection({ profile, onProfileUpdate }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const navigate = useNavigate();
  const { langCode } = useLang();

  const crops = profile?.primary_crops || [];

  const handleCropAdded = async (cropName) => {
    if (crops.includes(cropName)) { setPickerOpen(false); return; }
    const updatedCrops = [...crops, cropName];
    try {
      const user = await base44.auth.me();
      if (profile?.id) {
        const updated = await base44.entities.FarmerProfile.update(profile.id, { primary_crops: updatedCrops });
        onProfileUpdate(updated);
      } else {
        const created = await base44.entities.FarmerProfile.create({ uid: user.email, primary_crops: updatedCrops });
        onProfileUpdate(created);
      }
    } catch {}
    setPickerOpen(false);
  };

  const handleCropTap = (crop) => {
    navigate(`/market?crop=${encodeURIComponent(crop)}`);
  };

  return (
    <div className="mt-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">{t("profile_my_crops", langCode)}</h2>
      <div className="bg-white rounded-2xl border border-[#e8f5e9] shadow-sm p-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {crops.map(crop => (
            <button
              key={crop}
              onClick={() => handleCropTap(crop)}
              className="flex-shrink-0 flex items-center gap-1.5 bg-[#e8f5e9] text-[#1a5c2a] font-medium text-sm px-3 py-1.5 rounded-full hover:bg-[#c8e6c9] transition-colors"
            >
              <span>{CROP_EMOJI[crop] || CROP_EMOJI.Default}</span>
              <span>{crop}</span>
            </button>
          ))}
          <button
            onClick={() => setPickerOpen(true)}
            className="flex-shrink-0 flex items-center gap-1 border-2 border-dashed border-gray-300 text-gray-400 text-sm px-3 py-1.5 rounded-full hover:border-[#4ade80] hover:text-[#1a5c2a] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> {t("profile_add_crop", langCode)}
          </button>
        </div>
        {crops.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">{t("profile_no_crops", langCode)}</p>
        )}
      </div>

      {pickerOpen && (
        <CropPickerModal onSelect={handleCropAdded} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  );
}