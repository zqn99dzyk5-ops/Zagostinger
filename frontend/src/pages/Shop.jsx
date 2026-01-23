import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap, CheckCircle2, Star, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';

const Shop = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fallback proizvodi - prikazuju se ako je baza prazna
  const defaultProducts = [
    {
      _id: '1',
      title: 'Aged Ads Manager (High Limit)',
      price: 149,
      description: 'Verifikovan Business Manager spreman za velike budžete bez restrikcija.',
      is_available: true
    },
    {
      _id: '2',
      title: 'E-com Blueprint Assets',
      price: 89,
      description: 'Kompletna arhiva pobedničkih oglasa i landing stranica za 2024.',
      is_available: true
    },
    {
      _id: '3',
      title: 'Premium Proxy Pack (1 Month)',
      price: 45,
      description: 'Najbrži rezidencijalni proxiji za sigurno vođenje više naloga.',
      is_available: true
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        if (res.data && res.data.length > 0) {
          setProducts(res.data);
        } else {
          setProducts(defaultProducts);
        }
      } catch (err) {
        setProducts(defaultProducts);
      }
    };
    fetchProducts();
  }, []);

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
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 overflow-hidden relative">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Sekcija */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">Premium Digital Resources</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
            DIGITAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">ASSETS</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Nabavi alate i resurse koje koriste vrhunski digitalni preduzetnici za automatizaciju i profit.
          </p>
        </div>

        {/* Mreža Proizvoda */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <motion.div 
              key={product._id}
              whileHover={{ y: -10 }}
              className="group relative bg-[#0a0a0a] rounded-[2.5rem] p-10 border border-white/5 overflow-hidden transition-all duration-500 hover:border-orange-500/30"
            >
              {/* Card Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Cena</p>
                    <p className="text-3xl font-black text-white tracking-tighter">€{product.price}</p>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-orange-400 transition-colors">
                  {product.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 h-12 line-clamp-2 italic">
                  {product.description}
                </p>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-sm font-medium text-white/70">
                    <ShieldCheck className="w-4 h-4 text-pink-500" />
                    <span>Instant dostava</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    <span>Full garancija na ispravnost</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handlePurchase(product._id)}
                  disabled={loading === product._id}
                  className="w-full py-8 rounded-2xl font-black tracking-widest bg-white text-black hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-600 hover:text-white transition-all duration-500 shadow-xl"
                >
                  {loading === product._id ? "UČITAVANJE..." : "KUPI ODMAH"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-pink-500/5 blur-[100px] pointer-events-none" />
    </div>
  );
};

export default Shop;
