import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, ChevronRight, BookOpen, Users, MessageCircle, 
  TrendingUp, Check, ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { programsAPI, faqsAPI, resultsAPI, settingsAPI, analyticsAPI, paymentsAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

const Home = () => {
  const [programs, setPrograms] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [results, setResults] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [programsRes, faqsRes, resultsRes, settingsRes] = await Promise.all([
          programsAPI.getAll(),
          faqsAPI.getAll(),
          resultsAPI.getAll(),
          settingsAPI.get()
        ]);
        setPrograms(programsRes.data);
        setFaqs(faqsRes.data);
        setResults(resultsRes.data);
        setSettings(settingsRes.data);

        // Track page view
        analyticsAPI.trackEvent({ event_type: 'page_view', page: 'home', metadata: {} });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubscribe = async (programId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await paymentsAPI.createSubscriptionCheckout(programId);
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Greška pri pokretanju plaćanja');
    }
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          <img 
            src="https://images.unsplash.com/photo-1684488624316-774ea1824d97?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-primary font-medium">Nova edukacija dostupna</span>
              </div>
              
              <h1 className="heading-1 text-foreground">
                {settings.hero_headline || 'Monetizuj svoj sadržaj. Pretvori znanje u prihod.'}
              </h1>
              
              <p className="body-text max-w-xl">
                {settings.hero_subheadline || 'Nauči kako da zaradiš na TikTok, YouTube i Facebook platformama sa našim ekspertnim vodičima.'}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to={user ? "/dashboard" : "/register"}>
                  <Button 
                    size="lg" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 gold-glow"
                    data-testid="hero-cta-primary"
                  >
                    Započni edukaciju
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href="#programs">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full px-8 border-white/10 hover:bg-white/5"
                    data-testid="hero-cta-secondary"
                  >
                    Pogledaj programe
                  </Button>
                </a>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden luxury-card">
                {settings.hero_video_url ? (
                  <video 
                    src={settings.hero_video_url} 
                    controls 
                    className="w-full h-full object-cover"
                    poster="https://images.unsplash.com/photo-1600140094209-bea02144c09c?w=800"
                  />
                ) : (
                  <div className="w-full h-full bg-card flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <Play className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground">Video dolazi uskoro</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Floating stat card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-6 -left-6 glass-card rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1,500+</p>
                    <p className="text-sm text-muted-foreground">Aktivnih studenata</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-24 lg:py-32 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="small-caps text-primary">Naši programi</span>
            <h2 className="heading-2 mt-4">Edukacijski programi</h2>
            <p className="body-text mt-4 max-w-2xl mx-auto">
              Izaberite program koji odgovara vašim ciljevima i započnite putovanje ka uspješnoj monetizaciji.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="luxury-card h-full flex flex-col" data-testid={`program-card-${index}`}>
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-heading text-xl">{program.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {program.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gradient-gold">
                        €{program.price}
                      </span>
                      <span className="text-muted-foreground">/mjesečno</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8 flex-1">
                      {program.features?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                      onClick={() => handleSubscribe(program.id)}
                      data-testid={`subscribe-btn-${index}`}
                    >
                      Pretplati se
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Otkazivanje putem supporta
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Gallery */}
      <section className="py-24 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="small-caps text-primary">Rezultati</span>
            <h2 className="heading-2 mt-4">Uspjesi naših studenata</h2>
          </motion.div>
        </div>
        
        <div className="relative">
          <div className="flex gap-6 auto-scroll">
            {[...results, ...results].map((result, index) => (
              <div 
                key={`${result.id}-${index}`}
                className="flex-shrink-0 w-80 aspect-[4/5] rounded-2xl overflow-hidden luxury-card group"
              >
                <div className="relative w-full h-full">
                  <img 
                    src={result.image_url} 
                    alt={result.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-lg font-medium">{result.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Continental */}
      <section className="py-24 lg:py-32 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="small-caps text-primary">Zašto mi</span>
            <h2 className="heading-2 mt-4">Zašto Continental Academy?</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, title: 'Strukturirana edukacija', desc: 'Korak po korak vodič do uspjeha' },
              { icon: TrendingUp, title: 'Realne metode', desc: 'Provjerene strategije monetizacije' },
              { icon: MessageCircle, title: '24/7 Discord podrška', desc: 'Uvijek dostupna zajednica' },
              { icon: Users, title: 'Ažurirane strategije', desc: 'Konstantno nove tehnike' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="small-caps text-primary">FAQ</span>
            <h2 className="heading-2 mt-4">Često postavljana pitanja</h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4" data-testid="faq-accordion">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="luxury-card px-6 border-white/5"
              >
                <AccordionTrigger className="text-left font-heading hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Discord CTA */}
      <section className="py-24 lg:py-32 bg-card/30">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-2xl bg-[#5865F2]/20 flex items-center justify-center mx-auto mb-8">
              <MessageCircle className="w-10 h-10 text-[#5865F2]" />
            </div>
            <h2 className="heading-2 mb-6">Pridruži se zajednici</h2>
            <p className="body-text max-w-2xl mx-auto mb-8">
              Povežite se sa drugim studentima, dijelite iskustva i dobijte podršku kada vam zatreba.
            </p>
            <a 
              href={settings.discord_invite_url || 'https://discord.gg/placeholder'} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button 
                size="lg" 
                className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white rounded-full px-8"
                data-testid="discord-cta-btn"
              >
                Pridruži se Discord zajednici
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
