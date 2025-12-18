// lib/n8n/payload-builder.ts

import { SocialMediaWebhookPayload, BrandConfig } from "@/types/n8n";
// Doğru tipi import ediyoruz
import { Portfolio } from "@/types"; 

const mapToneToStyle = (tone: string): string => {
  const t = tone.toLowerCase();
  if (t.includes('profesyonel') || t.includes('kurumsal')) return 'kurumsal';
  if (t.includes('minimal') || t.includes('modern')) return 'minimal';
  if (t.includes('sıcak') || t.includes('samimi') || t.includes('sicak')) return 'sicak';
  if (t.includes('lüks') || t.includes('premium') || t.includes('lux')) return 'lux';
  if (t.includes('yatırım')) return 'yatirim';
  return 'lux'; 
};

export const buildSocialMediaPayload = (
  userId: string,
  portfolio: Portfolio, // ARTIK 'ANY' DEĞİL
  brand: BrandConfig,
  imageUrl: string,
  outputFormat: SocialMediaWebhookPayload['output_format'],
  userPrompt: string
): SocialMediaWebhookPayload => {
  
  // Yedek veri kaynağı (Legacy)
  const d = portfolio.details || {}; 

  // Başlık Mantığı: Önce ana sütun, yoksa dinamik oluşturma
  const generatedTitle = portfolio.title && portfolio.title.trim().length > 0
    ? portfolio.title
    : `${portfolio.city || d.city || ''} ${portfolio.district || d.district || ''} ${portfolio.room_count || d.roomCount || ''}`.trim();

  // Stil belirleme
  const style = mapToneToStyle(d.marketing?.tone || brand.tone);

  return {
    user_id: userId,
    mode: 'socialPost',
    language: d.marketing?.language || 'tr',
    brand: {
      ...brand,
      tone: brand.tone 
    },
    portfolio: {
      id: portfolio.id,
      title: generatedTitle,
      
      // --- YENİ MANTIK: ÖNCE SÜTUN, SONRA JSON ---
      city: portfolio.city || d.city || "",
      district: portfolio.district || d.district || "",
      neighborhood: portfolio.neighborhood || d.neighborhood || "",
      
      // Property Type genelde oda sayısı veya tip ile eşleşir
      property_type: portfolio.room_count || d.propertyType || "",
      
      // Fiyat ve Aidat (Sayısal kontrol)
      price: portfolio.price ?? d.price ?? 0,
      price_currency: "TRY",
      
      // Yeni eklediğin aidat alanı (JSON'da yoksa 0 gönderir)
      dues: portfolio.dues ?? d.dues ?? 0, 

      room_count: portfolio.room_count || d.roomCount || "",
      net_m2: portfolio.net_m2 ?? d.netM2 ?? 0,
      gross_m2: portfolio.gross_m2 ?? d.grossM2 ?? 0,
      
      // Listing No genelde JSON'da tutulur
      listing_no: d.listingNo || "",
      
      floor: portfolio.floor || d.floor || "",
      
      // Site durumu (Eğer sütun açtıysan portfolio.site, açmadıysan JSON)
      site: portfolio.site || d.site || "Hayır",
      
      // Kredi durumu
      credit: portfolio.credit_status || d.credit || "Hayır",
      
      heating: portfolio.heating || d.heating || "",
      parking: d.parking || "Hayır",
      
      // Marketing verileri JSON içinde kalmaya devam eder
      highlights: d.marketing?.highlights || null,
      marketing_notes: d.marketing?.notes || null,
      target_audience: d.marketing?.target || null
    },
    image_url: imageUrl,
    output_format: outputFormat,
    style: style,
    prompt: userPrompt || ""
  };
};