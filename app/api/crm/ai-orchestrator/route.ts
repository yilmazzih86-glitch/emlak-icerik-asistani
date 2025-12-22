// app/api/crm/ai-orchestrator/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { AiToolMode } from '@/features/crm/api/types';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { mode, customer_id, custom_prompt } = body as { mode: AiToolMode, customer_id: string, custom_prompt?: string };

    // 1. Temel Müşteri Verisini Çek
    const { data: customer } = await supabase.from('customers').select('*').eq('id', customer_id).single();
    if (!customer) throw new Error('Müşteri bulunamadı');

    // 2. Mod'a Göre Ekstra Context Topla
    let contextData: any = {};

    // 2.1 Geçmiş Analizi Gerektiren Modlar (Mesaj, İçgörü, Sessizlik)
    if (['message_draft', 'consultant_insight', 'silence_detection'].includes(mode)) {
      const { data: lastActivities } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('customer_id', customer_id)
        .order('created_at', { ascending: false })
        .limit(10);
      contextData.history = lastActivities;
    }

    // 2.2 Eşleşme Gerektiren Mod (Portföyleri Çek)
    if (mode === 'smart_match') {
      // Aktif portföylerden özet bir liste çekip n8n'e yolluyoruz ki aralarından seçsin
      const { data: portfolios } = await supabase
        .from('portfolios')
        // Sadece durumu uygun olanları çek
        .select('id, title, price, city, district, room_count, marketing_tags') 
        .limit(50); 
      contextData.available_portfolios = portfolios;
    }

    // 2.3 Satış Sonrası
    if (mode === 'post_sale') {
      const { data: soldDeal } = await supabase
        .from('crm_deals')
        .select('*, portfolios(*)')
        .eq('customer_id', customer_id)
        .eq('stage', 'SOLD')
        .single();
      contextData.sold_deal = soldDeal;
    }

    // 3. n8n Payload Hazırla
    const payload = {
      requestId: crypto.randomUUID(),
      mode: mode,
      user_input: custom_prompt || "", // Danışmanın ekstra notu
      customer: {
        name: customer.full_name,
        phone: customer.phone,
        preferences: customer.interested_districts, // JSONB
        budget: { min: customer.budget_min, max: customer.budget_max },
        last_contact: customer.last_contact_date // Eğer tabloda varsa
      },
      context: contextData
    };

    // 4. n8n Webhook Çağrısı
    const n8nUrl = process.env.N8N_AI_WEBHOOK_URL; 
    const response = await fetch(n8nUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('AI Servisi Yanıt Vermedi');
    
    const aiResult = await response.json();
    return NextResponse.json(aiResult);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}