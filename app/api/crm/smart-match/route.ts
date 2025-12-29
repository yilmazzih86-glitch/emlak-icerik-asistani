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
    const { customer_id } = body;

    if (!customer_id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // 2. n8n Webhook Çağrısı
    const n8nUrl = process.env.N8N_WEBHOOK_SMART_MATCH;
    if (!n8nUrl) throw new Error("N8N_WEBHOOK_SMART_MATCH tanımlı değil.");

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customer_id,
        top_n: 10 
      })
    });

    if (!n8nResponse.ok) {
      throw new Error('AI Servisi (n8n) yanıt vermedi.');
    }

    // n8n'den gelen ham veri (Dizi içinde obje gelebilir, yapıyı kontrol ediyoruz)
    let n8nData = await n8nResponse.json();
    
    // Eğer n8n dizi dönüyorsa ilk elemanı al (Senin örneğindeki [ { ... } ] yapısı için)
    if (Array.isArray(n8nData)) {
      n8nData = n8nData[0];
    }

    const suggestions = n8nData.suggestions || [];

    // 3. Veri Zenginleştirme (Supabase'den Portföy Detaylarını Çekme)
    if (suggestions.length > 0) {
      const portfolioIds = suggestions.map((s: any) => s.portfolio_id);

      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select('id, title, price, city, district, image_urls, currency') // Gerekli alanlar
        .in('id', portfolioIds);

      if (!error && portfolios) {
        // n8n verisi ile DB verisini birleştir
        suggestions.forEach((s: any) => {
            const details = portfolios.find(p => p.id === s.portfolio_id);
            if (details) {
                s.portfolio_details = {
                    title: details.title,
                    price: details.price,
                    currency: details.currency || 'TL', // Varsayılan
                    city: details.city,
                    district: details.district,
                    // İlk resmi al veya placeholder koy
                    image_url: details.image_urls?.[0] || null 
                };
            }
        });
      }
    }

    return NextResponse.json({ 
      ...n8nData, 
      suggestions // Zenginleştirilmiş liste
    });

  } catch (error: any) {
    console.error('Smart Match Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}