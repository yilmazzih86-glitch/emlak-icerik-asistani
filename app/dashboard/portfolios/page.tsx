"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, Search, MapPin, Calendar, ArrowRight, 
  Home, LayoutGrid, List, Loader2, X 
} from "lucide-react";
import { motion } from "framer-motion";
import { Portfolio } from "@/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function PortfoliosPage() {
  const supabase = createClient();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Verileri Çek
  useEffect(() => {
    const fetchPortfolios = async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Hata:", error);
      } else {
        setPortfolios(data || []);
      }
      setLoading(false);
    };

    fetchPortfolios();
  }, []);

  // Gelişmiş Türkçe Arama Filtresi
  const filteredPortfolios = portfolios.filter((p) => {
    if (!searchTerm) return true; // Arama boşsa hepsini göster
    
    const term = searchTerm.toLocaleLowerCase('tr'); // Türkçe küçük harfe çevir
    
    const title = p.title?.toLocaleLowerCase('tr') || "";
    const city = p.details.city?.toLocaleLowerCase('tr') || "";
    const district = p.details.district?.toLocaleLowerCase('tr') || "";
    const refNo = p.details.listingNo?.toLocaleLowerCase('tr') || "";

    return title.includes(term) || city.includes(term) || district.includes(term) || refNo.includes(term);
  });

  // Animasyon Varyantları
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="page-container portfolio-listing-page">
      
      {/* HEADER */}
      <div className="listing-header">
        <div>
          <h1 className="page-title">Portföylerim</h1>
          <p className="page-subtitle">
            Toplam <span className="highlight">{portfolios.length}</span> içerik üretildi.
          </p>
        </div>
        <Link href="/dashboard/generate" className="btn-primary">
          <Plus size={18} /> Yeni İçerik Üret
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="İlan başlığı, şehir veya referans no ile ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm("")}>
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="filter-actions">
           <button 
             className={`btn-icon-only ${viewMode === 'grid' ? 'active' : ''}`} 
             onClick={() => setViewMode('grid')}
           >
             <LayoutGrid size={18}/>
           </button>
           <button 
             className={`btn-icon-only ${viewMode === 'list' ? 'active' : ''}`} 
             onClick={() => setViewMode('list')}
           >
             <List size={18}/>
           </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="loading-state">
          <Loader2 className="spin" size={32} />
          <span>Portföyler Yükleniyor...</span>
        </div>
      ) : filteredPortfolios.length === 0 ? (
        <div className="empty-state">
           <div className="empty-icon"><Home size={32}/></div>
           <h3>Henüz ilan bulunamadı</h3>
           <p>Aradığınız kriterlere uygun ilan yok veya henüz hiç içerik üretmediniz.</p>
           {searchTerm && <button className="btn-text" onClick={() => setSearchTerm("")}>Aramayı Temizle</button>}
        </div>
      ) : (
        <motion.div 
          // 🛠️ DÜZELTME BURADA: key içine searchTerm eklendi.
          // Bu sayede arama değiştiğinde liste sıfırdan ve düzgün sıralanır.
          key={`${viewMode}-${searchTerm || 'all'}`} 
          
          className={`card-grid ${viewMode === 'list' ? 'list-view' : ''}`}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          layout // 🛠️ EKLEME: Elemanlar yer değiştirirken yumuşak kaysın
        >
          {filteredPortfolios.map((portfolio) => (
            <motion.div key={portfolio.id} variants={itemVariants} className="card-item-wrapper">
              <Link href={`/dashboard/portfolios/${portfolio.id}`} className="portfolio-card">
                
                {/* ... Kart içeriği aynı kalsın ... */}
                <div className="card-top">
                   <span className={`status-badge ${portfolio.status}`}>
                      {portfolio.status === 'active' ? 'Aktif' : 'Pasif'}
                   </span>
                   <span 
  className="listing-no" 
  title={portfolio.details.listingNo}
>
  #{portfolio.details.listingNo || 'N/A'}
</span>
                </div>

                <div className="card-body">
                   <div className="icon-box">
                      <Home size={20} />
                   </div>
                   
                   <div className="content-wrapper">
                     <h3 
  className="card-title" 
  title={portfolio.title}
>
  {portfolio.title}
</h3>
                     
                     <div className="meta-row">
                        <div className="location">
                           <MapPin size={14} />
                           {portfolio.details.district} / {portfolio.details.city}
                        </div>
                        
                        {viewMode === 'list' && (
                          <div className="extra-details">
                            <span>{portfolio.details.roomCount}</span>
                            <span className="dot">•</span>
                            <span>{portfolio.details.grossM2} m²</span>
                          </div>
                        )}
                     </div>
                   </div>

                   <div className="price-tag">
                      {portfolio.details.price ? `${portfolio.details.price.toLocaleString('tr-TR')} ₺` : '-'}
                   </div>
                </div>

                <div className="card-footer">
                   <div className="date">
                      <Calendar size={12} />
                      {format(new Date(portfolio.created_at), "d MMM yyyy", { locale: tr })}
                   </div>
                   <span className="detail-link">
                      Detay <ArrowRight size={14} />
                   </span>
                </div>

                <div className="hover-glow"></div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}