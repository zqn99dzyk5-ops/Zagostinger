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
  const [results, setResults] = useState([]); // Ispravljeno: setResults
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [programsRes, faqsRes, resultsRes, settingsRes] = await Promise.all([
          programsAPI.getAll(),
          faqsAPI.getAll(),
          resultsAPI.getAll(),
          settingsAPI.get()
        ]);
        
        setPrograms(Array.isArray(programsRes?.data) ? programsRes.data : []);
        setFaqs(Array.isArray(faqsRes?.data) ? faqsRes.data : []);
        setResults(Array.isArray(resultsRes?.data) ? resultsRes.data : []);

        const settingsData = settingsRes?.data;
        setSettings(Array.isArray(settingsData) ? settingsData[0] : (settingsData || {}));

        if (analyticsAPI?.trackEvent) {
          analyticsAPI.trackEvent({ event_type: 'page_view', page: 'home', metadata: {} });
        }
      } catch (error) {
        console.error('Greška pri učitavanju podataka:', error);
        toast.error('Problem sa povezivanjem na server');
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
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Greška pri pokretanju plaćanja');
    }
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 overflow-hidden">
          {/* Overlay gradijent */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-10" />
          
          {/* BACKGROUND SLIKA - POPRAVKA ZA MOBILNI */}
          <img 
            src="https://images.unsplash.com/photo-1684488624316-774ea1824d97?auto=format&fit=crop&q=80"
            alt="Background"
            /* Na mobilnom (ispod 'md' brejkpointa) koristimo object-contain da se vidi CIJELA slika.
               Na desktopu (md:) koristimo object-cover da popuni ekran.
            */
            className="w-full h-full object-contain md:object-cover object-center opacity-40 md:opacity-20"
          />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-primary font-medium">Continental Academy</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
                {settings.hero_headline || 'Monetizuj svoj sadržaj. Pretvori znanje u prihod.'}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                {settings.hero_subheadline || 'Nauči kako da zaradiš na TikTok, YouTube i Facebook platformama sa našim ekspertnim vodičima.'}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to={user ? "/dashboard" : "/register"}>
                  <Button 
                    size="lg" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 shadow-lg shadow-primary/20"
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
              <div className="aspect-video rounded-2xl overflow-hidden bg-card border border-white/5 shadow-2xl">
                {settings.hero_video_url ? (
                  <video 
                    src={settings.hero_video_url} 
                    controls 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-card">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <Play className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground">Video dolazi uskoro</p>
                    </div>
                  </div>
                )}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-background/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Users className="w-6 h-6" />
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
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </section>
  
      {/* WHY US SECTION */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold tracking-wider uppercase text-sm">Prednosti</span>
            <h2 className="text-4xl font-bold mt-4">Zašto baš Continental Academy?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8 text-primary" />,
                title: "Dokazane Strategije",
                desc: "Naše metode nisu teorija, već sistemi koji trenutno donose profit na tržištu."
              },
              {
                icon: <Users className="w-8 h-8 text-primary" />,
                title: "Zajednica i Podrška",
                desc: "Pristup privatnom Discordu gdje direktno komuniciraš sa mentorima i kolegama."
              },
              {
                icon: <Check className="w-8 h-8 text-primary" />,
                title: "Praktično Znanje",
                desc: "Fokusiramo se na 'step-by-step' tutorijale koji te vode od nule do prve zarade."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/20 transition-colors"
              >
                <div className="mb-6 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS SECTION */}
      <section id="programs" className="py-24 lg:py-32 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold tracking-wider uppercase text-sm">Naši programi</span>
            <h2 className="text-4xl font-bold mt-4">Edukacijski programi</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, index) => (
              <motion.div
                key={program.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col bg-card border-white/5 hover:border-primary/20 transition-all overflow-hidden group">
                  <div className="aspect-video w-full overflow-hidden bg-muted relative">
                    {program.thumbnail_url ? (
                      <img 
                        src={program.thumbnail_url} 
                        alt={program.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <BookOpen className="w-10 h-10 text-primary/30" />
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{program.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{program.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-6">
                      <span className="text-3xl font-bold">€{program.price}</span>
                      <span className="text-muted-foreground text-sm">/mjesečno</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8 flex-1">
                      {program.features?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full rounded-full"
                      onClick={() => handleSubscribe(program.id)}
                    >
                      Pretplati se
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS GALLERY */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-12">
            <span className="text-primary font-semibold tracking-wider uppercase text-sm">Rezultati</span>
            <h2 className="text-4xl font-bold mt-4">Uspjesi naših studenata</h2>
        </div>
        
        <div className="relative flex overflow-x-auto gap-6 px-6 pb-8 no-scrollbar scroll-gallery">
          {(results.length > 0 ? results : []).map((result, index) => (
            <div key={index} className="flex-shrink-0 w-80 aspect-[4/5] rounded-2xl overflow-hidden relative group shadow-2xl border border-white/5">
              <img src={result.image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <p className="text-white font-medium">{result.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 lg:py-32 bg-card/30">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Često postavljana pitanja</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="bg-background px-6 rounded-xl border-white/5 shadow-sm">
                <AccordionTrigger className="hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* DISCORD CTA */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#5865F2]/20 flex items-center justify-center mx-auto mb-8">
            <MessageCircle className="w-10 h-10 text-[#5865F2]" />
          </div>
          <h2 className="text-4xl font-bold mb-6">Pridruži se zajednici</h2>
          <p className="text-muted-foreground mb-8 text-lg">Povežite se sa drugim studentima i dobijte podršku Continental Academy tima.</p>
          <a href={settings.discord_invite_url || '#'} target="_blank" rel="noreferrer">
            <Button size="lg" className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white rounded-full px-10">
              Pridruži se Discordu
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
