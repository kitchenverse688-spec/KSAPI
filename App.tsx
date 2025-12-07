
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
  Server,
  FileJson,
  Network,
  ListPlus
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
import { MOCK_PROJECTS, MOCK_USERS, MOCK_AUDIT_LOGS, MOCK_ACTIVITY_LOGS, MOCK_COMPANIES, FORMAT_CURRENCY, FORMAT_DATE, TRANSLATIONS, DOWNLOAD_CSV, DOWNLOAD_PDF, parseAIQuery, MOCK_POTENTIAL_PROJECTS, DOWNLOAD_DASHBOARD_REPORT } from './constants';
import { Project, ProjectStatus, ProjectType, City, FilterState, SavedSearch, Language, SearchQuery, ScrapingSettings, User, Role, AlertConfig, AuditLog, Company, ScrapedSourceResult, CrawledPageLog, PotentialProject } from './types';

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

// --- CRAWLER CONFIGURATION ---

const StagingReviewModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { projects, addProject, updateProject } = useProjects();
  const [stagedProjects, setStagedProjects] = useState<PotentialProject[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // In a real app, this would come from a global store or be passed down
  // Here we load the MOCK_POTENTIAL_PROJECTS when opened to simulate "found" items
  useEffect(() => {
    if (isOpen) {
      // Simulate checking for duplicates against current projects
      const processed = MOCK_POTENTIAL_PROJECTS.map(staged => {
        const existing = projects.find(p => 
          p.name === staged.projectName || 
          (p.city === staged.city && p.developer === staged.developer)
        );
        
        return {
          ...staged,
          isDuplicate: !!existing,
          existingProjectId: existing?.id
        };
      });
      setStagedProjects(processed);
    }
  }, [isOpen, projects]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleImport = () => {
    const toImport = stagedProjects.filter(p => selectedIds.has(p.id));
    
    toImport.forEach(staged => {
      if (staged.isDuplicate && staged.existingProjectId) {
        // UPDATE Logic
        const existing = projects.find(p => p.id === staged.existingProjectId);
        if (existing) {
          const updated: Project = {
            ...existing,
            // Only update fields that are likely to change or improve
            status: staged.status,
            contractor: staged.contractor || existing.contractor,
            consultant: staged.consultant || existing.consultant,
            lastUpdated: new Date().toISOString(),
            news: [
              ...existing.news, 
              {
                id: `n-${Date.now()}`,
                title: staged.sourceTitle,
                source: 'Hybrid Crawler',
                date: staged.publishDate,
                snippet: staged.summary,
                url: staged.sourceUrl,
                confidenceScore: 1.0
              }
            ],
            history: [
              ...(existing.history || []),
              {
                date: new Date().toISOString(),
                field: 'Status/Details',
                oldValue: existing.status,
                newValue: staged.status,
                user: 'Crawler Bot'
              }
            ]
          };
          updateProject(updated);
        }
      } else {
        // CREATE Logic
        const newProject: Project = {
          id: `crawled-${Date.now()}-${Math.random()}`,
          name: staged.projectName,
          type: staged.type,
          city: staged.city,
          region: staged.region,
          developer: staged.developer,
          contractor: staged.contractor,
          consultant: staged.consultant,
          status: staged.status,
          estimatedValueSAR: staged.estimatedValue || 0,
          expectedCompletion: staged.estimatedOpening || '',
          confidenceScore: 0.85,
          tags: [staged.classification, 'Crawled'],
          lastUpdated: new Date().toISOString(),
          news: [{
            id: `n-${Date.now()}`,
            title: staged.sourceTitle,
            source: 'Hybrid Crawler',
            date: staged.publishDate,
            snippet: staged.summary,
            url: staged.sourceUrl,
            confidenceScore: 1.0
          }],
          description: staged.summary,
          history: []
        };
        addProject(newProject);
      }
    });

    alert(`Successfully processed ${toImport.length} projects.`);
    onClose();
  };

  const exportCSV = () => {
    DOWNLOAD_CSV(stagedProjects, 'Crawler_Staged_Results');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="bg-emerald-500/20 p-2 rounded">
               <Database size={20} className="text-emerald-400"/>
             </div>
             <div>
               <h3 className="font-bold text-lg">Data Staging & Review</h3>
               <p className="text-xs text-slate-400">Review crawled data before importing to master database</p>
             </div>
          </div>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 p-6">
           <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                 <div className="flex space-x-2">
                   <button onClick={() => setSelectedIds(new Set(stagedProjects.map(p => p.id)))} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50">Select All</button>
                   <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50">Deselect All</button>
                 </div>
                 <button onClick={exportCSV} className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded hover:bg-blue-100">
                    <Download size={14} className="mr-1"/> Export JSON/CSV
                 </button>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3">Project Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Developer</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Classification</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stagedProjects.map(project => (
                    <tr key={project.id} className={`hover:bg-slate-50 ${project.isDuplicate ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(project.id)} 
                          onChange={() => handleToggleSelect(project.id)}
                          className="rounded text-ksa-green focus:ring-ksa-green"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {project.projectName}
                        {project.isDuplicate && <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">DUPLICATE</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{project.type}</td>
                      <td className="px-4 py-3">{project.developer}</td>
                      <td className="px-4 py-3">{project.city}</td>
                      <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{project.status}</span></td>
                      <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${
                           project.classification === 'New' ? 'bg-emerald-100 text-emerald-800' :
                           project.classification === 'Backlog' ? 'bg-blue-100 text-blue-800' :
                           'bg-gray-100 text-gray-800'
                         }`}>
                           {project.classification}
                         </span>
                      </td>
                      <td className="px-4 py-3">
                         <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                      </td>
                    </tr>
                  ))}
                  {stagedProjects.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-slate-500 italic">No projects staged for review. Run the crawler first.</td></tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
           <div className="text-sm text-slate-500">
             {selectedIds.size} projects selected for import
           </div>
           <div className="flex space-x-3">
             <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
             <button 
               onClick={handleImport}
               disabled={selectedIds.size === 0}
               className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center"
             >
               <Check size={16} className="mr-2"/> Import Selected to Database
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

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
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [discoveryResults, setDiscoveryResults] = useState<ScrapedSourceResult[]>([]);
    const [manualUrl, setManualUrl] = useState('');
    const [visitedPages, setVisitedPages] = useState<CrawledPageLog[]>([]);
    const [scanMode, setScanMode] = useState<{fresh: boolean, backlog: boolean}>({ fresh: true, backlog: true });
    const terminalEndRef = useRef<HTMLDivElement>(null);

    const englishQuery = `("commercial kitchen" OR "kitchen fit-out" OR "central kitchen" OR "laundry equipment") AND (hotel OR hospital OR "central kitchen" OR restaurant OR franchise OR "entertainment city") AND (Riyadh OR Jeddah OR Mecca OR Medina OR Dammam OR Khobar OR Yanbu OR Jazan OR Tabuk OR Abha OR Najran OR Qassim OR "Hafr Al Batin" OR "Khamis Mushait" OR "Al-Ula" OR "Al-Jouf")`;
    const arabicQuery = `("مطبخ مركزي" OR "معدات غسيل" OR "معدات مطبخ") AND (فندق OR مستشفى OR مطعم OR سلسلة مطاعم OR مشروع ترفيهي) AND (الرياض OR جدة OR مكة OR المدينة OR الدمام OR الخبر OR ينبع OR تبوك OR أبها OR نجران OR القصيم)`;

    // Auto-scroll terminal
    useEffect(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (msg: string) => {
       const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
       setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
    };

    const addVisitedPage = (url: string, status: number) => {
       setVisitedPages(prev => [{ url, timestamp: new Date().toLocaleTimeString(), status, durationMs: Math.floor(Math.random() * 800) + 100 }, ...prev]);
    }

    const runHybridCrawl = () => {
      if (isCrawling) return;
      setIsCrawling(true);
      setLogs([]);
      setDiscoveryResults([]);
      setManualUrl('');
      setVisitedPages([]);

      const sequence: { msg: string; delay: number; action?: () => void }[] = [
        { msg: "INIT: Starting Hybrid Project Discovery Protocol v3.0", delay: 100 },
        { msg: "CONFIG: Setting Scope -> HOSPITALITY ONLY (Hotels, Resorts, Tourism)", delay: 500 },
        { msg: "CONFIG: Prioritizing High-Trust Domains (PIF, Gov Portals, Press Releases)", delay: 800 },
      ];

      let delayCounter = 1200;

      // FRESH SCAN LOGIC
      if (scanMode.fresh) {
        sequence.push(
            { msg: "MODE START: Fresh Projects Scan (Last 7 Days)", delay: delayCounter },
            { msg: `QUERY: "hospitality project announced" OR "new hotel project" OR "PIF announcement"`, delay: delayCounter + 800 },
            { msg: "SCAN: Checking Ministry of Tourism & Invest Saudi portals...", delay: delayCounter + 1500, action: () => addVisitedPage('https://mt.gov.sa/news', 200) },
            { msg: "FOUND: New Article -> 'Qiddiya Water Park Resort'", delay: delayCounter + 2500 },
            { msg: "AI EXTRACT: Identified Developer -> 'Qiddiya Investment Co'", delay: delayCounter + 2800 },
            { msg: "AI EXTRACT: Identified Contractor -> 'ALEC Engineering'", delay: delayCounter + 3000 },
            { msg: "ANALYZE: Date: Today. Status: Ongoing. Class: NEW", delay: delayCounter + 3200 },
             // Add result later
        );
        delayCounter += 4000;
      }

      // BACKLOG SCAN LOGIC
      if (scanMode.backlog) {
         sequence.push(
            { msg: "MODE START: Backlog Scan (Last 12-24 Months)", delay: delayCounter },
            { msg: `QUERY: "project under construction" OR "tender issued hotel"`, delay: delayCounter + 800 },
            { msg: "SCAN: Crawling Construction Week archives...", delay: delayCounter + 1500, action: () => addVisitedPage('https://constructionweekonline.com/projects', 200) },
            { msg: "FOUND: Archive Entry -> 'Abha Luxury Mountain Retreat'", delay: delayCounter + 2500 },
            { msg: "AI EXTRACT: Identified Region -> 'Asir'", delay: delayCounter + 2800 },
            { msg: "CLASSIFY: Age > 30 days -> BACKLOG", delay: delayCounter + 3200 },
         );
         delayCounter += 6000;
      }
      
      sequence.push(
          { msg: "FINALIZE: Converting unstructured text to JSON...", delay: delayCounter },
          { msg: "STAGING: 3 Projects ready for review.", delay: delayCounter + 800 },
          { msg: "COMPLETE: Discovery Cycle Finished.", delay: delayCounter + 1200 }
      );

      let currentTime = 0;
      sequence.forEach((item) => {
        currentTime = item.delay; 
        setTimeout(() => {
          addLog(item.msg);
          if (item.action) item.action();
        }, currentTime);
      });

      // Generate Mock Results
      setTimeout(() => {
        setIsCrawling(false);
        // We open the review modal automatically or let user click
        setIsReviewOpen(true);
      }, delayCounter + 2000);
    };

    const runManualCrawl = () => {
        if (!manualUrl || isCrawling) return;
        setIsCrawling(true);
        setLogs([]);
        setDiscoveryResults([]);
        setVisitedPages([]);

        const sequence: { msg: string; delay: number; action?: () => void }[] = [
            { msg: `INIT: Manual Inspection Protocol initiated for target: ${manualUrl}`, delay: 100 },
            { msg: `CONNECT: Handshaking with ${manualUrl}...`, delay: 800, action: () => addVisitedPage(manualUrl, 200) },
            { msg: "FETCH: Downloading HTML content (245kb)...", delay: 1500 },
            { msg: "PARSE: Parsing DOM structure...", delay: 2000 },
            { msg: "ANALYZE: Checking for project keywords (Kitchen, Laundry, Tender)...", delay: 2800 },
            { msg: "AI AGENT: Initializing Content Extraction Model...", delay: 3200 },
            { msg: "AI AGENT: Identified 'Project Name' -> 'Sunset Beach Resort Phase 2'", delay: 3800 },
            { msg: "AI AGENT: Identified 'Value' -> '350M SAR'", delay: 4000 },
            { msg: "AI AGENT: Identified 'Developer' -> 'Dur Hospitality'", delay: 4200 },
            { msg: "AI AGENT: Extraction Confidence: 94%", delay: 4400 },
            { msg: "NLP: Extracting entities (Developers, Cost, Location)...", delay: 4800 },
            { msg: "VALIDATE: Checking robots.txt and sitemap compliance...", delay: 5200 },
            { msg: `COMPLETE: Analysis finished for ${manualUrl}`, delay: 5500 }
        ];

        let currentTime = 0;
        sequence.forEach((item) => {
            currentTime += item.delay;
            setTimeout(() => {
              addLog(item.msg);
              if (item.action) item.action();
            }, currentTime);
        });
        
        // Result generation
        setTimeout(() => {
             setIsCrawling(false);
             setDiscoveryResults([{
                 url: manualUrl,
                 title: 'Manual Inspection Result',
                 score: 88, 
                 status: 'REVIEW',
                 dateDiscovered: new Date().toISOString(),
                 aiExtractedData: {
                    projectName: 'Sunset Beach Resort Phase 2',
                    estimatedValue: '350M SAR',
                    developer: 'Dur Hospitality',
                    status: 'Tender'
                 }
             }]);
        }, 5800);
    };

    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900">{t('crawler')} Configuration</h1>
        
        {/* TERMINAL UI */}
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col h-80 relative">
           <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
             <div className="flex items-center space-x-2">
               <div className="w-3 h-3 bg-red-500 rounded-full"></div>
               <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
               <div className="w-3 h-3 bg-green-500 rounded-full"></div>
               <span className="ml-2 text-slate-400 text-sm font-mono">ksa-intel-crawler --hospitality-mode</span>
             </div>
             <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isCrawling ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                <span className="text-xs font-mono text-slate-400">{isCrawling ? 'RUNNING' : 'IDLE'}</span>
             </div>
           </div>
           <div className="p-6 font-mono text-sm flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
              {logs.length === 0 && <div className="text-slate-500 italic"> Ready to initiate hospitality discovery sequence...</div>}
              {logs.map((log, i) => (
                <div key={i} className={`${log.includes('NEW') || log.includes('TRUSTED') ? 'text-emerald-400 font-bold' : log.includes('BACKLOG') ? 'text-blue-400' : log.includes('REVIEW') ? 'text-amber-400' : log.includes('AI EXTRACT') ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {log}
                </div>
              ))}
              <div ref={terminalEndRef}></div>
           </div>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* LEFT: SOURCES & VISITED LOG */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 h-full flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center"><Database size={18} className="mr-2"/> Seed Sources</h3>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Target List</span>
             </div>
             <ul className="space-y-2 overflow-y-auto max-h-32 mb-4 border-b border-slate-100 pb-4">
               {sources.map(url => (
                 <li key={url} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border border-slate-100 hover:border-slate-300 transition-colors">
                   <span className="text-slate-600 truncate mr-2">{url}</span>
                   <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active</span>
                 </li>
               ))}
             </ul>
             
             {/* TRAFFIC LOG SECTION */}
             <div className="flex-1 mt-2">
                <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center"><Network size={14} className="mr-2"/> Live Network Traffic</h4>
                <div className="bg-slate-900 rounded-lg p-3 h-40 overflow-y-auto font-mono text-xs">
                    {visitedPages.length === 0 && <div className="text-slate-600 text-center py-4">Waiting for traffic...</div>}
                    {visitedPages.map((page, i) => (
                        <div key={i} className="flex space-x-2 border-b border-slate-800 pb-1 mb-1 last:border-0">
                           <span className="text-slate-500">[{page.timestamp}]</span>
                           <span className={page.status === 200 ? 'text-green-500' : 'text-red-500'}>{page.status}</span>
                           <span className="text-slate-300 truncate flex-1" title={page.url}>{page.url}</span>
                           <span className="text-slate-600">{page.durationMs}ms</span>
                        </div>
                    ))}
                </div>
             </div>
           </div>

           {/* RIGHT: ACTIONS & MANUAL INSPECT */}
           <div className="space-y-4 h-full flex flex-col">
              {/* HYBRID CRAWL */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={80}/></div>
                
                <h3 className="font-bold text-slate-800 text-lg mb-2">Hospitality Discovery Mode</h3>
                
                <div className="flex space-x-4 mb-4 text-sm text-left w-full px-4">
                   <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-2 rounded border border-slate-200 flex-1">
                      <input type="checkbox" checked={scanMode.fresh} onChange={() => setScanMode(p => ({...p, fresh: !p.fresh}))} className="rounded text-ksa-green focus:ring-ksa-green" />
                      <div>
                         <span className="block font-bold text-slate-800">Fresh Scan</span>
                         <span className="text-xs text-slate-500">Last 7 days (New)</span>
                      </div>
                   </label>
                   <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-2 rounded border border-slate-200 flex-1">
                      <input type="checkbox" checked={scanMode.backlog} onChange={() => setScanMode(p => ({...p, backlog: !p.backlog}))} className="rounded text-ksa-green focus:ring-ksa-green" />
                      <div>
                         <span className="block font-bold text-slate-800">Backlog Scan</span>
                         <span className="text-xs text-slate-500">Last 1-2 years</span>
                      </div>
                   </label>
                </div>

                <div className="flex space-x-2 w-full">
                    <button 
                        onClick={runHybridCrawl} 
                        disabled={isCrawling || (!scanMode.fresh && !scanMode.backlog)}
                        className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center transition-all"
                    >
                        {isCrawling ? 'Scanning Network...' : 'Run Hospitality Discovery'}
                    </button>
                    <button 
                       onClick={() => setIsAddSourceOpen(true)}
                       className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-bold"
                       title="Add Source"
                    >
                       <Plus size={18}/>
                    </button>
                </div>
                
                {/* NEW: Review Button */}
                <div className="w-full mt-2 px-4">
                   <button 
                     onClick={() => setIsReviewOpen(true)}
                     className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 flex items-center justify-center"
                   >
                     <ListPlus size={16} className="mr-2"/> Open Staging Review
                   </button>
                </div>
              </div>

              {/* MANUAL INSPECT */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center text-sm"><Search size={16} className="mr-2"/> Manual Site Inspector</h3>
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="Enter specific URL..."
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && runManualCrawl()}
                    />
                    <button 
                        onClick={runManualCrawl}
                        disabled={isCrawling || !manualUrl}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        Inspect
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 flex items-center"><Sparkles size={10} className="mr-1"/> Includes AI Content Extraction</p>
              </div>
           </div>
        </div>

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
        <StagingReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
      </div>
    );
};

const Dashboard = () => {
  const { projects } = useProjects();
  const { t, lang } = useLanguage();

  const totalValue = projects.reduce((sum, p) => sum + (p.estimatedValueSAR || 0), 0);
  const pipelineValue = projects.reduce((sum, p) => sum + (p.expectedKLScopeValue || 0), 0);
  
  const statusData = [
    { name: 'Ongoing', value: projects.filter(p => p.status === ProjectStatus.ONGOING).length, color: '#10B981' },
    { name: 'Tender', value: projects.filter(p => p.status === ProjectStatus.TENDER).length, color: '#F59E0B' },
    { name: 'Awarded', value: projects.filter(p => p.status === ProjectStatus.AWARDED).length, color: '#3B82F6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard')}</h1>
        <button onClick={() => DOWNLOAD_DASHBOARD_REPORT()} className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
          <Download size={16} className="mr-2" /> {t('downloadReport')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg"><Building2 className="text-blue-600" size={24} /></div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+2 this week</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{projects.length}</div>
          <div className="text-sm text-slate-500">{t('totalProjects')}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg"><Zap className="text-emerald-600" size={24} /></div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">High Conf.</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{FORMAT_CURRENCY(pipelineValue, lang)}</div>
          <div className="text-sm text-slate-500">{t('activePipeline')}</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-amber-50 rounded-lg"><Clock className="text-amber-600" size={24} /></div>
          </div>
           <div className="text-3xl font-bold text-slate-900 mb-1">{projects.filter(p => p.status === ProjectStatus.TENDER).length}</div>
           <div className="text-sm text-slate-500">Active Tenders</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 rounded-lg"><Activity className="text-purple-600" size={24} /></div>
           </div>
           <div className="text-3xl font-bold text-slate-900 mb-1">{projects.filter(p => p.status === ProjectStatus.ONGOING).length}</div>
           <div className="text-sm text-slate-500">Projects Ongoing</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Project Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center text-xs">
                <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <h3 className="font-bold text-slate-800 mb-4">Latest Market Intelligence</h3>
           <div className="flex-1 overflow-y-auto space-y-4 pr-2">
             {projects.slice(0, 3).map(p => (
               p.news.map(n => (
                 <div key={n.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-blue-600">{n.source}</span>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 mb-1 line-clamp-2">{n.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{n.snippet}</p>
                 </div>
               ))
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const ProjectsList = () => {
  const { projects } = useProjects();
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState('');

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.developer.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{t('projects')}</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ksa-green/20"
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-ksa-green text-white rounded-lg text-sm font-bold hover:bg-green-800">
             <Plus size={16} className="mr-2" /> Add Project
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th className="px-6 py-4">{t('projectDetails')}</th>
              <th className="px-6 py-4">{t('type')}</th>
              <th className="px-6 py-4">{t('city')}</th>
              <th className="px-6 py-4">{t('status')}</th>
              <th className="px-6 py-4">{t('value')}</th>
              <th className="px-6 py-4">KL Scope</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(project => (
              <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{lang === 'ar' ? project.name_ar || project.name : project.name}</div>
                  <div className="text-xs text-slate-500">{project.developer}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{project.type}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{project.city}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    project.status === ProjectStatus.ONGOING ? 'bg-emerald-100 text-emerald-700' :
                    project.status === ProjectStatus.TENDER ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700 font-mono">
                  {FORMAT_CURRENCY(project.estimatedValueSAR, lang)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-1">
                    {project.kitchenScope && <span className="w-2 h-2 rounded-full bg-orange-400" title="Kitchen"></span>}
                    {project.laundryScope && <span className="w-2 h-2 rounded-full bg-blue-400" title="Laundry"></span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-xs">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { projects } = useProjects();
  const project = projects.find(p => p.id === id);
  const navigate = useNavigate();

  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6">
       <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 text-sm">
         <ArrowLeft size={16} className="mr-1" /> Back to Projects
       </button>
       
       <div className="flex justify-between items-start">
         <div>
           <h1 className="text-2xl font-bold text-slate-900 mb-2">{project.name}</h1>
           <div className="flex space-x-2">
             <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">{project.type}</span>
             <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100">{project.city}</span>
           </div>
         </div>
         <div className="flex space-x-3">
            <button onClick={() => DOWNLOAD_PDF(project)} className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
               <Download size={16} className="mr-2"/> Export PDF
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
               <Edit2 size={16} className="mr-2"/> Edit Project
            </button>
         </div>
       </div>

       <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Project Overview</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{project.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                      <span className="block text-slate-400 text-xs">Developer</span>
                      <span className="font-medium text-slate-800">{project.developer}</span>
                   </div>
                   <div>
                      <span className="block text-slate-400 text-xs">Contractor</span>
                      <span className="font-medium text-slate-800">{project.contractor || 'TBD'}</span>
                   </div>
                   <div>
                      <span className="block text-slate-400 text-xs">Consultant</span>
                      <span className="font-medium text-slate-800">{project.consultant || 'TBD'}</span>
                   </div>
                   <div>
                      <span className="block text-slate-400 text-xs">Completion</span>
                      <span className="font-medium text-slate-800">{project.expectedCompletion}</span>
                   </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Technical Scope (K&L)</h3>
                <div className="flex space-x-6 mb-4">
                   <div className={`flex-1 p-4 rounded-lg border ${project.kitchenScope ? 'border-orange-200 bg-orange-50' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2"><LayoutDashboard size={16} className="text-orange-600"/></div>
                        <span className="font-bold text-orange-900">Food Service</span>
                      </div>
                      <p className="text-xs text-slate-600">Full central production unit and satellite kitchens required.</p>
                   </div>
                   <div className={`flex-1 p-4 rounded-lg border ${project.laundryScope ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2"><Sparkles size={16} className="text-blue-600"/></div>
                        <span className="font-bold text-blue-900">Laundry</span>
                      </div>
                      <p className="text-xs text-slate-600">On-premise laundry facility for 500+ keys.</p>
                   </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                   <div>
                      <span className="block text-xs text-slate-500">Estimated Package Value</span>
                      <span className="text-xl font-bold text-emerald-600">{FORMAT_CURRENCY(project.expectedKLScopeValue || 0)}</span>
                   </div>
                   <div className="text-right">
                      <span className="block text-xs text-slate-500">Sales Probability</span>
                      <span className="text-lg font-bold text-slate-800">{project.salesData?.probability}%</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Attachments</h3>
                <div className="space-y-3">
                   {project.attachments?.map(att => (
                     <div key={att.id} className="flex items-center p-3 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 cursor-pointer">
                        <FileText size={20} className="text-slate-400 mr-3"/>
                        <div className="flex-1 overflow-hidden">
                           <div className="text-sm font-medium text-slate-700 truncate">{att.name}</div>
                           <div className="text-xs text-slate-400">{att.size} • {att.type}</div>
                        </div>
                        <Download size={14} className="text-slate-400"/>
                     </div>
                   ))}
                   {(!project.attachments || project.attachments.length === 0) && <div className="text-sm text-slate-400 italic">No files attached</div>}
                </div>
             </div>
             
             <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Intelligence Feed</h3>
                <div className="space-y-4">
                   {project.news.map(n => (
                     <div key={n.id} className="relative pl-4 border-l-2 border-slate-200">
                        <div className="text-[10px] text-slate-400 mb-1">{n.date} • {n.source}</div>
                        <a href={n.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline block mb-1">{n.title}</a>
                        <p className="text-xs text-slate-500 line-clamp-2">{n.snippet}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const CompaniesList = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Company Directory</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_COMPANIES.map(company => (
                    <div key={company.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 text-lg">
                                {company.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{company.name}</h3>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{company.type}</span>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center"><MapIcon size={14} className="mr-2 text-slate-400"/> {company.city}</div>
                            {company.website && <div className="flex items-center"><Globe size={14} className="mr-2 text-slate-400"/> <a href={company.website} className="text-blue-600 hover:underline">Website</a></div>}
                            {company.contactPerson && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Key Contact</p>
                                    <p className="font-medium text-slate-800">{company.contactPerson.name}</p>
                                    <p className="text-xs text-slate-500">{company.contactPerson.role}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const Pipeline = () => {
  const { projects } = useProjects();
  const stages = ['Review', 'Qualified', 'Proposal', 'Negotiation', 'Won']; // Simplified
  // MOCK mapping for demo
  const getStage = (p: Project) => {
     if (p.salesData?.probability && p.salesData.probability >= 90) return 'Won';
     if (p.salesData?.probability && p.salesData.probability >= 70) return 'Negotiation';
     if (p.salesData?.probability && p.salesData.probability >= 40) return 'Proposal';
     if (p.salesData?.probability && p.salesData.probability >= 20) return 'Qualified';
     return 'Review';
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
        </div>
        <div className="flex-1 overflow-x-auto">
            <div className="flex h-full min-w-max space-x-4 pb-4">
                {stages.map(stage => (
                    <div key={stage} className="w-80 flex flex-col bg-slate-100 rounded-xl max-h-full">
                        <div className="p-4 font-bold text-slate-700 border-b border-slate-200 flex justify-between items-center">
                            {stage}
                            <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600">
                                {projects.filter(p => getStage(p) === stage).length}
                            </span>
                        </div>
                        <div className="p-2 flex-1 overflow-y-auto space-y-2">
                            {projects.filter(p => getStage(p) === stage).map(project => (
                                <div key={project.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                                    <div className="font-bold text-sm text-slate-800 mb-1">{project.name}</div>
                                    <div className="text-xs text-slate-500 mb-2">{project.developer}</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-emerald-600">{FORMAT_CURRENCY(project.expectedKLScopeValue || 0)}</span>
                                        {project.salesData?.probability && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                project.salesData.probability > 60 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                            }`}>{project.salesData.probability}%</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

const MapView = () => {
    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Geospatial Project View</h1>
            <div className="flex-1 bg-slate-200 rounded-xl overflow-hidden relative border border-slate-300 flex items-center justify-center">
                 <div className="text-center">
                    <MapIcon size={48} className="text-slate-400 mx-auto mb-2"/>
                    <p className="text-slate-500 font-medium">Interactive Map Module</p>
                    <p className="text-xs text-slate-400">Google Maps API / Mapbox Integration Placeholder</p>
                 </div>
                 {/* Simulate Pins */}
                 <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer" title="Riyadh Project"></div>
                 <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer" title="Jeddah Project"></div>
                 <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg cursor-pointer" title="Dammam Project"></div>
            </div>
        </div>
    )
}

const SettingsPage = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center"><UserIcon size={18} className="mr-2"/> User Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" className="w-full p-2 border border-slate-300 rounded" defaultValue="Admin User" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" className="w-full p-2 border border-slate-300 rounded" defaultValue="admin@ksaintel.com" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Bell size={18} className="mr-2"/> Notifications</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Email Alerts for New Projects</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Daily Digest Summary</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                </div>
            </div>
        </div>
    )
}

const AdminConsole = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center text-red-600"><Shield size={24} className="mr-2"/> Admin Console</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">User Management</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="p-2">User</th>
                                <th className="p-2">Role</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_USERS.map(u => (
                                <tr key={u.id} className="border-t border-slate-100">
                                    <td className="p-2 font-medium">{u.name}</td>
                                    <td className="p-2">{u.role}</td>
                                    <td className="p-2 text-green-600">Active</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">System Audit Log</h3>
                    <div className="space-y-2 text-xs font-mono max-h-48 overflow-y-auto">
                        {MOCK_AUDIT_LOGS.map(log => (
                            <div key={log.id} className="p-2 bg-slate-50 border border-slate-100 rounded">
                                <span className="text-slate-400">[{log.timestamp}]</span> <span className="text-blue-600">{log.user}</span>: {log.action}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <LanguageProvider>
          <ProjectProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/projects" element={<Layout><ProjectsList /></Layout>} />
              <Route path="/projects/:id" element={<Layout><ProjectDetail /></Layout>} />
              <Route path="/companies" element={<Layout><CompaniesList /></Layout>} />
              <Route path="/pipeline" element={<Layout><Pipeline /></Layout>} />
              <Route path="/map" element={<Layout><MapView /></Layout>} />
              <Route path="/crawler" element={<Layout><CrawlerConfig /></Layout>} />
              <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
              <Route path="/admin" element={<Layout><AdminConsole /></Layout>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ProjectProvider>
        </LanguageProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
