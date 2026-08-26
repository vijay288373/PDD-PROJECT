import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Search, ChevronRight } from 'lucide-react-native';
import { useLang } from '../../lib/useLang';
import { t } from '../../lib/i18n';

const CROPS = [
  { name: "Rice", emoji: "🌾", category: "Grain" },
  { name: "Wheat", emoji: "🌾", category: "Grain" },
  { name: "Maize / Corn", emoji: "🌽", category: "Grain" },
  { name: "Sorghum", emoji: "🌾", category: "Grain" },
  { name: "Millet", emoji: "🌾", category: "Grain" },
  { name: "Tomato", emoji: "🍅", category: "Vegetable" },
  { name: "Potato", emoji: "🥔", category: "Vegetable" },
  { name: "Onion", emoji: "🧅", category: "Vegetable" },
  { name: "Pepper (Bell/Chili)", emoji: "🌶️", category: "Vegetable" },
  { name: "Eggplant", emoji: "🍆", category: "Vegetable" },
  { name: "Cucumber", emoji: "🥒", category: "Vegetable" },
  { name: "Okra", emoji: "🌿", category: "Vegetable" },
  { name: "Garlic", emoji: "🧄", category: "Vegetable" },
  { name: "Carrot", emoji: "🥕", category: "Vegetable" },
  { name: "Mango", emoji: "🥭", category: "Fruit" },
  { name: "Banana / Plantain", emoji: "🍌", category: "Fruit" },
  { name: "Papaya", emoji: "🍈", category: "Fruit" },
  { name: "Citrus (Orange/Lemon)", emoji: "🍊", category: "Fruit" },
  { name: "Apple", emoji: "🍎", category: "Fruit" },
  { name: "Grapes", emoji: "🍇", category: "Fruit" },
  { name: "Watermelon", emoji: "🍉", category: "Fruit" },
  { name: "Cotton", emoji: "🌿", category: "Cash Crop" },
  { name: "Sugarcane", emoji: "🎋", category: "Cash Crop" },
  { name: "Tea", emoji: "🍵", category: "Cash Crop" },
  { name: "Coffee", emoji: "☕", category: "Cash Crop" },
  { name: "Groundnut / Peanut", emoji: "🥜", category: "Legume" },
  { name: "Soybean", emoji: "🌱", category: "Legume" },
  { name: "Cassava", emoji: "🍠", category: "Root" },
];

const CATEGORIES = ["All", "Grain", "Vegetable", "Fruit", "Cash Crop", "Legume", "Root"];

const CAT_KEYS = {
  "All": "cat_all",
  "Grain": "cat_grain",
  "Vegetable": "cat_vegetable",
  "Fruit": "cat_fruit",
  "Cash Crop": "cat_cash",
  "Legume": "cat_legume",
  "Root": "cat_root",
};

const CROP_KEYS = {
  "Rice": "crop_rice",
  "Wheat": "crop_wheat",
  "Tomato": "crop_tomato",
  "Potato": "crop_potato",
  "Onion": "crop_onion",
  "Maize / Corn": "crop_maize",
  "Sorghum": "crop_sorghum",
  "Millet": "crop_millet",
  "Cotton": "crop_cotton",
  "Sugarcane": "crop_sugarcane",
  "Pepper (Bell/Chili)": "crop_chili",
  "Banana / Plantain": "crop_banana",
  "Mango": "crop_mango",
  "Papaya": "crop_papaya",
  "Citrus (Orange/Lemon)": "crop_citrus",
  "Apple": "crop_apple",
  "Grapes": "crop_grape",
  "Watermelon": "crop_fruit",
  "Tea": "crop_tea",
  "Coffee": "crop_coffee",
  "Groundnut / Peanut": "crop_groundnut",
  "Soybean": "crop_soybean",
  "Eggplant": "crop_eggplant",
  "Cucumber": "crop_cucumber",
  "Cassava": "crop_cassava",
};

export default function CropSelector({ onCropSelected, onSelectCrop }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { langCode } = useLang();

  const handleSelect = onCropSelected || onSelectCrop || (() => {});

  const filtered = CROPS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("select_crop", langCode)}</Text>
        <Text style={styles.subtitle}>{t("select_crop_desc", langCode)}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search width={16} height={16} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search_crops", langCode)}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.categoryPill, activeCategory === cat ? styles.activeCategoryPill : styles.inactiveCategoryPill]}
            >
              <Text style={activeCategory === cat ? styles.activeCategoryText : styles.inactiveCategoryText}>
                {t(CAT_KEYS[cat] || cat, langCode)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        <View style={styles.grid}>
          {filtered.map((crop) => (
            <TouchableOpacity
              key={crop.name}
              onPress={() => handleSelect(crop.name)}
              style={styles.cropCard}
              activeOpacity={0.7}
            >
              <Text style={styles.cropEmoji}>{crop.emoji}</Text>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>{t(CROP_KEYS[crop.name] || crop.name, langCode)}</Text>
                <Text style={styles.cropCat}>{t(CAT_KEYS[crop.category] || crop.category, langCode)}</Text>
              </View>
              <ChevronRight width={16} height={16} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>{t("no_crops_found", langCode)} "{search}"</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f8f0',
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a5c2a',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#c8e6c9',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#111827',
  },
  categoriesWrapper: {
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 8,
    paddingRight: 16,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  activeCategoryPill: {
    backgroundColor: '#1a5c2a',
    borderColor: '#1a5c2a',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inactiveCategoryPill: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
  },
  activeCategoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveCategoryText: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '500',
  },
  gridContainer: {
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cropCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8f5e9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  cropEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  cropCat: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
