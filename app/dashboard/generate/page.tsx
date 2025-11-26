"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Loader2, ArrowRight, ArrowLeft, Sparkles, 
  Building, DollarSign, Ruler, Layers, 
  Thermometer, Hash, Check, Globe, Target, MessageSquare, FileText, MapPin, Home
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PortfolioDetails } from "@/types";

// --- TURKEY DATA ENTEGRASYONU ---
import { 
  getCities, 
  getDistrictsByCityCode, 
  getNeighbourhoodsByCityCodeAndDistrict 
} from "turkey-neighbourhoods";

const ROOM_COUNTS = ["1+0", "1+1", "2+1", "3+1", "3+2", "4+1", "4+2", "Villa"];
const HEATING_TYPES = ["Kombi (Doğalgaz)", "Merkezi", "Yerden Isıtma", "Klima", "Yok"];
const PROPERTY_TYPES = ["Satılık Daire", "Kiralık Daire", "Satılık Villa", "Satılık İşyeri", "Satılık Arsa"];
const LANGUAGES = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
];

const LOADING_MESSAGES = [
  "Konum verileri ve bölge analizi yapılıyor...",
  "Emlak özellikleri taranıyor...",
  "Hedef kitleye uygun pazarlama dili oluşturuluyor...",
  "SEO uyumlu anahtar kelimeler seçiliyor...",
  "Yapay zeka taslağı son haline getiriyor..."
];

