
import React, { useEffect, useRef, useState } from 'react';
import { 
  Building2, Zap, Clock, Activity, Download, Map as MapIcon, Layers 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useProjects, useLanguage } from './context';
import { ProjectStatus } from './types';
import { FORMAT_CURRENCY, DOWNLOAD_DASHBOARD_REPORT } from './constants';

export const Dashboard = () => {
  const { projects } = useProjects();
  const { t, lang } = useLanguage();

  const totalValue = projects.reduce((sum, p) => sum + (p.estimatedValueSAR || 0), 0);
  const pipelineValue = projects.reduce((sum, p) => sum + (p.expectedKLScopeValue || 0), 0);
  
  const statusData = [
    { name: 'Ongoing', value: projects.filter(p => p.status === ProjectStatus.ONGOING).length, color: '#10B981' },
    { name: 'Tender', value: projects.filter(p => p.status === ProjectStatus.TENDER).length, color: '#F59E0B' },
    { name: 'Awarded', value: projects.filter(p => p.status === ProjectStatus.AWARDED).length, color: '#3B82F6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard')}</h1>
        <button onClick={() => DOWNLOAD_DASHBOARD_REPORT()} className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
          <Download size={16} className="mr-2" /> {t('downloadReport')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg"><Building2 className="text-blue-600" size={24} /></div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+2 this week</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{projects.length}</div>
          <div className="text-sm text-slate-500">{t('totalProjects')}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg"><Zap className="text-emerald-600" size={24} /></div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">High Conf.</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{FORMAT_CURRENCY(pipelineValue, lang)}</div>
          <div className="text-sm text-slate-500">{t('activePipeline')}</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-amber-50 rounded-lg"><Clock className="text-amber-600" size={24} /></div>
          </div>
           <div className="text-3xl font-bold text-slate-900 mb-1">{projects.filter(p => p.status === ProjectStatus.TENDER).length}</div>
           <div className="text-sm text-slate-500">Active Tenders</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 rounded-lg"><Activity className="text-purple-600" size={24} /></div>
           </div>
           <div className="text-3xl font-bold text-slate-900 mb-1">{projects.filter(p => p.status === ProjectStatus.ONGOING).length}</div>
           <div className="text-sm text-slate-500">Projects Ongoing</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Project Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center text-xs">
                <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <h3 className="font-bold text-slate-800 mb-4">Latest Market Intelligence</h3>
           <div className="flex-1 overflow-y-auto space-y-4 pr-2">
             {projects.slice(0, 3).map(p => (
               p.news.map(n => (
                 <div key={n.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-blue-600">{n.source}</span>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 mb-1 line-clamp-2">{n.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{n.snippet}</p>
                 </div>
               ))
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export const MapView = () => {
  const { projects } = useProjects();
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [isSatellite, setIsSatellite] = useState(false);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([24.7136, 46.6753], 5);
      
      // Default: OpenStreetMap (Standard)
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapRef.current);
      
      // Init Marker Cluster Group
      if (L.markerClusterGroup) {
        markersRef.current = L.markerClusterGroup();
        mapRef.current.addLayer(markersRef.current);
      }
    }

    // Toggle Satellite Layer
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    if (isSatellite) {
      // Esri World Imagery (Satellite)
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      }).addTo(mapRef.current);
    } else {
      // OpenStreetMap
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    }

    // Update Markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
      projects.forEach(p => {
        if (p.coordinates) {
           const marker = L.marker([p.coordinates.lat, p.coordinates.lng])
             .bindPopup(`
               <div class="font-sans">
                 <h3 class="font-bold text-sm">${p.name}</h3>
                 <p class="text-xs text-gray-600">${p.city}</p>
                 <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">${p.status}</span>
               </div>
             `);
           markersRef.current.addLayer(marker);
        }
      });
    }

  }, [projects, isSatellite]);

  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900">{t('map')}</h1>
          <button 
             onClick={() => setIsSatellite(!isSatellite)}
             className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center hover:bg-slate-50"
          >
             <Layers size={16} className="mr-2"/> {isSatellite ? 'Switch to Standard' : t('mapToggle')}
          </button>
       </div>
       <div className="flex-1 bg-slate-200 rounded-xl border border-slate-300 relative z-0 shadow-inner">
         <div ref={mapContainerRef} className="absolute inset-0 rounded-xl overflow-hidden"></div>
         {/* Map Legend Overlay */}
         <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[400] text-xs">
            <div className="font-bold mb-2">Project Clusters</div>
            <div className="flex items-center space-x-2 mb-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> <span>Standard Marker</span></div>
            <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-green-500/50 border border-green-600"></span> <span>Cluster</span></div>
         </div>
       </div>
    </div>
  );
};
