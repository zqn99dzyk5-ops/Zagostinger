import { Link } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-card/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <span className="text-black font-bold text-xl font-heading">C</span>
              </div>
              <span className="font-heading text-xl font-semibold">Continental Academy</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Profesionalna online akademija za monetizaciju digitalnog sadržaja. 
              Naučite od najboljih i pretvorite svoju kreativnost u prihod.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Linkovi</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">Početna</Link>
              </li>
              <li>
                <a href="/#programs" className="hover:text-foreground transition-colors">Programi</a>
              </li>
              <li>
                <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
              </li>
              <li>
                <a href="/#faq" className="hover:text-foreground transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:info@continentalacademy.com" className="hover:text-foreground transition-colors">
                  info@continentalacademy.com
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.gg/placeholder" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Discord zajednica
                </a>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                data-testid="footer-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                data-testid="footer-youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                data-testid="footer-discord"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Continental Academy. Sva prava zadržana.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privatnost</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Uslovi korištenja</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
