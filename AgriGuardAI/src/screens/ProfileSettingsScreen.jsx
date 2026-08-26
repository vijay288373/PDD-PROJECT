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

const ProfileSettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

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
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profileData = await AsyncStorage.getItem(PROFILE_KEY);
      const scansData = await AsyncStorage.getItem(SCANS_KEY);

      if (profileData) {
        setProfile(JSON.parse(profileData));
      } else {
        // Set default profile if none exists
        setProfile({
          fullName: 'New Farmer',
          farmingType: 'Organic',
          myCrops: [],
          createdAt: new Date().toISOString()
        });
      }

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

  const saveProfile = async (updatedProfile) => {
    try {
      const newProfile = { ...profile, ...updatedProfile };
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
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
      const updatedCrops = profile.myCrops.filter(c => c.name !== cropName);
      saveProfile({ myCrops: updatedCrops });
    }
  };

  const { user, logout, deleteAccount } = useAuth();

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
        <ActivityIndicator size="large" color="#1a5c2a" />
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
    backgroundColor: '#f5f8f0', // App background color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f8f0',
  },
  headerBackground: {
    height: 120,
    backgroundColor: '#1a5c2a', // primary
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});

export default ProfileSettingsScreen;
