import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image as RNImage } from 'react-native';
import { Camera, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Camera as CameraIcon, Image as ImageIcon, ArrowLeft, Zap, ZapOff, RotateCcw, Upload } from 'lucide-react-native';
import { useLang } from '../../lib/useLang';
import { t } from '../../lib/i18n';

const CROP_KEYS = {
  "Rice": "crop_rice",
  "Wheat": "crop_wheat",
  "Tomato": "crop_tomato",
  "Potato": "crop_potato",
  "Onion": "crop_onion",
  "Maize / Corn": "crop_maize",
  "Cotton": "crop_cotton",
  "Sugarcane": "crop_sugarcane",
  "Pepper (Bell/Chili)": "crop_chili",
  "Banana / Plantain": "crop_banana"
};

export default function CameraCapture({ selectedCrop, onImageCaptured, onBack }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const { langCode } = useLang();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const toggleFlash = () => setFlash(current => (current === 'off' ? 'on' : 'off'));
  const toggleFacing = () => setFacing(current => (current === 'back' ? 'front' : 'back'));

  const processAndUpload = async (uri) => {
    setUploading(true);
    setPreviewImg(uri);
    try {
      // Compress image for faster upload to Gemini Vision API
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      const finalUri = manipResult.uri;

      // Convert to base64 data URI so Gemini Vision can analyze the image
      const base64 = await FileSystem.readAsStringAsync(finalUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const dataUri = `data:image/jpeg;base64,${base64}`;

      onImageCaptured({ uri: dataUri, localPreview: finalUri });
    } catch (e) {
      console.warn("Upload failed", e);
      // Fallback: pass the local URI directly; invokeGemini can read it via FileSystem
      onImageCaptured({ uri: uri, localPreview: uri });
    } finally {
      setUploading(false);
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      await processAndUpload(photo.uri);
    } catch (e) {
      console.warn("Capture failed", e);
    } finally {
      setCapturing(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await processAndUpload(result.assets[0].uri);
    }
  };

  if (!permission) {
    return (
      <View style={styles.errorContainer}>
        <TouchableOpacity style={styles.errorBackBtn} onPress={onBack}>
          <ArrowLeft width={20} height={20} color="#fff" />
        </TouchableOpacity>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.errorContainer}>
        <TouchableOpacity style={styles.errorBackBtn} onPress={onBack}>
          <ArrowLeft width={20} height={20} color="#fff" />
        </TouchableOpacity>
        <CameraIcon width={64} height={64} color="#6b7280" />
        <Text style={styles.errorText}>{t("camera_unavailable", langCode)}</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Text style={styles.uploadBtnText}>{t("upload_gallery", langCode)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          enableTorch={flash === 'on'}
        >
          {/* Overlay */}
          <View style={styles.overlay}>
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
                <ArrowLeft width={20} height={20} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.topBadge}>
                <Text style={styles.badgeText}>
                  📸 {t("scanning_label", langCode)}: <Text style={styles.badgeCrop}>{t(CROP_KEYS[selectedCrop] || selectedCrop, langCode)}</Text>
                </Text>
              </View>

              <View style={styles.rightControls}>
                <TouchableOpacity style={styles.iconBtn} onPress={toggleFlash}>
                  {flash === 'on' ? <Zap width={20} height={20} color="#facc15" /> : <ZapOff width={20} height={20} color="#fff" />}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} onPress={toggleFacing}>
                  <RotateCcw width={20} height={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.reticleContainer}>
              <View style={styles.reticle}>
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />
              </View>
            </View>

            <Text style={styles.hintText}>{t("center_affected_part", langCode)}</Text>
          </View>
        </CameraView>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.galleryBtn} onPress={pickImage}>
          <ImageIcon width={24} height={24} color="#fff" />
        </TouchableOpacity>

        {uploading ? (
          <View style={styles.captureBtnLoading}>
            <ActivityIndicator size="large" color="#4ade80" />
          </View>
        ) : (
          <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto} disabled={capturing}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        )}

        <View style={{ width: 56 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 24,
  },
  uploadBtn: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  uploadBtnText: {
    color: '#1a5c2a',
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightControls: {
    flexDirection: 'row',
  },
  topBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'absolute',
    left: 0,
    right: 0,
    alignSelf: 'center',
    alignItems: 'center',
    top: 0,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  badgeCrop: {
    color: '#4ade80',
  },
  reticleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticle: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 24,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#4ade80',
  },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  hintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 32,
  },
  bottomControls: {
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  galleryBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ade80',
  },
  captureBtnLoading: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBackBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
