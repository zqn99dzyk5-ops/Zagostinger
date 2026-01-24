import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, ArrowRight, Users, Zap, Globe, Star, Plus, Minus, MessageSquare, Play 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { programsAPI, faqsAPI, resultsAPI, settingsAPI, analyticsAPI, paymentsAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import MuxPlayer from '@mux/mux-player-react';

const Home = () => {
  // --- STATE ---
  const [programs, setPrograms] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [results, setResults] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [activeFaq, setActiveFaq] = useState(null);
  const [loadingPay, setLoadingPay] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // --- API LOAD ---
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
        console.error('Greška:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- PLAĆANJE ---
  const handleSubscribe = async (programId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoadingPay(programId);
    try {
      const response = await paymentsAPI.createSubscriptionCheckout(programId);
      if (response?.data?.url) window.location.href = response.data.url;
    } catch (error) {
      toast.error('Greška pri plaćanju');
    } finally {
      setLoadingPay(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-pink-500/30">
      
      {/* --- GLOW EFEKTI (SLOJ 0) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-orange-600/20 blur-[120px] rounded-full mix-blend-screen opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-pink-600/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />
      </div>

      <div className="relative z-10">

        {/* 1. TOP BANNER - POPRAVLJENO DA NE SIJEČE SLIKU */}
        <div className="w-full relative mt-20 border-b border-white/5 bg-black overflow-hidden shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <img 
              src={settings.hero_image_url || "https://i.ibb.co/Ktb6Frq/b2ec6e8f-c260-4f94-9c9b-24a67bb65af5.jpg"}
              // md:max-h-[500px] sprečava da slika bude ogromna na kompjuteru
              // object-contain osigurava da se slika cijela vidi (nema cropanja)
              // w-full h-auto osigurava responzivnost
              className="w-full h-auto md:max-h-[500px] object-contain block mx-auto opacity-90"
              alt="Banner"
            />
          </div>
          {/* Gradient sjena za ljepši prijelaz */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />
        </div>

        {/* 2. HERO SEKCIJA */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-white">
                {settings.hero_headline ? settings.hero_headline : (
                  <>
                    Continental <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                      Academy
                    </span>
                  </>
                )}
              </h1>
              <p className="text-white/60 text-lg md:text-xl font-medium leading-relaxed mb-8 max-w-lg">
                {settings.hero_subheadline || 'Dominacija u digitalnom svetu. Nauči vještine budućnosti.'}
              </p>
              <Button 
                onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-90 text-white px-8 py-6 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all transform hover:scale-105"
              >
                KRENI ODMAH <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-600 rounded-3xl opacity-20 group-hover:opacity-40 transition duration-500 blur-sm"></div>
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black">
                <MuxPlayer
                  playbackId={settings.hero_video_url || ""} 
                  metadata={{ video_title: 'Continental Intro' }}
                  streamType="on-demand"
                  primaryColor="#ec4899"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. PROGRAMI */}
        <section id="programs" className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Naši Programi</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          {programs.length === 0 ? (
            <div className="text-center text-white/50 py-10">Trenutno nema aktivnih programa.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {programs.map((p) => (
                <div key={p.id} className="bg-[#0f0f0f]/60 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-pink-500/30 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-pink-500/10 group">
                  <div className="h-56 overflow-hidden relative shrink-0">
                    <img 
                      src={p.thumbnail_url || p.image_url || '/placeholder.jpg'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt={p.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent opacity-60" />
                  </div>
                  <div className="p-8 flex flex-col gap-4 flex-1">
                    <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-pink-500 transition-colors">
                      {p.name}
                    </h3>
                    <div className="text-3xl font-bold text-white">€{p.price}</div>
                    <ul className="space-y-3 my-4 flex-1">
                      {p.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-white/70 text-sm font-medium">
                          <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> 
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handleSubscribe(p.id)} 
                      disabled={loadingPay === p.id}
                      className="w-full py-6 rounded-xl bg-white text-black hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-600 hover:text-white font-bold text-base transition-all uppercase tracking-wide"
                    >
                      {loadingPay === p.id ? "PROCESIRANJE..." : "PRIDRUŽI SE"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. FAQ */}
        <section className="py-24 max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center tracking-tight">Česta Pitanja</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.id || index} className="border border-white/10 rounded-2xl bg-[#0a0a0a]/60 backdrop-blur-sm overflow-hidden hover:bg-white/[0.02] transition-colors">
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)} 
                  className="w-full p-6 text-left flex justify-between items-center font-bold text-lg text-white group"
                >
                  <span className="group-hover:text-pink-500 transition-colors">{faq.question}</span>
                  <span className={`bg-white/5 p-2 rounded-full transition-colors ${activeFaq === index ? 'text-pink-500 bg-pink-500/10' : 'text-white/50'}`}>
                    {activeFaq === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="p-6 pt-0 text-white/60 border-t border-white/5 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. ZAJEDNICA */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-pink-700 opacity-90" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">Zajednica</h2>
              <p className="text-white/90 text-xl font-medium tracking-wide">Pridruži se Discord serveru sa 1,500+ članova.</p>
            </div>
            <a href={settings.discord_invite_url || '#'} target="_blank" rel="noreferrer" className="relative z-10">
              <Button className="bg-white text-black hover:bg-black hover:text-white px-10 py-8 rounded-full font-bold text-lg shadow-2xl transition-all flex items-center gap-3">
                <MessageSquare className="w-6 h-6" /> UĐI U GRUPU
              </Button>
            </a>
          </div>
        </section>

        {/* 6. STATS */}
        <section className="py-24 bg-black/50 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Aktivnih Članova', value: '1,500+' },
              { label: 'Uspješnih Projekata', value: '120+' },
              { label: 'Zemalja', value: '15+' },
              { label: 'Ocena', value: '4.9/5' }
            ].map((s, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">{s.value}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
