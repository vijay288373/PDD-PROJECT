import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LangProvider } from '@/lib/useLang.jsx';
import OfflineBanner from '@/components/OfflineBanner';
import AddToHomePrompt from '@/components/AddToHomePrompt';
// Add page imports here
import PlantScan from "./pages/PlantScan";
import WeatherScreen from "./pages/WeatherScreen";
import MarketPrices from "./pages/MarketPrices";
import AlertsCenter from "./pages/AlertsCenter";
import ProfileSettings from "./pages/ProfileSettings";
import LoginPage from "./pages/LoginPage";

const AuthenticatedApp = () => {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Guard routing: if not authenticated, render the premium LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<PlantScan />} />
      <Route path="/weather" element={<WeatherScreen />} />
      <Route path="/market" element={<MarketPrices />} />
      <Route path="/alerts" element={<AlertsCenter />} />
      <Route path="/profile" element={<ProfileSettings />} />
      {/* Add your page Route elements here */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <OfflineBanner />
            <AuthenticatedApp />
            <AddToHomePrompt />
          </Router>
        </QueryClientProvider>
      </LangProvider>
    </AuthProvider>
  )
}

export default App