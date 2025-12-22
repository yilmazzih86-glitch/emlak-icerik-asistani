import { createClient } from '@/lib/supabase/client';
import { Customer, CrmDeal, PipelineStage, CrmActivity, CrmTask, CrmAppointment } from './types';

const supabase = createClient();

export const crmService = {
  // --- Müşteri Havuzu (Customers) ---
  async getCustomers() {
    return await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async searchCustomers(query: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, phone')
      .ilike('full_name', `%${query}%`)
      .limit(5);
    if (error) throw error;
    return data;
  },

  async createCustomer(data: Partial<Customer>) {
    return await supabase.from('customers').insert(data).select().single();
  },

  // --- Satış Pipeline (Deals) ---
  async getDeals() {
    return await supabase
      .from('crm_deals')
      .select(`
        *,
        customers (id, full_name, phone),
        portfolios (id, title, price, district)
      `)
      .order('created_at', { ascending: false });
  },

  async createDealFull(data: any) {
    const { data: newDeal, error } = await supabase
      .from('crm_deals')
      .insert({
        customer_id: data.customer_id,
        stage: data.stage.toUpperCase(), 
        expected_amount: data.expected_amount,
        portfolio_id: data.portfolio_id || null,
        user_id: data.user_id
      })
      .select()
      .single();
    if (error) throw error;
    return newDeal;
  },

  async updateDealStage(dealId: string, newStage: PipelineStage) {
    return await supabase
      .from('crm_deals')
      .update({ stage: newStage.toUpperCase() })
      .eq('id', dealId);
  },

  // --- Müşteri Detay & Geçmiş Verileri ---
  async getCustomerFullProfile(customerId: string) {
    const [customer, tasks, activities, appointments, deals] = await Promise.all([
      supabase.from('customers').select('*').eq('id', customerId).single(),
      supabase.from('crm_tasks').select('*').eq('customer_id', customerId).order('due_date', { ascending: true }),
      supabase.from('crm_activities').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
      supabase.from('crm_appointments').select('*').eq('customer_id', customerId).order('appointment_date', { ascending: true }),
      supabase.from('crm_deals').select('*, portfolios(title, price)').eq('customer_id', customerId)
    ]);

    return {
      customer: customer.data,
      tasks: tasks.data || [],
      activities: activities.data || [],
      appointments: appointments.data || [],
      deals: deals.data || []
    };
  },

  // --- Alt Tablo İşlemleri (Ekleme) ---
  async addActivity(activity: Partial<CrmActivity>) {
    return await supabase.from('crm_activities').insert(activity).select().single();
  },
  
  async addTask(task: Partial<CrmTask>) {
    return await supabase.from('crm_tasks').insert(task).select().single();
  }
};