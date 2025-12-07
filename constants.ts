
import { Project, ProjectStatus, ProjectType, City, User, AuditLog, ActivityLog, Company, FilterState, PotentialProject } from './types';

// --- MOCK USERS ---
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@ksaintel.com', role: 'Admin', avatar: 'AU' },
  { id: 'u2', name: 'Sarah Analyst', email: 'sarah@ksaintel.com', role: 'Analyst', avatar: 'SA' },
  { id: 'u3', name: 'John Sales', email: 'john@ksaintel.com', role: 'Sales', avatar: 'JS' },
  { id: 'u4', name: 'Guest Viewer', email: 'guest@ksaintel.com', role: 'Viewer', avatar: 'GV' },
];

// --- MOCK LOGS ---
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'al1', timestamp: '2023-10-27T10:30:00Z', user: 'admin@ksaintel.com', action: 'Update Project', details: 'Updated status of Red Sea Resort to Ongoing', ip: '192.168.1.1' },
  { id: 'al2', timestamp: '2023-10-27T09:15:00Z', user: 'sarah@ksaintel.com', action: 'Export Data', details: 'Exported CSV of Riyadh Hotels', ip: '192.168.1.4' },
  { id: 'al3', timestamp: '2023-10-26T16:20:00Z', user: 'john@ksaintel.com', action: 'Pipeline Edit', details: 'Moved Hospital Exp to Won', ip: '192.168.1.12' },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'act1', timestamp: '2023-10-27T08:00:00Z', type: 'SCRAPE', message: 'Daily crawl completed. 15 news items found.', source: 'MEED', status: 'SUCCESS' },
  { id: 'act2', timestamp: '2023-10-27T08:05:00Z', type: 'MERGE', message: 'Merged duplicate entry for "Jeddah Tower".', status: 'SUCCESS' },
  { id: 'act3', timestamp: '2023-10-27T07:55:00Z', type: 'ERROR', message: 'Connection timeout for source: tenders.sa', source: 'tenders.sa', status: 'FAILURE' },
  { id: 'act4', timestamp: '2023-10-26T14:30:00Z', type: 'ALERT', message: 'High value alert sent to Slack.', status: 'SUCCESS' },
];

// --- MOCK CRAWLED DATA FOR STAGING ---
export const MOCK_POTENTIAL_PROJECTS: PotentialProject[] = [
  {
    id: 'temp_1',
    projectName: 'Qiddiya Water Park Resort',
    type: ProjectType.RESORT,
    developer: 'Qiddiya Investment Company',
    contractor: 'ALEC Engineering',
    consultant: 'Dewan Architects',
    city: City.RIYADH,
    region: 'Riyadh',
    sourceUrl: 'https://qiddiya.com/news/waterpark-update',
    sourceTitle: 'Construction begins on Qiddiya Water Park Hotel',
    publishDate: new Date().toISOString(), // Today
    summary: 'Major progress on the water park district. Main hotel package awarded to ALEC. The 500-key hotel will feature integrated access to the park.',
    status: ProjectStatus.ONGOING,
    estimatedOpening: '2026-01-01',
    estimatedValue: 2500000000,
    classification: 'New'
  },
  {
    id: 'temp_2',
    projectName: 'Jeddah Corniche Tower Hotel', // DUPLICATE SIMULATION
    type: ProjectType.HOTEL,
    developer: 'Al Khozama',
    city: City.JEDDAH,
    region: 'Makkah',
    sourceUrl: 'https://sauditenders.sa/jeddah-tower-mep',
    sourceTitle: 'MEP Tender Issued for Corniche Tower',
    publishDate: new Date().toISOString(),
    summary: 'Tenders have been officially issued for the MEP package of the Corniche Tower. Kitchen fit-out is included in the package.',
    status: ProjectStatus.TENDER,
    classification: 'New',
    isDuplicate: true // Flagged for merge
  },
  {
    id: 'temp_3',
    projectName: 'Abha Luxury Mountain Retreat',
    type: ProjectType.RESORT,
    developer: 'Soudah Development',
    city: City.ABHA,
    region: 'Asir',
    sourceUrl: 'https://archive.news/abha-project-stalled',
    sourceTitle: 'Soudah Peaks Masterplan Revealed',
    publishDate: '2022-11-15', // Old Date
    summary: 'Soudah Development launches the masterplan for the highest peak in Saudi Arabia. Includes 2,700 hospitality keys.',
    status: ProjectStatus.TENDER,
    classification: 'Backlog'
  }
];

