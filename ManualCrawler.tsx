
import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, RefreshCw, Globe, Upload, Clipboard, ListPlus, Terminal, FileText, Sparkles, FileSpreadsheet, Check
} from 'lucide-react';
import { PotentialProject } from './types';
import { MOCK_POTENTIAL_PROJECTS } from './constants';
import { extractEntities, hybridFetch, StagingReviewModal } from './CrawlerShared';

const ImportDataTab = () => {
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [mappings, setMappings] = useState<Record<string, string>>({});
    
    const dbFields = [
        { label: 'Project Name', value: 'name' }, { label: 'Developer', value: 'developer' }, { label: 'City', value: 'city' },
        { label: 'Status', value: 'status' }, { label: 'Value (SAR)', value: 'estimatedValueSAR' }, { label: 'Contractor', value: 'contractor' },
        { label: 'Completion Date', value: 'expectedCompletion' }
    ];

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const rows = text.split('\n').map(row => row.split(','));
            setCsvData(rows.slice(0, 5));
            const headers = rows[0];
            const newMap: Record<string, string> = {};
            headers.forEach((h, i) => {
                const head = h.toLowerCase().trim();
                if (head.includes('name') || head.includes('project')) newMap[i] = 'name';
                else if (head.includes('dev') || head.includes('client')) newMap[i] = 'developer';
                else if (head.includes('city')) newMap[i] = 'city';
                else if (head.includes('val') || head.includes('cost')) newMap[i] = 'estimatedValueSAR';
            });
            setMappings(newMap);
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-white border border-slate-300 rounded shadow-sm text-sm font-bold flex items-center justify-center w-48 mx-auto hover:bg-blue-50">
                        <FileSpreadsheet size={16} className="mr-2 text-green-600"/> Select CSV File
                    </span>
                    <input type="file" className="hidden" accept=".csv" onChange={handleFile} />
                </label>
                {csvFile && <p className="mt-2 text-sm text-slate-600 font-medium">{csvFile.name}</p>}
            </div>
            {csvData.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-sm">Column Mapping</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr>{csvData[0].map((header, i) => (
                                    <th key={i} className="p-3 border-b min-w-[150px]"><div className="mb-2 text-slate-500 text-xs uppercase font-bold">{header}</div><select className="w-full p-1 border rounded text-xs bg-slate-50" value={mappings[i] || ''} onChange={(e) => setMappings({...mappings, [i]: e.target.value})}><option value="">-- Ignore --</option>{dbFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select></th>
                                ))}</tr>
                            </thead>
                            <tbody>
                                {csvData.slice(1).map((row, rI) => (<tr key={rI} className="border-b last:border-0">{row.map((cell, cI) => (<td key={cI} className="p-3 text-slate-600 truncate max-w-[150px]">{cell}</td>))}</tr>))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-slate-50 text-right"><button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center ml-auto" onClick={() => alert('Import Simulation: Data mapped and staged.')}><Check size={16} className="mr-2"/> Run Import</button></div>
                </div>
            )}
        </div>
    );
};

