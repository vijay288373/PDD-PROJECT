import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { CheckCircle, AlertTriangle, Clock, Leaf } from "lucide-react";
import { format } from "date-fns";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

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

const SEVERITY_LABELS = {
  mild: { en: "Mild", hi: "हल्का", ta: "லேசான", te: "తేలికపాటి", es: "Leve" },
  moderate: { en: "Moderate", hi: "मध्यम", ta: "மிதமான", te: "మితమైన", es: "Moderado" },
  severe: { en: "Severe", hi: "गंभीर", ta: "கடுமையான", te: "తీవ్రమైన", es: "Grave" },
  none: { en: "None", hi: "कोई नहीं", ta: "ஏதுமில்லை", te: "ఏమీ లేదు", es: "Ninguna" }
};

const LOCAL_TEXTS = {
  no_scans: { en: "No Scans Yet", hi: "अभी तक कोई स्कैन नहीं", ta: "இன்னும் ஸ்கேன்கள் இல்லை", te: "ఇంకా స్కాన్‌లు లేవు", es: "No hay escaneos todavía" },
  no_scans_desc: { en: "Start scanning your crops to build your history", hi: "इतिहास बनाने के लिए अपनी फसलों को स्कैन करना शुरू करें", ta: "வரலாற்றை உருவாக்க உங்கள் பயிர்களை ஸ்கேன் செய்யத் தொடங்குங்கள்", te: "మీ చరిత్రను రూపొందించడానికి మీ పంటలను స్కాన్ చేయడం ప్రారంభించండి", es: "Comience a escanear sus cultivos para crear su historial" },
  healthy: { en: "Healthy", hi: "स्वस्थ", ta: "ஆரோக்கியமானது", te: "ఆరోగ్యకరమైనది", es: "Sana" }
};

export default function ScanHistory() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { langCode } = useLang();

  useEffect(() => {
    const loadScans = async () => {
      try {
        const data = await base44.entities.ScanHistory.list("-created_date", 20);
        setScans(data);
      } catch {}
      setLoading(false);
    };
    loadScans();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <Leaf className="w-16 h-16 text-gray-200 mb-4" />
        <h3 className="text-lg font-bold text-gray-500">
          {LOCAL_TEXTS.no_scans[langCode] || LOCAL_TEXTS.no_scans["en"]}
        </h3>
        <p className="text-gray-400 text-sm mt-2">
          {LOCAL_TEXTS.no_scans_desc[langCode] || LOCAL_TEXTS.no_scans_desc["en"]}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[#1a5c2a] mb-4">{t("history_title", langCode)}</h2>
      <div className="flex flex-col gap-3">
        {scans.map((scan, i) => {
          const translatedCrop = t(CROP_KEYS[scan.crop] || scan.crop, langCode);
          const severityText = SEVERITY_LABELS[scan.severity]?.[langCode] || SEVERITY_LABELS[scan.severity]?.["en"] || scan.severity;
          
          return (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e8f5e9] flex"
            >
              {scan.image_url && (
                <img
                  src={scan.image_url}
                  alt={scan.crop}
                  className="w-20 h-20 object-cover flex-shrink-0"
                />
              )}
              <div className="p-3 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{translatedCrop}</p>
                    {scan.is_healthy ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 text-xs">
                          {LOCAL_TEXTS.healthy[langCode] || LOCAL_TEXTS.healthy["en"]}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                        <span className="text-orange-600 text-xs truncate max-w-[140px]">{scan.disease_name}</span>
                      </div>
                    )}
                  </div>
                  {scan.severity && !scan.is_healthy && (
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      scan.severity === "severe" ? "bg-red-100 text-red-700" :
                      scan.severity === "moderate" ? "bg-orange-100 text-orange-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {severityText}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{scan.created_date ? format(new Date(scan.created_date), "MMM d, yyyy · h:mm a") : "—"}</span>
                </div>
                {scan.confidence > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1">
                      <div className="h-1 rounded-full bg-[#4ade80]" style={{ width: `${scan.confidence}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{scan.confidence}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}