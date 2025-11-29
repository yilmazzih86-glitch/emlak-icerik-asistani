"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutTemplate, Image as ImageIcon, UploadCloud, X, Sparkles, Loader2, 
  Smartphone, Instagram, RefreshCcw, Download, Wand2, CheckCircle2, Zap, Copy, Check, Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TİP TANIMLARI ---
type FormatType = 'instagram_post' | 'instagram_story';

interface Portfolio {
  id: string;
  title: string;
  image_url?: string;
  city?: string;
  district?: string;
  price?: number;
  room_count?: string;
  net_m2?: number;
  gross_m2?: number;
  details?: {
    city?: string;
    district?: string;
    price?: number;
    room_count?: string;
    net_m2?: number;
    gross_m2?: number;
  }
}

const FORMATS: { id: FormatType; label: string; icon: any }[] = [
  { id: 'instagram_post', label: 'Post (4:5)', icon: Instagram },
  { id: 'instagram_story', label: 'Story (9:16)', icon: Smartphone },
];

export default function ImageGenPage() {
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{image: string | null, caption: string | null}>({ image: null, caption: null });
  const [copied, setCopied] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('instagram_post');
  const [prompt, setPrompt] = useState("");

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function initData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('portfolios').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setPortfolios(data);
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

  const handleCopy = () => {
    if (result.caption) {
      navigator.clipboard.writeText(result.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- GÜNCELLENEN GENERATE FONKSİYONU ---
  // --- DÜZELTİLMİŞ GENERATE FONKSİYONU ---
  const handleGenerate = async () => {
    // 1. Validasyonlar
    if (!selectedPortfolio) return alert("Lütfen sol listeden bir portföy seçiniz.");
    if (!uploadedImage) return alert("Lütfen portföye ait bir görsel yükleyiniz (Zorunlu).");

    setLoading(true);
    setResult({ image: null, caption: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum süresi dolmuş.");

      // 2. Görseli Supabase Storage'a Yükle
      const fileExt = uploadedImage.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('temp-uploads')
        .upload(filePath, uploadedImage, {
           cacheControl: '3600',
           upsert: false
        });

      if (uploadError) {
        throw new Error("Görsel yüklenirken hata oluştu: " + uploadError.message);
      }

      // 3. Yüklenen Görselin Public URL'ini Al
      const { data: { publicUrl } } = supabase.storage
        .from('temp-uploads')
        .getPublicUrl(filePath);

      if (!publicUrl) throw new Error("Görsel bağlantısı oluşturulamadı.");

      // 4. Verileri Hazırla
      const p = selectedPortfolio;
      const city = p.city || p.details?.city || "";
      const district = p.district || p.details?.district || "";
      const price = p.price || p.details?.price || 0;
      const room = p.room_count || p.details?.room_count || "";
      const net = p.net_m2 || p.details?.net_m2 || 0;
      const gross = p.gross_m2 || p.details?.gross_m2 || 0;

      const payload = {
        user_id: user.id,
        mode: "socialPost",
        portfolio: {
          id: p.id,
          title: p.title,
          city: city,
          district: district,
          price: price,
          room_count: room,
          net_m2: net,
          gross_m2: gross
        },
        image_url: publicUrl,
        output_format: selectedFormat === 'instagram_story' ? 'post_4_5' : 'post_4_5',
        prompt: prompt || "Sağ üst köşeye 'Fırsat' etiketi koy, fiyatı büyük yaz."
      };

      // 5. Webhook'a Gönder
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_SOCIAL;
      if (!webhookUrl) throw new Error("Webhook URL eksik.");

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Yapay zeka yanıt vermedi.");

      // --- DÜZELTME BURADA BAŞLIYOR ---
      const rawData = await response.json();
      console.log("Webhook Ham Yanıt:", rawData); // Konsoldan kontrol etmek için

      // n8n bazen Array ([...]) bazen Object ({...}) dönebilir.
      // Eğer Array ise ilk elemanı al, değilse kendisini al.
      const data = Array.isArray(rawData) ? rawData[0] : rawData;

      if (data.status === 'success' && data.image_url) {
        
        // Açıklama null gelirse biz oluşturalım (Fallback Caption)
        const fallbackCaption = `🏡 ${p.title}\n\n📍 ${district}/${city}\n💰 ${price?.toLocaleString()} ₺\n📐 ${room} | ${net}m²\n\nDetaylı bilgi için DM atın! 👇\n\n#emlak #${city?.toLowerCase()} #satılık`;

        setResult({
          image: data.image_url,
          caption: data.description || fallbackCaption
        });

        // 6. Kullanım Sayacını Artır
        const { data: profile } = await supabase.from('profiles').select('social_ui_used').eq('id', user.id).single();
        if (profile) {
           await supabase.from('profiles').update({ social_ui_used: (profile.social_ui_used || 0) + 1 }).eq('id', user.id);
        }
      } else {
        throw new Error("Görsel oluşturma başarısız oldu veya veri formatı hatalı.");
      }

    } catch (error: any) {
      console.error(error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
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
              <span className="text-white font-semibold">Portföy Postu</span>
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
                            <span>{p.city || p.details?.city}</span>
                            <span className="separator">•</span>
                            <span className="price">{(p.price || p.details?.price)?.toLocaleString()} ₺</span>
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
                    <Loader2 size={50} className="animate-spin text-purple-500" />
                    <p>Yapay Zeka Tasarlıyor...</p>
                  </div>
                </motion.div>
              ) : result.image ? (
                // SONUÇ EKRANI
                <motion.div key="result" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="canvas-state result w-full h-full flex flex-col">
                  <div className={`result-frame flex-1 flex items-center justify-center overflow-hidden p-4`}>
                     <img src={result.image} alt="AI Result" className={`result-img ${selectedFormat === 'instagram_story' ? 'story' : 'post'}`}/>
                  </div>
                  <div className="px-6 mb-2 w-full">
                     <div className="caption-box">
                        <div className="cap-header">
                           <span className="title"><Instagram size={12}/> Açıklama</span>
                           <button onClick={handleCopy} className="copy-btn">
                              {copied ? <Check size={12} className="text-green-400"/> : <Copy size={12}/>}
                              {copied ? 'Kopyalandı' : 'Kopyala'}
                           </button>
                        </div>
                        <p className="cap-text custom-scrollbar">{result.caption}</p>
                     </div>
                  </div>
                  <div className="result-actions">
                    <button onClick={() => setResult({image: null, caption: null})} className="action-btn glass">
                      <RefreshCcw size={18}/> <span className="text">Yeniden</span>
                    </button>
                    <a href={result.image} download target="_blank" className="action-btn primary">
                      <Download size={18}/> <span className="text">İndir</span>
                    </a>
                  </div>
                </motion.div>
              ) : (
                // UPLOAD EKRANI
                <motion.div key="upload" initial={{opacity:0}} animate={{opacity:1}} className="canvas-state upload">
                  <div className={`drop-zone ${imagePreview ? 'filled' : ''}`}>
                    {imagePreview ? (
                      <div className="preview-container">
                        <img src={imagePreview} className="preview-img" />
                        
                        {/* BUTONLAR */}
                        <div className="preview-actions">
                            <button onClick={handleClearImage} className="btn-remove" title="Görseli Kaldır">
                                <X size={18} />
                            </button>

                            <label htmlFor="change-image-input" className="btn-change">
                                <Edit size={14}/> Görseli Değiştir
                            </label>
                            
                            <input id="change-image-input" type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        </div>
                      </div>
                    ) : (
                      <label className="upload-label">
                        <div className="icon-pulse mb-4">
                          <UploadCloud size={48} className="icon-main"/>
                        </div>
                        <h3>Görsel Yükle</h3>
                        <p>{selectedPortfolio ? "Seçilen portföy için fotoğraf yükleyin." : "Önce sol taraftan bir portföy seçin."}</p>
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
              <div className="control-section flex-1">
                <label className="flex justify-between">Yapay Zeka Talimatı<span className="badge-opt">Opsiyonel</span></label>
                <div className="chat-box">
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Örn: Sağ üst köşeye 'Fırsat' etiketi koy..." />
                  <div className="chat-footer"><Sparkles size={14}/><span>AI Assistant Hazır</span></div>
                </div>
              </div>
            </div>
            <div className="box-footer">
              <button 
                onClick={handleGenerate} 
                disabled={loading || !selectedPortfolio || !imagePreview}
                className={`generate-btn-v2 ${(!selectedPortfolio || !imagePreview) ? 'disabled' : ''}`}
              >
                <div className="btn-bg"></div>
                <span className="relative flex items-center gap-2">
                  {loading ? <Loader2 size={20} className="animate-spin"/> : <Zap size={20} fill="currentColor"/>}
                  {loading ? 'Sihir Yapılıyor...' : 'Görseli Oluştur'}
                </span>
              </button>
              <p className="credit-sub">1 Kredi • Yaklaşık 15sn</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}