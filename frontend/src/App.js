import "@/index.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./lib/auth";
import { SettingsProvider } from "./lib/settings";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CourseView from "./pages/CourseView";
import Shop from "./pages/Shop";
import Admin from "./pages/Admin";

// Pomoćna komponenta: Automatski skroluje na vrh stranice pri promeni rute
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Route - Zaustavlja neovlašten upad u Dashboard ili Admin
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route - Ne dozvoljava ulogovanom korisniku da ide opet na login/register
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Layout - Standardni omotač za stranice
const Layout = ({ children, showFooter = true }) => (
  <div className="relative flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">{children}</main>
    {showFooter && <Footer />}
    {/* Noise texture overlay za luxury look */}
    <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] noise-overlay" />
  </div>
);

function AppContent() {
  return (
    <BrowserRouter>
      <ScrollToTop /> {/* Aktiviran auto-scroll */}
      <Routes>
        {/* Javno dostupne rute */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/shop" element={<Layout><Shop /></Layout>} />
        
        {/* Rute za Autentifikaciju */}
        <Route path="/login" element={
          <PublicRoute>
            <Layout showFooter={false}><Login /></Layout>
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Layout showFooter={false}><Register /></Layout>
          </PublicRoute>
        } />
        
        {/* Zaštićene rute za studente */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/course/:courseId" element={
          <ProtectedRoute>
            {/* CourseView obično ima svoj side-nav ili player, pa gasimo footer */}
            <Layout showFooter={false}><CourseView /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin Panel - Samo za ulogu 'admin' */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Layout><Admin /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Redirect ako korisnik ukuca nepostojeći URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors /> {/* Dodat richColors za lepše notifikacije */}
    </BrowserRouter>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
