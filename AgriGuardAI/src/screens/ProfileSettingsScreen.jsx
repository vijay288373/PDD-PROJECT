import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../lib/react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../lib/AuthContext';

import ProfileHeader from '../components/profile/ProfileHeader';
import FarmStatsGrid from '../components/profile/FarmStatsGrid';
import MyCropSection from '../components/profile/MyCropSection';
import SettingsSection from '../components/profile/SettingsSection';
import EditProfileModal from '../components/profile/EditProfileModal';
import CropPickerModal from '../components/profile/CropPickerModal';
import LanguagePickerModal from '../components/profile/LanguagePickerModal';
import DeleteAccountModal from '../components/profile/DeleteAccountModal';
import OfflineBanner from '../components/OfflineBanner';

const PROFILE_KEY = 'agriguard_profile';
const SCANS_KEY = 'agriguard_scans';

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

async function fetchSupaProfile(uid) {
  if (!uid) return null;
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/FarmerProfile?uid=eq.${encodeURIComponent(uid)}&order=created_date.asc&limit=1`,
      { headers: supaHeaders() }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

async function createSupaProfile(uid, name) {
  if (!uid) return null;
  const body = {
    id: genId(),
    uid,
    full_name: name || 'Farmer',
    primary_crops: [],
    language: 'en',
    farm_size: 1,
    farm_size_unit: 'acres',
  };
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/FarmerProfile`, {
      method: 'POST',
      headers: supaHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || body;
  } catch {
    return null;
  }
}

async function updateSupaProfile(id, payload) {
  if (!id || id.startsWith('local-')) return null;
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/FarmerProfile?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: supaHeaders(),
        body: JSON.stringify({ ...payload, updated_date: new Date().toISOString() }),
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

const ProfileSettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, logout, deleteAccount } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [totalScans, setTotalScans] = useState(0);

  // Modal states
  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const [isCropPickerVisible, setCropPickerVisible] = useState(false);
  const [isLanguageVisible, setLanguageVisible] = useState(false);
  const [isDeleteAccountVisible, setDeleteAccountVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userEmail = user?.email || 'farmer@agriguard.com';

      // 1. Try to fetch live profile from Supabase Cloud
      let supaP = await fetchSupaProfile(userEmail);
      if (!supaP) {
        supaP = await createSupaProfile(userEmail, user?.full_name);
      }

      if (supaP) {
        // Map Supabase fields to Mobile UI state
        const mapped = {
          id: supaP.id,
          uid: supaP.uid,
          fullName: supaP.full_name || user?.full_name || 'Farmer',
          region: supaP.state || supaP.district || 'Tamil Nadu',
          farmSize: supaP.farm_size ? String(supaP.farm_size) : '1',
          farmUnit: supaP.farm_size_unit || 'Acres',
          farmingType: supaP.farming_type || 'Organic',
          myCrops: Array.isArray(supaP.primary_crops)
            ? supaP.primary_crops.map(c => ({ id: typeof c === 'string' ? c : c.name, name: typeof c === 'string' ? c : c.name }))
            : [],
        };
        setProfile(mapped);
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(mapped));
      } else {
        // Fallback to local storage
        const profileData = await AsyncStorage.getItem(PROFILE_KEY);
        if (profileData) {
          setProfile(JSON.parse(profileData));
        } else {
          setProfile({
            fullName: user?.full_name || 'Farmer',
            farmingType: 'Organic',
            myCrops: [],
            createdAt: new Date().toISOString(),
          });
        }
      }

      const scansData = await AsyncStorage.getItem(SCANS_KEY);
      if (scansData) {
        const scans = JSON.parse(scansData);
        setTotalScans(scans.length || 0);
      }
    } catch (error) {
      console.error('Failed to load profile data', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (updatedFields) => {
    try {
      const merged = { ...profile, ...updatedFields };
      setProfile(merged);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(merged));

      // Extract crop string names
      const cropNames = Array.isArray(merged.myCrops)
        ? merged.myCrops.map(c => (typeof c === 'string' ? c : c.name))
        : [];

      // Save to all cross-platform profile storage keys
      try {
        await AsyncStorage.setItem('agriguard_farmer_profile', JSON.stringify({ primary_crops: cropNames, full_name: merged.fullName }));
        await AsyncStorage.setItem('agriguard_my_crops', JSON.stringify(cropNames));
      } catch {}

      // Sync to Supabase
      const supaPayload = {
        full_name: merged.fullName || merged.full_name,
        state: merged.region || merged.state,
        farm_size: Number(merged.farmSize) || Number(merged.farm_size) || 1,
        farm_size_unit: (merged.farmUnit || 'acres').toLowerCase(),
        primary_crops: cropNames,
      };

      if (merged.id) {
        await updateSupaProfile(merged.id, supaPayload);
      } else {
        const newSupa = await createSupaProfile(user?.email || 'farmer@agriguard.com', merged.fullName);
        if (newSupa?.id) {
          await updateSupaProfile(newSupa.id, supaPayload);
          setProfile({ ...merged, id: newSupa.id });
        }
      }
    } catch (error) {
      console.error('Failed to save profile', error);
    }
  };

  const handleEditProfileSave = (data) => {
    saveProfile(data);
    setEditProfileVisible(false);
  };

  const handleCropsSave = (crops) => {
    saveProfile({ myCrops: crops });
    setCropPickerVisible(false);
  };

  const handleRemoveCrop = (cropName) => {
    if (profile?.myCrops) {
      const updatedCrops = profile.myCrops.filter(c => (typeof c === 'string' ? c : c.name) !== cropName);
      saveProfile({ myCrops: updatedCrops });
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  const handleDeleteAccountConfirm = async () => {
    setDeleteAccountVisible(false);
    await deleteAccount();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Emerald Green Header Background */}
        <View style={styles.headerBackground} />

        <ProfileHeader 
          profile={profile} 
          totalScans={totalScans} 
          onEditPress={() => setEditProfileVisible(true)} 
        />

        <FarmStatsGrid 
          profile={profile} 
          myCropsCount={profile?.myCrops?.length || 0} 
        />

        <MyCropSection 
          crops={profile?.myCrops || []} 
          onAddPress={() => setCropPickerVisible(true)} 
          onRemoveCrop={handleRemoveCrop} 
        />

        <SettingsSection 
          onLanguagePress={() => setLanguageVisible(true)}
          onEditProfilePress={() => setEditProfileVisible(true)}
          onDeleteAccountPress={() => setDeleteAccountVisible(true)}
          onSignOutPress={handleSignOut}
        />
      </ScrollView>

      {/* Modals */}
      <EditProfileModal 
        visible={isEditProfileVisible}
        onClose={() => setEditProfileVisible(false)}
        onSave={handleEditProfileSave}
        profile={profile}
      />

      <CropPickerModal 
        visible={isCropPickerVisible}
        onClose={() => setCropPickerVisible(false)}
        onSave={handleCropsSave}
        currentCrops={profile?.myCrops || []}
      />

      <LanguagePickerModal 
        visible={isLanguageVisible}
        onClose={() => setLanguageVisible(false)}
      />

      <DeleteAccountModal 
        visible={isDeleteAccountVisible}
        onClose={() => setDeleteAccountVisible(false)}
        onConfirm={handleDeleteAccountConfirm}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
  },
  headerBackground: {
    height: 120,
    backgroundColor: '#166534',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});

export default ProfileSettingsScreen;
