import { NextResponse } from 'next/server';

// Next.js'e bu işlemin uzun sürmeyeceğini söylüyoruz
export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { video_record_id, ...payload } = body; // Frontend'den gelen tablo ID'si

    const n8nUrl = process.env.N8N_WEBHOOK_UGC || process.env.NEXT_PUBLIC_N8N_WEBHOOK_UGC;

    if (!n8nUrl) {
      return NextResponse.json({ error: 'Webhook URL yok' }, { status: 500 });
    }

    // n8n'e video_record_id'yi de gönderiyoruz ki işlem bitince hangi satırı güncelleyeceğini bilsin
    const n8nPayload = {
      ...payload,
      video_record_id: video_record_id 
    };

    // fetch isteğini await ile bekliyoruz ama n8n'in hemen "Aldım" demesi lazım.
    // ÖNEMLİ: n8n workflow'unuzun sonuna "Respond to Webhook" nodunu EN BAŞA koyarak
    // işlemi beklemeden "OK" döndürmesini sağlayabilirsiniz. 
    // YA DA buradaki fetch'i hata vermesin diye try-catch içinde, yanıt beklemeden geçebiliriz.
    
    fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload),
    }).catch(err => console.log("Fire-and-forget tetiklendi", err));

    // Frontend'e hemen başarılı dönüyoruz. Bekletmiyoruz.
    return NextResponse.json({ success: true, message: "İşlem kuyruğa alındı" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}