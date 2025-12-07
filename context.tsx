
import React, { useState, useContext, useEffect } from 'react';
import { MOCK_PROJECTS, MOCK_USERS, TRANSLATIONS } from './constants';
import { Project, Language, User } from './types';

// --- LANGUAGE CONTEXT ---

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = React.createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

export const LanguageProvider = ({ children }: { children?: React.ReactNode }) => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
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

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
};

export const ProjectProvider = ({ children }: { children?: React.ReactNode }) => {
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
