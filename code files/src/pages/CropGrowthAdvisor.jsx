import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Droplets, Bug, Leaf, BookOpen, Calculator, RefreshCw, ChevronDown } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/useLang.jsx";

const CROPS = [
  // Cereals & Millets
  'Rice','Wheat','Maize','Bajra (Pearl Millet)','Jowar (Sorghum)','Ragi (Finger Millet)','Barley',
  // Pulses
  'Toor Dal (Pigeon Pea)','Moong Dal (Green Gram)','Urad Dal (Black Gram)','Chana (Chickpea)','Masoor (Red Lentil)',
  // Oilseeds
  'Groundnut','Soybean','Mustard','Sunflower','Sesame (Til)','Castor',
  // Vegetables
  'Tomato','Potato','Onion','Brinjal (Eggplant)','Cauliflower','Cabbage','Okra (Bhindi)','Bitter Gourd (Karela)','Bottle Gourd (Lauki)','Pumpkin','Green Peas','Carrot','Radish','Spinach (Palak)','Cucumber',
  // Fruits
  'Banana','Mango','Watermelon','Papaya','Guava','Pomegranate','Grapes','Coconut','Lemon / Lime',
  // Spices & Condiments
  'Chili','Turmeric','Ginger','Coriander','Cumin (Jeera)','Fenugreek (Methi)',
  // Commercial / Cash crops
  'Cotton','Sugarcane','Jute','Tea','Coffee','Tobacco','Rubber',
];
const CROP_EMOJI = {
  'Rice': '🌾', 'Wheat': '🌾', 'Maize': '🌽', 'Bajra (Pearl Millet)': '🌾', 'Jowar (Sorghum)': '🌾', 'Ragi (Finger Millet)': '🌾', 'Barley': '🌾',
  'Toor Dal (Pigeon Pea)': '🫘', 'Moong Dal (Green Gram)': '🫘', 'Urad Dal (Black Gram)': '🫘', 'Chana (Chickpea)': '🫘', 'Masoor (Red Lentil)': '🫘',
  'Groundnut': '🥜', 'Soybean': '🌿', 'Mustard': '🌻', 'Sunflower': '🌻', 'Sesame (Til)': '🌿', 'Castor': '🌿',
  'Tomato': '🍅', 'Potato': '🥔', 'Onion': '🧅', 'Brinjal (Eggplant)': '🍆', 'Cauliflower': '🥦', 'Cabbage': '🥬', 'Okra (Bhindi)': '🌿', 'Bitter Gourd (Karela)': '🥒', 'Bottle Gourd (Lauki)': '🥒', 'Pumpkin': '🎃', 'Green Peas': '🟢', 'Carrot': '🥕', 'Radish': '🌿', 'Spinach (Palak)': '🥬', 'Cucumber': '🥒',
  'Banana': '🍌', 'Mango': '🥭', 'Watermelon': '🍉', 'Papaya': '🍈', 'Guava': '🍐', 'Pomegranate': '🍎', 'Grapes': '🍇', 'Coconut': '🥥', 'Lemon / Lime': '🍋',
  'Chili': '🌶️', 'Turmeric': '🟡', 'Ginger': '🫚', 'Coriander': '🌿', 'Cumin (Jeera)': '🌿', 'Fenugreek (Methi)': '🌿',
  'Cotton': '☁️', 'Sugarcane': '🎋', 'Jute': '🌿', 'Tea': '🍵', 'Coffee': '☕', 'Tobacco': '🍂', 'Rubber': '🌳',
};

const GROWTH_STAGES = [
  { id: 'seedling', label: 'Seedling', icon: '🌱', days: '0-15 days' },
  { id: 'vegetative', label: 'Vegetative', icon: '🌿', days: '15-45 days' },
  { id: 'flowering', label: 'Flowering', icon: '🌸', days: '45-75 days' },
  { id: 'fruiting', label: 'Fruiting', icon: '🍎', days: '75-100 days' },
  { id: 'harvest', label: 'Pre-Harvest', icon: '🌾', days: '100+ days' },
];

