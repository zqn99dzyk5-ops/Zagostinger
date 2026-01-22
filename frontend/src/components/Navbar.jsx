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
  const { settings = {} } = useSettings(); // Default prazan objekt
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Početna', isExternal: false },
    { href: '/#programs', label: 'Programi', isExternal: true },
    { href: '/shop', label: 'Shop', isExternal: false },
    { href: '/#faq', label: 'FAQ', isExternal: true },
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings.site_name || 'Logo'} 
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <span className="text-black font-bold text-xl font-heading">C</span>
              </div>
            )}
            <span className="font-heading text-xl font-semibold text-foreground hidden sm:block">
              {settings?.site_name || 'Continental Academy'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isExternal ? (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-300 ${
                    isActive(link.href) ? 'text-white' : 'text-orange-400 hover:text-pink-400'
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-all duration-300 ${
                    isActive(link.href) ? 'text-white' : 'text-orange-400 hover:text-pink-400'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="gap-2 text-muted-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Prijava</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                    Započni
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-orange-400 hover:text-pink-400 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-3">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Button>
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                    >
                      <LogOut className="w-4 h-4" />
                      Odjava
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Prijava</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary text-primary-foreground">
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