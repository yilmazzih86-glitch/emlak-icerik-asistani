// app/api/crm/ai-orchestrator/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { AiAutomationMode } from '@/features/crm/api/types';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  // 1. Güvenlik Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { mode, customer_id, context } = await request.json();

    // 2. Müşteri Bilgilerini Çek (Context için temel veri)
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customer_id)
      .single();

    if (customerError || !customer) throw new Error('Müşteri bulunamadı');

    // 3. Mod'a Göre Ek Veri Toplama (Context Enrichment)
    let extraContext: any = {};

    if (mode === 'message_draft' || mode === 'consultant_insight') {
      // Son aktiviteleri ve görevleri ekle
      const { data: activities } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('customer_id', customer_id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      extraContext.recent_activities = activities;
    }

    if (mode === 'smart_match') {
      // Mevcut aktif portföylerin özetini ekle (n8n'de eşleştirme yapması için)
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id, title, price, city, district, room_count, net_m2')
        .limit(20);
      
      extraContext.available_portfolios = portfolios;
    }

    // 4. n8n Payload Hazırlığı
    const envelope = {
      request_id: crypto.randomUUID(),
      user_id: user.id,
      timestamp: new Date().toISOString(),
      mode: mode as AiAutomationMode,
      customer: {
        id: customer.id,
        name: customer.full_name,
        phone: customer.phone,
        preferences: {
          budget_max: customer.budget_max,
          districts: customer.interested_districts,
          room_counts: customer.preferred_room_counts
        }
      },
      extra_context: extraContext,
      user_instruction: context?.custom_instruction || ""
    };

    // 5. n8n Webhook URL Belirleme
    // Not: n8n tarafında tek bir webhook ile mode bazlı switch-case yapabilir 
    // veya her mod için farklı URL kullanabilirsiniz. Şimdilik merkezi webhook:
    const n8nUrl = process.env.N8N_WEBHOOK_CRM_ORCHESTRATOR;
    if (!n8nUrl) throw new Error("N8N Webhook URL tanımlanmamış!");

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope)
    });

    if (!n8nResponse.ok) {
      throw new Error(`AI Servisi Hatası: ${n8nResponse.statusText}`);
    }

    const aiResult = await n8nResponse.json();

    // 6. AI Yanıtını Kaydet (Opsiyonel: Aktivite olarak eklenebilir)
    // await supabase.from('crm_activities').insert({ customer_id, type: 'ai_generated', description: `AI Analizi (${mode}) gerçekleştirildi.` });

    return NextResponse.json(aiResult);

  } catch (error: any) {
    console.error('AI Orchestrator Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}