// --- MOCK COMPANIES ---
export const MOCK_COMPANIES: Company[] = [
  { 
    id: 'c1', name: 'Red Sea Global', type: 'Developer', city: City.RIYADH,
    website: 'https://redseaglobal.com', email: 'info@redseaglobal.com', phone: '+966 11 123 4567',
    contactPerson: { name: 'Mohamed Ali', role: 'Procurement Director', mobile: '+966 55 123 4567', email: 'm.ali@redseaglobal.com' }
  },
  { 
    id: 'c2', name: 'Nesma & Partners', type: 'Contractor', city: City.KHOBAR,
    website: 'https://nesma.com', email: 'contact@nesma.com', phone: '+966 13 888 9999',
    contactPerson: { name: 'Sami Ahmed', role: 'Project Manager', mobile: '+966 54 987 6543', email: 's.ahmed@nesma.com' }
  },
  { id: 'c3', name: 'El Seif Engineering', type: 'Contractor', city: City.RIYADH, website: 'https://elseif.com' },
  { id: 'c4', name: 'Al Bawani', type: 'Contractor', city: City.RIYADH, website: 'https://albawani.net' },
  { id: 'c5', name: 'Dar Al-Handasah', type: 'Consultant', city: City.RIYADH },
  { id: 'c6', name: 'Foster + Partners', type: 'Designer', city: City.RIYADH },
  { id: 'c7', name: 'Ministry of Health', type: 'Developer', city: City.RIYADH },
  { id: 'c8', name: 'Al Khozama', type: 'Developer', city: City.RIYADH },
  { id: 'c9', name: 'Jabal Omar', type: 'Developer', city: City.MAKKAH },
];

