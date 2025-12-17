"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, Copy, Check, Loader2, 
  Instagram, Linkedin, Globe, Clapperboard, 
  Save, MapPin, Home, Calendar, Edit3, Sparkles, 
  Languages, MessageSquare, Target, FileText, X, Maximize2,
  Building, Layers, Info, Star, StickyNote // <-- StickyNote EKLENDİ
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const LANGUAGES = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
];

const TONES = ["Profesyonel", "Samimi", "Lüks", "Yatırım Odaklı", "Acil"];
const TARGETS = ["Genel", "Aile", "Yatırımcı", "Öğrenci", "Yabancı"];

export default function PortfolioDetailPage() {
  const params = useParams();
  const supabase = createClient();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabType>('portal');
  const [currentContent, setCurrentContent] = useState(""); 
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'genel' | 'teknik' | 'bina' | 'diger' | 'notlar'>('genel');

  const [marketingConfig, setMarketingConfig] = useState({
    language: "tr",
    tone: "Profesyonel",
    target: "Genel",
    highlights: "",
    notes: ""
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!params.id) return;
      const { data, error } = await supabase.from("portfolios").select("*").eq("id", params.id).single();
      if (data) {
        setPortfolio(data);
        if (data.ai_output && data.ai_output['portal']) {
          setCurrentContent(data.ai_output['portal']);
        }
        if (data.details?.marketing) {
           setMarketingConfig(prev => ({
             ...prev,
             language: data.details.marketing.language || "tr",
             tone: data.details.marketing.tone || "Profesyonel",
             target: data.details.marketing.target || "Genel",
             highlights: data.details.marketing.highlights || "", 
             notes: data.details.marketing.notes || ""
           }));
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

  const handleGenerateAI = async () => {
    if (!portfolio) return;
    setGenerating(true);
    try {
       const { data: { user } } = await supabase.auth.getUser();
       if(!user) throw new Error("Oturum yok");
       const { data: success } = await supabase.rpc('use_listing_credit', { p_user_id: user.id });
       if (!success) throw new Error("Yetersiz Kredi");

       const d = portfolio.details || {};
       const payload = {
         userId: user.id,
         title: portfolio.title,
         city: portfolio.city || d.city,
         district: portfolio.district || d.district,
         neighborhood: portfolio.neighborhood || d.neighborhood,
         price: portfolio.price || d.price,
         listingNo: d.listingNo || "",
         propertyType: "Konut", 
         roomCount: portfolio.room_count || d.room_count || d.roomCount || "",
         grossM2: portfolio.gross_m2 || d.gross_m2 || d.grossM2 || 0,
         netM2: portfolio.net_m2 || d.net_m2 || d.netM2 || 0,
         floor: portfolio.floor || d.floor || "",
         heating: portfolio.heating || d.heating || "",
         credit: portfolio.credit_status || d.credit_status || "Belirtilmemiş",
         site: d.in_site || "Hayır",
         furnished: d.furnished || "Hayır",
         parking: d.parking || "Hayır",
         bathroomCount: d.bathroom_count || "1",
         buildingAge: d.building_age || "",
         marketing: {
           language: marketingConfig.language,
           tone: marketingConfig.tone,
           target: marketingConfig.target,
           highlights: marketingConfig.highlights, 
           notes: marketingConfig.notes
         }
       };

       const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
       const res = await fetch(webhookUrl!, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
       });
       
       if(!res.ok) throw new Error("AI Yanıt Vermedi");
       const n8nData = await res.json();
       const newContent = n8nData.contents || n8nData.output;

       const { error } = await supabase.from('portfolios').update({ 
         ai_output: newContent,
         details: { ...d, marketing: marketingConfig }
       }).eq('id', portfolio.id);

       if(!error) {
          setPortfolio({ ...portfolio, ai_output: newContent });
          window.location.reload();
       }
    } catch (error: any) {
       alert("Hata: " + error.message);
    } finally {
       setGenerating(false);
    }
  };

  const handleContentChange = (val: string) => { setCurrentContent(val); setIsEditing(true); };
  const handleSave = async () => {
    if (!portfolio) return;
    setSaving(true);
    const updatedOutput: AiContent = { ...portfolio.ai_output!, [activeTab]: currentContent };
    const { error } = await supabase.from('portfolios').update({ ai_output: updatedOutput }).eq('id', portfolio.id);
    if (!error) { setPortfolio({ ...portfolio, ai_output: updatedOutput }); setIsEditing(false); }
    setSaving(false);
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!portfolio) return <div className="not-found">İlan bulunamadı.</div>;

  const details = portfolio.details || {};
  
  const d = {
     listingNo: details.listingNo || portfolio.id.slice(0, 8),
     date: format(new Date(portfolio.created_at), "dd-MM-yyyy", { locale: tr }),
     status: portfolio.status === 'active' ? 'Aktif' : 'Pasif',
     listingType: portfolio.listing_type === 'sale' ? 'Satılık' : 'Kiralık',
     type: "Daire",
     
     // EKSİK OLAN propType EKLENDİ
     propType: portfolio.details?.propertyType || "Konut", 

     room: portfolio.room_count || details.room_count || details.roomCount || '-',
     gross: portfolio.gross_m2 || details.gross_m2 || details.grossM2 || '-',
     net: portfolio.net_m2 || details.net_m2 || details.netM2 || '-',
     floor: portfolio.floor || details.floor || '-',
     totalFloor: details.total_floors || '-',
     age: details.building_age || '-',
     heating: portfolio.heating || details.heating || '-',
     bathroom: details.bathroom_count || '-',
     credit: portfolio.credit_status || details.credit_status || '-',
     furnished: details.furnished || 'Hayır',
     site: details.in_site || 'Hayır',
     dues: details.dues ? `${details.dues} TL` : '-',
     swap: details.swap || 'Hayır',
     highlights: marketingConfig.highlights || '-',
     notes: marketingConfig.notes || '-'
  };

  return (
    <div className="page-container result-page">
      <div className="result-header">
        <div className="header-left">
          <Link href="/dashboard/portfolios" className="btn-orange mb-4"><ArrowLeft size={18} /> Portföylere Dön</Link>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-title">
            {portfolio.title}
            <span className={`status-badge ${portfolio.status}`}>{portfolio.status === 'active' ? 'AKTİF' : 'PASİF'}</span>
          </motion.h1>
          <p className="page-meta"><Calendar size={14}/> {format(new Date(portfolio.created_at), "d MMMM yyyy", { locale: tr })}</p>
        </div>
      </div>

      <div className="result-grid">
        {/* SOL PANEL */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel info-panel">
           <div className="info-list">
              <h3 className="panel-title"><Home size={18} className="icon-purple"/> Portföy Özeti</h3>
              <div className="info-row"><span className="label">Konum</span><span className="value with-icon"><MapPin size={14}/> {portfolio.district || details.district} / {portfolio.city || details.city}</span></div>
              <div className="info-row"><span className="label">Fiyat</span><span className="value price">{portfolio.price ? `${portfolio.price.toLocaleString('tr-TR')} ₺` : '-'}</span></div>
              <div className="divider"></div>
              <div className="mini-stat-grid">
                 <div className="mini-stat"><span className="label">Oda</span><span className="value">{d.room}</span></div>
                 <div className="mini-stat"><span className="label">Brüt m²</span><span className="value">{d.gross} m²</span></div>
                 <div className="mini-stat"><span className="label">Net m²</span><span className="value">{d.net} m²</span></div>
                 <div className="mini-stat"><span className="label">Kat</span><span className="value">{d.floor}</span></div>
              </div>
              <div className="divider"></div>
              <div className="features-row">
                {d.credit !== 'Uygun Değil' && <span className="badge-feature green">Krediye Uygun</span>}
                {d.site === 'Evet' && <span className="badge-feature purple">Site İçinde</span>}
              </div>
              <button onClick={() => setIsDetailModalOpen(true)} className="btn-detail-modal mt-6">
                <Maximize2 size={16}/> Tüm Detayları Görüntüle
              </button>
           </div>
        </motion.div>

        {/* SAĞ PANEL */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel editor-panel">
           {!portfolio.ai_output ? (
              <div className="ai-config-container">
                 <div className="config-header"><Sparkles size={32} className="text-purple-400 mb-2"/><h3>AI İçerik Oluşturucu</h3><p>İlan detaylarınız hazır. Hedef kitlenizi ve dilinizi seçin.</p></div>
                 <div className="config-grid">
                    <div className="config-group"><label><Languages size={14}/> Çıktı Dili</label><select className="config-select" value={marketingConfig.language} onChange={(e) => setMarketingConfig({...marketingConfig, language: e.target.value})}>{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}</select></div>
                    <div className="config-group"><label><MessageSquare size={14}/> Ton</label><select className="config-select" value={marketingConfig.tone} onChange={(e) => setMarketingConfig({...marketingConfig, tone: e.target.value})}>{TONES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div className="config-group"><label><Target size={14}/> Hedef Kitle</label><select className="config-select" value={marketingConfig.target} onChange={(e) => setMarketingConfig({...marketingConfig, target: e.target.value})}>{TARGETS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                 </div>
                 <div className="config-group full mb-4"><label><Star size={14} className="text-yellow-400"/> Öne Çıkan Özellikler</label><textarea className="config-textarea form-textarea" value={marketingConfig.highlights} onChange={(e) => setMarketingConfig({...marketingConfig, highlights: e.target.value})}/></div>
                 <div className="config-group full"><label><StickyNote size={14} className="text-blue-400"/> Ek Notlar</label><textarea className="config-textarea form-textarea" value={marketingConfig.notes} onChange={(e) => setMarketingConfig({...marketingConfig, notes: e.target.value})}/></div>
                 <button onClick={handleGenerateAI} disabled={generating} className="btn-generate-main">{generating ? <Loader2 size={20} className="spin-icon"/> : <Sparkles size={20}/>}{generating ? 'Oluşturuluyor...' : 'İçeriği Oluştur'}</button>
              </div>
           ) : (
             <>
               <div className="tabs-container">
                  {TABS.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
                       {activeTab === tab.id && <motion.div layoutId="activeTab" className="tab-bg" />}
                       <tab.icon size={18} style={{ color: activeTab === tab.id ? tab.color : 'currentColor', position:'relative', zIndex:1 }} /><span style={{position:'relative', zIndex:1}}>{tab.label}</span>
                    </button>
                  ))}
               </div>
               <div className="editor-toolbar">
                  <div className="status-indicator">{isEditing ? <span className="editing"><Edit3 size={12}/> Düzenleniyor...</span> : <span className="saved"><Check size={12}/> Kaydedildi</span>}</div>
                  <div className="actions">{isEditing && <button onClick={handleSave} disabled={saving} className="btn-save">{saving ? <Loader2 size={12} className="spin"/> : <Save size={12}/>} Kaydet</button>}<button onClick={handleCopy} className={`btn-copy ${copied ? 'success' : ''}`}>{copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? 'Kopyalandı' : 'Kopyala'}</button></div>
               </div>
               <div className="editor-content-wrapper"><textarea className="editor-textarea" value={currentContent} onChange={(e) => handleContentChange(e.target.value)} spellCheck={false}></textarea></div>
             </>
           )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isDetailModalOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="modal-backdrop" onClick={() => setIsDetailModalOpen(false)}/>
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="detail-modal">
              <div className="modal-header"><h3>Portföy Detayları</h3><button onClick={() => setIsDetailModalOpen(false)}><X size={20}/></button></div>
              <div className="modal-tabs">
                <button onClick={() => setModalTab('genel')} className={`modal-tab-btn ${modalTab === 'genel' ? 'active' : ''}`}><Info size={14}/> Genel</button>
                <button onClick={() => setModalTab('teknik')} className={`modal-tab-btn ${modalTab === 'teknik' ? 'active' : ''}`}><Home size={14}/> Metrekare & Oda</button>
                <button onClick={() => setModalTab('bina')} className={`modal-tab-btn ${modalTab === 'bina' ? 'active' : ''}`}><Building size={14}/> Bina & Yapı</button>
                <button onClick={() => setModalTab('diger')} className={`modal-tab-btn ${modalTab === 'diger' ? 'active' : ''}`}><Layers size={14}/> Diğer</button>
                <button onClick={() => setModalTab('notlar')} className={`modal-tab-btn ${modalTab === 'notlar' ? 'active' : ''}`}><Star size={14}/> Notlar</button>
              </div>
              <div className="modal-content custom-scrollbar">
                  <div className="detail-tab-content">
                     {modalTab === 'genel' && (
                        <div className="detail-section-full">
                           <h4>Genel Bilgiler</h4>
                           <DetailRow label="İlan No" value={d.listingNo} />
                           <DetailRow label="Son Güncelleme" value={d.date} />
                           <DetailRow label="İlan Tipi" value={d.listingType} highlight />
                           <DetailRow label="İlan Durumu" value={d.status} highlight />
                           <DetailRow label="Konut Tipi" value={d.propType} />
                           <DetailRow label="Fiyat" value={portfolio?.price ? `${portfolio.price.toLocaleString('tr-TR')} ₺` : '-'} highlight />
                        </div>
                     )}
                     {modalTab === 'teknik' && (
                        <div className="detail-section-full">
                           <h4>Metrekare & Oda</h4>
                           <DetailRow label="Oda Sayısı" value={d.room} />
                           <DetailRow label="Banyo Sayısı" value={d.bathroom} />
                           <DetailRow label="Brüt m²" value={`${d.gross} m²`} />
                           <DetailRow label="Net m²" value={`${d.net} m²`} />
                        </div>
                     )}
                     {modalTab === 'bina' && (
                        <div className="detail-section-full">
                           <h4>Bina Özellikleri</h4>
                           <DetailRow label="Kat Sayısı" value={d.totalFloor} />
                           <DetailRow label="Bulunduğu Kat" value={d.floor} />
                           <DetailRow label="Bina Yaşı" value={d.age} />
                           <DetailRow label="Isıtma Tipi" value={d.heating} />
                        </div>
                     )}
                     {modalTab === 'diger' && (
                        <div className="detail-section-full">
                           <h4>Diğer Bilgiler</h4>
                           <DetailRow label="Kredi Durumu" value={d.credit} />
                           <DetailRow label="Eşya Durumu" value={d.furnished} />
                           <DetailRow label="Site İçerisinde" value={d.site} />
                           <DetailRow label="Aidat" value={d.dues} />
                           <DetailRow label="Takas" value={d.swap} />
                        </div>
                     )}
                     {modalTab === 'notlar' && (
                        <div className="notes-section full-width">
                           <h4 className="text-yellow-400 mb-2">Öne Çıkanlar</h4>
                           <p>{d.highlights && d.highlights !== '-' ? d.highlights : "Belirtilmemiş"}</p>
                           <div className="h-6"></div>
                           <h4 className="text-blue-400 mb-2">Ek Notlar</h4>
                           <p>{d.notes && d.notes !== '-' ? d.notes : "Not yok."}</p>
                        </div>
                     )}
                  </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className="item-row">
       <span className="label">{label}</span>
       <span className={`val ${highlight ? 'green' : ''}`}>{value}</span>
    </div>
  )
}