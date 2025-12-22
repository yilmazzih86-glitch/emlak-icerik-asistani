export type PipelineStage = 'NEW' | 'CONTACT' | 'PRESENTATION' | 'OFFER' | 'SOLD';

export const STAGE_LABELS: Record<PipelineStage, string> = {
  NEW: 'Yeni Müşteri',
  CONTACT: 'Görüşüldü',
  PRESENTATION: 'Sunum Yapıldı',
  OFFER: 'Teklif / Pazarlık',
  SOLD: 'Satış Başarılı'
};

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  budget_min?: number;
  budget_max?: number;
  interested_districts?: string[]; // JSONB array
  notes?: string;
  created_at: string;
}

export interface CrmDeal {
  id: string;
  customer_id: string;
  stage: PipelineStage;
  title?: string; // Fırsat başlığı (örn: "Ahmet Bey - 3+1 Arayışı")
  portfolio_id?: string; // İlgilenilen spesifik portföy varsa
  deal_value?: number;
  created_at: string;
  // Join ile gelen veriler:
  customers?: Customer; 
  portfolios?: Portfolio;
}

export interface Portfolio {
  id: string;
  title: string;
  price: number;
  city: string;
  district: string;
  room_count: string;
  net_m2: number;
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

// AI Yanıt Tipleri
export type AiAutomationMode = 
  | 'message_draft' 
  | 'smart_match' 
  | 'silence_detection' 
  | 'post_sale' 
  | 'consultant_insight';