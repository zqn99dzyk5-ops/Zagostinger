import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Zap, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  ArrowUpRight,
  Gem,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';

const Shop = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);

  // Svi tvoji proizvodi su ovde, spremni za prikaz
  const products = [
    {
      _id: 'prod_1',
      title: 'Aged Ads Manager (High Limit)',
      price: 149,
      badge: 'Bestseller',
      icon: Cpu,
      description: 'Verifikovan Business Manager sa visokim limitom, spreman za skaliranje oglasa bez restrikcija.',
    },
    {
      _id: 'prod_2',
      title: 'E-com Assets Blueprint',
      price: 89,
      badge: 'Hot',
      icon: Gem,
      description: 'Kompletna arhiva pobedničkih oglasa, kreativaca i landing stranica za tvoj dropshipping biznis.',
    },
    {
      _id: 'prod_3',
      title: 'Premium Proxy Pack',
      price: 45,
      badge: 'Safe',
      icon: ShieldCheck,
      description: 'Najbrži rezidencijalni proxiji za sigurno vođenje više naloga bez rizika od banovanja.',
    }
  ];

  const handlePurchase = async (productId) => {
    if (!user) {
      toast.error("Moraš biti prijavljen za kupovinu.");
      return;
    }

    setLoading(productId);
    try {
      const res = await axios.post(`/api/payments/checkout/product?product_id=${productId}`);
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      toast.error("Greška pri pokretanju uplate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-40 pb-32 overflow-hidden relative">
      
      {/* Masivni Ambient Glow pozadina */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-600/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-pink-600/10 blur-[180px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Sekcija sa brutalnim naslovom */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/80">Digital Assets Store</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-[9rem] font-black mb-10 tracking-tighter leading-none uppercase">
            Upgrade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-orange-500">
              Your Game
            </span>
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-xl font-light leading-relaxed opacity-70">
            Premium resursi i alati koje koriste 1% digitalnih preduzetnika. <br className="hidden md:block" />
            Sve što ti treba za dominaciju je ovde.
          </p>
        </div>

        {/* Grid sa karticama proizvoda */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.map((product) => (
            <motion.div 
              key={product._id}
              whileHover={{ y: -15 }}
              className="group relative bg-[#0a0a0a] rounded-[3.5rem] p-12 border border-white/5 overflow-hidden transition-all duration-700 hover:border-orange-500/40"
            >
              {/* Glow unutar kartice koji se pali na hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 blur-[60px] group-hover:bg-pink-500/20 transition-all" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center group-hover:bg-orange-500/20 transition-all duration-500 border border-white/10 group-hover:border-orange-500/50 shadow-xl">
                    <product.icon className="w-7 h-7 text-orange-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-black uppercase tracking-widest mb-3 inline-block">
                        {product.badge}
                    </span>
                    <p className="text-4xl font-black text-white tracking-tighter">€{product.price}</p>
                  </div>
                </div>

                <h3 className="text-3xl font-black mb-6 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-pink-500 transition-all uppercase">
                  {product.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-12 h-16 line-clamp-3 font-light">
                  {product.description}
                </p>

                <div className="space-y-5 mb-12 border-t border-white/5 pt-8">
                  <div className="flex items-center gap-4 text-sm font-bold text-white/80">
                    <Zap className="w-5 h-5 text-pink-500" />
                    <span className="tracking-tight">Instant Delivery</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    <span className="tracking-tight">24/7 Support Access</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handlePurchase(product._id)}
                  disabled={loading === product._id}
                  className="w-full py-9 rounded-[1.8rem] font-black tracking-[0.2em] bg-white text-black hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-600 hover:text-white transition-all duration-700 shadow-2xl uppercase text-lg"
                >
                  {loading === product._id ? "Processing..." : "Buy Now"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ukrasni bottom blur */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-pink-600/5 blur-[120px] pointer-events-none" />
    </div>
  );
};

export default Shop;
