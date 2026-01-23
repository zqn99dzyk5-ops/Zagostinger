import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useSettings } from '@/lib/settings';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/80 backdrop-blur-lg border-b border-white/5 py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        {/* Logo sa gradijentom */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-xl">
              {settings?.site_name?.charAt(0) || 'C'}
            </span>
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">
            {settings?.site_name || 'Continental Academy'}
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm font-medium transition-colors hover:text-orange-400 ${location.pathname === '/' ? 'text-orange-500' : 'text-foreground/70'}`}>Početna</Link>
          <Link to="/shop" className={`text-sm font-medium transition-colors hover:text-orange-400 ${location.pathname === '/shop' ? 'text-orange-500' : 'text-foreground/70'}`}>Shop</Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold border-0 px-6">
                  Dashboard
                </Button>
              </Link>
              <button onClick={logout} className="text-foreground/50 hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="rounded-xl border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all">
                Prijavi se
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
