import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

const FARM_TYPES = ["smallholder", "commercial", "organic"];

export default function EditProfileModal({ profile, user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: profile?.name || user?.full_name || "",
    region: profile?.region || "",
    country: profile?.country || "",
    farm_size: profile?.farm_size || "",
    farm_size_unit: profile?.farm_size_unit || "acres",
    farming_type: profile?.farming_type || "smallholder",
  });
  const [saving, setSaving] = useState(false);
  const { langCode } = useLang();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const uid = user?.email;
      let updated;
      if (profile?.id) {
        updated = await base44.entities.FarmerProfile.update(profile.id, { ...form, farm_size: Number(form.farm_size) || 0 });
      } else {
        updated = await base44.entities.FarmerProfile.create({ uid, ...form, farm_size: Number(form.farm_size) || 0 });
      }
      onSave(updated);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        className="bg-white w-full max-w-lg mx-auto rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-gray-900">{t("profile_edit", langCode)}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <Field label={t("lbl_full_name", langCode)}>
            <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder={t("profile_name_placeholder", langCode)} className="rounded-xl" />
          </Field>
          <Field label={t("lbl_region", langCode)}>
            <Input value={form.region} onChange={e => set("region", e.target.value)} placeholder={t("profile_region_placeholder", langCode)} className="rounded-xl" />
          </Field>
          <Field label={t("lbl_country", langCode)}>
            <Input value={form.country} onChange={e => set("country", e.target.value)} placeholder={t("profile_country_placeholder", langCode)} className="rounded-xl" />
          </Field>
          <Field label={t("lbl_farm_size", langCode)}>
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.farm_size}
                onChange={e => set("farm_size", e.target.value)}
                placeholder={t("profile_farm_size_placeholder", langCode)}
                className="rounded-xl flex-1"
              />
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {["acres", "hectares"].map(u => (
                  <button
                    key={u}
                    onClick={() => set("farm_size_unit", u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      form.farm_size_unit === u ? "bg-white text-[#1a5c2a] shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </Field>
          <Field label={t("profile_farming_type_label", langCode)}>
            <div className="flex gap-2">
              {FARM_TYPES.map(farmType => (
                <button
                  key={farmType}
                  onClick={() => set("farming_type", farmType)}
                  className={`flex-1 py-2 rounded-xl text-sm capitalize transition-all ${
                    form.farming_type === farmType
                      ? "bg-[#1a5c2a] text-white font-medium"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t("profile_" + farmType, langCode)}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-[#1a5c2a] text-white py-3.5 rounded-2xl font-semibold disabled:opacity-60"
        >
          {saving ? t("profile_saving", langCode) : t("btn_save", langCode)}
        </button>
      </motion.div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}