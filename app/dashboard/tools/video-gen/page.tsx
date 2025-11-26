"use client";

import { useState } from "react";
import { 
  Video, Sparkles, Clapperboard, Loader2, 
  Download, PlayCircle, Settings2, Clock, Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Video Stilleri
const VIDEO_STYLES = [
  { id: 'cinematic', label: 'Sinematik', color: '#f97316' },
  { id: 'drone', label: 'Drone Çekimi', color: '#3b82f6' },
  { id: 'tour', label: 'Ev Turu', color: '#10b981' },
  { id: 'luxury', label: 'Lüks Tanıtım', color: '#8b5cf6' },
];

// En Boy Oranları
const ASPECT_RATIOS = [
  { id: '16:9', label: 'Yatay (YouTube)', icon: Monitor },
  { id: '9:16', label: 'Dikey (Reels/TikTok)', icon: Settings2 }, // İkonu temsilidir
];

export default function VideoGenPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(15); // Saniye
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return alert("Lütfen bir video senaryosu veya prompt girin.");
    
    setGenerating(true);
    setVideoUrl(null);

    // --- SİMÜLASYON (API Yerine) ---
    setTimeout(() => {
      // Örnek bir video URL'i (Pexels veya benzeri telifsiz bir kaynak)
      setVideoUrl("https://videos.pexels.com/video-files/7578546/7578546-uhd_2560_1440_30fps.mp4"); 
      setGenerating(false);
    }, 4000); // 4 saniye bekleme süresi
  };

  return (
    <div className="video-gen-page animate-in fade-in">
      
      {/* HEADER */}
      <div className="page-header">
        <div className="icon-box purple">
          <Video size={28} />
        </div>
        <div>
          <h1>Sora AI <span className="highlight">Video Stüdyosu</span></h1>
          <p>Metinlerinizi saniyeler içinde ultra gerçekçi emlak videolarına dönüştürün.</p>
        </div>
      </div>

      <div className="studio-grid">
        
        {/* --- SOL PANEL: KONTROL MERKEZİ --- */}
        <div className="glass-panel control-panel">
          
          <div className="panel-section">
            <h3><Sparkles size={16} className="text-purple-400"/> Prompt / Senaryo</h3>
            <div className="input-wrapper">
              <textarea 
                placeholder="Örn: Modern, havuzlu bir villanın gün batımındaki drone çekimi. Sinematik ışıklandırma, 4K kalite..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="prompt-area custom-scrollbar"
              />
              <span className="char-count">{prompt.length} / 500</span>
            </div>
          </div>

          <div className="panel-section">
            <h3>Stil Seçimi</h3>
            <div className="style-grid">
              {VIDEO_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`style-btn ${selectedStyle === s.id ? 'active' : ''}`}
                  style={{ '--active-color': s.color } as any}
                >
                  <div className="dot" style={{ background: s.color }}></div>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section flex-row">
            <div className="setting-group">
              <label><Monitor size={14}/> Format</label>
              <div className="toggle-group">
                {ASPECT_RATIOS.map((r) => (
                  <button 
                    key={r.id} 
                    onClick={() => setAspectRatio(r.id)}
                    className={aspectRatio === r.id ? 'active' : ''}
                  >
                    {r.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-group">
              <label><Clock size={14}/> Süre</label>
              <div className="toggle-group">
                <button onClick={() => setDuration(15)} className={duration === 15 ? 'active' : ''}>15s</button>
                <button onClick={() => setDuration(30)} className={duration === 30 ? 'active' : ''}>30s</button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={generating || !prompt}
            className="btn-generate-primary"
          >
            {generating ? (
              <><Loader2 size={20} className="animate-spin"/> Oluşturuluyor...</>
            ) : (
              <><Clapperboard size={20}/> Videoyu Oluştur</>
            )}
          </button>

        </div>

        {/* --- SAĞ PANEL: VİDEO PLAYER --- */}
        <div className="glass-panel preview-panel">
          
          <div className={`video-frame aspect-${aspectRatio.replace(':','-')}`}>
            <AnimatePresence mode="wait">
              
              {/* DURUM 1: BOŞ */}
              {!videoUrl && !generating && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="empty-state"
                >
                  <div className="icon-circle"><PlayCircle size={48}/></div>
                  <h3>Henüz Video Yok</h3>
                  <p>Sol taraftan detayları girip "Videoyu Oluştur" butonuna basın.</p>
                </motion.div>
              )}

              {/* DURUM 2: YÜKLENİYOR */}
              {generating && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="loading-state"
                >
                  <div className="loader-visual">
                    <span className="bar"></span><span className="bar"></span><span className="bar"></span>
                  </div>
                  <h3>Sahneler Renderlanıyor...</h3>
                  <p>Yapay zeka pikselleri işliyor, lütfen bekleyin.</p>
                </motion.div>
              )}

              {/* DURUM 3: VİDEO HAZIR */}
              {videoUrl && !generating && (
                <motion.div 
                  key="video"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="video-wrapper"
                >
                  <video src={videoUrl} controls autoPlay loop className="main-video" />
                  
                  <div className="video-actions">
                    <button className="btn-action">
                      <Download size={18}/> İndir
                    </button>
                    <div className="badge-hd">4K ULTRA HD</div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}