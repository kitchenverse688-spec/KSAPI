
import React from 'react';
import { 
  Map as MapIcon, Globe,
} from 'lucide-react';
import { useProjects, useLanguage } from './context';
import { MOCK_COMPANIES, FORMAT_CURRENCY } from './constants';
import { Project } from './types';

export const CompaniesList = () => {
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

export const Pipeline = () => {
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
