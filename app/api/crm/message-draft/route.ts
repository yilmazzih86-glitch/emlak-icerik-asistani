import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  // 1. Güvenlik Kontrolü (Oturum var mı?)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // 2. Envelope (Zarf) Hazırlığı: n8n'e ek veriler gönderiyoruz
    const envelope = {
      request_id: crypto.randomUUID(),
      user_id: user.id,
      timestamp: new Date().toISOString(),
      source: 'crm_web',
      payload: body // Frontend'den gelen veri (customer_id, purpose vb.)
    };

    // 3. Veritabanına Logla (Opsiyonel ama önerilir)
    // await supabase.from('ai_requests').insert({...})

    // 4. n8n Webhook'una İstek At
    const n8nUrl = process.env.N8N_WEBHOOK_MESSAGE_DRAFT;
    if (!n8nUrl) throw new Error("N8N Webhook URL tanımlanmamış!");

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope)
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n Error: ${n8nResponse.statusText}`);
    }

    const aiResult = await n8nResponse.json();

    // 5. Sonucu Frontend'e Dön
    return NextResponse.json(aiResult);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}