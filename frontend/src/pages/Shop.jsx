import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Filter, Users, TrendingUp, Eye, 
  ChevronRight, Loader2, Check 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
    // Check for successful payment
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

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await shopAPI.getProducts(activeCategory === 'all' ? undefined : activeCategory);
        setProducts(response.data);
        
        analyticsAPI.trackEvent({ event_type: 'page_view', page: 'shop', metadata: { category: activeCategory } });
      } catch (error) {
        console.error('Error loading products:', error);
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'tiktok': return TrendingUp;
      case 'youtube': return Eye;
      case 'facebook': return Users;
      default: return ShoppingBag;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="shop-page">
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

        {/* Categories */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex gap-2 p-2 rounded-2xl bg-card border border-white/5">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'ghost'}
                size="sm"
                className={`gap-2 rounded-xl ${activeCategory === cat.id ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                data-testid={`category-${cat.id}`}
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
                  <Card className="luxury-card h-full flex flex-col group" data-testid={`product-card-${product.id}`}>
                    {/* Product Image */}
                    {product.images?.length > 0 ? (
                      <div className="aspect-video overflow-hidden rounded-t-2xl">
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-2xl flex items-center justify-center">
                        <CategoryIcon className="w-12 h-12 text-primary/50" />
                      </div>
                    )}
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary font-medium capitalize">
                          {product.category}
                        </span>
                        {product.is_available && (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500 font-medium">
                            Dostupno
                          </span>
                        )}
                      </div>
                      <CardTitle className="font-heading text-xl">{product.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col">
                      {/* Stats */}
                      {product.stats && Object.keys(product.stats).length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {Object.entries(product.stats).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="p-3 rounded-lg bg-white/5 text-center">
                              <p className="text-lg font-bold">{value}</p>
                              <p className="text-xs text-muted-foreground capitalize">{key}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-gradient-gold">
                            €{product.price}
                          </span>
                        </div>
                        
                        <Button 
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                          onClick={() => handlePurchase(product.id)}
                          disabled={!product.is_available}
                          data-testid={`buy-btn-${product.id}`}
                        >
                          {product.is_available ? 'Kupi sada' : 'Nije dostupno'}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="luxury-card text-center py-20">
            <CardContent>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="heading-3 mb-4">Nema dostupnih proizvoda</h3>
              <p className="text-muted-foreground">
                Trenutno nema proizvoda u ovoj kategoriji. Provjerite ponovo kasnije.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="luxury-card">
            <CardContent className="py-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-heading font-semibold mb-2">Verifikovani nalozi</h4>
                  <p className="text-sm text-muted-foreground">Svi nalozi su provjereni i spremni za monetizaciju</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-heading font-semibold mb-2">Instant isporuka</h4>
                  <p className="text-sm text-muted-foreground">Pristupni podaci šalju se odmah nakon kupovine</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-heading font-semibold mb-2">24/7 Podrška</h4>
                  <p className="text-sm text-muted-foreground">Naš tim je uvijek dostupan za pomoć</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Shop;
