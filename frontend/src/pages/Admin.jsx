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
      console.error('Data loading error:', error);
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await settingsAPI.update(settings);
      toast.success('Postavke uspješno ažurirane');
    } catch (error) {
      console.error('Settings error:', error);
      toast.error('Greška! Vjerovatno nedostaju kolone u bazi.');
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      toast.success('Uloga ažurirana');
    } catch (error) { toast.error('Greška pri promjeni uloge'); }
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

  // --- SAVE FUNCTIONS ---
  const saveProgram = async (data) => {
    try {
      editingItem?.id ? await programsAPI.update(editingItem.id, data) : await programsAPI.create(data);
      loadAllData(); setShowProgramModal(false); toast.success('Plan sačuvan');
    } catch (e) { toast.error('Greška pri spremanju plana'); }
  };

  const saveCourse = async (data) => {
    try {
      if (!data.program_id) { toast.error("Izaberi program za kurs!"); return; }
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

  const saveResult = async (data) => {
    try {
      await resultsAPI.create(data);
      loadAllData(); setShowResultModal(false); toast.success('Rezultat sačuvan');
    } catch (e) { toast.error('Greška pri spremanju rezultata'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Admin Control Center</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Management & Strategy</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl flex-wrap h-auto">
            <TabsTrigger value="overview" className="gap-2 uppercase font-black text-xs italic"><BarChart3 className="w-4 h-4" /> Pregled</TabsTrigger>
            <TabsTrigger value="users" className="gap-2 uppercase font-black text-xs italic"><Users className="w-4 h-4" /> Korisnici</TabsTrigger>
            <TabsTrigger value="courses" className="gap-2 uppercase font-black text-xs italic"><GraduationCap className="w-4 h-4" /> Kursevi</TabsTrigger>
            <TabsTrigger value="programs" className="gap-2 uppercase font-black text-xs italic"><BookOpen className="w-4 h-4" /> Planovi</TabsTrigger>
            <TabsTrigger value="shop" className="gap-2 uppercase font-black text-xs italic"><ShoppingBag className="w-4 h-4" /> Shop</TabsTrigger>
            <TabsTrigger value="content" className="gap-2 uppercase font-black text-xs italic"><FileText className="w-4 h-4" /> Sadržaj</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 uppercase font-black text-xs italic"><Settings className="w-4 h-4" /> Postavke</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Korisnika', val: analytics?.total_users, icon: Users, color: 'text-orange-500' },
                { label: 'Pretplata', val: analytics?.total_subscriptions, icon: DollarSign, color: 'text-green-500' },
                { label: 'Kurseva', val: courses.length, icon: GraduationCap, color: 'text-blue-500' },
                { label: 'Planova', val: programs.length, icon: BookOpen, color: 'text-purple-500' }
              ].map((item, i) => (
                <Card key={i} className="bg-white/5 border-white/10 p-6">
                  <div className="flex items-center gap-4">
                    <item.icon className={item.color} />
                    <div><p className="text-2xl font-black">{item.val || 0}</p><p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">{item.label}</p></div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <Card className="bg-white/5 border-white/10 p-6">
              <Table>
                <TableHeader><TableRow><TableHead>Ime</TableHead><TableHead>Email</TableHead><TableHead>Uloga</TableHead><TableHead>Akcije</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-bold">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Select value={u.role} onValueChange={(v) => updateUserRole(u.id, v)}>
                          <SelectTrigger className="bg-black border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-black text-white"><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><Button variant="outline" size="sm" onClick={() => { setSelectedUser(u); setShowUserCoursesModal(true); }}>Pristup</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* COURSES */}
          <TabsContent value="courses">
            <div className="flex justify-end mb-6">
              <Button onClick={() => { setEditingItem(null); setShowCourseModal(true); }} className="bg-orange-600"><Plus className="w-4 h-4 mr-2" /> Novi Kurs</Button>
            </div>
            <Accordion type="multiple" className="space-y-4">
              {courses.map(course => (
                <AccordionItem key={course.id} value={course.id} className="bg-white/5 border-white/10 rounded-2xl px-6">
                  <AccordionTrigger className="uppercase font-black italic text-sm" onClick={() => !courseLessons[course.id] && loadCourseLessons(course.id)}>
                    <div className="flex justify-between w-full pr-4">
                      <span>{course.title} <Badge className="ml-4 bg-orange-500/20 text-orange-500 border-none">{course.program_name}</Badge></span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <Button size="sm" className="mb-4" onClick={() => { setSelectedCourse(course); setEditingItem(null); setShowLessonModal(true); }}>Dodaj Lekciju</Button>
                    <div className="space-y-2">
                      {courseLessons[course.id]?.map(lesson => (
                        <div key={lesson.id} className="flex justify-between p-4 bg-black/40 rounded-xl">
                          <span className="font-bold">{lesson.title}</span>
                          <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => { setSelectedCourse(course); setEditingItem(lesson); setShowLessonModal(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" onClick={() => { if(confirm('Obrisati?')) lessonsAPI.delete(lesson.id).then(() => loadCourseLessons(course.id)) }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* PROGRAMS (PLAN PRETPALATE) */}
          <TabsContent value="programs">
            <div className="flex justify-end mb-6">
              <Button onClick={() => { setEditingItem(null); setShowProgramModal(true); }} className="bg-orange-600"><Plus className="w-4 h-4 mr-2" /> Novi Plan</Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {programs.map(p => (
                <Card key={p.id} className="bg-white/5 border-white/10 p-6">
                  <h3 className="text-xl font-black italic mb-2">{p.name}</h3>
                  <p className="text-orange-500 font-black mb-4">€{p.price}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => { setEditingItem(p); setShowProgramModal(true); }}>Uredi</Button>
                    <Button variant="destructive" onClick={() => { if(confirm('Obrisati?')) programsAPI.delete(p.id).then(loadAllData) }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SHOP */}
          <TabsContent value="shop">
            <div className="flex justify-end mb-6">
              <Button onClick={() => { setEditingItem(null); setShowProductModal(true); }} className="bg-orange-600"><Plus className="w-4 h-4 mr-2" /> Novi Proizvod</Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Slika</TableHead><TableHead>Naziv</TableHead><TableHead>Cijena</TableHead><TableHead>Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map(prod => (
                  <TableRow key={prod.id}>
                    <TableCell><img src={prod.image_url} className="w-10 h-10 object-cover rounded-lg" /></TableCell>
                    <TableCell className="font-bold">{prod.name}</TableCell>
                    <TableCell>€{prod.price}</TableCell>
                    <TableCell>
                      <Button variant="ghost" onClick={() => { setEditingItem(prod); setShowProductModal(true); }}><Edit className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/5 border-white/10 p-8 rounded-3xl">
                <h3 className="text-xl font-black italic mb-6">Sajt i Branding</h3>
                <div className="space-y-4">
                  <div><Label>Naziv Sajta</Label><Input value={settings.site_name || ''} onChange={e => setSettings({...settings, site_name: e.target.value})} className="bg-black mt-2" /></div>
                  <div><Label>Logo URL</Label><Input value={settings.logo_url || ''} onChange={e => setSettings({...settings, logo_url: e.target.value})} className="bg-black mt-2" /></div>
                  <div><Label>Hero Image URL</Label><Input value={settings.hero_image_url || ''} onChange={e => setSettings({...settings, hero_image_url: e.target.value})} className="bg-black mt-2" /></div>
                  <div><Label>Mux Video Playback ID</Label><Input value={settings.hero_video_url || ''} onChange={e => setSettings({...settings, hero_video_url: e.target.value})} className="bg-black mt-2" /></div>
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-8 rounded-3xl">
                <h3 className="text-xl font-black italic mb-6">Social Networks</h3>
                <div className="space-y-4">
                  <div><Label>Instagram URL</Label><Input value={settings.instagram_url || ''} onChange={e => setSettings({...settings, instagram_url: e.target.value})} className="bg-black mt-2" /></div>
                  <div><Label>TikTok URL</Label><Input value={settings.tiktok_url || ''} onChange={e => setSettings({...settings, tiktok_url: e.target.value})} className="bg-black mt-2" /></div>
                  <div><Label>YouTube URL</Label><Input value={settings.youtube_url || ''} onChange={e => setSettings({...settings, youtube_url: e.target.value})} className="bg-black mt-2" /></div>
                  <div><Label>Discord Invite</Label><Input value={settings.discord_invite_url || ''} onChange={e => setSettings({...settings, discord_invite_url: e.target.value})} className="bg-black mt-2" /></div>
                </div>
              </Card>
            </div>
            <Button onClick={handleUpdateSettings} className="w-full bg-orange-600 py-8 font-black uppercase italic rounded-3xl">Sačuvaj Sve Postavke</Button>
          </TabsContent>
        </Tabs>

        {/* --- MODALS --- */}
        <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white"><DialogHeader><DialogTitle className="uppercase font-black italic">Kurs</DialogTitle></DialogHeader>
            <CourseForm initialData={editingItem} programs={programs} onSave={saveCourse} onCancel={() => setShowCourseModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white"><DialogHeader><DialogTitle className="uppercase font-black italic">Lekcija (Mux)</DialogTitle></DialogHeader>
            <LessonForm initialData={editingItem} courseId={selectedCourse?.id} onSave={saveLesson} onCancel={() => setShowLessonModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showProgramModal} onOpenChange={setShowProgramModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white"><DialogHeader><DialogTitle className="uppercase font-black italic">Plan Pretplate</DialogTitle></DialogHeader>
            <ProgramForm initialData={editingItem} onSave={saveProgram} onCancel={() => setShowProgramModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white"><DialogHeader><DialogTitle className="uppercase font-black italic">Proizvod</DialogTitle></DialogHeader>
            <ProductForm initialData={editingItem} onSave={saveProduct} onCancel={() => setShowProductModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showUserCoursesModal} onOpenChange={setShowUserCoursesModal}>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-xl">
            <DialogHeader><DialogTitle className="uppercase font-black italic">Pristup Kursevima - {selectedUser?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-6 h-96 overflow-y-auto pr-4">
              {courses.map(c => {
                const access = selectedUser?.courses?.includes(c.id);
                return (
                  <div key={c.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
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

const CourseForm = ({ initialData, programs, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: initialData?.title || '', program_id: initialData?.program_id || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6 pt-4">
      <div><Label>Naslov Kursa</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-black mt-2" required /></div>
      <div><Label>Plan Pretplate</Label><Select value={formData.program_id} onValueChange={v => setFormData({...formData, program_id: v})}><SelectTrigger className="bg-black mt-2"><SelectValue placeholder="Izaberi plan..." /></SelectTrigger><SelectContent className="bg-[#0f0f0f] text-white">{programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex gap-4 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1">Odustani</Button><Button type="submit" className="flex-1 bg-orange-600">Spremi</Button></div>
    </form>
  );
};

const LessonForm = ({ initialData, courseId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: initialData?.title || '', video_url: initialData?.video_url || '', course_id: courseId });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6 pt-4">
      <div><Label>Naslov Lekcije</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-black mt-2" required /></div>
      <div><Label>Mux Playback ID</Label><Input value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} className="bg-black mt-2" required /></div>
      <div className="flex gap-4 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1">Odustani</Button><Button type="submit" className="flex-1 bg-orange-600">Spremi</Button></div>
    </form>
  );
};

const ProgramForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: initialData?.name || '', price: initialData?.price || 0, features: initialData?.features?.join('\n') || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, price: Number(formData.price), features: formData.features.split('\n').filter(f => f.trim())}); }} className="space-y-6 pt-4">
      <div><Label>Naziv Plana</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-black mt-2" required /></div>
      <div><Label>Cijena (€)</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-black mt-2" required /></div>
      <div><Label>Features (novi red)</Label><Textarea value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="bg-black mt-2 h-32" /></div>
      <div className="flex gap-4 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1">Odustani</Button><Button type="submit" className="flex-1 bg-orange-600">Spremi</Button></div>
    </form>
  );
};

const ProductForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: initialData?.name || '', price: initialData?.price || 0, image_url: initialData?.image_url || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, price: Number(formData.price)}); }} className="space-y-6 pt-4">
      <div><Label>Naziv</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-black mt-2" required /></div>
      <div><Label>Cijena (€)</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-black mt-2" required /></div>
      <div><Label>Slika URL</Label><Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="bg-black mt-2" /></div>
      <div className="flex gap-4 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1">Odustani</Button><Button type="submit" className="flex-1 bg-orange-600">Spremi</Button></div>
    </form>
  );
};

export default Admin;
