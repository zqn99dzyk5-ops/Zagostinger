import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Star, 
  Zap, 
  ShieldCheck,
  TrendingUp,
  Globe
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

  // Fallback programi da sajt nikad ne bude prazan
  const defaultPrograms = [
    {
      _id: '1',
      name: 'Starter Academy',
      price: 49,
      features: ['Osnove digitalne zarade', 'Zajednica studenata', 'Live webinar jednom nedeljno', 'Pristup osnovnim alatima']
    },
    {
      _id: '2',
      name: 'Elite Mentorstvo',
      price: 149,
      features: ['1 na 1 konsultacije', 'Privatne strategije', 'Napredni resursi', 'Direktan kontakt sa mentorom']
    },
    {
      _id: '3',
      name: 'Business Pro',
      price: 299,
      features: ['Full biznis automatizacija', 'Scale strategije', 'Investicioni saveti', 'VIP Discord kanal']
    }
  ];

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await axios.get('/api/programs');
        if (res.data && res.data.length > 0) {
          setPrograms(res.data);
        } else {
          setPrograms(defaultPrograms);
        }
      } catch (err) {
        setPrograms(defaultPrograms);
      }
    };
    fetchPrograms();
  }, []);

  const handleJoinProgram = async (programId) => {
    if (!user) {
      toast.error("Moraš biti prijavljen.");
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
    <div className="relative bg-[#050505] min-h-screen text-white overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center">
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
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/20 via-black to-pink-900/20" />
        )}
        
        {/* Overlayi za dubinu */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-50" />

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <span className="px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold tracking-[0.3em] uppercase">
                The New Era of Business
              </span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-heading font-black mb-8 tracking-tighter leading-[0.9]">
              DOMINIRAJ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-orange-500">
                DIGITALNIM TRŽIŠTEM
              </span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light tracking-wide">
              Continental Academy je jedina platforma koja ti nudi direktno mentorstvo i resurse za scale-ovanje digitalnog biznisa na 5-6 cifara.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-10 py-8 rounded-2xl text-lg font-black bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] transition-all active:scale-95"
              >
                ZAPOČNI ODMAH <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <button className="flex items-center gap-3 text-white/80 font-bold hover:text-white transition-all group">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-orange-500/50 group-hover:bg-orange-500/10">
                  <Play className="w-4 h-4 fill-current ml-1" />
                </div>
                POGLEDAJ INTRO
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="relative z-10 py-24 border-y border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Aktivnih Članova', value: '1,500+', icon: Users, color: 'text-orange-500' },
            { label: 'Uspješnih Projekata', value: '120+', icon: Zap, color: 'text-pink-500' },
            { label: 'Zemalja širom sveta', value: '15+', icon: Globe, color: 'text-orange-400' },
            { label: 'Prosječna Zarada', value: '€2.5k', icon: TrendingUp, color: 'text-pink-400' }
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <stat.icon className={`w-6 h-6 mx-auto mb-4 ${stat.color} group-hover:scale-110 transition-transform`} />
              <h3 className="text-4xl font-black mb-1 tracking-tighter">{stat.value}</h3>
              <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROGRAMS SECTION */}
      <section id="programs" className="relative z-10 py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">
            Odaberi Svoj <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Put</span>
          </h2>
          <div className="h-1 w-24 bg-orange-500 mx-auto rounded-full shadow-[0_0_20px_rgba(249,115,22,0.8)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program) => (
            <motion.div 
              key={program._id}
              whileHover={{ y: -15 }}
              className="relative group p-[1px] rounded-[2.5rem] overflow-hidden"
            >
              {/* Border Gradient na hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent group-hover:from-orange-500 group-hover:to-pink-600 transition-all duration-500" />
              
              <div className="relative bg-[#0a0a0a] rounded-[2.5rem] p-10 h-full flex flex-col overflow-hidden">
                {/* Glow unutar kartice */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 blur-[60px] group-hover:bg-orange-500/20 transition-all" />
                
                <h3 className="text-xs font-black tracking-[0.3em] text-orange-500 uppercase mb-4">{program.name}</h3>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-6xl font-black tracking-tighter">€{program.price}</span>
                  <span className="text-muted-foreground font-medium">/ msc</span>
                </div>

                <ul className="space-y-5 mb-12 flex-grow">
                  {program.features?.map((f, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm font-medium text-white/80">
                      <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <CheckCircle2 className="w-3 h-3 text-orange-500" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleJoinProgram(program._id)}
                  className="w-full py-8 rounded-2xl font-black tracking-widest bg-white text-black hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-600 hover:text-white transition-all duration-500 group-hover:shadow-[0_10px_30px_rgba(249,115,22,0.3)]"
                >
                  {loading === program._id ? "UČITAVANJE..." : "POSTANI ČLAN"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Decorative Blur Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-orange-500/5 blur-[120px] pointer-events-none" />
    </div>
  );
};

export default Home;
