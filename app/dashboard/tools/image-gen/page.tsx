"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutTemplate, UploadCloud, X, Sparkles, Loader2, 
  Smartphone, Instagram, RefreshCcw, Download, CheckCircle2, Zap, Copy, Check, Edit,
  Palette, ChevronDown, ChevronUp, Share2, Maximize2, Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper ve Tipleri İçe Aktar
import { buildSocialMediaPayload } from "../../../../lib/n8n/payload-builder";
import { BrandConfig, SocialMediaWebhookPayload } from "@/types/n8n";

// --- TİP TANIMLARI ---
type FormatType = 'instagram_post' | 'instagram_story';

// Portfolio interface'i Supabase yapısına uygun şekilde genişletildi
interface Portfolio {
  id: string;
  title: string;
  image_url?: string;
  price?: number;
  room_count?: string;
  net_m2?: number;
  gross_m2?: number;
  ai_output?: {
    instagram?: string;
    portal?: string;
    linkedin?: string;
  };
  // details JSONB kolonu için esnek yapı
  details?: any; 
}

const FORMATS: { id: FormatType; label: string; icon: any }[] = [
  { id: 'instagram_post', label: 'Post (4:5)', icon: Instagram },
  { id: 'instagram_story', label: 'Story (9:16)', icon: Smartphone },
];

