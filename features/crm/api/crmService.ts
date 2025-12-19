// features/crm/api/crmService.ts
import { createClient } from '@/lib/supabase/client';
import { Deal, Customer, CrmActivity, AiOrchestratorRequest, AiOrchestratorResponse } from './types';

const supabase = createClient();

export const crmService = {
  // Mükerrer (duplicate) tüm özellikleri temizleyip tek bir nesne altında toplayın
  getDeals: async () => {
    const { data, error } = await supabase.from('crm_deals').select('*, customer:customers(*), portfolio:portfolios(*)');
    if (error) throw error;
    return data as Deal[];
  },

  getAllCustomers: async () => {
    const { data, error } = await supabase.from('customers').select('*').order('full_name');
    if (error) throw error;
    return data as Customer[];
  },

  createDeal: async (dealData: any) => {
    const { data, error } = await supabase.from('crm_deals').insert(dealData).select().single();
    if (error) throw error;
    return data;
  },

  updateDealStage: async (dealId: string, newStage: string) => {
    const { error } = await supabase.from('crm_deals').update({ stage: newStage }).eq('id', dealId);
    if (error) throw error;
  },

  executeAiAutomation: async (payload: AiOrchestratorRequest): Promise<AiOrchestratorResponse> => {
    const response = await fetch('/api/crm/ai-orchestrator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await response.json();
  }
};