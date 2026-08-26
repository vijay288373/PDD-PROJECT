import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from '../../lib/react-i18next';

const EditProfileModal = ({ visible, onClose, onSave, profile }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    region: '',
    farmSize: '',
    farmUnit: 'Acres',
    farmingType: 'Organic'
  });

  useEffect(() => {
    if (visible && profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        region: profile.region || '',
        farmSize: profile.farmSize ? String(profile.farmSize) : '',
        farmUnit: profile.farmUnit || 'Acres',
        farmingType: profile.farmingType || 'Organic'
      });
    }
  }, [visible, profile]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      farmSize: formData.farmSize ? parseFloat(formData.farmSize) : null
    };
    onSave(dataToSave);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('editProfile', 'Edit Profile')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('fullName', 'Full Name')}</Text>
              <TextInput 
                style={styles.input}
                value={formData.fullName}
                onChangeText={(val) => handleChange('fullName', val)}
                placeholder={t('enterName', 'Enter your name')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('phoneNumber', 'Phone Number')}</Text>
              <TextInput 
                style={styles.input}
                value={formData.phone}
                onChangeText={(val) => handleChange('phone', val)}
                placeholder={t('enterPhone', 'Enter phone number')}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('region', 'Region / State')}</Text>
              <TextInput 
                style={styles.input}
                value={formData.region}
                onChangeText={(val) => handleChange('region', val)}
                placeholder={t('enterRegion', 'E.g. Punjab, Maharashtra')}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>{t('farmSize', 'Farm Size')}</Text>
                <TextInput 
                  style={styles.input}
                  value={formData.farmSize}
                  onChangeText={(val) => handleChange('farmSize', val)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>{t('unit', 'Unit')}</Text>
                <View style={styles.toggleGroup}>
                  {['Acres', 'Hectares'].map(unit => (
                    <TouchableOpacity 
                      key={unit}
                      style={[styles.toggleBtn, formData.farmUnit === unit && styles.toggleBtnActive]}
                      onPress={() => handleChange('farmUnit', unit)}
                    >
                      <Text style={[styles.toggleText, formData.farmUnit === unit && styles.toggleTextActive]}>
                        {t(unit.toLowerCase(), unit)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('farmingType', 'Farming Type')}</Text>
              <View style={styles.toggleGroup}>
                {['Organic', 'Conventional', 'Mixed'].map(type => (
                  <TouchableOpacity 
                    key={type}
                    style={[styles.toggleBtn, formData.farmingType === type && styles.toggleBtnActive]}
                    onPress={() => handleChange('farmingType', type)}
                  >
                    <Text style={[styles.toggleText, formData.farmingType === type && styles.toggleTextActive]}>
                      {t(type.toLowerCase(), type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{t('saveProfile', 'Save Profile')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeBtn: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#1a5c2a',
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#1a5c2a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileModal;
