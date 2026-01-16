import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, ShoppingBag, Settings, BarChart3, 
  Plus, Trash2, Edit, Save, Loader2, MessageCircle, 
  FileText, Image, Video, DollarSign, Palette, GraduationCap,
  PlayCircle, Clock, ChevronDown, ChevronUp, Eye, EyeOff, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { 
  programsAPI, coursesAPI, lessonsAPI, shopAPI, faqsAPI, 
  resultsAPI, settingsAPI, analyticsAPI, adminAPI 
} from '../lib/api';
import { toast } from 'sonner';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [products, setProducts] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [results, setResults] = useState([]);
  const [settings, setSettings] = useState({});

  // Modal states
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showUserCoursesModal, setShowUserCoursesModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courseLessons, setCourseLessons] = useState({});

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        analyticsRes, usersRes, programsRes, coursesRes, 
        productsRes, faqsRes, resultsRes, settingsRes
      ] = await Promise.all([
        analyticsAPI.getStats(),
        adminAPI.getUsers(),
        programsAPI.getAll(),
        coursesAPI.adminGetAll(),
        shopAPI.getProducts(),
        faqsAPI.getAll(),
        resultsAPI.getAll(),
        settingsAPI.get()
      ]);
      
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setPrograms(programsRes.data);
      setCourses(coursesRes.data);
      setProducts(productsRes.data);
      setFaqs(faqsRes.data);
      setResults(resultsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await settingsAPI.update(newSettings);
      // Use returned settings from server
      if (response.data) {
        setSettings(response.data);
      } else {
        setSettings({ ...settings, ...newSettings });
      }
      toast.success('Postavke ažurirane');
    } catch (error) {
      toast.error('Greška pri ažuriranju postavki');
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      toast.success('Uloga korisnika ažurirana');
    } catch (error) {
      toast.error('Greška pri ažuriranju uloge');
    }
  };

  // Load lessons for a course
  const loadCourseLessons = async (courseId) => {
    try {
      const response = await lessonsAPI.getAll(courseId);
      setCourseLessons(prev => ({ ...prev, [courseId]: response.data }));
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  // CRUD for Programs
  const saveProgram = async (programData) => {
    try {
      if (editingItem?.id) {
        await programsAPI.update(editingItem.id, programData);
        toast.success('Program ažuriran');
      } else {
        await programsAPI.create(programData);
        toast.success('Program kreiran');
      }
      loadAllData();
      setShowProgramModal(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Greška pri spremanju programa');
    }
  };

  const deleteProgram = async (id) => {
    if (!confirm('Da li ste sigurni?')) return;
    try {
      await programsAPI.delete(id);
      setPrograms(programs.filter(p => p.id !== id));
      toast.success('Program obrisan');
    } catch (error) {
      toast.error('Greška pri brisanju');
    }
  };

  // CRUD for Courses
  const saveCourse = async (courseData) => {
    try {
      if (editingItem?.id) {
        await coursesAPI.update(editingItem.id, courseData);
        toast.success('Kurs ažuriran');
      } else {
        await coursesAPI.create(courseData);
        toast.success('Kurs kreiran');
      }
      loadAllData();
      setShowCourseModal(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Greška pri spremanju kursa');
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Da li ste sigurni? Sve lekcije će biti obrisane.')) return;
    try {
      await coursesAPI.delete(id);
      setCourses(courses.filter(c => c.id !== id));
      toast.success('Kurs obrisan');
    } catch (error) {
      toast.error('Greška pri brisanju');
    }
  };

  // CRUD for Lessons
  const saveLesson = async (lessonData) => {
    try {
      if (editingItem?.id) {
        await lessonsAPI.update(editingItem.id, lessonData);
        toast.success('Lekcija ažurirana');
      } else {
        await lessonsAPI.create(lessonData);
        toast.success('Lekcija kreirana');
      }
      if (selectedCourse) {
        loadCourseLessons(selectedCourse.id);
      }
      setShowLessonModal(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Greška pri spremanju lekcije');
    }
  };

  const deleteLesson = async (lessonId, courseId) => {
    if (!confirm('Da li ste sigurni?')) return;
    try {
      await lessonsAPI.delete(lessonId);
      setCourseLessons(prev => ({
        ...prev,
        [courseId]: prev[courseId]?.filter(l => l.id !== lessonId)
      }));
      toast.success('Lekcija obrisana');
    } catch (error) {
      toast.error('Greška pri brisanju');
    }
  };

  // CRUD for Products
  const saveProduct = async (productData) => {
    try {
      if (editingItem?.id) {
        await shopAPI.updateProduct(editingItem.id, productData);
        toast.success('Proizvod ažuriran');
      } else {
        await shopAPI.createProduct(productData);
        toast.success('Proizvod kreiran');
      }
      loadAllData();
      setShowProductModal(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Greška pri spremanju proizvoda');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Da li ste sigurni?')) return;
    try {
      await shopAPI.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Proizvod obrisan');
    } catch (error) {
      toast.error('Greška pri brisanju');
    }
  };

  // CRUD for FAQs
  const saveFaq = async (faqData) => {
    try {
      if (editingItem?.id) {
        await faqsAPI.update(editingItem.id, faqData);
        toast.success('FAQ ažuriran');
      } else {
        await faqsAPI.create(faqData);
        toast.success('FAQ kreiran');
      }
      loadAllData();
      setShowFaqModal(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Greška pri spremanju FAQ-a');
    }
  };

  const deleteFaq = async (id) => {
    if (!confirm('Da li ste sigurni?')) return;
    try {
      await faqsAPI.delete(id);
      setFaqs(faqs.filter(f => f.id !== id));
      toast.success('FAQ obrisan');
    } catch (error) {
      toast.error('Greška pri brisanju');
    }
  };

  // Results
  const saveResult = async (resultData) => {
    try {
      await resultsAPI.create(resultData);
      toast.success('Rezultat dodan');
      loadAllData();
      setShowResultModal(false);
    } catch (error) {
      toast.error('Greška pri dodavanju');
    }
  };

  const deleteResult = async (id) => {
    if (!confirm('Da li ste sigurni?')) return;
    try {
      await resultsAPI.delete(id);
      setResults(results.filter(r => r.id !== id));
      toast.success('Rezultat obrisan');
    } catch (error) {
      toast.error('Greška pri brisanju');
    }
  };

  // User course management
  const openUserCoursesModal = async (user) => {
    setSelectedUser(user);
    setShowUserCoursesModal(true);
  };

  const toggleUserCourse = async (courseId, hasAccess) => {
    if (!selectedUser) return;
    try {
      if (hasAccess) {
        await adminAPI.removeCourseFromUser(selectedUser.id, courseId);
      } else {
        await adminAPI.addCourseToUser(selectedUser.id, courseId);
      }
      // Update local state
      setUsers(users.map(u => {
        if (u.id === selectedUser.id) {
          const courses = u.courses || [];
          return {
            ...u,
            courses: hasAccess 
              ? courses.filter(c => c !== courseId)
              : [...courses, courseId]
          };
        }
        return u;
      }));
      setSelectedUser(prev => ({
        ...prev,
        courses: hasAccess
          ? (prev.courses || []).filter(c => c !== courseId)
          : [...(prev.courses || []), courseId]
      }));
      toast.success(hasAccess ? 'Kurs uklonjen' : 'Kurs dodan');
    } catch (error) {
      toast.error('Greška pri ažuriranju');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="heading-2 mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Upravljajte svim aspektima platforme</p>
          </div>
          <Button onClick={seedData} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Dodaj demo podatke
          </Button>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-card border border-white/5 p-1 rounded-xl flex-wrap h-auto">
            <TabsTrigger value="overview" className="gap-2 rounded-lg">
              <BarChart3 className="w-4 h-4" /> Pregled
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 rounded-lg">
              <Users className="w-4 h-4" /> Korisnici
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2 rounded-lg">
              <GraduationCap className="w-4 h-4" /> Kursevi
            </TabsTrigger>
            <TabsTrigger value="programs" className="gap-2 rounded-lg">
              <BookOpen className="w-4 h-4" /> Programi
            </TabsTrigger>
            <TabsTrigger value="shop" className="gap-2 rounded-lg">
              <ShoppingBag className="w-4 h-4" /> Shop
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2 rounded-lg">
              <FileText className="w-4 h-4" /> Sadržaj
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 rounded-lg">
              <Settings className="w-4 h-4" /> Postavke
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="luxury-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analytics?.total_users || 0}</p>
                      <p className="text-sm text-muted-foreground">Ukupno korisnika</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="luxury-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analytics?.total_subscriptions || 0}</p>
                      <p className="text-sm text-muted-foreground">Aktivne pretplate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="luxury-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{courses.length}</p>
                      <p className="text-sm text-muted-foreground">Kurseva</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="luxury-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{programs.length}</p>
                      <p className="text-sm text-muted-foreground">Programa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Events */}
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>Nedavni eventi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analytics?.recent_events?.slice(0, 10).map((event, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{event.event_type}</p>
                        <p className="text-xs text-muted-foreground">{event.page}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString('bs')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>Korisnici</CardTitle>
                <CardDescription>Upravljajte korisnicima, ulogama i pristupom kursevima</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ime</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Uloga</TableHead>
                      <TableHead>Pretplate</TableHead>
                      <TableHead>Kursevi</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user.id, value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{user.subscriptions?.length || 0}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.courses?.length || 0} kurseva</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('bs')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openUserCoursesModal(user)}
                            data-testid={`manage-courses-${user.id}`}
                          >
                            <GraduationCap className="w-4 h-4 mr-1" />
                            Kursevi
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab - NEW */}
          <TabsContent value="courses">
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Kursevi i Lekcije</CardTitle>
                  <CardDescription>Upravljajte kursevima i njihovim video lekcijama</CardDescription>
                </div>
                <Button 
                  className="gap-2" 
                  onClick={() => { setEditingItem(null); setShowCourseModal(true); }}
                  data-testid="add-course-btn"
                >
                  <Plus className="w-4 h-4" /> Novi kurs
                </Button>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {courses.map((course) => (
                    <AccordionItem 
                      key={course.id} 
                      value={course.id}
                      className="luxury-card border-white/10 px-0 overflow-hidden"
                    >
                      <AccordionTrigger 
                        className="px-6 py-4 hover:no-underline hover:bg-white/5"
                        onClick={() => {
                          if (!courseLessons[course.id]) {
                            loadCourseLessons(course.id);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <GraduationCap className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold">{course.title}</p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <PlayCircle className="w-4 h-4" />
                                  {course.lesson_count || 0} lekcija
                                </span>
                                {course.duration_hours && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {course.duration_hours}h
                                  </span>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {course.program_name}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => { setEditingItem(course); setShowCourseModal(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteCourse(course.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-4">
                          {/* Add Lesson Button */}
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-sm text-muted-foreground">LEKCIJE</h4>
                            <Button 
                              size="sm" 
                              className="gap-2"
                              onClick={() => {
                                setSelectedCourse(course);
                                setEditingItem(null);
                                setShowLessonModal(true);
                              }}
                              data-testid={`add-lesson-${course.id}`}
                            >
                              <Plus className="w-4 h-4" /> Dodaj lekciju
                            </Button>
                          </div>
                          
                          {/* Lessons List */}
                          <div className="space-y-2">
                            {courseLessons[course.id]?.length > 0 ? (
                              courseLessons[course.id].map((lesson, index) => (
                                <div 
                                  key={lesson.id}
                                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                                      {lesson.order || index + 1}
                                    </div>
                                    <div>
                                      <p className="font-medium">{lesson.title}</p>
                                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        {lesson.duration_minutes && (
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {lesson.duration_minutes} min
                                          </span>
                                        )}
                                        {lesson.video_url && (
                                          <span className="flex items-center gap-1 text-green-500">
                                            <Video className="w-3 h-3" />
                                            Video dodan
                                          </span>
                                        )}
                                        {lesson.is_free && (
                                          <Badge variant="secondary" className="text-xs">Besplatno</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedCourse(course);
                                        setEditingItem(lesson);
                                        setShowLessonModal(true);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => deleteLesson(lesson.id, course.id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Nema lekcija. Dodajte prvu lekciju.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {courses.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nema kurseva. Kreirajte prvi kurs.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Edukacijski programi (Pretplate)</CardTitle>
                  <CardDescription>Upravljajte programima pretplata</CardDescription>
                </div>
                <Button 
                  className="gap-2" 
                  onClick={() => { setEditingItem(null); setShowProgramModal(true); }}
                  data-testid="add-program-btn"
                >
                  <Plus className="w-4 h-4" /> Novi program
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Naziv</TableHead>
                      <TableHead>Cijena</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell className="font-medium">{program.name}</TableCell>
                        <TableCell>€{program.price}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${program.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {program.is_active ? 'Aktivan' : 'Neaktivan'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => { setEditingItem(program); setShowProgramModal(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteProgram(program.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop">
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Shop proizvodi</CardTitle>
                  <CardDescription>Upravljajte nalozima za prodaju</CardDescription>
                </div>
                <Button 
                  className="gap-2" 
                  onClick={() => { setEditingItem(null); setShowProductModal(true); }}
                  data-testid="add-product-btn"
                >
                  <Plus className="w-4 h-4" /> Novi proizvod
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Naziv</TableHead>
                      <TableHead>Kategorija</TableHead>
                      <TableHead>Cijena</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>€{product.price}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${product.is_available ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {product.is_available ? 'Dostupno' : 'Prodano'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => { setEditingItem(product); setShowProductModal(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            {/* FAQs */}
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>FAQ</CardTitle>
                  <CardDescription>Često postavljana pitanja</CardDescription>
                </div>
                <Button 
                  className="gap-2" 
                  onClick={() => { setEditingItem(null); setShowFaqModal(true); }}
                  data-testid="add-faq-btn"
                >
                  <Plus className="w-4 h-4" /> Novo pitanje
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="flex items-start justify-between p-4 rounded-lg bg-white/5">
                      <div className="flex-1">
                        <p className="font-medium">{faq.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => { setEditingItem(faq); setShowFaqModal(true); }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteFaq(faq.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Results Gallery */}
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Rezultati studenata</CardTitle>
                  <CardDescription>Galerija uspjeha</CardDescription>
                </div>
                <Button 
                  className="gap-2" 
                  onClick={() => setShowResultModal(true)}
                  data-testid="add-result-btn"
                >
                  <Plus className="w-4 h-4" /> Dodaj rezultat
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {results.map((result) => (
                    <div key={result.id} className="relative group">
                      <img 
                        src={result.image_url} 
                        alt={result.caption}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteResult(result.id)}
                        >
                          <Trash2 className="w-5 h-5 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 truncate">{result.caption}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>Opće postavke</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Naziv stranice</Label>
                    <Input 
                      value={settings.site_name || ''} 
                      onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                      className="bg-input/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kontakt email</Label>
                    <Input 
                      value={settings.contact_email || ''} 
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      className="bg-input/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Hero naslov</Label>
                  <Input 
                    value={settings.hero_headline || ''} 
                    onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
                    className="bg-input/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Hero podnaslov</Label>
                  <Textarea 
                    value={settings.hero_subheadline || ''} 
                    onChange={(e) => setSettings({ ...settings, hero_subheadline: e.target.value })}
                    className="bg-input/50"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Hero video URL</Label>
                  <Input 
                    value={settings.hero_video_url || ''} 
                    onChange={(e) => setSettings({ ...settings, hero_video_url: e.target.value })}
                    className="bg-input/50"
                    placeholder="https://..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Discord invite URL</Label>
                  <Input 
                    value={settings.discord_invite_url || ''} 
                    onChange={(e) => setSettings({ ...settings, discord_invite_url: e.target.value })}
                    className="bg-input/50"
                    placeholder="https://discord.gg/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select 
                    value={settings.theme || 'dark-luxury'}
                    onValueChange={(value) => setSettings({ ...settings, theme: value })}
                  >
                    <SelectTrigger className="bg-input/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark-luxury">Dark Luxury</SelectItem>
                      <SelectItem value="clean-light">Clean Light</SelectItem>
                      <SelectItem value="midnight-purple">Midnight Purple</SelectItem>
                      <SelectItem value="education-classic">Education Classic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={() => updateSettings(settings)}
                  className="bg-primary text-primary-foreground"
                  data-testid="save-settings-btn"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Spremi postavke
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Course Modal */}
        <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
          <DialogContent className="bg-card border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Uredi kurs' : 'Novi kurs'}</DialogTitle>
            </DialogHeader>
            <CourseForm 
              initialData={editingItem}
              programs={programs}
              onSave={saveCourse} 
              onCancel={() => setShowCourseModal(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* Lesson Modal */}
        <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
          <DialogContent className="bg-card border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Uredi lekciju' : 'Nova lekcija'}
                {selectedCourse && <span className="text-muted-foreground font-normal"> - {selectedCourse.title}</span>}
              </DialogTitle>
            </DialogHeader>
            <LessonForm 
              initialData={editingItem}
              courseId={selectedCourse?.id}
              onSave={saveLesson} 
              onCancel={() => setShowLessonModal(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* User Courses Modal */}
        <Dialog open={showUserCoursesModal} onOpenChange={setShowUserCoursesModal}>
          <DialogContent className="bg-card border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle>Upravljanje kursevima</DialogTitle>
              <DialogDescription>
                {selectedUser?.name} ({selectedUser?.email})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {courses.map((course) => {
                const hasAccess = selectedUser?.courses?.includes(course.id);
                return (
                  <div 
                    key={course.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.lesson_count || 0} lekcija</p>
                      </div>
                    </div>
                    <Switch 
                      checked={hasAccess}
                      onCheckedChange={() => toggleUserCourse(course.id, hasAccess)}
                    />
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Program Modal */}
        <Dialog open={showProgramModal} onOpenChange={setShowProgramModal}>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Uredi program' : 'Novi program'}</DialogTitle>
            </DialogHeader>
            <ProgramForm 
              initialData={editingItem} 
              onSave={saveProgram} 
              onCancel={() => setShowProgramModal(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* Product Modal */}
        <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Uredi proizvod' : 'Novi proizvod'}</DialogTitle>
            </DialogHeader>
            <ProductForm 
              initialData={editingItem} 
              onSave={saveProduct} 
              onCancel={() => setShowProductModal(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* FAQ Modal */}
        <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Uredi FAQ' : 'Novo pitanje'}</DialogTitle>
            </DialogHeader>
            <FaqForm 
              initialData={editingItem} 
              onSave={saveFaq} 
              onCancel={() => setShowFaqModal(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* Result Modal */}
        <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>Dodaj rezultat</DialogTitle>
            </DialogHeader>
            <ResultForm 
              onSave={saveResult} 
              onCancel={() => setShowResultModal(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Course Form
const CourseForm = ({ initialData, programs, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    program_id: initialData?.program_id || '',
    thumbnail_url: initialData?.thumbnail_url || '',
    duration_hours: initialData?.duration_hours || '',
    order: initialData?.order || 0,
    is_active: initialData?.is_active !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : null,
      order: parseInt(formData.order) || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Naziv kursa</Label>
        <Input 
          value={formData.title} 
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="npr. TikTok za početnike"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Opis</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Kratki opis kursa..."
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Program (pretplata)</Label>
        <Select 
          value={formData.program_id} 
          onValueChange={(v) => setFormData({ ...formData, program_id: v })}
        >
          <SelectTrigger><SelectValue placeholder="Odaberi program" /></SelectTrigger>
          <SelectContent>
            {programs.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Trajanje (sati)</Label>
          <Input 
            type="number" 
            value={formData.duration_hours} 
            onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
            placeholder="npr. 10"
          />
        </div>
        <div className="space-y-2">
          <Label>Redoslijed</Label>
          <Input 
            type="number" 
            value={formData.order} 
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Thumbnail URL</Label>
        <Input 
          value={formData.thumbnail_url} 
          onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch 
          checked={formData.is_active} 
          onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
        />
        <Label>Aktivan</Label>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Odustani</Button>
        <Button type="submit" className="bg-primary text-primary-foreground">Spremi</Button>
      </div>
    </form>
  );
};

// Lesson Form
const LessonForm = ({ initialData, courseId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    course_id: initialData?.course_id || courseId || '',
    video_url: initialData?.video_url || '',
    mux_playback_id: initialData?.mux_playback_id || '',
    duration_minutes: initialData?.duration_minutes || '',
    order: initialData?.order || 0,
    is_free: initialData?.is_free || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      order: parseInt(formData.order) || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Naziv lekcije</Label>
        <Input 
          value={formData.title} 
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="npr. Lekcija 1: Uvod u TikTok"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Opis</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Šta ćete naučiti u ovoj lekciji..."
        />
      </div>
      <div className="space-y-2">
        <Label>Video URL (YouTube, Vimeo, ili direktni link)</Label>
        <Input 
          value={formData.video_url} 
          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
          placeholder="https://youtube.com/watch?v=... ili https://vimeo.com/..."
        />
      </div>
      <div className="space-y-2">
        <Label>MUX Playback ID (opciono)</Label>
        <Input 
          value={formData.mux_playback_id} 
          onChange={(e) => setFormData({ ...formData, mux_playback_id: e.target.value })}
          placeholder="abc123xyz"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Trajanje (minuta)</Label>
          <Input 
            type="number" 
            value={formData.duration_minutes} 
            onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
            placeholder="npr. 15"
          />
        </div>
        <div className="space-y-2">
          <Label>Redoslijed</Label>
          <Input 
            type="number" 
            value={formData.order} 
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch 
          checked={formData.is_free} 
          onCheckedChange={(v) => setFormData({ ...formData, is_free: v })}
        />
        <Label>Besplatna lekcija (preview)</Label>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Odustani</Button>
        <Button type="submit" className="bg-primary text-primary-foreground">Spremi</Button>
      </div>
    </form>
  );
};

// Program Form
const ProgramForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    currency: initialData?.currency || 'EUR',
    features: initialData?.features?.join('\n') || '',
    is_active: initialData?.is_active !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      features: formData.features.split('\n').filter(f => f.trim())
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Naziv</Label>
        <Input 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Opis</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cijena</Label>
          <Input 
            type="number" 
            step="0.01"
            value={formData.price} 
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Valuta</Label>
          <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="BAM">BAM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Značajke (svaka u novom redu)</Label>
        <Textarea 
          value={formData.features} 
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          rows={4}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch 
          checked={formData.is_active} 
          onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
        />
        <Label>Aktivan</Label>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Odustani</Button>
        <Button type="submit" className="bg-primary text-primary-foreground">Spremi</Button>
      </div>
    </form>
  );
};

// Product Form
const ProductForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'tiktok',
    price: initialData?.price || 0,
    currency: initialData?.currency || 'EUR',
    is_available: initialData?.is_available !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      stats: {},
      images: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Naziv</Label>
        <Input 
          value={formData.title} 
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Opis</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Kategorija</Label>
        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cijena</Label>
          <Input 
            type="number" 
            step="0.01"
            value={formData.price} 
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Valuta</Label>
          <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch 
          checked={formData.is_available} 
          onCheckedChange={(v) => setFormData({ ...formData, is_available: v })}
        />
        <Label>Dostupno</Label>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Odustani</Button>
        <Button type="submit" className="bg-primary text-primary-foreground">Spremi</Button>
      </div>
    </form>
  );
};

// FAQ Form
const FaqForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    order: initialData?.order || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Pitanje</Label>
        <Input 
          value={formData.question} 
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Odgovor</Label>
        <Textarea 
          value={formData.answer} 
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          required
          rows={4}
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Odustani</Button>
        <Button type="submit" className="bg-primary text-primary-foreground">Spremi</Button>
      </div>
    </form>
  );
};

// Result Form
const ResultForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    image_url: '',
    caption: '',
    order: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>URL slike</Label>
        <Input 
          value={formData.image_url} 
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          required
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label>Opis</Label>
        <Input 
          value={formData.caption} 
          onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
          required
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Odustani</Button>
        <Button type="submit" className="bg-primary text-primary-foreground">Spremi</Button>
      </div>
    </form>
  );
};

export default Admin;
