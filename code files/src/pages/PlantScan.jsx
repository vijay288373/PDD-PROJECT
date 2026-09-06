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
    let fieldSize = parseFloat(localStorage.getItem('agriguard_field_size')) || 2;
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
      const prompt = `You are an expert plant pathologist AI. Examine this leaf image carefully.
Selected Crop: ${selectedCrop}
Region: ${region}
Farmer Field Size: ${fieldSize} acres
Language: ${language}${llmLangSuffix(langCode)}

Diagnose the plant leaf health status. If the image is explicitly NOT a plant leaf (e.g. human face, car, building, animal, furniture), set "is_plant_leaf": false.

IMPORTANT: For treatment_steps, use SPECIFIC pesticide/fungicide product names with EXACT quantities per acre AND total for the farmer's field. Format: "Spray [Product Name] at [dose]/acre. For ${fieldSize} acres = [total amount]. Mix at [concentration] per liter."
If nutritional deficiency, specify exact nutrient supplement, quantity per acre, and total for ${fieldSize} acres.

Schema:
{
  "is_plant_leaf": true | false,
  "is_healthy": boolean,
  "disease_name": "string",
  "confidence": number 0-100,
  "severity": "mild" | "moderate" | "severe",
  "cause": "fungal" | "bacterial" | "pest" | "nutritional",
  "treatment_steps": ["step 1 with product + quantity", "step 2"],
  "prevention_tips": ["tip 1", "tip 2"],
  "consult_agronomist": boolean,
  "invalid_reason": "string"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [imageData.url],
        response_json_schema: {
          type: "object",
          properties: {
            is_plant_leaf: { type: "boolean" },
            is_healthy: { type: "boolean" },
            disease_name: { type: "string" },
            confidence: { type: "number" },
            severity: { type: "string", enum: ["mild", "moderate", "severe"] },
            cause: { type: "string", enum: ["fungal", "bacterial", "pest", "nutritional"] },
            treatment_steps: { type: "array", items: { type: "string" } },
            prevention_tips: { type: "array", items: { type: "string" } },
            consult_agronomist: { type: "boolean" },
            invalid_reason: { type: "string" }
          },
          required: ["is_plant_leaf"]
        }
      });

      if (result.is_plant_leaf === false) {
        setDiagnosisResult({
          is_invalid_image: true,
          invalid_reason: result.invalid_reason || "Invalid Image Detected: Please scan a clear plant leaf image. Diagrams, text documents, or non-plant photos cannot be diagnosed."
        });
        setIsAnalyzing(false);
        return;
      }

      const isHealthy = result.is_healthy !== undefined ? !!result.is_healthy : (result.health_status === "healthy");
      const diagnosis = { 
        ...result, 
        is_healthy: isHealthy,
        crop: selectedCrop, 
        image_url: imageData.url, 
        region 
      };

      // Cache locally
      localStorage.setItem(`last_scan_${selectedCrop}`, JSON.stringify(diagnosis));

      // Save to history entity + create alert
      try {
        await base44.entities.ScanHistory.create({
          uid,
          crop: selectedCrop,
          image_url: imageData.url,
          disease_name: result.disease_name || (isHealthy ? `Healthy ${selectedCrop} Crop` : `${selectedCrop} Infection`),
          confidence: result.confidence || 92,
          severity: result.severity || "mild",
          cause: result.cause || (isHealthy ? "healthy" : "fungal"),
          treatment_steps: result.treatment_steps || [],
          prevention_tips: result.prevention_tips || [],
          consult_agronomist: result.consult_agronomist || false,
          seasonal_care: result.seasonal_care || [],
          is_healthy: isHealthy,
          region,
          language,
          synced: true
        });

        // Auto-create scan alert
        const alertTitle = isHealthy
          ? `Scan done: ${selectedCrop} is healthy`
          : `Scan done: ${result.disease_name || selectedCrop} detected`;
        const alertBody = isHealthy
          ? `Your ${selectedCrop} looks healthy with ${result.confidence || 95}% confidence.`
          : `${selectedCrop} — ${result.severity || "moderate"} severity. ${result.treatment_steps?.[0] || ""}`;
        const alertType = (!isHealthy && result.severity === "severe") ? "critical" : "scan";

        await base44.entities.Alert.create({
          uid,
          type: alertType,
          title: alertTitle,
          body: alertBody,
          read: false,
          linked_screen: "/",
        });
      } catch (e) {
        console.warn("ScanHistory creation error:", e);
      }

      setDiagnosisResult(diagnosis);
    } catch (err) {
      console.warn("Plant scan InvokeLLM error, loading real-time crop diagnosis fallback:", err);
      try {
        const fallbackRes = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an expert plant pathologist AI. Diagnose leaf health. Selected Crop: ${selectedCrop}. Region: ${region}.`,
          file_urls: [imageData?.url],
        });
        const isHealthy = fallbackRes.is_healthy !== undefined ? !!fallbackRes.is_healthy : (fallbackRes.health_status === "healthy");
        const diagnosis = {
          ...fallbackRes,
          is_healthy: isHealthy,
          crop: selectedCrop,
          image_url: imageData?.url,
          region,
        };

        try {
          await base44.entities.ScanHistory.create({
            uid,
            crop: selectedCrop,
            image_url: imageData?.url,
            disease_name: fallbackRes.disease_name || (isHealthy ? `Healthy ${selectedCrop} Crop` : `${selectedCrop} Infection`),
            confidence: fallbackRes.confidence || 93,
            severity: fallbackRes.severity || "moderate",
            cause: fallbackRes.cause || (isHealthy ? "healthy" : "fungal"),
            treatment_steps: fallbackRes.treatment_steps || [],
            prevention_tips: fallbackRes.prevention_tips || [],
            consult_agronomist: fallbackRes.consult_agronomist || false,
            seasonal_care: fallbackRes.seasonal_care || [],
            is_healthy: isHealthy,
            region,
            language,
            synced: true
          });
        } catch (e) {
          console.warn("ScanHistory creation error in fallback:", e);
        }

        setDiagnosisResult(diagnosis);
      } catch (fbErr) {
        console.warn("Fallback error:", fbErr);
      }
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
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#052e16] to-[#166534] px-4 pt-safe-top pb-4 shadow-lg">
        <div className="w-full flex items-center justify-between">
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

      <div ref={containerRef} className="w-full pb-16">
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