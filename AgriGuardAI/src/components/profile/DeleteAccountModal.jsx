import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import { useTranslation } from '../../lib/react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const DeleteAccountModal = ({ visible, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleDelete = async () => {
    try {
      await AsyncStorage.clear();
      onConfirm();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={32} color="#ef4444" />
            </View>
            
            <Text style={styles.title}>{t('deleteAccountTitle', 'Delete Account?')}</Text>
            
            <Text style={styles.message}>
              {t('deleteAccountWarning', 'Are you sure you want to delete your account? This action cannot be undone and all your data, scans, and settings will be permanently lost.')}
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>{t('cancel', 'Cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>{t('deleteAccount', 'Delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'flex-end',
    padding: 16,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
});

export default DeleteAccountModal;
