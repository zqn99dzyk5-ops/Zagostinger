import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Users, Zap, Globe, Star, Plus, Minus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';
import MuxPlayer from '@mux/mux-player-react';

const Home = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  // POVLAČENJE PODATAKA IZ ADMIN PANELA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, faqRes] = await Promise.all([
          axios.get('/api/public/programs'), // Ovo gađa tvoj public.js
          axios.get('/api/public/faqs')
        ]);
        setPrograms(progRes.data);
        setFaqs(faqRes.data);
      } catch (err) {
        console.error("Database connection error:", err);
      }
    };
    fetchData();
  }, []);

  const handleJoin = async (id) => {
    if (!user) return toast.error("Prijavi se prvo.");
    setLoading(id);
    try {
      const res = await axios.post(`/api/payments/checkout/subscription?program_id=${id}`);
      if (res.data.checkout_url) window.location.href = res.data.checkout_url;
    } catch (err) {
      toast.error("Greška pri plaćanju.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // KLJUČNA PROMENA: z-50 i relative osiguravaju da je ovo IZNAD sjena iz index.css
    <div className="relative z-50 bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden">
      
      {/* 1. TOP BANNER */}
      <div className="w-full h-[350px] md:h-[500px] relative overflow-hidden">
        <img 
          src="/banner.jpg" 
          className="w-full h-full object-cover opacity-60"
          alt="Continental Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
      </div>

      {/* 2. HERO + MUX VIDEO */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter leading-[0.8] uppercase mb-10">
              Continental <br />
              <span className="text-orange-600">Academy</span>
            </h1>
            <p className="text-white/50 text-xl uppercase tracking-widest mb-10 font-bold">Dominacija u digitalnom svetu.</p>
            <Button 
              onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
              className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-8 rounded-2xl font-black text-xl uppercase shadow-xl"
            >
              KRENI ODMAH
            </Button>
          </div>

          <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video relative z-50">
            <MuxPlayer
              playbackId="TVOJ_MUX_PLAYBACK_ID" // Ubaci svoj ID
              metadata={{ video_title: 'Continental Intro' }}
              streamType="on-demand"
              primaryColor="#EA580C"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* 3. PROGRAMI (Dynamic from DB) */}
      <section id="programs" className="py-32 max-w-7xl mx-auto px-6 relative z-50">
        <h2 className="text-5xl font-black mb-16 uppercase tracking-tighter">Programi</h2>
        
        {programs.length === 0 ? (
          <p className="text-white/50">Učitavanje programa...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {programs.map((p) => (
              <div key={p._id} className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-orange-500/50 transition-all">
                <div className="h-64 overflow-hidden relative">
                  {/* Prikazuje sliku iz baze */}
                  <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="p-10 flex flex-col gap-4">
                  <h3 className="text-3xl font-black uppercase tracking-tight">{p.name}</h3>
                  <div className="text-5xl font-black text-orange-500">€{p.price}</div>
                  
                  {/* Features iz baze */}
                  <ul className="space-y-3 my-4">
                    {p.features?.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/70 text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4 text-orange-500" /> {f}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleJoin(p._id)} 
                    disabled={loading === p._id}
                    className="w-full py-8 rounded-2xl bg-white text-black hover:bg-orange-600 hover:text-white font-black text-lg transition-all uppercase"
                  >
                    PRIDRUŽI SE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. FAQ (Dynamic from DB) */}
      <section className="py-24 max-w-4xl mx-auto px-6 relative z-50">
        <h2 className="text-4xl font-black mb-12 uppercase text-center tracking-tighter text-orange-600">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq._id || index} className="border border-white/10 rounded-2xl bg-[#0a0a0a]">
              <button 
                onClick={() => setActiveFaq(activeFaq === index ? null : index)} 
                className="w-full p-6 text-left flex justify-between items-center font-black text-lg uppercase"
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

      {/* 5. DISCORD */}
      <section className="py-20 px-6 relative z-50">
        <div className="max-w-7xl mx-auto bg-orange-600 rounded-[3.5rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-6xl md:text-[7rem] font-black uppercase tracking-tighter mb-4 text-black leading-none italic">Zajednica</h2>
            <p className="text-black/80 text-2xl font-black uppercase tracking-widest">Discord • 1,500+ Članova</p>
          </div>
          <Button className="bg-black text-white hover:bg-white hover:text-black px-12 py-10 rounded-3xl font-black text-2xl uppercase shadow-2xl transition-all">
            <MessageSquare className="mr-4 w-8 h-8" /> PRIDRUŽI SE
          </Button>
        </div>
      </section>

      {/* 6. STATS */}
      <section className="py-32 bg-black border-t border-white/5 relative z-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Aktivnih Članova', value: '800+' },
            { label: 'Uspješnih Projekata', value: '120+' },
            { label: 'Zemalja', value: '15+' },
            { label: 'Ocena', value: '4.9/5' }
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-black mb-2 text-orange-500 tracking-tighter">{s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
