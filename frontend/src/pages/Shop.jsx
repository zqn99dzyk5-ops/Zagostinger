import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';

const Shop = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Učitavanje proizvoda iz baze
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Greška pri učitavanju shopa", err);
      }
    };
    fetchProducts();
  }, []);

  const handlePurchase = async (productId) => {
    if (!user) {
      toast.error("Moraš biti prijavljen da bi izvršio kupovinu.");
      return;
    }

    setLoading(productId);
    try {
      // Pozivamo tvoj novi payment route
      const res = await axios.post(`/api/payments/checkout/product?product_id=${productId}`);
      
      // Preusmjeravanje na Stripe Checkout
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Greška pri pokretanju plaćanja.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-heading font-bold mb-6"
        >
          Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Digital Shop</span>
        </motion.h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ekskluzivni nalozi, resursi i alati spremni za tvoj digitalni biznis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <motion.div 
            key={product._id}
            whileHover={{ y: -10 }}
            className="glass-card overflow-hidden group border border-white/5"
          >
            {/* Image Placeholder / Product Image */}
            <div className="relative h-48 bg-white/5 overflow-hidden">
              <img 
                src={product.image || 'https://via.placeholder.com/400x300'} 
                alt={product.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-orange-500/30">
                <span className="text-orange-400 font-bold">€{product.price}</span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-white">{product.title}</h3>
              <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                {product.description}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-pink-500" />
                  <span>Instant dostava na mail</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span>Full pristup nalogu</span>
                </div>
              </div>

              <Button 
                onClick={() => handlePurchase(product._id)}
                disabled={loading === product._id || !product.is_available}
                className="w-full py-6 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-lg shadow-orange-500/20"
              >
                {loading === product._id ? "Procesiranje..." : product.is_available ? "KUPI ODMAH" : "PRODATO"}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
