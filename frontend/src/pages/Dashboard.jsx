import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Play, Clock, CheckCircle, MessageCircle, 
  ChevronRight, Award, Loader2, GraduationCap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../lib/auth';
import { useSettings } from '../lib/settings';
import { programsAPI, coursesAPI, paymentsAPI, lessonsAPI } from '../lib/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const [programs, setPrograms] = useState([]);
  const [subscribedPrograms, setSubscribedPrograms] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
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
        setAllCourses(coursesRes.data);
        
        // Filter subscribed programs
        const userSubs = user?.subscriptions || [];
        const subProgs = programsRes.data.filter(p => userSubs.includes(p.id));
        setSubscribedPrograms(subProgs);
        
        // Get directly assigned courses
        const userCourseIds = user?.courses || [];
        const assignedCourses = coursesRes.data.filter(c => userCourseIds.includes(c.id));
        
        // Also get courses from subscribed programs
        const programCourses = coursesRes.data.filter(c => userSubs.includes(c.program_id));
        
        // Combine and deduplicate
        const allUserCourses = [...assignedCourses];
        programCourses.forEach(pc => {
          if (!allUserCourses.find(c => c.id === pc.id)) {
            allUserCourses.push(pc);
          }
        });
        
        setUserCourses(allUserCourses);
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

  const hasAccess = userCourses.length > 0 || subscribedPrograms.length > 0;

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
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Dostupnih kurseva</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="luxury-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{subscribedPrograms.length}</p>
                  <p className="text-sm text-muted-foreground">Aktivnih pretplata</p>
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

        {/* User Courses */}
        {hasAccess ? (
          <section className="mb-12">
            <h2 className="heading-3 mb-6">Vaši kursevi</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCourses.map((course) => (
                <Card key={course.id} className="luxury-card group" data-testid={`user-course-${course.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Aktivan
                      </Badge>
                    </div>
                    <CardTitle className="font-heading text-xl mt-4">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        {course.lesson_count || 0} lekcija
                      </span>
                      {course.duration_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration_hours}h
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Napredak</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    
                    <Button 
                      className="w-full bg-primary text-primary-foreground rounded-full group-hover:gold-glow transition-shadow"
                      asChild
                    >
                      <Link to={`/course/${course.id}`}>
                        Započni učenje
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-12">
            <Card className="luxury-card text-center py-12">
              <CardContent>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="heading-3 mb-4">Nemate aktivnih kurseva</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Pretplatite se na neki od naših programa ili kontaktirajte admina za pristup kursevima.
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

        {/* Subscribed Programs */}
        {subscribedPrograms.length > 0 && (
          <section className="mb-12">
            <h2 className="heading-3 mb-6">Vaše pretplate</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subscribedPrograms.map((program) => (
                <Card key={program.id} className="luxury-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">{program.name}</p>
                        <p className="text-xs text-muted-foreground">Aktivna pretplata</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
