import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

/**
 * languages: Array of {code, name}
 * currentCode: string
 * onSelect: ({code, name}) => void
 */
export default function LanguagePickerModal({ currentCode, languages, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const { langCode } = useLang();
  const filtered = languages.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        className="bg-white w-full max-w-lg mx-auto rounded-t-3xl p-5 max-h-[65vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">{t("profile_select_language", langCode)}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("profile_search_language", langCode)}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="overflow-y-auto flex-1">
          {filtered.map(lang => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang)}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#e8f5e9] transition-colors min-h-[48px]"
            >
              <span className="text-sm text-gray-800">{lang.name}</span>
              {currentCode === lang.code && <Check className="w-4 h-4 text-[#1a5c2a]" />}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}