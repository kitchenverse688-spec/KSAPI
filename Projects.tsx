
import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Search, Plus, ArrowLeft, Download, Edit2, LayoutDashboard, Sparkles, FileText 
} from 'lucide-react';
import { useProjects, useLanguage } from './context';
import { ProjectStatus } from './types';
import { FORMAT_CURRENCY, DOWNLOAD_PDF } from './constants';

export const ProjectsList = () => {
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

export const ProjectDetail = () => {
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
