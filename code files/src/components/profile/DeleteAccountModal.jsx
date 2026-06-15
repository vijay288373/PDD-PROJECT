import { useState } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

export default function DeleteAccountModal({ user, profile, onClose }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { langCode } = useLang();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete all user data from entities
      if (profile?.id) {
        await base44.entities.FarmerProfile.delete(profile.id);
      }
      // Delete scan history
      const scans = await base44.entities.ScanHistory.filter({ uid: user.email });
      await Promise.all(scans.map(s => base44.entities.ScanHistory.delete(s.id)));
      // Delete alerts
      const alerts = await base44.entities.Alert.filter({ uid: user.email });
      await Promise.all(alerts.map(a => base44.entities.Alert.delete(a.id)));
      // Sign out
      base44.auth.logout("/");
    } catch {}
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-sm rounded-3xl p-6"
      >
        <div className="flex justify-end mb-2">
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t("profile_confirm_delete", langCode)}</h3>
          <p className="text-sm text-gray-500 mt-2">
            {t("profile_delete_desc", langCode)}
          </p>
        </div>

        {!confirming ? (
          <div className="space-y-2">
            <button
              onClick={() => setConfirming(true)}
              className="w-full py-3 bg-red-500 text-white rounded-2xl font-semibold"
            >
              {t("profile_delete_yes", langCode)}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium"
            >
              {t("btn_cancel", langCode)}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-center text-sm text-red-600 font-medium mb-3">{t("profile_delete_are_you_sure", langCode)}</p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-3 bg-red-600 text-white rounded-2xl font-semibold disabled:opacity-60"
            >
              {deleting ? t("profile_deleting", langCode) : t("profile_delete_everything", langCode)}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium"
            >
              {t("btn_cancel", langCode)}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}