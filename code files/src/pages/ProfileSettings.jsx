import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/BottomNav";
import ProfileHeader from "@/components/profile/ProfileHeader";
import FarmStatsGrid from "@/components/profile/FarmStatsGrid";
import MyCropsSection from "@/components/profile/MyCropSection";
import SettingsSections from "@/components/profile/SettingsSection";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { Leaf } from "lucide-react";

// ─── Supabase & Local Storage Helpers ─────────────────────────────────────────
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ptnlnpcycionjciuodep.supabase.co';
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DTMpMtKdF346pVGIQ8XMjw_FAeBcaIz';
const supabaseEnabled = !!(SUPA_URL && SUPA_KEY && SUPA_KEY.length > 10);
const LOCAL_KEY = "agriguard_local_profile";

function getLocalProfile(defaultName) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const init = {
    id: "local-" + Date.now(),
    full_name: defaultName || "Vijay",
    state: "Tamil Nadu",
    district: "Chennai",
    farm_size: 6,
    farm_size_unit: "acres",
    primary_crops: ["Rice", "Tomato", "Onion"],
    farming_type: "smallholder",
    language: "en",
  };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(init));
  return init;
}

function setLocalProfile(data) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {}
}

function supaHeaders() {
  return {
    apikey: SUPA_KEY,
    Authorization: `Bearer ${SUPA_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function fetchProfile(uid) {
  if (!supabaseEnabled) return null;
  const res = await fetch(
    `${SUPA_URL}/rest/v1/FarmerProfile?uid=eq.${encodeURIComponent(uid)}&order=created_date.asc&limit=1`,
    { headers: supaHeaders() }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase (${res.status}): ${errText}`);
  }
  const rows = await res.json();
  return rows[0] ?? null;
}

async function createProfile(uid, name) {
  if (!supabaseEnabled) return null;
  const body = {
    id: genId(),
    uid,
    full_name: name || "Farmer",
    primary_crops: ["Rice", "Tomato", "Onion"],
    language: "en",
    farm_size: 6,
    farm_size_unit: "acres",
    state: "Tamil Nadu",
  };
  const res = await fetch(`${SUPA_URL}/rest/v1/FarmerProfile`, {
    method: "POST",
    headers: supaHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase (${res.status}): ${errText}`);
  }
  const rows = await res.json();
  return rows[0] ?? body;
}

async function updateProfile(id, payload) {
  if (!supabaseEnabled || !id || id.startsWith("local-")) return null;
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/FarmerProfile?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: supaHeaders(),
        body: JSON.stringify({ ...payload, updated_date: new Date().toISOString() }),
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState("checking");

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);

      if (!supabaseEnabled) {
        const local = getLocalProfile(u?.full_name);
        setProfile(local);
        setDbStatus("local");
        setLoading(false);
        return;
      }

      try {
        let p = await fetchProfile(u.email);
        if (!p) {
          p = await createProfile(u.email, u.full_name);
        }
        if (p) {
          setProfile(p);
          setLocalProfile(p);
          setDbStatus("connected");
        } else {
          throw new Error("Empty response");
        }
      } catch (cloudErr) {
        console.warn("Supabase fetch failed (offline or network blocked), using local storage:", cloudErr);
        const local = getLocalProfile(u?.full_name);
        setProfile(local);
        setDbStatus("offline");
      }
    } catch (err) {
      console.error("loadData error:", err);
      const local = getLocalProfile();
      setProfile(local);
      setDbStatus("offline");
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Save profile modifications
  const handleProfileSaved = async (formData) => {
    const updated = {
      ...profile,
      full_name: formData.name || formData.full_name,
      state: formData.region || formData.state,
      district: formData.country || formData.district,
      farm_size: Number(formData.farm_size) || profile?.farm_size || 0,
      farm_size_unit: formData.farm_size_unit || profile?.farm_size_unit || "acres",
      farming_type: formData.farming_type || profile?.farming_type || "smallholder",
    };

    // Save locally immediately (guarantees persistence across refresh)
    setProfile(updated);
    setLocalProfile(updated);
    setEditOpen(false);

    // Attempt cloud sync in background
    if (profile?.id && !profile.id.startsWith("local-")) {
      await updateProfile(profile.id, {
        full_name: updated.full_name,
        state: updated.state,
        district: updated.district,
        farm_size: updated.farm_size,
        farm_size_unit: updated.farm_size_unit,
      });
    }
  };

  // Crop list updates
  const handleProfileUpdate = async (updatedProfile) => {
    setProfile(updatedProfile);
    setLocalProfile(updatedProfile);

    if (updatedProfile?.id && !updatedProfile.id.startsWith("local-") && updatedProfile?.primary_crops) {
      await updateProfile(updatedProfile.id, {
        primary_crops: updatedProfile.primary_crops,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0fdf4] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#052e16] to-[#166534] px-4 pt-safe-top pb-4 shadow-lg">
        <div className="w-full flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4ade80] rounded-full flex items-center justify-center">
            <Leaf className="w-4 h-4 text-[#1a5c2a]" />
          </div>
          <span className="text-white font-bold text-lg">Agri Guard AI</span>
          {/* Status Badge */}
          <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${
            dbStatus === "connected" ? "bg-green-400/20 text-green-200" :
            dbStatus === "offline" ? "bg-amber-400/20 text-amber-200" :
            "bg-green-400/20 text-green-200"
          }`}>
            {dbStatus === "connected" ? "🟢 Cloud Synced" :
             dbStatus === "offline" ? "🟡 Saved Locally" : "🟢 Active"}
          </span>
        </div>
      </div>

      <div className="w-full pb-24 px-4">
        <ProfileHeader
          user={user}
          profile={profile}
          scanCount={scanCount}
          onEdit={() => setEditOpen(true)}
        />
        <FarmStatsGrid profile={profile} user={user} />
        <MyCropsSection profile={profile} onProfileUpdate={handleProfileUpdate} />
        <SettingsSections profile={profile} user={user} onProfileUpdate={handleProfileUpdate} />
      </div>

      <BottomNav />

      {editOpen && (
        <EditProfileModal
          profile={profile}
          user={user}
          onSave={handleProfileSaved}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}