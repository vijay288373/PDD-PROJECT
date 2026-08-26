import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useTranslation } from '../../lib/react-i18next';

// Expanded hardcoded crop list for demo
const AVAILABLE_CROPS = [
  { name: 'Wheat', emoji: '🌾' },
  { name: 'Rice', emoji: '🍚' },
  { name: 'Corn', emoji: '🌽' },
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Potato', emoji: '🥔' },
  { name: 'Cotton', emoji: '👕' },
  { name: 'Sugarcane', emoji: '🎋' },
  { name: 'Apple', emoji: '🍎' },
  { name: 'Banana', emoji: '🍌' },
  { name: 'Soybean', emoji: '🌱' },
];

const CropPickerModal = ({ visible, onClose, onSave, currentCrops = [] }) => {
  const { t } = useTranslation();
  const [selectedCrops, setSelectedCrops] = useState([]);

  useEffect(() => {
    if (visible) {
      setSelectedCrops(currentCrops.map(c => c.name));
    }
  }, [visible, currentCrops]);

  const toggleCrop = (cropName) => {
    setSelectedCrops(prev => {
      if (prev.includes(cropName)) {
        return prev.filter(c => c !== cropName);
      } else {
        if (prev.length >= 5) return prev; // Max 5 crops
        return [...prev, cropName];
      }
    });
  };

  const handleSave = () => {
    const updatedCrops = AVAILABLE_CROPS.filter(c => selectedCrops.includes(c.name));
    onSave(updatedCrops);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('selectCrops', 'Select Your Crops')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {t('maxCropsText', 'Select up to 5 crops that you primarily grow.')} ({selectedCrops.length}/5)
          </Text>

          <ScrollView style={styles.scrollView}>
            <View style={styles.grid}>
              {AVAILABLE_CROPS.map((crop, index) => {
                const isSelected = selectedCrops.includes(crop.name);
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.cropCard, isSelected && styles.cropCardSelected]}
                    onPress={() => toggleCrop(crop.name)}
                    disabled={!isSelected && selectedCrops.length >= 5}
                  >
                    <Text style={styles.emoji}>{crop.emoji}</Text>
                    <Text style={[styles.cropName, isSelected && styles.cropNameSelected]}>
                      {t(`crops.${crop.name.toLowerCase()}`, crop.name)}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Check size={16} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>{t('save', 'Save Changes')}</Text>
          </TouchableOpacity>
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
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 20,
  },
  scrollView: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cropCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cropCardSelected: {
    backgroundColor: '#e6f0e9',
    borderColor: '#4ade80',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
  },
  cropNameSelected: {
    color: '#1a5c2a',
    fontWeight: 'bold',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#1a5c2a',
    borderRadius: 12,
    padding: 2,
  },
  saveBtn: {
    backgroundColor: '#1a5c2a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CropPickerModal;
