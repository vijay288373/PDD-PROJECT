import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image, ArrowLeft, Zap, ZapOff, RotateCcw, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const { langCode } = useLang();

  const startCamera = useCallback(async () => {
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setCameraError(false);
    } catch {
      setCameraError(true);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [facingMode]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      await uploadBlob(blob, "camera_capture.jpg");
      setCapturing(false);
    }, "image/jpeg", 0.75);
  };

  const uploadBlob = async (blob, filename) => {
    setUploading(true);
    // Show local preview
    const localUrl = URL.createObjectURL(blob);
    setPreviewImg(localUrl);

    const file = new File([blob], filename, { type: "image/jpeg" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    if (stream) stream.getTracks().forEach(t => t.stop());
    onImageCaptured({ url: file_url, localPreview: localUrl });
    setUploading(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPreviewImg(localUrl);

    // Compress if > 500KB
    let uploadFile = file;
    if (file.size > 500 * 1024) {
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.src = localUrl;
      await new Promise(r => img.onload = r);
      const ratio = Math.min(1, Math.sqrt((500 * 1024) / file.size));
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.8));
      uploadFile = new File([blob], file.name, { type: "image/jpeg" });
    }

    if (stream) stream.getTracks().forEach(t => t.stop());
    const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadFile });
    onImageCaptured({ url: file_url, localPreview: localUrl });
    setUploading(false);
  };

  return (
    <div className="relative h-[calc(100vh-64px)] bg-black flex flex-col">
      {/* Camera frame */}
      <div className="relative flex-1 overflow-hidden">
        {!cameraError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
            <Camera className="w-16 h-16 text-gray-500" />
            <p className="text-gray-400 text-sm">{t("camera_unavailable", langCode)}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#4ade80] text-[#1a5c2a] px-6 py-3 rounded-full font-semibold"
            >
              {t("upload_gallery", langCode)}
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Crop frame overlay */}
        {!cameraError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 border-2 border-white/30 rounded-3xl" />
              {/* Corner accents */}
              {[["top-0 left-0", "border-t-4 border-l-4 rounded-tl-2xl"],
                ["top-0 right-0", "border-t-4 border-r-4 rounded-tr-2xl"],
                ["bottom-0 left-0", "border-b-4 border-l-4 rounded-bl-2xl"],
                ["bottom-0 right-0", "border-b-4 border-r-4 rounded-br-2xl"]
              ].map(([pos, cls]) => (
                <div key={pos} className={`absolute w-8 h-8 border-[#4ade80] ${pos} ${cls}`} />
              ))}
              <motion.div
                className="absolute left-2 right-2 h-0.5 bg-[#4ade80]/60 rounded-full"
                animate={{ top: ["10%", "85%", "10%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        {/* Crop badge */}
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-white text-sm font-medium">📸 {t("scanning_label", langCode)}: <span className="text-[#4ade80]">{t(CROP_KEYS[selectedCrop] || selectedCrop, langCode)}</span></p>
          </div>
        </div>

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            id="btn-camera-back"
            onClick={onBack}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button
              id="btn-camera-flash"
              onClick={() => setFlashOn(f => !f)}
              className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              {flashOn ? <Zap className="w-5 h-5 text-yellow-400" /> : <ZapOff className="w-5 h-5 text-white" />}
            </button>
            <button
              id="btn-camera-switch"
              onClick={() => setFacingMode(f => f === "environment" ? "user" : "environment")}
              className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Hint text */}
        <div className="absolute bottom-32 left-0 right-0 flex justify-center">
          <p className="text-white/70 text-xs">{t("center_affected_part", langCode)}</p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="bg-black px-8 py-6 flex items-center justify-between">
        <button
          id="btn-camera-gallery"
          onClick={() => fileInputRef.current?.click()}
          className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700"
        >
          <Image className="w-6 h-6 text-white" />
        </button>

        <AnimatePresence>
          {uploading ? (
            <div className="w-20 h-20 rounded-full border-4 border-[#4ade80] flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#4ade80] animate-pulse" />
            </div>
          ) : (
            <motion.button
              id="btn-camera-capture"
              whileTap={{ scale: 0.9 }}
              onClick={capturePhoto}
              disabled={cameraError || capturing}
              className="w-20 h-20 rounded-full bg-white border-4 border-[#4ade80] flex items-center justify-center shadow-lg shadow-[#4ade80]/30 disabled:opacity-50"
            >
              <div className="w-14 h-14 rounded-full bg-[#4ade80]" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="w-14 h-14" /> {/* spacer */}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}