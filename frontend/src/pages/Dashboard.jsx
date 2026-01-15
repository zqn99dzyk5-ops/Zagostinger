import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Play, Clock, CheckCircle, MessageCircle, 
  ChevronRight, Award, Loader2 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../lib/auth';
import { programsAPI, coursesAPI, paymentsAPI } from '../lib/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [programs, setPrograms] = useState([]);
  const [subscribedPrograms, setSubscribedPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPayment = async () => {
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        try {
          const response = await paymentsAPI.getStatus(sessionId);
          if (response.data.payment_status === 'paid') {
            toast.success('Plaćanje uspješno! Vaša pretplata je aktivirana.');
            await refreshUser();
          }
        } catch (error) {
          console.error('Error checking payment:', error);
        }
      }
    };
    
    checkPayment();
  }, [searchParams, refreshUser]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [programsRes, coursesRes] = await Promise.all([
          programsAPI.getAll(),
          coursesAPI.getAll()
        ]);
        
        setPrograms(programsRes.data);
        setCourses(coursesRes.data);
        
        // Filter subscribed programs
        const userSubs = user?.subscriptions || [];
        const subProgs = programsRes.data.filter(p => userSubs.includes(p.id));
        setSubscribedPrograms(subProgs);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="heading-2 mb-2">Dobrodošli, {user?.name}</h1>
          <p className="text-muted-foreground">Vaš edukacijski centar</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="luxury-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{subscribedPrograms.length}</p>
                  <p className="text-sm text-muted-foreground">Aktivne pretplate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="luxury-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Završenih lekcija</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="luxury-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0h</p>
                  <p className="text-sm text-muted-foreground">Vremena učenja</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscribed Programs & Courses */}
        {subscribedPrograms.length > 0 ? (
          <section className="mb-12">
            <h2 className="heading-3 mb-6">Vaši kursevi</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscribedPrograms.map((program) => {
                const programCourses = courses.filter(c => c.program_id === program.id);
                return (
                  <Card key={program.id} className="luxury-card group" data-testid={`subscribed-program-${program.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-500 font-medium">
                          Aktivno
                        </span>
                      </div>
                      <CardTitle className="font-heading text-xl mt-4">{program.name}</CardTitle>
                      <CardDescription>{program.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Napredak</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                      
                      {programCourses.length > 0 && (
                        <div className="space-y-2 mb-6">
                          {programCourses.slice(0, 3).map((course) => (
                            <Link 
                              key={course.id} 
                              to={`/course/${course.id}`}
                              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              <Play className="w-4 h-4 text-primary" />
                              <span className="text-sm truncate">{course.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      <Button 
                        className="w-full bg-primary text-primary-foreground rounded-full group-hover:gold-glow transition-shadow"
                        asChild
                      >
                        <Link to={`/course/${programCourses[0]?.id || ''}`}>
                          Nastavi učenje
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mb-12">
            <Card className="luxury-card text-center py-12">
              <CardContent>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="heading-3 mb-4">Nemate aktivnih pretplata</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Pretplatite se na neki od naših programa i započnite svoje putovanje ka uspjehu.
                </p>
                <Button asChild className="bg-primary text-primary-foreground rounded-full">
                  <Link to="/#programs">
                    Pogledaj programe
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Support Section */}
        <section>
          <Card className="luxury-card bg-[#5865F2]/5 border-[#5865F2]/20">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#5865F2]/20 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-[#5865F2]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-1">Trebate pomoć?</h3>
                    <p className="text-muted-foreground">Naš support tim je dostupan 24/7 na Discord-u</p>
                  </div>
                </div>
                <Button 
                  className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white rounded-full px-6"
                  asChild
                >
                  <a href="https://discord.gg/placeholder" target="_blank" rel="noopener noreferrer">
                    Kontaktiraj support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
