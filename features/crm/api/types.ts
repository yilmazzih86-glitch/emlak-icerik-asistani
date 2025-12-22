// features/crm/api/types.ts

export type PipelineStage = 'NEW' | 'CONTACT' | 'PRESENTATION' | 'OFFER' | 'SOLD';

export const STAGES: PipelineStage[] = ['NEW', 'CONTACT', 'PRESENTATION', 'OFFER', 'SOLD'];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  NEW: 'Yeni Müşteri',
  CONTACT: 'Görüşüldü',
  PRESENTATION: 'Sunum Yapıldı',
  OFFER: 'Teklif / Pazarlık',
  SOLD: 'Satış Başarılı'
};

export interface Portfolio {
  id: string;
  title: string;
  price: number;
  city: string;
  district: string;
  room_count: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  budget_min?: number;
  budget_max?: number;
  interested_districts?: string[]; 
  notes?: string;
  created_at: string;
  status?: string; 
  stage?: PipelineStage;
}

export interface CrmDeal {
  id: string;
  customer_id: string;
  stage: PipelineStage;
  portfolio_id?: string;
  expected_amount?: number; 
  created_at: string;
  customers?: Customer; 
  portfolios?: Portfolio; // 'any' hatasını çözmek için tekil tanım
}

export interface CrmTask {
  id: string;
  customer_id: string;
  title: string;
  is_completed: boolean;
  due_date: string;
  created_at: string;
}

export interface CrmActivity {
  id: string;
  customer_id: string;
  type: 'call' | 'meeting' | 'note' | 'whatsapp' | 'ai_log';
  description: string;
  created_at: string;
}

export interface CrmAppointment {
  id: string;
  customer_id: string;
  title: string;
  appointment_date: string;
  location?: string;
  notes?: string;
  created_at: string;
}

// Hata Çözümü: Tek bir CustomerDetail interface'i
export interface CustomerDetail extends Customer {
  tasks: CrmTask[];
  activities: CrmActivity[];
  appointments: CrmAppointment[];
  deals: CrmDeal[];
}

export type AiToolMode = 'message_draft' | 'smart_match' | 'silence_detection' | 'post_sale' | 'consultant_insight';

export interface AiResponse {
  type: AiToolMode;
  content: string;
  data?: any;
}