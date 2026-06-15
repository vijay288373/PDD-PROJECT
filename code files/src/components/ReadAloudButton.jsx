import { Volume2, VolumeX } from "lucide-react";
import { useReadAloud } from "@/lib/useReadAloud";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

/**
 * Reusable "Read Aloud" button.
 * Props:
 *   text: string | string[]  — text to read (joined if array)
 *   className: optional extra classes
 */
export default function ReadAloudButton({ text, className = "" }) {
  const { langCode } = useLang();
  const { speaking, speak, stop } = useReadAloud(langCode);

  const content = Array.isArray(text) ? text.join(". ") : String(text || "");

  return (
    <button
      onClick={() => speaking ? stop() : speak(content)}
      className={`min-h-[48px] flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${
        speaking
          ? "bg-red-50 text-red-600 border border-red-200"
          : "bg-[#e8f5e9] text-[#1a5c2a] border border-[#c8e6c9]"
      } ${className}`}
      aria-label={speaking ? t("btn_stop", langCode) : t("btn_read_aloud", langCode)}
    >
      {speaking
        ? <><VolumeX className="w-4 h-4" /><span className="text-xs font-medium">{t("btn_stop", langCode)}</span></>
        : <><Volume2 className="w-4 h-4" /><span className="text-xs font-medium">{t("btn_read_aloud", langCode)}</span></>
      }
    </button>
  );
}