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
    <div className="bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden">
      
      {/* 1. TOP BANNER */}
      <div className="w-full h-[350px] md:h-[500px] relative overflow-hidden">
        <img 
          src="/banner.jpg" 
          className="w-full h-full object-cover opacity-50"
          alt="Continental Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
      </div>

      {/* 2. HERO + MUX VIDEO (Side by Side) */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Levo: Naslov */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            className="text-left"
          >
            <h1 className="text-6xl md:text-[9rem] font-black tracking-[ -0.05em] leading-[0.8] uppercase mb-10">
              Continental <br />
              <span className="text-orange-600">Academy</span>
            </h1>
            <p className="text-white/40 text-xl uppercase tracking-[0.2em] mb-12 font-medium">
              Dominacija u digitalnom svetu.
            </p>
            <Button 
              onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
              className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-9 rounded-2xl font-black text-2xl uppercase shadow-2xl transition-all active:scale-95"
            >
              KRENI ODMAH
            </Button>
          </motion.div>

          {/* Desno: MUX PLAYER */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(234,88,12,0.1)] bg-black aspect-video"
          >
            <MuxPlayer
              playbackId="TVOJ_MUX_PLAYBACK_ID" // Ubaci svoj ID ovde
              metadata={{ video_title: 'Continental Intro' }}
              streamType="on-demand"
              primaryColor="#EA580C"
              className="w-full h-full"
            />
          </motion.div>
        </div>
      </section>

      {/* 3. PROGRAMI */}
      <section id="programs" className="py-32 max-w-7xl mx-auto px-6 border-t border-white/5">
        <h2 className="text-5xl font-black text-left mb-20 uppercase tracking-tighter">Programi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {programs.map((p) => (
            <div key={p._id} className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] overflow-hidden group hover:border-orange-500/40 transition-all duration-500">
              <div className="h-64 overflow-hidden relative">
                <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60" />
              </div>
              <div className="p-10">
                <h3 className="text-3xl font-black uppercase mb-4 tracking-tight">{p.name}</h3>
                <div className="text-5xl font-black text-orange-600 mb-10 tracking-tighter">€{p.price}</div>
                <Button 
                  onClick={() => handleJoin(p._id)} 
                  disabled={loading === p._id}
                  className="w-full py-8 rounded-2xl bg-white text-black hover:bg-orange-600 hover:text-white font-black text-lg transition-all uppercase"
                >
                  {loading === p._id ? "UČITAVANJE..." : "PRIDRUŽI SE"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="py-32 max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-black mb-16 uppercase text-center tracking-tighter">Česta Pitanja</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-white/5 rounded-[2rem] bg-white/[0.02] overflow-hidden">
              <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full p-8 text-left flex justify-between items-center uppercase font-black text-lg">
                {faq.question}
                {activeFaq === index ? <Minus className="text-orange-600" /> : <Plus />}
              </button>
              {activeFaq === index && <div className="p-8 pt-0 text-white/50 text-lg border-t border-white/5 font-light">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* 5. DISCORD BOX */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="bg-orange-600 rounded-[4rem] p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full" />
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-6xl md:text-[6rem] font-black uppercase tracking-tighter mb-6 italic leading-none text-black">Zajednica</h2>
            <p className="text-black/80 text-2xl font-bold uppercase tracking-tight">Preko 1,500 članova te čeka.</p>
          </div>
          <Button className="bg-black text-white hover:bg-white hover:text-black px-12 py-10 rounded-3xl font-black text-2xl uppercase shadow-2xl transition-all relative z-10">
            <MessageSquare className="mr-4 w-8 h-8" /> UĐI U GRUPU
          </Button>
        </div>
      </section>

      {/* 6. STATS (POSLEDNJI ELEMENT PRE FOOTERA) */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-16">
          {[
            { label: 'Aktivnih Članova', value: '1,500+' },
            { label: 'Uspješnih Projekata', value: '120+' },
            { label: 'Zemalja Balkana', value: '15+' },
            { label: 'Srednja Ocena', value: '4.9/5' }
          ].map((s, i) => (
            <div key={i} className="text-center group">
              <div className="text-6xl font-black mb-3 tracking-tighter group-hover:text-orange-600 transition-colors">{s.value}</div>
              <div className="text-[11px] uppercase tracking-[0.4em] text-white/20 font-black">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
