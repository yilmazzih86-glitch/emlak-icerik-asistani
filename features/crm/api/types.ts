// features/crm/api/types.ts

export type CrmStage = 'new' | 'contacted' | 'presentation' | 'negotiation' | 'closed_won' | 'closed_lost';
export type ActivityType = 'note' | 'call' | 'meeting' | 'whatsapp_sent' | 'ai_generated' | 'status_change' | 'task_done';

// 1. Müşteri Detay Tipi (DB'deki tüm kolonları kapsar)
export interface Customer {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  status: 'new' | 'active' | 'passive' | 'archived';
  type: 'buy' | 'rent' | 'sell' | 'lease';
  budget_min?: number;
  budget_max?: number;
  interested_cities?: string[];
  interested_districts?: string[];
  preferred_room_counts?: string[];
  notes?: string;
  last_activity_at?: string;
  assigned_to?: string;
  created_at: string;
}

// 2. Fırsat (Deal) Tipi
export interface DealRow {
  id: string;
  org_id: string;
  customer_id: string;
  portfolio_id?: string | null;
  stage: CrmStage;
  expected_amount: number;
  probability: number;
  created_at: string;
  updated_at: string;
}

export interface Deal extends DealRow {
  customer?: Partial<Customer>; // Join ile gelen temel müşteri bilgisi
  portfolio?: {
    title: string;
    price: number;
    image_urls?: string[];
  };
}

// 3. Görev Tipi
export interface CrmTask {
  id: string;
  customer_id: string;
  assigned_to: string;
  title: string;
  description?: string;
  due_date?: string;
  is_completed: boolean;
  created_at: string;
}

// 4. Aktivite Tipi
export interface CrmActivity {
  id: string;
  customer_id: string;
  type: ActivityType;
  description: string;
  created_at: string;
  created_by: string;
  meta?: any; // AI promptları veya kanal bilgisi için
}

// 5. Merkezi AI Otomasyon Tipleri
export type AiAutomationMode = 
  | 'message_draft'      // 1. Mesaj Hazırlama
  | 'smart_match'       // 2. Akıllı Eşleştirme
  | 'followup_alert'    // 3. Takip & Sessizlik
  | 'relationship_memo' // 4. Satış Sonrası
  | 'consultant_insight'; // 5. Danışman Özet

export interface AiOrchestratorRequest {
  mode: AiAutomationMode;
  customer_id: string;
  deal_id?: string;
  context?: {
    tone?: 'formal' | 'friendly' | 'urgent';
    custom_instruction?: string;
  };
}

export interface AiOrchestratorResponse {
  success: boolean;
  output: string; // Ana metin veya analiz sonucu
  metadata?: {
    suggested_portfolios?: any[];
    risk_score?: number;
    next_steps?: string[];
  };
}