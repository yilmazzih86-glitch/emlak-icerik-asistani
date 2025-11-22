"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, Copy, Check, Share2, Loader2, 
  Instagram, Linkedin, Globe, Clapperboard, 
  Save, MapPin, Home, Calendar, Edit3 
} from "lucide-react";
import { motion } from "framer-motion";
import { Portfolio, AiContent } from "@/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type TabType = 'portal' | 'instagram' | 'linkedin' | 'reels';

const TABS: { id: TabType; label: string; icon: any; color: string }[] = [
  { id: 'portal', label: 'Sahibinden/Portal', icon: Globe, color: '#fbbf24' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#e1306c' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0077b5' },
  { id: 'reels', label: 'Reels Senaryosu', icon: Clapperboard, color: '#8b5cf6' }
];

export default function PortfolioDetailPage() {
  const params = useParams();
  const supabase = createClient();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabType>('portal');
  const [currentContent, setCurrentContent] = useState(""); 
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!params.id) return;

      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Hata:", error);
      } else {
        setPortfolio(data);
        if (data.ai_output && data.ai_output['portal']) {
          setCurrentContent(data.ai_output['portal']);
        }
      }
      setLoading(false);
    };

    fetchPortfolio();
  }, [params.id]);

  useEffect(() => {
    if (portfolio?.ai_output) {
      setCurrentContent(portfolio.ai_output[activeTab] || "");
      setIsEditing(false);
    }
  }, [activeTab, portfolio]);

  const handleContentChange = (val: string) => {
    setCurrentContent(val);
    setIsEditing(true);
  };
