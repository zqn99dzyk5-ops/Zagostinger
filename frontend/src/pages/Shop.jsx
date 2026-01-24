import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';

const Shop = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(null);

  // POVLAČENJE PROIZVODA IZ BAZE
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/public/shop/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Shop load error:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleBuy = async (id) => {
    if (!user) return toast.error("Moraš se prijaviti za kupovinu.");
    setLoading(id);
    try {
      const res = await axios.post(`/api/payments/checkout/product?product_id=${id}`);
      if (res.data.checkout_url) window.location.href = res.data.checkout_url;
    } catch (err) {
      toast.error("Greška pri pokretanju plaćanja.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Z-INDEX FIX I OVDE
    <div className="relative z-50 bg-[#050505] min-h-screen text-white pt-32 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-24">
          <h1 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter mb-6">
            Digital <span className="text-orange-600">Shop</span>
          </h1>
          <p className="text-white/40 text-xl uppercase tracking-widest font-bold">Premium alati za tvoj uspeh.</p>
        </div>

        {/* GRID PROIZVODA */}
        {products.length === 0 ? (
          <div className="text-center text-white/40 py-20">Nema aktivnih proizvoda u prodavnici.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((p) => (
              <div key={p._id} className="bg-[#0f0f0f] border border-white/10 p-10 rounded-[3rem] hover:border-orange-500/40 transition-all duration-500 group relative overflow-hidden">
                
                {/* Glow efekat */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-[60px]" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-orange-500">
                      <Zap className="w-8 h-8" />
                    </div>
                    {p.badge && (
                      <span className="px-3 py-1 rounded-full bg-orange-600/20 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-600/30">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">{p.title}</h3>
                  <p className="text-white/50 mb-8 font-medium leading-relaxed h-12 line-clamp-2">
                    {p.description}
                  </p>
                  
                  <div className="text-5xl font-black text-white mb-10 tracking-tighter">€{p.price}</div>

                  <Button 
                    onClick={() => handleBuy(p._id)} 
                    disabled={loading === p._id}
                    className="w-full py-8 rounded-2xl bg-gradient-to-r from-orange-600 to-pink-600 font-black text-lg uppercase shadow-lg hover:opacity-90 transition-opacity"
                  >
                    {loading === p._id ? "UČITAVANJE..." : "KUPI ODMAH"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
