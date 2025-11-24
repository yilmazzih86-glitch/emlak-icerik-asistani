"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  UploadCloud, Sparkles, Download, AlertCircle, 
  Loader2, MoveRight, ImagePlus, X 
} from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";

// --- SONUÇ SLIDER BİLEŞENİ ---
function ResultSlider({ original, enhanced }: { original: string, enhanced: string }) {
  const x = useMotionValue(0.5); 
  const widthPercentage = useTransform(x, value => `${value * 100}%`);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="compare-slider" ref={containerRef}>
      {/* Sonrası (Alt Katman - Tam Boyut) */}
      <div className="layer after">
        <img src={enhanced} alt="Enhanced" />
        <div className="label-badge right">SONRASI (4K)</div>
      </div>
      
      {/* Öncesi (Üst Katman - Maskelenmiş) */}
      <motion.div 
        className="layer before" 
        style={{ width: widthPercentage }}
      >
         <img src={original} alt="Original" />
         <div className="label-badge left">ÖNCESİ</div>
      </motion.div>

      {/* Tutaç (Handle) */}
      <motion.div className="slider-handle"
        style={{ left: widthPercentage }}
        drag="x" dragConstraints={containerRef} dragElastic={0} dragMomentum={false}
        onDrag={(e, info) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newX = (info.point.x - rect.left) / rect.width;
            x.set(Math.max(0, Math.min(1, newX)));
        }}
      >
        <div className="handle-circle">
          <MoveRight size={18} />
        </div>
      </motion.div>
    </div>
  );
}

export default function EnhancerPage() {
  const supabase = createClient();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("Dosya boyutu 10MB'dan küçük olmalıdır.");
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setEnhancedUrl(null);
      setError(null);
    }
  };

  // page.tsx içindeki handleEnhance fonksiyonunu bu şekilde güncelle:

const handleEnhance = async () => {
    if (!image || !preview) return;
    setLoading(true);
    setError(null);

    try {
      // ... (Auth ve Kredi işlemleri aynı kalıyor) ...
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum açmalısınız.");

      const { data: creditSuccess, error: creditError } = await supabase.rpc('deduct_credit', { 
        row_id: user.id, amount: 1, credit_type: 'image' 
      });
      if (creditError || creditSuccess === false) throw new Error("Yetersiz Görsel Kredisi!");

      // ... (Upload işlemleri aynı kalıyor) ...
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('temp-uploads').upload(fileName, image);
      if (uploadError) throw new Error("Resim yüklenemedi.");
      const { data: { publicUrl } } = supabase.storage.from('temp-uploads').getPublicUrl(fileName);

      // Webhook Çağrısı
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_ENHANCER_WEBHOOK;
      
      const response = await fetch(webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: publicUrl, userId: user.id })
      });

      if (!response.ok) {
         // Eğer hata varsa (örneğin 500), text olarak okuyup hatayı görelim
         const errText = await response.text();
         throw new Error(`Servis hatası: ${errText.substring(0, 50)}...`);
      }
      
      // --- DEĞİŞİKLİK BURADA: ARTIK BLOB BEKLİYORUZ ---
      
      // Binary (Dosya) olarak gelen veriyi al
      const imageBlob = await response.blob();
      
      // Eğer gelen veri çok küçükse (örn: 1kb altı) muhtemelen hata mesajıdır
      if (imageBlob.size < 1000) {
          throw new Error("Gelen dosya bozuk veya hatalı.");
      }

      // Blob'u tarayıcı URL'ine çevir
      const localImageUrl = URL.createObjectURL(imageBlob);
      setEnhancedUrl(localImageUrl);

      // --- DEĞİŞİKLİK BİTTİ ---

    } catch (err: any) {
      console.error("Enhance Error:", err);
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // page.tsx içindeki handleDownload fonksiyonunu bu şekilde güncelle:

const handleDownload = () => {
  if (!enhancedUrl) return;
  
  try {
    const link = document.createElement('a');
    link.href = enhancedUrl; // Base64 URL zaten buradadır
    link.download = `enhanced-spektrum-${Date.now()}.png`; // Dosya adı
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error("İndirme hatası:", e);
    window.open(enhancedUrl, '_blank');
  }
};

  return (
    <div className="enhancer-page animate-in fade-in">
      
      {/* Header */}
      <div className="enhancer-header">
        <div className="icon-box">
          <Sparkles size={32} />
        </div>
        <h1>AI Görsel <span className="highlight">İyileştirme</span></h1>
        <p>Bulanık fotoğrafları saniyeler içinde 4K stüdyo kalitesine yükseltin.</p>
      </div>

      {/* Main Work Area */}
      <div className="enhancer-workspace">
        
        {/* Arka Plan Efektleri */}
        <div className="glow-bg purple"></div>
        <div className="glow-bg orange"></div>

        {/* --- STATE 1: UPLOAD --- */}
        {!enhancedUrl && !loading && (
          <div className="upload-section">
            
            {preview ? (
              <div className="preview-box">
                <img src={preview} alt="Preview" />
                <button onClick={() => {setPreview(null); setImage(null); setError(null)}} className="btn-close">
                  <X size={18}/>
                </button>
              </div>
            ) : (
              <label className="dropzone">
                <div className="icon-circle">
                  <UploadCloud size={40} />
                </div>
                <span className="title">Fotoğrafı Buraya Sürükleyin</span>
                <span className="subtitle">veya dosya seçmek için tıklayın (JPG, PNG)</span>
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </label>
            )}

            {error && (
              <div className="error-message">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <button 
              onClick={handleEnhance} 
              disabled={!image}
              className={`btn-action ${!image ? 'disabled' : ''}`}
            >
              <Sparkles size={20} /> 
              {image ? "Fotoğrafı 4K Kalitesine Yükselt" : "Lütfen Bir Fotoğraf Seçin"}
            </button>
          </div>
        )}

        {/* --- STATE 2: LOADING --- */}
        {loading && (
          <div className="loading-section">
            <div className="spinner-wrapper">
              <div className="spinner-border"></div>
              <div className="spinner-icon"><Sparkles size={40} /></div>
            </div>
            <h3>Yapay Zeka Çalışıyor</h3>
            <p>Pikseller yeniden işleniyor, lütfen bekleyin.</p>
          </div>
        )}

        {/* --- STATE 3: SONUÇ --- */}
        {enhancedUrl && preview && !loading && (
          <div className="result-section animate-in zoom-in">
            <div className="slider-wrapper">
              <ResultSlider original={preview} enhanced={enhancedUrl} />
            </div>

            <div className="action-buttons">
              <button onClick={() => {setEnhancedUrl(null); setPreview(null); setImage(null)}} className="btn-secondary">
                <ImagePlus size={18} /> Yeni İşlem
              </button>
              <button onClick={handleDownload} className="btn-primary">
                <Download size={18} /> İndir (4K)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}