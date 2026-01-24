import { Link } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle, Facebook, Mail, Chrome, Globe } from 'lucide-react';
import { useSettings } from '../lib/settings';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="relative border-t border-white/5 bg-[#030303] pt-24 pb-12 overflow-hidden">
      {/* UKRASNI SJAJ (Ambient Glow) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          
          {/* Logo i Brand Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              {settings?.logo_url ? (
                /* DINAMIČNI LOGO SLIKA */
                <img 
                  src={settings.logo_url} 
                  alt={settings.site_name} 
                  className="h-12 w-auto object-contain"
                />
              ) : (
                /* FALLBACK GRADIENT KVADRAT */
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <span className="text-white font-bold text-2xl">
                    {settings?.site_name?.charAt(0) || 'C'}
                  </span>
                </div>
              )}
              
              <span className="font-heading text-2xl font-bold tracking-tighter text-white">
                {settings?.site_name || 'Continental Academy'}
              </span>
            </div>
            
            <p className="text-muted-foreground text-base leading-relaxed max-w-md">
              {settings?.footer_text || 'Pridruži se eliti digitalnih preduzetnika. Nauči strategije koje donose rezultate i transformiši svoju budućnost.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              Navigacija
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-orange-400 transition-all duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                  Početna
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-orange-400 transition-all duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-orange-400 transition-all duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Presence */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              Prati nas
            </h4>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Instagram, url: settings?.instagram_url, color: 'hover:border-pink-500/50 hover:text-pink-500' },
                { icon: Globe, url: settings?.tiktok_url, color: 'hover:border-white/50 hover:text-white' },
                { icon: Youtube, url: settings?.youtube_url, color: 'hover:border-red-500/50 hover:text-red-500' },
                { icon: MessageCircle, url: settings?.discord_invite_url, color: 'hover:border-indigo-500/50 hover:text-indigo-500' },
                { icon: Facebook, url: settings?.facebook_url, color: 'hover:border-blue-500/50 hover:text-blue-500' }
              ].map((social, i) => social.url && (
                <a 
                  key={i} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 hover:-translate-y-2 shadow-xl ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-muted-foreground tracking-wide">
            © {new Date().getFullYear()} <span className="text-white font-medium">{settings?.site_name || 'Continental Academy'}</span>. Sva prava zadržana.
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <span className="text-muted-foreground">Premium Experience by</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              Continental
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
