import { Link } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle, Facebook, Mail, Phone } from 'lucide-react';
import { useSettings } from '../lib/settings';

const Footer = () => {
  const { settings = {} } = useSettings();

  return (
    <footer className="border-t border-white/5 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand & Opis */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.site_name || 'Logo'} 
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl font-heading">
                    {settings?.site_name?.charAt(0) || 'C'}
                  </span>
                </div>
              )}
              <span className="font-heading text-xl font-bold tracking-tight">
                {settings?.site_name || 'Continental Academy'}
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              {settings?.footer_text || 'Profesionalna online akademija za razvoj digitalnih veština i monetizaciju sadržaja. Pridruži se stotinama uspešnih studenata.'}
            </p>
          </div>

          {/* Navigacioni Linkovi */}
          <div>
            <h4 className="text-foreground font-bold mb-6 uppercase tracking-wider text-xs">Navigacija</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Početna</Link>
              </li>
              <li>
                <a href="/#programs" className="hover:text-primary transition-colors">Programi</a>
              </li>
              <li>
                <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
              </li>
              <li>
                <a href="/#faq" className="hover:text-primary transition-colors">Česta pitanja</a>
              </li>
            </ul>
          </div>

          {/* Kontakt & Social */}
          <div>
            <h4 className="text-foreground font-bold mb-6 uppercase tracking-wider text-xs">Kontakt & Social</h4>
            <ul className="space-y-4 text-sm text-muted-foreground mb-6">
              {settings?.contact_email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-foreground transition-colors">
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings?.contact_phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-foreground transition-colors">
                    {settings.contact_phone}
                  </a>
                </li>
              )}
            </ul>
            
            {/* Social Icons - Mapirani na Admin Postavke */}
            <div className="flex flex-wrap gap-3">
              {settings?.instagram_url && (
                <a 
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.youtube_url && (
                <a 
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {settings?.discord_invite_url && (
                <a 
                  href={settings.discord_invite_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#5865F2] hover:text-white transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
              {settings?.facebook_url && (
                <a 
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} <span className="text-foreground font-medium">{settings?.site_name || 'Continental Academy'}</span>. Sva prava zadržana.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-primary transition-colors">Politika privatnosti</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Uslovi korišćenja</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