// --- YENİ PAYLAŞ FONKSİYONU ---
  const handleShare = async () => {
    if (!portfolio) return;
    
    const shareData = {
      title: portfolio.title,
      text: `${portfolio.details.district} / ${portfolio.details.city} - ${portfolio.title} detayları:`,
      url: window.location.href, // Mevcut sayfa linki
    };

    // Tarayıcı paylaşımı destekliyor mu? (Mobil için)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Paylaşım iptal edildi");
      }
    } else {
      // Masaüstü için: Linki kopyala
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };
  const handleSave = async () => {
    if (!portfolio) return;
    setSaving(true);

    const updatedOutput: AiContent = {
      ...portfolio.ai_output!,
      [activeTab]: currentContent
    };

    const { error } = await supabase
      .from('portfolios')
      .update({ ai_output: updatedOutput })
      .eq('id', portfolio.id);

    if (!error) {
      setPortfolio({ ...portfolio, ai_output: updatedOutput });
      setIsEditing(false);
    } else {
      alert("Kaydederken hata oluştu.");
    }
    setSaving(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  if (loading) {
    return (
      <div className="loading-container">
         <div className="spinner-wrapper">
            <div className="spinner"></div>
         </div>
      </div>
    );
  }

  if (!portfolio) {
    return <div className="not-found">İlan bulunamadı.</div>;
  }

  const { details } = portfolio;

  return (
    <div className="page-container result-page">
      
      {/* --- HEADER --- */}
      {/* --- HEADER --- */}
      <div className="result-header">
        <div className="header-left">
          {/* GÜNCELLENEN KISIM: TURUNCU BUTON VE YÖNLENDİRME */}
          <Link href="/dashboard/portfolios" className="btn-orange mb-4">
            <ArrowLeft size={18} /> Portföylere Dön
          </Link>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title"
          >
            {portfolio.title}
            <span className="status-badge">Aktif</span>
          </motion.h1>
          <p className="page-meta">
             <Calendar size={14}/> {format(new Date(portfolio.created_at), "d MMMM yyyy, HH:mm", { locale: tr })}
             <span className="dot"></span>
             #{details.listingNo || 'N/A'}
          </p>
        </div>

        <div className="header-right">
           {/* GÜNCELLENEN KISIM: METİN DEĞİŞİKLİĞİ */}
           <Link href="/dashboard/generate" className="btn-primary">
             Yeni İçerik Üret
           </Link>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="result-grid">
        
        {/* --- LEFT: INFO CARD --- */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel info-panel"
        >
           <h3 className="panel-title">
             <Home size={18} className="icon-purple"/> Portföy Özeti
           </h3>
           
           <div className="info-list">
              {/* Temel Bilgiler */}
              <div className="info-row">
                 <span className="label">Konum</span>
                 <span className="value with-icon">
                    <MapPin size={14}/> {details.district} / {details.city}
                 </span>
              </div>
              <div className="info-row">
                 <span className="label">Mahalle</span>
                 <span className="value">{details.neighborhood}</span>
              </div>
              <div className="info-row">
                 <span className="label">Fiyat</span>
                 <span className="value price">
                    {details.price ? `${details.price.toLocaleString('tr-TR')} ₺` : '-'}
                 </span>
              </div>
              
              <div className="divider"></div>
              
              {/* Detay Grid - Genişletildi */}
              <div className="mini-stat-grid">
                 <div className="mini-stat">
                    <span className="label">Tip</span>
                    <span className="value">{details.propertyType}</span>
                 </div>
                 <div className="mini-stat">
                    <span className="label">Oda</span>
                    <span className="value">{details.roomCount}</span>
                 </div>
                 
                 <div className="mini-stat">
                    <span className="label">Brüt m²</span>
                    <span className="value">{details.grossM2} m²</span>
                 </div>
                 <div className="mini-stat">
                    <span className="label">Net m²</span>
                    <span className="value">{details.netM2 || '-'} m²</span>
                 </div>

                 <div className="mini-stat">
                    <span className="label">Kat</span>
                    <span className="value">{details.floor || '-'}</span>
                 </div>
                 <div className="mini-stat">
                    <span className="label">Isıtma</span>
                    <span className="value small">{details.heating}</span>
                 </div>
              </div>
              
              <div className="divider"></div>

              {/* Özellik Etiketleri (Yeni Eklenen Kısım) */}
              <div className="features-row" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {details.credit === 'Evet' && (
                    <span className="badge-feature green">Krediye Uygun</span>
                  )}
                  {details.site === 'Evet' && (
                    <span className="badge-feature purple">Site İçinde</span>
                  )}
                  {details.parking === 'Evet' && (
                    <span className="badge-feature blue">Otoparklı</span>
                  )}
              </div>

              {details.marketing?.target && (
                <div className="info-row mt-4" style={{ marginTop: '1rem' }}>
                   <span className="label">Hedef Kitle</span>
                   <span className="value badge-gray">{details.marketing.target}</span>
                </div>
              )}
           </div>
        </motion.div>

        {/* --- RIGHT: CONTENT STUDIO --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel editor-panel"
        >
           {/* TABS */}
           <div className="tabs-container">
              {TABS.map((tab) => {
                 const isActive = activeTab === tab.id;
                 return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`tab-btn ${isActive ? 'active' : ''}`}
                    >
                       {isActive && (
                         <motion.div layoutId="activeTab" className="tab-bg" />
                       )}
                       <tab.icon size={18} style={{ color: isActive ? tab.color : 'currentColor' }} className="tab-icon" />
                       <span className="tab-label">{tab.label}</span>
                    </button>
                 )
              })}
           </div>

           {/* EDITOR TOOLBAR */}
           {/* EDITOR TOOLBAR */}
           <div className="editor-toolbar">
              <div className="status-indicator">
                 {isEditing ? (
                    <span className="editing"><Edit3 size={12}/> Düzenleniyor...</span>
                 ) : (
                    <span className="saved"><Check size={12}/> Kaydedildi</span>
                 )}
              </div>
              <div className="actions">
                 {isEditing && (
                    <button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="btn-save"
                    >
                       {saving ? <Loader2 size={12} className="spin"/> : <Save size={12}/>}
                       Kaydet
                    </button>
                 )}
                 
                 {/* KOPYALA BUTONU GÜNCELLEMESİ */}
                 <button 
                   onClick={handleCopy}
                   className={`btn-copy ${copied ? 'success' : ''}`} 
                 >
                    {copied ? <Check size={12}/> : <Copy size={12}/>}
                    {copied ? 'Kopyalandı' : 'Kopyala'}
                 </button>
              </div>
           </div>

           {/* TEXTAREA WRAPPER */}
           <div className="editor-content-wrapper">
              <textarea
                 className="editor-textarea"
                 value={currentContent}
                 onChange={(e) => handleContentChange(e.target.value)}
                 spellCheck={false}
              ></textarea>
           </div>
        </motion.div>

      </div>
    </div>
  );
}