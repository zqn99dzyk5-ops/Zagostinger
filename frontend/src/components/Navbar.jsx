import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../lib/auth';
import { useSettings } from '../lib/settings';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Početna' },
    { href: '/#programs', label: 'Programi' },
    { href: '/shop', label: 'Shop' },
    { href: '/#faq', label: 'FAQ' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('#')[0]);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. LOGO */}
          <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
            {settings.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings.site_name || 'Logo'} 
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.5)]">
                <span className="text-white font-bold text-xl font-heading">C</span>
              </div>
            )}
            <span className="font-heading text-xl font-bold text-white hidden sm:block">
              {settings.site_name || 'Continental Academy'}
            </span>
          </Link>

          {/* 2. DESKTOP NAVIGACIJA (GLOW EFEKTI) */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive(link.href) 
                    ? 'text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' 
                    : 'text-orange-500 hover:text-pink-500 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* 3. DESKTOP AUTH DUGMAD */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2 text-white hover:text-orange-500 hover:bg-white/5" data-testid="nav-dashboard-btn">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 text-white hover:text-orange-500 hover:bg-white/5" data-testid="nav-admin-btn">
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="gap-2 text-white/50 hover:text-red-500 hover:bg-red-500/10"
                  data-testid="nav-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:text-orange-500 hover:bg-white/5" data-testid="nav-login-btn">
                    Prijava
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm" 
                    className="bg-orange-600 text-white hover:bg-orange-700 rounded-full px-6 font-bold shadow-[0_0_15px_rgba(234,88,12,0.4)] transition-all hover:scale-105"
                    data-testid="nav-register-btn"
                  >
                    Započni
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* 4. MOBILE HAMBURGER DUGME */}
          <button
            className="lg:hidden p-2 text-white hover:text-orange-500 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="nav-mobile-toggle"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 5. MOBILNI MENI (FIX: Crna pozadina) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#050505] border-t border-white/10 overflow-hidden shadow-2xl absolute w-full left-0 top-20 z-50"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`block py-3 text-lg font-bold uppercase tracking-wider transition-colors border-b border-white/5 ${
                     isActive(link.href) ? 'text-pink-500' : 'text-orange-500 hover:text-pink-500'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 space-y-3">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2 py-6 bg-white/5 text-white border-white/10 hover:bg-white/10">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Button>
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-2 py-6 bg-white/5 text-white border-white/10 hover:bg-white/10">
                          <Settings className="w-5 h-5" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 py-4 text-white/50 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                    >
                      <LogOut className="w-5 h-5" />
                      Odjava
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full py-6 bg-white/5 text-white border-white/10 hover:bg-white/10 font-bold uppercase">Prijava</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full py-6 bg-orange-600 text-white hover:bg-orange-700 font-bold uppercase shadow-lg">
                        Registracija
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
