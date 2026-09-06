import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import CropPickerModal from "@/components/profile/CropPickerModal";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ptnlnpcycionjciuodep.supabase.co';
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DTMpMtKdF346pVGIQ8XMjw_FAeBcaIz';

const CROP_EMOJI = {
  Rice: "🌾", Wheat: "🌾", "Maize / Corn": "🌽", Tomato: "🍅", Potato: "🥔",
  Onion: "🧅", Cotton: "🌿", Sugarcane: "🎋", Coffee: "☕", Tea: "🍵",
  "Banana / Plantain": "🍌", Mango: "🥭", Soybean: "🌱", Chickpea: "🫘",
  Default: "🌿"
};

async function saveCropsToSupabase(profileId, crops) {
  if (!SUPA_URL || !SUPA_KEY) return false;
  const res = await fetch(
    `${SUPA_URL}/rest/v1/FarmerProfile?id=eq.${encodeURIComponent(profileId)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ primary_crops: crops, updated_date: new Date().toISOString() }),
    }
  );
  if (!res.ok) {
    console.error("saveCropsToSupabase failed:", await res.text());
    return false;
  }
  return true;
}

export default function MyCropsSection({ profile, onProfileUpdate }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { langCode } = useLang();

  const crops = profile?.primary_crops || [];

  const handleCropAdded = async (cropName) => {
    if (crops.includes(cropName)) { setPickerOpen(false); return; }
    const updatedCrops = [...crops, cropName];

    // Optimistically update UI immediately
    const optimisticProfile = { ...profile, primary_crops: updatedCrops };
    onProfileUpdate(optimisticProfile);
    setPickerOpen(false);

    // Persist to Supabase
    if (profile?.id) {
      setSaving(true);
      const ok = await saveCropsToSupabase(profile.id, updatedCrops);
      if (!ok) {
        console.warn("Crop save failed — keeping UI update anyway");
      }
      setSaving(false);
    }
  };

  const handleCropRemove = async (cropName) => {
    const updatedCrops = crops.filter(c => c !== cropName);
    onProfileUpdate({ ...profile, primary_crops: updatedCrops });
    if (profile?.id) {
      await saveCropsToSupabase(profile.id, updatedCrops);
    }
  };

  const handleCropTap = (crop) => {
    navigate(`/market?crop=${encodeURIComponent(crop)}`);
  };

  return (
    <div className="mt-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
        {t("profile_my_crops", langCode)}
      </h2>
      <div className="bg-white rounded-2xl border border-[#e8f5e9] shadow-sm p-4">
        <div className="flex gap-2 flex-wrap">
          {crops.map(crop => (
            <div
              key={crop}
              className="flex items-center gap-1 bg-[#e8f5e9] text-[#1a5c2a] font-medium text-sm px-3 py-1.5 rounded-full"
            >
              <span onClick={() => handleCropTap(crop)} className="cursor-pointer flex items-center gap-1">
                <span>{CROP_EMOJI[crop] || CROP_EMOJI.Default}</span>
                <span>{crop}</span>
              </span>
              <button
                onClick={() => handleCropRemove(crop)}
                className="ml-1 text-[#1a5c2a]/50 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setPickerOpen(true)}
            disabled={saving}
            className="flex items-center gap-1 border-2 border-dashed border-gray-300 text-gray-400 text-sm px-3 py-1.5 rounded-full hover:border-[#4ade80] hover:text-[#1a5c2a] transition-colors disabled:opacity-50"
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