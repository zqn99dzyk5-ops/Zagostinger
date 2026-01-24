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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, faqRes] = await Promise.all([
          axios.get('/api/public/programs'),
          axios.get('/api/public/faqs')
        ]);
        setPrograms(progRes.data);
        setFaqs(faqRes.data);
      } catch (err) {
        console.error("Greška pri učitavanju:", err);
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
    <div className="bg-[#050505] min-h-screen text-white font-sans relative">
      
      {/* GLOBALNE AMBIJENTALNE SJENE (Iza svega) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 blur-[150px] rounded-full" />
      </div>

      {/* 1. TOP BANNER */}
      <div className="w-full h-[300px] md:h-[450px] relative overflow-hidden border-b border-white/5">
        <img 
          src="/banner.jpg" 
          className="w-full h-full object-cover opacity-80"
          alt="Continental Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/20 to-[#050505]" />
      </div>

      {/* 2. HERO + MUX VIDEO */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter leading-[0.8] uppercase mb-8">
              Continental <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Academy</span>
            </h1>
            <p className="text-white/50 text-xl uppercase tracking-[0.3em] mb-12 font-bold">Dominacija.</p>
            <Button 
              onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
              className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-8 rounded-2xl font-black text-xl uppercase shadow-[0_20px_50px_rgba(234,88,12,0.3)]"
            >
              KRENI ODMAH
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-black aspect-video">
              <MuxPlayer
                playbackId="TVOJ_MUX_PLAYBACK_ID"
                metadata={{ video_title: 'Continental Intro' }}
                streamType="on-demand"
                primaryColor="#EA580C"
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. PROGRAMI */}
      <section id="programs" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <h2 className="text-5xl font-black mb-16 uppercase tracking-tighter inline-block border-b-4 border-orange-600">Programi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {programs.map((p) => (
            <div key={p._id} className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-orange-500/50 transition-all duration-500 group">
              <div className="h-60 overflow-hidden relative">
                <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
              </div>
              <div className="p-10">
                <h3 className="text-3xl font-black uppercase mb-2 tracking-tight">{p.name}</h3>
                <div className="text-5xl font-black text-orange-500 mb-8 tracking-tighter">€{p.price}</div>
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
      </section>

      {/* 4. FAQ */}
      <section className="py-24 max-w-4xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl font-black mb-16 uppercase text-center tracking-tighter italic text-orange-600">Česta Pitanja</h2>
        <div className="grid gap-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-sm overflow-hidden hover:bg-white/[0.04] transition-all">
              <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full p-8 text-left flex justify-between items-center uppercase font-black text-lg tracking-tight">
                {faq.question}
                <div className={`transition-transform duration-300 ${activeFaq === index ? 'rotate-45 text-orange-500' : ''}`}>
                  <Plus className="w-6 h-6" />
                </div>
              </button>
              {activeFaq === index && (
                <div className="p-8 pt-0 text-white/50 text-lg border-t border-white/5 font-medium leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. DISCORD BOX */}
      <section className="py-20 max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-[3.5rem] p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_0_100px_rgba(234,88,12,0.2)]">
          <div className="text-center md:text-left">
            <h2 className="text-6xl md:text-[7rem] font-black uppercase tracking-tighter mb-4 text-black leading-none italic">Zajednica</h2>
            <p className="text-black/80 text-2xl font-black uppercase tracking-widest">Discord • 1,500+ Članova</p>
          </div>
          <Button className="bg-black text-white hover:bg-white hover:text-black px-12 py-10 rounded-3xl font-black text-2xl uppercase transition-all shadow-2xl">
            <MessageSquare className="mr-4 w-8 h-8" /> PRIDRUŽI SE
          </Button>
        </div>
      </section>

      {/* 6. STATS */}
      <section className="py-32 max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
        {[
          { label: 'Aktivnih Članova', value: '1,500+' },
          { label: 'Uspješnih Projekata', value: '120+' },
          { label: 'Zemalja', value: '15+' },
          { label: 'Ocena Članova', value: '4.9/5' }
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-6xl font-black mb-2 tracking-tighter text-orange-500">{s.value}</div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-white/20 font-black">{s.label}</div>
          </div>
        ))}
      </section>

    </div>
  );
};

export default Home;
