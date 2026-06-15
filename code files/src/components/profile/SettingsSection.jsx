import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Globe, Bell, Ruler, Info, LogOut, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DeleteAccountModal from "@/components/profile/DeleteAccountModal";
import LanguagePickerModal from "@/components/profile/LanguagePickerModal";
import { useLang } from "@/lib/useLang.jsx";
import { LANGUAGE_NAMES, t } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";

// Build array of {code, name} for picker
const LANGUAGES = Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({ code, name }));

const CURRENCY_MAP = {
  India: "₹", USA: "USD $", Kenya: "KSh", Nigeria: "₦", Ethiopia: "Birr",
  Ghana: "₵", Tanzania: "TSh", Uganda: "USh", Zimbabwe: "ZWL", UK: "£",
  France: "€", Germany: "€", Brazil: "R$", Indonesia: "Rp", Vietnam: "₫"
};

function detectCurrency(profile) {
  const region = profile?.country || profile?.region || "";
  for (const [key, val] of Object.entries(CURRENCY_MAP)) {
    if (region.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "USD $";
}

export default function SettingsSections({ profile, user, onProfileUpdate }) {
  const [langOpen, setLangOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { logout } = useAuth();
  const [settings, setSettings] = useState({
    diseaseAlerts: true,
    marketAlerts: true,
    weatherAlerts: true,
    dailyAdvisory: false,
    advisoryTime: "07:00",
    units: profile?.farm_size_unit === "hectares" ? "metric" : "imperial",
  });
  const { langCode, setLangCode } = useLang();

  // currentLang: stored as name (e.g. "Tamil") in profile, or "English"
  const currentLangName = profile?.language || "English";
  const currency = detectCurrency(profile);

  const updateSetting = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const handleLanguageSelect = async ({ code, name }) => {
    setLangOpen(false);
    setLangCode(code);
    if (!profile?.id) return;
    const updated = await base44.entities.FarmerProfile.update(profile.id, { language: name });
    onProfileUpdate(updated);
  };

  const handleUnitsToggle = async (units) => {
    updateSetting("units", units);
    if (!profile?.id) return;
    const unit = units === "metric" ? "hectares" : "acres";
    const updated = await base44.entities.FarmerProfile.update(profile.id, { farm_size_unit: unit });
    onProfileUpdate(updated);
  };

  const handleSignOut = () => logout();

  return (
    <div className="mt-4 space-y-4">
      {/* Language */}
      <Section icon={<Globe className="w-4 h-4" />} title={t("lbl_language", langCode)}>
        <button
          onClick={() => setLangOpen(true)}
          className="w-full flex items-center justify-between py-3 px-1 min-h-[48px]"
        >
          <span className="text-sm text-gray-700">{currentLangName}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell className="w-4 h-4" />} title={t("notifications", langCode)}>
        {[
          ["diseaseAlerts", "disease_alerts"],
          ["marketAlerts", "market_alerts"],
          ["weatherAlerts", "weather_alerts"],
          ["dailyAdvisory", "daily_advisory"],
        ].map(([key, labelKey]) => (
          <ToggleRow
            key={key}
            label={t(labelKey, langCode)}
            value={settings[key]}
            onChange={v => updateSetting(key, v)}
          />
        ))}
        {settings.dailyAdvisory && (
          <div className="flex items-center justify-between py-2 px-1">
            <span className="text-sm text-gray-500">{t("delivery_time", langCode)}</span>
            <input
              type="time"
              value={settings.advisoryTime}
              onChange={e => updateSetting("advisoryTime", e.target.value)}
              className="text-sm text-[#1a5c2a] font-medium border border-[#c8e6c9] rounded-lg px-2 py-1"
            />
          </div>
        )}
      </Section>

      {/* Units */}
      <Section icon={<Ruler className="w-4 h-4" />} title={t("units", langCode)}>
        <div className="py-2 px-1">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {["metric", "imperial"].map(u => (
              <button
                key={u}
                onClick={() => handleUnitsToggle(u)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.units === u
                    ? "bg-white text-[#1a5c2a] shadow-sm"
                    : "text-gray-500"
                }`}
              >
                {u === "metric" ? "Metric (°C, kg, ha)" : "Imperial (°F, lb, ac)"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between py-2 px-1">
          <span className="text-sm text-gray-500">{t("currency", langCode)}</span>
          <span className="text-sm font-medium text-gray-800">{currency} ({t("auto_detected", langCode)})</span>
        </div>
      </Section>

      {/* About */}
      <Section icon={<Info className="w-4 h-4" />} title={t("about", langCode)}>
        <InfoRow label={t("app_version", langCode)} value="1.0.0" />
        <InfoLink label={t("how_to_use", langCode)} href="#" />
        <InfoLink label={t("support", langCode)} href="mailto:support@agriguard.ai" />
        <InfoLink label={t("privacy_policy", langCode)} href="#" />
      </Section>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider">{t("danger_zone", langCode)}</h3>
        </div>
        <div className="px-4 divide-y divide-gray-50">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 py-3.5 text-red-500 font-medium min-h-[48px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">{t("btn_sign_out", langCode)}</span>
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="w-full flex items-center gap-3 py-3.5 text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">{t("delete_account", langCode)}</span>
          </button>
        </div>
      </div>

      {langOpen && (
        <LanguagePickerModal
          currentCode={langCode}
          languages={LANGUAGES}
          onSelect={handleLanguageSelect}
          onClose={() => setLangOpen(false)}
        />
      )}
      {deleteOpen && (
        <DeleteAccountModal user={user} profile={profile} onClose={() => setDeleteOpen(false)} />
      )}
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#e8f5e9] shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
        <span className="text-[#1a5c2a]">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-4 divide-y divide-gray-50">{children}</div>
    </motion.div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-[#4ade80]" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-sm text-gray-400">{value}</span>
    </div>
  );
}

function InfoLink({ label, href }) {
  return (
    <a href={href} className="flex items-center justify-between py-3 group">
      <span className="text-sm text-[#1a5c2a] group-hover:underline">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-300" />
    </a>
  );
}