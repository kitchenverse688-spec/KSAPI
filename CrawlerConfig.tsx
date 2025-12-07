
import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Network, Zap, Search, Globe2, ListPlus, Terminal, Bookmark,
  Copy, Download, Check, X, Code, Activity, Sparkles, Plus, Globe
} from 'lucide-react';
import { useLanguage, useProjects } from './context';
import { Project, ProjectStatus, ProjectType, City, SavedSearch, ScrapedSourceResult, CrawledPageLog, PotentialProject } from './types';
import { MOCK_POTENTIAL_PROJECTS, DOWNLOAD_CSV } from './constants';

// --- SUB-COMPONENTS ---

const StagingReviewModal = ({ isOpen, onClose, items, onItemsChange }: { isOpen: boolean, onClose: () => void, items: PotentialProject[], onItemsChange: (items: PotentialProject[]) => void }) => {
  const { projects, addProject, updateProject } = useProjects();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length > 0) {
      const processed = items.map(staged => {
        const existing = projects.find(p => 
          p.name === staged.projectName || 
          (p.city === staged.city && p.developer === staged.developer)
        );
        
        if (!!existing !== staged.isDuplicate) {
             return {
              ...staged,
              isDuplicate: !!existing,
              existingProjectId: existing?.id
            };
        }
        return staged;
      });
      
      const hasChanges = processed.some((p, i) => p.isDuplicate !== items[i].isDuplicate);
      if (hasChanges) {
        onItemsChange(processed);
      }
    }
  }, [projects, items, onItemsChange]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleImport = () => {
    const toImport = items.filter(p => selectedIds.has(p.id));
    
    toImport.forEach(staged => {
      if (staged.isDuplicate && staged.existingProjectId) {
        const existing = projects.find(p => p.id === staged.existingProjectId);
        if (existing) {
          const updated: Project = {
            ...existing,
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

    const remaining = items.filter(p => !selectedIds.has(p.id));
    onItemsChange(remaining);
    setSelectedIds(new Set());

    alert(`Successfully processed ${toImport.length} projects.`);
    if (remaining.length === 0) {
        onClose();
    }
  };

  const exportCSV = () => {
    DOWNLOAD_CSV(items, 'Crawler_Staged_Results');
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
                   <button onClick={() => setSelectedIds(new Set(items.map(p => p.id)))} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50">Select All</button>
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
                  {items.map(project => (
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
                  {items.length === 0 && (
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

interface QueryBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    englishQuery: string;
    setEnglishQuery: (q: string) => void;
    arabicQuery: string;
    setArabicQuery: (q: string) => void;
    savedQueries: SavedSearch[];
    saveQuery: (name: string) => void;
    loadQuery: (query: string) => void;
}

const AdvancedQueryBuilderModal = ({ isOpen, onClose, englishQuery, setEnglishQuery, arabicQuery, setArabicQuery, savedQueries, saveQuery, loadQuery }: QueryBuilderProps) => {
  const [newQueryName, setNewQueryName] = useState('');

  if (!isOpen) return null;

  const insertText = (text: string, isEnglish: boolean) => {
      if (isEnglish) {
          setEnglishQuery(englishQuery + text);
      } else {
          setArabicQuery(arabicQuery + text);
      }
  };

  const handleSave = () => {
      if(newQueryName.trim()){
          saveQuery(newQueryName);
          setNewQueryName('');
          alert('Template Saved!');
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
       <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center"><Terminal size={18} className="mr-2 text-emerald-400"/> Advanced Boolean Logic Builder</h3>
            <button onClick={onClose}><X size={20}/></button>
          </div>
          <div className="flex flex-1 overflow-hidden">
             {/* SIDEBAR */}
             <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
                 <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center"><Bookmark size={12} className="mr-2"/> Saved Templates</h4>
                 <div className="space-y-2">
                     {savedQueries.map(sq => (
                         <div key={sq.id} onClick={() => loadQuery(sq.filters.search)} className="p-2 bg-white border border-slate-200 rounded cursor-pointer hover:border-blue-300 hover:shadow-sm text-sm">
                             <div className="font-medium text-slate-700">{sq.name}</div>
                             <div className="text-[10px] text-slate-400 truncate mt-1">{sq.filters.search}</div>
                         </div>
                     ))}
                     {savedQueries.length === 0 && <div className="text-xs text-slate-400 italic p-2">No templates saved yet.</div>}
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-slate-200">
                     <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Save Current Logic</label>
                     <input type="text" placeholder="Template Name..." className="w-full p-2 border rounded text-xs mb-2" value={newQueryName} onChange={e => setNewQueryName(e.target.value)} />
                     <button onClick={handleSave} className="w-full py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300">Save as Template</button>
                 </div>
             </div>

             {/* MAIN CONTENT */}
             <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="font-bold text-blue-800 text-sm mb-2">Logic Architecture</h4>
                    <p className="text-xs text-blue-600">Combine groups using Boolean Operators to refine crawler scope.</p>
                </div>

                <div className="space-y-6">
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                        <span>English Query String</span>
                        <span className="text-xs font-normal text-slate-400">Standard Operators</span>
                    </label>
                    <div className="flex space-x-2 mb-2 bg-slate-100 p-2 rounded">
                        <button onClick={() => insertText(" AND ", true)} className="px-3 py-1 bg-white border border-slate-200 text-xs rounded hover:bg-indigo-50 hover:text-indigo-600 font-mono font-bold shadow-sm transition-colors">AND</button>
                        <button onClick={() => insertText(" OR ", true)} className="px-3 py-1 bg-white border border-slate-200 text-xs rounded hover:bg-indigo-50 hover:text-indigo-600 font-mono font-bold shadow-sm transition-colors">OR</button>
                        <button onClick={() => insertText(" NOT ", true)} className="px-3 py-1 bg-white border border-slate-200 text-xs rounded hover:bg-indigo-50 hover:text-indigo-600 font-mono font-bold shadow-sm transition-colors">NOT</button>
                        <div className="w-px h-6 bg-slate-300 mx-2"></div>
                        <button onClick={() => insertText("()", true)} className="px-3 py-1 bg-white border border-slate-200 text-xs rounded hover:bg-indigo-50 hover:text-indigo-600 font-mono font-bold shadow-sm transition-colors">( )</button>
                        <button onClick={() => insertText('""', true)} className="px-3 py-1 bg-white border border-slate-200 text-xs rounded hover:bg-indigo-50 hover:text-indigo-600 font-mono font-bold shadow-sm transition-colors">" "</button>
                    </div>
                    <textarea 
                        className="w-full h-32 p-3 font-mono text-xs bg-slate-900 text-green-400 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed" 
                        value={englishQuery}
                        onChange={(e) => setEnglishQuery(e.target.value)}
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 text-right">Arabic Query String</label>
                    <div className="flex space-x-2 mb-2 bg-slate-100 p-2 rounded justify-end">
                        <button onClick={() => insertText('""', false)} className="px-3 py-1 bg-white border border-slate-200 text-xs rounded hover:bg-indigo-50 hover:text-indigo-600 font-mono font-bold shadow-sm transition-colors">" "</button>
                        <button onClick={() => insertText("()", false)} className="px-3 py-1 bg-white border border-slate-200 text-xs rounded hover:bg-indigo-50 hover:text-indigo-600 font-mono font-bold shadow-sm transition-colors">( )</button>
                        <div className="w-px h-6 bg-slate-300 mx-2"></div>
                        <button onClick={() => insertText(" NOT ", false)} className="px-3 py-1 bg-white border border-slate-200 text-xs rounded hover:bg-indigo-50 hover:text-indigo-600 font-mono font-bold shadow-sm transition-colors">NOT</button>
                        <button onClick={() => insertText(" OR ", false)} className="px-3 py-1 bg-white border border-slate-200 text-xs rounded hover:bg-indigo-50 hover:text-indigo-600 font-mono font-bold shadow-sm transition-colors">OR</button>
                        <button onClick={() => insertText(" AND ", false)} className="px-3 py-1 bg-white border border-slate-200 text-xs rounded hover:bg-indigo-50 hover:text-indigo-600 font-mono font-bold shadow-sm transition-colors">AND</button>
                    </div>
                    <textarea 
                        className="w-full h-32 p-3 font-mono text-xs bg-slate-900 text-green-400 rounded-lg border border-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed" 
                        dir="rtl" 
                        value={arabicQuery}
                        onChange={(e) => setArabicQuery(e.target.value)}
                    />
                    </div>
                </div>
             </div>
          </div>
          <div className="p-4 bg-white border-t border-slate-200 flex justify-end space-x-3">
             <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
             <button onClick={() => { alert('Logic Saved Successfully'); onClose(); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Apply Logic to Crawler</button>
          </div>
       </div>
    </div>
  )
}

// --- MAIN COMPONENT ---

export const CrawlerConfig = () => {
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
    
    // Google Search State
    const [googleQuery, setGoogleQuery] = useState('KSA hotel project 2025');
    const [googleDateRange, setGoogleDateRange] = useState('Past week');

    // Lifted State for Staged Items and Queries
    const [stagedItems, setStagedItems] = useState<PotentialProject[]>(MOCK_POTENTIAL_PROJECTS);
    const [englishQuery, setEnglishQuery] = useState(`("commercial kitchen" OR "kitchen fit-out" OR "central kitchen" OR "laundry equipment") AND (hotel OR hospital OR "central kitchen" OR restaurant OR franchise OR "entertainment city") AND (Riyadh OR Jeddah OR Mecca OR Medina OR Dammam OR Khobar OR Yanbu OR Jazan OR Tabuk OR Abha OR Najran OR Qassim OR "Hafr Al Batin" OR "Khamis Mushait" OR "Al-Ula" OR "Al-Jouf")`);
    const [arabicQuery, setArabicQuery] = useState(`("مطبخ مركزي" OR "معدات غسيل" OR "معدات مطبخ") AND (فندق OR مستشفى OR مطعم OR سلسلة مطاعم OR مشروع ترفيهي) AND (الرياض OR جدة OR مكة OR المدينة OR الدمام OR الخبر OR ينبع OR تبوك OR أبها OR نجران OR القصيم)`);
    
    // Saved Queries Mock
    const [savedQueries, setSavedQueries] = useState<SavedSearch[]>([
        { id: 'sq1', name: 'Hospitality Basic', filters: { search: '("hotel" OR "resort") AND "kitchen"', city: '', status: '', type: '', year: '' } }
    ]);

    const terminalEndRef = useRef<HTMLDivElement>(null);

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

    const saveQuery = (name: string) => {
        setSavedQueries(prev => [...prev, { id: `sq-${Date.now()}`, name, filters: { search: englishQuery, city: '', status: '', type: '', year: '' } }]);
    };

    const loadQuery = (query: string) => {
        setEnglishQuery(query);
    };

    const runGoogleSearch = () => {
       if (isCrawling) return;
       setIsCrawling(true);
       setLogs([]);
       setDiscoveryResults([]);
       setVisitedPages([]);

       const sequence: { msg: string; delay: number; action?: () => void }[] = [
          { msg: `INIT: Starting Automated Research Assistant...`, delay: 100 },
          { msg: `SEARCH: Performing Google query: "${googleQuery}"`, delay: 800 },
          { msg: `FILTER: Applying date filter: "${googleDateRange}"`, delay: 1200 },
          { msg: `FETCH: Retrieving top 10 results from Google Index...`, delay: 2000 },
          { msg: `EXTRACT: Analyzing content for Hospitality/Project data...`, delay: 3500 },
       ];

       // Simulate Finding a result
       sequence.push(
           { msg: "FOUND: 'New Jeddah Downtown Hotel Announced'...", delay: 4500 },
           { msg: "JSON: Structuring data to schema...", delay: 5000 },
           { msg: "COMPLETE: Added 1 new project to Staging Review.", delay: 5500 }
       );

       let currentTime = 0;
       sequence.forEach((item) => {
         currentTime = item.delay; 
         setTimeout(() => {
           addLog(item.msg);
           if (item.action) item.action();
         }, currentTime);
       });

       setTimeout(() => {
           setIsCrawling(false);
           
           // Mock Result from "Google"
           const newStagedItem: PotentialProject = {
             id: `google-${Date.now()}`,
             projectName: 'Jeddah Downtown Hotel',
             type: ProjectType.HOTEL,
             developer: 'PIF',
             city: City.JEDDAH,
             region: 'Makkah',
             sourceUrl: 'https://news.google.com/search?q=jeddah+hotel',
             sourceTitle: 'New Jeddah Downtown Hotel Announced',
             publishDate: new Date().toISOString(),
             summary: 'A new luxury hotel project announced in Jeddah Downtown featuring 300 keys and extensive F&B outlets.',
             status: ProjectStatus.TENDER, // inferred
             estimatedValue: 400000000,
             classification: 'New',
             isDuplicate: false
           };

           setStagedItems(prev => [newStagedItem, ...prev]);
           setDiscoveryResults([{
               url: 'https://news.google.com/search?q=jeddah+hotel',
               title: 'New Jeddah Downtown Hotel Announced',
               score: 92,
               status: 'NEW',
               dateDiscovered: new Date().toISOString(),
               aiExtractedData: { projectName: 'Jeddah Downtown Hotel', developer: 'PIF', status: 'Announced' }
           }]);
           
           setIsReviewOpen(true);

       }, 6000);
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

      // Generate Mock Results and Append to Staging
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

        // Generate a realistic past date for extraction simulation
        const simulatedPublishDate = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0];

        const sequence: { msg: string; delay: number; action?: () => void }[] = [
            { msg: `INIT: Manual Inspection Protocol initiated for target: ${manualUrl}`, delay: 100 },
            { msg: `CONNECT: Handshaking with ${manualUrl}...`, delay: 800, action: () => addVisitedPage(manualUrl, 200) },
            { msg: "FETCH: Downloading HTML content (245kb)...", delay: 1500 },
            { msg: "PARSE: Parsing DOM structure...", delay: 2000 },
            { msg: "ANALYZE: Checking for project keywords (Kitchen, Laundry, Tender)...", delay: 2800 },
            { msg: "AI AGENT: Initializing Content Extraction Model...", delay: 3200 },
            { msg: `AI EXTRACT: Found Publish Date on Page -> '${simulatedPublishDate}'`, delay: 3500 },
            { msg: "AI EXTRACT: Identified 'Project Name' -> 'Sunset Beach Resort Phase 2'", delay: 3800 },
            { msg: "AI EXTRACT: Identified 'Value' -> '350M SAR'", delay: 4000 },
            { msg: "AI EXTRACT: Identified 'Developer' -> 'Dur Hospitality'", delay: 4200 },
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
             const resultData = {
                projectName: 'Sunset Beach Resort Phase 2',
                estimatedValue: '350M SAR',
                developer: 'Dur Hospitality',
                status: 'Tender'
             };

             setDiscoveryResults([{
                 url: manualUrl,
                 title: 'Manual Inspection Result',
                 score: 88, 
                 status: 'REVIEW',
                 dateDiscovered: new Date().toISOString(),
                 aiExtractedData: resultData
             }]);

             // ADD TO STAGING REVIEW
             const newStagedItem: PotentialProject = {
                 id: `manual-${Date.now()}`,
                 projectName: resultData.projectName,
                 type: ProjectType.RESORT,
                 developer: resultData.developer,
                 city: City.JEDDAH, // Mock inference
                 region: 'Makkah',
                 sourceUrl: manualUrl,
                 sourceTitle: 'Manual Inspection Result: Sunset Beach',
                 publishDate: new Date(simulatedPublishDate).toISOString(), // Use extracted date
                 summary: `Manually inspected project from ${manualUrl}. AI identified tender phase for beach resort extension.`,
                 status: ProjectStatus.TENDER,
                 estimatedValue: 350000000,
                 classification: 'Review'
             };
             
             setStagedItems(prev => [newStagedItem, ...prev]);
             addLog("STAGING: Added manual result to Staging Review queue. Opening Review...");
             setIsReviewOpen(true); // Automatically open the review modal

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
                <div key={i} className={`${log.includes('NEW') || log.includes('TRUSTED') ? 'text-emerald-400 font-bold' : log.includes('BACKLOG') ? 'text-blue-400' : log.includes('REVIEW') ? 'text-amber-400' : log.includes('AI EXTRACT') ? 'text-cyan-400' : log.includes('SEARCH') || log.includes('FILTER') ? 'text-pink-400' : 'text-slate-300'}`}>
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

           {/* RIGHT: ACTIONS */}
           <div className="space-y-4 h-full flex flex-col">
              
              {/* GOOGLE SEARCH SIMULATION */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                 <h3 className="font-bold text-indigo-900 mb-3 flex items-center text-sm"><Globe2 size={16} className="mr-2"/> Automated Research Assistant</h3>
                 <div className="space-y-3">
                     <div>
                         <label className="block text-xs font-bold text-indigo-700 mb-1 uppercase">Search Keywords</label>
                         <input 
                           type="text" 
                           value={googleQuery}
                           onChange={(e) => setGoogleQuery(e.target.value)}
                           className="w-full border border-indigo-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                         />
                     </div>
                     <div className="flex space-x-2">
                         <div className="flex-1">
                             <label className="block text-xs font-bold text-indigo-700 mb-1 uppercase">Date Range</label>
                             <select 
                               value={googleDateRange} 
                               onChange={(e) => setGoogleDateRange(e.target.value)}
                               className="w-full border border-indigo-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                             >
                                 <option>Past 24 hours</option>
                                 <option>Past week</option>
                                 <option>Past month</option>
                                 <option>Past year</option>
                             </select>
                         </div>
                         <div className="flex items-end">
                             <button 
                               onClick={runGoogleSearch}
                               disabled={isCrawling}
                               className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors h-10"
                             >
                               Run Targeted Search
                             </button>
                         </div>
                     </div>
                 </div>
              </div>

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
                <div className="w-full mt-2 px-4 relative">
                   <button 
                     onClick={() => setIsReviewOpen(true)}
                     className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 flex items-center justify-center"
                   >
                     <ListPlus size={16} className="mr-2"/> Open Staging Review
                   </button>
                   {stagedItems.length > 0 && (
                       <span className="absolute top-0 right-4 transform -translate-y-1/2 translate-x-1/2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                           {stagedItems.length}
                       </span>
                   )}
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
        <AdvancedQueryBuilderModal 
            isOpen={isQueryBuilderOpen} 
            onClose={() => setIsQueryBuilderOpen(false)} 
            englishQuery={englishQuery} 
            setEnglishQuery={setEnglishQuery}
            arabicQuery={arabicQuery} 
            setArabicQuery={setArabicQuery}
            savedQueries={savedQueries}
            saveQuery={saveQuery}
            loadQuery={loadQuery}
        />
        <StagingReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} items={stagedItems} onItemsChange={setStagedItems} />
      </div>
    );
};
