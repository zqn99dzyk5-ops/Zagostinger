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
  const [programs, setPrograms] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [results, setResults] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [activeFaq, setActiveFaq] = useState(null);
  const [loadingPay, setLoadingPay] = useState(null);

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
        console.error('Greška:', error);
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
    /* FIX: 'isolate' pravi novi stacking context. 
       To znači da sve unutar ovog div-a (glow i sadržaj) ostaje iznad pozadine definisane u index.css 
    */
    <div className="relative min-h-screen bg-[#050505] text-white font-sans isolate selection:bg-pink-500/30">
      
      {/* --- GLOW EFEKTI (PODIGNUTI NA z-[1]) --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        {/* Narandžasti Glow - Jači intenzitet */}
        <div className="absolute top-[-5%] left-[-5%] w-[70vw] h-[70vw] bg-orange-600/25 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
        
        {/* Rozi Glow - Jači intenzitet */}
        <div className="absolute bottom-[-5%] right-[-5%] w-[70vw] h-[70vw] bg-pink-600/20 blur-[120px] rounded-full mix-blend-screen" />
        
        {/* Središnji plavi/ljubičasti za dubinu */}
        <div className="absolute top-[30%] left-[15%] w-[50vw] h-[50vw] bg-indigo-900/15 blur-[150px] rounded-full" />
      </div>

      {/* --- SADRŽAJ (PODIGNUT NA z-[10]) --- */}
      <div className="relative z-[10]">

        {/* 1. TOP BANNER */}
        <div className="w-full relative mt-20 border-b border-white/5 bg-[#050505] overflow-hidden shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <img 
              src={settings.hero_image_url || "https://i.ibb.co/Ktb6Frq/b2ec6e8f-c260-4f94-9c9b-24a67bb65af5.jpg"}
              className="w-full h-auto md:max-h-[550px] object-contain block mx-auto opacity-90"
              alt="Banner"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />
        </div>

        {/* 2. HERO SEKCIJA */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-white uppercase italic">
                {settings.hero_headline ? settings.hero_headline : (
                  <>
                    Continental <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600">
                      Academy
                    </span>
                  </>
                )}
              </h1>
              <p className="text-white/70 text-lg md:text-xl font-bold uppercase tracking-widest mb-10 max-w-lg">
                {settings.hero_subheadline || 'Dominacija u digitalnom svetu.'}
              </p>
              <Button 
                onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-orange-600 to-pink-600 hover:scale-105 text-white px-10 py-8 rounded-2xl font-black text-xl uppercase shadow-[0_0_40px_rgba(234,88,12,0.4)] transition-all h-auto"
              >
                KRENI ODMAH <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </div>

            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-600 rounded-[2.5rem] opacity-20 group-hover:opacity-40 transition duration-500 blur-md"></div>
              <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-black">
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
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase italic">Programi</h2>
            <div className="h-2 w-24 bg-gradient-to-r from-orange-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          {programs.length === 0 ? (
            <div className="text-center text-white/50 py-10">Trenutno nema aktivnih programa.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {programs.map((p) => (
                <div key={p.id} className="bg-[#0f0f0f]/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden hover:border-orange-500/50 transition-all duration-300 flex flex-col hover:shadow-[0_0_50px_rgba(234,88,12,0.1)] group">
                  <div className="h-64 overflow-hidden relative shrink-0">
                    <img 
                      src={p.thumbnail_url || p.image_url || '/placeholder.jpg'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={p.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent opacity-60" />
                  </div>
                  <div className="p-10 flex flex-col gap-5 flex-1">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white">{p.name}</h3>
                    <div className="text-4xl font-black text-orange-500 italic">€{p.price}</div>
                    <ul className="space-y-4 my-4 flex-1">
                      {p.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-white/70 text-sm font-bold uppercase">
                          <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> 
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handleSubscribe(p.id)} 
                      disabled={loadingPay === p.id}
                      className="w-full py-8 rounded-2xl bg-white text-black hover:bg-orange-600 hover:text-white font-black text-xl transition-all uppercase h-auto"
                    >
                      {loadingPay === p.id ? "..." : "PRIDRUŽI SE"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. FAQ */}
        <section className="py-24 max-w-4xl mx-auto px-6 italic">
          <h2 className="text-4xl font-black mb-12 text-center tracking-tighter uppercase text-orange-600">Česta Pitanja</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.id || index} className="border border-white/10 rounded-2xl bg-[#0a0a0a]/40 backdrop-blur-md overflow-hidden transition-colors">
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)} 
                  className="w-full p-8 text-left flex justify-between items-center font-black text-xl uppercase text-white group"
                >
                  <span className="group-hover:text-orange-500 transition-colors">{faq.question}</span>
                  <span className={`bg-white/5 p-2 rounded-full transition-colors ${activeFaq === index ? 'text-pink-500 bg-pink-500/10' : 'text-white/50'}`}>
                    {activeFaq === index ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="p-8 pt-0 text-white/60 border-t border-white/5 font-bold leading-relaxed not-italic uppercase text-sm tracking-widest">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. ZAJEDNICA */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[3.5rem] p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_0_80px_rgba(234,88,12,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-pink-700 opacity-90" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-5xl md:text-8xl font-black mb-4 text-black uppercase tracking-tighter italic leading-none">Zajednica</h2>
              <p className="text-black font-black text-2xl uppercase tracking-widest">1,500+ ČLANOVA</p>
            </div>
            <a href={settings.discord_invite_url || '#'} target="_blank" rel="noreferrer" className="relative z-10">
              <Button className="bg-black text-white hover:bg-white hover:text-black px-12 py-10 rounded-[2rem] font-black text-2xl uppercase shadow-2xl transition-all h-auto flex items-center gap-4">
                <MessageSquare className="w-10 h-10" /> UĐI U GRUPU
              </Button>
            </a>
          </div>
        </section>

        {/* 6. STATS */}
        <section className="py-32 bg-black/40 border-t border-white/5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Aktivnih Članova', value: '1,500+' },
              { label: 'Uspješnih Projekata', value: '120+' },
              { label: 'Zemalja', value: '15+' },
              { label: 'Ocena', value: '4.9/5' }
            ].map((s, i) => (
              <div key={i}>
                <div className="text-5xl md:text-7xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 italic tracking-tighter">{s.value}</div>
                <div className="text-xs uppercase tracking-[0.4em] text-white/30 font-black">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
