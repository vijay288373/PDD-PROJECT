import { useState } from "react";
import CameraCapture from "@/components/scan/CameraCapture";
import CropSelector from "@/components/scan/CropSelector";
import DiagnosisResult from "@/components/scan/DiagnosisResult";
import ScanHistory from "@/components/scan/scanHistory";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, History } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useLang } from "@/lib/useLang.jsx";
import { t, llmLangSuffix } from "@/lib/i18n";
import { usePullToRefresh } from "@/lib/usePullToRefresh";
import { getPrecisionLocation, getGeocodedLocation } from "@/lib/location";

export default function PlantScan() {
  const [phase, setPhase] = useState("crop"); // crop | camera | result
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("scan");
  const { langCode } = useLang();
  const { refreshing, containerRef } = usePullToRefresh(() => {
    setPhase("crop");
    setSelectedCrop(null);
    setCapturedImage(null);
    setDiagnosisResult(null);
    return Promise.resolve();
  });

  const handleCropSelected = (crop) => {
    setSelectedCrop(crop);
    setPhase("camera");
  };

  const handleImageCaptured = async (imageData) => {
    setCapturedImage(imageData);
    setPhase("result");
    setIsAnalyzing(true);

    // Get user profile for region/language context
    let region = "Unknown region";
    let language = "English";
    let uid = "anonymous";
    try {
      const user = await base44.auth.me();
      uid = user.email || "anonymous";
      const profiles = await base44.entities.FarmerProfile.filter({ uid });
      if (profiles.length > 0) {
        region = profiles[0].region || region;
        language = profiles[0].language || language;
      }
    } catch {}

    // Fetch precision current location
    try {
      const coords = await getPrecisionLocation();
      if (coords) {
        const geo = await getGeocodedLocation(coords.latitude, coords.longitude);
        if (geo && geo.formatted) {
          region = `${geo.formatted} (lat: ${coords.latitude.toFixed(4)}, lon: ${coords.longitude.toFixed(4)})`;
        }
      }
    } catch (e) {
      console.warn("Failed to get precision location, using profile region fallback:", e);
    }

    // Check connectivity
    if (!navigator.onLine) {
      // Try to load last cached scan for this crop
      try {
        const cached = JSON.parse(localStorage.getItem(`last_scan_${selectedCrop}`) || "null");
        if (cached) {
          setDiagnosisResult({ ...cached, fromCache: true });
          setIsAnalyzing(false);
          return;
        }
      } catch {}
      setDiagnosisResult({ offline: true, crop: selectedCrop });
      setIsAnalyzing(false);
      return;
    }

    // Call AI diagnosis
    try {
      const prompt = `You are an expert plant pathologist AI. Analyze this plant image carefully.
The crop is: ${selectedCrop}
User region: ${region}
Respond in: ${language}${llmLangSuffix(langCode)}

Examine the image for any diseases, pests, nutritional deficiencies, or abnormalities.

If a disease or problem is found, respond with this exact JSON:
{
  "is_healthy": false,
  "disease_name": "...",
  "confidence": <number 0-100>,
  "severity": "mild" | "moderate" | "severe",
  "cause": "fungal" | "bacterial" | "pest" | "nutritional",
  "treatment_steps": ["step 1 using locally available remedies", "step 2", "step 3", "step 4", "step 5"],
  "prevention_tips": ["tip 1 for this season", "tip 2", "tip 3"],
  "consult_agronomist": true | false
}

If the plant looks healthy, respond with:
{
  "is_healthy": true,
  "confidence": <number 0-100>,
  "seasonal_care": ["care tip 1", "care tip 2", "care tip 3", "care tip 4"]
}

Respond in JSON only. No extra text.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [imageData.url],
        response_json_schema: {
          type: "object",
          properties: {
            is_healthy: { type: "boolean" },
            disease_name: { type: "string" },
            confidence: { type: "number" },
            severity: { type: "string" },
            cause: { type: "string" },
            treatment_steps: { type: "array", items: { type: "string" } },
            prevention_tips: { type: "array", items: { type: "string" } },
            consult_agronomist: { type: "boolean" },
            seasonal_care: { type: "array", items: { type: "string" } }
          }
        }
      });

      const diagnosis = { ...result, crop: selectedCrop, image_url: imageData.url, region };

      // Cache locally
      localStorage.setItem(`last_scan_${selectedCrop}`, JSON.stringify(diagnosis));

      // Save to history entity + create alert
      try {
        await base44.entities.ScanHistory.create({
          uid,
          crop: selectedCrop,
          image_url: imageData.url,
          disease_name: result.disease_name || null,
          confidence: result.confidence || 0,
          severity: result.severity || "none",
          cause: result.cause || "healthy",
          treatment_steps: result.treatment_steps || [],
          prevention_tips: result.prevention_tips || [],
          consult_agronomist: result.consult_agronomist || false,
          seasonal_care: result.seasonal_care || [],
          is_healthy: result.is_healthy || false,
          region,
          language,
          synced: true
        });

        // Auto-create scan alert
        const alertTitle = result.is_healthy
          ? `Scan done: ${selectedCrop} is healthy`
          : `Scan done: ${result.disease_name} detected`;
        const alertBody = result.is_healthy
          ? `Your ${selectedCrop} looks healthy with ${result.confidence}% confidence.`
          : `${selectedCrop} — ${result.severity} severity. ${result.treatment_steps?.[0] || ""}`;
        const alertType = (!result.is_healthy && result.severity === "severe") ? "critical" : "scan";

        // Increment scan count for A2HS prompt
        const prev = parseInt(localStorage.getItem("scan_count") || "0", 10);
        localStorage.setItem("scan_count", String(prev + 1));

        await base44.entities.Alert.create({
          uid,
          type: alertType,
          title: alertTitle,
          body: alertBody,
          read: false,
          linked_screen: "/",
        });
      } catch {}

      setDiagnosisResult(diagnosis);
    } catch (err) {
      setDiagnosisResult({ error: true });
    }

    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setPhase("crop");
    setSelectedCrop(null);
    setCapturedImage(null);
    setDiagnosisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f8f0]">
      {/* Header */}
      <div className="bg-[#1a5c2a] px-4 pt-safe-top pb-4 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4ade80] rounded-full flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#1a5c2a]" />
            </div>
            <span className="text-white font-bold text-lg">{t("app_name", langCode)}</span>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#2d7a40] border-0">
              <TabsTrigger value="scan" className="text-white data-[state=active]:bg-[#4ade80] data-[state=active]:text-[#1a5c2a] text-xs">
                <Leaf className="w-3 h-3 mr-1" /> {t("nav_scan", langCode)}
              </TabsTrigger>
              <TabsTrigger value="history" className="text-white data-[state=active]:bg-[#4ade80] data-[state=active]:text-[#1a5c2a] text-xs">
                <History className="w-3 h-3 mr-1" /> {t("history_title", langCode)}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <BottomNav />

      {refreshing && (
        <div className="flex justify-center pt-4">
          <div className="w-5 h-5 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div ref={containerRef} className="max-w-lg mx-auto pb-16">
        {activeTab === "history" ? (
          <ScanHistory />
        ) : (
          <>
            {phase === "crop" && <CropSelector onCropSelected={handleCropSelected} />}
            {phase === "camera" && (
              <CameraCapture
                selectedCrop={selectedCrop}
                onImageCaptured={handleImageCaptured}
                onBack={() => setPhase("crop")}
              />
            )}
            {phase === "result" && (
              <DiagnosisResult
                result={diagnosisResult}
                isAnalyzing={isAnalyzing}
                capturedImage={capturedImage}
                selectedCrop={selectedCrop}
                onScanAgain={handleReset}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}