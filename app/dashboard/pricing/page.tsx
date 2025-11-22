"use client";

import { useState } from "react";
import { Check, X, Zap, Building2, Briefcase, Loader2, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { upgradeUserPlan } from "../../actions"; 

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planName: string, planKey: 'freelance' | 'pro' | 'office') => {
    if (!confirm(`"${planName}" paketine geçiş yapmak istediğinize emin misiniz? (Demo Modu)`)) return;
    setLoadingPlan(planName);
    try {
      await upgradeUserPlan(planKey);
    } catch (error) {
      alert("Bir hata oluştu.");
      setLoadingPlan(null);
    }
  };
  
  // YENİ YAPI: Her özellik 'included' (dahil mi) bilgisiyle geliyor
  const plans = [
    {
      name: "Freelance",
      key: "freelance",
      price: "249",
      icon: Briefcase,
      iconColor: "blue",
      btnType: "outline",
      description: "Yeni başlayanlar için hızlı çözüm.",
      features: [
        { text: "Aylık 15 Adet İçerik Üretimi", included: true },
        { text: "Geçmiş: Son 10 Kayıt Tutulur", included: true },
        { text: "Temel PDF Çıktısı (Görselsiz)", included: true },
        // BURASI GÜNCELLENDİ: Tadımlık haklar veriyoruz
        { text: "AI Görsel İyileştirme (3 Adet/Ay)", included: true }, 
        { text: "AI Sosyal Medya Görseli (1 Adet/Ay)", included: true },
        { text: "Sora 2 Video", included: false },
        { text: "Profesyonel PDF (Görselli)", included: false },
        { text: "CRM Lite (Müşteri Listesi)", included: false },
        { text: "Ofis & Ekip Yönetim Paneli", included: false },
        { text: "Ofis Raporları", included: false },
        { text: "API Entegrasyonu", included: false },
      ]
    },
    {
      name: "Profesyonel",
      key: "pro",
      price: "799",
      icon: Zap,
      iconColor: "purple",
      btnType: "primary",
      popular: true,
      description: "Aktif çalışan danışmanlar için.",
      features: [
        { text: "Aylık 100 Adet İçerik Üretimi", included: true },
        { text: "Geçmiş: Son 50 Kayıt Tutulur", included: true },
        { text: "Profesyonel PDF (Görselli)", included: true },
        { text: "AI Görsel İyileştirme (30 Adet/Ay)", included: true },
        { text: "AI Sosyal Medya Görseli (15 Adet/Ay)", included: true },
        { text: "Sora 2 Video (1 Video/Ay)", included: true },
        { text: "CRM Lite (Müşteri Listesi)", included: true },
        { text: "CRM Pro (Gelişmiş Yönetim)", included: false },
        { text: "Ofis & Ekip Yönetim Paneli", included: false },
        { text: "Ofis Raporları", included: false },
        { text: "API Entegrasyonu", included: false },
      ]
    },
    {
      name: "Ofis / Ekip",
      key: "office",
      price: "1.990",
      icon: Building2,
      iconColor: "orange",
      btnType: "outline",
      description: "Ekipler ve ofisler için tam kapsam.",
      features: [
        { text: "3 Kullanıcı Dahildir", included: true }, // Ofise özel madde
        { text: "Aylık 150 Adet İçerik Üretimi", included: true },
        { text: "Geçmiş: Sınırsız Kayıt Tutulur", included: true },
        { text: "Özel Markalı PDF Teması", included: true },
        { text: "AI Görsel İyileştirme (100 Adet/Ay)", included: true },
        { text: "AI Sosyal Medya Görseli (50 Adet/Ay)", included: true },
        { text: "Sora 2 Video (2 Video/Ay)", included: true },
        { text: "CRM Pro (Gelişmiş Yönetim)", included: true },
        { text: "Ofis & Ekip Yönetim Paneli", included: true },
        { text: "Ofis Raporları", included: true },
        { text: "API Entegrasyonu", included: true },
      ]
    }
  ];

  return (
    <div className="pricing-container animate-in">
      
      <div className="pricing-header">
        <div className="badge">
          <Crown size={14} /> Paketleri İncele
        </div>
        <h1>İşine En Uygun Gücü Seç</h1>
        <p>
          İster tek başına çalış, ister büyük bir ofis yönet. Yapay zeka destekli araçlarla hızına hız kat.
        </p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`pricing-card ${plan.popular ? 'popular' : ''}`}
          >
            {plan.popular && (
              <div className="popular-tag">En Çok Tercih Edilen</div>
            )}

            <div className="card-top">
              <div className={`icon-box ${plan.iconColor}`}>
                <plan.icon size={28} />
              </div>
              <div>
                <h3>{plan.name}</h3>
                <span>Paket</span>
              </div>
            </div>

            <div className="price-section">
              <span className="amount">{plan.price} ₺</span>
              <span className="period">/ ay</span>
            </div>

            <div className="features-list">
              {plan.features.map((item, i) => (
                <div 
                  key={i} 
                  className={`feature-item ${!item.included ? 'missing' : ''}`}
                >
                  {item.included ? (
                    <div className={`p-0.5 rounded-full ${plan.popular ? 'bg-purple-500/20' : 'bg-white/10'}`}>
                      <Check size={12} className={plan.popular ? 'text-purple-400' : 'text-gray-400'} />
                    </div>
                  ) : (
                    <X size={16} className="mt-0.5 shrink-0 opacity-50" />
                  )}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleUpgrade(plan.name, plan.key as any)}
              disabled={loadingPlan !== null}
              className={`select-btn ${plan.btnType}`}
            >
              {loadingPlan === plan.name ? (
                <><Loader2 className="animate-spin" size={18}/> İşleniyor...</>
              ) : (
                "Paketi Seç"
              )}
            </button>

          </motion.div>
        ))}
      </div>
    </div>
  );
}