import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, TrendingUp, Eye, Users, 
  ChevronRight, Loader2, Check 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { shopAPI, paymentsAPI, analyticsAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  // Učitavanje proizvoda svaki put kada se promijeni kategorija
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Šaljemo kategoriju API-ju ako nije "all"
        const categoryFilter = activeCategory === 'all' ? undefined : activeCategory;
        const response = await shopAPI.getProducts(categoryFilter);
        
        // Osiguravamo da su podaci niz
        const data = Array.isArray(response.data) ? response.data : [];
        setProducts(data);
        
        analyticsAPI.trackEvent({ 
          event_type: 'page_view', 
          page: 'shop', 
          metadata: { category: activeCategory } 
        });
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Greška pri učitavanju proizvoda');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [activeCategory]);

  const handlePurchase = async (productId) => {
    if (!user) {
      toast.error('Morate biti prijavljeni za kupovinu');
      return;
    }
    
    try {
      const response = await paymentsAPI.createProductCheckout(productId);
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Greška pri pokretanju plaćanja');
    }
  };

  const categories = [
    { id: 'all', label: 'Sve', icon: ShoppingBag },
    { id: 'tiktok', label: 'TikTok', icon: TrendingUp },
    { id: 'youtube', label: 'YouTube', icon: Eye },
    { id: 'facebook', label: 'Facebook', icon: Users },
  ];

  // Mapiranje ikona na osnovu taga/kategorije
  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase();
    if (cat?.includes('tiktok')) return TrendingUp;
    if (cat?.includes('youtube')) return Eye;
    if (cat?.includes('facebook')) return Users;
    return ShoppingBag;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="small-caps text-primary">Marketplace</span>
          <h1 className="heading-2 mt-4">Shop</h1>
          <p className="body-text mt-4 max-w-2xl mx-auto">
            Kupite monetizirane naloge i započnite zarađivanje odmah.
          </p>
        </motion.div>

        {/* Categories Selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex gap-2 p-2 rounded-2xl bg-card border border-white/5 overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'ghost'}
                size="sm"
                className={`gap-2 rounded-xl whitespace-nowrap ${
                  activeCategory === cat.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : ''
                }`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
              const CategoryIcon = getCategoryIcon(product.category);
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="luxury-card h-full flex flex-col group overflow-hidden">
                    {/* Product Image - Popravljeno da koristi image_url iz Admina */}
                    <div className="aspect-video overflow-hidden relative">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <CategoryIcon className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      {/* Cijena Tag preko slike */}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
                        <span className="text-primary font-bold">€{product.price}</span>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold uppercase tracking-wider">
                          {product.category || 'Nalog'}
                        </span>
                        {/* Ako nema is_available polja, podrazumijevamo da je dostupno ako je u bazi */}
                        {product.is_available !== false && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-500/10 text-green-500 font-bold uppercase tracking-wider">
                            Dostupno
                          </span>
                        )}
                      </div>
                      <CardTitle className="font-heading text-xl group-hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 min-h-[40px]">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col pt-4">
                      {/* Stats - Prikazuje statuse ako ih uneseš u JSON formatu ili bazi */}
                      {product.stats && (
                        <div className="grid grid-cols-2 gap-2 mb-6">
                          {Object.entries(product.stats).map(([key, value]) => (
                            <div key={key} className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                              <p className="text-sm font-bold">{value}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{key}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-auto pt-4">
                        <Button 
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold py-6 transition-all active:scale-95"
                          onClick={() => handlePurchase(product.id)}
                          disabled={product.is_available === false}
                        >
                          {product.is_available !== false ? 'KUPI ODMAH' : 'PRODATO'}
                          <ChevronRight className="w-5 h-5 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-3xl border border-white/5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Nema rezultata</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Trenutno nema dostupnih naloga u kategoriji "{activeCategory}".
              </p>
              <Button variant="link" onClick={() => setActiveCategory('all')} className="mt-4 text-primary">
                Prikaži sve proizvode
              </Button>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Check, title: 'Verifikovani nalozi', desc: 'Svaki nalog prolazi detaljnu provjeru.' },
            { icon: TrendingUp, title: 'Brza Isporuka', desc: 'Podaci stižu u roku od par sati.' },
            { icon: Users, title: 'Podrška 24/7', desc: 'Dostupni smo na Discordu za sve upite.' }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-white/5 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