export default function ImageGenPage() {
  const supabase = createClient();
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{image: string | null, caption: string | null}>({ image: null, caption: null });
  const [copied, setCopied] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [credits, setCredits] = useState({ limit: 0, used: 0 });
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  
  // Form State
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('instagram_post');
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Marka Ayarları State
  const [showBrandSettings, setShowBrandSettings] = useState(false);
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    name: "",
    primary_color: "#0F172A",
    secondary_color: "#E11D48",
    background_color: "#020617",
    accent_color: "#FFFFFF",
    logo_url: "",
    tone: "kurumsal",
    cta_text: "Detaylı bilgi ve sunum için DM gönderin.",
    hashtag_prefix: null
  });

  // 1. Verileri Çek
  useEffect(() => {
    async function initData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pData } = await supabase.from('portfolios').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (pData) setPortfolios(pData);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setCredits({ 
          limit: profile.social_ai_limit || 0, 
          used: profile.social_ai_used || 0 
        });
        
        // Marka bilgilerini profilden al
        setBrandConfig(prev => ({
          ...prev,
          name: profile.agency_name || "Emlak Ofisi",
          logo_url: profile.avatar_url || "",
          hashtag_prefix: profile.agency_name ? `#${profile.agency_name.replace(/\s+/g, '').toLowerCase()}` : null
        }));
      }
    }
    initData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult({ image: null, caption: null });
    }
  };

  const handleClearImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (result.caption) {
      navigator.clipboard.writeText(result.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!result.image) return;
    try {
      const response = await fetch(result.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `social-post-${Date.now()}.png`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(result.image, '_blank');
    }
  };

  // --- GENERATE (Görsel Oluştur) ---
  const handleGenerate = async () => {
    // Validasyon
    if (!selectedPortfolio) return alert("Lütfen sol listeden bir portföy seçiniz.");
    // Görsel zorunluluğu: Ya yeni yüklenen ya da portföyde var olan
    const hasImage = uploadedImage || selectedPortfolio.image_url;
    if (!hasImage) return alert("Lütfen bir görsel yükleyiniz veya kapak görseli olan bir portföy seçiniz.");
    
    if (credits.limit <= credits.used) return alert("Sosyal medya görsel limitiniz doldu.");

    setLoading(true);
    setResult({ image: null, caption: null });
    setIsCaptionExpanded(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum süresi dolmuş.");

      // 1. Görsel URL Belirle
      let finalImageUrl = "";
      
      if (uploadedImage) {
        const fileExt = uploadedImage.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('temp-uploads')
          .upload(filePath, uploadedImage, { cacheControl: '3600', upsert: false });
          
        if (uploadError) throw new Error("Görsel yüklenemedi.");
        
        const { data: { publicUrl } } = supabase.storage
          .from('temp-uploads')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrl;
      } else if (selectedPortfolio.image_url) {
        finalImageUrl = selectedPortfolio.image_url;
      }

      // 2. Payload Oluştur (Helper Fonksiyonu ile)
      const outputFormatMap: Record<FormatType, SocialMediaWebhookPayload['output_format']> = {
        'instagram_post': 'post_4_5',
        'instagram_story': 'story_9_16'
      };

      const payload = buildSocialMediaPayload(
        user.id,
        selectedPortfolio,
        brandConfig,
        finalImageUrl,
        outputFormatMap[selectedFormat],
        prompt
      );

      // 3. Webhook İsteği
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_SOCIAL;
      if (!webhookUrl) throw new Error("Webhook URL eksik.");

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Yapay zeka yanıt vermedi.");

      const rawData = await response.json();
      const data = Array.isArray(rawData) ? rawData[0] : rawData;

      if (data.status === 'success' && data.image_url) {
        // Caption belirle
        let finalCaption = "";
        if (selectedPortfolio.ai_output && selectedPortfolio.ai_output.instagram) {
           finalCaption = selectedPortfolio.ai_output.instagram;
        } else {
           const d = selectedPortfolio.details || {};
           finalCaption = `🏡 ${selectedPortfolio.title}\n\n📍 ${d.district || ''}/${d.city || ''}\n💰 ${(d.price || 0).toLocaleString()} ₺\n\n${brandConfig.cta_text}\n\n#emlak #${(d.city || '').toLowerCase()} #satılık`;
        }

        setResult({
          image: data.image_url,
          caption: finalCaption
        });

        // Kredi güncelle
        const { data: profile } = await supabase.from('profiles').select('social_ai_used').eq('id', user.id).single();
        if (profile) {
           await supabase.from('profiles').update({ social_ai_used: (profile.social_ai_used || 0) + 1 }).eq('id', user.id);
           setCredits(prev => ({ ...prev, used: prev.used + 1 }));
        }
      } else {
        throw new Error("Görsel oluşturma başarısız oldu.");
      }

    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStyledCaption = (text: string) => {
    if (!text) return null;
    return text.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('#')) return <span key={index} style={{ color: '#60a5fa', fontWeight: 600 }}>{word}</span>;
      return <span key={index}>{word}</span>;
    });
  };

  return (
    <div className="premium-gen-container">
      <div className="ambient-glow purple"></div>
      <div className="ambient-glow orange"></div>
      <div className="grid-pattern"></div>

      <div className="nav-island-wrapper">
        <div className="nav-island">
          <button className="nav-btn active">
            <motion.div layoutId="nav-indicator" className="active-bg" />
            <span className="z-10 flex items-center gap-2 relative">
              <LayoutTemplate size={16} className="text-white" />
              <span className="text-white font-semibold">Sosyal Medya Stüdyosu</span>
            </span>
          </button>
        </div>
      </div>

      <div className="stage-grid">
        {/* SOL PANEL */}
        <motion.div initial={{x: -50, opacity: 0}} animate={{x: 0, opacity: 1}} className="side-panel left">
          <div className="glass-box h-full flex flex-col">
            <div className="box-header">
              <h3>Portföy Seçimi</h3>
              <div className="header-line"></div>
            </div>
            <div className="box-content custom-scrollbar">
                {portfolios.length > 0 ? (
                  <div className="portfolio-list">
                    {portfolios.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedPortfolio(p)}
                        className={`portfolio-card ${selectedPortfolio?.id === p.id ? 'selected' : ''}`}
                      >
                        <div className="p-indicator"></div>
                        <div className="p-details">
                          <h4>{p.title}</h4>
                          <div className="p-meta">
                            <span>{p.details?.city || ""}</span>
                            <span className="separator">•</span>
                            <span className="price">{(p.details?.price || 0).toLocaleString()} ₺</span>
                          </div>
                        </div>
                        {selectedPortfolio?.id === p.id && <CheckCircle2 size={18} className="check-icon"/>}
                      </div>
                    ))}
                  </div>
                ) : <div className="empty-text">Henüz portföy yok.</div>}
            </div>
          </div>
        </motion.div>

        {/* ORTA PANEL */}
        <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{delay: 0.1}} className="center-stage">
          <div className="canvas-wrapper glass-box">
            <div className="canvas-dots"></div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="canvas-state loading">
                  <div className="scanner-line"></div>
                  <div className="loading-content">
                    <Loader2 size={64} className="spin text-purple-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Tasarım Oluşturuluyor</h3>
                    <p className="text-gray-400">Marka kimliğiniz uygulanıyor, lütfen bekleyin...</p>
                  </div>
                </motion.div>
              ) : result.image ? (
                // SONUÇ EKRANI
                <motion.div key="result" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="canvas-state result w-full h-full flex flex-col p-6">
                  
                  {/* Görsel Alanı */}
                  <div className="result-image-container">
                     <img src={result.image} alt="AI Result" className={`result-img-preview ${selectedFormat === 'instagram_story' ? 'story' : 'post'}`}/>
                  </div>
                  
                  {/* Caption Alanı */}
                  <div className="result-caption-area">
                     <motion.div 
                        className={`caption-card-glass ${isCaptionExpanded ? 'expanded' : ''}`}
                        initial={false}
                        animate={{ height: isCaptionExpanded ? 'auto' : '56px' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                     >
                        <div className="caption-header" onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}>
                           <div className="flex items-center gap-3">
                             <Instagram size={18} className="text-pink-500"/> 
                             <span className="title">AI Instagram Post Açıklaması</span>
                             {isCaptionExpanded ? <ChevronDown size={16} className="text-gray-400"/> : <ChevronUp size={16} className="text-gray-400"/>}
                           </div>
                           <motion.button whileTap={{ scale: 0.95 }} onClick={handleCopy} className={`copy-btn ${copied ? 'copied' : ''}`}>
                              {copied ? <Check size={14}/> : <Copy size={14}/>}
                              {copied ? 'Kopyalandı' : 'Kopyala'}
                           </motion.button>
                        </div>
                        <div className="caption-content custom-scrollbar">
                          {renderStyledCaption(result.caption || "")}
                        </div>
                     </motion.div>
                  </div>

                  {/* Butonlar */}
                  <div className="result-actions-grid">
                    <button onClick={() => setResult({image: null, caption: null})} className="action-btn secondary">
                      <RefreshCcw size={18}/> Yeni Oluştur
                    </button>
                    <button onClick={handleDownload} className="action-btn primary">
                      <Download size={18}/> İndir (HD)
                    </button>
                  </div>
                </motion.div>
              ) : (
                // UPLOAD EKRANI
                <motion.div key="upload" initial={{opacity:0}} animate={{opacity:1}} className="canvas-state upload">
                  <div className={`drop-zone ${imagePreview ? 'filled' : ''}`}>
                    {imagePreview ? (
                      <div className="preview-container">
                        <img src={imagePreview} className="preview-img" />
                        <div className="preview-actions">
                            <button onClick={handleClearImage} className="btn-remove" title="Görseli Kaldır"><X size={18} /></button>
                            <label htmlFor="change-image-input" className="btn-change"><Edit size={14}/> Görseli Değiştir</label>
                            <input id="change-image-input" type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        </div>
                      </div>
                    ) : (
                      <label className="upload-label">
                        <div className="icon-pulse mb-4"><UploadCloud size={48} className="icon-main"/></div>
                        <h3>Görsel Yükle</h3>
                        <p>{selectedPortfolio ? `"${selectedPortfolio.title}" için görsel seçin.` : "Önce sol taraftan bir portföy seçin."}</p>
                        <span className="badge-required">Zorunlu Alan</span>
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={!selectedPortfolio} />
                      </label>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* SAĞ PANEL */}
        <motion.div initial={{x: 50, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{delay: 0.2}} className="side-panel right">
          <div className="glass-box h-full flex flex-col">
            <div className="box-header">
               <h3>Kontrol Merkezi</h3>
               <div className="header-line"></div>
            </div>
            <div className="box-content custom-scrollbar">
              
              <div className="control-section">
                <label>Çıktı Formatı</label>
                <div className="format-toggles">
                  {FORMATS.map((f) => (
                    <button key={f.id} onClick={() => setSelectedFormat(f.id)} className={`fmt-btn ${selectedFormat === f.id ? 'active' : ''}`}>
                      <f.icon size={18} /><span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Marka Ayarları */}
              <div className="control-section">
                <button onClick={() => setShowBrandSettings(!showBrandSettings)} className="brand-toggle">
                  <div className="label-wrap"><Palette size={16} className="icon-purple"/><span>Marka & Tasarım</span></div>
                  {showBrandSettings ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>
                <AnimatePresence>
                  {showBrandSettings && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="brand-content">
                        <div className="form-group"><label>Marka Adı</label><input type="text" value={brandConfig.name} onChange={(e) => setBrandConfig({...brandConfig, name: e.target.value})}/></div>
                        <div className="form-group"><label>Renkler</label><div className="color-grid">
                            <div className="color-wrapper"><input type="color" value={brandConfig.primary_color} onChange={(e) => setBrandConfig({...brandConfig, primary_color: e.target.value})}/><span>{brandConfig.primary_color}</span></div>
                            <div className="color-wrapper"><input type="color" value={brandConfig.secondary_color} onChange={(e) => setBrandConfig({...brandConfig, secondary_color: e.target.value})}/><span>{brandConfig.secondary_color}</span></div>
                        </div></div>
                        <div className="form-group"><label>Tasarım Tonu</label><select value={brandConfig.tone} onChange={(e) => setBrandConfig({...brandConfig, tone: e.target.value})}>
                            <option value="kurumsal">Kurumsal & Ciddi</option><option value="lux">Lüks & Premium</option><option value="minimal">Minimal & Modern</option><option value="sicak">Sıcak & Samimi</option>
                        </select></div>
                        <div className="form-group"><label>Çağrı Metni (CTA)</label><input type="text" value={brandConfig.cta_text} onChange={(e) => setBrandConfig({...brandConfig, cta_text: e.target.value})}/></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="control-section expanded">
                <label className="flex-split">Yapay Zeka Talimatı<span className="badge-opt">Opsiyonel</span></label>
                <div className="chat-box">
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Örn: Sağ üst köşeye 'Fırsat' etiketi koy..." />
                  <div className="chat-footer"><Sparkles size={14}/><span>AI Assistant Hazır</span></div>
                </div>
              </div>
            </div>

            <div className="box-footer">
              <button onClick={handleGenerate} disabled={loading || !selectedPortfolio || !imagePreview} className={`generate-btn-v2 ${(!selectedPortfolio || !imagePreview) ? 'disabled' : ''}`}>
                <div className="btn-bg"></div>
                <span className="relative flex items-center gap-2">
                  {loading ? <Loader2 size={20} className="spin"/> : <Zap size={20} fill="currentColor"/>}
                  {loading ? 'Marka Uygulanıyor...' : 'Görseli Oluştur'}
                </span>
              </button>
              <p className="credit-sub">1 Kredi • Kalan: {Math.max(0, credits.limit - credits.used)}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}