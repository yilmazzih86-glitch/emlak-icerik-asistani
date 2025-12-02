// lib/n8n/payload-builder.ts

import { SocialMediaWebhookPayload, BrandConfig } from "@/types/n8n";

// Supabase'den gelen ham veri tipi (Sayfadaki Portfolio tipiyle uyumlu olması için any kullanıyoruz,
// çünkü veritabanı JSON yapısı karmaşık olabilir)
type SupabasePortfolio = any; 

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
  portfolio: SupabasePortfolio,
  brand: BrandConfig,
  imageUrl: string,
  outputFormat: SocialMediaWebhookPayload['output_format'],
  userPrompt: string
): SocialMediaWebhookPayload => {
  
  const d = portfolio.details || {}; // details JSON kolonu

  // Başlık: Varsa kullan, yoksa otomatik oluştur
  const generatedTitle = portfolio.title && portfolio.title.trim().length > 0
    ? portfolio.title
    : `${d.city || ''} ${d.district || ''} ${d.roomCount || ''} ${d.propertyType || ''}`.trim();

  // Stil belirleme
  const style = mapToneToStyle(d.marketing?.tone || brand.tone);

  return {
    user_id: userId,
    mode: 'socialPost',
    language: d.marketing?.language || 'tr',
    brand: {
      ...brand,
      tone: brand.tone // UI'dan gelen tonu kullan veya style'a eşle
    },
    portfolio: {
      id: portfolio.id,
      title: generatedTitle,
      city: d.city || "",
      district: d.district || "",
      neighborhood: d.neighborhood || "",
      property_type: d.propertyType || "",
      price: d.price || portfolio.price || 0,
      price_currency: "TRY",
      room_count: d.roomCount || portfolio.room_count || "",
      net_m2: d.netM2 || portfolio.net_m2 || 0,
      gross_m2: d.grossM2 || portfolio.gross_m2 || 0,
      listing_no: d.listingNo || "",
      floor: d.floor || "",
      site: d.site || "Hayır",
      credit: d.credit || "Hayır",
      heating: d.heating || "",
      parking: d.parking || "Hayır",
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