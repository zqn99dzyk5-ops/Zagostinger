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
  Globe,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);

  // Podaci su unutar koda da bi sajt uvek bio pun i "živ"
  const programs = [
    {
      id: 'p1',
      name: 'Starter Academy',
      price: 49,
      badge: 'Najpopularnije',
      features: ['Osnove digitalne zarade', 'Zajednica studenata', 'Live webinar nedeljno', 'Pristup alatima']
    },
    {
      id: 'p2',
      name: 'Elite Mastery',
      price: 149,
      badge: 'Preporuka',
      features: ['1 na 1 konsultacije', 'Privatne strategije', 'Napredni resursi', 'Direktan kontakt']
    },
    {
      id: 'p3',
      name: 'Business Scale',
      price: 299,
      badge: 'VIP',
      features: ['Full automatizacija', 'Scale do 10k+', 'Investicioni saveti', 'VIP Discord kanal']
    }
  ];

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
      toast.error("Greška pri pokretanju uplate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-[#050505] min-h-screen text-white overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-600/20 blur-[120px] rounded-full" />

        <div className="relative z-10 text-center px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-8">
              <span className="px-5 py-2 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-400 text-[10px] font-black tracking-[0.4em] uppercase">
                Continental Academy • Est. 2024
              </span>
            </div>
            
            <h1 className="text-6xl md:text-[10rem] font-black mb-8 tracking-tighter leading-[0.85] uppercase">
              Build Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-orange-500 animate-gradient">
                Empire
              </span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-2xl mb-12 max-w-3xl mx-auto font-light tracking-tight leading-relaxed">
              Pridruži se najjačoj zajednici na Balkanu. Nauči kako da monetizuješ digitalne veštine i preuzmeš kontrolu nad svojim životom.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Button 
                onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-12 py-9 rounded-[2rem] text-xl font-black bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-all active:scale-95"
              >
                KRENI ODMAH <Rocket className="ml-3 w-6 h-6" />
              </Button>
              <button className="flex items-center gap-4 text-white/70 font-bold hover:text-white transition-all group">
                <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-orange-500/40 group-hover:bg-orange-500/5">
                  <Play className="w-5 h-5 fill-current ml-1 text-orange-500" />
                </div>
                POGLEDAJ VIDEO
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="relative z-10 py-32 border-y border-white/5 bg-black/60 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-16">
          {[
            { label: 'Aktivnih Članova', value: '1,500+', icon: Users, color: 'text-orange-500' },
            { label: 'Uspješnih Projekata', value: '120+', icon: Zap, color: 'text-pink-500' },
            { label: 'Zemalja', value: '15+', icon: Globe, color: 'text-orange-400' },
            { label: 'Zadovoljstvo', value: '4.9/5', icon: Star, color: 'text-pink-400' }
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className={`w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-orange-500/30 transition-all`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <h3 className="text-5xl font-black mb-2 tracking-tighter">{stat.value}</h3>
              <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] font-bold opacity-60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROGRAMS SECTION */}
      <section id="programs" className="relative z-10 py-40 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-32">
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-none">
            Ekskluzivni <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Programi</span>
          </h2>
          <div className="h-2 w-32 bg-gradient-to-r from-orange-500 to-pink-500 mx-auto rounded-full shadow-[0_0_30px_rgba(249,115,22,0.6)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {programs.map((program) => (
            <motion.div 
              key={program.id}
              whileHover={{ y: -20 }}
              className="relative group p-[1px] rounded-[3rem] overflow-hidden"
            >
              {/* Border Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent group-hover:from-orange-500 group-hover:to-pink-600 transition-all duration-700" />
              
              <div className="relative bg-[#0a0a0a] rounded-[3rem] p-12 h-full flex flex-col">
                <div className="absolute top-8 right-8">
                    <span className="px-4 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold uppercase tracking-widest">
                        {program.badge}
                    </span>
                </div>

                <h3 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">{program.name}</h3>
                
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-7xl font-black tracking-tighter text-white">€{program.price}</span>
                  <span className="text-muted-foreground text-sm font-bold uppercase opacity-50">/msc</span>
                </div>

                <div className="space-y-6 mb-16 flex-grow">
                  {program.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/80">
                      <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      <span className="text-sm font-medium tracking-tight">{f}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handleJoinProgram(program.id)}
                  disabled={loading === program.id}
                  className="w-full py-9 rounded-[1.5rem] font-black tracking-[0.1em] bg-white text-black hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-600 hover:text-white transition-all duration-500 uppercase text-lg"
                >
                  {loading === program.id ? "Procesiranje..." : "PRIDRUŽI SE SADA"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Decorative Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-orange-600/5 blur-[150px] pointer-events-none" />
    </div>
  );
};

export default Home;
