import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit2 } from 'lucide-react-native';
import { useTranslation } from '../../lib/react-i18next';

const ProfileHeader = ({ profile, totalScans = 0, onEditPress }) => {
  const { t } = useTranslation();
  
  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '??';

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{profile?.fullName || t('unknownFarmer', 'Unknown Farmer')}</Text>
        <Text style={styles.farmingType}>{profile?.farmingType || t('farmingType', 'Farming Type')}</Text>
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {totalScans} {t('totalScans', 'Scans')}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <Edit2 size={20} color="#1a5c2a" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1a5c2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  farmingType: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#e6f0e9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#1a5c2a',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#f5f8f0',
    borderRadius: 20,
  },
});

export default ProfileHeader;
