import React, { createContext, useContext, useState, useEffect } from "react";
import { I18nManager } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base44 } from "../api/base44Client";
import { LANGUAGE_CODES, RTL_LANGUAGES } from "./i18n";

const LangContext = createContext({ langCode: "en", setLangCode: () => {} });

export function LangProvider({ children }) {
  const [langCode, setLangCodeState] = useState("en");

  useEffect(() => {
    const load = async () => {
      try {
        const storedLang = await AsyncStorage.getItem("app_lang");
        if (storedLang) {
          setLangCodeState(storedLang);
        } else {
          const user = await base44.auth.me();
          const profiles = await base44.entities.FarmerProfile.filter({ uid: user.email });
          if (profiles.length > 0 && profiles[0].language) {
            const code = LANGUAGE_CODES[profiles[0].language] || "en";
            setLangCodeState(code);
            await AsyncStorage.setItem("app_lang", code);
          }
        }
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const isRTL = RTL_LANGUAGES.includes(langCode);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      // NOTE: changing RTL on the fly usually requires a bundle reload or app restart in React Native
    }
  }, [langCode]);

  const setLangCode = async (code) => {
    setLangCodeState(code);
    await AsyncStorage.setItem("app_lang", code);
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
