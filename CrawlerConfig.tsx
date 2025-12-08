
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, ListPlus, Terminal, Bot, Activity, Mail, Save, RefreshCw, Play, Settings, Server, Key, Search, Globe
} from 'lucide-react';
import { useLanguage } from './context';
import { PotentialProject } from './types';
import { MOCK_POTENTIAL_PROJECTS } from './constants';
import { extractEntities, StagingReviewModal, AddSourceModal, AdvancedQueryBuilderModal } from './CrawlerShared';

const ReportingConfigTab = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-6 p-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center"><Mail size={20} className="mr-2"/> Automated Crawler Reports</h3>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between"><label className="font-medium text-slate-700">Enable Email Reports</label><input type="checkbox" className="toggle" /></div>
                <div><label className="block text-sm text-slate-600 mb-1">Recipients</label><input type="text" placeholder="admin@ksaintel.com" className="w-full p-2 border rounded" /></div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center"><span className="text-xs text-slate-400">Last sent: Never</span><button className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded hover:bg-slate-200" onClick={() => alert(`Report sent`)}>Send Test Report Now</button></div>
            </div>
        </div>
    );
};

export const CrawlerConfig = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'auto' | 'report'>('auto');
    const [logs, setLogs] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [googleApiKey, setGoogleApiKey] = useState('');
    const [searchEngineId, setSearchEngineId] = useState('');
    const [scanMode, setScanMode] = useState<{fresh: boolean, backlog: boolean}>({ fresh: true, backlog: true });
    const [stagedItems, setStagedItems] = useState<PotentialProject[]>(MOCK_POTENTIAL_PROJECTS);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
    const [isQueryBuilderOpen, setIsQueryBuilderOpen] = useState(false);
    const [englishQuery, setEnglishQuery] = useState(`("commercial kitchen") AND (hotel OR hospital)`);
    const [arabicQuery, setArabicQuery] = useState(`("مطبخ مركزي") AND (فندق OR مستشفى)`);
    const [sources, setSources] = useState(['sauditenders.sa', 'meed.com']);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const k = localStorage.getItem('googleApiKey');
        const c = localStorage.getItem('searchEngineId');
        if (k) setGoogleApiKey(k);
        if (c) setSearchEngineId(c);
    }, []);

    const saveApiKeys = () => {
        localStorage.setItem('googleApiKey', googleApiKey);
        localStorage.setItem('searchEngineId', searchEngineId);
        alert('API Keys Saved');
    };

    useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-GB')}] ${msg}`]);

    const runDiscoveryBot = async () => {
        if (isProcessing) return;
        setIsProcessing(true); setLogs([]); addLog("INIT: Starting Automated Discovery Bot...");
        const hasKeys = googleApiKey && searchEngineId;
        addLog(`MODE: ${hasKeys ? 'LIVE API (Google)' : 'SIMULATION MODE (Demo)'}`);
        const queries = [];
        if (scanMode.fresh) queries.push('Saudi hospitality project announced', 'New hotel launched KSA');
        if (scanMode.backlog) queries.push('Saudi hotel construction update');
        
        for (const q of queries) {
            addLog(`SEARCH: "${q}"...`);
            await new Promise(r => setTimeout(r, 1500));
            if (!hasKeys) {
                const mock = { id: `sim-${Date.now()}`, projectName: `New ${q.includes('hotel') ? 'Hotel' : 'Resort'} (Simulated)`, type: 'Hotel' as any, city: 'Riyadh' as any, region: 'Riyadh', developer: 'Simulated Dev Co', status: 'Tender' as any, estimatedValue: 100000000, sourceUrl: '#', sourceTitle: `Result for ${q}`, publishDate: new Date().toISOString(), summary: 'Simulated result.', classification: 'New' as const, isDuplicate: false };
                addLog(`FOUND: ${mock.projectName}`);
                setStagedItems(prev => [mock, ...prev]);
            }
        }
        setIsProcessing(false); setIsReviewOpen(true);
    };

    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center"><Zap className="mr-2 text-amber-500" /> Automated Bot Engine</h1>
            <div className="flex gap-2">
                <div className="flex items-center px-3 py-1.5 bg-slate-100 rounded text-xs"><span className={`w-2 h-2 rounded-full mr-2 ${googleApiKey ? 'bg-green-500' : 'bg-red-500'}`}></span>{googleApiKey ? 'API Connected' : 'Simulated Mode'}</div>
                <button onClick={() => setIsReviewOpen(true)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center hover:bg-slate-900"><ListPlus size={16} className="mr-2"/> Staged ({stagedItems.length})</button>
            </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex">
            <button onClick={() => setActiveTab('auto')} className={`flex-1 py-4 flex items-center justify-center font-bold text-sm ${activeTab === 'auto' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}><Bot size={18} className="mr-2"/> Auto-Discovery Bot</button>
            <button onClick={() => setActiveTab('report')} className={`flex-1 py-4 flex items-center justify-center font-bold text-sm ${activeTab === 'report' ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}><Activity size={18} className="mr-2"/> Reporting Config</button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {activeTab === 'auto' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-4">
                            <h3 className="font-bold text-slate-800">Discovery Settings</h3>
                            <div className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={scanMode.fresh} onChange={() => setScanMode(p => ({...p, fresh: !p.fresh}))} className="rounded text-blue-600" /><span className="text-sm font-medium">Fresh Scan (7 Days)</span></label>
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={scanMode.backlog} onChange={() => setScanMode(p => ({...p, backlog: !p.backlog}))} className="rounded text-blue-600" /><span className="text-sm font-medium">Backlog Scan (2 Years)</span></label>
                            </div>
                            <div className="flex gap-2"><input type="password" value={googleApiKey} onChange={e => setGoogleApiKey(e.target.value)} placeholder="Google API Key" className="flex-1 p-2 border rounded text-sm"/><input type="text" value={searchEngineId} onChange={e => setSearchEngineId(e.target.value)} placeholder="CX ID" className="flex-1 p-2 border rounded text-sm"/><button onClick={saveApiKeys} className="px-3 bg-slate-100 rounded border hover:bg-slate-200"><Save size={14}/></button></div>
                        </div>
                        <div className="flex flex-col justify-end"><button onClick={runDiscoveryBot} disabled={isProcessing} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 shadow-lg flex items-center justify-center transition-all">{isProcessing ? <RefreshCw size={24} className="animate-spin mr-2"/> : <Play size={24} className="mr-2"/>}{isProcessing ? 'Running...' : 'Start Discovery'}</button></div>
                    </div>
                </div>
            )}
            {activeTab === 'report' && <ReportingConfigTab />}
        </div>
        {activeTab === 'auto' && (
            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner mt-6">
                <div className="bg-slate-800 p-3 flex items-center space-x-2 border-b border-slate-700"><Terminal size={14} className="text-slate-400"/><span className="text-xs font-bold text-slate-300 uppercase">Engine Output</span></div>
                <div className="p-4 h-40 overflow-y-auto font-mono text-xs space-y-1 text-slate-300">
                    {logs.length === 0 && <div className="text-slate-600 italic">Ready...</div>}
                    {logs.map((log, i) => (<div key={i} className={log.includes('ERROR') ? 'text-red-400' : 'text-emerald-400'}>{log}</div>))}
                    <div ref={terminalEndRef}></div>
                </div>
            </div>
        )}
        <StagingReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} items={stagedItems} onItemsChange={setStagedItems} />
        <AddSourceModal isOpen={isAddSourceOpen} onClose={() => setIsAddSourceOpen(false)} onAdd={(url) => setSources(prev => [...prev, url])} />
        <AdvancedQueryBuilderModal isOpen={isQueryBuilderOpen} onClose={() => setIsQueryBuilderOpen(false)} englishQuery={englishQuery} setEnglishQuery={setEnglishQuery} arabicQuery={arabicQuery} setArabicQuery={setArabicQuery} />
      </div>
    );
};
