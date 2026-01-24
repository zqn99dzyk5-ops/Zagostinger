import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, ArrowRight, Users, Zap, Globe, Star, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';

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
    <div className="bg-[#050505] min-h-screen text-white font-sans">
      
      {/* HERO SECTION */}
      <section className="h-screen flex items-center justify-center relative px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 via-transparent to-pink-600/10 opacity-50" />
        <div className="text-center relative z-10">
          <h1 className="text-6xl md:text-[10rem] font-black mb-8 tracking-tighter leading-[0.85] uppercase">
            Continental <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Academy</span>
          </h1>
          <Button 
            onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
            className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-9 rounded-2xl font-black text-xl shadow-2xl"
          >
            ZAPOČNI ODMAH <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 border-y border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Članova', value: '1,500+', icon: Users },
            { label: 'Projekata', value: '120+', icon: Zap },
            { label: 'Zemalja', value: '15+', icon: Globe },
            { label: 'Ocena', value: '4.9/5', icon: Star }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-black mb-1">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMS SECTION - VRAĆEN THUMBNAIL I TVOJA STRUKTURA */}
      <section id="programs" className="py-32 max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-black text-center mb-20 uppercase tracking-tighter">Programi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {programs.map((p) => (
            <div key={p._id} className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-orange-500/50 transition-all group flex flex-col">
              
              {/* THUMBNAIL - VRAĆEN NA VRH KARTICE */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={p.image_url || '/placeholder-course.jpg'} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent opacity-60" />
              </div>

              <div className="p-10 flex flex-col flex-grow">
                <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">{p.name}</h3>
                <div className="text-5xl font-black text-orange-500 mb-8 tracking-tighter">€{p.price}</div>
                
                <ul className="mb-10 space-y-4 flex-grow">
                  {p.features?.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/70 text-sm font-medium">
                      <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleJoin(p._id)} 
                  disabled={loading === p._id}
                  className="w-full py-8 rounded-2xl bg-white text-black hover:bg-orange-500 hover:text-white font-black text-lg transition-all uppercase"
                >
                  {loading === p._id ? "UČITAVANJE..." : "PRIDRUŽI SE"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-32 max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-black text-center mb-16 uppercase">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq._id || index} className="border border-white/10 rounded-2xl bg-white/5">
              <button 
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full p-6 text-left flex justify-between items-center"
              >
                <span className="font-bold text-lg uppercase">{faq.question}</span>
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
