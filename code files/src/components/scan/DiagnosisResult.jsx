import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Bug, Droplets, Leaf, FlaskConical, Phone, RefreshCw, WifiOff, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ReadAloudButton from "@/components/ReadAloudButton";
import LazyImage from "@/components/LazyImage";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

const CAUSE_CONFIG = {
  fungal: { icon: Droplets, color: "text-purple-600", bg: "bg-purple-50", labelKey: "fungal" },
  bacterial: { icon: Bug, color: "text-red-600", bg: "bg-red-50", labelKey: "bacterial" },
  pest: { icon: Bug, color: "text-orange-600", bg: "bg-orange-50", labelKey: "pest" },
  nutritional: { icon: FlaskConical, color: "text-blue-600", bg: "bg-blue-50", labelKey: "nutritional" },
  healthy: { icon: Leaf, color: "text-green-600", bg: "bg-green-50", labelKey: "healthy" },
};

const SEVERITY_CONFIG = {
  mild: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", labelKey: "mild" },
  moderate: { color: "bg-orange-100 text-orange-800 border-orange-200", labelKey: "moderate" },
  severe: { color: "bg-red-100 text-red-800 border-red-200", labelKey: "severe" },
  none: { color: "bg-green-100 text-green-800 border-green-200", labelKey: "none" },
};
function AnalyzingLoader({ crop }) {
  const { langCode } = useLang();
  const steps = [
    t("status_scanning", langCode),
    t("loading_health", langCode),
    t("loading_patterns", langCode),
    t("loading_treatment", langCode)
  ];
  const [step, setStep] = useState(0);

  useState(() => {
    const interval = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1800);
    return () => clearInterval(interval);
  });

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="relative w-32 h-32 mb-8">
        <motion.div className="absolute inset-0 rounded-full border-4 border-[#4ade80]/30" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.div className="absolute inset-4 rounded-full border-4 border-[#4ade80]/60" animate={{ scale: [1, 1.1, 1], rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
        <div className="absolute inset-8 rounded-full bg-[#4ade80] flex items-center justify-center">
          <Leaf className="w-8 h-8 text-[#1a5c2a]" />
        </div>
      </div>
      {/* Skeleton lines */}
      <div className="w-48 h-4 bg-[#e8f5e9] rounded-full animate-pulse mb-3" />
      <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-gray-500 text-sm">
        {steps[Math.min(step, steps.length - 1)]}
      </motion.p>
      <div className="flex gap-2 mt-6">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "w-8 bg-[#4ade80]" : "w-4 bg-gray-200"}`} />
        ))}
      </div>
    </div>
  );
}

function TreatmentCard({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.12, duration: 0.4 }}
      className="flex gap-3 bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9]"
    >
      <div className="w-7 h-7 rounded-full bg-[#1a5c2a] text-white text-xs font-bold flex-shrink-0 flex items-center justify-center mt-0.5">
        {index + 1}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
    </motion.div>
  );
}

export default function DiagnosisResult({ result, isAnalyzing, capturedImage, selectedCrop, onScanAgain }) {
  const [showPrevention, setShowPrevention] = useState(false);
  const { langCode } = useLang();

  if (isAnalyzing || !result) {
    return <AnalyzingLoader crop={selectedCrop} />;
  }

  if (result.offline && !result.disease_name) {
    return (
      <div className="p-6 flex flex-col items-center text-center py-20">
        <WifiOff className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          {t("offline_title", langCode)}
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          {t("offline_desc", langCode)}
        </p>
        <Button id="btn-scan-again" onClick={onScanAgain} className="bg-[#1a5c2a] text-white rounded-full min-h-[48px]">
          <RefreshCw className="w-4 h-4 mr-2" /> {t("btn_retry", langCode)}
        </Button>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="p-6 flex flex-col items-center text-center py-20">
        <AlertTriangle className="w-16 h-16 text-orange-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          {t("fail_title", langCode)}
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          {t("fail_desc", langCode)}
        </p>
        <Button id="btn-scan-again" onClick={onScanAgain} className="bg-[#1a5c2a] text-white rounded-full min-h-[48px]">
          <RefreshCw className="w-4 h-4 mr-2" /> {t("btn_scan_again", langCode)}
        </Button>
      </div>
    );
  }

  const causeConfig = CAUSE_CONFIG[result.cause || (result.is_healthy ? "healthy" : "fungal")];
  const CauseIcon = causeConfig?.icon || Leaf;
  const severityConfig = SEVERITY_CONFIG[result.severity || "none"];

  const causeLabel = t(causeConfig?.labelKey, langCode);
  const severityLabel = t(severityConfig?.labelKey, langCode);

  return (
    <div className="pb-24">
      {result.fromCache && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-orange-500" />
          <p className="text-orange-700 text-xs">{t("showing_cached_result", langCode)}</p>
        </motion.div>
      )}

      {capturedImage && (
        <div className="relative h-52 overflow-hidden">
          <LazyImage src={capturedImage.localPreview || capturedImage.url} alt="Scanned plant" className="w-full h-52" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f5f8f0] to-transparent" />
        </div>
      )}

      <div className="px-4 -mt-6 relative">
        {result.is_healthy ? (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="bg-white rounded-3xl shadow-lg border border-[#c8e6c9] p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t("diagnosis_title", langCode)}</p>
                  <h2 className="text-xl font-bold text-green-700">{t("healthy_plant", langCode)}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <motion.div className="h-2 rounded-full bg-green-500" initial={{ width: 0 }} animate={{ width: `${result.confidence || 90}%` }} transition={{ delay: 0.3, duration: 0.8 }} />
                </div>
                <span className="text-green-700 font-bold text-sm">{result.confidence || 90}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{t("confidence_score", langCode)}</p>
            </div>

            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-base font-bold text-[#1a5c2a]">🌿 {t("seasonal_care_tips", langCode)}</h3>
              <ReadAloudButton text={result.seasonal_care || []} />
            </div>
            <div className="flex flex-col gap-3">
              {(result.seasonal_care || []).map((tip, i) => (
                <TreatmentCard key={i} step={tip} index={i} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="bg-white rounded-3xl shadow-lg border border-red-100 p-6 mb-4">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-14 h-14 rounded-2xl ${causeConfig?.bg} flex items-center justify-center flex-shrink-0`}>
                  <CauseIcon className={`w-7 h-7 ${causeConfig?.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t("detected_disease", langCode)}</p>
                  <h2 className="text-lg font-bold text-gray-800 leading-tight">{result.disease_name || t("unknown_disease", langCode)}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{causeLabel}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityConfig?.color}`}>
                  ⚠️ {severityLabel} {t("severity_label", langCode)}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <motion.div className="h-1.5 rounded-full bg-[#4ade80]" initial={{ width: 0 }} animate={{ width: `${result.confidence || 80}%` }} transition={{ delay: 0.3, duration: 0.8 }} />
                  </div>
                  <span className="text-gray-600 font-bold text-xs">{result.confidence || 80}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-base font-bold text-[#1a5c2a]">💊 {t("treatment_steps", langCode)}</h3>
              <ReadAloudButton text={result.treatment_steps || []} />
            </div>
            <div className="flex flex-col gap-3 mb-5">
              {(result.treatment_steps || []).map((step, i) => (
                <TreatmentCard key={i} step={step} index={i} />
              ))}
            </div>

            {(result.prevention_tips || []).length > 0 && (
              <button
                onClick={() => setShowPrevention(p => !p)}
                className="w-full bg-white rounded-2xl p-4 border border-[#e8f5e9] flex items-center justify-between mb-4 shadow-sm min-h-[48px]"
              >
                <span className="text-[#1a5c2a] font-semibold text-sm">🛡️ {t("prevention_tips", langCode)}</span>
                {showPrevention ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
            )}
            <AnimatePresence>
              {showPrevention && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                  <div className="flex flex-col gap-2 pb-2">
                    {(result.prevention_tips || []).map((tip, i) => (
                      <div key={i} className="bg-[#f0faf2] rounded-xl p-3 flex gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">✓</span> {tip}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {result.consult_agronomist && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 mb-4">
                <Phone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">{t("consult_agronomist", langCode)}</p>
                  <p className="text-amber-700 text-xs mt-0.5">{t("consult_agronomist_desc", langCode)}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Button id="btn-scan-again" onClick={onScanAgain} className="w-full bg-[#1a5c2a] hover:bg-[#2d7a40] text-white rounded-full min-h-[48px] font-semibold shadow-lg mt-2">
            <RefreshCw className="w-4 h-4 mr-2" /> {t("btn_scan_again", langCode)}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}