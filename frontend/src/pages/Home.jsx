import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Star, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/settings';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';

const Home = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Učitavanje programa/kurseva iz baze
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await axios.get('/api/programs');
        setPrograms(res.data);
      } catch (err) {
        console.error("Greška pri učitavanju programa:", err);
      }
    };
    fetchPrograms();
  }, []);

  const handleJoinProgram = async (programId) => {
    if (!user) {
      toast.error("Moraš biti prijavljen da bi se upisao.");
      return;
    }
    setLoading(programId);
    try {
      const res = await axios.post(`/api/payments/checkout/subscription?program_id=${programId}`);
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      toast.error("Greška pri pokretanju upisa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* HERO SECTION SA VIDEO POZADINOM */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {settings?.hero_video_url ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src={settings.hero_video_url} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-[#050505]" />
        )}
        
        {/* Overlay gradijent */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]" />

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-medium tracking-wider uppercase">
              Dobrodošli u Budućnost Edukacije
            </span>
            <h1 className="text-5xl md:text-8xl font-heading font-bold mb-8 tracking-tight">
              Nauči Kako Da <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                Monetizuješ Svoj Digitalni Svet
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              {settings?.footer_text || 'Pridruži se Continental Academy i nauči tajne najuspešnijih digitalnih preduzetnika današnjice.'}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-7 rounded-2xl text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-xl shadow-orange-500/20 transition-all active:scale-95"
              >
                Istraži Programe <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <button className="flex items-center gap-3 text-white font-semibold hover:text-orange-400 transition-colors group">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-orange-500/50 transition-all">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                Pogledaj Intro
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 border-y border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Studenata', value: '500+', icon: Users },
            { label: 'Projekata', value: '90+', icon: Zap },
            { label: 'Ocena', value: '4.9/5', icon: Star },
            { label: 'Zajednica', value: '24/7', icon: ShieldCheck }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <stat.icon className="w-6 h-6 mx-auto text-pink-500 mb-4" />
              <h3 className="text-3xl font-bold">{stat.value}</h3>
              <p className="text-muted-foreground text-sm uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMS SECTION */}
      <section id="programs" className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Ekskluzivni <span className="text-orange-500 underline decoration-pink-500/30">Programi</span>
            </h2>
            <p className="text-muted-foreground">Odaberi nivo edukacije koji ti najviše odgovara i kreni sa radom odmah.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program) => (
            <motion.div 
              key={program._id}
              whileHover={{ y: -10 }}
              className="glass-card p-8 border border-white/5 flex flex-col relative overflow-hidden group"
            >
              {/* Ukrasni sjaj */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 blur-[80px] group-hover:bg-orange-500/20 transition-all" />
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{program.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">€{program.price}</span>
                  <span className="text-muted-foreground">/mesečno</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {program.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleJoinProgram(program._id)}
                disabled={loading === program._id}
                className="w-full py-6 rounded-xl font-bold bg-white text-black hover:bg-orange-500 hover:text-white transition-all duration-300"
              >
                {loading === program._id ? "Učitavanje..." : "PRIDRUŽI SE ODMAH"}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
