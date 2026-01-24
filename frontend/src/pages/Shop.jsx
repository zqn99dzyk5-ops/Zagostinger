import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Users, TrendingUp, Eye, 
  ChevronRight, Loader2, Check, Zap 
} from 'lucide-react';
import { Button } from '../components/ui/button';
// Koristimo raw divove za kartice radi boljeg "Brutal" dizajna, ali zadržavamo tvoje importe ako zatrebaju
import { shopAPI, paymentsAPI, analyticsAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

const Shop = () => {
  // --- TVOJA LOGIKA (NE DIRAMO) ---
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Provjera statusa plaćanja (Stripe redirect)
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      const checkPayment = async () => {
        try {
          const response = await paymentsAPI.getStatus(sessionId);
          if (response.data.payment_status === 'paid') {
            toast.success('Kupovina uspješna! Kontaktirajte nas na Discord za isporuku.');
          }
        } catch (error) {
          console.error('Error checking payment:', error);
        }
      };
      checkPayment();
    }
  }, [searchParams]);

  // Učitavanje proizvoda preko tvog API-ja
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // Pozivamo tvoj shopAPI
        const response = await shopAPI.getProducts(activeCategory === 'all' ? undefined : activeCategory);
        // Osiguravamo da je niz
        setProducts(Array.isArray(response.data) ? response.data : []);
        
        if (analyticsAPI?.trackEvent) {
          analyticsAPI.trackEvent({ event_type: 'page_view', page: 'shop', metadata: { category: activeCategory } });
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Greška pri učitavanju proizvoda.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [activeCategory]);

  // Funkcija za kupovinu
  const handlePurchase = async (productId) => {
    if (!user) {
      toast.error('Morate biti prijavljeni za kupovinu');
      return;
    }
    
    try {
      const response = await paymentsAPI.createProductCheckout(productId);
      if (response?.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error('Greška pri pokretanju plaćanja');
    }
  };

  // Kategorije
  const categories = [
    { id: 'all', label: 'Sve', icon: ShoppingBag },
    { id: 'tiktok', label: 'TikTok', icon: TrendingUp },
    { id: 'youtube', label: 'YouTube', icon: Eye },
    { id: 'facebook', label: 'Facebook', icon: Users },
  ];

  return (
    // Z-INDEX FIX: relative z-10 osigurava da je shop iznad globalnih sjena
    <div className="relative z-10 min-h-screen bg-[#050505] text-white pt-24 pb-16 font-sans overflow-x-hidden selection:bg-orange-500/30">
      
      {/* --- POZADINSKE SJENE (DA NE PREKRIVAJU TEKST) --- */}
      <div className="fixed inset-0 bg-[#050505] -z-20" />
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-orange-600/10 blur-[100px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-pink-600/10 blur-[100px] rounded-full opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* HEADER SEKCIJA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-orange-500 font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Marketplace</span>
          <h1 className="text-5xl md:text-[6rem] font-black uppercase tracking-tighter leading-none mb-6">
            Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600">Shop</span>
          </h1>
          <p className="text-white/50 text-xl max-w-2xl mx-auto font-medium">
            Kupite monetizirane naloge i započnite zarađivanje odmah.
          </p>
        </motion.div>

        {/* KATEGORIJE - Centrirane */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex flex-wrap justify-center gap-3 p-3 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant="ghost"
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  rounded-xl px-6 py-6 text-lg font-bold transition-all uppercase tracking-wide
                  ${activeCategory === cat.id 
                    ? 'bg-orange-600 text-white shadow-lg hover:bg-orange-700' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'}
                `}
              >
                <cat.icon className="w-5 h-5 mr-2" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* KARTICA PROIZVODA - Brutal Design */}
                <div className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-orange-500/50 transition-all duration-500 flex flex-col h-full hover:shadow-[0_0_40px_rgba(234,88,12,0.15)] relative">
                  
                  {/* Status Badge */}
                  <div className="absolute top-5 right-5 z-20 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-widest">
                      {product.category}
                    </span>
                    {product.is_available && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest">
                        Dostupno
                      </span>
                    )}
                  </div>

                  {/* THUMBNAIL SLIKA (Centrirana, Prikaz iz Admina) */}
                  <div className="h-64 overflow-hidden relative bg-[#151515]">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      // Fallback ako nema slike
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-600/5 to-pink-600/5">
                        <ShoppingBag className="w-16 h-16 text-white/10" />
                      </div>
                    )}
                    {/* Dark overlay preko slike */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent opacity-60" />
                  </div>
                  
                  {/* Sadržaj Kartice */}
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-black uppercase mb-3 leading-tight tracking-tight">{product.title}</h3>
                    <p className="text-white/50 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Stats Grid (ako postoji) */}
                    {product.stats && Object.keys(product.stats).length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-8">
                        {Object.entries(product.stats).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="p-3 rounded-2xl bg-white/5 text-center border border-white/5">
                            <p className="text-lg font-black text-white">{value}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{key}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-auto pt-6 border-t border-white/5">
                      <div className="flex items-end justify-between mb-6">
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Cijena</span>
                        <span className="text-4xl font-black text-orange-500 tracking-tighter">€{product.price}</span>
                      </div>
                      
                      <Button 
                        className={`
                          w-full py-7 rounded-2xl font-black text-lg uppercase transition-all shadow-lg
                          ${product.is_available 
                            ? 'bg-white text-black hover:bg-orange-600 hover:text-white' 
                            : 'bg-white/10 text-white/30 cursor-not-allowed'}
                        `}
                        onClick={() => handlePurchase(product.id)}
                        disabled={!product.is_available}
                      >
                        {product.is_available ? (
                          <span className="flex items-center gap-2">Kupi Sada <ChevronRight className="w-5 h-5" /></span>
                        ) : 'Nije dostupno'}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-2xl font-black uppercase mb-2">Nema Proizvoda</h3>
            <p className="text-white/40">Trenutno nema proizvoda u ovoj kategoriji.</p>
          </div>
        )}

        {/* INFO SEKCIJA (Footer style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32"
        >
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-12">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-orange-600/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition-colors duration-500">
                  <Check className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl font-black uppercase mb-3">Monetizovani nalozi</h4>
                <p className="text-white/50 text-sm font-medium">Svi nalozi su ručno provjereni i spremni za monetizaciju odmah.</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-orange-600/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition-colors duration-500">
                  <Zap className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl font-black uppercase mb-3">Isporuka u roku 48h</h4>
                <p className="text-white/50 text-sm font-medium">Pristupni podaci se šalju automatski na tvoj email nakon uplate.</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-orange-600/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition-colors duration-500">
                  <Users className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl font-black uppercase mb-3">24/7 Podrška</h4>
                <p className="text-white/50 text-sm font-medium">Naš tim ti je uvijek dostupan na Discordu za sva pitanja.</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Shop;
