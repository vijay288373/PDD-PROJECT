import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Bell, X, Check } from "lucide-react-native";
import { useAuth } from "../../lib/AuthContext";

const SUPA_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ptnlnpcycionjciuodep.supabase.co';
const SUPA_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_DTMpMtKdF346pVGIQ8XMjw_FAeBcaIz';

function supaHeaders() {
  return {
    apikey: SUPA_KEY,
    Authorization: `Bearer ${SUPA_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function createSupaPriceAlert(alertObj) {
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/PriceAlert`, {
      method: 'POST',
      headers: supaHeaders(),
      body: JSON.stringify(alertObj),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || alertObj;
  } catch {
    return null;
  }
}

export default function SetAlertModal({ crop, currentPrice, unit, region, onClose, visible }) {
  const { user } = useAuth();
  const [targetPrice, setTargetPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!targetPrice || isNaN(Number(targetPrice))) return;
    setSaving(true);
    try {
      const userEmail = user?.email || 'farmer@agriguard.com';
      await createSupaPriceAlert({
        id: genId(),
        uid: userEmail,
        crop_name: crop,
        target_price: Number(targetPrice),
        condition: 'above',
        is_active: true,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setTargetPrice("");
        onClose();
      }, 1200);
    } catch {
      // Ignore
    }
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.overlayBg}>
          <TouchableOpacity style={styles.closeArea} onPress={onClose} />
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Bell color="#1a5c2a" size={20} />
                <Text style={styles.title}>Set Price Alert</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color="#6b7280" size={16} />
              </TouchableOpacity>
            </View>

            <View style={styles.cropInfo}>
              <Text style={styles.cropLabel}>Crop</Text>
              <Text style={styles.cropName}>{crop}</Text>
              {currentPrice && (
                <Text style={styles.currentPriceText}>
                  Current price: <Text style={styles.currentPriceHighlight}>₹{currentPrice?.toLocaleString("en-IN")} / {unit || "quintal"}</Text>
                </Text>
              )}
            </View>

            <Text style={styles.inputLabel}>Alert me when price reaches or exceeds:</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2500"
                keyboardType="numeric"
                value={targetPrice}
                onChangeText={setTargetPrice}
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.unitSuffix}>/ {unit || "quintal"}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                saved ? styles.savedButton : (!targetPrice ? styles.disabledButton : null)
              ]}
              onPress={handleSave}
              disabled={saving || saved || !targetPrice}
            >
              {saved ? (
                <>
                  <Check color="#fff" size={20} style={styles.btnIcon} />
                  <Text style={styles.saveButtonText}>Alert Saved!</Text>
                </>
              ) : saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Bell color="#fff" size={16} style={styles.btnIcon} />
                  <Text style={styles.saveButtonText}>Set Alert</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  closeArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a5c2a",
  },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cropInfo: {
    backgroundColor: "#f0faf2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cropLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  cropName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  currentPriceText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  currentPriceHighlight: {
    fontWeight: "600",
    color: "#1a5c2a",
  },
  inputLabel: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9ca3af",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  unitSuffix: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 8,
  },
  saveButton: {
    height: 48,
    backgroundColor: "#1a5c2a",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  savedButton: {
    backgroundColor: "#22c55e",
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  btnIcon: {
    marginRight: 8,
  },
});
