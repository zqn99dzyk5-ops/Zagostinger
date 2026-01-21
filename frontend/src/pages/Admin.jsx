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

  const loadCourseLessons = async (courseId) => {
    try {
      const response = await lessonsAPI.getAll(courseId);
      setCourseLessons(prev => ({ ...prev, [courseId]: response.data }));
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

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
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="heading-2 mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Upravljajte svim aspektima platforme</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-card border border-white/5 p-1 rounded-xl flex-wrap h-auto">
            <TabsTrigger value="overview" className="gap-2 rounded-lg"><BarChart3 className="w-4 h-4" /> Pregled</TabsTrigger>
            <TabsTrigger value="users" className="gap-2 rounded-lg"><Users className="w-4 h-4" /> Korisnici</TabsTrigger>
            <TabsTrigger value="courses" className="gap-2 rounded-lg"><GraduationCap className="w-4 h-4" /> Kursevi</TabsTrigger>
            <TabsTrigger value="programs" className="gap-2 rounded-lg"><BookOpen className="w-4 h-4" /> Programi</TabsTrigger>
            <TabsTrigger value="shop" className="gap-2 rounded-lg"><ShoppingBag className="w-4 h-4" /> Shop</TabsTrigger>
            <TabsTrigger value="content" className="gap-2 rounded-lg"><FileText className="w-4 h-4" /> Sadržaj</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 rounded-lg"><Settings className="w-4 h-4" /> Postavke</TabsTrigger>
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

            <Card className="luxury-card">
              <CardHeader><CardTitle>Nedavni eventi</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analytics?.recent_events?.slice(0, 10).map((event, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div><p className="text-sm font-medium">{event.event_type}</p><p className="text-xs text-muted-foreground">{event.page}</p></div>
                      <span className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString('bs')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="luxury-card">
              <CardHeader><CardTitle>Korisnici</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ime</TableHead><TableHead>Email</TableHead><TableHead>Uloga</TableHead><TableHead>Pretplate</TableHead><TableHead>Kursevi</TableHead><TableHead>Datum</TableHead><TableHead>Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select value={user.role} onValueChange={(value) => updateUserRole(user.id, value)}>
                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{user.subscriptions?.length || 0}</TableCell>
                        <TableCell><Badge variant="outline">{user.courses?.length || 0} kurseva</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString('bs')}</TableCell>
                        <TableCell><Button variant="outline" size="sm" onClick={() => openUserCoursesModal(user)}><GraduationCap className="w-4 h-4 mr-1" />Kursevi</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Kursevi i Lekcije</CardTitle></div>
                <Button onClick={() => { setEditingItem(null); setShowCourseModal(true); }}><Plus className="w-4 h-4" /> Novi kurs</Button>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {courses.map((course) => (
                    <AccordionItem key={course.id} value={course.id} className="luxury-card border-white/10 px-0 overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline" onClick={() => !courseLessons[course.id] && loadCourseLessons(course.id)}>
                        <div className="flex items-center justify-between w-full pr-4 text-left">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><GraduationCap className="w-6 h-6 text-primary" /></div>
                             <div>
                               <p className="font-semibold">{course.title}</p>
                               <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                 <span>{course.lesson_count || 0} lekcija</span>
                                 <Badge variant="outline">{course.program_name}</Badge>
                               </div>
                             </div>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(course); setShowCourseModal(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteCourse(course.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center"><h4 className="font-medium text-sm text-muted-foreground uppercase">Lekcije</h4><Button size="sm" onClick={() => { setSelectedCourse(course); setEditingItem(null); setShowLessonModal(true); }}><Plus className="w-4 h-4" /> Dodaj lekciju</Button></div>
                          <div className="space-y-2">
                            {courseLessons[course.id]?.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                <p>{lesson.title}</p>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => { setSelectedCourse(course); setEditingItem(lesson); setShowLessonModal(true); }}><Edit className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => deleteLesson(lesson.id, course.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Programi</CardTitle></div>
                <Button onClick={() => { setEditingItem(null); setShowProgramModal(true); }}><Plus className="w-4 h-4" /> Novi program</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Naziv</TableHead><TableHead>Cijena</TableHead><TableHead>Status</TableHead><TableHead>Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {programs.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell className="font-medium">{program.name}</TableCell>
                        <TableCell>€{program.price}</TableCell>
                        <TableCell><Badge className={program.is_active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>{program.is_active ? 'Aktivan' : 'Neaktivan'}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(program); setShowProgramModal(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteProgram(program.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
                <div><CardTitle>Shop proizvodi</CardTitle></div>
                <Button onClick={() => { setEditingItem(null); setShowProductModal(true); }}><Plus className="w-4 h-4" /> Novi proizvod</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Naziv</TableHead><TableHead>Cijena</TableHead><TableHead>Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.title}</TableCell><TableCell>€{product.price}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(product); setShowProductModal(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>FAQ</CardTitle></div>
                <Button onClick={() => { setEditingItem(null); setShowFaqModal(true); }}><Plus className="w-4 h-4" /> Novo pitanje</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="flex justify-between p-4 bg-white/5 rounded-lg">
                      <div><p className="font-medium">{faq.question}</p></div>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="sm" onClick={() => { setEditingItem(faq); setShowFaqModal(true); }}><Edit className="w-4 h-4" /></Button>
                         <Button variant="ghost" size="sm" onClick={() => deleteFaq(faq.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Rezultati</CardTitle></div>
                <Button onClick={() => setShowResultModal(true)}><Plus className="w-4 h-4" /> Dodaj rezultat</Button>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {results.map((result) => (
                     <div key={result.id} className="relative group aspect-square">
                       <img src={result.image_url} className="w-full h-full object-cover rounded-lg" alt="" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <Button variant="ghost" size="sm" onClick={() => deleteResult(result.id)}><Trash2 className="w-5 h-5 text-destructive" /></Button>
                       </div>
                     </div>
                   ))}
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="luxury-card">
              <CardHeader><CardTitle>Generalne postavke</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Hero naslov</Label><Input value={settings.hero_headline || ''} onChange={(e) => setSettings({...settings, hero_headline: e.target.value})} /></div>
                <div className="space-y-2"><Label>Hero podnaslov</Label><Textarea value={settings.hero_subheadline || ''} onChange={(e) => setSettings({...settings, hero_subheadline: e.target.value})} /></div>
                <Button onClick={() => updateSettings(settings)}>Spremi sve postavke</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <Dialog open={showProgramModal} onOpenChange={setShowProgramModal}>
          <DialogContent className="bg-card border-white/10"><DialogHeader><DialogTitle>Program</DialogTitle></DialogHeader>
            <ProgramForm initialData={editingItem} onSave={saveProgram} onCancel={() => setShowProgramModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
          <DialogContent className="bg-card border-white/10"><DialogHeader><DialogTitle>Kurs</DialogTitle></DialogHeader>
            <CourseForm initialData={editingItem} programs={programs} onSave={saveCourse} onCancel={() => setShowCourseModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
          <DialogContent className="bg-card border-white/10"><DialogHeader><DialogTitle>Lekcija</DialogTitle></DialogHeader>
            <LessonForm initialData={editingItem} courseId={selectedCourse?.id} onSave={saveLesson} onCancel={() => setShowLessonModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
          <DialogContent className="bg-card border-white/10"><DialogHeader><DialogTitle>Proizvod</DialogTitle></DialogHeader>
            <ProductForm initialData={editingItem} onSave={saveProduct} onCancel={() => setShowProductModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
          <DialogContent className="bg-card border-white/10"><DialogHeader><DialogTitle>FAQ</DialogTitle></DialogHeader>
            <FaqForm initialData={editingItem} onSave={saveFaq} onCancel={() => setShowFaqModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
          <DialogContent className="bg-card border-white/10"><DialogHeader><DialogTitle>Dodaj rezultat</DialogTitle></DialogHeader>
            <ResultForm onSave={saveResult} onCancel={() => setShowResultModal(false)} />
          </DialogContent>
        </Dialog>
        
        <Dialog open={showUserCoursesModal} onOpenChange={setShowUserCoursesModal}>
          <DialogContent className="bg-card border-white/10 max-w-lg">
            <DialogHeader><DialogTitle>Upravljanje kursevima</DialogTitle><DialogDescription>{selectedUser?.name}</DialogDescription></DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {courses.map((course) => {
                const hasAccess = selectedUser?.courses?.includes(course.id);
                return (
                  <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                    <p>{course.title}</p>
                    <Switch checked={hasAccess} onCheckedChange={() => toggleUserCourse(course.id, hasAccess)} />
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// --- Form Components ---

const ProgramForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    currency: initialData?.currency || 'EUR',
    thumbnail_url: initialData?.thumbnail_url || '', // OVO JE DODANO
    features: initialData?.features?.join('\n') || '',
    is_active: initialData?.is_active !== false
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, price: parseFloat(formData.price), features: formData.features.split('\n').filter(f => f.trim())}); }} className="space-y-4">
      <div><Label>Naziv</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
      <div><Label>Opis</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required /></div>
      <div><Label>Thumbnail URL (Slika)</Label><Input value={formData.thumbnail_url} onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})} placeholder="https://..." /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Cijena</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
        <div><Label>Valuta</Label><Select value={formData.currency} onValueChange={(v) => setFormData({...formData, currency: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EUR">EUR</SelectItem><SelectItem value="BAM">BAM</SelectItem></SelectContent></Select></div>
      </div>
      <div><Label>Značajke (po jedna u redu)</Label><Textarea value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} /></div>
      <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({...formData, is_active: v})} /><Label>Aktivan</Label></div>
      <div className="flex gap-3"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const CourseForm = ({ initialData, programs, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    program_id: initialData?.program_id || '',
    thumbnail_url: initialData?.thumbnail_url || '',
    order: initialData?.order || 0
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Naslov</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
      <div><Label>Program</Label><Select value={formData.program_id} onValueChange={(v) => setFormData({...formData, program_id: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Thumbnail URL</Label><Input value={formData.thumbnail_url} onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})} /></div>
      <div className="flex gap-3"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const LessonForm = ({ initialData, courseId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: initialData?.title || '', video_url: initialData?.video_url || '', course_id: courseId, order: initialData?.order || 0 });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Naslov</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
      <div><Label>Video URL</Label><Input value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} /></div>
      <div className="flex gap-3"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const ProductForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: initialData?.title || '', price: initialData?.price || 0 });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Naslov</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
      <div><Label>Cijena</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
      <div className="flex gap-3"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const FaqForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ question: initialData?.question || '', answer: initialData?.answer || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Pitanje</Label><Input value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} required /></div>
      <div><Label>Odgovor</Label><Textarea value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} required /></div>
      <div className="flex gap-3"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const ResultForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({ image_url: '', caption: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Image URL</Label><Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} required /></div>
      <div><Label>Opis</Label><Input value={formData.caption} onChange={(e) => setFormData({...formData, caption: e.target.value})} /></div>
      <div className="flex gap-3"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

export default Admin;
