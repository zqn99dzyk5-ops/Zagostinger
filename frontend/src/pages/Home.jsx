import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, ArrowRight, Users, Zap, Globe, Star, Plus, Minus, MessageSquare 
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

  // --- API CALLS (Tvoja originalna logika) ---
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
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    // FIX: Promijenjeno sa z-50 na z-10. 
    // Ovo osigurava da je iznad sjena (z-1), ali ISPOD Navbara (koji je vjerojatno z-40 ili z-50).
    <div className="relative z-10 min-h-screen text-white font-sans overflow-x-hidden selection:bg-orange-500/30">
      
      {/* --- POZADINA I SJENE --- */}
      {/* Crna pozadina u minus sloju */}
      <div className="fixed inset-0 bg-[#050505] -z-20" />
      
      {/* Glow efekti u minus sloju (ne smetaju klikanju) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-orange-600/10 blur-[120px] rounded-full opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-pink-600/10 blur-[120px] rounded-full opacity-50" />
      </div>

      {/* 1. TOP BANNER (Ispod Navbara) */}
      <div className="w-full h-[300px] md:h-[450px] relative overflow-hidden border-b border-white/5">
        <img 
          src={settings.hero_image_url || "https://i.ibb.co/Ktb6Frq/b2ec6e8f-c260-4f94-9c9b-24a67bb65af5.jpg"}
          className="w-full h-full object-cover opacity-95"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
      </div>

      {/* 2. HERO + MUX VIDEO */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Tekst */}
          <div className="text-left">
            <h1 className="text-5xl md:text-[8rem] font-black tracking-tighter leading-[0.9] uppercase mb-8 text-white drop-shadow-2xl">
              {settings.hero_headline ? settings.hero_headline : (
                <>
                  Continental <br />
                  <span className="text-orange-600">Academy</span>
                </>
              )}
            </h1>
            <p className="text-white/60 text-xl uppercase tracking-widest mb-10 font-bold">
              {settings.hero_subheadline || 'Dominacija u digitalnom svetu.'}
            </p>
            <Button 
              onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
              className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-8 rounded-2xl font-black text-xl uppercase shadow-[0_0_40px_rgba(234,88,12,0.4)] h-auto border border-orange-400/20"
            >
              KRENI ODMAH
            </Button>
          </div>

          {/* Mux Video */}
          <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video relative">
            <MuxPlayer
              playbackId={settings.hero_video_url || ""} 
              metadata={{ video_title: 'Continental Intro' }}
              streamType="on-demand"
              primaryColor="#EA580C"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* 3. PROGRAMI */}
      <section id="programs" className="py-32 max-w-7xl mx-auto px-6 relative">
        <h2 className="text-5xl font-black mb-16 uppercase tracking-tighter text-white drop-shadow-lg">Programi</h2>
        
        {programs.length === 0 ? (
          <div className="text-center text-white/50 py-10">Trenutno nema aktivnih programa.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {programs.map((p) => (
              <div key={p.id} className="bg-[#0f0f0f]/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-orange-500/50 transition-all flex flex-col hover:shadow-[0_0_50px_rgba(234,88,12,0.1)]">
                {/* Thumbnail */}
                <div className="h-64 overflow-hidden relative shrink-0">
                  <img 
                    src={p.thumbnail_url || p.image_url || '/placeholder.jpg'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={p.name} 
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                <div className="p-10 flex flex-col gap-4 flex-1">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">{p.name}</h3>
                  <div className="text-4xl font-black text-orange-600">€{p.price}</div>
                  
                  <ul className="space-y-3 my-4 flex-1">
                    {p.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/70 text-sm font-bold">
                        <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" /> 
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSubscribe(p.id)} 
                    disabled={loadingPay === p.id}
                    className="w-full py-8 rounded-2xl bg-white text-black hover:bg-orange-600 hover:text-white font-black text-lg transition-all uppercase h-auto"
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
      <section className="py-24 max-w-4xl mx-auto px-6 relative">
        <h2 className="text-4xl font-black mb-12 uppercase text-center tracking-tighter text-orange-600">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id || index} className="border border-white/10 rounded-2xl bg-[#0a0a0a]/60 backdrop-blur-sm">
              <button 
                onClick={() => setActiveFaq(activeFaq === index ? null : index)} 
                className="w-full p-6 text-left flex justify-between items-center font-black text-lg uppercase text-white hover:text-orange-500 transition-colors"
              >
                {faq.question}
                {activeFaq === index ? <Minus className="text-orange-600" /> : <Plus />}
              </button>
              {activeFaq === index && (
                <div className="p-6 pt-0 text-white/60 border-t border-white/5 font-medium leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. ZAJEDNICA / DISCORD */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-orange-600 to-orange-700 rounded-[3.5rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_0_80px_rgba(234,88,12,0.3)]">
          <div className="text-center md:text-left">
            <h2 className="text-5xl md:text-[6rem] font-black uppercase tracking-tighter mb-4 text-black leading-none italic">Discord Server</h2>
            <p className="text-black/80 text-xl md:text-2xl font-black uppercase tracking-widest">
              Discord • 1000+ Članova
            </p>
          </div>
          <a href={settings.discord_invite_url || '#'} target="_blank" rel="noreferrer">
            <Button className="bg-black text-white hover:bg-white hover:text-black px-12 py-10 rounded-3xl font-black text-xl md:text-2xl uppercase shadow-2xl transition-all h-auto">
              <MessageSquare className="mr-4 w-8 h-8" /> Pridruži se
            </Button>
          </a>
        </div>
      </section>

      {/* 6. STATS (Iznad footera) */}
      <section className="py-32 bg-black/80 backdrop-blur-xl border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Aktivnih Članova', value: '900+' },
            { label: 'Uspješnih Projekata', value: '120+' },
            { label: 'Zemalja', value: '15+' },
            { label: 'Ocena', value: '4.9/5' }
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-black mb-2 text-orange-600 tracking-tighter">{s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
};

export default Home;
