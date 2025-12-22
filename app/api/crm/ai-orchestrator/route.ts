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

    const { data: customer } = await supabase.from('customers').select('*').eq('id', customer_id).single();
    if (!customer) throw new Error('Müşteri bulunamadı');

    let contextData: any = {};

    // 2.1 Geçmiş Analizi (Mesaj, İçgörü, Sessizlik)
    if (['message_draft', 'consultant_insight', 'silence_detection'].includes(mode)) {
      const { data: history } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('customer_id', customer_id)
        .order('created_at', { ascending: false })
        .limit(10);
      contextData.history = history; // Değişkeni contextData içine attık
    }

    // 2.2 Eşleşme (Portföyleri Çek)
    if (mode === 'smart_match') {
      const { data: portfoliosData } = await supabase
        .from('portfolios')
        .select('id, title, price, city, district, room_count') 
        .limit(50); 
      contextData.available_portfolios = portfoliosData;
    }

    // 3. n8n Payload Hazırla
    const payload = {
      requestId: crypto.randomUUID(),
      mode: mode,
      user_input: custom_prompt || "",
      customer: {
        name: customer.full_name,
        phone: customer.phone,
        preferences: customer.interested_districts,
        budget: { min: customer.budget_min, max: customer.budget_max }
      },
      context: contextData // Artık hata almayacaksın, tüm veriler burada
    };

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