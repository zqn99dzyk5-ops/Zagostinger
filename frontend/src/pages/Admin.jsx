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
      console.error('Error loading data:', error);
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
      console.error('Settings Update Error:', error);
      toast.error('Greška pri ažuriranju! Provjeri konzolu.');
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      toast.success('Uloga ažurirana');
    } catch (error) {
      toast.error('Greška pri promeni uloge');
    }
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
      toast.success('Pristup ažuriran');
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
      loadAllData(); setShowProgramModal(false); toast.success('Program sačuvan');
    } catch (e) { toast.error('Greška pri spremanju plana'); }
  };

  const saveCourse = async (data) => {
    try {
      editingItem?.id ? await coursesAPI.update(editingItem.id, data) : await coursesAPI.create(data);
      loadAllData(); setShowCourseModal(false); toast.success('Kurs sačuvan');
    } catch (e) { toast.error('Greška pri spremanju kursa'); }
  };

  const saveLesson = async (data) => {
    try {
      editingItem?.id ? await lessonsAPI.update(editingItem.id, data) : await lessonsAPI.create(data);
      if (selectedCourse) loadCourseLessons(selectedCourse.id);
      setShowLessonModal(false); toast.success('Lekcija sačuvana');
    } catch (e) { toast.error('Greška pri spremanju lekcije'); }
  };

  const saveProduct = async (data) => {
    try {
      editingItem?.id ? await shopAPI.updateProduct(editingItem.id, data) : await shopAPI.createProduct(data);
      loadAllData(); setShowProductModal(false); toast.success('Proizvod sačuvan');
    } catch (e) { toast.error('Greška pri spremanju proizvoda'); }
  };

  const saveFaq = async (data) => {
    try {
      editingItem?.id ? await faqsAPI.update(editingItem.id, data) : await faqsAPI.create(data);
      loadAllData(); setShowFaqModal(false); toast.success('FAQ sačuvan');
    } catch (e) { toast.error('Greška pri spremanju FAQ'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-orange-500 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Admin Control Center</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Upravljanje Continental Akademijom</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl flex-wrap h-auto">
            <TabsTrigger value="overview" className="gap-2 uppercase font-black text-xs italic"><BarChart3 className="w-4 h-4" /> Pregled</TabsTrigger>
            <TabsTrigger value="users" className="gap-2 uppercase font-black text-xs italic"><Users className="w-4 h-4" /> Korisnici</TabsTrigger>
            <TabsTrigger value="courses" className="gap-2 uppercase font-black text-xs italic"><GraduationCap className="w-4 h-4" /> Kursevi</TabsTrigger>
            <TabsTrigger value="programs" className="gap-2 uppercase font-black text-xs italic"><BookOpen className="w-4 h-4" /> Programi</TabsTrigger>
            <TabsTrigger value="shop" className="gap-2 uppercase font-black text-xs italic"><ShoppingBag className="w-4 h-4" /> Shop</TabsTrigger>
            <TabsTrigger value="content" className="gap-2 uppercase font-black text-xs italic"><FileText className="w-4 h-4" /> Sadržaj</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 uppercase font-black text-xs italic"><Settings className="w-4 h-4" /> Postavke</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Korisnika', val: analytics?.total_users, icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { label: 'Aktivnih Pretplata', val: analytics?.total_subscriptions, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Kurseva', val: courses.length, icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Programa', val: programs.length, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' }
              ].map((item, i) => (
                <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-md">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}>
                        <item.icon className={item.color} />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">{item.val || 0}</p>
                        <p className="text-xs uppercase font-black text-white/40 tracking-widest">{item.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader><CardTitle className="uppercase font-black italic">Upravljanje korisnicima</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow className="border-white/10"><TableHead>Ime</TableHead><TableHead>Email</TableHead><TableHead>Uloga</TableHead><TableHead>Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-white/5">
                        <TableCell className="font-bold">{user.name}</TableCell>
                        <TableCell className="text-white/60">{user.email}</TableCell>
                        <TableCell>
                          <Select value={user.role} onValueChange={(v) => updateUserRole(user.id, v)}>
                            <SelectTrigger className="w-24 bg-black border-white/10"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#0f0f0f] border-white/10 text-white"><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setShowUserCoursesModal(true); }} className="border-white/10 hover:bg-white/5">Pristup</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COURSES */}
          <TabsContent value="courses">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="uppercase font-black italic">Kursevi i Lekcije</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowCourseModal(true); }} className="bg-orange-600 hover:bg-orange-700 font-black italic"><Plus className="w-4 h-4 mr-2" /> Novi Kurs</Button>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {courses.map((course) => (
                    <AccordionItem key={course.id} value={course.id} className="border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden">
                      <AccordionTrigger className="hover:no-underline px-6 py-4" onClick={() => !courseLessons[course.id] && loadCourseLessons(course.id)}>
                        <div className="flex items-center justify-between w-full pr-4 uppercase font-black italic text-sm">
                          <span>{course.title} <Badge variant="outline" className="ml-2 border-orange-500/50 text-orange-500">{course.program_name}</Badge></span>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(course); setShowCourseModal(true); }}><Edit className="w-4 h-4 text-white/50" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { if(confirm('Obrisati kurs?')) coursesAPI.delete(course.id).then(loadAllData) }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <Button size="sm" className="mb-4 bg-white/5 border-white/10 hover:bg-white/10 font-bold" onClick={() => { setSelectedCourse(course); setEditingItem(null); setShowLessonModal(true); }}><Plus className="w-4 h-4 mr-2" /> Dodaj Lekciju</Button>
                        <div className="space-y-2">
                          {courseLessons[course.id]?.map((lesson) => (
                            <div key={lesson.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                              <span className="font-bold text-white/80">{lesson.title}</span>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedCourse(course); setEditingItem(lesson); setShowLessonModal(true); }}><Edit className="w-4 h-4 text-white/40" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => { if(confirm('Obrisati lekciju?')) lessonsAPI.delete(lesson.id).then(() => loadCourseLessons(course.id)) }}><Trash2 className="w-4 h-4 text-destructive/50" /></Button>
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

          {/* PROGRAMS */}
          <TabsContent value="programs">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="uppercase font-black italic">Pretplatnički Planovi</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowProgramModal(true); }} className="bg-orange-600 hover:bg-orange-700 font-black italic"><Plus className="w-4 h-4 mr-2" /> Novi Plan</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow className="border-white/10"><TableHead>Naziv</TableHead><TableHead>Cena</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {programs.map((p) => (
                      <TableRow key={p.id} className="border-white/5">
                        <TableCell className="font-black italic uppercase">{p.name}</TableCell>
                        <TableCell className="font-black text-orange-500">€{p.price}</TableCell>
                        <TableCell><Badge variant={p.is_active ? "default" : "destructive"} className="uppercase font-black text-[10px]">{p.is_active ? "Aktivan" : "Offline"}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(p); setShowProgramModal(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { if(confirm('Obrisati plan?')) programsAPI.delete(p.id).then(loadAllData) }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SHOP */}
          <TabsContent value="shop">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="uppercase font-black italic">Digital Shop</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowProductModal(true); }} className="bg-orange-600 hover:bg-orange-700 font-black italic"><Plus className="w-4 h-4 mr-2" /> Novi Proizvod</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow className="border-white/10"><TableHead>Slika</TableHead><TableHead>Naziv</TableHead><TableHead>Kategorija</TableHead><TableHead>Cena</TableHead><TableHead className="text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map((prod) => (
                      <TableRow key={prod.id} className="border-white/5">
                        <TableCell><img src={prod.image_url} className="w-10 h-10 object-cover rounded-lg border border-white/10" /></TableCell>
                        <TableCell className="font-bold uppercase tracking-tighter italic">{prod.name}</TableCell>
                        <TableCell><Badge className="bg-white/5 border-white/10 text-white/60">{prod.category || 'Digital'}</Badge></TableCell>
                        <TableCell className="font-black text-orange-500">€{prod.price}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(prod); setShowProductModal(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { if(confirm('Obrisati proizvod?')) shopAPI.deleteProduct(prod.id).then(loadAllData) }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
            <div className="grid md:grid-cols-2 gap-8">
              {/* Branding */}
              <Card className="bg-white/5 border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3"><Palette className="text-orange-500" /> Branding</h3>
                <div className="space-y-6">
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Naziv Platforme</Label><Input value={settings.site_name || ''} onChange={(e) => setSettings({...settings, site_name: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Logo URL</Label><Input value={settings.logo_url || ''} onChange={(e) => setSettings({...settings, logo_url: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Footer Opis</Label><Textarea value={settings.footer_text || ''} onChange={(e) => setSettings({...settings, footer_text: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                </div>
              </Card>

              {/* Media & Hero */}
              <Card className="bg-white/5 border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3"><Video className="text-orange-500" /> Hero & Media</h3>
                <div className="space-y-6">
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Mux Hero Playback ID</Label><Input value={settings.hero_video_url || ''} onChange={(e) => setSettings({...settings, hero_video_url: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Hero Headline</Label><Input value={settings.hero_headline || ''} onChange={(e) => setSettings({...settings, hero_headline: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Hero Image (Banner) URL</Label><Input value={settings.hero_image_url || ''} onChange={(e) => setSettings({...settings, hero_image_url: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                </div>
              </Card>

              {/* Social Links */}
              <Card className="bg-white/5 border-white/10 p-8 rounded-3xl backdrop-blur-xl col-span-full">
                <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3"><Globe className="text-orange-500" /> Social Networks</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest flex items-center gap-2"><Instagram className="w-3 h-3" /> Instagram URL</Label><Input value={settings.instagram_url || ''} onChange={(e) => setSettings({...settings, instagram_url: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest flex items-center gap-2"><Youtube className="w-3 h-3" /> YouTube URL</Label><Input value={settings.youtube_url || ''} onChange={(e) => setSettings({...settings, youtube_url: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest flex items-center gap-2"><Globe className="w-3 h-3" /> TikTok URL</Label><Input value={settings.tiktok_url || ''} onChange={(e) => setSettings({...settings, tiktok_url: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest flex items-center gap-2"><MessageCircle className="w-3 h-3" /> Discord Invite</Label><Input value={settings.discord_invite_url || ''} onChange={(e) => setSettings({...settings, discord_invite_url: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                  <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest flex items-center gap-2"><Mail className="w-3 h-3" /> Kontakt Email</Label><Input value={settings.contact_email || ''} onChange={(e) => setSettings({...settings, contact_email: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
                </div>
              </Card>
            </div>
            <div className="flex justify-end pt-8"><Button onClick={handleUpdateSettings} className="bg-orange-600 hover:bg-orange-700 py-8 px-12 rounded-[2rem] font-black italic uppercase text-lg shadow-[0_0_40px_rgba(234,88,12,0.3)]"><Save className="mr-3 w-6 h-6" /> Sačuvaj sve promene</Button></div>
          </TabsContent>
        </Tabs>

        {/* --- MODALS --- */}
        <Dialog open={showProgramModal} onOpenChange={setShowProgramModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-2xl rounded-[2rem]">
            <DialogHeader><DialogTitle className="uppercase font-black italic text-2xl">Plan Pretplate</DialogTitle></DialogHeader>
            <ProgramForm initialData={editingItem} onSave={saveProgram} onCancel={() => setShowProgramModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-xl rounded-[2rem]">
            <DialogHeader><DialogTitle className="uppercase font-black italic text-2xl">Kurs</DialogTitle></DialogHeader>
            <CourseForm initialData={editingItem} programs={programs} onSave={saveCourse} onCancel={() => setShowCourseModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-xl rounded-[2rem]">
            <DialogHeader><DialogTitle className="uppercase font-black italic text-2xl">Lekcija</DialogTitle></DialogHeader>
            <LessonForm initialData={editingItem} courseId={selectedCourse?.id} onSave={saveLesson} onCancel={() => setShowLessonModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-2xl rounded-[2rem]">
            <DialogHeader><DialogTitle className="uppercase font-black italic text-2xl">Digital Proizvod</DialogTitle></DialogHeader>
            <ProductForm initialData={editingItem} onSave={saveProduct} onCancel={() => setShowProductModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-xl rounded-[2rem]">
            <DialogHeader><DialogTitle className="uppercase font-black italic text-2xl">FAQ</DialogTitle></DialogHeader>
            <FaqForm initialData={editingItem} onSave={saveFaq} onCancel={() => setShowFaqModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showUserCoursesModal} onOpenChange={setShowUserCoursesModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-xl rounded-[2rem]">
            <DialogHeader><DialogTitle className="uppercase font-black italic text-2xl">Pristup Kursevima</DialogTitle><DialogDescription className="text-white/40">{selectedUser?.name}</DialogDescription></DialogHeader>
            <div className="space-y-4 mt-6 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
              {courses.map((c) => {
                const access = selectedUser?.courses?.includes(c.id);
                return (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="font-bold">{c.title}</span><Switch checked={access} onCheckedChange={() => toggleUserCourse(c.id, access)} />
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

// --- FORM SUB-COMPONENTS ---

const ProgramForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '', description: initialData?.description || '',
    price: initialData?.price || 0, currency: 'EUR',
    thumbnail_url: initialData?.thumbnail_url || '',
    features: initialData?.features?.join('\n') || '',
    is_active: initialData?.is_active !== false
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, price: Number(formData.price), features: formData.features.split('\n').filter(f => f.trim())}); }} className="space-y-6 pt-4">
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Naziv Plana</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-black border-white/10 mt-2" required /></div>
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Opis Plana</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-black border-white/10 mt-2" required /></div>
      <div className="grid grid-cols-2 gap-6">
        <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Cena (€)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="bg-black border-white/10 mt-2" required /></div>
        <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Thumbnail URL</Label><Input value={formData.thumbnail_url} onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
      </div>
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Značajke (Svaka u novi red)</Label><Textarea value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} className="bg-black border-white/10 mt-2 h-32" /></div>
      <div className="flex gap-4 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1 uppercase font-black italic py-6 rounded-2xl border-white/10">Odustani</Button><Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 uppercase font-black italic py-6 rounded-2xl">Sačuvaj Plan</Button></div>
    </form>
  );
};

const CourseForm = ({ initialData, programs, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: initialData?.title || '', program_id: initialData?.program_id || '', thumbnail_url: initialData?.thumbnail_url || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6 pt-4">
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Naslov Kursa</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-black border-white/10 mt-2" required /></div>
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Dodeljeni Program</Label><Select value={formData.program_id} onValueChange={(v) => setFormData({...formData, program_id: v})}><SelectTrigger className="bg-black border-white/10 mt-2"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0f0f0f] border-white/10 text-white">{programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex gap-4 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1 uppercase font-black italic py-6 rounded-2xl">Odustani</Button><Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 uppercase font-black italic py-6 rounded-2xl">Sačuvaj</Button></div>
    </form>
  );
};

const LessonForm = ({ initialData, courseId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: initialData?.title || '', video_url: initialData?.video_url || '', course_id: courseId });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6 pt-4">
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Naslov Lekcije</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-black border-white/10 mt-2" required /></div>
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Mux Playback ID</Label><Input value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} className="bg-black border-white/10 mt-2" required /></div>
      <div className="flex gap-4 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1 uppercase font-black italic py-6 rounded-2xl">Odustani</Button><Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 uppercase font-black italic py-6 rounded-2xl">Sačuvaj</Button></div>
    </form>
  );
};

const ProductForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: initialData?.name || '', description: initialData?.description || '', price: initialData?.price || 0, image_url: initialData?.image_url || '', category: initialData?.category || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, price: Number(formData.price)}); }} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-6">
        <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Naziv Proizvoda</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-black border-white/10 mt-2" required /></div>
        <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Kategorija</Label><Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
      </div>
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Kratak Opis</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Cena (€)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="bg-black border-white/10 mt-2" required /></div>
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Thumbnail URL</Label><Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="bg-black border-white/10 mt-2" /></div>
      <div className="flex gap-4 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1 uppercase font-black italic py-6 rounded-2xl">Odustani</Button><Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 uppercase font-black italic py-6 rounded-2xl">Spremi</Button></div>
    </form>
  );
};

const FaqForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ question: initialData?.question || '', answer: initialData?.answer || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6 pt-4">
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Pitanje</Label><Input value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} className="bg-black border-white/10 mt-2" required /></div>
      <div><Label className="uppercase font-black text-white/40 text-[10px] tracking-widest">Odgovor</Label><Textarea value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} className="bg-black border-white/10 mt-2 h-32" required /></div>
      <div className="flex gap-4 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1 uppercase font-black italic py-6 rounded-2xl">Odustani</Button><Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 uppercase font-black italic py-6 rounded-2xl">Spremi</Button></div>
    </form>
  );
};

export default Admin;
