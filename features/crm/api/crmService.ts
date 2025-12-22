import { createClient } from '@/lib/supabase/client';
import { CrmDeal, Customer, PipelineStage, CrmTask, CrmActivity, CrmAppointment } from './types';

const supabase = createClient();

export const crmService = {
  // --- Müşteri Havuzu ---
  async getCustomers() {
    // Pipeline'da OLMAYAN müşterileri getirmek isterseniz not.in filtresi eklenebilir
    // Şimdilik tüm müşterileri çekiyoruz
    return await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async createCustomer(data: Partial<Customer>) {
    return await supabase.from('customers').insert(data).select().single();
  },

  async deleteCustomer(id: string) {
    // Cascade ayarlıysa ilişkili deal/task vb. silinir
    return await supabase.from('customers').delete().eq('id', id);
  },

  // --- Pipeline / Deals ---
  async getDeals() {
    return await supabase
      .from('crm_deals')
      .select(`
        *,
        customers (*),
        portfolios (id, title, price, district)
      `)
      .order('created_at', { ascending: false });
  },

  async createDeal(customerId: string, stage: PipelineStage = 'NEW', portfolioId?: string) {
    // Müşteri bilgilerini çekip varsayılan başlık oluşturuyoruz
    const { data: customer } = await supabase.from('customers').select('full_name').eq('id', customerId).single();
    
    return await supabase.from('crm_deals').insert({
      customer_id: customerId,
      stage,
      portfolio_id: portfolioId || null,
      title: `${customer?.full_name || 'Müşteri'} - Fırsat`
    }).select().single();
  },

  async updateDealStage(dealId: string, newStage: PipelineStage) {
    return await supabase
      .from('crm_deals')
      .update({ stage: newStage })
      .eq('id', dealId);
  },

  async deleteDeal(dealId: string) {
    return await supabase.from('crm_deals').delete().eq('id', dealId);
  },

  // --- Alt Tablolar (Task, Activity, Appointment) ---
  
  async getCustomerDetails(customerId: string) {
    // Paralel istek atarak performans kazanalım
    const [tasks, activities, appointments] = await Promise.all([
      supabase.from('crm_tasks').select('*').eq('customer_id', customerId).order('due_date'),
      supabase.from('crm_activities').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
      supabase.from('crm_appointments').select('*').eq('customer_id', customerId).order('appointment_date')
    ]);

    return {
      tasks: tasks.data || [],
      activities: activities.data || [],
      appointments: appointments.data || []
    };
  },
  
  // Örnek bir ekleme fonksiyonu
  async addTask(task: Partial<CrmTask>) {
    return await supabase.from('crm_tasks').insert(task).select().single();
  }
};