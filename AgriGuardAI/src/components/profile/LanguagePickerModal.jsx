import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, I18nManager } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useTranslation } from '../../lib/react-i18next';
// We'd typically import this from a central constants file or I18n config
const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
  pa: 'ਪੰਜਾਬੀ',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  gu: 'ગુજરાતી',
  bn: 'বাংলা',
  ml: 'മലയാളം',
  ur: 'اردو',
  es: 'Español',
  fr: 'Français',
  ar: 'العربية',
  sw: 'Kiswahili',
  zh: '中文',
};

const RTL_LANGUAGES = ['ar', 'ur', 'he', 'fa'];

const LanguagePickerModal = ({ visible, onClose }) => {
  const { t, i18n } = useTranslation();
  
  const currentLang = i18n.language?.substring(0, 2) || 'en';

  const handleLanguageSelect = async (langCode) => {
    await i18n.changeLanguage(langCode);
    
    // Check if we need to switch RTL/LTR
    const isRtl = RTL_LANGUAGES.includes(langCode);
    if (isRtl !== I18nManager.isRTL) {
      I18nManager.forceRTL(isRtl);
      // In a real app, this requires a restart (e.g. using RNRestart)
      // but we'll just set it for now.
    }
    
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('selectLanguage', 'Select Language')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.list}>
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => {
                const isSelected = currentLang === code;
                return (
                  <TouchableOpacity 
                    key={code}
                    style={[styles.langItem, isSelected && styles.langItemSelected]}
                    onPress={() => handleLanguageSelect(code)}
                  >
                    <Text style={[styles.langText, isSelected && styles.langTextSelected]}>
                      {name}
                    </Text>
                    {isSelected && <Check size={20} color="#1a5c2a" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeBtn: {
    padding: 4,
  },
  scrollView: {
    marginBottom: 20,
  },
  list: {
    flexDirection: 'column',
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  langItemSelected: {
    backgroundColor: '#f5f8f0',
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  langText: {
    fontSize: 16,
    color: '#4b5563',
  },
  langTextSelected: {
    color: '#1a5c2a',
    fontWeight: 'bold',
  },
});

export default LanguagePickerModal;
