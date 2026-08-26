import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { useTranslation } from '../../lib/react-i18next';

const MyCropSection = ({ crops = [], onAddPress, onRemoveCrop }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('myCropsTitle', 'My Primary Crops')}</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {crops.map((crop, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipEmoji}>{crop.emoji || '🌱'}</Text>
            <Text style={styles.chipText}>{crop.name}</Text>
            <TouchableOpacity onPress={() => onRemoveCrop(crop.name)} style={styles.removeButton}>
              <X size={14} color="#6b7280" />
            </TouchableOpacity>
          </View>
        ))}
        
        {crops.length < 5 && (
          <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
            <Plus size={16} color="#1a5c2a" />
            <Text style={styles.addText}>{t('addCrop', 'Add Crop')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 16,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginRight: 8,
  },
  removeButton: {
    padding: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0e9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ade80',
    borderStyle: 'dashed',
  },
  addText: {
    color: '#1a5c2a',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default MyCropSection;
