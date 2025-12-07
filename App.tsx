
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, LanguageProvider, ProjectProvider } from './context';
import { Layout, Login } from './Layout';
import { Dashboard, MapView } from './Dashboard';
import { ProjectsList, ProjectDetail } from './Projects';
import { CompaniesList, Pipeline } from './CRM';
import { CrawlerConfig } from './CrawlerConfig';
import { AdminConsole, SettingsPage } from './Admin';

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
