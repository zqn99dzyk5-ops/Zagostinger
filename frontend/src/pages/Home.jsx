import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, ArrowRight, Users, Zap, Globe, Star, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]); // Prazno na početku, puni se sa API-ja
  const [faqs, setFaqs] = useState([]); // Isto za FAQ
  const [loading, setLoading] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  // 1. POVLAČENJE PODATAKA IZ ADMIN PANELA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, faqRes] = await Promise.all([
          axios.get('/api/public/programs'), // Tvoja API ruta za programe
          axios.get('/api/public/faqs')      // Tvoja API ruta za FAQ
        ]);
        setPrograms(progRes.data);
        setFaqs(faqRes.data);
      } catch (err) {
        console.error("Greška pri učitavanju podataka:", err);
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
      toast.error("Greška pri pokretanju plaćanja.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="h-screen flex items-center justify-center relative px-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 via-transparent to-pink-600/10" />
        <div className="text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-[10rem] font-black mb-8 tracking-tighter leading-[0.85] uppercase"
          >
            Continental <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-orange-500">Academy</span>
          </motion.h1>
          <Button 
            onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
            className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-9 rounded-[2rem] font-black text-xl shadow-[0_20px_50px_rgba(234,88,12,0.3)] transition-all"
          >
            ZAPOČNI ODMAH <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* STATS SEKCIJA */}
      <section className="py-24 border-y border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Članova', value: '580+', icon: Users },
            { label: 'Projekata', value: '200+', icon: Zap },
            { label: 'Zemalja', value: '9', icon: Globe },
            { label: 'Ocena', value: '4.9/5', icon: Star }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-4 text-orange-500" />
              <div className="text-4xl font-black mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMS SECTION (Dynamic) */}
      <section id="programs" className="py-32 max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-black text-center mb-20 uppercase tracking-tighter">
          Izaberi svoj <span className="text-orange-500">put</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((p) => (
            <div key={p._id} className="bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] hover:border-orange-500/50 transition-all relative group overflow-hidden">
              <h3 className="text-2xl font-black mb-4 uppercase">{p.name}</h3>
              <div className="text-6xl font-black mb-8 tracking-tighter">€{p.price}</div>
              <ul className="mb-10 space-y-4 text-sm font-medium opacity-80">
                {p.features?.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> {f}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => handleJoin(p._id)} 
                disabled={loading === p._id}
                className="w-full py-8 rounded-2xl bg-white text-black hover:bg-orange-500 hover:text-white font-black transition-all uppercase tracking-widest"
              >
                {loading === p._id ? "UČITAVANJE..." : "PRIDRUŽI SE"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION (Dynamic) */}
      <section className="py-32 max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-black text-center mb-16 uppercase tracking-tighter">Česta <span className="text-orange-500">Pitanja</span></h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq._id || index} className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
              <button 
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-all"
              >
                <span className="font-bold text-lg">{faq.question}</span>
                {activeFaq === index ? <Minus className="text-orange-500" /> : <Plus />}
              </button>
              {activeFaq === index && (
                <div className="p-6 pt-0 text-white/60 leading-relaxed border-t border-white/5">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
