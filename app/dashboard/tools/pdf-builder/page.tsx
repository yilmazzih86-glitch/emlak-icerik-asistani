"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  FileText, CheckCircle2, Loader2, Download, 
  AlertCircle, Search, ChevronRight, UploadCloud, 
  User, Building2, Image as ImageIcon, Layout, Printer 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Portfolio } from "@/types";

const TEMPLATES = [
  { id: 'modern-kurumsal', name: 'Modern Kurumsal', color: '#3b82f6' }, 
  { id: 'klasik-prestij', name: 'Klasik Prestij', color: '#f97316' }, 
  { id: 'minimalist', name: 'Minimalist', color: '#a855f7' },     
];

export default function PdfBuilderPage() {
  const supabase = createClient();
  
  // State'ler
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern-kurumsal');
  
  const [agentData, setAgentData] = useState({
    fullName: "",
    phone: "",
    email: "",
    agencyName: "",
    motto: "SpektrumCreative AI ile Emlakçılıkta Yeni Dönem"
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setAgentData(prev => ({
          ...prev,
          fullName: profile.full_name || "",
          phone: profile.phone || "",
          agencyName: profile.agency_name || "Spektrum Gayrimenkul",
          email: user.email || ""
        }));
      }

      const { data: portfolioData } = await supabase.from('portfolios').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (portfolioData) setPortfolios(portfolioData);
      setLoadingData(false);
    }
    fetchData();
  }, []);

  // (Dosya yükleme fonksiyonları aynı kalabilir, sadece HTML yapılarına odaklanalım)
  const handleLogoChange = (e: any) => { const file = e.target.files[0]; if(file) setLogoPreview(URL.createObjectURL(file)); };
  const handleHeroChange = (e: any) => { const file = e.target.files[0]; if(file) setHeroPreview(URL.createObjectURL(file)); };
  const handleGalleryChange = (e: any) => { 
     const files = Array.from(e.target.files) as File[]; 
     if(files.length) setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]); 
  };

  // Fake PDF Generate
  const handleGeneratePdf = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setPdfUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
    setGenerating(false);
  };

  const filteredPortfolios = portfolios.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="pdf-builder-page animate-in fade-in">
      
      <div className="page-header">
        <div className="icon-box red"><FileText size={28} /></div>
        <div>
          <h1>PDF Sunum <span className="highlight">Oluşturucu</span></h1>
          <p>İlanlarınız için saniyeler içinde kurumsal sunum dosyası hazırlayın.</p>
        </div>
      </div>

      <div className="builder-grid">
        
        {/* SOL PANEL */}
        <div className="glass-panel settings-panel custom-scrollbar">
          
          {/* 1. Portföy */}
          <div className="panel-group">
            <div className="group-title">1. Portföy Seçimi</div>
            <div className="search-wrapper">
              <Search size={14}/>
              <input type="text" placeholder="Portföy ara..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}/>
            </div>
            <div className="portfolio-scroller">
              {filteredPortfolios.map((p) => (
                <div key={p.id} onClick={() => setSelectedPortfolio(p)} className={`list-item ${selectedPortfolio?.id === p.id ? 'active' : ''}`}>
                  <div className="item-text">{p.title}</div>
                  {selectedPortfolio?.id === p.id && <CheckCircle2 size={16} className="check-icon"/>}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Danışman */}
          <div className="panel-group">
            <div className="group-title"><User size={14}/> 2. Danışman Bilgileri</div>
            <div className="form-row">
              <input type="text" placeholder="Ad Soyad" value={agentData.fullName} onChange={e => setAgentData({...agentData, fullName: e.target.value})} />
              <input type="text" placeholder="Telefon" value={agentData.phone} onChange={e => setAgentData({...agentData, phone: e.target.value})} />
            </div>
            <input type="text" className="full-width" placeholder="Ajans Adı" value={agentData.agencyName} onChange={e => setAgentData({...agentData, agencyName: e.target.value})} />
            <input type="text" className="full-width" placeholder="Motto" value={agentData.motto} onChange={e => setAgentData({...agentData, motto: e.target.value})} />
          </div>

          {/* 3. Görseller */}
          <div className="panel-group">
            <div className="group-title"><ImageIcon size={14}/> 3. Görsel Özelleştirme</div>
            
            <div className="upload-control">
              <label>Ajans Logosu</label>
              <div className="control-body">
                <label className="btn-mini-upload">
                  <UploadCloud size={14}/> Yükle
                  <input type="file" hidden onChange={handleLogoChange} accept="image/*"/>
                </label>
                {logoPreview && <div className="preview-thumb"><img src={logoPreview}/></div>}
              </div>
            </div>

            <div className="upload-control">
              <label>Kapak Fotoğrafı (Hero)</label>
              <div className="control-body">
                <label className="btn-mini-upload">
                  <UploadCloud size={14}/> Değiştir
                  <input type="file" hidden onChange={handleHeroChange} accept="image/*"/>
                </label>
                {heroPreview && <div className="preview-thumb hero"><img src={heroPreview}/></div>}
              </div>
            </div>

            <div className="upload-control">
              <label>Ek Galeri</label>
              <label className="drop-area">
                 <UploadCloud size={18}/> Fotoğrafları seç
                 <input type="file" hidden multiple onChange={handleGalleryChange} accept="image/*"/>
              </label>
              {galleryPreviews.length > 0 && (
                <div className="gallery-strip">
                  {galleryPreviews.map((src, i) => <img key={i} src={src} />)}
                </div>
              )}
            </div>
          </div>

          {/* 4. Şablon */}
          <div className="panel-group">
            <div className="group-title"><Layout size={14}/> 4. Tasarım Şablonu</div>
            <div className="template-list">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setSelectedTemplate(t.id)} className={`tpl-btn ${selectedTemplate === t.id ? 'active' : ''}`} style={{'--tpl-color': t.color} as any}>
                  <div className="dot"></div> {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: ÖNİZLEME */}
        <div className="glass-panel preview-area">
          <AnimatePresence mode="wait">
            
            {!selectedPortfolio && (
              <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="state-empty">
                <div className="icon-circle"><Printer size={40}/></div>
                <h3>Portföy Seçiniz</h3>
                <p>Sunum oluşturmak için sol menüden bir ilan seçin.</p>
              </motion.div>
            )}

            {selectedPortfolio && !generating && !pdfUrl && (
              <motion.div key="ready" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="state-ready">
                
                {/* PDF ÖNİZLEME KARTI */}
                <div className="preview-card">
                  <div className="card-header-badge">ÖNİZLEME</div>
                  
                  {/* Kapak Resmi */}
                  <div className="cover-img">
                    <img src={heroPreview || selectedPortfolio.image_urls?.[0] || "https://via.placeholder.com/800x600"} />
                    <div className="cover-overlay">
                      <h2>{selectedPortfolio.title}</h2>
                      <div className="price">{selectedPortfolio.details.price?.toLocaleString()} ₺</div>
                    </div>
                  </div>

                  {/* Agent Bilgisi (Sorunlu Kısım Burasıydı) */}
                  <div className="agent-row">
                    <div className="agent-avatar">
                      <img src={logoPreview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} />
                    </div>
                    <div className="agent-info">
                      <strong>{agentData.fullName || "Danışman Adı"}</strong>
                      <span>{agentData.agencyName}</span>
                    </div>
                  </div>

                  <div className="info-tags">
                    <span>{selectedPortfolio.details.roomCount}</span>
                    <span>{selectedPortfolio.details.grossM2} m²</span>
                    <span>{selectedPortfolio.details.district}</span>
                  </div>
                </div>

                <div className="bottom-action">
                  <button onClick={handleGeneratePdf} className="btn-create-pdf">
                    <FileText size={20}/> PDF Sunum Oluştur
                  </button>
                </div>

              </motion.div>
            )}

            {/* Yükleniyor ve Başarılı state'leri aynı kalabilir */}
            {generating && (
               <div className="state-loading">
                 <Loader2 size={40} className="animate-spin text-red-500"/>
                 <h3>Oluşturuluyor...</h3>
               </div>
            )}

            {pdfUrl && !generating && (
               <div className="state-success">
                 <CheckCircle2 size={50} className="text-green-500 mb-4"/>
                 <h3>PDF Hazır!</h3>
                 <div className="btn-group">
                    <a href={pdfUrl} target="_blank" className="btn-outline">Aç</a>
                    <a href={pdfUrl} download className="btn-solid">İndir</a>
                 </div>
                 <button onClick={() => setPdfUrl(null)} className="btn-link">Yeni Oluştur</button>
               </div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}