export default function GeneratePage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState<PortfolioDetails>({
    city: "",
    district: "",
    neighborhood: "",
    listingNo: "",
    propertyType: "Satılık Daire",
    price: null,
    grossM2: 0,
    netM2: 0,
    roomCount: "3+1",
    floor: "",
    heating: "Kombi (Doğalgaz)",
    site: "Hayır",
    parking: "Hayır",
    credit: "Evet",
    marketing: {
      target: "Aile",
      tone: "Profesyonel",
      language: "tr",
      highlights: "",
      notes: ""
    }
  });

  // Loading Mesaj Döngüsü
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    } else {
      setLoadingMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // --- DİNAMİK LOKASYON ---
  const allCities = useMemo(() => getCities(), []);

  const selectedCityCode = useMemo(() => {
    return allCities.find(c => c.name === formData.city)?.code || "";
  }, [formData.city, allCities]);

  const districtOptions = useMemo(() => {
    if (!selectedCityCode) return [];
    return getDistrictsByCityCode(selectedCityCode);
  }, [selectedCityCode]);

  const neighborhoodOptions = useMemo(() => {
    if (!selectedCityCode || !formData.district) return [];
    return getNeighbourhoodsByCityCodeAndDistrict(selectedCityCode, formData.district);
  }, [selectedCityCode, formData.district]);


  const handleChange = (key: keyof PortfolioDetails, value: any) => {
    setFormData((prev) => {
      if (key === 'city') return { ...prev, city: value, district: "", neighborhood: "" };
      if (key === 'district') return { ...prev, district: value, neighborhood: "" };
      return { ...prev, [key]: value };
    });
    if (errors.length > 0) setErrors([]);
  };

  const handleMarketingChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, marketing: { ...prev.marketing!, [key]: value } }));
  };

  const validateStep = (currentStep: number) => {
    const newErrors: string[] = [];
    if (currentStep === 1) {
      if (!formData.city) newErrors.push("İl seçimi zorunludur.");
      if (!formData.district) newErrors.push("İlçe seçimi zorunludur.");
      if (!formData.neighborhood) newErrors.push("Mahalle seçimi zorunludur.");
      if (!formData.price) newErrors.push("Fiyat zorunludur.");
    }
    if (currentStep === 2) {
      if (!formData.grossM2) newErrors.push("Brüt m² zorunludur.");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(step + 1); };
  const prevStep = () => setStep(step - 1);

  // --- FORM GÖNDERİMİ (DOĞRUDAN n8n BAĞLANTISI) ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum bulunamadı");

      // 1. Kredi Kontrolü ve Düşümü
      const { data: creditSuccess, error: rpcError } = await supabase.rpc('deduct_credit', { row_id: user.id, amount: 1 });
      
      if (rpcError) throw rpcError;
      if (!creditSuccess) { 
        alert("Yetersiz Kredi! Lütfen paket yükseltin."); 
        setLoading(false); 
        return; 
      }

      const webhookPayload = {
        ...formData,
        userId: user.id,
        requestTime: new Date().toISOString()
      };

      // 2. n8n Webhook Çağrısı (Doğrudan NEXT_PUBLIC_ Değişkeni İle)
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error("Webhook URL tanımlanmamış! (.env dosyasını kontrol edin)");
      }

      const n8nResponse = await fetch(webhookUrl, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });

      if (!n8nResponse.ok) {
        // Olası bir hatada mesajı okumaya çalışalım
        const errText = await n8nResponse.text();
        throw new Error(`AI Servisi yanıt vermedi. (${n8nResponse.status}: ${errText})`);
      }
      
      const n8nData = await n8nResponse.json();

      // 3. Sonucu Veritabanına Kaydetme
      const { data, error } = await supabase.from("portfolios").insert({
          user_id: user.id,
          title: `${formData.city} ${formData.district} ${formData.roomCount} Fırsatı`,
          details: formData,
          // n8n çıktısının yapısına göre burayı "contents" veya "output" olarak alıyoruz
          ai_output: n8nData.contents || n8nData.output, 
          status: "active",
      }).select().single();

      if (error) throw error;
      
      // 4. Detay Sayfasına Yönlendirme
      router.push(`/dashboard/portfolios/${data.id}`);

    } catch (error: any) {
      console.error("İşlem Hatası:", error);
      alert("Hata: " + (error.message || "Beklenmedik bir hata oluştu."));
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="page-container">
      
      {/* --- PREMIUM LOADING OVERLAY --- */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="loading-overlay"
          >
            <div className="loading-spinner-wrapper">
              <div className="spinner-ring"></div>
              <div className="spinner-core"><Sparkles className="icon-pulse" /></div>
            </div>
            
            <h2 className="loading-title">İçerik Üretiliyor</h2>
            <motion.p 
              key={loadingMsgIndex}
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              className="loading-message"
            >
              {LOADING_MESSAGES[loadingMsgIndex]}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="header-section">
        <div className="badge">AI Power</div>
        <h1 className="main-title">İçerik Sihirbazı</h1>
        <p className="sub-title">Mülkünüzün detaylarını girin, yapay zekamız profesyonel metni hazırlasın.</p>
      </div>

      {/* WIZARD PROGRESS */}
      <div className="wizard-container">
        <div className="wizard-line-bg"></div>
        <motion.div 
          className="wizard-line-active"
          initial={{ width: "0%" }}
          animate={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        ></motion.div>

        {[
          { id: 1, label: "Konum", icon: MapPin },
          { id: 2, label: "Özellikler", icon: Home },
          { id: 3, label: "Pazarlama", icon: Target }
        ].map((item) => (
          <div key={item.id} className={`wizard-step ${step >= item.id ? 'active' : ''}`}>
             <div className="step-icon-wrapper">
               <item.icon size={20} />
             </div>
             <span className="step-label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* MAIN FORM PANEL */}
      <div className="glass-panel">
        
        {/* Arkaplan Dekoratif Işıklar */}
        <div className="glow-orb purple"></div>
        <div className="glow-orb blue"></div>

        {errors.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-box">
            <div className="error-line"></div>
            <div className="error-content">
               <p>Eksik Bilgiler Var:</p>
               <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* --- ADIM 1: KONUM --- */}
          {step === 1 && (
            <motion.div key="step1" className="form-step" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{duration: 0.4}}>
              <div className="form-grid">
                
                <div className="input-group full-width">
                  <label>İlan Başlığı / Referans</label>
                  <div className="input-wrapper">
                    <Hash size={18} className="input-icon" />
                    <input 
                      type="text" 
                      className="form-input with-icon" 
                      placeholder="Örn: #12345 - Sahile Yakın" 
                      value={formData.listingNo} 
                      onChange={(e) => handleChange("listingNo", e.target.value)} 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>İl *</label>
                  <div className="input-wrapper">
                    <select className="form-select" value={formData.city} onChange={(e) => handleChange("city", e.target.value)}>
                      <option value="">Seçiniz</option>
                      {allCities.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>İlçe *</label>
                  <div className="input-wrapper">
                    <select className="form-select" value={formData.district} onChange={(e) => handleChange("district", e.target.value)} disabled={!formData.city}>
                      <option value="">Seçiniz</option>
                      {districtOptions.map((d, i) => <option key={i} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Mahalle *</label>
                  <div className="input-wrapper">
                    <select className="form-select" value={formData.neighborhood} onChange={(e) => handleChange("neighborhood", e.target.value)} disabled={!formData.district}>
                      <option value="">Seçiniz</option>
                      {neighborhoodOptions.map((n, i) => <option key={i} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Emlak Tipi</label>
                  <div className="input-wrapper">
                    <Building size={18} className="input-icon" />
                    <select className="form-select with-icon" value={formData.propertyType} onChange={(e) => handleChange("propertyType", e.target.value)}>
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-group col-span-2">
                  <label>Fiyat (TL)</label>
                  <div className="input-wrapper">
                    <DollarSign size={18} className="input-icon green" />
                    <input type="number" className="form-input with-icon mono" placeholder="Örn: 7500000" 
                      value={formData.price || ''} onChange={(e) => handleChange("price", Number(e.target.value))} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- ADIM 2: TEKNİK --- */}
          {step === 2 && (
            <motion.div key="step2" className="form-step" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{duration: 0.4}}>
              <div className="form-grid">
                <div className="input-group col-span-2">
                  <label>Oda Sayısı</label>
                  <div className="input-wrapper">
                    <Layers size={18} className="input-icon" />
                    <select className="form-select with-icon" value={formData.roomCount} onChange={(e) => handleChange("roomCount", e.target.value)}>
                      {ROOM_COUNTS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Brüt m²</label>
                  <div className="input-wrapper">
                    <Ruler size={18} className="input-icon" />
                    <input type="number" className="form-input with-icon" placeholder="120"
                      value={formData.grossM2 || ''} onChange={(e) => handleChange("grossM2", Number(e.target.value))} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Net m²</label>
                  <div className="input-wrapper">
                    <Ruler size={18} className="input-icon" />
                    <input type="number" className="form-input with-icon" placeholder="100"
                      value={formData.netM2 || ''} onChange={(e) => handleChange("netM2", Number(e.target.value))} />
                  </div>
                </div>
                <div className="input-group col-span-2">
                  <label>Bulunduğu Kat</label>
                  <div className="input-wrapper">
                    <Building size={18} className="input-icon" />
                    <input type="text" className="form-input with-icon" placeholder="Örn: 3"
                      value={formData.floor} onChange={(e) => handleChange("floor", e.target.value)} />
                  </div>
                </div>
                <div className="input-group col-span-2">
                  <label>Isıtma</label>
                  <div className="input-wrapper">
                    <Thermometer size={18} className="input-icon" />
                    <select className="form-select with-icon" value={formData.heating} onChange={(e) => handleChange("heating", e.target.value)}>
                      {HEATING_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* TOGGLE CARDS */}
              <div className="toggle-grid">
                 {['site', 'credit', 'parking'].map((key) => {
                    const labels: any = { site: 'Site İçerisinde', credit: 'Krediye Uygun', parking: 'Otopark Mevcut' };
                    const val = formData[key as keyof PortfolioDetails];
                    const isActive = val === 'Evet';
                    return (
                      <motion.div 
                        key={key} 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleChange(key as any, isActive ? 'Hayır' : 'Evet')}
                        className={`toggle-card ${isActive ? 'active' : ''}`}
                      >
                        <div className="toggle-check">
                          <Check size={16} strokeWidth={3} />
                        </div>
                        <span className="toggle-label">{labels[key]}</span>
                      </motion.div>
                    )
                 })}
              </div>
            </motion.div>
          )}

          {/* --- ADIM 3: PAZARLAMA --- */}
          {step === 3 && (
            <motion.div key="step3" className="form-step" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{duration: 0.4}}>
              <div className="form-grid three-col">
                <div className="input-group">
                  <label>Çıktı Dili</label>
                  <div className="input-wrapper">
                    <Globe size={18} className="input-icon blue" />
                    <select className="form-select with-icon" value={formData.marketing?.language} onChange={(e) => handleMarketingChange("language", e.target.value)}>
                      {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Hedef Kitle</label>
                  <div className="input-wrapper">
                    <Target size={18} className="input-icon red" />
                    <select className="form-select with-icon" value={formData.marketing?.target} onChange={(e) => handleMarketingChange("target", e.target.value)}>
                      <option value="Aile">Aile</option>
                      <option value="Yatırımcı">Yatırımcı</option>
                      <option value="Öğrenci">Öğrenci</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Ton</label>
                  <div className="input-wrapper">
                    <MessageSquare size={18} className="input-icon yellow" />
                    <select className="form-select with-icon" value={formData.marketing?.tone} onChange={(e) => handleMarketingChange("tone", e.target.value)}>
                      <option value="Profesyonel">Profesyonel</option>
                      <option value="Samimi">Samimi</option>
                      <option value="Lüks">Lüks</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="input-group mt-medium">
                <label>Öne Çıkan Özellikler</label>
                <textarea className="form-textarea" 
                  placeholder="Örn: Deniz manzarası, metro durağı yanında..."
                  value={formData.marketing?.highlights} 
                  onChange={(e) => handleMarketingChange("highlights", e.target.value)}></textarea>
              </div>

              <div className="input-group mt-small">
                <label className="label-flex">
                  <FileText size={16} className="text-purple"/> Ek Notlar
                </label>
                <textarea className="form-textarea" 
                  placeholder="Dairede şu an kiracı var..."
                  value={formData.marketing?.notes} 
                  onChange={(e) => handleMarketingChange("notes", e.target.value)}
                ></textarea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BUTTONS */}
        <div className="action-bar">
          <button className={`btn-back ${step === 1 ? 'hidden' : ''}`} onClick={prevStep}>
            <ArrowLeft size={18} /> Geri Dön
          </button>
          
          {step < 3 ? (
            <button className="btn-next" onClick={nextStep}>
              İleri <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn-generate" onClick={handleSubmit} disabled={loading}>
              <div className="shimmer"></div>
              <Sparkles size={20} className="icon-yellow" />
              <span>AI İle İçerik Üret</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}