// --- MOCK DATA ---

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Red Sea Desert Resort Phase 2',
    name_ar: 'منتجع البحر الأحمر الصحراوي - المرحلة الثانية',
    type: ProjectType.RESORT,
    city: City.RED_SEA,
    region: 'Tabuk',
    developer: 'Red Sea Global',
    contractor: 'Nesma & Partners',
    consultant: 'Foster + Partners',
    designer: 'Kengo Kuma',
    status: ProjectStatus.ONGOING,
    estimatedValueSAR: 1500000000,
    expectedKLScopeValue: 45000000, // Approx 3%
    expectedCompletion: '2025-12-01',
    awardDate: '2023-09-15',
    confidenceScore: 0.95,
    tags: ['Luxury', 'Resort', 'Island'],
    lastUpdated: '2023-10-25',
    kitchenScope: true,
    laundryScope: true,
    description: 'A 500-key luxury resort located on the Ummahat islands via seaplane access. Includes 4 specialty restaurants and a central production unit.',
    coordinates: { lat: 25.0, lng: 37.2 },
    salesData: { owner: 'John Sales', probability: 80, nextAction: 'Send Quote', remarks: 'Key decision maker met.' },
    history: [],
    attachments: [
      { id: 'att1', name: 'Project_Brief.pdf', type: 'PDF', size: '2.4 MB', url: '#', uploadDate: '2023-09-20' },
      { id: 'att2', name: 'Site_Plan.jpg', type: 'Image', size: '4.1 MB', url: '#', uploadDate: '2023-09-21' }
    ],
    news: [
      {
        id: 'n1',
        title: 'Nesma awarded main construction contract for Desert Resort',
        source: 'MEED',
        date: '2023-09-15',
        snippet: 'Red Sea Global has awarded a major contract to Nesma & Partners...',
        url: '#',
        confidenceScore: 0.98
      }
    ],
    contacts: [{ name: 'Ahmed Al-Ghamdi', role: 'Project Director', email: 'ahmed@redseaglobal.com' }],
    extractedEntities: [{ text: '1.5 Billion SAR', label: 'MONEY', start: 0, end: 10 }]
  },
  {
    id: '2',
    name: 'Riyadh Central Hospital Expansion',
    name_ar: 'توسعة مستشفى الرياض المركزي',
    type: ProjectType.HOSPITAL,
    city: City.RIYADH,
    region: 'Riyadh',
    developer: 'Ministry of Health',
    contractor: 'El Seif Engineering',
    consultant: 'Dar Al-Handasah',
    status: ProjectStatus.AWARDED,
    estimatedValueSAR: 450000000,
    expectedKLScopeValue: 12000000, // High laundry volume
    awardDate: '2023-10-10',
    expectedCompletion: '2026-03-01',
    confidenceScore: 0.92,
    tags: ['Healthcare', 'Government', 'Mega Project'],
    lastUpdated: '2023-10-26',
    kitchenScope: true,
    laundryScope: true,
    description: 'Expansion of the main medical city including a new patient tower with 300 beds and a centralized laundry facility serving the cluster.',
    coordinates: { lat: 24.7136, lng: 46.6753 },
    salesData: { owner: 'Sarah Analyst', probability: 100, nextAction: 'Close', remarks: 'Won tender.' },
    history: [],
    attachments: [],
    news: [
       {
        id: 'n3',
        title: 'MOH Announces Hospital Expansion Budget',
        source: 'MOH Portal',
        date: '2023-10-01',
        snippet: 'Ministry confirms budget allocation for the new central tower...',
        url: '#',
        confidenceScore: 1.0
      }
    ]
  },
  {
    id: '3',
    name: 'Jeddah Corniche Tower Hotel',
    name_ar: 'فندق برج كورنيش جدة',
    type: ProjectType.HOTEL,
    city: City.JEDDAH,
    region: 'Makkah',
    developer: 'Al Khozama',
    contractor: 'Unknown',
    status: ProjectStatus.TENDER,
    estimatedValueSAR: 280000000,
    expectedKLScopeValue: 8500000,
    awardDate: '',
    expectedCompletion: '2025-06-01',
    confidenceScore: 0.85,
    tags: ['High-rise', 'Hospitality'],
    lastUpdated: '2023-10-27',
    kitchenScope: true,
    laundryScope: false,
    description: 'A 45-story 5-star hotel featuring a rooftop restaurant and large banquet halls.',
    coordinates: { lat: 21.5433, lng: 39.1728 },
    salesData: { owner: 'John Sales', probability: 40, nextAction: 'Follow up', remarks: 'Waiting for MEP tender.' },
    history: [],
    attachments: [],
    news: [
      {
        id: 'n2',
        title: 'Tenders issued for MEP package',
        source: 'Saudi Tenders',
        date: '2023-10-20',
        snippet: 'Invitation to bid for MEP works including kitchen ventilation systems...',
        url: '#',
        confidenceScore: 0.90
      }
    ]
  },
  {
    id: '4',
    name: 'NEOM Trojena Ski Village',
    name_ar: 'قرية نيوم تروجينا للتزلج',
    type: ProjectType.ENTERTAINMENT,
    city: City.NEOM,
    region: 'Tabuk',
    developer: 'NEOM',
    contractor: 'Webuild',
    status: ProjectStatus.ONGOING,
    estimatedValueSAR: 5000000000,
    expectedKLScopeValue: 150000000, // Massive scope
    awardDate: '2023-01-15',
    expectedCompletion: '2026-11-01',
    confidenceScore: 0.99,
    tags: ['Tourism', 'Mega Project', 'Snow'],
    lastUpdated: '2023-10-24',
    kitchenScope: true,
    laundryScope: true,
    description: 'Mountain tourism destination offering year-round outdoor skiing and adventure sports.',
    coordinates: { lat: 28.3, lng: 35.5 },
    salesData: { owner: 'John Sales', probability: 60, nextAction: 'Present Proposal', remarks: 'High competition.' },
    history: [],
    attachments: [],
    news: []
  },
  {
    id: '5',
    name: 'Al-Ula Heritage Restaurant Complex',
    name_ar: 'مجمع مطاعم العلا التراثي',
    type: ProjectType.RESTAURANT,
    city: City.AL_ULA,
    region: 'Madinah',
    developer: 'RCU',
    contractor: 'Al Bawani',
    status: ProjectStatus.COMPLETED,
    estimatedValueSAR: 120000000,
    expectedKLScopeValue: 15000000, // Kitchen heavy
    awardDate: '2022-03-10',
    expectedCompletion: '2023-09-01',
    confidenceScore: 0.96,
    tags: ['Heritage', 'Dining'],
    lastUpdated: '2023-09-10',
    kitchenScope: true,
    laundryScope: false,
    description: 'A complex of 5 fine-dining concepts integrated into the heritage site.',
    coordinates: { lat: 26.61, lng: 37.93 },
    history: [],
    attachments: [],
    news: []
  },
  {
    id: '6',
    name: 'Dammam Industrial Central Kitchen',
    name_ar: 'مطبخ الدمام المركزي الصناعي',
    type: ProjectType.CENTRAL_KITCHEN,
    city: City.DAMMAM,
    region: 'Eastern Province',
    developer: 'Herfy Food Services',
    contractor: 'TBD',
    status: ProjectStatus.TENDER,
    estimatedValueSAR: 85000000,
    expectedKLScopeValue: 55000000, // Mostly equipment
    awardDate: '',
    expectedCompletion: '2024-12-01',
    confidenceScore: 0.88,
    tags: ['F&B', 'Industrial'],
    lastUpdated: '2023-10-27',
    kitchenScope: true,
    laundryScope: false,
    description: 'Large scale central production facility to serve 50+ outlets in the Eastern region.',
    coordinates: { lat: 26.4207, lng: 50.0888 },
    history: [],
    attachments: [],
    news: []
  },
  {
    id: '7',
    name: 'Makkah Pilgrim Housing District',
    name_ar: 'حي سكن الحجاج بمكة',
    type: ProjectType.HOTEL,
    city: City.MAKKAH,
    region: 'Makkah',
    developer: 'Jabal Omar',
    contractor: 'Ruad Construction',
    status: ProjectStatus.STALLED,
    estimatedValueSAR: 2000000000,
    expectedKLScopeValue: 60000000,
    awardDate: '2022-06-20',
    expectedCompletion: '2027-01-01',
    confidenceScore: 0.75,
    tags: ['Religious Tourism', 'Mega Project'],
    lastUpdated: '2023-08-15',
    kitchenScope: true,
    laundryScope: true,
    description: 'Massive accommodation project for Hajj and Umrah pilgrims.',
    coordinates: { lat: 21.3891, lng: 39.8579 },
    history: [],
    attachments: [],
    news: []
  }
];

