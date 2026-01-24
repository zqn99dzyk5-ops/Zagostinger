import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';

const Shop = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const products = [
    { id: '1', title: 'Aged BM Manager', price: 120, desc: 'High limit business manager.' }
  ];

  const handleBuy = async (id) => {
    if (!user) return toast.error("Log in!");
    setLoading(id);
    try {
      const res = await axios.post(`/api/payments/checkout/product?product_id=${id}`);
      if (res.data.checkout_url) window.location.href = res.data.checkout_url;
    } catch (e) { toast.error("Error!"); } finally { setLoading(false); }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white pt-32 px-6">
      <h1 className="text-5xl font-black text-center mb-16 uppercase">
        Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Shop</span>
      </h1>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {products.map(p => (
          <div key={p.id} className="bg-white/[0.02] border border-white/10 p-12 rounded-[2.5rem] relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[60px]" />
             <h3 className="text-2xl font-bold mb-4">{p.title}</h3>
             <div className="text-4xl font-black text-orange-400 mb-8">€{p.price}</div>
             <Button onClick={() => handleBuy(p.id)} disabled={loading === p.id} className="w-full py-8 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-600 font-bold">
                {loading === p.id ? "UČITAVANJE..." : "KUPI ODMAH"}
             </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Shop;
