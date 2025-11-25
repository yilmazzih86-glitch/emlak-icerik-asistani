"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutTemplate, Image as ImageIcon, Type, 
  UploadCloud, X, Sparkles, Loader2, 
  Smartphone, Instagram, RefreshCcw, Download, Send, 
  Wand2, CheckCircle2, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Portfolio } from "@/types";

// --- TİP TANIMLARI ---
type GenMode = 'socialPost' | 'imageToImage' | 'textToImage';
type FormatType = 'instagram_post' | 'instagram_story';
type StylePreset = 'lux' | 'minimal' | 'clean' | 'family' | 'investment';

const STYLES: { id: StylePreset; label: string; color: string; img: string }[] = [
  { id: 'lux', label: 'Lüks & Premium', color: '#fbbf24', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=150&q=80' }, 
  { id: 'minimal', label: 'Minimalist', color: '#e5e7eb', img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=150&q=80' }, 
  { id: 'clean', label: 'Kurumsal', color: '#3b82f6', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&q=80' }, 
  { id: 'family', label: 'Sıcak Yuva', color: '#f97316', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=150&q=80' }, 
  { id: 'investment', label: 'Yatırım', color: '#10b981', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&q=80' }, 
];

const FORMATS: { id: FormatType; label: string; icon: any }[] = [
  { id: 'instagram_post', label: 'Post (4:5)', icon: Instagram },
  { id: 'instagram_story', label: 'Story (9:16)', icon: Smartphone },
];

export default function ImageGenPage() {
  const supabase = createClient();
  
  const [mode, setMode] = useState<GenMode>('socialPost');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>('lux');
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('instagram_post');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

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
      setGeneratedImage(null);
    }
  };

  const handleGenerate = async () => {
    if (mode === 'socialPost' && !selectedPortfolio) return alert("Lütfen bir portföy seçin.");
    if (mode === 'imageToImage' && !uploadedImage) return alert("Lütfen bir görsel yükleyin.");
    
    setLoading(true);
    setTimeout(() => {
      setGeneratedImage("https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop");
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="premium-gen-container">
      
      {/* ARKA PLAN EFEKTİ */}
      <div className="ambient-glow purple"></div>
      <div className="ambient-glow orange"></div>
      <div className="grid-pattern"></div>

      {/* --- 1. ÜST NAVİGASYON (Floating Island) --- */}
      <div className="nav-island-wrapper">
        <div className="nav-island">
          {[
            { id: 'socialPost', label: 'Portföy Postu', icon: LayoutTemplate },
            { id: 'imageToImage', label: 'Görsel Düzenle', icon: Wand2 },
            { id: 'textToImage', label: 'Metinden Üret', icon: Type },
          ].map((m) => {
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id as GenMode); setGeneratedImage(null); }}
                className={`nav-btn ${isActive ? 'active' : ''}`}
              >
                {isActive && (
                  <motion.div layoutId="nav-indicator" className="active-bg" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="z-10 flex items-center gap-2 relative">
                  <m.icon size={16} className={isActive ? "text-white" : "text-gray-400"} />
                  <span className={isActive ? "text-white font-semibold" : "text-gray-400"}>{m.label}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* --- 2. ANA SAHNE (3 KOLON) --- */}
      <div className="stage-grid">
        
        {/* SOL PANEL: GİRDİLER */}
        <motion.div initial={{x: -50, opacity: 0}} animate={{x: 0, opacity: 1}} className="side-panel left">
          <div className="glass-box h-full flex flex-col">
            <div className="box-header">
              <h3>{mode === 'socialPost' ? 'Portföy Seçimi' : 'Stil Stüdyosu'}</h3>
              <div className="header-line"></div>
            </div>
            
            <div className="box-content custom-scrollbar">
              {mode === 'socialPost' ? (
                portfolios.length > 0 ? (
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
                            <span>{p.details.city}</span>
                            <span className="separator">•</span>
                            <span className="price">{p.details.price?.toLocaleString()} ₺</span>
                          </div>
                        </div>
                        {selectedPortfolio?.id === p.id && <CheckCircle2 size={18} className="check-icon"/>}
                      </div>
                    ))}
                  </div>
                ) : <div className="empty-text">Henüz portföy yok.</div>
              ) : (
                <div className="style-grid-v2">
                  {STYLES.map((s) => (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedStyle(s.id)} 
                      className={`style-tile ${selectedStyle === s.id ? 'selected' : ''}`}
                    >
                      <div className="tile-bg" style={{backgroundImage: `url(${s.img})`}}></div>
                      <div className="tile-overlay"></div>
                      <span className="tile-label">{s.label}</span>
                      {selectedStyle === s.id && <div className="tile-border" style={{borderColor: s.color}}></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ORTA PANEL: TUVAL (CANVAS) */}
        <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{delay: 0.1}} className="center-stage">
          <div className="canvas-wrapper glass-box">
            
            {/* Canvas Arka Planı */}
            <div className="canvas-dots"></div>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="canvas-state loading">
                  <div className="scanner-line"></div>
                  <div className="loading-content">
                    <Loader2 size={50} className="animate-spin text-purple-500" />
                    <p>Pikseller İşleniyor...</p>
                  </div>
                </motion.div>
              ) : generatedImage ? (
                <motion.div key="result" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="canvas-state result">
                  <div className={`result-frame ${selectedFormat === 'instagram_story' ? 'story' : 'post'}`}>
                    <img src={generatedImage} alt="AI Result" />
                  </div>
                  <div className="floating-actions">
                    <button onClick={() => setGeneratedImage(null)} className="action-btn glass">
                      <RefreshCcw size={18}/> <span className="text">Yeniden</span>
                    </button>
                    <a href={generatedImage} download className="action-btn primary">
                      <Download size={18}/> <span className="text">İndir</span>
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="upload" initial={{opacity:0}} animate={{opacity:1}} className="canvas-state upload">
                  {(mode === 'socialPost' || mode === 'imageToImage') ? (
                    <div className={`drop-zone ${imagePreview ? 'filled' : ''}`}>
                      {imagePreview ? (
                        <div className="preview-img">
                          <img src={imagePreview} />
                          <button onClick={() => {setUploadedImage(null); setImagePreview(null)}} className="close-btn"><X/></button>
                        </div>
                      ) : (
                        <label>
                          <div className="icon-pulse">
                            <UploadCloud size={40} />
                          </div>
                          <h3>Görseli Buraya Bırakın</h3>
                          <p>{mode === 'socialPost' ? 'İsteğe bağlı: Evin fotoğrafını ekle' : 'Düzenlenecek görseli seç'}</p>
                          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>
                  ) : (
                    <div className="text-mode-visual">
                      <div className="glowing-icon"><Type size={64}/></div>
                      <h3>Hayal Et ve Yaz</h3>
                      <p>Sağ paneldeki alana aklındakini yaz,<br/>AI senin için çizsin.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* SAĞ PANEL: KONTROL */}
        <motion.div initial={{x: 50, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{delay: 0.2}} className="side-panel right">
          <div className="glass-box h-full flex flex-col">
            <div className="box-header">
              <h3>Kontrol Merkezi</h3>
              <div className="header-line"></div>
            </div>

            <div className="box-content custom-scrollbar">
              
              {/* FORMAT SEÇİCİ */}
              <div className="control-section">
                <label>Çıktı Formatı</label>
                <div className="format-toggles">
                  {FORMATS.map((f) => (
                    <button 
                      key={f.id} 
                      onClick={() => setSelectedFormat(f.id)}
                      className={`fmt-btn ${selectedFormat === f.id ? 'active' : ''}`}
                    >
                      <f.icon size={18} />
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CHAT ALANI */}
              <div className="control-section flex-1">
                <label className="flex justify-between">
                  Yapay Zeka Talimatı
                  <span className="badge-opt">{mode === 'socialPost' ? 'Opsiyonel' : 'Gerekli'}</span>
                </label>
                <div className="chat-box">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      mode === 'socialPost' ? "Örn: Sağ üst köşeye 'Fırsat' etiketi koy, fiyatı büyük yaz." :
                      "Örn: Modern, havuzlu, gün batımında bir villa görseli..."
                    }
                  />
                  <div className="chat-footer">
                    <Sparkles size={14} className="text-purple-400 animate-pulse"/>
                    <span>AI Assistant Hazır</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ÜRET BUTONU */}
            <div className="box-footer">
              <button 
                onClick={handleGenerate} 
                disabled={loading || (mode === 'socialPost' && !selectedPortfolio)}
                className="generate-btn-v2"
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