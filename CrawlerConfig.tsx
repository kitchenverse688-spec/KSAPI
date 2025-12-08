import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Network, Zap, Search, Globe2, ListPlus, Terminal, Bookmark,
  Copy, Download, Check, X, Code, Activity, Sparkles, Plus, Globe, Settings, Server, Key, Save, Play
} from 'lucide-react';
import { useLanguage, useProjects } from './context';
import { Project, ProjectStatus, ProjectType, City, SavedSearch, ScrapedSourceResult, CrawledPageLog, PotentialProject } from './types';
import { MOCK_POTENTIAL_PROJECTS, DOWNLOAD_CSV } from './constants';

// --- SERVICE LAYER: PROCEDURAL GENERATOR (Fallback) ---
const generateProceduralResult = (query: string, mode: 'FRESH' | 'BACKLOG' = 'FRESH'): PotentialProject => {
  const q = query.toLowerCase();
  
  // 1. Detect City
  let city = City.RIYADH;
  let region = 'Central';
  const cities = Object.values(City);
  
  for (const c of cities) {
      if (q.includes(c.toLowerCase())) {
          city = c;
          if (c === City.JEDDAH || c === City.MAKKAH) region = 'Makkah';
          if (c === City.DAMMAM || c === City.KHOBAR) region = 'Eastern';
          if (c === City.ABHA) region = 'Asir';
          if (c === City.NEOM || c === City.RED_SEA) region = 'Tabuk';
          break;
      }
  }
  if (q.includes('mecca')) { city = City.MAKKAH; region = 'Makkah'; }
  if (q.includes('medina')) { city = City.MADINAH; region = 'Madinah'; }

  // 2. Detect Type
  let type = ProjectType.HOTEL;
  if (q.includes('resort')) type = ProjectType.RESORT;
  else if (q.includes('hospital') || q.includes('medical')) type = ProjectType.HOSPITAL;
  else if (q.includes('kitchen')) type = ProjectType.CENTRAL_KITCHEN;
  else if (q.includes('restaurant') || q.includes('dining')) type = ProjectType.RESTAURANT;
  else if (q.includes('entertainment') || q.includes('entertainment city')) type = ProjectType.ENTERTAINMENT;

  const prefixes = ['New', 'Grand', 'Royal', 'Future', 'Saudi', 'International', 'Luxury', 'Iconic'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const cityName = city.toString();
  
  const name = `${cityName} ${randomPrefix} ${type} ${mode === 'FRESH' ? 'Announcement' : 'Development'}`;
  const value = 150000000 + Math.floor(Math.random() * 500000000);

  // Date Logic based on Mode
  const today = new Date();
  let pubDate = new Date();
  if (mode === 'FRESH') {
      pubDate.setDate(today.getDate() - Math.floor(Math.random() * 6)); // Last 6 days
  } else {
      pubDate.setMonth(today.getMonth() - (2 + Math.floor(Math.random() * 18))); // 2-20 months ago
  }

  return {
    id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    projectName: name,
    type: type,
    developer: 'Private Developer (Simulated)',
    city: city,
    region: region,
    sourceUrl: `https://google.com/search?q=${encodeURIComponent(query)}`,
    sourceTitle: `[${mode}] ${name} - Press Release`,
    publishDate: pubDate.toISOString(),
    summary: `This is a simulated ${mode.toLowerCase()} finding. A major ${type} project, "${name}", was identified matching your query parameters.`,
    status: mode === 'FRESH' ? ProjectStatus.TENDER : ProjectStatus.ONGOING,
    estimatedValue: value,
    classification: mode === 'FRESH' ? 'New' : 'Backlog',
    isDuplicate: false
  };
};

// --- SUB-COMPONENTS ---

const StagingReviewModal = ({ isOpen, onClose, items, onItemsChange }: { isOpen: boolean, onClose: () => void, items: PotentialProject[], onItemsChange: (items: PotentialProject[]) => void }) => {
  const { projects, addProject, updateProject } = useProjects();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Deduplication Logic
  useEffect(() => {
    if (items.length > 0) {
      const processed = items.map(staged => {
        // Fuzzy match logic
        const existing = projects.find(p => 
          p.name.toLowerCase() === staged.projectName.toLowerCase() || 
          (p.city === staged.city && p.developer.toLowerCase() === staged.developer.toLowerCase())
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
        // MERGE UPDATE
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
                field: 'Crawler Update',
                oldValue: 'Manual',
                newValue: 'Auto-Merged',
                user: 'System Bot'
              }
            ]
          };
          updateProject(updated);
        }
      } else {
        // CREATE NEW
        const newProject: Project = {
          id: `crawled-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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
                        <div className="text-[10px] text-slate-400 mt-1 truncate w-48">{project.sourceTitle}</div>
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
                         <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-xs font-medium underline">Link</a>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-slate-500 italic">No projects found. Try running a new search.</td></tr>
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
             <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Close</button>
             <button 
               onClick={handleImport}
               disabled={selectedIds.size === 0}
               className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center"
             >
               <Check size={16} className="mr-2"/> Import Selected
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
       <div className="bg-white p-6 rounded-xl shadow-xl w-96">
          <h3 className="font-bold text-lg mb-4">Add Seed Source</h3>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full border p-2 rounded mb-4"/>
          <div className="flex justify-end gap-2">
             <button onClick={onClose} className="px-3 py-2 text-sm bg-gray-100 rounded">Cancel</button>
             <button onClick={() => { onAdd(url); onClose(); }} className="px-3 py-2 text-sm bg-blue-600 text-white rounded">Add</button>
          </div>
       </div>
    </div>
  );
};

const AdvancedQueryBuilderModal = ({ isOpen, onClose, englishQuery, setEnglishQuery, arabicQuery, setArabicQuery }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
       <div className="bg-white w-full max-w-4xl p-6 rounded-xl">
          <h3 className="font-bold mb-4">Query Builder</h3>
          <textarea value={englishQuery} onChange={e => setEnglishQuery(e.target.value)} className="w-full h-32 border p-2 mb-4 font-mono text-sm" />
          <textarea value={arabicQuery} onChange={e => setArabicQuery(e.target.value)} className="w-full h-32 border p-2 mb-4 font-mono text-sm text-right" dir="rtl" />
          <div className="flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Save & Close</button></div>
       </div>
    </div>
  );
};


// --- MAIN COMPONENT ---

export const CrawlerConfig = () => {
    const { t } = useLanguage();
    const [isCrawling, setIsCrawling] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [sources, setSources] = useState(['sauditenders.sa', 'meed.com', 'constructionweekonline.com']);
    const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
    const [isQueryBuilderOpen, setIsQueryBuilderOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [discoveryResults, setDiscoveryResults] = useState<ScrapedSourceResult[]>([]);
    const [manualUrl, setManualUrl] = useState('');
    const [visitedPages, setVisitedPages] = useState<CrawledPageLog[]>([]);
    
    // API Configuration
    const [showSettings, setShowSettings] = useState(false);
    const [googleApiKey, setGoogleApiKey] = useState('');
    const [searchEngineId, setSearchEngineId] = useState('');

    // Search State
    const [googleQuery, setGoogleQuery] = useState('KSA hotel project 2025');
    const [googleDateRange, setGoogleDateRange] = useState('m1'); // m1 = month, w1 = week

    // Data
    const [stagedItems, setStagedItems] = useState<PotentialProject[]>(MOCK_POTENTIAL_PROJECTS);
    const [englishQuery, setEnglishQuery] = useState(`("commercial kitchen") AND (hotel OR hospital) AND (Riyadh OR Jeddah)`);
    const [arabicQuery, setArabicQuery] = useState(`("مطبخ مركزي") AND (فندق OR مستشفى) AND (الرياض OR جدة)`);
    const [scanMode, setScanMode] = useState<{fresh: boolean, backlog: boolean}>({ fresh: true, backlog: true });
    
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Persistence Effect
    useEffect(() => {
        const storedKey = localStorage.getItem('googleApiKey');
        const storedCx = localStorage.getItem('searchEngineId');
        if (storedKey) setGoogleApiKey(storedKey);
        if (storedCx) setSearchEngineId(storedCx);
        else setSearchEngineId('35c1af8715bc54f45'); // Default CX from user request
    }, []);

    const saveSettings = () => {
        localStorage.setItem('googleApiKey', googleApiKey);
        localStorage.setItem('searchEngineId', searchEngineId);
        setShowSettings(false);
        alert('API Settings Saved. You can now run live searches.');
    };

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

    // --- REAL ACTION HANDLERS ---

    const executeLiveSearch = async (query: string, dateRestrict: string, mode: 'FRESH' | 'BACKLOG') => {
       const hasCredentials = googleApiKey && searchEngineId;
       if (!hasCredentials) {
           addLog(`SIMULATION: Searching for "${query}" (${mode})...`);
           await new Promise(r => setTimeout(r, 1500)); // Sim delay
           const res = generateProceduralResult(query, mode);
           addLog(`FOUND: ${res.projectName}`);
           return [res];
       }

       try {
           const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&dateRestrict=${dateRestrict}`;
           addLog(`API: GET ${url.substring(0, 40)}...`);
           const response = await fetch(url);
           const data = await response.json();

           if (data.error) throw new Error(data.error.message);
           if (!data.items) return [];

           return data.items.map((item: any, idx: number) => {
               // Extract Logic
               const text = (item.title + ' ' + item.snippet).toLowerCase();
               let type = ProjectType.HOTEL;
               if (text.includes('resort')) type = ProjectType.RESORT;
               if (text.includes('hospital')) type = ProjectType.HOSPITAL;
               
               let city = City.RIYADH;
               Object.values(City).forEach(c => {
                   if (text.includes(c.toLowerCase())) city = c;
               });

               // Classification Logic
               let classification: 'New' | 'Backlog' | 'Review' = 'Review';
               // Attempt to parse date from snippet (often contains "2 days ago", "Oct 12, 2023")
               // Since exact date parsing from snippets is hard without NLP, we use the mode context
               classification = mode === 'FRESH' ? 'New' : 'Backlog';

               return {
                   id: `live-${mode}-${Date.now()}-${idx}`,
                   projectName: item.title,
                   type,
                   city,
                   developer: 'Unknown',
                   region: 'KSA',
                   sourceUrl: item.link,
                   sourceTitle: item.title,
                   publishDate: new Date().toISOString(),
                   summary: item.snippet,
                   status: ProjectStatus.TENDER,
                   estimatedValue: 0,
                   classification,
                   isDuplicate: false
               } as PotentialProject;
           });

       } catch (e: any) {
           addLog(`ERROR: ${e.message}`);
           return [];
       }
    };

    const runHybridCrawl = async () => {
      if (isCrawling) return;
      setIsCrawling(true);
      setLogs([]);
      setDiscoveryResults([]);
      setVisitedPages([]);

      const hasCredentials = googleApiKey && searchEngineId;
      addLog(`INIT: Starting Hybrid Discovery Mode (${hasCredentials ? 'LIVE' : 'SIMULATION'})...`);
      addLog("SCOPE: Hospitality, High-Trust Domains, KSA Regions.");

      let allResults: PotentialProject[] = [];

      // 1. FRESH SCAN (Last 7 Days)
      if (scanMode.fresh) {
          addLog("MODE: FRESH SCAN (Last 7 Days)");
          const queries = [
              'Saudi hospitality project announced',
              'New hotel launched KSA',
              'Tourism project tender Saudi'
          ];
          
          for (const q of queries) {
              addLog(`QUERY: "${q}"`);
              const results = await executeLiveSearch(q, 'w1', 'FRESH');
              allResults = [...allResults, ...results];
              await new Promise(r => setTimeout(r, 1000)); // Rate limit
          }
      }

      // 2. BACKLOG SCAN (Last 2 Years)
      if (scanMode.backlog) {
          addLog("MODE: BACKLOG SCAN (Last 2 Years)");
          const queries = [
              'Saudi hotel project construction update',
              'Resort contract awarded KSA',
              'Hospitality development on hold Saudi'
          ];

          for (const q of queries) {
              addLog(`QUERY: "${q}"`);
              const results = await executeLiveSearch(q, 'm24', 'BACKLOG'); // m24 = 24 months
              allResults = [...allResults, ...results];
              await new Promise(r => setTimeout(r, 1000));
          }
      }

      addLog(`COMPLETE: Found ${allResults.length} total projects.`);
      setStagedItems(prev => [...allResults, ...prev]);
      
      if (allResults.length > 0) {
          setDiscoveryResults(allResults.map(r => ({
              url: r.sourceUrl,
              title: r.sourceTitle,
              score: 90,
              status: r.classification === 'New' ? 'NEW' : 'BACKLOG',
              dateDiscovered: r.publishDate
          })));
          setIsReviewOpen(true);
      } else {
          addLog("RESULT: No new projects found matching criteria.");
      }

      setIsCrawling(false);
    };

    const runGoogleSearch = async () => {
       if (isCrawling) return;
       setIsCrawling(true);
       setLogs([]);
       setDiscoveryResults([]);
       setVisitedPages([]);

       addLog(`INIT: Starting Single Search...`);
       const results = await executeLiveSearch(googleQuery, googleDateRange, 'FRESH');
       
       if (results.length > 0) {
           addLog(`SUCCESS: Found ${results.length} results.`);
           setStagedItems(prev => [...results, ...prev]);
           setDiscoveryResults(results.map(r => ({
               url: r.sourceUrl,
               title: r.sourceTitle,
               score: 95,
               status: 'NEW',
               dateDiscovered: r.publishDate
           })));
           setIsReviewOpen(true);
       } else {
           addLog("RESULT: No items found.");
       }
       
       setIsCrawling(false);
    };

    const runManualCrawl = async () => {
        if (!manualUrl || isCrawling) return;
        setIsCrawling(true);
        setLogs([]);
        addLog(`INIT: Live Inspection of ${manualUrl}...`);
        
        try {
            // LIVE SCRAPING VIA PROXY
            addLog("PROXY: Routing request via CORS Proxy...");
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(manualUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error("Proxy response failed");
            
            const data = await response.json();
            const htmlContent = data.contents;
            
            if (!htmlContent) throw new Error("No content received");

            addLog(`DOWNLOAD: Received ${htmlContent.length} bytes of HTML.`);
            
            // Client-side DOM Parsing
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, "text/html");
            const title = doc.title || "No Title Found";
            const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || "";
            
            addLog(`PARSE: Title: "${title.substring(0, 40)}..."`);
            
            const projectData: PotentialProject = {
                 id: `live-scan-${Date.now()}`,
                 projectName: title.replace(/\|.*/, '').trim(), 
                 type: ProjectType.HOTEL,
                 developer: 'Detected from Content', 
                 city: City.RIYADH, 
                 region: 'KSA',
                 sourceUrl: manualUrl,
                 sourceTitle: title,
                 publishDate: new Date().toISOString(),
                 summary: desc || "Content extracted via live proxy.",
                 status: ProjectStatus.TENDER,
                 estimatedValue: 0,
                 classification: 'Review',
                 isDuplicate: false
            };
            
            setStagedItems(prev => [projectData, ...prev]);
            addLog("SUCCESS: Content extracted and staged.");
            setIsReviewOpen(true);

        } catch (e: any) {
            addLog(`ERROR: Scraping failed. ${e.message}`);
            addLog("NOTE: Target site may block proxies.");
        } finally {
            setIsCrawling(false);
        }
    };

    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">{t('crawler')} Configuration</h1>
            <div className="flex items-center space-x-2">
                <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg border ${showSettings ? 'bg-slate-200 border-slate-300' : 'bg-white border-slate-200'} text-slate-600 hover:bg-slate-100`}>
                    <Settings size={18} />
                </button>
                <div className={`flex items-center px-3 py-1.5 rounded-lg border text-sm font-bold ${googleApiKey ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    {googleApiKey ? <Network size={14} className="mr-2"/> : <Zap size={14} className="mr-2"/>}
                    {googleApiKey ? 'LIVE API READY' : 'SIMULATION MODE'}
                </div>
            </div>
        </div>

        {/* API SETTINGS PANEL */}
        {showSettings && (
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-6 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-800 flex items-center"><Server size={16} className="mr-2"/> API Connection Settings</h3>
                    <button onClick={saveSettings} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded flex items-center"><Save size={12} className="mr-1"/> Save Keys</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 text-xs text-slate-500 mb-2">
                        Enter your <strong>Google Custom Search JSON API</strong> credentials to enable real internet searching. Keys are saved locally.
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center"><Key size={12} className="mr-1"/> Google API Key</label>
                        <input type="password" value={googleApiKey} onChange={e => setGoogleApiKey(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm" placeholder="AIzaSy..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center"><Search size={12} className="mr-1"/> Search Engine ID (CX)</label>
                        <input type="text" value={searchEngineId} onChange={e => setSearchEngineId(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm" placeholder="0123456789..." />
                    </div>
                </div>
            </div>
        )}
        
        {/* TERMINAL UI */}
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col h-64 relative">
           <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
             <div className="flex items-center space-x-2">
               <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
               <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
               <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
               <span className="ml-2 text-slate-400 text-xs font-mono">ksa-crawler-v2 {googleApiKey ? '--live' : '--mock'}</span>
             </div>
             <span className={`w-2 h-2 rounded-full ${isCrawling ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
           </div>
           <div className="p-4 font-mono text-xs flex-1 overflow-y-auto space-y-1.5 text-slate-300">
              {logs.length === 0 && <div className="text-slate-500 italic">System ready. Waiting for input...</div>}
              {logs.map((log, i) => (
                <div key={i} className={`${log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') || log.includes('LIVE') ? 'text-emerald-400' : 'text-slate-300'}`}>{log}</div>
              ))}
              <div ref={terminalEndRef}></div>
           </div>
        </div>

        {/* MAIN CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4 h-full flex flex-col">
              
              {/* GOOGLE SEARCH */}
              <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
                 <h3 className="font-bold text-indigo-900 mb-3 flex items-center text-sm"><Globe2 size={16} className="mr-2"/> Research Assistant</h3>
                 <div className="space-y-3">
                     <input 
                       type="text" 
                       value={googleQuery}
                       onChange={(e) => setGoogleQuery(e.target.value)}
                       className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="e.g. 'Hospital tender in Riyadh'"
                     />
                     <div className="flex gap-2">
                         <select 
                           value={googleDateRange} 
                           onChange={(e) => setGoogleDateRange(e.target.value)}
                           className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                         >
                             <option value="d1">Past 24 hours</option>
                             <option value="w1">Past week</option>
                             <option value="m1">Past month</option>
                             <option value="y1">Past year</option>
                         </select>
                         <button 
                           onClick={runGoogleSearch}
                           disabled={isCrawling}
                           className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                         >
                           Search
                         </button>
                     </div>
                 </div>
              </div>

              {/* HYBRID CRAWL */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={80}/></div>
                
                <h3 className="font-bold text-slate-800 text-lg mb-2">Hybrid Project Discovery</h3>
                
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
                         <span className="text-xs text-slate-500">Last 2 years</span>
                      </div>
                   </label>
                </div>

                <div className="flex space-x-2 w-full">
                    <button 
                        onClick={runHybridCrawl} 
                        disabled={isCrawling || (!scanMode.fresh && !scanMode.backlog)}
                        className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center transition-all"
                    >
                        {isCrawling ? 'Running Discovery...' : 'Run Hospitality Discovery'}
                    </button>
                </div>
                
                <div className="w-full mt-2 px-4 relative">
                   <button 
                     onClick={() => setIsReviewOpen(true)}
                     className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 flex items-center justify-center"
                   >
                     <ListPlus size={16} className="mr-2"/> Open Staging Review
                     {stagedItems.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{stagedItems.length}</span>}
                   </button>
                </div>
              </div>
           </div>

           <div className="space-y-4 h-full flex flex-col">
              {/* MANUAL INSPECT */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center text-sm"><Search size={16} className="mr-2"/> URL Inspector (Live Scrape)</h3>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                    />
                    <button 
                        onClick={runManualCrawl}
                        disabled={isCrawling || !manualUrl}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 disabled:opacity-50"
                    >
                        Inspect
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 flex items-center"><Sparkles size={10} className="mr-1"/> Live DOM extraction via Proxy</p>
              </div>

              {/* SOURCES */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-slate-800 text-sm">Seed Sources</h3>
                     <button onClick={() => setIsAddSourceOpen(true)} className="text-blue-600 text-xs font-bold hover:underline">+ Add</button>
                  </div>
                  <ul className="flex-1 overflow-y-auto space-y-2 max-h-40">
                     {sources.map(s => (
                         <li key={s} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100">
                             <span className="truncate w-3/4">{s}</span>
                             <span className="text-green-600 font-bold">Active</span>
                         </li>
                     ))}
                  </ul>
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
        />
        <StagingReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} items={stagedItems} onItemsChange={setStagedItems} />
      </div>
    );
};