function generateFallbackAdvisory(crop, stage, acres, tank) {
  const cLow = (crop || '').toLowerCase();

  // ── Crop-specific recommendation database ──
  const cropDB = {
    rice: {
      seedling: {
        fertilizers: [{ name: 'Zinc Sulphate 21% + DAP (18:46:0)', type: 'Basal', quantity_per_acre: '10 kg ZnSO4 + 50 kg DAP', total_quantity: `${acres * 10} kg ZnSO4 + ${acres * 50} kg DAP`, how_to_apply: 'Incorporate into puddled soil before transplanting', timing: 'At last puddling', frequency: 'Once' }],
        pesticides: [{ name: 'Chlorpyrifos 20 EC', target: 'Stem Borer, Leaf Folder', quantity_per_acre: '600 ml', total_quantity: `${acres * 600} ml`, dilution_per_tank: `${Math.round(600 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '500 liters', safety_interval: '21 days' }],
        nutrients: [{ name: 'Zinc Sulphate 21%', deficiency_symptom: 'Khaira disease — brown/rust spots on leaves', quantity_per_acre: '10 kg soil application', spray_concentration: '5 g/L foliar', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N (1st Top-dress)', type: 'Top-dress', quantity_per_acre: '35 kg', total_quantity: `${acres * 35} kg`, how_to_apply: 'Broadcast in standing water, drain after 2 days', timing: '21 days after transplanting (Active Tillering)', frequency: 'Once' }],
        pesticides: [{ name: 'Cartap Hydrochloride 50 SP', target: 'Yellow Stem Borer, Leaf Folder', quantity_per_acre: '500 g', total_quantity: `${acres * 500} g`, dilution_per_tank: `${Math.round(500 / 500 * tank)} g per ${tank}L`, spray_volume_per_acre: '500 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Ferrous Sulphate (FeSO4 · 7H₂O)', deficiency_symptom: 'Inter-veinal chlorosis on young leaves', quantity_per_acre: '5 kg soil or 0.5% foliar', spray_concentration: '5 g/L foliar', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'Muriate of Potash (MOP 60% K₂O)', type: 'Top-dress', quantity_per_acre: '20 kg', total_quantity: `${acres * 20} kg`, how_to_apply: 'Broadcast at panicle initiation', timing: 'At booting stage (55-65 DAT)', frequency: 'Once' }],
        pesticides: [{ name: 'Tricyclazole 75 WP', target: 'Rice Blast (Neck & Node)', quantity_per_acre: '120 g', total_quantity: `${acres * 120} g`, dilution_per_tank: `${Math.round(120 / 500 * tank)} g per ${tank}L`, spray_volume_per_acre: '500 liters', safety_interval: '21 days' }],
        nutrients: [{ name: 'Potassium Nitrate (13:0:45)', deficiency_symptom: 'Poor grain fill, tip browning', quantity_per_acre: '1 kg foliar', spray_concentration: '10 g/L', per_tank_dose: `${10 * tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'Urea 46% N (2nd Top-dress)', type: 'Top-dress', quantity_per_acre: '20 kg', total_quantity: `${acres * 20} kg`, how_to_apply: 'Broadcast — no water drain for 48h', timing: 'At grain filling stage', frequency: 'Once' }],
        pesticides: [{ name: 'Propiconazole 25 EC', target: 'Sheath Blight, Sheath Rot', quantity_per_acre: '250 ml', total_quantity: `${acres * 250} ml`, dilution_per_tank: `${Math.round(250 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '500 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Silicic Acid (Silicon)', deficiency_symptom: 'Lodging susceptibility, weak straw', quantity_per_acre: '2 kg soil', spray_concentration: '3 ml/L foliar', per_tank_dose: `${3 * tank} ml per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'No pesticide application', target: 'Pre-harvest safety period — observe 21 day PHI', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: '21 days minimum from last spray' }],
        nutrients: [{ name: 'No foliar spray at this stage', deficiency_symptom: 'Grain is maturing — inputs will not improve yield', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    wheat: {
      seedling: {
        fertilizers: [{ name: 'DAP (18:46:0) + Urea Mix', type: 'Basal', quantity_per_acre: '50 kg DAP + 25 kg Urea', total_quantity: `${acres * 50} kg DAP + ${acres * 25} kg Urea`, how_to_apply: 'Drill-place 5 cm deep at sowing', timing: 'At sowing', frequency: 'Once' }],
        pesticides: [{ name: 'Chlorpyrifos 20 EC (Seed/Soil treatment)', target: 'Termite, Shoot Fly', quantity_per_acre: '1 L soil drench', total_quantity: `${acres} L`, dilution_per_tank: `Soil drench`, spray_volume_per_acre: '200 L water', safety_interval: 'Soil application' }],
        nutrients: [{ name: 'Zinc Sulphate 33%', deficiency_symptom: 'Stunted seedlings, pale patches', quantity_per_acre: '5 kg', spray_concentration: '5 g/L foliar', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N (1st Top-dress at CRI)', type: 'Top-dress', quantity_per_acre: '40 kg', total_quantity: `${acres * 40} kg`, how_to_apply: 'Broadcast after first irrigation (21 DAS)', timing: 'Crown Root Initiation (21 DAS)', frequency: 'Once' }],
        pesticides: [{ name: 'Dimethoate 30 EC', target: 'Aphids on flag leaf', quantity_per_acre: '300 ml', total_quantity: `${acres * 300} ml`, dilution_per_tank: `${Math.round(300 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Manganese Sulphate (MnSO₄)', deficiency_symptom: 'Grey speck / pale interveinal patches', quantity_per_acre: '500 g foliar', spray_concentration: '2.5 g/L', per_tank_dose: `${Math.round(2.5 * tank)} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'Urea 46% N (2nd Top-dress)', type: 'Top-dress', quantity_per_acre: '25 kg', total_quantity: `${acres * 25} kg`, how_to_apply: 'Broadcast before ear emergence', timing: 'At flag-leaf / heading', frequency: 'Once' }],
        pesticides: [{ name: 'Propiconazole 25 EC', target: 'Yellow/Brown Rust, Karnal Bunt', quantity_per_acre: '200 ml', total_quantity: `${acres * 200} ml`, dilution_per_tank: `${Math.round(200 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Potassium Nitrate (13:0:45)', deficiency_symptom: 'Poor ear filling, shrivelled grains', quantity_per_acre: '1 kg foliar', spray_concentration: '10 g/L', per_tank_dose: `${10 * tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'MOP (Muriate of Potash 60% K₂O)', type: 'Top-dress', quantity_per_acre: '15 kg', total_quantity: `${acres * 15} kg`, how_to_apply: 'With last irrigation', timing: 'At milk/dough stage', frequency: 'Once' }],
        pesticides: [{ name: 'Mancozeb 75 WP', target: 'Leaf blight, Alternaria', quantity_per_acre: '500 g', total_quantity: `${acres * 500} g`, dilution_per_tank: `${Math.round(500 / 500 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '21 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Grain sterility, hollow grains', quantity_per_acre: '250 g foliar', spray_concentration: '1.5 g/L', per_tank_dose: `${Math.round(1.5 * tank)} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Stop all sprays', target: 'Pre-harvest interval — maintain 14-21 day gap', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: '14-21 days' }],
        nutrients: [{ name: 'No foliar spray', deficiency_symptom: 'Grain maturity stage — no further inputs needed', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    tomato: {
      seedling: {
        fertilizers: [{ name: 'NPK 19:19:19 (Water Soluble)', type: 'Drenching', quantity_per_acre: '5 kg in 200L water', total_quantity: `${acres * 5} kg`, how_to_apply: 'Soil drench around transplants', timing: '5-7 days after transplanting', frequency: 'Once' }],
        pesticides: [{ name: 'Imidacloprid 17.8 SL', target: 'Whitefly (Tomato Leaf Curl Virus vector)', quantity_per_acre: '150 ml', total_quantity: `${acres * 150} ml`, dilution_per_tank: `${Math.round(150 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Zinc Sulphate 21%', deficiency_symptom: 'Interveinal chlorosis, small leaves', quantity_per_acre: '500 g foliar', spray_concentration: '2 g/L', per_tank_dose: `${2 * tank} g per ${tank}L` }],
      },
      vegetative: {
        fertilizers: [{ name: 'Calcium Ammonium Nitrate (CAN 26% N)', type: 'Top-dress', quantity_per_acre: '25 kg', total_quantity: `${acres * 25} kg`, how_to_apply: 'Side dress along drip line, irrigate after', timing: '25-30 DAT', frequency: 'Once' }],
        pesticides: [{ name: 'Abamectin 1.8 EC', target: 'Red Spider Mites, Leaf Miner', quantity_per_acre: '200 ml', total_quantity: `${acres * 200} ml`, dilution_per_tank: `${Math.round(200 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '7 days' }],
        nutrients: [{ name: 'Magnesium Sulphate (MgSO₄)', deficiency_symptom: 'Yellowing between veins of older leaves', quantity_per_acre: '1 kg foliar', spray_concentration: '5 g/L', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'Mono Potassium Phosphate (0:52:34)', type: 'Foliar', quantity_per_acre: '1 kg in 200L', total_quantity: `${acres} kg`, how_to_apply: 'Foliar spray early morning', timing: 'At first flower opening', frequency: 'Fortnightly' }],
        pesticides: [{ name: 'Spinosad 45 SC', target: 'Flower Thrips, Fruit Borer (Helicoverpa)', quantity_per_acre: '75 ml', total_quantity: `${acres * 75} ml`, dilution_per_tank: `${Math.round(75 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '3 days' }],
        nutrients: [{ name: 'Boron 20% (Solubor)', deficiency_symptom: 'Flower drop, poor fruit set', quantity_per_acre: '200 g foliar', spray_concentration: '1 g/L', per_tank_dose: `${tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'Calcium Nitrate (19% Ca, 15.5% N)', type: 'Foliar', quantity_per_acre: '2.5 kg in 200L', total_quantity: `${acres * 2.5} kg`, how_to_apply: 'Foliar spray — avoid during rain', timing: '15 days after fruit set, repeat fortnightly', frequency: 'Fortnightly' }],
        pesticides: [{ name: 'Mancozeb 75 WP + Cymoxanil 8%', target: 'Early Blight, Late Blight', quantity_per_acre: '500 g', total_quantity: `${acres * 500} g`, dilution_per_tank: `${Math.round(500 / 500 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '7 days' }],
        nutrients: [{ name: 'Calcium (CaCl₂ 0.5%)', deficiency_symptom: 'Blossom End Rot — black sunken lesion at fruit base', quantity_per_acre: '1 kg foliar', spray_concentration: '5 g/L', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Stop all chemical sprays', target: 'Pre-harvest safety — observe 7-14 day PHI', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: 'Min 7 days from last spray' }],
        nutrients: [{ name: 'Potassium Schoenite (0:0:22:18S:11Mg)', deficiency_symptom: 'Poor colour development, soft fruits', quantity_per_acre: '1 kg foliar', spray_concentration: '5 g/L', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
    },
    onion: {
      seedling: {
        fertilizers: [{ name: 'DAP (18:46:0)', type: 'Basal', quantity_per_acre: '50 kg', total_quantity: `${acres * 50} kg`, how_to_apply: 'Broadcast and mix into beds before transplanting', timing: 'Before transplanting', frequency: 'Once' }],
        pesticides: [{ name: 'Fipronil 5 SC', target: 'Thrips (Tabaci)', quantity_per_acre: '400 ml', total_quantity: `${acres * 400} ml`, dilution_per_tank: `${Math.round(400 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Sulphur 80 WDG', deficiency_symptom: 'Poor pungency, pale bulb colour', quantity_per_acre: '3 kg soil', spray_concentration: 'Soil application', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N', type: 'Top-dress', quantity_per_acre: '25 kg', total_quantity: `${acres * 25} kg`, how_to_apply: 'Side dress between rows', timing: '30 DAT', frequency: 'Once' }],
        pesticides: [{ name: 'Lambda-cyhalothrin 5 EC', target: 'Thrips, Armyworm', quantity_per_acre: '200 ml', total_quantity: `${acres * 200} ml`, dilution_per_tank: `${Math.round(200 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '7 days' }],
        nutrients: [{ name: 'Calcium Ammonium Nitrate', deficiency_symptom: 'Weak neck, soft tissue', quantity_per_acre: '10 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      flowering: {
        fertilizers: [{ name: 'Sulphate of Potash (SOP 0:0:50)', type: 'Top-dress', quantity_per_acre: '20 kg', total_quantity: `${acres * 20} kg`, how_to_apply: 'Band placement near bulb zone', timing: 'At bulb initiation', frequency: 'Once' }],
        pesticides: [{ name: 'Tebuconazole 25.9 EC', target: 'Purple Blotch, Stemphylium Blight', quantity_per_acre: '300 ml', total_quantity: `${acres * 300} ml`, dilution_per_tank: `${Math.round(300 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Bulb splitting, twin bulbs', quantity_per_acre: '250 g foliar', spray_concentration: '1.5 g/L', per_tank_dose: `${Math.round(1.5 * tank)} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'MOP (60% K₂O) — stop N fertilizers', type: 'Top-dress', quantity_per_acre: '15 kg', total_quantity: `${acres * 15} kg`, how_to_apply: 'Last dose near maturity', timing: 'At bulb swelling', frequency: 'Once — last application' }],
        pesticides: [{ name: 'Mancozeb 75 WP', target: 'Downy Mildew', quantity_per_acre: '500 g', total_quantity: `${acres * 500} g`, dilution_per_tank: `${Math.round(500 / 500 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '21 days' }],
        nutrients: [{ name: 'Copper Sulphate (Bordeaux 1%)', deficiency_symptom: 'Soft rot susceptibility', quantity_per_acre: '10 g/L', spray_concentration: '10 g/L', per_tank_dose: `${10 * tank} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Stop all sprays — neck fall indicates maturity', target: 'Harvest when 50-75% tops fall', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: '14 days' }],
        nutrients: [{ name: 'No application', deficiency_symptom: 'Cure bulbs in shade for 5-7 days after harvest', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    potato: {
      seedling: {
        fertilizers: [{ name: 'NPK 12:32:16', type: 'Basal', quantity_per_acre: '60 kg', total_quantity: `${acres * 60} kg`, how_to_apply: 'Band-place in furrows below seed tubers', timing: 'At planting', frequency: 'Once' }],
        pesticides: [{ name: 'Metalaxyl 8% + Mancozeb 64% WP', target: 'Early & Late Blight, Damping off', quantity_per_acre: '500 g', total_quantity: `${acres * 500} g`, dilution_per_tank: `${Math.round(500 / 500 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Calcium Nitrate', deficiency_symptom: 'Hollow heart in tubers', quantity_per_acre: '5 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N (Top-dress at earthing up)', type: 'Top-dress', quantity_per_acre: '30 kg', total_quantity: `${acres * 30} kg`, how_to_apply: 'Apply before earthing up and irrigate', timing: '30-35 DAS', frequency: 'Once' }],
        pesticides: [{ name: 'Chlorantraniliprole 18.5 SC', target: 'Tuber Moth, Cutworm', quantity_per_acre: '60 ml', total_quantity: `${acres * 60} ml`, dilution_per_tank: `${Math.round(60 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '7 days' }],
        nutrients: [{ name: 'Magnesium Sulphate', deficiency_symptom: 'Marginal yellowing of lower leaves', quantity_per_acre: '1 kg foliar', spray_concentration: '5 g/L', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'SOP (Sulphate of Potash 0:0:50)', type: 'Top-dress', quantity_per_acre: '25 kg', total_quantity: `${acres * 25} kg`, how_to_apply: 'Side dress and irrigate', timing: 'At tuber initiation (45 DAS)', frequency: 'Once' }],
        pesticides: [{ name: 'Cymoxanil 8% + Mancozeb 64% WP', target: 'Late Blight (P. infestans)', quantity_per_acre: '600 g', total_quantity: `${acres * 600} g`, dilution_per_tank: `${Math.round(600 / 500 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '7 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Internal brown spots, cracking', quantity_per_acre: '200 g foliar', spray_concentration: '1 g/L', per_tank_dose: `${tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'Potassium Sulphate', type: 'Foliar', quantity_per_acre: '2 kg in 200L', total_quantity: `${acres * 2} kg`, how_to_apply: 'Foliar spray for tuber bulking', timing: 'Tuber bulking stage', frequency: 'Fortnightly' }],
        pesticides: [{ name: 'Propineb 70 WP', target: 'Alternaria, Phytophthora', quantity_per_acre: '500 g', total_quantity: `${acres * 500} g`, dilution_per_tank: `${Math.round(500 / 500 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Potassium Nitrate (13:0:45)', deficiency_symptom: 'Poor tuber size, low starch content', quantity_per_acre: '1 kg foliar', spray_concentration: '10 g/L', per_tank_dose: `${10 * tank} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Desiccate haulm (Paraquat) or cut tops 10 days before harvest', target: 'Skin set and maturity', quantity_per_acre: 'As per label', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: '10 days' }],
        nutrients: [{ name: 'No foliar spray', deficiency_symptom: 'Allow tuber skin to set before digging', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    cotton: {
      seedling: {
        fertilizers: [{ name: 'DAP (18:46:0)', type: 'Basal', quantity_per_acre: '50 kg', total_quantity: `${acres * 50} kg`, how_to_apply: 'Place 5 cm below seed row', timing: 'At sowing', frequency: 'Once' }],
        pesticides: [{ name: 'Imidacloprid 48 FS (Seed Treatment)', target: 'Aphids, Jassids, Early sucking pests', quantity_per_acre: '5 ml/kg seed', total_quantity: 'Coat all seeds', dilution_per_tank: 'Seed treatment', spray_volume_per_acre: 'N/A', safety_interval: 'Seed treatment' }],
        nutrients: [{ name: 'Zinc Sulphate 21%', deficiency_symptom: 'Inter-veinal chlorosis in young leaves', quantity_per_acre: '5 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N (1st Top-dress)', type: 'Top-dress', quantity_per_acre: '30 kg', total_quantity: `${acres * 30} kg`, how_to_apply: 'Ring placement around plant base', timing: '30-40 DAS (Square formation)', frequency: 'Once' }],
        pesticides: [{ name: 'Flonicamid 50 WG', target: 'Aphids, Whitefly, Jassids', quantity_per_acre: '60 g', total_quantity: `${acres * 60} g`, dilution_per_tank: `${Math.round(60 / 500 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Ferrous Sulphate', deficiency_symptom: 'Pale/yellow new leaves', quantity_per_acre: '1 kg foliar', spray_concentration: '5 g/L', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'MOP (Muriate of Potash 60%)', type: 'Top-dress', quantity_per_acre: '25 kg', total_quantity: `${acres * 25} kg`, how_to_apply: 'Side dress and irrigate', timing: 'At squaring / flowering', frequency: 'Once' }],
        pesticides: [{ name: 'Spinosad 45 SC', target: 'Pink Bollworm, American Bollworm', quantity_per_acre: '150 ml', total_quantity: `${acres * 150} ml`, dilution_per_tank: `${Math.round(150 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '7 days' }],
        nutrients: [{ name: 'Boron 20% (Solubor)', deficiency_symptom: 'Square / boll shedding', quantity_per_acre: '250 g foliar', spray_concentration: '1.5 g/L', per_tank_dose: `${Math.round(1.5 * tank)} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'SOP (Sulphate of Potash 0:0:50)', type: 'Foliar', quantity_per_acre: '1 kg in 200L', total_quantity: `${acres} kg`, how_to_apply: 'Foliar spray morning hours', timing: 'During boll development', frequency: 'Fortnightly' }],
        pesticides: [{ name: 'Profenofos 50 EC', target: 'Spotted Bollworm, Tobacco Caterpillar', quantity_per_acre: '600 ml', total_quantity: `${acres * 600} ml`, dilution_per_tank: `${Math.round(600 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Magnesium Sulphate', deficiency_symptom: 'Red leaf, premature boll opening', quantity_per_acre: '2 kg foliar', spray_concentration: '10 g/L', per_tank_dose: `${10 * tank} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Apply Ethephon (defoliant) if needed', target: 'Mechanical harvest preparation', quantity_per_acre: 'As per label', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: '7-14 days' }],
        nutrients: [{ name: 'No application', deficiency_symptom: 'Pick fully open bolls — avoid wet weather picking', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    sugarcane: {
      seedling: {
        fertilizers: [{ name: 'DAP (18:46:0) + SSP', type: 'Basal', quantity_per_acre: '50 kg DAP + 100 kg SSP', total_quantity: `${acres * 50} kg DAP + ${acres * 100} kg SSP`, how_to_apply: 'Apply in furrows before planting setts', timing: 'At planting', frequency: 'Once' }],
        pesticides: [{ name: 'Carbofuran 3G', target: 'Early Shoot Borer, Termite', quantity_per_acre: '10 kg granules in furrows', total_quantity: `${acres * 10} kg`, dilution_per_tank: 'Granule application', spray_volume_per_acre: 'N/A', safety_interval: '60 days' }],
        nutrients: [{ name: 'Zinc Sulphate 21%', deficiency_symptom: 'White stripe on young leaves in ratoon', quantity_per_acre: '25 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N + Ammonium Sulphate', type: 'Top-dress', quantity_per_acre: '60 kg Urea + 40 kg AS', total_quantity: `${acres * 60} kg Urea + ${acres * 40} kg AS`, how_to_apply: 'Band-place along rows and earth up', timing: '45-60 days (Grand Growth)', frequency: 'Split into 2 doses' }],
        pesticides: [{ name: 'Chlorpyrifos 20 EC', target: 'Early Shoot Borer', quantity_per_acre: '1.5 L in 500L water', total_quantity: `${acres * 1.5} L`, dilution_per_tank: `${Math.round(1500 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '500 liters', safety_interval: '30 days' }],
        nutrients: [{ name: 'Ferrous Sulphate', deficiency_symptom: 'Yellowing of young leaves in alkaline soils', quantity_per_acre: '5 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      flowering: {
        fertilizers: [{ name: 'MOP (Muriate of Potash 60%)', type: 'Top-dress', quantity_per_acre: '40 kg', total_quantity: `${acres * 40} kg`, how_to_apply: 'Earth up after application', timing: '90-120 days', frequency: 'Once' }],
        pesticides: [{ name: 'Trichogramma chilonis (Bio-agent)', target: 'Internode Borer', quantity_per_acre: '50,000 parasitoids (5 cards)', total_quantity: `${acres * 5} cards`, dilution_per_tank: 'Release in field', spray_volume_per_acre: 'N/A', safety_interval: 'No PHI' }],
        nutrients: [{ name: 'Silicon (Diatomaceous Earth)', deficiency_symptom: 'Lodging, weak stalks', quantity_per_acre: '50 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      fruiting: {
        fertilizers: [{ name: 'No nitrogen after 150 days', type: 'None', quantity_per_acre: 'N/A', total_quantity: 'N/A', how_to_apply: 'Excess N reduces sucrose %', timing: 'N/A', frequency: 'N/A' }],
        pesticides: [{ name: 'Neem Oil 3000 ppm', target: 'Scale Insect, Mealybug', quantity_per_acre: '1 L', total_quantity: `${acres} L`, dilution_per_tank: `${Math.round(1000 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '500 liters', safety_interval: '3 days' }],
        nutrients: [{ name: 'Potassium Schoenite', deficiency_symptom: 'Poor juice quality (low Pol %)', quantity_per_acre: '25 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'No sprays — harvest at peak Brix (18-20%)', target: 'Test with refractometer before cutting', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: 'N/A' }],
        nutrients: [{ name: 'Post-harvest: Apply FYM 5 tonnes/acre for ratoon', deficiency_symptom: 'Ratoon crop benefits from organic matter', quantity_per_acre: '5 tonnes', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
    },
    groundnut: {
      seedling: {
        fertilizers: [{ name: 'Gypsum (CaSO₄) + SSP', type: 'Basal', quantity_per_acre: '200 kg Gypsum + 125 kg SSP', total_quantity: `${acres * 200} kg Gypsum + ${acres * 125} kg SSP`, how_to_apply: 'Broadcast and incorporate before sowing', timing: 'At sowing', frequency: 'Once' }],
        pesticides: [{ name: 'Chlorpyrifos 20 EC (Soil Drench)', target: 'White Grub, Termite', quantity_per_acre: '2.5 L in 500L water', total_quantity: `${acres * 2.5} L`, dilution_per_tank: 'Soil drench', spray_volume_per_acre: '500 liters', safety_interval: '30 days' }],
        nutrients: [{ name: 'Calcium (Gypsum)', deficiency_symptom: 'Empty pods, unfilled kernels', quantity_per_acre: '200 kg', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N (light dose)', type: 'Top-dress', quantity_per_acre: '10 kg only', total_quantity: `${acres * 10} kg`, how_to_apply: 'Side dress — excess N delays pegging', timing: '25 DAS', frequency: 'Once only' }],
        pesticides: [{ name: 'Quinalphos 25 EC', target: 'Leaf Miner, Tobacco Caterpillar', quantity_per_acre: '400 ml', total_quantity: `${acres * 400} ml`, dilution_per_tank: `${Math.round(400 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Iron Sulphate (FeSO₄)', deficiency_symptom: 'Lime-induced chlorosis in calcareous soils', quantity_per_acre: '5 kg soil + 1% foliar', spray_concentration: '10 g/L', per_tank_dose: `${10 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'Gypsum 2nd dose', type: 'Top-dress', quantity_per_acre: '100 kg', total_quantity: `${acres * 100} kg`, how_to_apply: 'Broadcast at pegging zone — do NOT earth up', timing: 'At peg penetration (45 DAS)', frequency: 'Once' }],
        pesticides: [{ name: 'Mancozeb 75 WP', target: 'Tikka Leaf Spot (Cercospora)', quantity_per_acre: '500 g', total_quantity: `${acres * 500} g`, dilution_per_tank: `${Math.round(500 / 500 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '21 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Poor peg formation, hollow heart', quantity_per_acre: '200 g foliar', spray_concentration: '1 g/L', per_tank_dose: `${tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'No fertilizer — focus on irrigation', type: 'None', quantity_per_acre: 'N/A', total_quantity: 'N/A', how_to_apply: 'Ensure consistent moisture for pod fill', timing: 'N/A', frequency: 'N/A' }],
        pesticides: [{ name: 'Hexaconazole 5 EC', target: 'Rust, Late Leaf Spot', quantity_per_acre: '400 ml', total_quantity: `${acres * 400} ml`, dilution_per_tank: `${Math.round(400 / 500 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Molybdenum (Sodium Molybdate)', deficiency_symptom: 'Poor nitrogen fixation, pale leaves', quantity_per_acre: '50 g foliar', spray_concentration: '0.5 g/L', per_tank_dose: `${Math.round(0.5 * tank)} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'No sprays — check maturity by hull scrape test', target: 'Harvest when 75% pods show dark inner hull', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: 'N/A' }],
        nutrients: [{ name: 'Post-harvest: Sun dry pods to 8% moisture', deficiency_symptom: 'Aflatoxin risk if moisture exceeds 9%', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    maize: {
      seedling: {
        fertilizers: [{ name: 'DAP (18:46:0)', type: 'Basal', quantity_per_acre: '50 kg', total_quantity: `${acres * 50} kg`, how_to_apply: 'Place 5 cm below and beside seed', timing: 'At sowing', frequency: 'Once' }],
        pesticides: [{ name: 'Chlorantraniliprole 18.5 SC', target: 'Fall Armyworm (Whorl stage)', quantity_per_acre: '60 ml', total_quantity: `${acres * 60} ml`, dilution_per_tank: `${Math.round(60 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Zinc Sulphate 21%', deficiency_symptom: 'White stripe / banding on young leaves', quantity_per_acre: '10 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N (1st Top-dress at knee-high)', type: 'Top-dress', quantity_per_acre: '35 kg', total_quantity: `${acres * 35} kg`, how_to_apply: 'Side-band 10 cm from plant row', timing: 'V6 stage (knee-high, ~25 DAS)', frequency: 'Once' }],
        pesticides: [{ name: 'Emamectin Benzoate 5 SG', target: 'Fall Armyworm, Stem Borer', quantity_per_acre: '80 g', total_quantity: `${acres * 80} g`, dilution_per_tank: `${Math.round(80 / 200 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '7 days' }],
        nutrients: [{ name: 'Ferrous Sulphate (FeSO₄)', deficiency_symptom: 'Interveinal yellowing on young leaves', quantity_per_acre: '5 kg soil', spray_concentration: '5 g/L foliar', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'Urea 46% N (2nd Top-dress at tasseling)', type: 'Top-dress', quantity_per_acre: '25 kg', total_quantity: `${acres * 25} kg`, how_to_apply: 'Broadcast between rows', timing: 'At tasseling (VT stage)', frequency: 'Once' }],
        pesticides: [{ name: 'Lambda-cyhalothrin 5 EC', target: 'Ear Worm (Helicoverpa)', quantity_per_acre: '400 ml', total_quantity: `${acres * 400} ml`, dilution_per_tank: `${Math.round(400 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Poor silk emergence, barren ears', quantity_per_acre: '250 g foliar', spray_concentration: '1.5 g/L', per_tank_dose: `${Math.round(1.5 * tank)} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'SOP (0:0:50)', type: 'Foliar', quantity_per_acre: '1 kg in 200L', total_quantity: `${acres} kg`, how_to_apply: 'Foliar spray for grain fill', timing: 'At grain filling (R2-R3)', frequency: 'Once' }],
        pesticides: [{ name: 'Neem Oil 10,000 ppm', target: 'Storage pest prevention', quantity_per_acre: '500 ml', total_quantity: `${acres * 500} ml`, dilution_per_tank: `${Math.round(500 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '3 days' }],
        nutrients: [{ name: 'Potassium Nitrate (13:0:45)', deficiency_symptom: 'Poor grain fill, chaffy ears', quantity_per_acre: '1 kg foliar', spray_concentration: '10 g/L', per_tank_dose: `${10 * tank} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Harvest at 20-25% grain moisture — dry to 12%', target: 'Avoid aflatoxin', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: 'N/A' }],
        nutrients: [{ name: 'No application', deficiency_symptom: 'Grain maturity — black layer visible at kernel base', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    chili: {
      seedling: {
        fertilizers: [{ name: 'NPK 19:19:19 (Starter)', type: 'Drenching', quantity_per_acre: '5 kg', total_quantity: `${acres * 5} kg`, how_to_apply: 'Soil drench at transplanting', timing: '7 days after transplanting', frequency: 'Once' }],
        pesticides: [{ name: 'Imidacloprid 17.8 SL', target: 'Thrips, Aphids (Leaf Curl vector)', quantity_per_acre: '100 ml', total_quantity: `${acres * 100} ml`, dilution_per_tank: `${Math.round(100 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Calcium Nitrate', deficiency_symptom: 'Weak stems, poor establishment', quantity_per_acre: '5 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N', type: 'Top-dress', quantity_per_acre: '20 kg', total_quantity: `${acres * 20} kg`, how_to_apply: 'Ring placement around plant', timing: '30 DAT', frequency: 'Once' }],
        pesticides: [{ name: 'Fipronil 5 SC', target: 'Thrips (Scirtothrips dorsalis)', quantity_per_acre: '400 ml', total_quantity: `${acres * 400} ml`, dilution_per_tank: `${Math.round(400 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Magnesium Sulphate', deficiency_symptom: 'Yellowing of older leaves', quantity_per_acre: '1 kg foliar', spray_concentration: '5 g/L', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'Mono Potassium Phosphate (0:52:34)', type: 'Foliar', quantity_per_acre: '1 kg', total_quantity: `${acres} kg`, how_to_apply: 'Foliar spray early morning', timing: 'At peak flowering', frequency: 'Fortnightly' }],
        pesticides: [{ name: 'Spinosad 45 SC', target: 'Fruit Borer (Helicoverpa), Thrips', quantity_per_acre: '75 ml', total_quantity: `${acres * 75} ml`, dilution_per_tank: `${Math.round(75 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '3 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Flower drop, poor fruit set', quantity_per_acre: '200 g foliar', spray_concentration: '1 g/L', per_tank_dose: `${tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'SOP (Sulphate of Potash 0:0:50)', type: 'Foliar', quantity_per_acre: '1 kg', total_quantity: `${acres} kg`, how_to_apply: 'Foliar spray for colour and pungency', timing: 'During fruit development', frequency: 'Fortnightly' }],
        pesticides: [{ name: 'Chlorfenapyr 10 SC', target: 'Fruit Borer, Mites', quantity_per_acre: '200 ml', total_quantity: `${acres * 200} ml`, dilution_per_tank: `${Math.round(200 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '7 days' }],
        nutrients: [{ name: 'Calcium Chloride (CaCl₂)', deficiency_symptom: 'Fruit cracking, soft rot', quantity_per_acre: '500 g foliar', spray_concentration: '3 g/L', per_tank_dose: `${3 * tank} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Stop sprays 7 days before picking', target: 'PHI for food safety', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: '7 days' }],
        nutrients: [{ name: 'No application', deficiency_symptom: 'Harvest when fruits are fully red/mature', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    banana: {
      seedling: {
        fertilizers: [{ name: 'FYM (10 kg/pit) + SSP', type: 'Pit application', quantity_per_acre: '200 g SSP per pit', total_quantity: `${acres * 700} pits`, how_to_apply: 'Mix FYM + SSP in planting pit', timing: 'At planting suckers', frequency: 'Once' }],
        pesticides: [{ name: 'Carbofuran 3G', target: 'Rhizome Weevil, Nematodes', quantity_per_acre: '20 g per pit', total_quantity: `${acres * 700 * 20} g`, dilution_per_tank: 'Pit application', spray_volume_per_acre: 'N/A', safety_interval: '60 days' }],
        nutrients: [{ name: 'Zinc Sulphate 21%', deficiency_symptom: 'Narrow leaves, stunted bunches', quantity_per_acre: '10 g per pit', spray_concentration: 'Pit application', per_tank_dose: 'Pit' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N (1st dose)', type: 'Top-dress', quantity_per_acre: '65 g/plant (split monthly)', total_quantity: `${Math.round(acres * 700 * 65 / 1000)} kg`, how_to_apply: 'Ring application 30 cm from pseudostem', timing: '2nd month onwards — monthly', frequency: 'Monthly (3 splits)' }],
        pesticides: [{ name: 'Chlorpyrifos 20 EC', target: 'Pseudostem Borer', quantity_per_acre: '25 ml/plant stem injection', total_quantity: `${acres * 700 * 25} ml`, dilution_per_tank: 'Stem injection', spray_volume_per_acre: 'N/A', safety_interval: '30 days' }],
        nutrients: [{ name: 'Magnesium Sulphate', deficiency_symptom: 'Blue leaf — Mg deficiency (Poovan variety)', quantity_per_acre: '50 g/plant soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      flowering: {
        fertilizers: [{ name: 'MOP (60% K₂O)', type: 'Top-dress', quantity_per_acre: '100 g/plant', total_quantity: `${Math.round(acres * 700 * 100 / 1000)} kg`, how_to_apply: 'Ring application before bunch emergence', timing: 'At shooting (flower emergence)', frequency: 'Once' }],
        pesticides: [{ name: 'Carbendazim 50 WP', target: 'Sigatoka Leaf Spot', quantity_per_acre: '200 g in 200L', total_quantity: `${acres * 200} g`, dilution_per_tank: `${Math.round(200 / 200 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Sulphate of Potash (SOP)', deficiency_symptom: 'Small fingers, poor bunch weight', quantity_per_acre: '75 g/plant soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      fruiting: {
        fertilizers: [{ name: 'Banana Special (13:0:45) foliar', type: 'Foliar', quantity_per_acre: '5 g/L spray', total_quantity: `${5 * tank} g per ${tank}L`, how_to_apply: 'Spray on bunch and leaves', timing: 'During finger filling', frequency: 'Fortnightly' }],
        pesticides: [{ name: 'Neem Oil 3000 ppm', target: 'Scarring Beetle, Thrips on bunch', quantity_per_acre: '500 ml', total_quantity: `${acres * 500} ml`, dilution_per_tank: `${Math.round(500 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '3 days' }],
        nutrients: [{ name: 'Calcium Ammonium Nitrate', deficiency_symptom: 'Finger splitting, poor shelf life', quantity_per_acre: '50 g/plant', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'No sprays — harvest at 75% maturity (light green)', target: 'Check angularity of fingers for ripeness', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: 'N/A' }],
        nutrients: [{ name: 'Post-harvest: Remove pseudostem, keep 1 sucker for ratoon', deficiency_symptom: 'Ratoon management', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    soybean: {
      seedling: {
        fertilizers: [{ name: 'DAP (18:46:0) + Rhizobium seed treatment', type: 'Basal + Bio', quantity_per_acre: '40 kg DAP + 200g Rhizobium/10kg seed', total_quantity: `${acres * 40} kg DAP`, how_to_apply: 'DAP band-placed; Rhizobium coated on seed', timing: 'At sowing', frequency: 'Once' }],
        pesticides: [{ name: 'Thiamethoxam 30 FS (Seed Treatment)', target: 'White Fly, Stem Fly', quantity_per_acre: '10 ml/kg seed', total_quantity: 'Coat all seeds', dilution_per_tank: 'Seed treatment', spray_volume_per_acre: 'N/A', safety_interval: 'Seed treatment' }],
        nutrients: [{ name: 'Sulphur 90% WDG', deficiency_symptom: 'Yellowing of young trifoliates', quantity_per_acre: '5 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'No N top-dress needed (N-fixing crop)', type: 'None', quantity_per_acre: 'N/A — Rhizobium fixes N', total_quantity: 'N/A', how_to_apply: 'Ensure good Rhizobium nodulation', timing: 'N/A', frequency: 'N/A' }],
        pesticides: [{ name: 'Quinalphos 25 EC', target: 'Stem Fly, Girdle Beetle', quantity_per_acre: '400 ml', total_quantity: `${acres * 400} ml`, dilution_per_tank: `${Math.round(400 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Ferrous Sulphate', deficiency_symptom: 'Interveinal chlorosis (alkaline soils)', quantity_per_acre: '5 kg soil', spray_concentration: '5 g/L foliar', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'DAP 2% foliar spray', type: 'Foliar', quantity_per_acre: '4 kg in 200L', total_quantity: `${acres * 4} kg`, how_to_apply: 'Foliar spray at R1 flowering', timing: 'At 50% flowering', frequency: 'Once' }],
        pesticides: [{ name: 'Trifloxystrobin 25% + Tebuconazole 50%', target: 'Rust (Phakopsora), Anthracnose', quantity_per_acre: '200 g', total_quantity: `${acres * 200} g`, dilution_per_tank: `${Math.round(200 / 200 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Flower abortion, poor pod set', quantity_per_acre: '200 g foliar', spray_concentration: '1 g/L', per_tank_dose: `${tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'KNO₃ (13:0:45) foliar', type: 'Foliar', quantity_per_acre: '1 kg in 200L', total_quantity: `${acres} kg`, how_to_apply: 'Foliar spray for seed filling', timing: 'At pod fill (R5)', frequency: 'Once' }],
        pesticides: [{ name: 'Chlorpyrifos 20 EC', target: 'Pod Borer (Maruca)', quantity_per_acre: '500 ml', total_quantity: `${acres * 500} ml`, dilution_per_tank: `${Math.round(500 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Molybdenum (Na₂MoO₄)', deficiency_symptom: 'Poor N-fixation, yellow leaves', quantity_per_acre: '50 g foliar', spray_concentration: '0.5 g/L', per_tank_dose: `${Math.round(0.5 * tank)} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Harvest at R8 — 95% pods brown, 14% seed moisture', target: 'Delay causes shattering losses', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: 'N/A' }],
        nutrients: [{ name: 'No application', deficiency_symptom: 'Thresh within 7 days of harvest', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    mustard: {
      seedling: {
        fertilizers: [{ name: 'SSP (16% P₂O₅) + Sulphur', type: 'Basal', quantity_per_acre: '100 kg SSP + 10 kg Sulphur', total_quantity: `${acres * 100} kg SSP + ${acres * 10} kg S`, how_to_apply: 'Broadcast and incorporate before sowing', timing: 'At sowing', frequency: 'Once' }],
        pesticides: [{ name: 'Imidacloprid 70 WS (Seed Treatment)', target: 'Mustard Aphid, Flea Beetle', quantity_per_acre: '5 g/kg seed', total_quantity: 'Coat all seeds', dilution_per_tank: 'Seed treatment', spray_volume_per_acre: 'N/A', safety_interval: 'Seed treatment' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Hollow stem, poor root development', quantity_per_acre: '200 g soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N', type: 'Top-dress', quantity_per_acre: '25 kg', total_quantity: `${acres * 25} kg`, how_to_apply: 'Broadcast after 1st irrigation', timing: '25-30 DAS', frequency: 'Once' }],
        pesticides: [{ name: 'Dimethoate 30 EC', target: 'Mustard Aphid (Lipaphis erysimi)', quantity_per_acre: '300 ml', total_quantity: `${acres * 300} ml`, dilution_per_tank: `${Math.round(300 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Sulphur 80 WDG', deficiency_symptom: 'Poor oil content, pale leaves', quantity_per_acre: '2 kg foliar', spray_concentration: '3 g/L', per_tank_dose: `${3 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'MOP (60% K₂O)', type: 'Top-dress', quantity_per_acre: '15 kg', total_quantity: `${acres * 15} kg`, how_to_apply: 'Side dress before flowering', timing: 'At bud stage', frequency: 'Once' }],
        pesticides: [{ name: 'Thiamethoxam 25 WG', target: 'Painted Bug, Aphid', quantity_per_acre: '40 g', total_quantity: `${acres * 40} g`, dilution_per_tank: `${Math.round(40 / 200 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Flower drop, poor siliqua formation', quantity_per_acre: '200 g foliar', spray_concentration: '1 g/L', per_tank_dose: `${tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'No fertilizer at this stage', type: 'None', quantity_per_acre: 'N/A', total_quantity: 'N/A', how_to_apply: 'Ensure good moisture for seed fill', timing: 'N/A', frequency: 'N/A' }],
        pesticides: [{ name: 'Mancozeb 75 WP', target: 'White Rust, Alternaria Blight', quantity_per_acre: '500 g', total_quantity: `${acres * 500} g`, dilution_per_tank: `${Math.round(500 / 200 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '21 days' }],
        nutrients: [{ name: 'Potassium Sulphate', deficiency_symptom: 'Low oil content in seeds', quantity_per_acre: '1 kg foliar', spray_concentration: '5 g/L', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Harvest when 75% siliquae turn golden-brown', target: 'Delay causes shattering', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: 'N/A' }],
        nutrients: [{ name: 'Dry to 8% moisture before storage', deficiency_symptom: 'High moisture causes rancidity', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    brinjal: {
      seedling: {
        fertilizers: [{ name: 'NPK 19:19:19', type: 'Drenching', quantity_per_acre: '5 kg', total_quantity: `${acres * 5} kg`, how_to_apply: 'Soil drench at transplanting', timing: '7 DAT', frequency: 'Once' }],
        pesticides: [{ name: 'Imidacloprid 17.8 SL', target: 'Whitefly, Jassids', quantity_per_acre: '100 ml', total_quantity: `${acres * 100} ml`, dilution_per_tank: `${Math.round(100 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Calcium Nitrate', deficiency_symptom: 'Weak stems, poor root growth', quantity_per_acre: '5 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N', type: 'Top-dress', quantity_per_acre: '25 kg', total_quantity: `${acres * 25} kg`, how_to_apply: 'Ring placement around plant', timing: '30 DAT', frequency: 'Once' }],
        pesticides: [{ name: 'Neem Oil 10,000 ppm', target: 'Aphids, Whitefly', quantity_per_acre: '500 ml', total_quantity: `${acres * 500} ml`, dilution_per_tank: `${Math.round(500 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '3 days' }],
        nutrients: [{ name: 'Magnesium Sulphate', deficiency_symptom: 'Interveinal yellowing on older leaves', quantity_per_acre: '1 kg foliar', spray_concentration: '5 g/L', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'MOP (60% K₂O)', type: 'Top-dress', quantity_per_acre: '20 kg', total_quantity: `${acres * 20} kg`, how_to_apply: 'Side dress near root zone', timing: 'At first flowering', frequency: 'Once' }],
        pesticides: [{ name: 'Spinosad 45 SC', target: 'Brinjal Shoot & Fruit Borer (Leucinodes)', quantity_per_acre: '75 ml', total_quantity: `${acres * 75} ml`, dilution_per_tank: `${Math.round(75 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '3 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Flower drop, misshapen fruits', quantity_per_acre: '200 g foliar', spray_concentration: '1 g/L', per_tank_dose: `${tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'Calcium Nitrate', type: 'Foliar', quantity_per_acre: '2 kg in 200L', total_quantity: `${acres * 2} kg`, how_to_apply: 'Foliar spray for fruit quality', timing: 'During fruit development', frequency: 'Fortnightly' }],
        pesticides: [{ name: 'Emamectin Benzoate 5 SG', target: 'Fruit & Shoot Borer', quantity_per_acre: '80 g', total_quantity: `${acres * 80} g`, dilution_per_tank: `${Math.round(80 / 200 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '7 days' }],
        nutrients: [{ name: 'Calcium Chloride', deficiency_symptom: 'Fruit cracking, soft rot', quantity_per_acre: '500 g foliar', spray_concentration: '3 g/L', per_tank_dose: `${3 * tank} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Stop sprays 3-7 days before harvest', target: 'Harvest glossy, firm fruits', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: '3-7 days' }],
        nutrients: [{ name: 'No application', deficiency_symptom: 'Pick every 3-4 days for continuous fruiting', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    turmeric: {
      seedling: {
        fertilizers: [{ name: 'FYM (5 tonnes) + Neem Cake 200 kg', type: 'Basal', quantity_per_acre: '5000 kg FYM + 200 kg Neem Cake', total_quantity: `${acres * 5000} kg FYM`, how_to_apply: 'Incorporate into beds before planting rhizomes', timing: 'Before planting', frequency: 'Once' }],
        pesticides: [{ name: 'Trichoderma viride (Rhizome Treatment)', target: 'Rhizome Rot (Pythium)', quantity_per_acre: '10 g/kg rhizome', total_quantity: 'Coat all seed rhizomes', dilution_per_tank: 'Rhizome dip', spray_volume_per_acre: 'N/A', safety_interval: 'Bio-agent' }],
        nutrients: [{ name: 'Zinc Sulphate 21%', deficiency_symptom: 'Stunted growth, pale leaves', quantity_per_acre: '5 kg soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N (1st Top-dress)', type: 'Top-dress', quantity_per_acre: '30 kg', total_quantity: `${acres * 30} kg`, how_to_apply: 'Apply at first earthing up', timing: '45 days after planting', frequency: 'Once' }],
        pesticides: [{ name: 'Mancozeb 75 WP', target: 'Leaf Spot, Leaf Blotch', quantity_per_acre: '500 g', total_quantity: `${acres * 500} g`, dilution_per_tank: `${Math.round(500 / 200 * tank)} g per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '21 days' }],
        nutrients: [{ name: 'Ferrous Sulphate', deficiency_symptom: 'Chlorosis in new leaves', quantity_per_acre: '5 kg soil', spray_concentration: '5 g/L foliar', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'MOP (60% K₂O) + Urea 2nd dose', type: 'Top-dress', quantity_per_acre: '25 kg MOP + 20 kg Urea', total_quantity: `${acres * 25} kg MOP + ${acres * 20} kg Urea`, how_to_apply: 'Apply at 2nd earthing up', timing: '90-120 days', frequency: 'Once' }],
        pesticides: [{ name: 'Dimethoate 30 EC', target: 'Shoot Borer, Rhizome Scale', quantity_per_acre: '300 ml', total_quantity: `${acres * 300} ml`, dilution_per_tank: `${Math.round(300 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '200 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Poor rhizome development', quantity_per_acre: '200 g foliar', spray_concentration: '1 g/L', per_tank_dose: `${tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'No fertilizer — rhizome maturation phase', type: 'None', quantity_per_acre: 'N/A', total_quantity: 'N/A', how_to_apply: 'Reduce irrigation gradually', timing: 'N/A', frequency: 'N/A' }],
        pesticides: [{ name: 'Neem Cake 100 kg/acre (Soil application)', target: 'Nematodes, Rhizome Fly', quantity_per_acre: '100 kg', total_quantity: `${acres * 100} kg`, dilution_per_tank: 'Soil application', spray_volume_per_acre: 'N/A', safety_interval: 'Organic' }],
        nutrients: [{ name: 'Potassium Sulphate', deficiency_symptom: 'Poor curcumin content, pale rhizomes', quantity_per_acre: '1 kg foliar', spray_concentration: '5 g/L', per_tank_dose: `${5 * tank} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Harvest at 7-9 months when leaves dry and turn yellow', target: 'Check rhizome maturity by scratching', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: 'N/A' }],
        nutrients: [{ name: 'Post-harvest: Boil + dry to 5-7% moisture', deficiency_symptom: 'Curing is essential for curcumin content', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
    mango: {
      seedling: {
        fertilizers: [{ name: 'FYM (50 kg/tree) + SSP', type: 'Basin application', quantity_per_acre: '50 kg FYM + 1 kg SSP per tree', total_quantity: `Per tree basis (40 trees/acre)`, how_to_apply: 'Mix in tree basin before monsoon', timing: 'June (pre-monsoon)', frequency: 'Annually' }],
        pesticides: [{ name: 'Copper Oxychloride 50 WP', target: 'Anthracnose, Die-back', quantity_per_acre: '500 g in 200L', total_quantity: `${acres * 500} g`, dilution_per_tank: `${Math.round(500 / 200 * tank)} g per ${tank}L`, spray_volume_per_acre: '500-1000 liters (tree spray)', safety_interval: '21 days' }],
        nutrients: [{ name: 'Zinc Sulphate 21% + Borax', deficiency_symptom: 'Little leaf, malformation', quantity_per_acre: '100 g/tree soil', spray_concentration: 'Soil', per_tank_dose: 'Soil' }],
      },
      vegetative: {
        fertilizers: [{ name: 'Urea 46% N (post-monsoon)', type: 'Top-dress', quantity_per_acre: '500 g/tree (bearing age)', total_quantity: `${acres * 40 * 500 / 1000} kg`, how_to_apply: 'Basin application after monsoon rain', timing: 'September-October', frequency: 'Annually' }],
        pesticides: [{ name: 'Lambda-cyhalothrin 5 EC', target: 'Mango Hopper (Idioscopus)', quantity_per_acre: '500 ml', total_quantity: `${acres * 500} ml`, dilution_per_tank: `${Math.round(500 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '500-1000 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Micronutrient Mix (Zn+B+Fe)', deficiency_symptom: 'General micronutrient deficiency', quantity_per_acre: '2 g/L foliar', spray_concentration: '2 g/L', per_tank_dose: `${2 * tank} g per ${tank}L` }],
      },
      flowering: {
        fertilizers: [{ name: 'KNO₃ (13:0:45) — flowering inducer', type: 'Foliar', quantity_per_acre: '2 kg in 200L', total_quantity: `${acres * 2} kg`, how_to_apply: 'Foliar spray on canopy at bud break', timing: 'At panicle emergence (Dec-Jan)', frequency: 'Once' }],
        pesticides: [{ name: 'Imidacloprid 17.8 SL', target: 'Mango Hopper, Thrips on flowers', quantity_per_acre: '200 ml', total_quantity: `${acres * 200} ml`, dilution_per_tank: `${Math.round(200 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '500-1000 liters', safety_interval: '14 days' }],
        nutrients: [{ name: 'Boron 20%', deficiency_symptom: 'Internal necrosis, poor fruit set', quantity_per_acre: '200 g foliar', spray_concentration: '1 g/L', per_tank_dose: `${tank} g per ${tank}L` }],
      },
      fruiting: {
        fertilizers: [{ name: 'SOP (0:0:50)', type: 'Foliar', quantity_per_acre: '1 kg in 200L', total_quantity: `${acres} kg`, how_to_apply: 'Spray on developing fruits and canopy', timing: 'During fruit development (Mar-Apr)', frequency: 'Fortnightly' }],
        pesticides: [{ name: 'Chlorantraniliprole 18.5 SC', target: 'Fruit Fly (Bactrocera)', quantity_per_acre: '60 ml', total_quantity: `${acres * 60} ml`, dilution_per_tank: `${Math.round(60 / 200 * tank)} ml per ${tank}L`, spray_volume_per_acre: '500 liters', safety_interval: '7 days' }],
        nutrients: [{ name: 'Calcium Chloride', deficiency_symptom: 'Spongy tissue, jelly seed', quantity_per_acre: '2 kg in 200L', spray_concentration: '10 g/L', per_tank_dose: `${10 * tank} g per ${tank}L` }],
      },
      harvest: {
        fertilizers: [],
        pesticides: [{ name: 'Stop sprays 14 days before harvest — use methyl eugenol traps for fruit fly', target: 'Hot water treatment 52°C for 5 min post-harvest', quantity_per_acre: 'N/A', total_quantity: 'N/A', dilution_per_tank: 'N/A', spray_volume_per_acre: 'N/A', safety_interval: '14 days' }],
        nutrients: [{ name: 'Post-harvest: Prune dead wood, apply Bordeaux paste', deficiency_symptom: 'Prevents die-back and stem borer entry', quantity_per_acre: 'N/A', spray_concentration: 'N/A', per_tank_dose: 'N/A' }],
      },
    },
  };

  // ── Alias map: map crop names to the closest cropDB key ──
  const cropAliasMap = {
    // Millets → maize (similar cereal agronomy)
    'bajra': 'maize', 'pearl millet': 'maize', 'jowar': 'maize', 'sorghum': 'maize',
    'ragi': 'maize', 'finger millet': 'maize', 'barley': 'wheat',
    // Pulses → soybean (similar legume agronomy)
    'toor': 'soybean', 'pigeon pea': 'soybean', 'moong': 'soybean', 'green gram': 'soybean',
    'urad': 'soybean', 'black gram': 'soybean', 'chana': 'soybean', 'chickpea': 'soybean',
    'masoor': 'soybean', 'lentil': 'soybean',
    // Oilseeds
    'sunflower': 'mustard', 'sesame': 'mustard', 'til': 'mustard', 'castor': 'mustard',
    // Vegetables → brinjal (solanaceous) or onion (alliums)
    'cauliflower': 'brinjal', 'cabbage': 'brinjal', 'okra': 'brinjal', 'bhindi': 'brinjal',
    'bitter gourd': 'brinjal', 'karela': 'brinjal', 'bottle gourd': 'brinjal', 'lauki': 'brinjal',
    'pumpkin': 'brinjal', 'cucumber': 'brinjal', 'green peas': 'soybean',
    'carrot': 'onion', 'radish': 'onion', 'spinach': 'onion', 'palak': 'onion',
    // Fruits
    'watermelon': 'tomato', 'papaya': 'banana', 'guava': 'mango', 'pomegranate': 'mango',
    'grapes': 'mango', 'coconut': 'banana', 'lemon': 'mango', 'lime': 'mango',
    // Spices
    'ginger': 'turmeric', 'coriander': 'mustard', 'cumin': 'mustard', 'jeera': 'mustard',
    'fenugreek': 'mustard', 'methi': 'mustard',
    // Commercial
    'jute': 'cotton', 'tea': 'mango', 'coffee': 'mango', 'tobacco': 'chili', 'rubber': 'mango',
  };

  // Match crop to DB key: first direct match, then alias match
  let matchKey = Object.keys(cropDB).find(k => cLow.includes(k));
  if (!matchKey) {
    const aliasKey = Object.keys(cropAliasMap).find(a => cLow.includes(a));
    if (aliasKey) matchKey = cropAliasMap[aliasKey];
  }
  const db = matchKey ? cropDB[matchKey] : null;
  const stageData = db ? (db[stage] || db.vegetative) : (genericDB[stage] || genericDB.vegetative);

  // Crop-specific irrigation
  const irrigationDB = {
    rice: { frequency: 'Maintain 2-5 cm standing water', method: 'Flooding / AWD (Alternate Wetting & Drying)', stage_notes: `At ${stage} stage — keep paddy flooded; drain before harvest.` },
    wheat: { frequency: 'Every 15-20 days (6 critical irrigations)', method: 'Border strip / Sprinkler', stage_notes: `At ${stage} stage — CRI and flowering are the most critical irrigation stages.` },
    tomato: { frequency: 'Every 3-5 days', method: 'Drip irrigation (2 L/hr emitters at 60 cm)', stage_notes: `At ${stage} — consistent moisture prevents BER and cracking.` },
    onion: { frequency: 'Every 7-10 days (light & frequent)', method: 'Drip or micro-sprinkler', stage_notes: `At ${stage} — stop irrigation 10 days before harvest for curing.` },
    potato: { frequency: 'Every 7-10 days', method: 'Furrow or drip', stage_notes: `At ${stage} — avoid water stress during tuber bulking.` },
    cotton: { frequency: 'Every 10-15 days', method: 'Furrow or drip', stage_notes: `At ${stage} — critical periods are squaring and boll formation.` },
    sugarcane: { frequency: 'Every 7-10 days in summer, 15-20 in winter', method: 'Furrow — 5 cm depth', stage_notes: `At ${stage} — grand growth phase needs maximum water.` },
    groundnut: { frequency: 'Every 10-12 days', method: 'Sprinkler or check basin', stage_notes: `At ${stage} — moisture critical during pegging and pod fill.` },
    maize: { frequency: 'Every 7-10 days', method: 'Furrow or sprinkler', stage_notes: `At ${stage} — tasseling and silking are most water-sensitive stages.` },
    chili: { frequency: 'Every 5-7 days', method: 'Drip irrigation preferred', stage_notes: `At ${stage} — water stress causes flower drop; excess causes root rot.` },
    banana: { frequency: 'Every 3-4 days (summer), weekly (winter)', method: 'Drip (8 L/day/plant) or basin', stage_notes: `At ${stage} — banana needs 1800-2000 mm water over crop cycle.` },
    soybean: { frequency: 'Rain-fed; irrigate at flowering/pod fill if dry', method: 'Sprinkler or furrow', stage_notes: `At ${stage} — critical moisture needed at R1 flowering and R5 seed fill.` },
    mustard: { frequency: 'Every 20-25 days (2-3 irrigations total)', method: 'Flood or sprinkler', stage_notes: `At ${stage} — first irrigation at 30 DAS is most critical.` },
    brinjal: { frequency: 'Every 4-5 days', method: 'Drip or furrow', stage_notes: `At ${stage} — consistent moisture for continuous fruiting.` },
    turmeric: { frequency: 'Every 7-10 days', method: 'Drip or ridges and furrows', stage_notes: `At ${stage} — reduce irrigation 1 month before harvest.` },
    mango: { frequency: 'Every 10-15 days (winter); weekly (summer)', method: 'Basin or drip (mature trees)', stage_notes: `At ${stage} — withhold irrigation 2 months before flowering to induce stress.` },
  };
  const irrigation = irrigationDB[matchKey] || { frequency: 'Every 5-7 days', method: 'Drip irrigation preferred', stage_notes: `At ${stage} stage, maintain consistent soil moisture for ${crop}.` };

  return {
    ...stageData,
    irrigation,
    key_warnings: [
      'Always wear gloves, mask, and full-sleeve clothing when handling pesticides',
      'Do not spray during peak sunlight (10am-4pm) or windy conditions',
      `Observe the Pre-Harvest Interval (PHI) for ${crop} before selling produce`
    ],
    upcoming_tasks: [
      `Scout ${crop} field weekly for pest and disease signs`,
      'Record all spray dates and quantities in your farm diary',
      'Check soil moisture before next irrigation'
    ]
  };
}

export default function CropGrowthAdvisor() {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedStage, setSelectedStage] = useState(null);
  const [fieldSize, setFieldSize] = useState('2');
  const [tankCapacity, setTankCapacity] = useState('15');
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('fertilizer');

  useEffect(() => {
    const fs = localStorage.getItem('agriguard_field_size');
    if (fs) setFieldSize(fs);
    const crops = JSON.parse(localStorage.getItem('agriguard_my_crops') || '[]');
    if (crops.length > 0) setSelectedCrop(crops[0]);
  }, []);

  const fetchAdvisory = async () => {
    if (!selectedCrop || !selectedStage) return;
    setLoading(true);
    setAdvisory(null);
    const acres = parseFloat(fieldSize) || 1;
    const tank = parseFloat(tankCapacity) || 15;

    // Always use our detailed crop-specific advisory database
    // This provides unique recommendations per crop × stage combination
    setTimeout(() => {
      setAdvisory(generateFallbackAdvisory(selectedCrop, selectedStage.id, acres, tank));
      setLoading(false);
    }, 600); // Brief loading animation for better UX
  };

  useEffect(() => { if (advisory) setLoading(false); }, [advisory]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#166534]">
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header */}
        <div className="px-4 pt-12 pb-6">
          <h1 className="text-2xl font-bold text-white">🌱 Crop Growth Advisor</h1>
          <p className="text-emerald-300 text-sm mt-1">Stage-wise fertilizer, pesticide & nutrition guide</p>
        </div>

        {/* Setup */}
        <div className="bg-white mx-4 rounded-2xl p-4 mb-4 shadow-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Crop</label>
          <select
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">-- Select a crop --</option>
            {CROPS.map(c => <option key={c} value={c}>{CROP_EMOJI[c] || '🌿'} {c}</option>)}
          </select>

          <label className="block text-sm font-semibold text-gray-700 mt-4 mb-2">Growth Stage</label>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full">
            {GROWTH_STAGES.map(stage => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className={`flex-1 flex-shrink-0 flex flex-col items-center p-3 rounded-xl border-2 transition-all min-w-[90px] ${
                  selectedStage?.id === stage.id
                    ? 'border-emerald-500 bg-emerald-600 text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-xl mb-1">{stage.icon}</span>
                <span className="text-xs font-semibold text-center">{stage.label}</span>
                <span className="text-xs opacity-70">{stage.days}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Field Size (acres)</label>
              <input type="number" value={fieldSize} onChange={e => { setFieldSize(e.target.value); localStorage.setItem('agriguard_field_size', e.target.value); }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="2.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tank Capacity (L)</label>
              <input type="number" value={tankCapacity} onChange={e => setTankCapacity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="15" />
            </div>
          </div>

          <button
            onClick={fetchAdvisory}
            disabled={!selectedCrop || !selectedStage || loading}
            className="w-full mt-4 py-3 bg-emerald-600 disabled:bg-emerald-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><BookOpen className="w-4 h-4" /><span>Get Growth Advisory</span></>}
          </button>
        </div>

        {/* Results */}
        {advisory && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-4">
            <h2 className="text-white font-bold text-lg mb-1">{CROP_EMOJI[selectedCrop] || '🌿'} {selectedCrop} – {selectedStage?.label}</h2>
            <p className="text-emerald-300 text-xs mb-4">Field: {fieldSize} acres · Tank: {tankCapacity}L</p>

            {/* Tabs */}
            <div className="flex bg-white/10 rounded-xl p-1 mb-4">
              {[{id: 'fertilizer', label: '🌿 Fertilizer'}, {id: 'pesticide', label: '🐛 Pesticide'}, {id: 'nutrient', label: '💧 Nutrition'}].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id ? 'bg-white text-emerald-700 shadow' : 'text-white/70'
                  }`}>{tab.label}</button>
              ))}
            </div>

            {/* Fertilizer */}
            {activeTab === 'fertilizer' && (advisory.fertilizers || []).map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 mb-3 border-l-4 border-green-500 shadow">
                <div className="flex items-start gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-800 text-sm">{f.name}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                    f.type === 'Basal' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{f.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Per Acre</p><p className="text-sm font-bold text-gray-800">{f.quantity_per_acre}</p></div>
                  <div className="bg-green-50 rounded-lg p-2"><p className="text-xs text-gray-500">Your Total ({fieldSize} ac)</p><p className="text-sm font-bold text-green-700">{f.total_quantity}</p></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">📋 {f.how_to_apply}</p>
                <p className="text-xs text-gray-400 mt-1">⏰ {f.timing} · {f.frequency}</p>
              </div>
            ))}

            {/* Pesticide */}
            {activeTab === 'pesticide' && (advisory.pesticides || []).map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 mb-3 border-l-4 border-red-500 shadow">
                <div className="flex items-start gap-2 mb-2">
                  <Bug className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-800 text-sm">{p.name}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">🎯 Target: {p.target}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Per Acre</p><p className="text-sm font-bold">{p.quantity_per_acre}</p></div>
                  <div className="bg-blue-50 rounded-lg p-2"><p className="text-xs text-gray-500">📦 {tankCapacity}L Tank</p><p className="text-sm font-bold text-blue-700">{p.dilution_per_tank}</p></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">⏳ Pre-Harvest: {p.safety_interval}</p>
              </div>
            ))}

            {/* Nutrients */}
            {activeTab === 'nutrient' && (advisory.nutrients || []).map((n, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 mb-3 border-l-4 border-blue-500 shadow">
                <div className="flex items-start gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-800 text-sm">{n.name}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">🔍 Sign: {n.deficiency_symptom}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Per Acre</p><p className="text-sm font-bold">{n.quantity_per_acre}</p></div>
                  <div className="bg-blue-50 rounded-lg p-2"><p className="text-xs text-gray-500">📦 Per {tankCapacity}L</p><p className="text-sm font-bold text-blue-700">{n.per_tank_dose}</p></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Spray: {n.spray_concentration} per liter water</p>
              </div>
            ))}

            {/* Irrigation */}
            {advisory.irrigation && (
              <div className="bg-sky-100 rounded-2xl p-4 mb-3 border-l-4 border-sky-500">
                <h4 className="font-bold text-sky-800 mb-2">💧 Irrigation at This Stage</h4>
                <p className="text-sm text-sky-700">Frequency: {advisory.irrigation.frequency}</p>
                <p className="text-sm text-sky-700">Method: {advisory.irrigation.method}</p>
                <p className="text-xs text-sky-600 mt-2 italic">{advisory.irrigation.stage_notes}</p>
              </div>
            )}

            {/* Warnings */}
            {(advisory.key_warnings || []).length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-4 mb-3 border-l-4 border-amber-400">
                <h4 className="font-bold text-amber-800 mb-2">⚠️ Key Warnings</h4>
                {advisory.key_warnings.map((w, i) => <p key={i} className="text-sm text-amber-700">• {w}</p>)}
              </div>
            )}

            {/* Tasks */}
            {(advisory.upcoming_tasks || []).length > 0 && (
              <div className="bg-green-50 rounded-2xl p-4 mb-6 border-l-4 border-green-400">
                <h4 className="font-bold text-green-800 mb-2">📅 Upcoming Tasks</h4>
                {advisory.upcoming_tasks.map((t, i) => <p key={i} className="text-sm text-green-700">✓ {t}</p>)}
              </div>
            )}
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
