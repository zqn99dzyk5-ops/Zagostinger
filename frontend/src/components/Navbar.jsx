import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, Settings, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../lib/auth';
import { useSettings } from '../lib/settings';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { settings = {} } = useSettings();
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo - Vuče podatke direktno iz Admin postavki */}
          <Link to="/" className="flex items-center gap-3 group">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings.site_name || 'Logo'} 
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-bold text-xl font-heading">
                  {settings?.site_name?.charAt(0) || 'C'}
                </span>
              </div>
            )}
            <span className="font-heading text-lg font-bold text-foreground tracking-tight hidden sm:block">
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
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.href) ? 'text-primary font-bold' : 'text-foreground/70'
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.href) ? 'text-primary font-bold' : 'text-foreground/70'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Auth & Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-white/5">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    Dashboard
                  </Button>
                </Link>
                
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-white/5">
                      <Settings className="w-4 h-4 text-primary" />
                      Admin
                    </Button>
                  </Link>
                )}

                <div className="w-[1px] h-6 bg-white/10 mx-2" />

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
                  title="Odjavi se"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-medium">Prijava</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 font-bold shadow-lg shadow-primary/20">
                    Započni
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-20 left-0 right-0 bg-[#0A0A0A] border-b border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  link.isExternal ? (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-3">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block">
                      <Button variant="outline" className="w-full justify-start gap-3 rounded-xl py-6">
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        Dashboard
                      </Button>
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsOpen(false)} className="block">
                        <Button variant="outline" className="w-full justify-start gap-3 rounded-xl py-6">
                          <Settings className="w-5 h-5 text-primary" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 py-6 text-destructive hover:bg-destructive/5"
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                    >
                      <LogOut className="w-5 h-5" />
                      Odjavi se
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full py-6 rounded-xl font-bold">Prijava</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary text-primary-foreground py-6 rounded-xl font-bold">
                        Započni
                      </Button>
                    </Link>
                  </div>
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
