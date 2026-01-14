"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  UploadCloud, Sparkles, Download, AlertCircle, 
  Loader2, MoveRight, ImagePlus, X, CheckCircle2 
} from "lucide-react";
// Slider animasyonlarını kaldırdık, sadece giriş animasyonu için motion kalsın
import { motion } from "framer-motion";

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

  const handleEnhance = async () => {
    if (!image || !preview) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Oturum Kontrolü
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum açmalısınız.");

      // 2. Kredi Kontrolü
      // 2. Kredi Kontrolü (Image AI Kredisi)
      // Yeni SQL fonksiyonumuzu (use_image_ai_credit) kullanıyoruz.
      const { data: success, error: rpcError } = await supabase.rpc('use_image_ai_credit', { 
        p_user_id: user.id 
      });

      if (rpcError) throw rpcError;
      
      if (!success) {
        throw new Error("Yetersiz Görsel İyileştirme Kredisi! Paket limitinize ulaştınız.");
      }

      // 3. Dosya Yükleme
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('temp-uploads').upload(fileName, image);
      if (uploadError) throw new Error("Resim yüklenemedi.");
      const { data: { publicUrl } } = supabase.storage.from('temp-uploads').getPublicUrl(fileName);

      // 4. Webhook Çağrısı (n8n)
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_ENHANCER_WEBHOOK;
      
      // --- DÜZELTME BURADA YAPILDI (constKZresponse -> const response) ---
      const response = await fetch(webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: publicUrl, userId: user.id })
      });

      if (!response.ok) {
         const errText = await response.text();
         throw new Error(`Servis hatası: ${errText.substring(0, 50)}...`);
      }
      
      // 5. Sonucu Alma (Blob)
      const imageBlob = await response.blob();
      if (imageBlob.size < 1000) throw new Error("Gelen dosya bozuk veya hatalı.");

      const localImageUrl = URL.createObjectURL(imageBlob);
      setEnhancedUrl(localImageUrl);

    } catch (err: any) {
      console.error("Enhance Error:", err);
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedUrl) return;
    try {
      const link = document.createElement('a');
      link.href = enhancedUrl;
      link.download = `enhanced-spektrum-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
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
        <p>Bulanık fotoğrafları saniyeler içinde iyileştirin. Şuanda BETA aşamasındadır.</p>
      </div>

      {/* Main Work Area */}
      <div className="enhancer-workspace">
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

        {/* --- STATE 3: SONUÇ (YENİ YAN YANA GÖRÜNÜM) --- */}
        {enhancedUrl && preview && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="result-view"
          >
            {/* Görsel Izgarası */}
            <div className="comparison-grid">
              
              {/* Sol: Orijinal */}
              <div className="image-card">
                <div className="card-badge">ÖNCESİ</div>
                <div className="img-wrapper">
                  <img src={preview} alt="Original" />
                </div>
              </div>

              {/* Orta: Ok İkonu */}
              <div className="divider-arrow">
                <div className="arrow-circle">
                  <MoveRight size={24} />
                </div>
              </div>

              {/* Sağ: İyileştirilmiş */}
              <div className="image-card after">
                <div className="shine-effect"></div>
                <div className="card-badge success">SONRASI (4K)</div>
                <div className="img-wrapper">
                  <img src={enhancedUrl} alt="Enhanced" />
                </div>
                <div className="success-indicator">
                  <CheckCircle2 size={16} /> İşlem Başarılı
                </div>
              </div>

            </div>

            {/* Aksiyon Butonları */}
            <div className="result-actions">
              <button onClick={() => {setEnhancedUrl(null); setPreview(null); setImage(null)}} className="btn-secondary">
                <ImagePlus size={18} /> Yeni Yükle
              </button>
              <button onClick={handleDownload} className="btn-primary glow-btn">
                <Download size={18} /> İndir (HD)
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}