
import React, { useState, useEffect } from 'react';
import { 
  Database, Download, Check, X, Terminal, Bookmark
} from 'lucide-react';
import { useProjects } from './context';
import { Project, ProjectStatus, ProjectType, City, PotentialProject, ExtractedPerson, SavedSearch } from './types';
import { DOWNLOAD_CSV } from './constants';

// --- SHARED EXTRACTION ENGINE ---
export const extractEntities = (text: string, titleHint?: string): Partial<PotentialProject> => {
    const cleanText = text.replace(/\s+/g, ' ');
    const lowerText = cleanText.toLowerCase();
    const lowerTitle = (titleHint || '').toLowerCase();
    const combinedText = lowerTitle + ' ' + lowerText.substring(0, 3000); 

    // 1. Detect City (KSA Specific)
    let city = City.RIYADH; // Default
    let region = 'Central';
    
    const arCityKeywords: Record<string, City> = {
        'الرياض': City.RIYADH, 'جدة': City.JEDDAH, 'مكة': City.MAKKAH, 'المدينة': City.MADINAH,
        'الدمام': City.DAMMAM, 'الخبر': City.KHOBAR, 'نيوم': City.NEOM, 'تبوك': City.NEOM,
        'البحر الأحمر': City.RED_SEA, 'العلا': City.AL_ULA, 'أبها': City.ABHA
    };
    
    const enCityKeywords: Record<string, City> = {
        'riyadh': City.RIYADH, 'jeddah': City.JEDDAH, 'makkah': City.MAKKAH, 'mecca': City.MAKKAH,
        'madinah': City.MADINAH, 'medina': City.MADINAH, 'dammam': City.DAMMAM, 'khobar': City.KHOBAR,
        'tabuk': City.NEOM, 'neom': City.NEOM, 'trojena': City.NEOM, 'oxagon': City.NEOM, 'the line': City.NEOM,
        'red sea': City.RED_SEA, 'amaala': City.RED_SEA, 'alula': City.AL_ULA, 'al-ula': City.AL_ULA,
        'abha': City.ABHA, 'khamis': City.ABHA
    };

    // Priority check for Giga Projects
    if (combinedText.match(/neom|نيوم|the line|trojena/)) { city = City.NEOM; region = 'Tabuk'; }
    else if (combinedText.match(/red sea|البحر الأحمر|amaala/)) { city = City.RED_SEA; region = 'Tabuk'; }
    else if (combinedText.match(/alula|العلا/)) { city = City.AL_ULA; region = 'Madinah'; }
    else {
        const allCities = { ...enCityKeywords, ...arCityKeywords };
        for (const [key, val] of Object.entries(allCities)) {
            if (combinedText.includes(key)) { city = val; break; }
        }
    }

    // 2. Detect Type
    let type = ProjectType.HOTEL;
    if (combinedText.match(/hospital|medical|clinic|مستشفى|طبي/)) type = ProjectType.HOSPITAL;
    else if (combinedText.match(/resort|retreat|island|منتجع/)) type = ProjectType.RESORT;
    else if (combinedText.match(/kitchen|catering|food|مطبخ|تموين/)) type = ProjectType.CENTRAL_KITCHEN;
    else if (combinedText.match(/restaurant|dining|cafe|مطعم|مقهى/)) type = ProjectType.RESTAURANT;
    else if (combinedText.match(/entertainment|cinema|theme park|ترفيه|سينما/)) type = ProjectType.ENTERTAINMENT;

    // 3. Extract Value (Money)
    let value = 0;
    const moneyRegex = /(?:SAR|SR|\$|USD|ريال)\s?(\d+(?:,\d{3})*(?:\.\d+)?)\s?(?:million|billion|M|B|m|bn|مليون|مليار)/i;
    const moneyMatch = cleanText.match(moneyRegex);
    if (moneyMatch) {
        const amount = parseFloat(moneyMatch[1].replace(/,/g, ''));
        const unit = moneyMatch[0].toLowerCase();
        let multiplier = 1;
        if (unit.match(/billion|b|bn|مليار/)) multiplier = 1000000000;
        else if (unit.match(/million|m|مليون/)) multiplier = 1000000;
        value = amount * multiplier;
        if (unit.includes('$') || unit.includes('usd')) value = value * 3.75;
    }

    // 4. Extract Roles
    const extractRole = (keywords: string[]) => {
        const pattern = new RegExp(`(?:${keywords.join('|')})[:\\s]+((?:[A-Z][a-zA-Z0-9&]+\\s?){1,5})`, 'i');
        const match = cleanText.match(pattern);
        if (match && !match[1].toLowerCase().includes('contract')) return match[1].trim();
        return undefined;
    };

    const developer = extractRole(['developer', 'client', 'owner', 'developed by', 'المطور']) || 'Unknown Developer';
    const contractor = extractRole(['contractor', 'awarded to', 'construction by', 'المقاول']);
    const consultant = extractRole(['consultant', 'architect', 'designed by', 'الاستشاري']);
    const operator = extractRole(['operated by', 'managed by', 'brand', 'hotel group', 'المشغل']);

    // 5. Extract Date
    let expectedOpening = '';
    const dateMatch = cleanText.match(/(?:opening|completion|target|launch)\s?(?:in|date|by)?\s?((?:Q[1-4]\s?)?202[4-9])/i);
    if (dateMatch) expectedOpening = dateMatch[1];

    // 6. Detect Status
    let status = ProjectStatus.TENDER;
    if (combinedText.match(/awarded|signed|construction start|under construction|ترسية|إنشاء/)) status = ProjectStatus.ONGOING;
    else if (combinedText.match(/completed|opened|operational|انتهى|افتتاح/)) status = ProjectStatus.COMPLETED;
    else if (combinedText.match(/tender|bidding|rfp|مناقصة/)) status = ProjectStatus.TENDER;

    // 7. Kitchen Notes
    const klKeywords = ['kitchen', 'laundry', 'catering', 'food service', 'equipment', 'cold room'];
    const foundKL = klKeywords.filter(k => combinedText.includes(k));
    const kitchenNotes = foundKL.length > 0 ? `Detected keywords: ${foundKL.join(', ')}` : '';

    // 8. Name Extraction
    let name = titleHint || "New KSA Project";
    if (!titleHint) {
        const titleMatch = cleanText.substring(0, 150).match(/([A-Z][\w\s]+(?:Hotel|Resort|Hospital|City|Tower|Center|Complex|Project))/);
        if (titleMatch) name = titleMatch[1];
    }

    return { projectName: name, type, city, region, estimatedValue: value, developer, contractor, consultant, operator, status, expectedOpening, kitchenNotes, summary: cleanText.substring(0, 300).trim() + "..." };
};

