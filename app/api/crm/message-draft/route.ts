// app/api/crm/message-draft/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  // 1. Yetki Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { customer_id, deal_id, message_goal } = body;

    if (!customer_id) {
      return NextResponse.json({ error: 'Müşteri seçimi zorunludur.' }, { status: 400 });
    }

    // 2. Veritabanından Verileri Paralel Çek (Performans için Promise.all kullanılır)
    
    // A) Müşteri Bilgisi
    const customerPromise = supabase
      .from('customers')
      .select('id, full_name, phone, type')
      .eq('id', customer_id)
      .single();

    // B) Son Etkileşim (Activity)
    const activityPromise = supabase
      .from('crm_activities')
      .select('type, description, created_at')
      .eq('customer_id', customer_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // C) Fırsat ve Portföy Bilgisi
    // Eğer deal_id varsa direkt onu, yoksa müşterinin son güncellenen fırsatını çekiyoruz.
    let dealQuery = supabase
      .from('crm_deals')
      .select('stage, portfolios (title, price, city, district, status)')
      .eq('customer_id', customer_id);

    if (deal_id) {
      dealQuery = dealQuery.eq('id', deal_id);
    } else {
      dealQuery = dealQuery.order('updated_at', { ascending: false }).limit(1);
    }
    const dealPromise = dealQuery.single();

    // Tüm verilerin gelmesini bekle
    const [customerRes, activityRes, dealRes] = await Promise.all([
      customerPromise,
      activityPromise,
      dealPromise
    ]);

    if (customerRes.error) throw new Error('Müşteri bulunamadı.');
    const customer = customerRes.data;
    const lastActivity = activityRes.data;
    const deal = dealRes.data;
    // Typescript'te portfolio verisinin tipini belirtmek için 'any' veya generic kullanılabilir
    const portfolio = deal?.portfolios as any; 

    // 3. Tarih Formatlama Yardımcısı
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    };

    // 4. Son Etkileşim Metni Oluşturma
    let lastInteractionText = "Henüz bir etkileşim yok.";
    if (lastActivity) {
      lastInteractionText = `${formatDate(lastActivity.created_at)} tarihinde ${lastActivity.type} yapıldı: ${lastActivity.description}`;
    }

    // 5. n8n Payload Hazırlığı (İstediğiniz JSON yapısında)
    const n8nPayload = {
        consultant: {
          id: user.id,
          name: user.user_metadata?.full_name || "Gayrimenkul Danışmanı",
          tone: "premium"
        },
        customer: {
          id: customer.id,
          name: customer.full_name, // CSV'de full_name kullanılıyor
          type: customer.type || "buyer",
          phone: customer.phone
        },
        pipeline_stage: deal?.stage || "new",
        portfolio: portfolio ? {
          title: portfolio.title,
          price: portfolio.price,
          location: `${portfolio.city || ''} / ${portfolio.district || ''}`,
          status: portfolio.status
        } : null,
        last_interaction: lastInteractionText,
        message_goal: message_goal || "follow_up"
    };

    // 6. n8n Webhook'una Gönderim
    const n8nUrl = process.env.N8N_WEBHOOK_MESSAGE_DRAFT;
    if (!n8nUrl) {
      console.error("HATA: N8N_WEBHOOK_MESSAGE_DRAFT tanımlı değil!");
      throw new Error("Sistem yapılandırma hatası: Webhook URL eksik.");
    }

    const aiResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload)
    });

    if (!aiResponse.ok) {
      throw new Error('Yapay zeka servisi yanıt vermedi.');
    }

    const aiResult = await aiResponse.json();

    // 7. Frontend'e Sonucu Dön (draft ve whatsapp_url içerir)
    return NextResponse.json(aiResult);

  } catch (error: any) {
    console.error('Message Draft API Error:', error);
    return NextResponse.json({ error: error.message || 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
  }
}