export const ManualCrawler = () => {
    const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
    const [manualSubTab, setManualSubTab] = useState<'url' | 'file' | 'text'>('url');
    const [logs, setLogs] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [textInput, setTextInput] = useState('');
    const [stagedItems, setStagedItems] = useState<PotentialProject[]>(MOCK_POTENTIAL_PROJECTS);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-GB')}] ${msg}`]);

    const handleManualProcess = async (type: 'url' | 'text', content: string) => {
        setIsProcessing(true); setLogs([]); addLog(`INPUT: Processing ${type === 'url' ? content : 'raw text'}...`);
        let textToAnalyze = content; let url = '#'; let title = 'Manual Import';
        if (type === 'url') {
            url = content;
            const fetched = await hybridFetch(content, addLog);
            if (fetched) {
                const doc = new DOMParser().parseFromString(fetched, 'text/html');
                textToAnalyze = doc.body.textContent || "";
                title = doc.title || "Extracted Page";
                addLog(`PARSE: HTML parsed (${textToAnalyze.length} chars).`);
            } else { setIsProcessing(false); return; }
        }
        const extracted = extractEntities(textToAnalyze, title);
        addLog(`AI: Identified '${extracted.projectName}' in ${extracted.city}`);
        if(extracted.estimatedValue) addLog(`AI: Value: ${extracted.estimatedValue.toLocaleString()} SAR`);
        
        const newProject = {
            id: `manual-${Date.now()}`, projectName: extracted.projectName || "Unknown", type: extracted.type!, city: extracted.city!, region: 'KSA',
            developer: extracted.developer!, contractor: extracted.contractor, consultant: extracted.consultant, operator: extracted.operator,
            status: extracted.status!, estimatedValue: extracted.estimatedValue, expectedOpening: extracted.expectedOpening, kitchenNotes: extracted.kitchenNotes,
            sourceUrl: url, sourceTitle: title, publishDate: new Date().toISOString(), summary: extracted.summary!, classification: 'New' as const, isDuplicate: false, extractedPeople: extracted.extractedPeople
        };
        setStagedItems(prev => [newProject, ...prev]);
        addLog("SUCCESS: Staged for review.");
        setIsProcessing(false); setIsReviewOpen(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (file.name.match(/\.htm/)) {
                 const doc = new DOMParser().parseFromString(text, 'text/html');
                 handleManualProcess('text', doc.body.textContent || "");
            } else handleManualProcess('text', text);
        };
        reader.readAsText(file);
    };

    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center"><PenTool className="mr-2 text-purple-600" /> Manual-Hybrid Inspector</h1>
            <button onClick={() => setIsReviewOpen(true)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center hover:bg-slate-900 shadow-md">
                <ListPlus size={16} className="mr-2"/> Staged ({stagedItems.length})
            </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex">
            <button onClick={() => setActiveTab('manual')} className={`flex-1 py-4 flex items-center justify-center font-bold text-sm ${activeTab === 'manual' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' : 'text-slate-500 hover:bg-slate-50'}`}><PenTool size={18} className="mr-2"/> Manual Input / URL</button>
            <button onClick={() => setActiveTab('import')} className={`flex-1 py-4 flex items-center justify-center font-bold text-sm ${activeTab === 'import' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-slate-500 hover:bg-slate-50'}`}><FileSpreadsheet size={18} className="mr-2"/> Import CSV</button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {activeTab === 'manual' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="flex border-b border-slate-100 mb-4">
                        <button onClick={() => setManualSubTab('url')} className={`px-4 py-2 text-sm font-medium ${manualSubTab === 'url' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500'}`}>Fetch URL</button>
                        <button onClick={() => setManualSubTab('file')} className={`px-4 py-2 text-sm font-medium ${manualSubTab === 'file' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500'}`}>Upload HTML</button>
                        <button onClick={() => setManualSubTab('text')} className={`px-4 py-2 text-sm font-medium ${manualSubTab === 'text' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500'}`}>Paste Text</button>
                    </div>
                    {manualSubTab === 'url' && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://constructionweekonline.com/..." className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"/>
                                <button onClick={() => handleManualProcess('url', urlInput)} disabled={isProcessing || !urlInput} className="px-6 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center">{isProcessing ? <RefreshCw className="animate-spin mr-2"/> : <Globe size={16} className="mr-2"/>} Fetch & Parse</button>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center"><RefreshCw size={12} className="mr-1"/> Hybrid fetch (Direct &rarr; Proxy).</p>
                        </div>
                    )}
                    {manualSubTab === 'file' && (
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                            <label className="cursor-pointer"><span className="px-4 py-2 bg-white border border-slate-300 rounded shadow-sm text-sm font-bold flex items-center justify-center w-48 mx-auto hover:bg-purple-50"><FileText size={16} className="mr-2 text-purple-600"/> Select HTML File</span><input type="file" className="hidden" accept=".html,.htm,.txt" onChange={handleFileUpload} /></label>
                            <p className="text-xs text-slate-400 mt-3">Supported: HTML, HTM, TXT (Max 5MB)</p>
                        </div>
                    )}
                    {manualSubTab === 'text' && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Raw Article Content</label>
                            <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Paste article content..." className="w-full h-48 p-4 border border-slate-300 rounded-lg mb-4 font-mono text-sm focus:ring-2 focus:ring-purple-500 outline-none"/>
                            <div className="flex justify-end"><button onClick={() => handleManualProcess('text', textInput)} disabled={isProcessing || !textInput} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center"><Sparkles size={16} className="mr-2"/> Analyze Text</button></div>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'import' && <ImportDataTab />}
        </div>
        {activeTab === 'manual' && (
            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner mt-6">
                <div className="bg-slate-800 p-3 flex items-center space-x-2 border-b border-slate-700"><Terminal size={14} className="text-slate-400"/><span className="text-xs font-bold text-slate-300 uppercase">Extraction Engine Logs</span></div>
                <div className="p-4 h-40 overflow-y-auto font-mono text-xs space-y-1 text-slate-300">
                    {logs.length === 0 && <div className="text-slate-600 italic">Waiting for input...</div>}
                    {logs.map((log, i) => (<div key={i} className={log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') || log.includes('FOUND') ? 'text-emerald-400 font-bold' : log.includes('AI') ? 'text-cyan-400' : ''}>{log}</div>))}
                    <div ref={terminalEndRef}></div>
                </div>
            </div>
        )}
        <StagingReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} items={stagedItems} onItemsChange={setStagedItems} />
      </div>
    );
};
