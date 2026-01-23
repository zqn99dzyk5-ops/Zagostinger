import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  ShoppingBag, 
  Users, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  DollarSign, 
  Mail,
  CheckCircle2,
  Search
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSettings } from '@/lib/settings';

const Admin = () => {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // State za podatke
  const [courses, setCourses] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // Svi kupljeni nalozi/kursevi
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0, activeUsers: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  // Form states za postavke (prethodno dogovoreno)
  const [formSettings, setFormSettings] = useState({
    site_name: settings?.site_name || '',
    logo_url: settings?.logo_url || '',
    footer_text: settings?.footer_text || '',
    contact_email: settings?.contact_email || '',
    instagram_url: settings?.instagram_url || '',
    youtube_url: settings?.youtube_url || '',
    discord_invite_url: settings?.discord_invite_url || '',
    facebook_url: settings?.facebook_url || '',
    hero_video_url: settings?.hero_video_url || ''
  });

  // Simulacija učitavanja podataka (ovdje idu tvoji API pozivi)
  useEffect(() => {
    const fetchData = async () => {
      // Ovdje bi išao fetch iz baze
      // setOrders(fetchedOrders);
      // setCourses(fetchedCourses);
    };
    fetchData();
  }, []);

  const handleSettingsSave = async () => {
    setLoading(true);
    try {
      await updateSettings(formSettings);
      toast.success('Postavke su uspješno sačuvane!');
    } catch (error) {
      toast.error('Greška pri čuvanju postavki.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Upravljaj akademijom, prodajom i korisnicima.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-card border border-white/5 p-1 rounded-xl overflow-x-auto">
          <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="w-4 h-4" /> Pregled</TabsTrigger>
          <TabsTrigger value="sales" className="gap-2"><DollarSign className="w-4 h-4" /> Prodaja</TabsTrigger>
          <TabsTrigger value="courses" className="gap-2"><BookOpen className="w-4 h-4" /> Kursevi</TabsTrigger>
          <TabsTrigger value="shop" className="gap-2"><ShoppingBag className="w-4 h-4" /> Shop</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><SettingsIcon className="w-4 h-4" /> Postavke</TabsTrigger>
        </TabsList>

        {/* DASHBOARD PREGLED */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardDescription>Ukupna Zarada</CardDescription>
                <CardTitle className="text-3xl">€{stats.totalRevenue}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardDescription>Broj Prodaja</CardDescription>
                <CardTitle className="text-3xl">{stats.totalSales}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardDescription>Aktivni Korisnici</CardDescription>
                <CardTitle className="text-3xl">{stats.activeUsers}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        {/* PRODAJA I NALOZI (Ovdje vidiš ko je kupio) */}
        <TabsContent value="sales">
          <Card className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lista Kupaca & Naloga</CardTitle>
                <CardDescription>Pregled svih uspješnih transakcija i aktiviranih pristupa.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Traži po emailu..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead>Datum</TableHead>
                    <TableHead>Kupac (Email)</TableHead>
                    <TableHead>Proizvod / Kurs</TableHead>
                    <TableHead>Iznos</TableHead>
                    <TableHead>Status Mail-a</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-white/5">
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-primary" />
                          {order.user_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                          {order.item_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">€{order.amount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-500 text-xs">
                          <CheckCircle2 className="w-3 h-3" /> Poslato
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Nema pronađenih prodaja.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POSTAVKE SAJTA */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>Osnovne Informacije</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Naziv Sajta</label>
                  <Input 
                    value={formSettings.site_name} 
                    onChange={(e) => setFormSettings({...formSettings, site_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo URL</label>
                  <Input 
                    value={formSettings.logo_url} 
                    onChange={(e) => setFormSettings({...formSettings, logo_url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hero Video URL (MP4)</label>
                  <Input 
                    value={formSettings.hero_video_url} 
                    onChange={(e) => setFormSettings({...formSettings, hero_video_url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Footer Tekst</label>
                  <Textarea 
                    value={formSettings.footer_text} 
                    onChange={(e) => setFormSettings({...formSettings, footer_text: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>Socijalne Mreže & Kontakt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kontakt Email</label>
                  <Input 
                    value={formSettings.contact_email} 
                    onChange={(e) => setFormSettings({...formSettings, contact_email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instagram URL</label>
                  <Input 
                    value={formSettings.instagram_url} 
                    onChange={(e) => setFormSettings({...formSettings, instagram_url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">YouTube URL</label>
                  <Input 
                    value={formSettings.youtube_url} 
                    onChange={(e) => setFormSettings({...formSettings, youtube_url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discord Invite</label>
                  <Input 
                    value={formSettings.discord_invite_url} 
                    onChange={(e) => setFormSettings({...formSettings, discord_invite_url: e.target.value})}
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSettingsSave}
                  disabled={loading}
                >
                  {loading ? 'Spremanje...' : 'Sačuvaj Sve Postavke'}
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
