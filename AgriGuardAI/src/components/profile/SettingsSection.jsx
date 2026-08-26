import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Globe, User, ShieldAlert, LogOut, ChevronRight } from 'lucide-react-native';
import { useTranslation } from '../../lib/react-i18next';

const SettingsSection = ({ onLanguagePress, onEditProfilePress, onDeleteAccountPress, onSignOutPress }) => {
  const { t } = useTranslation();

  const settingsOptions = [
    {
      id: 'language',
      icon: <Globe size={20} color="#4b5563" />,
      title: t('language', 'Language'),
      onPress: onLanguagePress,
    },
    {
      id: 'editProfile',
      icon: <User size={20} color="#4b5563" />,
      title: t('editProfile', 'Edit Profile'),
      onPress: onEditProfilePress,
    },
    {
      id: 'signOut',
      icon: <LogOut size={20} color="#4b5563" />,
      title: t('signOut', 'Sign Out'),
      onPress: onSignOutPress,
    },
    {
      id: 'deleteAccount',
      icon: <ShieldAlert size={20} color="#ef4444" />,
      title: t('deleteAccount', 'Delete Account'),
      titleColor: '#ef4444',
      onPress: onDeleteAccountPress,
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('settings', 'Settings')}</Text>
      
      <View style={styles.card}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity 
            key={option.id} 
            style={[
              styles.row, 
              index !== settingsOptions.length - 1 && styles.borderBottom
            ]}
            onPress={option.onPress}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainer}>
                {option.icon}
              </View>
              <Text style={[styles.rowTitle, option.titleColor && { color: option.titleColor }]}>
                {option.title}
              </Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});

export default SettingsSection;
