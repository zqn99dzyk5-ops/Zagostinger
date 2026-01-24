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
    /* KLJUČ: relative z-10 izvlači sajt IZNAD body::before sjenki iz index.css */
    <div className="relative z-10 min-h-screen text-white font-sans overflow-x-hidden">
      
      {/* 1. TOP BANNER */}
      <div className="w-full h-[300px] md:h-[450px] relative overflow-hidden">
        <img 
          src="/banner.jpg" 
          className="w-full h-full object-cover"
          alt="Continental Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
      </div>

      {/* 2. HERO + MUX VIDEO (Side by Side) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <h1 className="text-6xl md:text-[8.5rem] font-black tracking-tighter leading-[0.8] uppercase mb-8">
              Continental <br />
              <span className="text-orange-600">Academy</span>
            </h1>
            <p className="text-white/40 text-xl uppercase tracking-widest mb-10 font-bold">Dominacija u digitalnom svetu.</p>
            <Button 
              onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
              className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-8 rounded-2xl font-black text-xl uppercase"
            >
              KRENI ODMAH
            </Button>
          </div>

          <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video">
            <MuxPlayer
              playbackId="TVOJ_MUX_PLAYBACK_ID"
              metadata={{ video_title: 'Continental Intro' }}
              streamType="on-demand"
              primaryColor="#EA580C"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* 3. PROGRAMI */}
      <section id="programs" className="py-32 max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-black mb-16 uppercase tracking-tighter">Programi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((p) => (
            <div key={p._id} className="bg-[#0f0f0f]/80 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-orange-500/50 transition-all">
              <div className="h-60 overflow-hidden relative">
                <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent opacity-60" />
              </div>
              <div className="p-10 text-left">
                <h3 className="text-2xl font-black uppercase mb-2 tracking-tight">{p.name}</h3>
                <div className="text-4xl font-black text-orange-600 mb-8 tracking-tighter">€{p.price}</div>
                <Button 
                  onClick={() => handleJoin(p._id)} 
                  className="w-full py-7 rounded-2xl bg-white text-black hover:bg-orange-600 hover:text-white font-black text-lg transition-all uppercase"
                >
                  PRIDRUŽI SE
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-black mb-12 uppercase text-center tracking-tighter italic text-orange-600">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full p-8 text-left flex justify-between items-center uppercase font-black text-lg tracking-tight">
                {faq.question}
                {activeFaq === index ? <Minus className="text-orange-600" /> : <Plus />}
              </button>
              {activeFaq === index && (
                <div className="p-8 pt-0 text-white/50 text-lg border-t border-white/5 leading-relaxed font-medium">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. DISCORD */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-orange-600 rounded-[3.5rem] p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-6xl md:text-[6.5rem] font-black uppercase tracking-tighter mb-4 italic leading-none text-black">Zajednica</h2>
            <p className="text-black/80 text-2xl font-bold uppercase tracking-widest">Discord • 1,500+ Članova</p>
          </div>
          <Button className="bg-black text-white hover:bg-white hover:text-black px-12 py-10 rounded-3xl font-black text-2xl uppercase transition-all shadow-2xl">
            <MessageSquare className="mr-4 w-8 h-8" /> PRIDRUŽI SE
          </Button>
        </div>
      </section>

      {/* 6. STATS */}
      <section className="py-32 max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
        {[
          { label: 'Članova', value: '1,500+' },
          { label: 'Projekata', value: '120+' },
          { label: 'Zemalja', value: '15+' },
          { label: 'Ocena', value: '4.9/5' }
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
