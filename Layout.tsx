
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Map as MapIcon, Kanban, Search, Settings, 
  Bell, Menu, X, Database, Shield, LogOut, Users, Globe 
} from 'lucide-react';
import { useAuth, useLanguage } from './context';
import { MOCK_USERS } from './constants';

export const Login = () => {
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

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, toggleLang, t, dir } = useLanguage();
  const { user, logout } = useAuth();

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
