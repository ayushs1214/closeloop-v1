import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Public Pages
import LandingPage from "@/pages/LandingPage";
import ProductPage from "@/pages/ProductPage";
import MethodologyPage from "@/pages/MethodologyPage";
import CustomersPage from "@/pages/CustomersPage";
import PricingPage from "@/pages/PricingPage";
import DemoPage from "@/pages/DemoPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";

// Protected Pages
import Dashboard from "@/pages/Dashboard";
import CallsPage from "@/pages/CallsPage";
import CallReviewPage from "@/pages/CallReviewPage";
import SettingsPage from "@/pages/SettingsPage";

// Admin Pages
import VaultPage from "@/pages/admin/VaultPage";
import TeamPage from "@/pages/admin/TeamPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import PlatformPage from "@/pages/admin/PlatformPage";
import OnboardingPage from "@/pages/OnboardingPage";

// Protected Route Wrapper
const ProtectedRoute = ({ children, adminOnly = false, superuserOnly = false }) => {
  const { user, loading, isAdmin, isSuperuser } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse-subtle">
          <div className="w-8 h-8 rounded-full bg-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (superuserOnly && !isSuperuser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Home route with conditional redirect
const HomeRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse-subtle">
          <div className="w-8 h-8 rounded-full bg-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

// Auth routes with redirect if logged in
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse-subtle">
          <div className="w-8 h-8 rounded-full bg-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Always accessible */}
      <Route path="/" element={<HomeRoute />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/methodology" element={<MethodologyPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/demo" element={<DemoPage />} />
      
      {/* Auth Routes - Redirect to dashboard if logged in */}
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/calls" element={<ProtectedRoute><CallsPage /></ProtectedRoute>} />
      <Route path="/calls/:id" element={<ProtectedRoute><CallReviewPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/vault" element={<ProtectedRoute adminOnly><VaultPage /></ProtectedRoute>} />
      <Route path="/admin/team" element={<ProtectedRoute adminOnly><TeamPage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettingsPage /></ProtectedRoute>} />
      
      {/* Superuser Routes */}
      <Route path="/platform" element={<ProtectedRoute superuserOnly><PlatformPage /></ProtectedRoute>} />
      
      {/* Onboarding */}
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
