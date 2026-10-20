export type PersonaType = 'mentor' | 'companion' | 'scientist' | 'executive';
export type LanguageCode = 'en' | 'hi' | 'mr' | 'hinglish';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'clara';
  text: string;
  timestamp: string;
  thinkingTrace?: string;
  reasoning?: string;
  groundingSources?: Array<{ title?: string; uri?: string }>;
  imageAttachment?: {
    base64: string;
    mimeType: string;
    fileName?: string;
    previewUrl?: string;
  };
  mediaAttachment?: {
    type: 'image' | 'vector_image' | 'audio' | 'code' | 'report';
    url?: string;
    content?: string;
  };
  audioUrl?: string;
  moduleOrigin?: string;
  quotaNotice?: string;
  predictBadge?: boolean;
  empathyBadge?: boolean;
  optimizeBadge?: boolean;
  visionBadge?: boolean;
}

export type MasterTab = 
  | 'chat'
  | 'brain' 
  | 'voice' 
  | 'connect' 
  | 'daily' 
  | 'files' 
  | 'studio' 
  | 'coder' 
  | 'search' 
  | 'training'
  | 'ui' 
  | 'guard'
  | 'predict'
  | 'empathy'
  | 'optimize'
  | 'vision';

export interface TrainingRule {
  id: string;
  userPrompt: string;
  expectedBehavior: string;
  category: 'direct_accuracy' | 'persona' | 'workflow' | 'scientific' | 'custom';
  strictnessWeight: number; // 0 - 100%
  enabled: boolean;
  dateAdded: string;
  protected?: boolean;
  tags?: string[];
}

export interface TrainingStats {
  totalRules: number;
  activeRules: number;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  storageCapacity: string;
  lastUpdated: string;
  adherenceRate: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  tasksCompleted: string[];
  productivityScore: number;
}

export interface SmartAlarm {
  id: string;
  label: string;
  time: string; // HH:MM
  enabled: boolean;
  days: string[];
  voicePrompt?: string;
}

export interface StoredDocument {
  id: string;
  title: string;
  content: string;
  size: string;
  dateAdded: string;
  tags: string[];
}
