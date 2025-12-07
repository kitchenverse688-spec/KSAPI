
import React, { useState, useMemo, useEffect, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Map as MapIcon, 
  Kanban, 
  Search, 
  Settings, 
  Bell, 
  Menu, 
  X,
  Database,
  Filter,
  Download,
  Plus,
  Save,
  Calendar,
  Mail,
  CheckSquare,
  ArrowLeft,
  ExternalLink,
  Trash2,
  Clock,
  Briefcase,
  Edit2,
  Check,
  XCircle,
  ChevronDown,
  Globe,
  Sparkles,
  RefreshCw,
  Upload,
  FileText,
  Users,
  Shield,
  Code,
  Terminal,
  Play,
  Pause,
  AlertTriangle,
  LogOut,
  Lock,
  Key,
  Layers,
  Paperclip,
  Eye,
  Activity,
  MessageSquare,
  Slack,
  CreditCard,
  Briefcase as BriefcaseIcon,
  MoreVertical,
  Phone,
  Link as LinkIcon,
  User as UserIcon,
  Smartphone,
  Copy,
  Zap,
  Server
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { MOCK_PROJECTS, MOCK_USERS, MOCK_AUDIT_LOGS, MOCK_ACTIVITY_LOGS, MOCK_COMPANIES, FORMAT_CURRENCY, FORMAT_DATE, TRANSLATIONS, DOWNLOAD_CSV, DOWNLOAD_PDF, DOWNLOAD_DASHBOARD_REPORT, parseAIQuery } from './constants';
import { Project, ProjectStatus, ProjectType, City, FilterState, SavedSearch, Language, SearchQuery, ScrapingSettings, User, Role, AlertConfig, AuditLog, Company, ScrapedSourceResult } from './types';

// --- LANGUAGE CONTEXT ---

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = React.createContext<LanguageContextType | null>(null);

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const LanguageProvider = ({ children }: { children?: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>('en');

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: keyof typeof TRANSLATIONS.en) => {
    return TRANSLATIONS[lang][key] || key;
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

// --- AUTH CONTEXT ---

interface AuthContextType {
  user: User | null;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userId: string) => {
    const found = MOCK_USERS.find(u => u.id === userId);
    if (found) setUser(found);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- PROJECT CONTEXT ---

interface ProjectContextType {
  projects: Project[];
  updateProject: (project: Project) => void;
  addProject: (project: Project) => void;
  addProjects: (projects: Project[]) => void;
}

const ProjectContext = React.createContext<ProjectContextType | null>(null);

const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
};

const ProjectProvider = ({ children }: { children?: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const addProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const addProjects = (newProjects: Project[]) => {
    setProjects(prev => [...newProjects, ...prev]);
  };

  return (
    <ProjectContext.Provider value={{ projects, updateProject, addProject, addProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};

// --- COMPONENTS ---

const Login = () => {
  const { login } = useAuth();
  const [selectedUser, setSelectedUser] = useState(MOCK_USERS[0].id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
       <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
         <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-ksa-green rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="text-white" size={32} />
            </div>
         </div>
         <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">KSA Project Intelligence</h1>
         <p className="text-center text-slate-500 mb-8">Sign in to access the dashboard</p>

         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Select Demo User</label>
             <select 
               className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ksa-green/50"
               value={selectedUser}
               onChange={(e) => setSelectedUser(e.target.value)}
             >
               {MOCK_USERS.map(u => (
                 <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
               ))}
             </select>
           </div>
           
           <button 
             onClick={() => login(selectedUser)}
             className="w-full py-3 bg-ksa-green text-white rounded-lg font-bold hover:bg-green-800 transition-colors shadow-md"
           >
             Sign In
           </button>
         </div>

         <div className="mt-6 text-center text-xs text-slate-400">
           Protected by KSA Intel Security • v2.5.0
         </div>
       </div>
    </div>
  );
};

const SidebarItem = ({ to, icon: Icon, label, disabled = false }: { to: string; icon: any; label: string, disabled?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  const { dir } = useLanguage();
  
  if (disabled) return null;

  return (
    <Link
      to={to}
      className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'} px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-ksa-green/10 text-ksa-green font-medium' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, toggleLang, t, dir } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Login />;

  return (
    <div className={`flex h-screen bg-slate-50 overflow-hidden font-${lang === 'ar' ? 'arabic' : 'sans'}`} dir={dir}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-ksa-green rounded-md flex items-center justify-center">
              <Building2 className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">KSA Intel</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Kitchen & Laundry Equip.</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarItem to="/" icon={LayoutDashboard} label={t('dashboard')} />
          <SidebarItem to="/projects" icon={Database} label={t('projects')} />
          <SidebarItem to="/companies" icon={Users} label="Companies" />
          <SidebarItem to="/pipeline" icon={Kanban} label={t('pipeline')} />
          <SidebarItem to="/map" icon={MapIcon} label={t('map')} />
          
          <div className="pt-6 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tools
          </div>
          <SidebarItem to="/crawler" icon={Search} label={t('crawler')} />
          <SidebarItem to="/settings" icon={Settings} label={t('settings')} />
          
          {user.role === 'Admin' && (
             <>
              <div className="pt-6 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-red-400">
                Administration
              </div>
              <SidebarItem to="/admin" icon={Shield} label={t('adminConsole')} />
             </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center space-x-2 rtl:space-x-reverse text-slate-500 hover:text-red-600 w-full px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <button 
            className="md:hidden p-2 text-slate-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 max-w-xl ml-4 hidden md:block rtl:mr-4 rtl:ml-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rtl:right-3 rtl:left-auto" size={18} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-ksa-green/20 focus:border-ksa-green transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button 
              onClick={toggleLang}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors rtl:space-x-reverse border border-slate-200"
            >
              <Globe size={14} />
              <span>{lang === 'en' ? 'عربي' : 'English'}</span>
            </button>

            <Link to="/settings" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Link>
            <div className="flex items-center space-x-2 pl-4 border-l border-slate-100 rtl:border-l-0 rtl:border-r rtl:pr-4 rtl:pl-0 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm border border-indigo-200">
                {user.avatar}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-slate-700">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className={`absolute top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col ${dir === 'rtl' ? 'right-0' : 'left-0'}`}>
            <div className="p-4 flex justify-between items-center border-b border-slate-100">
              <span className="font-bold text-lg text-slate-800">KSA Intel</span>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <SidebarItem to="/" icon={LayoutDashboard} label={t('dashboard')} />
              <SidebarItem to="/projects" icon={Database} label={t('projects')} />
              <SidebarItem to="/companies" icon={Users} label="Companies" />
              <SidebarItem to="/pipeline" icon={Kanban} label={t('pipeline')} />
              <SidebarItem to="/map" icon={MapIcon} label={t('map')} />
              <SidebarItem to="/crawler" icon={Search} label={t('crawler')} />
              <SidebarItem to="/settings" icon={Settings} label={t('settings')} />
              {user.role === 'Admin' && <SidebarItem to="/admin" icon={Shield} label={t('adminConsole')} />}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

// --- VIEWS ---

const Dashboard = () => {
  const { projects } = useProjects();
  const { t, lang } = useLanguage();
  
  // KPI Calculations using Expected Kitchen & Laundry Value where relevant
  const totalKLValue = projects.reduce((acc, p) => acc + (p.expectedKLScopeValue || 0), 0);
  const activeProjects = projects.filter(p => p.status === ProjectStatus.ONGOING || p.status === ProjectStatus.TENDER).length;
  const newToday = projects.filter(p => new Date(p.lastUpdated).toDateString() === new Date().toDateString()).length;
  const recentAwards = projects.filter(p => p.status === ProjectStatus.AWARDED).slice(0, 5);
  
  // Consolidated News Feed from all projects
  const allNews = useMemo(() => {
    return projects
      .flatMap(p => p.news.map(n => ({ ...n, projectName: p.name })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [projects]);

  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.city] = (counts[p.city] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const valueByTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    // Summing Expected K&L Value instead of total project value
    projects.forEach(p => { counts[p.type] = (counts[p.type] || 0) + (p.expectedKLScopeValue || 0); });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard')}</h1>
        <button 
          onClick={DOWNLOAD_DASHBOARD_REPORT}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm"
        >
          <Download size={16} className="mr-2" /> {t('downloadReport')}
        </button>
      </div>
      
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t('newToday'), value: newToday, icon: Clock, color: 'bg-blue-50 text-blue-700' },
          { label: 'High Value K&L Opps', value: projects.filter(p => (p.expectedKLScopeValue || 0) > 5000000).length, icon: CreditCard, color: 'bg-indigo-50 text-indigo-700' },
          { label: t('activePipeline'), value: FORMAT_CURRENCY(totalKLValue, lang), icon: Activity, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Recent Awards', value: recentAwards.length, icon: Sparkles, color: 'bg-amber-50 text-amber-700' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Pipeline Value by Type (K&L Budget)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueByTypeData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value: number) => FORMAT_CURRENCY(value, lang)} />
                  <Bar dataKey="value" fill="#006C35" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Projects by City</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#C8A355" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* News Feed Sidebar */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
             <MessageSquare size={18} className="mr-2 text-slate-500" /> {t('newsFeed')}
           </h3>
           <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px]">
             {allNews.length > 0 ? allNews.map((news, idx) => (
               <div key={idx} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0 group">
                  <div className="flex justify-between items-start mb-1">
                     <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{news.source}</span>
                     <span className="text-xs text-slate-400">{FORMAT_DATE(news.date, lang)}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-ksa-green transition-colors cursor-pointer line-clamp-2">{news.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{news.snippet}</p>
                  <div className="text-[10px] text-slate-400 mt-1 font-medium bg-slate-50 inline-block px-1 rounded truncate max-w-full">
                    Project: {news.projectName}
                  </div>
               </div>
             )) : (
               <div className="text-center text-slate-400 text-sm py-10">No recent market news found.</div>
             )}
           </div>
           <button className="mt-4 w-full py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">View All News</button>
        </div>
      </div>
    </div>
  );
};

const NewProjectModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { addProject } = useProjects();
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    city: City.RIYADH,
    type: ProjectType.HOTEL,
    status: ProjectStatus.TENDER,
    developer: '',
    estimatedValueSAR: 0
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      ...formData as Project,
      id: `man-${Date.now()}`,
      confidenceScore: 1.0,
      lastUpdated: new Date().toISOString(),
      tags: ['Manual Entry'],
      news: [],
      history: [],
      description: formData.description || 'Manually added project.'
    };
    addProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Add Manual Project</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input required type="text" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium mb-1">City</label>
               <select className="w-full p-2 border rounded" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value as any})}>
                 {Object.values(City).map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Type</label>
               <select className="w-full p-2 border rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                 {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium mb-1">Developer</label>
               <input type="text" className="w-full p-2 border rounded" value={formData.developer} onChange={e => setFormData({...formData, developer: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Value (SAR)</label>
               <input type="number" className="w-full p-2 border rounded" value={formData.estimatedValueSAR} onChange={e => setFormData({...formData, estimatedValueSAR: Number(e.target.value)})} />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full p-2 border rounded h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 rounded text-slate-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-ksa-green text-white rounded">Add Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectsList = () => {
  const navigate = useNavigate();
  const { projects, addProject } = useProjects();
  const { t, lang } = useLanguage();
  const [viewMode, setViewMode] = useState<'table' | 'gantt'>('table');
  const [filter, setFilter] = useState<FilterState>({ search: '', city: 'All', status: 'All', type: 'All', year: 'All' });
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true, name: true, city: true, value: true, klValue: true, awarded: true, developer: true, scope: true, updated: true, actions: true
  });
  const [showColMenu, setShowColMenu] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const handleAiSearch = () => {
    if (!aiQuery) return;
    setIsAiProcessing(true);
    setTimeout(() => {
      const parsedFilters = parseAIQuery(aiQuery);
      setFilter(prev => ({
        ...prev,
        ...parsedFilters,
        city: parsedFilters.city || 'All',
        status: parsedFilters.status || 'All',
        type: parsedFilters.type || 'All',
        year: parsedFilters.year || 'All'
      }));
      setIsAiProcessing(false);
    }, 800);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(filter.search.toLowerCase()) || p.developer.toLowerCase().includes(filter.search.toLowerCase());
      const matchCity = filter.city === 'All' || p.city === filter.city;
      const matchStatus = filter.status === 'All' || p.status === filter.status;
      const matchType = filter.type === 'All' || p.type === filter.type;
      
      let matchYear = true;
      if (filter.year !== 'All') {
        const year = p.awardDate ? new Date(p.awardDate).getFullYear().toString() : '';
        matchYear = year === filter.year;
      }

      return matchSearch && matchCity && matchStatus && matchType && matchYear;
    });
  }, [projects, filter]);

  // Gantt Chart Renderer
  const GanttView = () => {
    return (
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-lg mb-4">Project Timeline (Awarded -> Completion)</h3>
        <div className="min-w-[800px] space-y-4">
          <div className="flex border-b border-slate-200 pb-2">
            <div className="w-64 font-medium text-slate-500 text-sm">Project</div>
            <div className="flex-1 flex justify-between text-xs text-slate-400">
               <span>2023</span><span>2024</span><span>2025</span><span>2026</span><span>2027</span>
            </div>
          </div>
          {filteredProjects.slice(0, 10).map(p => {
             const startYear = p.awardDate ? new Date(p.awardDate).getFullYear() : 2023;
             const endYear = new Date(p.expectedCompletion).getFullYear();
             const duration = Math.max(1, endYear - startYear);
             const offset = Math.max(0, startYear - 2023);
             const width = (duration / 5) * 100;
             const left = (offset / 5) * 100;

             return (
               <div key={p.id} className="flex items-center group cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                 <div className="w-64 truncate text-sm font-medium text-slate-700 pr-4">{lang === 'ar' ? (p.name_ar || p.name) : p.name}</div>
                 <div className="flex-1 h-6 bg-slate-50 rounded-full relative overflow-hidden">
                    <div 
                      className={`absolute top-0 bottom-0 rounded-full ${p.status === 'Awarded' ? 'bg-emerald-500' : 'bg-blue-500'} opacity-80`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    ></div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{t('projects')}</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsNewProjectModalOpen(true)}
            className="px-3 py-2 bg-ksa-green text-white rounded-lg text-sm font-medium flex items-center hover:bg-green-800"
          >
            <Plus size={16} className="mr-2"/> Add Project
          </button>
           <div className="relative">
             <button 
               onClick={() => setShowColMenu(!showColMenu)}
               className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 flex items-center"
             >
               <Eye size={16} className="mr-2"/> Columns
             </button>
             {showColMenu && (
               <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2">
                 {Object.keys(visibleColumns).map(col => (
                   <label key={col} className="flex items-center px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-sm">
                     <input 
                       type="checkbox" 
                       checked={visibleColumns[col]} 
                       onChange={() => setVisibleColumns({...visibleColumns, [col]: !visibleColumns[col]})}
                       className="mr-2"
                     />
                     <span className="capitalize">{col}</span>
                   </label>
                 ))}
               </div>
             )}
           </div>
           <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
             <button onClick={() => setViewMode('table')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Table</button>
             <button onClick={() => setViewMode('gantt')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'gantt' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Gantt</button>
           </div>
        </div>
      </div>

      {/* AI Search Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-xl text-white shadow-lg">
        <h3 className="text-lg font-bold mb-3 flex items-center text-amber-400">
           <Sparkles size={20} className="mr-2" /> {t('deepSearch')}
        </h3>
        <div className="flex space-x-2">
           <input 
             type="text" 
             value={aiQuery}
             onChange={(e) => setAiQuery(e.target.value)}
             placeholder={t('deepSearchPlaceholder')}
             className="flex-1 px-4 py-3 rounded-lg text-slate-900 focus:outline-none"
             onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
           />
           <button 
             onClick={handleAiSearch}
             className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors flex items-center"
           >
             {isAiProcessing ? 'Thinking...' : 'Ask AI'}
           </button>
        </div>
        {filter.city !== 'All' || filter.type !== 'All' || filter.status !== 'All' ? (
           <div className="mt-3 flex items-center space-x-2 text-sm text-slate-300">
             <span>Active AI Filters:</span>
             {filter.city !== 'All' && <span className="bg-slate-700 px-2 py-1 rounded">{filter.city}</span>}
             {filter.type !== 'All' && <span className="bg-slate-700 px-2 py-1 rounded">{filter.type}</span>}
             {filter.status !== 'All' && <span className="bg-slate-700 px-2 py-1 rounded">{filter.status}</span>}
             {filter.year !== 'All' && <span className="bg-slate-700 px-2 py-1 rounded">{filter.year}</span>}
             <button onClick={() => { setFilter({ search: '', city: 'All', status: 'All', type: 'All', year: 'All' }); setAiQuery(''); }} className="text-amber-400 underline ml-2">Clear</button>
           </div>
        ) : null}
      </div>

      {viewMode === 'gantt' ? <GanttView /> : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead className="bg-slate-50">
              <tr>
                {visibleColumns.id && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ID</th>}
                {visibleColumns.name && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Project</th>}
                {visibleColumns.city && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('city')}</th>}
                {visibleColumns.value && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('value')}</th>}
                {visibleColumns.klValue && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase bg-emerald-50 text-emerald-700">{t('klValue')}</th>}
                {visibleColumns.awarded && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('awarded')}</th>}
                {visibleColumns.developer && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('developer')}</th>}
                {visibleColumns.scope && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('scope')}</th>}
                {visibleColumns.updated && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Updated</th>}
                {visibleColumns.actions && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">{t('actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                   {visibleColumns.id && <td className="px-6 py-4 text-xs text-slate-400">#{p.id}</td>}
                   {visibleColumns.name && <td className="px-6 py-4 font-semibold text-slate-900">{lang === 'ar' ? (p.name_ar || p.name) : p.name}</td>}
                   {visibleColumns.city && <td className="px-6 py-4 text-sm">{p.city}</td>}
                   {visibleColumns.value && <td className="px-6 py-4 text-sm font-mono">{FORMAT_CURRENCY(p.estimatedValueSAR, lang)}</td>}
                   {visibleColumns.klValue && <td className="px-6 py-4 text-sm font-mono font-bold text-emerald-700 bg-emerald-50/30">{FORMAT_CURRENCY(p.expectedKLScopeValue || 0, lang)}</td>}
                   {visibleColumns.awarded && <td className="px-6 py-4 text-sm">{FORMAT_DATE(p.awardDate, lang)}</td>}
                   {visibleColumns.developer && <td className="px-6 py-4 text-sm">{p.developer}</td>}
                   {visibleColumns.scope && (
                     <td className="px-6 py-4">
                       <div className="flex space-x-1">
                         {p.kitchenScope && <span className="text-[10px] bg-orange-100 text-orange-800 px-1 rounded">K</span>}
                         {p.laundryScope && <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded">L</span>}
                       </div>
                     </td>
                   )}
                   {visibleColumns.updated && <td className="px-6 py-4 text-xs text-slate-500">{FORMAT_DATE(p.lastUpdated, lang)}</td>}
                   {visibleColumns.actions && <td className="px-6 py-4 text-right"><span className="text-blue-600 text-sm font-medium">View</span></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} />
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Project | null>(null);

  const project = projects.find(p => p.id === id);

  useEffect(() => {
    if (project) setFormData(project);
  }, [project]);

  if (!project || !formData) return <div>Not Found</div>;

  const handleSave = () => {
    updateProject(formData);
    setIsEditing(false);
  };

  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center space-x-2 text-slate-500 cursor-pointer hover:text-slate-800" onClick={() => navigate('/projects')}>
        <ArrowLeft size={16} /> <span>Back to Projects</span>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <div className="flex justify-between items-start">
           <div className="flex-1">
             {isEditing ? (
               <input 
                 type="text" 
                 value={formData.name} 
                 onChange={e => handleChange('name', e.target.value)}
                 className="text-3xl font-bold text-slate-900 border-b border-slate-300 focus:outline-none focus:border-ksa-green w-full mb-2"
               />
             ) : (
               <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
             )}
             <p className="text-slate-500 flex items-center mt-1"><MapIcon size={14} className="mr-1"/> {project.city}</p>
           </div>
           <div className="flex space-x-2">
             {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">Cancel</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-ksa-green text-white rounded-lg text-sm font-medium flex items-center">
                    <Save size={16} className="mr-2"/> Save Changes
                  </button>
                </>
             ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center hover:bg-blue-100">
                  <Edit2 size={16} className="mr-2"/> Edit Project
                </button>
             )}
             <button onClick={() => DOWNLOAD_PDF(project)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center hover:bg-slate-200">
               <FileText size={16} className="mr-2"/> Brief
             </button>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-lg mb-4">Description</h3>
             {isEditing ? (
               <textarea 
                 value={formData.description} 
                 onChange={e => handleChange('description', e.target.value)}
                 className="w-full h-32 p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ksa-green"
               />
             ) : (
               <p className="text-slate-600 leading-relaxed">{project.description}</p>
             )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-lg mb-4 flex items-center"><Paperclip size={18} className="mr-2"/> Attachments</h3>
             {project.attachments && project.attachments.length > 0 ? (
               <div className="grid grid-cols-2 gap-4">
                 {project.attachments.map(att => (
                   <div key={att.id} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className="w-10 h-10 bg-red-50 text-red-600 rounded flex items-center justify-center mr-3">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{att.name}</p>
                        <p className="text-xs text-slate-500">{att.size} • {att.uploadDate}</p>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                 <p className="text-slate-400 text-sm">No attachments uploaded yet.</p>
                 <button className="mt-2 text-blue-600 text-sm font-medium">Upload File</button>
               </div>
             )}
          </div>
        </div>
        
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold mb-4">Details</h3>
             <div className="space-y-3 text-sm">
               <div className="flex justify-between items-center">
                 <span className="text-slate-500">Status</span>
                 {isEditing ? (
                   <select 
                     value={formData.status} 
                     onChange={e => handleChange('status', e.target.value)}
                     className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm"
                   >
                     {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                 ) : (
                   <span className="font-medium bg-slate-100 px-2 rounded">{project.status}</span>
                 )}
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-500">Value (SAR)</span>
                 {isEditing ? (
                   <input 
                     type="number" 
                     value={formData.estimatedValueSAR} 
                     onChange={e => handleChange('estimatedValueSAR', Number(e.target.value))}
                     className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm w-32 text-right"
                   />
                 ) : (
                   <span className="font-medium font-mono">{FORMAT_CURRENCY(project.estimatedValueSAR)}</span>
                 )}
               </div>
               <div className="flex justify-between items-center bg-emerald-50 px-2 py-1 rounded -mx-2">
                 <span className="text-emerald-700 font-bold">K&L Budget (SAR)</span>
                 {isEditing ? (
                   <input 
                     type="number" 
                     value={formData.expectedKLScopeValue || 0} 
                     onChange={e => handleChange('expectedKLScopeValue', Number(e.target.value))}
                     className="bg-white border border-emerald-300 rounded px-2 py-1 text-sm w-32 text-right"
                   />
                 ) : (
                   <span className="font-bold font-mono text-emerald-700">{FORMAT_CURRENCY(project.expectedKLScopeValue || 0)}</span>
                 )}
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-500">Developer</span>
                 {isEditing ? (
                   <input 
                     type="text" 
                     value={formData.developer} 
                     onChange={e => handleChange('developer', e.target.value)}
                     className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm w-40 text-right"
                   />
                 ) : (
                   <span className="font-medium">{project.developer}</span>
                 )}
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-500">Contractor</span>
                 {isEditing ? (
                   <input 
                     type="text" 
                     value={formData.contractor || ''} 
                     onChange={e => handleChange('contractor', e.target.value)}
                     className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm w-40 text-right"
                   />
                 ) : (
                   <span className="font-medium">{project.contractor || 'TBD'}</span>
                 )}
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-500">Expected Completion</span>
                 {isEditing ? (
                   <input 
                     type="date" 
                     value={formData.expectedCompletion} 
                     onChange={e => handleChange('expectedCompletion', e.target.value)}
                     className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm"
                   />
                 ) : (
                   <span className="font-medium">{project.expectedCompletion}</span>
                 )}
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const MapView = () => {
  const { projects } = useProjects();
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [isSatellite, setIsSatellite] = useState(false);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([24.7136, 46.6753], 5);
      
      // Default: OpenStreetMap (Standard)
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapRef.current);
      
      // Init Marker Cluster Group
      if (L.markerClusterGroup) {
        markersRef.current = L.markerClusterGroup();
        mapRef.current.addLayer(markersRef.current);
      }
    }

    // Toggle Satellite Layer
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    if (isSatellite) {
      // Esri World Imagery (Satellite)
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      }).addTo(mapRef.current);
    } else {
      // OpenStreetMap
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    }

    // Update Markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
      projects.forEach(p => {
        if (p.coordinates) {
           const marker = L.marker([p.coordinates.lat, p.coordinates.lng])
             .bindPopup(`
               <div class="font-sans">
                 <h3 class="font-bold text-sm">${p.name}</h3>
                 <p class="text-xs text-gray-600">${p.city}</p>
                 <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">${p.status}</span>
               </div>
             `);
           markersRef.current.addLayer(marker);
        }
      });
    }

  }, [projects, isSatellite]);

  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900">{t('map')}</h1>
          <button 
             onClick={() => setIsSatellite(!isSatellite)}
             className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center hover:bg-slate-50"
          >
             <Layers size={16} className="mr-2"/> {isSatellite ? 'Switch to Standard' : t('mapToggle')}
          </button>
       </div>
       <div className="flex-1 bg-slate-200 rounded-xl border border-slate-300 relative z-0 shadow-inner">
         <div ref={mapContainerRef} className="absolute inset-0 rounded-xl overflow-hidden"></div>
         {/* Map Legend Overlay */}
         <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[400] text-xs">
            <div className="font-bold mb-2">Project Clusters</div>
            <div className="flex items-center space-x-2 mb-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> <span>Standard Marker</span></div>
            <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-green-500/50 border border-green-600"></span> <span>Cluster</span></div>
         </div>
       </div>
    </div>
  );
};

const AdminConsole = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'api' | 'rules' | 'audit'>('users');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center"><Shield className="mr-2"/> {t('adminConsole')}</h1>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex border-b border-slate-200">
           {['users', 'api', 'rules', 'audit'].map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab as any)}
               className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-slate-50 text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               {tab} Management
             </button>
           ))}
        </div>

        <div className="p-6 bg-slate-50/30 flex-1">
           {activeTab === 'users' && (
             <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">System Users</h3>
                  <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">Add User</button>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 border-b border-slate-200">
                       <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Actions</th></tr>
                     </thead>
                     <tbody>
                       {MOCK_USERS.map(u => (
                         <tr key={u.id} className="border-b border-slate-100 last:border-0">
                           <td className="px-4 py-3 font-medium">{u.name}</td>
                           <td className="px-4 py-3 text-slate-500">{u.email}</td>
                           <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{u.role}</span></td>
                           <td className="px-4 py-3"><button className="text-blue-600 hover:underline">Edit</button></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>
           )}

           {activeTab === 'api' && (
             <div className="space-y-6 max-w-2xl">
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-2">API Keys</h3>
                  <p className="text-sm text-slate-500 mb-4">Manage access keys for third-party integrations.</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded">
                      <div>
                        <p className="font-mono text-sm font-bold">pk_live_51M...</p>
                        <p className="text-xs text-slate-400">Created Oct 2023</p>
                      </div>
                      <button className="text-red-500 text-xs font-bold border border-red-200 px-2 py-1 rounded hover:bg-red-50">Revoke</button>
                    </div>
                    <button className="w-full py-2 border border-dashed border-slate-300 rounded text-slate-500 hover:bg-slate-50 text-sm">Generate New Key</button>
                  </div>
                </div>
             </div>
           )}

           {activeTab === 'audit' && (
             <div className="space-y-4">
                <h3 className="font-bold text-slate-800 mb-2">System Audit Logs</h3>
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 border-b border-slate-200">
                       <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Details</th></tr>
                     </thead>
                     <tbody>
                       {MOCK_AUDIT_LOGS.map(log => (
                         <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                           <td className="px-4 py-3 text-slate-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                           <td className="px-4 py-3 font-medium">{log.user}</td>
                           <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{log.action}</span></td>
                           <td className="px-4 py-3 text-slate-600">{log.details}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>
           )}
           
           {activeTab === 'rules' && (
             <div className="bg-white p-6 rounded-lg border border-slate-200 text-center py-12">
               <Layers className="mx-auto h-12 w-12 text-slate-300 mb-3" />
               <h3 className="text-lg font-medium text-slate-900">Entity Matching Rules</h3>
               <p className="text-slate-500 max-w-md mx-auto mt-2">Configure NLP rules for auto-merging company names (e.g., 'El Seif' = 'El Seif Engineering').</p>
               <button className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm">Configure Rules Engine</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">{t('settings')}</h1>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Slack size={20} className="mr-2"/> Integrations & Alerts</h3>
        <div className="space-y-6">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Slack Webhook URL</label>
             <input type="text" placeholder="https://hooks.slack.com/services/..." className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Microsoft Teams Webhook URL</label>
             <input type="text" placeholder="https://outlook.office.com/webhook/..." className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
           </div>
           
           <div className="pt-4 border-t border-slate-100 space-y-3">
             <label className="flex items-center space-x-3">
               <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" defaultChecked />
               <span className="text-sm text-slate-700">Alert on new High Value Projects (>100M SAR)</span>
             </label>
             <label className="flex items-center space-x-3">
               <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" defaultChecked />
               <span className="text-sm text-slate-700">Alert when watched Competitor is mentioned</span>
             </label>
           </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-ksa-green text-white rounded-lg font-medium hover:bg-green-800 text-sm">Save Configuration</button>
        </div>
      </div>
    </div>
  );
};

const CompaniesList = () => {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [activeTab, setActiveTab] = useState<'general' | 'contact'>('general');

  const handleEdit = (company: Company) => {
    setEditingId(company.id);
    setFormData(JSON.parse(JSON.stringify(company))); // Deep copy
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ type: 'Contractor', city: City.RIYADH, contactPerson: { name: '', role: '', mobile: '', email: '' } });
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
       setCompanies(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } as Company : c));
    } else {
       const newCompany = { ...formData, id: `c${Date.now()}` } as Company;
       setCompanies(prev => [newCompany, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      setCompanies(prev => prev.filter(c => c.id !== id));
    }
  }

  const updateContactPerson = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactPerson: {
        ...(prev.contactPerson || { name: '', role: '', mobile: '', email: '' }),
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Companies & Contractors</h1>
        <button onClick={handleAdd} className="bg-ksa-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 flex items-center">
           <Plus size={16} className="mr-2"/> Add Company
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-slate-50 border-b border-slate-200">
             <tr>
               <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
               <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
               <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">City</th>
               <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Website</th>
               <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Key Contact</th>
               <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {companies.map(c => (
               <tr key={c.id} className="hover:bg-slate-50">
                 <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                 <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{c.type}</span></td>
                 <td className="px-6 py-4 text-sm text-slate-500">{c.city}</td>
                 <td className="px-6 py-4 text-sm text-blue-600">
                    {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="flex items-center hover:underline"><LinkIcon size={12} className="mr-1"/> Link</a>}
                 </td>
                 <td className="px-6 py-4 text-sm text-slate-600">
                    {c.contactPerson?.name ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">{c.contactPerson.name}</span>
                        <span className="text-[10px] text-slate-400">{c.contactPerson.mobile}</span>
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                 </td>
                 <td className="px-6 py-4 text-right space-x-2">
                   <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800"><Edit2 size={16}/></button>
                   <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
           <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">{editingId ? 'Edit Company' : 'Add Company'}</h3>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button onClick={() => setActiveTab('general')} className={`px-3 py-1 text-xs font-medium rounded ${activeTab === 'general' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>General</button>
                  <button onClick={() => setActiveTab('contact')} className={`px-3 py-1 text-xs font-medium rounded ${activeTab === 'contact' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Contact Details</button>
                </div>
             </div>
             
             {activeTab === 'general' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                      <select 
                        value={formData.type} 
                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                        className="w-full p-2 border border-slate-300 rounded"
                      >
                        {['Developer', 'Contractor', 'Designer', 'Consultant'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                      <select 
                        value={formData.city} 
                        onChange={e => setFormData({...formData, city: e.target.value as any})}
                        className="w-full p-2 border border-slate-300 rounded"
                      >
                        {Object.values(City).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website URL</label>
                    <input 
                      type="text" 
                      value={formData.website || ''} 
                      onChange={e => setFormData({...formData, website: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded"
                      placeholder="https://..."
                    />
                  </div>
                </div>
             ) : (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center"><Building2 size={14} className="mr-2"/> Corporate Contact</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">General Email</label>
                        <input 
                          type="email" 
                          value={formData.email || ''} 
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full p-2 border border-slate-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">General Phone</label>
                        <input 
                          type="text" 
                          value={formData.phone || ''} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full p-2 border border-slate-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center"><UserIcon size={14} className="mr-2"/> Key Person Contact</h4>
                    <div className="space-y-3">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Name</label>
                          <input 
                            type="text" 
                            value={formData.contactPerson?.name || ''} 
                            onChange={e => updateContactPerson('name', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded text-sm"
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role / Job Title</label>
                            <input 
                              type="text" 
                              value={formData.contactPerson?.role || ''} 
                              onChange={e => updateContactPerson('role', e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded text-sm"
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                            <input 
                              type="text" 
                              value={formData.contactPerson?.mobile || ''} 
                              onChange={e => updateContactPerson('mobile', e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded text-sm"
                            />
                         </div>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Direct Email</label>
                          <input 
                            type="email" 
                            value={formData.contactPerson?.email || ''} 
                            onChange={e => updateContactPerson('email', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded text-sm"
                          />
                       </div>
                    </div>
                  </div>
                </div>
             )}

             <div className="flex justify-end space-x-2 pt-6 border-t border-slate-100 mt-6">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded text-slate-700 font-medium">Cancel</button>
               <button onClick={handleSave} className="px-4 py-2 bg-ksa-green text-white rounded font-medium">Save Details</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

const Pipeline = () => {
    const { projects, updateProject } = useProjects();
    const { t, lang } = useLanguage();
    
    // Simple statuses for pipeline
    const statuses = [ProjectStatus.TENDER, ProjectStatus.ONGOING, ProjectStatus.AWARDED, ProjectStatus.LOST];

    const getProjectsByStatus = (status: ProjectStatus) => {
      return projects.filter(p => p.status === status);
    };

    const handleStatusChange = (projectId: string, newStatus: ProjectStatus) => {
       const project = projects.find(p => p.id === projectId);
       if (project) {
         updateProject({...project, status: newStatus});
       }
    };

    return (
      <div className="h-full flex flex-col">
         <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('pipeline')}</h1>
         <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex space-x-4 min-w-[1000px] h-full">
              {statuses.map(status => {
                const columnProjects = getProjectsByStatus(status);
                // Summing Expected K&L Value for Pipeline View
                const totalValue = columnProjects.reduce((acc, p) => acc + (p.expectedKLScopeValue || 0), 0);

                return (
                  <div key={status} className="w-80 flex flex-col bg-slate-100 rounded-xl p-3 border border-slate-200">
                    <div className="flex justify-between items-center mb-3 px-2">
                       <span className="font-bold text-slate-700">{status}</span>
                       <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{columnProjects.length}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-3 px-2 font-mono flex items-center">
                       <span className="bg-emerald-100 text-emerald-800 px-1 rounded mr-1">K&L</span>
                       {FORMAT_CURRENCY(totalValue, lang)}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3">
                       {columnProjects.map(p => (
                         <div key={p.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 group">
                            <div className="text-sm font-bold text-slate-800 mb-1">{p.name}</div>
                            <div className="text-xs text-slate-500 mb-2">{p.developer}</div>
                            <div className="flex justify-between items-center text-xs text-slate-400">
                              <span className="text-emerald-600 font-medium">{FORMAT_CURRENCY(p.expectedKLScopeValue || 0, lang)}</span>
                              <span>{p.salesData?.owner || 'Unassigned'}</span>
                            </div>
                            
                            {/* Quick Actions overlay */}
                            <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => {
                                    const currentIndex = statuses.indexOf(status);
                                    if (currentIndex > 0) handleStatusChange(p.id, statuses[currentIndex - 1]);
                                 }}
                                 disabled={statuses.indexOf(status) === 0}
                                 className="text-xs text-slate-400 hover:text-blue-600 disabled:opacity-30"
                               >
                                 &larr; Prev
                               </button>
                               <button 
                                 onClick={() => {
                                    const currentIndex = statuses.indexOf(status);
                                    if (currentIndex < statuses.length - 1) handleStatusChange(p.id, statuses[currentIndex + 1]);
                                 }}
                                 disabled={statuses.indexOf(status) === statuses.length - 1}
                                 className="text-xs text-slate-400 hover:text-blue-600 disabled:opacity-30"
                               >
                                 Next &rarr;
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )
              })}
            </div>
         </div>
      </div>
    );
};

// --- CRAWLER CONFIGURATION ---

const AddSourceModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (url: string) => void }) => {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAdd(url.trim());
      setUrl('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
       <div className="bg-white p-6 rounded-xl shadow-xl w-96">
          <h3 className="font-bold text-lg mb-4">Add New Seed Source</h3>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              value={url} 
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/news"
              className="w-full border border-slate-300 p-2 rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded">Cancel</button>
              <button type="submit" className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Add Source</button>
            </div>
          </form>
       </div>
    </div>
  );
};

const AdvancedQueryBuilderModal = ({ isOpen, onClose, englishQuery, arabicQuery }: { isOpen: boolean, onClose: () => void, englishQuery: string, arabicQuery: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
       <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center"><Terminal size={18} className="mr-2 text-emerald-400"/> Advanced Boolean Logic Builder</h3>
            <button onClick={onClose}><X size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
             <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Logic Architecture</h4>
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
                    <span className="block font-bold text-blue-800 mb-1">Group 1: Keywords</span>
                    <span className="text-slate-600">"kitchen", "laundry", "equipment"</span>
                  </div>
                  <div className="flex items-center justify-center font-bold text-slate-400">AND</div>
                  <div className="bg-amber-50 p-3 rounded border border-amber-100">
                    <span className="block font-bold text-amber-800 mb-1">Group 2: Project Type</span>
                    <span className="text-slate-600">"hotel", "hospital", "resort"</span>
                  </div>
                </div>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">English Query String</label>
                   <textarea readOnly className="w-full h-32 p-3 font-mono text-xs bg-slate-900 text-green-400 rounded-lg border border-slate-700" value={englishQuery}></textarea>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Arabic Query String</label>
                   <textarea readOnly className="w-full h-32 p-3 font-mono text-xs bg-slate-900 text-green-400 rounded-lg border border-slate-700 text-right" dir="rtl" value={arabicQuery}></textarea>
                </div>
             </div>
          </div>
          <div className="p-4 bg-white border-t border-slate-200 flex justify-end space-x-3">
             <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
             <button onClick={() => { alert('Logic Saved Successfully'); onClose(); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Save & Compile Rules</button>
          </div>
       </div>
    </div>
  )
}

const CrawlerConfig = () => {
    const { t } = useLanguage();
    const [isCrawling, setIsCrawling] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [sources, setSources] = useState(['sauditenders.sa', 'meed.com', 'constructionweekonline.com', 'momrah.gov.sa', 'redseaglobal.com']);
    const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
    const [isQueryBuilderOpen, setIsQueryBuilderOpen] = useState(false);
    const [discoveryResults, setDiscoveryResults] = useState<ScrapedSourceResult[]>([]);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    const englishQuery = `("commercial kitchen" OR "kitchen fit-out" OR "central kitchen" OR "laundry equipment") AND (hotel OR hospital OR "central kitchen" OR restaurant OR franchise OR "entertainment city") AND (Riyadh OR Jeddah OR Mecca OR Medina OR Dammam OR Khobar OR Yanbu OR Jazan OR Tabuk OR Abha OR Najran OR Qassim OR "Hafr Al Batin" OR "Khamis Mushait" OR "Al-Ula" OR "Al-Jouf")`;
    const arabicQuery = `("مطبخ مركزي" OR "معدات غسيل" OR "معدات مطبخ") AND (فندق OR مستشفى OR مطعم OR سلسلة مطاعم OR مشروع ترفيهي) AND (الرياض OR جدة OR مكة OR المدينة OR الدمام OR الخبر OR ينبع OR تبوك OR أبها OR نجران OR القصيم)`;

    // Auto-scroll terminal
    useEffect(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const runHybridCrawl = () => {
      if (isCrawling) return;
      setIsCrawling(true);
      setLogs([]);
      setDiscoveryResults([]);

      const sequence = [
        { msg: "[INIT] Starting Hybrid Crawl Protocol v1.0", delay: 100 },
        { msg: "[STEP 1] Automatic Discovery - Wide Scan initiated...", delay: 800 },
        { msg: `[SCAN] Keywords: "commercial kitchen", "hotel", "hospital", "laundry"`, delay: 1200 },
        { msg: "[FILTER] Ignoring general forums, low-quality directories, and spam farms...", delay: 2000 },
        { msg: "[DISCOVERED] found 'https://hospitality-news-sa.com/2023/awards'", delay: 2500 },
        { msg: "[SCORE] Relevance Analysis: Keyword Match (High), Domain (Trusted), Author (Verified)", delay: 3500 },
        { msg: "[SCORE] Calculated Score: 92/100 -> TRUSTED SOURCE", delay: 3600 },
        { msg: "[DISCOVERED] found 'https://random-blog-xyz.com/post/cheap-kitchens'", delay: 4500 },
        { msg: "[SCORE] Relevance Analysis: No Author, High Ad Density, Pop-ups detected", delay: 5200 },
        { msg: "[SCORE] Calculated Score: 25/100 -> REJECTED (Quality Standards)", delay: 5300 },
        { msg: "[DISCOVERED] found 'https://construction-weekly-update.org/projects/riyadh'", delay: 6200 },
        { msg: "[SCORE] Relevance Analysis: Content coherent, but Domain Authority Medium", delay: 6900 },
        { msg: "[SCORE] Score: 72/100 -> PENDING MANUAL REVIEW", delay: 7000 },
        { msg: "[STEP 5] Generating Final Output Report...", delay: 8000 },
        { msg: "[COMPLETE] Hybrid Crawl Finished. 3 Sources Processed.", delay: 8500 },
      ];

      let currentTime = 0;
      sequence.forEach(({ msg, delay }) => {
        currentTime += delay;
        setTimeout(() => addLog(msg), currentTime);
      });

      setTimeout(() => {
        setIsCrawling(false);
        setDiscoveryResults([
          { url: 'https://hospitality-news-sa.com/2023/awards', title: 'Hospitality News SA', score: 92, status: 'TRUSTED', dateDiscovered: new Date().toISOString() },
          { url: 'https://construction-weekly-update.org/projects/riyadh', title: 'Construction Weekly Update', score: 72, status: 'PENDING', dateDiscovered: new Date().toISOString() },
          { url: 'https://random-blog-xyz.com/post/cheap-kitchens', title: 'Random Blog XYZ', score: 25, status: 'REJECTED', reason: 'High Ad Density', dateDiscovered: new Date().toISOString() }
        ]);
      }, 9000);
    };

    return (
      <div className="space-y-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-900">{t('crawler')} Configuration</h1>
        
        {/* TERMINAL UI */}
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col h-80">
           <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
             <div className="flex items-center space-x-2">
               <div className="w-3 h-3 bg-red-500 rounded-full"></div>
               <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
               <div className="w-3 h-3 bg-green-500 rounded-full"></div>
               <span className="ml-2 text-slate-400 text-sm font-mono">ksa-intel-crawler --hybrid-mode</span>
             </div>
             <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isCrawling ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                <span className="text-xs font-mono text-slate-400">{isCrawling ? 'RUNNING' : 'IDLE'}</span>
             </div>
           </div>
           <div className="p-6 font-mono text-sm flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
              {logs.length === 0 && <div className="text-slate-500 italic"> Ready to initiate sequence...</div>}
              {logs.map((log, i) => (
                <div key={i} className={`${log.includes('TRUSTED') ? 'text-emerald-400 font-bold' : log.includes('REJECTED') ? 'text-red-400' : log.includes('PENDING') ? 'text-amber-400' : 'text-slate-300'}`}>
                  {log}
                </div>
              ))}
              <div ref={terminalEndRef}></div>
           </div>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-xl border border-slate-200 h-full flex flex-col">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Database size={18} className="mr-2"/> Seed Sources</h3>
             <ul className="space-y-2 flex-1 overflow-y-auto max-h-48 mb-4">
               {sources.map(url => (
                 <li key={url} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border border-slate-100 hover:border-slate-300 transition-colors">
                   <span className="text-slate-600 truncate mr-2">{url}</span>
                   <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active</span>
                 </li>
               ))}
             </ul>
             <button 
               onClick={() => setIsAddSourceOpen(true)}
               className="flex justify-center items-center text-sm p-2 bg-slate-50 rounded border-2 border-dashed border-slate-300 text-slate-500 hover:bg-slate-100 hover:border-slate-400 font-medium transition-all"
             >
               <Plus size={16} className="mr-2"/> Add New Source URL
             </button>
           </div>

           <div className="bg-white p-6 rounded-xl border border-slate-200 h-full flex flex-col justify-center items-center text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100}/></div>
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
               <RefreshCw size={32} className={isCrawling ? 'animate-spin' : ''} />
             </div>
             <h3 className="font-bold text-slate-800 text-lg mb-1">Crawl Control Center</h3>
             <p className="text-xs text-slate-500 mb-6 max-w-xs">Run a comprehensive hybrid discovery scan using advanced heuristic relevance scoring.</p>
             <div className="flex space-x-3 w-full px-4">
                <button 
                  onClick={runHybridCrawl} 
                  disabled={isCrawling}
                  className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
                >
                  {isCrawling ? 'Scanning...' : 'Run Hybrid Discovery'}
                </button>
             </div>
           </div>
        </div>
        
        {/* DISCOVERY RESULTS (Appears after crawl) */}
        {discoveryResults.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Activity size={18} className="mr-2"/> Discovery Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {['TRUSTED', 'PENDING', 'REJECTED'].map(status => (
                 <div key={status} className={`border rounded-lg p-4 ${status === 'TRUSTED' ? 'bg-emerald-50 border-emerald-100' : status === 'PENDING' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                    <h4 className={`font-bold text-sm mb-3 ${status === 'TRUSTED' ? 'text-emerald-800' : status === 'PENDING' ? 'text-amber-800' : 'text-red-800'}`}>{status} SOURCES</h4>
                    <div className="space-y-2">
                       {discoveryResults.filter(r => r.status === status).map((r, i) => (
                         <div key={i} className="bg-white p-2 rounded shadow-sm text-xs border border-slate-100">
                            <div className="font-medium truncate">{r.url}</div>
                            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                               <span>Score: {r.score}</span>
                               {r.reason && <span className="text-red-500">{r.reason}</span>}
                            </div>
                         </div>
                       ))}
                       {discoveryResults.filter(r => r.status === status).length === 0 && <div className="text-xs text-slate-400 italic">No items found.</div>}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* QUERY BUILDER */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="font-bold text-slate-800">Saved Keyword Logic</h3>
                   <p className="text-xs text-slate-500">Boolean logic used for "Wide Scan" discovery.</p>
                </div>
                <button 
                  onClick={() => setIsQueryBuilderOpen(true)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-200 flex items-center"
                >
                  <Code size={16} className="mr-2"/> Open Advanced Query Builder
                </button>
             </div>
             
             <div className="grid grid-cols-1 gap-6">
                <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-xs font-bold text-slate-500 uppercase flex items-center"><Globe size={12} className="mr-1"/> English Query Rule</label>
                       <button onClick={() => navigator.clipboard.writeText(englishQuery)} className="text-blue-600 text-xs hover:text-blue-800 flex items-center font-medium bg-blue-50 px-2 py-1 rounded"><Copy size={12} className="mr-1"/> Copy Rule</button>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-600 break-words max-h-24 overflow-y-auto leading-relaxed">
                     {englishQuery}
                   </div>
                </div>
                <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-xs font-bold text-slate-500 uppercase flex items-center"><Globe size={12} className="mr-1"/> Arabic Query Rule</label>
                       <button onClick={() => navigator.clipboard.writeText(arabicQuery)} className="text-blue-600 text-xs hover:text-blue-800 flex items-center font-medium bg-blue-50 px-2 py-1 rounded"><Copy size={12} className="mr-1"/> Copy Rule</button>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-600 break-words max-h-24 overflow-y-auto leading-relaxed" dir="rtl">
                     {arabicQuery}
                   </div>
                </div>
             </div>
        </div>

        {/* Modals */}
        <AddSourceModal isOpen={isAddSourceOpen} onClose={() => setIsAddSourceOpen(false)} onAdd={(url) => setSources(prev => [...prev, url])} />
        <AdvancedQueryBuilderModal isOpen={isQueryBuilderOpen} onClose={() => setIsQueryBuilderOpen(false)} englishQuery={englishQuery} arabicQuery={arabicQuery} />
      </div>
    );
};

// 10. MAIN APP ROUTING
const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <LanguageProvider>
          <ProjectProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<ProjectsList />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/companies" element={<CompaniesList />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/crawler" element={<CrawlerConfig />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminConsole />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProjectProvider>
        </LanguageProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
