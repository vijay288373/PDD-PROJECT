import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';

const AVAILABLE_CROPS = [
  { name: 'Rice', emoji: '🌾' },
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Potato', emoji: '🥔' },
  { name: 'Wheat', emoji: '🌾' },
  { name: 'Onion', emoji: '🧅' },
  { name: 'Cotton', emoji: '🌿' },
  { name: 'Corn', emoji: '🌽' },
  { name: 'Sugarcane', emoji: '🎋' },
  { name: 'Turmeric', emoji: '💛' },
  { name: 'Pepper', emoji: '🫑' },
  { name: 'Banana', emoji: '🍌' },
  { name: 'Mango', emoji: '🥭' },
  { name: 'Groundnut', emoji: '🥜' },
  { name: 'Coconut', emoji: '🥥' },
  { name: 'Coffee', emoji: '☕' },
  { name: 'Tea', emoji: '🍃' },
  { name: 'Soybean', emoji: '🌱' },
  { name: 'Apple', emoji: '🍎' },
  { name: 'Chickpea', emoji: '🫘' },
  { name: 'Millet', emoji: '🌾' },
];

const CropPickerModal = ({ visible, onClose, onSave, currentCrops = [] }) => {
  const [selectedCrops, setSelectedCrops] = useState([]);

  useEffect(() => {
    if (visible) {
      const existingNames = (currentCrops || []).map(c => {
        if (typeof c === 'string') return c;
        if (c && typeof c === 'object') return c.name || c.id || c.crop || '';
        return '';
      }).filter(Boolean);
      setSelectedCrops(existingNames);
    }
  }, [visible, currentCrops]);

  const toggleCrop = (cropName) => {
    setSelectedCrops(prev => {
      if (prev.includes(cropName)) {
        return prev.filter(c => c !== cropName);
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, cropName];
      }
    });
  };

  const handleSave = () => {
    const updatedCrops = selectedCrops.map(name => {
      const match = AVAILABLE_CROPS.find(c => c.name.toLowerCase() === name.toLowerCase());
      return match || { name, emoji: '🌱' };
    });
    onSave(updatedCrops);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Your Crops</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Select up to 5 crops that you primarily grow ({selectedCrops.length}/5)
          </Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {AVAILABLE_CROPS.map((crop, index) => {
                const isSelected = selectedCrops.some(
                  cName => cName.toLowerCase() === crop.name.toLowerCase()
                );
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.cropCard, isSelected && styles.cropCardSelected]}
                    onPress={() => toggleCrop(crop.name)}
                    disabled={!isSelected && selectedCrops.length >= 5}
                  >
                    <Text style={styles.emoji}>{crop.emoji}</Text>
                    <Text style={[styles.cropName, isSelected && styles.cropNameSelected]}>
                      {crop.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Check size={14} color="#ffffff" />
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
            <Text style={styles.saveBtnText}>Save Changes</Text>
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
    maxHeight: '82%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    fontSize: 13,
    marginBottom: 16,
  },
  scrollView: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cropCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#f3f4f6',
    position: 'relative',
  },
  cropCardSelected: {
    backgroundColor: '#e6f0e9',
    borderColor: '#4ade80',
  },
  emoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  cropName: {
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: 10,
    padding: 2,
  },
  saveBtn: {
    backgroundColor: '#1a5c2a',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CropPickerModal;
