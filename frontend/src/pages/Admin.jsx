import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, ShoppingBag, Settings, BarChart3, 
  Plus, Trash2, Edit, Save, Loader2, MessageCircle, 
  FileText, Image, Video, DollarSign, Palette, GraduationCap,
  PlayCircle, Clock, ChevronDown, ChevronUp, Eye, EyeOff, X,
  Link as LinkIcon, Mail, Phone, Globe
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

  // --- SETTINGS LOGIC ---
  const handleUpdateSettings = async () => {
    try {
      await settingsAPI.update(settings);
      toast.success('Postavke ažurirane');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Greška pri ažuriranju postavki');
    }
  };

  // --- USER LOGIC ---
  const updateUserRole = async (userId, role) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      toast.success('Uloga ažurirana');
    } catch (error) {
      toast.error('Greška');
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
          const uCourses = u.courses || [];
          return {
            ...u,
            courses: hasAccess ? uCourses.filter(c => c !== courseId) : [...uCourses, courseId]
          };
        }
        return u;
      }));
      setSelectedUser(prev => ({
        ...prev,
        courses: hasAccess ? (prev.courses || []).filter(c => c !== courseId) : [...(prev.courses || []), courseId]
      }));
      toast.success('Ažurirano');
    } catch (e) { toast.error('Greška'); }
  };

  // --- PROGRAMS & COURSES LOGIC ---
  const loadCourseLessons = async (courseId) => {
    try {
      const response = await lessonsAPI.getAll(courseId);
      setCourseLessons(prev => ({ ...prev, [courseId]: response.data }));
    } catch (e) { console.error(e); }
  };

  const saveProgram = async (data) => {
    try {
      editingItem?.id ? await programsAPI.update(editingItem.id, data) : await programsAPI.create(data);
      loadAllData(); setShowProgramModal(false); toast.success('Spremljeno');
    } catch (e) { toast.error('Greška'); }
  };

  const deleteProgram = async (id) => {
    if (!confirm('Obrisati program?')) return;
    try { await programsAPI.delete(id); loadAllData(); } catch (e) { toast.error('Greška'); }
  };

  const saveCourse = async (data) => {
    try {
      editingItem?.id ? await coursesAPI.update(editingItem.id, data) : await coursesAPI.create(data);
      loadAllData(); setShowCourseModal(false); toast.success('Kurs spremljen');
    } catch (e) { toast.error('Greška'); }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Obrisati kurs?')) return;
    try { await coursesAPI.delete(id); loadAllData(); } catch (e) { toast.error('Greška'); }
  };

  const saveLesson = async (data) => {
    try {
      editingItem?.id ? await lessonsAPI.update(editingItem.id, data) : await lessonsAPI.create(data);
      if (selectedCourse) loadCourseLessons(selectedCourse.id);
      setShowLessonModal(false); toast.success('Lekcija spremljena');
    } catch (e) { toast.error('Greška'); }
  };

  const deleteLesson = async (lId, cId) => {
    if (!confirm('Obrisati lekciju?')) return;
    try { await lessonsAPI.delete(lId); loadCourseLessons(cId); } catch (e) { toast.error('Greška'); }
  };

  // --- SHOP & CONTENT LOGIC ---
  const saveProduct = async (data) => {
    try {
      editingItem?.id ? await shopAPI.updateProduct(editingItem.id, data) : await shopAPI.createProduct(data);
      loadAllData(); setShowProductModal(false); toast.success('Proizvod spremljen');
    } catch (e) { toast.error('Greška'); }
  };

  const saveFaq = async (data) => {
    try {
      editingItem?.id ? await faqsAPI.update(editingItem.id, data) : await faqsAPI.create(data);
      loadAllData(); setShowFaqModal(false); toast.success('FAQ spremljen');
    } catch (e) { toast.error('Greška'); }
  };

  const deleteFaq = async (id) => {
    try { await faqsAPI.delete(id); loadAllData(); } catch (e) { toast.error('Greška'); }
  };

  const saveResult = async (data) => {
    try { await resultsAPI.create(data); loadAllData(); setShowResultModal(false); toast.success('Rezultat dodan'); } catch (e) { toast.error('Greška'); }
  };

  const deleteResult = async (id) => {
    try { await resultsAPI.delete(id); loadAllData(); } catch (e) { toast.error('Greška'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="heading-2 mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Upravljajte platformom i postavkama</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-card border border-white/5 p-1 rounded-xl flex-wrap h-auto">
            <TabsTrigger value="overview" className="gap-2"><BarChart3 className="w-4 h-4" /> Pregled</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /> Korisnici</TabsTrigger>
            <TabsTrigger value="courses" className="gap-2"><GraduationCap className="w-4 h-4" /> Kursevi</TabsTrigger>
            <TabsTrigger value="programs" className="gap-2"><BookOpen className="w-4 h-4" /> Programi</TabsTrigger>
            <TabsTrigger value="shop" className="gap-2"><ShoppingBag className="w-4 h-4" /> Shop</TabsTrigger>
            <TabsTrigger value="content" className="gap-2"><FileText className="w-4 h-4" /> Sadržaj</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" /> Postavke</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="luxury-card"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="text-primary" /></div><div><p className="text-2xl font-bold">{analytics?.total_users || 0}</p><p className="text-sm text-muted-foreground">Korisnika</p></div></div></CardContent></Card>
              <Card className="luxury-card"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"><DollarSign className="text-green-500" /></div><div><p className="text-2xl font-bold">{analytics?.total_subscriptions || 0}</p><p className="text-sm text-muted-foreground">Pretplata</p></div></div></CardContent></Card>
              <Card className="luxury-card"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><GraduationCap className="text-blue-500" /></div><div><p className="text-2xl font-bold">{courses.length}</p><p className="text-sm text-muted-foreground">Kurseva</p></div></div></CardContent></Card>
              <Card className="luxury-card"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center"><BookOpen className="text-purple-500" /></div><div><p className="text-2xl font-bold">{programs.length}</p><p className="text-sm text-muted-foreground">Programa</p></div></div></CardContent></Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="luxury-card">
              <CardHeader><CardTitle>Upravljanje korisnicima</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Ime</TableHead><TableHead>Email</TableHead><TableHead>Uloga</TableHead><TableHead>Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select value={user.role} onValueChange={(v) => updateUserRole(user.id, v)}>
                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Button variant="outline" size="sm" onClick={() => openUserCoursesModal(user)}>Kursevi</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses & Lessons Tab */}
          <TabsContent value="courses">
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Kursevi i Lekcije</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowCourseModal(true); }}><Plus className="w-4 h-4" /> Novi Kurs</Button>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {courses.map((course) => (
                    <AccordionItem key={course.id} value={course.id} className="border-white/10">
                      <AccordionTrigger className="hover:no-underline px-4" onClick={() => !courseLessons[course.id] && loadCourseLessons(course.id)}>
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>{course.title} <Badge variant="outline" className="ml-2">{course.program_name}</Badge></span>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(course); setShowCourseModal(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteCourse(course.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <Button size="sm" className="mb-4" onClick={() => { setSelectedCourse(course); setEditingItem(null); setShowLessonModal(true); }}><Plus className="w-4 h-4" /> Dodaj Lekciju</Button>
                        <div className="space-y-2">
                          {courseLessons[course.id]?.map((lesson) => (
                            <div key={lesson.id} className="flex justify-between p-3 bg-white/5 rounded-lg">
                              <span>{lesson.title}</span>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedCourse(course); setEditingItem(lesson); setShowLessonModal(true); }}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteLesson(lesson.id, course.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                              </div>
                            </div>
                          ))}
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
                <CardTitle>Programi</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowProgramModal(true); }}><Plus className="w-4 h-4" /> Novi Program</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Naziv</TableHead><TableHead>Cijena</TableHead><TableHead>Status</TableHead><TableHead>Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {programs.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>€{p.price}</TableCell>
                        <TableCell><Badge variant={p.is_active ? "default" : "destructive"}>{p.is_active ? "Aktivan" : "Neaktivan"}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(p); setShowProgramModal(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteProgram(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
                <CardTitle>Shop Proizvodi</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowProductModal(true); }}><Plus className="w-4 h-4" /> Novi Proizvod</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Naziv</TableHead><TableHead>Cijena</TableHead><TableHead>Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map((prod) => (
                      <TableRow key={prod.id}>
                        <TableCell>{prod.title}</TableCell><TableCell>€{prod.price}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(prod); setShowProductModal(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { if(confirm('Obrisati?')) shopAPI.deleteProduct(prod.id).then(loadAllData) }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content (FAQ & Results) */}
          <TabsContent value="content" className="space-y-6">
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>FAQ</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowFaqModal(true); }}><Plus className="w-4 h-4" /> Novo Pitanje</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((f) => (
                  <div key={f.id} className="flex justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                    <div><p className="font-medium">{f.question}</p></div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingItem(f); setShowFaqModal(true); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteFaq(f.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Rezultati</CardTitle><Button onClick={() => setShowResultModal(true)}><Plus className="w-4 h-4" /> Dodaj</Button></CardHeader>
              <CardContent><div className="grid grid-cols-4 gap-4">
                {results.map((r) => (
                  <div key={r.id} className="relative group"><img src={r.image_url} className="w-full aspect-square object-cover rounded-lg" /><Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteResult(r.id)}><Trash2 className="w-4 h-4" /></Button></div>
                ))}
              </div></CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - SA SVIM POLJIMA */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="luxury-card">
                <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Branding</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Naziv Sajta</Label><Input value={settings.site_name || ''} onChange={(e) => setSettings({...settings, site_name: e.target.value})} /></div>
                  <div><Label>Logo URL</Label><Input value={settings.logo_url || ''} onChange={(e) => setSettings({...settings, logo_url: e.target.value})} /></div>
                  <div><Label>Favicon URL</Label><Input value={settings.favicon_url || ''} onChange={(e) => setSettings({...settings, favicon_url: e.target.value})} /></div>
                  <div><Label>Tema</Label><Select value={settings.theme} onValueChange={(v) => setSettings({...settings, theme: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dark-luxury">Dark Luxury</SelectItem><SelectItem value="gold">Gold</SelectItem></SelectContent></Select></div>
                </CardContent>
              </Card>
              <Card className="luxury-card">
                <CardHeader><CardTitle className="flex items-center gap-2"><Video className="w-5 h-5" /> Hero & Media</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Hero Video URL</Label><Input value={settings.hero_video_url || ''} onChange={(e) => setSettings({...settings, hero_video_url: e.target.value})} /></div>
                  <div><Label>Headline</Label><Input value={settings.hero_headline || ''} onChange={(e) => setSettings({...settings, hero_headline: e.target.value})} /></div>
                  <div><Label>Subheadline</Label><Textarea value={settings.hero_subheadline || ''} onChange={(e) => setSettings({...settings, hero_subheadline: e.target.value})} /></div>
                </CardContent>
              </Card>
              <Card className="luxury-card">
                <CardHeader><CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5" /> Social & Contact</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Discord Link</Label><Input value={settings.discord_invite_url || ''} onChange={(e) => setSettings({...settings, discord_invite_url: e.target.value})} /></div>
                  <div><Label>Contact Email</Label><Input value={settings.contact_email || ''} onChange={(e) => setSettings({...settings, contact_email: e.target.value})} /></div>
                  <div><Label>Footer Text</Label><Input value={settings.footer_text || ''} onChange={(e) => setSettings({...settings, footer_text: e.target.value})} /></div>
                </CardContent>
              </Card>
              <Card className="luxury-card">
                <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" /> Vidljivost</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><Label>Prikaži Rezultate</Label><Switch checked={settings.show_results_section} onCheckedChange={(v) => setSettings({...settings, show_results_section: v})} /></div>
                  <div className="flex items-center justify-between"><Label>Prikaži FAQ</Label><Switch checked={settings.show_faq_section} onCheckedChange={(v) => setSettings({...settings, show_faq_section: v})} /></div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end pt-4"><Button size="lg" onClick={handleUpdateSettings}><Save className="mr-2 w-5 h-5" /> Spremi Sve Postavke</Button></div>
          </TabsContent>
        </Tabs>

        {/* MODALS */}
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
          <DialogContent className="bg-card border-white/10"><DialogHeader><DialogTitle>Dodaj Rezultat</DialogTitle></DialogHeader>
            <ResultForm onSave={saveResult} onCancel={() => setShowResultModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showUserCoursesModal} onOpenChange={setShowUserCoursesModal}>
          <DialogContent className="bg-card border-white/10 max-w-lg">
            <DialogHeader><DialogTitle>Kursevi korisnika</DialogTitle><DialogDescription>{selectedUser?.name}</DialogDescription></DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto mt-4">
              {courses.map((c) => {
                const access = selectedUser?.courses?.includes(c.id);
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span>{c.title}</span><Switch checked={access} onCheckedChange={() => toggleUserCourse(c.id, access)} />
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

// --- FORM COMPONENTS ---
const ProgramForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    currency: initialData?.currency || 'EUR',
    thumbnail_url: initialData?.thumbnail_url || '',
    features: initialData?.features?.join('\n') || '',
    is_active: initialData?.is_active !== false
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, price: parseFloat(formData.price), features: formData.features.split('\n').filter(f => f.trim())}); }} className="space-y-4">
      <div><Label>Naziv</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
      <div><Label>Opis</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required /></div>
      <div><Label>Thumbnail URL (Slika)</Label><Input value={formData.thumbnail_url} onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Cijena</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
        <div><Label>Valuta</Label><Input value={formData.currency} disabled /></div>
      </div>
      <div><Label>Značajke (svaka u novi red)</Label><Textarea value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} /></div>
      <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({...formData, is_active: v})} /><Label>Aktivan</Label></div>
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const CourseForm = ({ initialData, programs, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: initialData?.title || '', program_id: initialData?.program_id || '', thumbnail_url: initialData?.thumbnail_url || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Naziv Kursa</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
      <div><Label>Program</Label><Select value={formData.program_id} onValueChange={(v) => setFormData({...formData, program_id: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Thumbnail URL</Label><Input value={formData.thumbnail_url} onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})} /></div>
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const LessonForm = ({ initialData, courseId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: initialData?.title || '', video_url: initialData?.video_url || '', course_id: courseId });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Naslov Lekcije</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
      <div><Label>Video URL</Label><Input value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} required /></div>
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const ProductForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: initialData?.title || '', price: initialData?.price || 0 });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Naziv</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
      <div><Label>Cijena</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const FaqForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ question: initialData?.question || '', answer: initialData?.answer || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Pitanje</Label><Input value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} required /></div>
      <div><Label>Odgovor</Label><Textarea value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} required /></div>
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const ResultForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({ image_url: '', caption: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Image URL</Label><Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} required /></div>
      <div><Label>Opis (opciono)</Label><Input value={formData.caption} onChange={(e) => setFormData({...formData, caption: e.target.value})} /></div>
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Dodaj</Button></div>
    </form>
  );
};

export default Admin;
