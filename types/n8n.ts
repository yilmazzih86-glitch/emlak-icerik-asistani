// types/n8n.ts

export interface BrandConfig {
  name: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  accent_color: string;
  logo_url: string;
  tone: string; // 'lux' | 'minimal' | 'kurumsal' | 'sicak' | 'yatirim'
  cta_text: string;
  hashtag_prefix: string | null;
}

export interface WebhookPortfolioData {
  id: string;
  title: string;
  city: string;
  district: string;
  neighborhood: string;
  property_type: string;
  price: number;
  price_currency: string;
  room_count: string;
  net_m2: number;
  gross_m2: number;
  listing_no: string;
  floor: string;
  site: string;
  credit: string;
  heating: string;
  parking: string;
  highlights: string | null;
  marketing_notes: string | null;
  target_audience: string | null;
}

export interface SocialMediaWebhookPayload {
  user_id: string;
  mode: 'socialPost';
  language: string;
  brand: BrandConfig;
  portfolio: WebhookPortfolioData;
  image_url: string;
  output_format: 'post_4_5' | 'story_9_16' | '1_1' | '16_9';
  style: string;
  prompt: string;
}