// --- HYBRID FETCH ENGINE ---
export const hybridFetch = async (url: string, logFn: (msg: string) => void): Promise<string | null> => {
    try {
        logFn(`FETCH: Trying Proxy 1 (AllOrigins) for ${url.substring(0, 30)}...`);
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
            const data = await res.json();
            if (data.contents) return data.contents;
        }
    } catch (e) { /* Ignore */ }

    try {
        logFn(`FETCH: Trying Proxy 2 (CorsProxy) for ${url.substring(0, 30)}...`);
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) return await res.text();
    } catch (e) { /* Ignore */ }

    logFn(`ERROR: Fetch failed for ${url}. Site might be blocking proxies.`);
    return null;
};

// --- MODALS ---

export const StagingReviewModal = ({ isOpen, onClose, items, onItemsChange }: { isOpen: boolean, onClose: () => void, items: PotentialProject[], onItemsChange: (items: PotentialProject[]) => void }) => {
  const { projects, addProject, updateProject } = useProjects();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length > 0) {
      const processed = items.map(staged => {
        const existing = projects.find(p => 
          p.name.toLowerCase() === staged.projectName.toLowerCase() || 
          (p.city === staged.city && p.developer.toLowerCase() === staged.developer.toLowerCase())
        );
        if (!!existing !== staged.isDuplicate) return { ...staged, isDuplicate: !!existing, existingProjectId: existing?.id };
        return staged;
      });
      if (processed.some((p, i) => p.isDuplicate !== items[i].isDuplicate)) onItemsChange(processed);
    }
  }, [projects, items, onItemsChange]);

  if (!isOpen) return null;

  const handleImport = () => {
    const toImport = items.filter(p => selectedIds.has(p.id));
    toImport.forEach(staged => {
      if (staged.isDuplicate && staged.existingProjectId) {
        const existing = projects.find(p => p.id === staged.existingProjectId);
        if (existing) {
          updateProject({
            ...existing, status: staged.status, contractor: staged.contractor || existing.contractor,
            consultant: staged.consultant || existing.consultant, lastUpdated: new Date().toISOString(),
            news: [...existing.news, { id: `n-${Date.now()}`, title: staged.sourceTitle, source: 'Crawler', date: staged.publishDate, snippet: staged.summary, url: staged.sourceUrl, confidenceScore: 1.0 }],
            history: [...(existing.history || []), { date: new Date().toISOString(), field: 'Import', oldValue: 'Previous', newValue: 'Merged', user: 'Crawler' }]
          });
        }
      } else {
        addProject({
          id: `imp-${Date.now()}-${Math.floor(Math.random()*1000)}`, name: staged.projectName, type: staged.type,
          city: staged.city, region: staged.region, developer: staged.developer, contractor: staged.contractor,
          consultant: staged.consultant, status: staged.status, estimatedValueSAR: staged.estimatedValue || 0,
          expectedCompletion: staged.expectedOpening || 'TBD', confidenceScore: 0.9, tags: [staged.classification, 'Imported'],
          lastUpdated: new Date().toISOString(),
          news: [{ id: `n-${Date.now()}`, title: staged.sourceTitle, source: 'Crawler', date: staged.publishDate, snippet: staged.summary, url: staged.sourceUrl, confidenceScore: 1.0 }],
          description: staged.summary, history: [], notes: staged.kitchenNotes,
          contacts: staged.extractedPeople?.map(p => ({ name: p.name, role: p.role }))
        });
      }
    });
    onItemsChange(items.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    if (items.filter(p => !selectedIds.has(p.id)).length === 0) onClose();
  };

  const toggleAll = () => setSelectedIds(selectedIds.size === items.length ? new Set() : new Set(items.map(p => p.id)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-7xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="bg-emerald-500/20 p-2 rounded"><Database size={20} className="text-emerald-400"/></div>
             <div><h3 className="font-bold text-lg">Staging & Review</h3><p className="text-xs text-slate-400">Review data before saving</p></div>
          </div>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
           <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                 <div className="flex space-x-2">
                   <button onClick={toggleAll} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50">{selectedIds.size === items.length ? 'Deselect All' : 'Select All'}</button>
                 </div>
                 <button onClick={() => DOWNLOAD_CSV(items, 'Staged_Projects')} className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded hover:bg-blue-100"><Download size={14} className="mr-1"/> Export</button>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr><th className="px-4 py-3 w-10"></th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Roles</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Details</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map(p => (
                    <tr key={p.id} className={`hover:bg-slate-50 ${p.isDuplicate ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => { const s = new Set(selectedIds); if(s.has(p.id)) s.delete(p.id); else s.add(p.id); setSelectedIds(s); }} className="rounded text-green-600"/></td>
                      <td className="px-4 py-3"><div className="font-bold text-slate-800 line-clamp-2">{p.projectName}</div>{p.isDuplicate && <span className="text-[10px] bg-red-100 text-red-800 px-1.5 rounded font-bold border border-red-200">DUPLICATE</span>}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.type}</td>
                      <td className="px-4 py-3">{p.city}</td>
                      <td className="px-4 py-3 font-mono text-xs">{(p.estimatedValue || 0) > 0 ? (p.estimatedValue! / 1000000).toFixed(1) + 'M' : '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500"><div>Dev: {p.developer}</div>{p.operator && <div className="text-blue-600">Op: {p.operator}</div>}</td>
                      <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{p.status}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-400 w-32">{p.expectedOpening && <div>Open: {p.expectedOpening}</div>}{p.kitchenNotes && <div className="text-[10px] text-orange-500 mt-1">Has Notes</div>}</td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-500">No data staged.</td></tr>}
                </tbody>
              </table>
           </div>
        </div>
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
           <div className="text-sm text-slate-500">{selectedIds.size} items selected</div>
           <div className="flex space-x-3"><button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">Close</button><button onClick={handleImport} disabled={selectedIds.size === 0} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center disabled:opacity-50"><Check size={16} className="mr-2"/> Import</button></div>
        </div>
      </div>
    </div>
  );
};

export const AddSourceModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (url: string) => void }) => {
  const [url, setUrl] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
       <div className="bg-white p-6 rounded-xl shadow-xl w-96">
          <h3 className="font-bold text-lg mb-4">Add Seed Source</h3>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full border p-2 rounded mb-4"/>
          <div className="flex justify-end gap-2"><button onClick={onClose} className="px-3 py-2 text-sm bg-gray-100 rounded">Cancel</button><button onClick={() => { onAdd(url); onClose(); }} className="px-3 py-2 text-sm bg-blue-600 text-white rounded">Add</button></div>
       </div>
    </div>
  );
};

export const AdvancedQueryBuilderModal = ({ isOpen, onClose, englishQuery, setEnglishQuery, arabicQuery, setArabicQuery }: any) => {
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
