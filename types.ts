
export type Language = 'en' | 'ar';

export enum ProjectStatus {
  TENDER = 'Tender',
  ONGOING = 'Ongoing',
  AWARDED = 'Awarded',
  STALLED = 'Stalled',
  COMPLETED = 'Completed',
  LOST = 'Lost'
}

export enum ProjectType {
  HOTEL = 'Hotel',
  HOSPITAL = 'Hospital',
  CENTRAL_KITCHEN = 'Central Kitchen',
  RESTAURANT = 'Restaurant',
  FRANCHISE = 'Franchise',
  ENTERTAINMENT = 'Entertainment',
  RESORT = 'Resort'
}

export enum City {
  RIYADH = 'Riyadh',
  JEDDAH = 'Jeddah',
  MAKKAH = 'Makkah',
  MADINAH = 'Madinah',
  DAMMAM = 'Dammam',
  KHOBAR = 'Khobar',
  NEOM = 'NEOM / Tabuk',
  RED_SEA = 'Red Sea Project',
  AL_ULA = 'Al-Ula',
  ABHA = 'Abha'
}

export type Role = 'Admin' | 'Analyst' | 'Sales' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Excel' | 'Other';
  url: string;
  size: string;
  uploadDate: string;
}

export interface ContactPerson {
  name: string;
  role: string;
  mobile: string;
  email: string;
}

export interface Company {
  id: string;
  name: string;
  type: 'Developer' | 'Contractor' | 'Designer' | 'Consultant';
  city: City;
  website?: string;
  email?: string; // Corporate Email
  phone?: string; // Corporate Phone
  contactPerson?: ContactPerson;
}

export interface NewsItem {
  id: string;
  title: string;
  title_ar?: string; // Arabic Title Support
  source: string;
  date: string;
  snippet: string;
  snippet_ar?: string; // Arabic Snippet
  url: string;
  confidenceScore: number;
}

export interface ProjectChangeLog {
  date: string;
  field: string;
  oldValue: any;
  newValue: any;
  user: string;
}

export interface SalesData {
  owner?: string;
  remarks?: string;
  nextAction?: string;
  probability?: number;
}

export interface ContactInfo {
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface ExtractedEntity {
  text: string;
  label: 'MONEY' | 'DATE' | 'PERSON' | 'ORG' | 'GPE';
  start: number;
  end: number;
}

export interface Project {
  id: string;
  name: string;
  name_ar?: string; // Arabic Name
  type: ProjectType;
  city: City;
  region: string;
  developer: string;
  contractor?: string;
  designer?: string;
  consultant?: string;
  status: ProjectStatus;
  estimatedValueSAR: number;
  expectedKLScopeValue?: number; // Kitchen & Laundry Package Value
  awardDate?: string;
  expectedCompletion: string;
  confidenceScore: number;
  tags: string[];
  lastUpdated: string;
  news: NewsItem[];
  kitchenScope?: boolean;
  laundryScope?: boolean;
  description: string;
  description_ar?: string;
  coordinates?: { lat: number; lng: number }; // For Map View
  history?: ProjectChangeLog[];
  salesData?: SalesData;
  contacts?: ContactInfo[];
  extractedEntities?: ExtractedEntity[];
  notes?: string;
  attachments?: Attachment[];
}

// --- CRAWLER & STAGING TYPES ---

export interface ExtractedPerson {
  name: string;
  role: string;
}

export interface PotentialProject {
  id: string; // Temporary ID for staging
  projectName: string;
  type: ProjectType;
  developer: string;
  consultant?: string;
  contractor?: string;
  operator?: string;
  city: City;
  region: string;
  sourceUrl: string;
  sourceTitle: string;
  publishDate: string;
  summary: string;
  status: ProjectStatus;
  estimatedOpening?: string;
  expectedOpening?: string;
  estimatedValue?: number;
  classification: 'New' | 'Backlog' | 'Review';
  isDuplicate?: boolean;
  existingProjectId?: string; // If duplicate, link to real DB ID
  kitchenNotes?: string;
  extractedPeople?: ExtractedPerson[];
}

export interface KPIStats {
  totalProjects: number;
  totalValue: number;
  newToday: number;
  pipelineValue: number;
}

export interface FilterState {
  search: string;
  city: string;
  status: string;
  type: string;
  year: string;
  valueRange?: { min: number, max: number };
  contractor?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: FilterState;
}

export interface SearchQuery {
  id: string;
  name: string;
  query: string;
  language: 'en' | 'ar';
  isActive: boolean;
}

export interface ScrapingSettings {
  respectRobotsTxt: boolean;
  requestsPerMinute: number;
  useProxies: boolean;
  rotateUserAgents: boolean;
  retryAttempts: number;
}

export interface ImportMapping {
  csvHeader: string;
  dbField: keyof Project | 'ignore';
}

export interface ImportConfig {
  source: string;
  skipDuplicates: boolean;
  mappings: ImportMapping[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ip: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'SCRAPE' | 'MERGE' | 'ERROR' | 'ALERT';
  message: string;
  source?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
}

export interface AlertConfig {
  emailEnabled: boolean;
  emailAddress?: string;
  slackEnabled: boolean;
  slackWebhook?: string;
  teamsEnabled: boolean;
  teamsWebhook?: string;
  notifyOnNewProject: boolean;
  notifyOnHighValue: boolean;
  highValueThreshold: number;
}

export interface ScrapedSourceResult {
  url: string;
  title: string;
  score: number;
  status: 'NEW' | 'BACKLOG' | 'REVIEW'; // Updated for Fresh/Backlog logic
  reason?: string;
  dateDiscovered: string;
  aiExtractedData?: {
    projectName?: string;
    estimatedValue?: string;
    developer?: string;
    status?: string;
    city?: string;
  };
}

export interface CrawledPageLog {
  url: string;
  timestamp: string;
  status: number; // HTTP Status
  durationMs: number;
}
