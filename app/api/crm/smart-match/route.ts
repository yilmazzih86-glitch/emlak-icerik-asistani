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
    const { customer_id, limit = 8 } = body;

    if (!customer_id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // 2. Müşteri Verilerini Çek
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customer_id)
      .single();

    if (customerError || !customer) {
      throw new Error('Müşteri bulunamadı.');
    }

    // 3. n8n Payload Hazırla
    const n8nUrl = process.env.N8N_WEBHOOK_SMART_MATCH;
    if (!n8nUrl) throw new Error("N8N_WEBHOOK_SMART_MATCH tanımlı değil.");

    const n8nPayload = {
      event: "smart_match_request",
      customer_id: customer.id,
      user_id: user.id,
      org_id: customer.org_id || user.id, // org_id yoksa user_id kullanıyoruz
      limit: limit,
      ts: new Date().toISOString(),
      customer: {
        ...customer,
        // n8n'in beklediği spesifik alan adlarını garantiye alıyoruz
        full_name: customer.full_name,
        interested_cities: customer.interested_cities || [],
        interested_districts: customer.interested_districts || [],
        preferred_room_counts: customer.preferred_room_counts || []
      }
    };

    // 4. n8n Webhook Çağrısı
    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload)
    });

    if (!n8nResponse.ok) {
      throw new Error('AI Servisi (n8n) yanıt vermedi.');
    }

    let n8nData = await n8nResponse.json();
    
    // n8n bazen dizi döndürebilir, objeyi alıyoruz
    if (Array.isArray(n8nData)) {
      n8nData = n8nData[0];
    }

    // 5. Hata Durumu Kontrolü (n8n'den gelen ok: false)
    if (n8nData.ok === false) {
      return NextResponse.json(n8nData);
    }

    const portfolioCards = n8nData.portfolio_cards || [];

    // 6. Veri Zenginleştirme (Supabase'den Portföy Detaylarını Çekme)
    if (portfolioCards.length > 0) {
      const portfolioIds = portfolioCards.map((c: any) => c.portfolio_id);

      const { data: portfolios, error: pError } = await supabase
        .from('portfolios')
        .select('id, title, price, city, district, image_urls, currency, room_count, net_m2')
        .in('id', portfolioIds);

      if (!pError && portfolios) {
        // AI kartları ile DB verisini birleştir
        n8nData.portfolio_cards = portfolioCards.map((card: any) => {
            const details = portfolios.find(p => p.id === card.portfolio_id);
            return {
                ...card,
                portfolio_details: details ? {
                    title: details.title,
                    price: details.price,
                    currency: details.currency || 'TL',
                    city: details.city,
                    district: details.district,
                    image_url: details.image_urls?.[0] || null,
                    room_count: details.room_count,
                    net_m2: details.net_m2
                } : null
            };
        });
      }
    }

    return NextResponse.json({
      ok: true,
      ...n8nData
    });

  } catch (error: any) {
    console.error('Smart Match Error:', error);
    return NextResponse.json({ 
      ok: false, 
      message: error.message || 'İşlem sırasında bir hata oluştu.' 
    }, { status: 500 });
  }
}