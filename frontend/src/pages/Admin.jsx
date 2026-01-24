import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, ShoppingBag, Settings, BarChart3, 
  Plus, Trash2, Edit, Save, Loader2, MessageCircle, 
  FileText, Image, Video, DollarSign, Palette, GraduationCap,
  PlayCircle, Clock, ChevronDown, ChevronUp, Eye, EyeOff, X,
  Link as LinkIcon, Mail, Phone, Globe, Instagram, Youtube, Twitter
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
      
      setAnalytics(analyticsRes?.data);
      setUsers(usersRes?.data || []);
      setPrograms(programsRes?.data || []);
      setCourses(coursesRes?.data || []);
      setProducts(productsRes?.data || []);
      setFaqs(faqsRes?.data || []);
      setResults(resultsRes?.data || []);
      setSettings(Array.isArray(settingsRes?.data) ? settingsRes.data[0] : (settingsRes?.data || {}));
    } catch (error) {
      console.error('Greška pri učitavanju:', error);
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await settingsAPI.update(settings);
      toast.success('Postavke ažurirane');
    } catch (error) {
      console.error('Settings error:', error);
      toast.error('Greška! Provjeri konzolu (F12)');
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      toast.success('Uloga ažurirana');
    } catch (error) {
      toast.error('Greška pri promjeni uloge');
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
      loadAllData();
      toast.success('Ažurirano');
    } catch (e) { toast.error('Greška kod kurseva'); }
  };

  const loadCourseLessons = async (courseId) => {
    try {
      const response = await lessonsAPI.getAll(courseId);
      setCourseLessons(prev => ({ ...prev, [courseId]: response.data }));
    } catch (e) { console.error(e); }
  };

  const saveProgram = async (data) => {
    try {
      editingItem?.id ? await programsAPI.update(editingItem.id, data) : await programsAPI.create(data);
      loadAllData(); setShowProgramModal(false); toast.success('Program spremljen');
    } catch (e) { 
        console.error('Program Error:', e);
        toast.error('Greška pri spremanju programa'); 
    }
  };

  const deleteProgram = async (id) => {
    if (!confirm('Obrisati program?')) return;
    try { await programsAPI.delete(id); loadAllData(); } catch (e) { toast.error('Greška'); }
  };

  const saveCourse = async (data) => {
    try {
      editingItem?.id ? await coursesAPI.update(editingItem.id, data) : await coursesAPI.create(data);
      loadAllData(); setShowCourseModal(false); toast.success('Kurs spremljen');
    } catch (e) { toast.error('Greška pri spremanju kursa'); }
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
    } catch (e) { toast.error('Greška pri spremanju lekcije'); }
  };

  const deleteLesson = async (lId, cId) => {
    if (!confirm('Obrisati lekciju?')) return;
    try { await lessonsAPI.delete(lId); loadCourseLessons(cId); } catch (e) { toast.error('Greška'); }
  };

  const saveProduct = async (data) => {
    try {
      editingItem?.id ? await shopAPI.updateProduct(editingItem.id, data) : await shopAPI.createProduct(data);
      loadAllData(); setShowProductModal(false); toast.success('Proizvod spremljen');
    } catch (e) { 
        console.error('Product save error:', e);
        toast.error('Greška! Provjeri bazu za nove kolone'); 
    }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="heading-2 mb-2 text-white">Admin Control Center</h1>
          <p className="text-muted-foreground">Upravljanje sadržajem i platformom</p>
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

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="luxury-card border-white/5 bg-card/50 backdrop-blur-sm"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="text-primary" /></div><div><p className="text-2xl font-bold text-white">{analytics?.total_users || 0}</p><p className="text-sm text-muted-foreground">Korisnika</p></div></div></CardContent></Card>
              <Card className="luxury-card border-white/5 bg-card/50 backdrop-blur-sm"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"><DollarSign className="text-green-500" /></div><div><p className="text-2xl font-bold text-white">{analytics?.total_subscriptions || 0}</p><p className="text-sm text-muted-foreground">Pretplata</p></div></div></CardContent></Card>
              <Card className="luxury-card border-white/5 bg-card/50 backdrop-blur-sm"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><GraduationCap className="text-blue-500" /></div><div><p className="text-2xl font-bold text-white">{courses.length}</p><p className="text-sm text-muted-foreground">Kurseva</p></div></div></CardContent></Card>
              <Card className="luxury-card border-white/5 bg-card/50 backdrop-blur-sm"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center"><BookOpen className="text-purple-500" /></div><div><p className="text-2xl font-bold text-white">{programs.length}</p><p className="text-sm text-muted-foreground">Programa</p></div></div></CardContent></Card>
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <Card className="luxury-card border-white/5 bg-card/50">
              <CardHeader><CardTitle className="text-white">Upravljanje korisnicima</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow className="border-white/10"><TableHead className="text-white/60">Ime</TableHead><TableHead className="text-white/60">Email</TableHead><TableHead className="text-white/60">Uloga</TableHead><TableHead className="text-white/60">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-white/5">
                        <TableCell className="text-white">{user.name}</TableCell>
                        <TableCell className="text-white/70">{user.email}</TableCell>
                        <TableCell>
                          <Select value={user.role} onValueChange={(v) => updateUserRole(user.id, v)}>
                            <SelectTrigger className="w-24 bg-black/40 border-white/10 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-card border-white/10 text-white"><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Button variant="outline" size="sm" onClick={() => openUserCoursesModal(user)} className="border-white/10 text-white">Kursevi</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COURSES */}
          <TabsContent value="courses">
            <Card className="luxury-card border-white/5 bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Kursevi i Lekcije</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowCourseModal(true); }} className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-1" /> Novi Kurs</Button>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {courses.map((course) => (
                    <AccordionItem key={course.id} value={course.id} className="border-white/10">
                      <AccordionTrigger className="hover:no-underline px-4 text-white" onClick={() => !courseLessons[course.id] && loadCourseLessons(course.id)}>
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>{course.title} <Badge variant="outline" className="ml-2 border-primary/30 text-primary">{course.program_name}</Badge></span>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(course); setShowCourseModal(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteCourse(course.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <Button size="sm" className="mb-4 bg-white/5 border border-white/10 hover:bg-white/10" onClick={() => { setSelectedCourse(course); setEditingItem(null); setShowLessonModal(true); }}><Plus className="w-4 h-4 mr-1" /> Dodaj Lekciju</Button>
                        <div className="space-y-2">
                          {courseLessons[course.id]?.map((lesson) => (
                            <div key={lesson.id} className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                              <span className="text-white/80">{lesson.title}</span>
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

          {/* SHOP */}
          <TabsContent value="shop">
            <Card className="luxury-card border-white/5 bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Shop Proizvodi</CardTitle>
                    <Button onClick={() => { setEditingItem(null); setShowProductModal(true); }}><Plus className="w-4 h-4 mr-1" /> Novi Proizvod</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow className="border-white/10"><TableHead className="text-white/60">Slika</TableHead><TableHead className="text-white/60">Naziv</TableHead><TableHead className="text-white/60">Kategorija</TableHead><TableHead className="text-white/60">Cijena</TableHead><TableHead className="text-white/60 text-right">Akcije</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {products.map((prod) => (
                            <TableRow key={prod.id} className="border-white/5">
                                <TableCell><img src={prod.image_url} className="w-10 h-10 object-cover rounded" /></TableCell>
                                <TableCell className="text-white font-medium">{prod.name}</TableCell>
                                <TableCell><Badge className="bg-white/5 text-white/60 border-white/10">{prod.category || 'Nema'}</Badge></TableCell>
                                <TableCell className="text-white">€{prod.price}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => { setEditingItem(prod); setShowProductModal(true); }}><Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => { if(confirm('Obrisati?')) shopAPI.deleteProduct(prod.id).then(loadAllData); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Branding */}
              <Card className="luxury-card border-white/5 bg-card/50">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Branding</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label className="text-white/60">Naziv Sajta</Label><Input className="bg-black/40 border-white/10 text-white" value={settings.site_name || ''} onChange={(e) => setSettings({...settings, site_name: e.target.value})} /></div>
                  <div><Label className="text-white/60">Hero Headline</Label><Input className="bg-black/40 border-white/10 text-white" value={settings.hero_headline || ''} onChange={(e) => setSettings({...settings, hero_headline: e.target.value})} /></div>
                  <div><Label className="text-white/60">Hero Subheadline</Label><Textarea className="bg-black/40 border-white/10 text-white" value={settings.hero_subheadline || ''} onChange={(e) => setSettings({...settings, hero_subheadline: e.target.value})} /></div>
                </CardContent>
              </Card>

              {/* Media */}
              <Card className="luxury-card border-white/5 bg-card/50">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Video className="w-5 h-5 text-primary" /> Media (Mux)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label className="text-white/60">Mux Hero Playback ID</Label><Input className="bg-black/40 border-white/10 text-white" value={settings.hero_video_url || ''} onChange={(e) => setSettings({...settings, hero_video_url: e.target.value})} /></div>
                  <div><Label className="text-white/60">Hero Image URL (Banner)</Label><Input className="bg-black/40 border-white/10 text-white" value={settings.hero_image_url || ''} onChange={(e) => setSettings({...settings, hero_image_url: e.target.value})} /></div>
                </CardContent>
              </Card>

              {/* Socials */}
              <Card className="luxury-card border-white/5 bg-card/50">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Instagram className="w-5 h-5 text-primary" /> Social Networks</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label className="text-white/60">Instagram URL</Label><Input className="bg-black/40 border-white/10 text-white" value={settings.instagram_url || ''} onChange={(e) => setSettings({...settings, instagram_url: e.target.value})} /></div>
                  <div><Label className="text-white/60">YouTube URL</Label><Input className="bg-black/40 border-white/10 text-white" value={settings.youtube_url || ''} onChange={(e) => setSettings({...settings, youtube_url: e.target.value})} /></div>
                  <div><Label className="text-white/60">TikTok URL</Label><Input className="bg-black/40 border-white/10 text-white" value={settings.tiktok_url || ''} onChange={(e) => setSettings({...settings, tiktok_url: e.target.value})} /></div>
                  <div><Label className="text-white/60">Discord Invite</Label><Input className="bg-black/40 border-white/10 text-white" value={settings.discord_invite_url || ''} onChange={(e) => setSettings({...settings, discord_invite_url: e.target.value})} /></div>
                </CardContent>
              </Card>

              {/* Visibility */}
              <Card className="luxury-card border-white/5 bg-card/50">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /> Vidljivost</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between"><Label className="text-white">Prikaži Rezultate</Label><Switch checked={settings.show_results_section} onCheckedChange={(v) => setSettings({...settings, show_results_section: v})} /></div>
                  <div className="flex items-center justify-between"><Label className="text-white">Prikaži FAQ</Label><Switch checked={settings.show_faq_section} onCheckedChange={(v) => setSettings({...settings, show_faq_section: v})} /></div>
                  <div className="flex items-center justify-between"><Label className="text-white">Prikaži Shop</Label><Switch checked={settings.show_shop_section} onCheckedChange={(v) => setSettings({...settings, show_shop_section: v})} /></div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end pt-4"><Button size="lg" onClick={handleUpdateSettings} className="bg-primary hover:bg-primary/90 px-10"><Save className="mr-2 w-5 h-5" /> Spremi Sve Postavke</Button></div>
          </TabsContent>
        </Tabs>

        {/* MODALS (Postojeći Modal Forms - Program, Course, Lesson, Product, Faq, Result) */}
        <Dialog open={showProgramModal} onOpenChange={setShowProgramModal}>
          <DialogContent className="bg-card border-white/10 text-white"><DialogHeader><DialogTitle>Program</DialogTitle></DialogHeader>
            <ProgramForm initialData={editingItem} onSave={saveProgram} onCancel={() => setShowProgramModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
          <DialogContent className="bg-card border-white/10 text-white"><DialogHeader><DialogTitle>Kurs</DialogTitle></DialogHeader>
            <CourseForm initialData={editingItem} programs={programs} onSave={saveCourse} onCancel={() => setShowCourseModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
          <DialogContent className="bg-card border-white/10 text-white"><DialogHeader><DialogTitle>Lekcija (Mux Video)</DialogTitle></DialogHeader>
            <LessonForm initialData={editingItem} courseId={selectedCourse?.id} onSave={saveLesson} onCancel={() => setShowLessonModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
          <DialogContent className="bg-card border-white/10 text-white"><DialogHeader><DialogTitle>Proizvod</DialogTitle></DialogHeader>
            <ProductForm initialData={editingItem} onSave={saveProduct} onCancel={() => setShowProductModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
          <DialogContent className="bg-card border-white/10 text-white"><DialogHeader><DialogTitle>FAQ</DialogTitle></DialogHeader>
            <FaqForm initialData={editingItem} onSave={saveFaq} onCancel={() => setShowFaqModal(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// --- FORM KOMPONENTE (Sve fixano sa error handlingom) ---

const ProgramForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    thumbnail_url: initialData?.thumbnail_url || '',
    features: initialData?.features?.join('\n') || '',
    is_active: initialData?.is_active !== false
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, price: Number(formData.price), features: formData.features.split('\n').filter(f => f.trim())}); }} className="space-y-4">
      <div><Label>Naziv</Label><Input className="bg-black/40 border-white/10" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
      <div><Label>Cijena (€)</Label><Input type="number" className="bg-black/40 border-white/10" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
      <div><Label>Značajke (svaka u novi red)</Label><Textarea className="bg-black/40 border-white/10" value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} /></div>
      <div className="flex gap-2 pt-4"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
    </form>
  );
};

const ProductForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ 
    name: initialData?.name || '', 
    description: initialData?.description || '',
    price: initialData?.price || 0,
    image_url: initialData?.image_url || '', 
    category: initialData?.category || ''   
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, price: Number(formData.price)}); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Naziv</Label><Input className="bg-black/40 border-white/10" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
        <div><Label>Kategorija</Label><Input className="bg-black/40 border-white/10" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} /></div>
      </div>
      <div><Label>Opis</Label><Textarea className="bg-black/40 border-white/10" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
      <div><Label>Slika URL</Label><Input className="bg-black/40 border-white/10" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
      <div><Label>Cijena (€)</Label><Input type="number" className="bg-black/40 border-white/10" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
      <div className="flex gap-2 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1">Odustani</Button><Button type="submit" className="flex-1">Spremi</Button></div>
    </form>
  );
};

// Course, Lesson, Faq ostaju slični ali sa bg-black/40 stilom
const CourseForm = ({ initialData, programs, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ title: initialData?.title || '', program_id: initialData?.program_id || '', thumbnail_url: initialData?.thumbnail_url || '' });
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
        <div><Label>Naziv Kursa</Label><Input className="bg-black/40 border-white/10" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
        <div><Label>Program</Label><Select value={formData.program_id} onValueChange={(v) => setFormData({...formData, program_id: v})}><SelectTrigger className="bg-black/40 border-white/10"><SelectValue /></SelectTrigger><SelectContent className="bg-card border-white/10">{programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="flex gap-2 pt-4"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
      </form>
    );
};

const LessonForm = ({ initialData, courseId, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ title: initialData?.title || '', video_url: initialData?.video_url || '', course_id: courseId });
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
        <div><Label>Naslov Lekcije</Label><Input className="bg-black/40 border-white/10" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
        <div><Label>Mux Playback ID</Label><Input className="bg-black/40 border-white/10" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} required /></div>
        <div className="flex gap-2 pt-4"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
      </form>
    );
};

const FaqForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ question: initialData?.question || '', answer: initialData?.answer || '' });
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
        <div><Label>Pitanje</Label><Input className="bg-black/40 border-white/10" value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} required /></div>
        <div><Label>Odgovor</Label><Textarea className="bg-black/40 border-white/10" value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} required /></div>
        <div className="flex gap-2 pt-4"><Button type="button" variant="outline" onClick={onCancel}>Odustani</Button><Button type="submit">Spremi</Button></div>
      </form>
    );
};

export default Admin;
