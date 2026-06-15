import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/BottomNav";
import ProfileHeader from "@/components/profile/ProfileHeader";
import FarmStatsGrid from "@/components/profile/FarmStatsGrid";
import MyCropsSection from "@/components/profile/MyCropSection";
import SettingsSections from "@/components/profile/SettingsSection";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { Leaf } from "lucide-react";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, scans] = await Promise.all([
        base44.entities.FarmerProfile.filter({ uid: u.email }),
        base44.entities.ScanHistory.filter({ uid: u.email })
      ]);
      setProfile(profiles[0] || null);
      setScanCount(scans.length);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleProfileSaved = (updatedProfile) => {
    setProfile(updatedProfile);
    setEditOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8f0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8f0]">
      {/* Header */}
      <div className="bg-[#1a5c2a] px-4 pt-safe-top pb-4 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4ade80] rounded-full flex items-center justify-center">
            <Leaf className="w-4 h-4 text-[#1a5c2a]" />
          </div>
          <span className="text-white font-bold text-lg">Agri Guard AI</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto pb-24 px-4">
        <ProfileHeader
          user={user}
          profile={profile}
          scanCount={scanCount}
          onEdit={() => setEditOpen(true)}
        />
        <FarmStatsGrid profile={profile} user={user} />
        <MyCropsSection profile={profile} onProfileUpdate={setProfile} />
        <SettingsSections profile={profile} user={user} onProfileUpdate={setProfile} />
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