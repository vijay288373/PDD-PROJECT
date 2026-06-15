import { AlertCircle, RefreshCw } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/useLang.jsx";

/**
 * Reusable error card with a retry action.
 * Props: label (what failed), onRetry
 */
export default function ErrorCard({ label, onRetry }) {
  const { langCode } = useLang();
  return (
    <div
      onClick={onRetry}
      className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:bg-orange-100 transition-colors"
    >
      <AlertCircle className="w-8 h-8 text-orange-400 mb-2" />
      <p className="text-sm font-semibold text-orange-700">
        Couldn't load {label}.
      </p>
      <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
        <RefreshCw className="w-3 h-3" /> {t("btn_retry", langCode)}
      </p>
    </div>
  );
}