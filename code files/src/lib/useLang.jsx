import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LANGUAGE_CODES, RTL_LANGUAGES } from "./i18n";

const LangContext = createContext({ langCode: "en", setLangCode: () => {} });

export function LangProvider({ children }) {
  const [langCode, setLangCodeState] = useState("en");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.FarmerProfile.filter({ uid: user.email });
        if (profiles.length > 0 && profiles[0].language) {
          const code = LANGUAGE_CODES[profiles[0].language] || "en";
          setLangCodeState(code);
        }
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const isRTL = RTL_LANGUAGES.includes(langCode);
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = langCode;
  }, [langCode]);

  const setLangCode = (code) => {
    setLangCodeState(code);
  };

  return (
    <LangContext.Provider value={{ langCode, setLangCode }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}