// --- UTILITIES ---

export const FORMAT_CURRENCY = (value: number, lang: 'en' | 'ar' = 'en') => {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const FORMAT_DATE = (dateStr?: string, lang: 'en' | 'ar' = 'en') => {
  if (!dateStr) return lang === 'ar' ? 'غير متوفر' : 'N/A';
  return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const DOWNLOAD_CSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const cell = row[header] === null || row[header] === undefined ? '' : row[header];
      return `"${String(cell).replace(/"/g, '""')}"`;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const DOWNLOAD_PDF = (project: Project) => {
  alert(`Generating PDF Report for ${project.name}...\n\nIncluding:\n- Project Details\n- Technical Scope\n- Site Attachments\n- Contact Info`);
}

export const DOWNLOAD_DASHBOARD_REPORT = () => {
  alert(`Generating Executive Dashboard Report...\n\nIncluding:\n- Daily KPI Summary\n- Pipeline Analysis\n- Top 10 High Value Projects\n- Regional Breakdown\n\n(Simulated Download)`);
}

export const parseAIQuery = (query: string): Partial<FilterState> => {
  const lowercaseQuery = query.toLowerCase();
  const filters: Partial<FilterState> = {};

  // Extract City
  const cities = Object.values(City);
  for (const city of cities) {
    if (lowercaseQuery.includes(city.toLowerCase())) {
      filters.city = city;
      break;
    }
  }

  // Extract Type
  const types = Object.values(ProjectType);
  for (const type of types) {
    if (lowercaseQuery.includes(type.toLowerCase()) || 
       (type === ProjectType.HOTEL && lowercaseQuery.includes('hotels')) ||
       (type === ProjectType.HOSPITAL && lowercaseQuery.includes('hospitals')) ||
       (type === ProjectType.RESTAURANT && lowercaseQuery.includes('restaurants'))) {
      filters.type = type;
      break;
    }
  }

  // Extract Status
  const statuses = Object.values(ProjectStatus);
  for (const status of statuses) {
    if (lowercaseQuery.includes(status.toLowerCase())) {
      filters.status = status;
      break;
    }
  }
  
  // Extract Year (simple 4 digit regex)
  const yearMatch = lowercaseQuery.match(/\b20\d{2}\b/);
  if (yearMatch) {
    filters.year = yearMatch[0];
  }

  return filters;
}

// --- TRANSLATIONS ---

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    pipeline: "Pipeline",
    map: "Map View",
    crawler: "Crawler",
    settings: "Settings",
    newToday: "New Today",
    activePipeline: "Active K&L Opportunity", // Updated
    totalProjects: "Total Projects",
    highConfidence: "High Confidence",
    downloadReport: "Download Report",
    viewAll: "View All Projects",
    latestScrapes: "Latest Intelligence Scrapes",
    searchPlaceholder: "Search projects, companies...",
    deepSearch: "AI Deep Search",
    deepSearchPlaceholder: "Ask AI (e.g., 'Hotels in Riyadh awarded in 2023')",
    filters: "Filters",
    saveSearch: "Save Search",
    city: "City",
    status: "Status",
    type: "Type",
    value: "Value",
    klValue: "K&L Budget", // New
    awarded: "Awarded",
    actions: "Actions",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    projectDetails: "Project Details",
    description: "Description",
    timeline: "Timeline",
    developer: "Developer",
    contractor: "Contractor",
    consultant: "Consultant",
    scope: "Scope",
    kitchen: "Kitchen",
    laundry: "Laundry",
    systemHealth: "System Health",
    lastCrawl: "Last Crawl",
    nextRun: "Next Run",
    runCrawler: "Run Crawler Now",
    logs: "Logs",
    addSource: "Add Source",
    notifications: "Email Notifications",
    savePrefs: "Save Preferences",
    mapToggle: "Toggle Satellite",
    aiAnalyzing: "AI Analyzing Query...",
    adminConsole: "Admin Console",
    logout: "Sign Out",
    newsFeed: "Market Intelligence Feed", // New
  },
  ar: {
    dashboard: "لوحة القيادة",
    projects: "المشاريع",
    pipeline: "مراحل البيع",
    map: "الخريطة",
    crawler: "الزاحف الآلي",
    settings: "الإعدادات",
    newToday: "جديد اليوم",
    activePipeline: "قيمة فرص المطابخ والمغاسل", // Updated
    totalProjects: "إجمالي المشاريع",
    highConfidence: "ثقة عالية",
    downloadReport: "تحميل التقرير",
    viewAll: "عرض كل المشاريع",
    latestScrapes: "أحدث البيانات المستخرجة",
    searchPlaceholder: "بحث عن مشاريع، شركات...",
    deepSearch: "بحث ذكي بالذكاء الاصطناعي",
    deepSearchPlaceholder: "اسأل الذكاء الاصطناعي (مثال: فنادق في الرياض 2023)",
    filters: "تصفية",
    saveSearch: "حفظ البحث",
    city: "المدينة",
    status: "الحالة",
    type: "النوع",
    value: "القيمة",
    klValue: "ميزانية المطابخ", // New
    awarded: "تاريخ الترسية",
    actions: "إجراءات",
    edit: "تعديل",
    save: "حفظ",
    cancel: "إلغاء",
    projectDetails: "تفاصيل المشروع",
    description: "الوصف",
    timeline: "الجدول الزمني",
    developer: "المطور",
    contractor: "المقاول",
    consultant: "الاستشاري",
    scope: "النطاق",
    kitchen: "مطبخ",
    laundry: "مغسلة",
    systemHealth: "حالة النظام",
    lastCrawl: "آخر تحديث",
    nextRun: "التحديث القادم",
    runCrawler: "تشغيل الزاحف الآن",
    logs: "السجلات",
    addSource: "إضافة مصدر",
    notifications: "إشعارات البريد",
    savePrefs: "حفظ التفضيلات",
    mapToggle: "تبديل القمر الصناعي",
    aiAnalyzing: "جارٍ تحليل الطلب بالذكاء الاصطناعي...",
    adminConsole: "وحدة تحكم المسؤول",
    logout: "تسجيل خروج",
    newsFeed: "أخبار السوق", // New
  }
};