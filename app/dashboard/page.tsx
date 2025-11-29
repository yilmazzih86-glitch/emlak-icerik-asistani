"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  PlusCircle, LayoutDashboard, Zap, FileText, 
  TrendingUp, Image as ImageIcon, Video, Share2, Sparkles, Crown, Star, Clock, ArrowRight,
  FolderOpen, Search
} from "lucide-react";
import { motion, Variants } from "framer-motion"; // Variants eklendi

export default function DashboardPage() {
  const [stats, setStats] = useState({ 
    fullName: "", 
    total: 0, 
    plan: 'free', 
    limits: {
      listing: { limit: 0, used: 0 },
      image: { limit: 0, used: 0 },
      social: { limit: 0, used: 0 },
      video: { limit: 0, used: 0 },
    },
    recent: [] as any[] 
  });
  
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, portfoliosRes, countRes] = await Promise.all([
        supabase.from("profiles")
          .select("full_name, plan_type, listing_limit, listing_used, image_ai_limit, image_ai_used, social_ai_limit, social_ai_used, video_ai_limit, video_ai_used")
          .eq("id", user.id)
          .single(),
        
        supabase.from("portfolios").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("portfolios").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      ]);

      const p = profileRes.data;

      setStats({
        fullName: p?.full_name || "Değerli Üye",
        total: countRes.count ?? 0,
        plan: p?.plan_type || 'free',
        limits: {
          listing: { limit: p?.listing_limit || 0, used: p?.listing_used || 0 },
          image: { limit: p?.image_ai_limit || 0, used: p?.image_ai_used || 0 },
          social: { limit: p?.social_ai_limit || 0, used: p?.social_ai_used || 0 },
          video: { limit: p?.video_ai_limit || 0, used: p?.video_ai_used || 0 },
        },
        recent: portfoliosRes.data ?? []
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  // Animasyon Varyantları
  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemAnim: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 50 } }
  };

  const getPercent = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const timeSavedDisplay = stats.total * 45 > 60 
    ? `${((stats.total * 45) / 60).toFixed(1)} Saat` 
    : `${stats.total * 45} dk`;

  const formatPlanName = (plan: string) => {
    switch(plan) {
      case 'office': return 'Ofis / Ekip';
      case 'pro': return 'Profesyonel';
      case 'freelance': return 'Freelance';
      default: return 'Demo';
    }
  };

  return (
    <div className="pt-6 pb-20">
      
      {/* HEADER */}
      <div className="dashboard-header-premium">
        <div className="welcome-text">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="greeting">
            Hoş geldin, <span className="user-name">{stats.fullName}</span> 👋
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="plan-status">
            Şu an <span className={`plan-badge ${stats.plan}`}>
              {stats.plan === 'office' && <Crown size={12} />} 
              {stats.plan === 'pro' && <Zap size={12} />}
              {stats.plan === 'freelance' && <Star size={12} />}
              {formatPlanName(stats.plan)}
            </span> paketinin ayrıcalıklarını kullanıyorsun.
          </motion.div>
        </div>

        <Link href="/dashboard/generate" className="btn btn-primary btn-glow">
          <PlusCircle size={20} style={{ marginRight: '8px' }} />
          Yeni İçerik Üret
        </Link>
      </div>

      {/* ÜST BÖLÜM: KPI KARTLARI */}
      <motion.div className="stats-grid" variants={container} initial="hidden" animate="show">
        <motion.div variants={itemAnim} className="premium-card hover-lift" style={{ '--card-color': '#3b82f6' } as any}>
          <div className="card-bg-glow blue"></div>
          <div className="card-header">
            <div>
              <div className="label">Toplam Portföy</div>
              <div className="value">{stats.total}</div>
            </div>
            <div className="icon-box blue glass"><LayoutDashboard size={24} /></div>
          </div>
          <div className="sub-text blue"><TrendingUp size={12} className="inline-icon" /> Sistemdeki İlanlar</div>
        </motion.div>

        <motion.div variants={itemAnim} className="premium-card hover-lift" style={{ '--card-color': '#a855f7' } as any}>
          <div className="card-bg-glow purple"></div>
          <div className="card-header">
            <div>
              <div className="label">Kazanılan Zaman</div>
              <div className="value">{timeSavedDisplay}</div>
            </div>
            <div className="icon-box purple glass"><Zap size={24} /></div>
          </div>
          <div className="sub-text purple">⚡ Yapay Zeka Verimliliği</div>
        </motion.div>

        <motion.div variants={itemAnim} className="premium-card hover-lift" style={{ '--card-color': '#f97316' } as any}>
          <div className="card-bg-glow orange"></div>
          <div className="card-header compact">
            <div>
              <div className="label small">İlan Oluşturma</div>
              <div className="value large">
                {stats.limits.listing.used} <span className="limit-span">/ {stats.limits.listing.limit}</span>
              </div>
            </div>
            <div className="icon-box orange glass"><FileText size={24} /></div>
          </div>
          <div className="progress-bar-wrapper">
            <motion.div className="progress-fill orange" initial={{ width: 0 }} animate={{ width: `${getPercent(stats.limits.listing.used, stats.limits.listing.limit)}%` }} transition={{ duration: 1.5, ease: "easeOut" }} />
          </div>
          <div className="sub-text orange mt-small">🔥 Ana Paket Kotası</div>
        </motion.div>
      </motion.div>

      {/* ARA BAŞLIK */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="section-divider">
        <h3><Sparkles size={18}/> AI Stüdyo Limitleri</h3>
      </motion.div>

      {/* ALT BÖLÜM: AI ARAÇLARI */}
      <motion.div className="stats-grid" variants={container} initial="hidden" animate="show">
        <motion.div variants={itemAnim} className="premium-card hover-lift" style={{ '--card-color': '#ec4899' } as any}>
          <div className="card-header compact">
            <div>
              <div className="label small">Görsel İyileştirme</div>
              <div className="value medium">
                {stats.limits.image.used} <span className="limit-span">/ {stats.limits.image.limit}</span>
              </div>
            </div>
            <div className="icon-box pink glass"><ImageIcon size={20} /></div>
          </div>
          <div className="progress-bar-wrapper small">
            <motion.div className="progress-fill pink" initial={{ width: 0 }} animate={{ width: `${getPercent(stats.limits.image.used, stats.limits.image.limit)}%` }} transition={{ duration: 1.2 }} />
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="premium-card hover-lift" style={{ '--card-color': '#6366f1' } as any}>
          <div className="card-header compact">
            <div>
              <div className="label small">Sosyal Medya</div>
              <div className="value medium">
                {stats.limits.social.used} <span className="limit-span">/ {stats.limits.social.limit}</span>
              </div>
            </div>
            <div className="icon-box indigo glass"><Share2 size={20} /></div>
          </div>
          <div className="progress-bar-wrapper small">
            <motion.div className="progress-fill indigo" initial={{ width: 0 }} animate={{ width: `${getPercent(stats.limits.social.used, stats.limits.social.limit)}%` }} transition={{ duration: 1.2 }} />
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="premium-card hover-lift" style={{ '--card-color': '#10b981' } as any}>
          <div className="card-header compact">
            <div>
              <div className="label small">Sora Video</div>
              <div className="value medium">
                {stats.limits.video.used} <span className="limit-span">/ {stats.limits.video.limit}</span>
              </div>
            </div>
            <div className="icon-box emerald glass"><Video size={20} /></div>
          </div>
          <div className="progress-bar-wrapper small">
            <motion.div className="progress-fill emerald" initial={{ width: 0 }} animate={{ width: `${getPercent(stats.limits.video.used, stats.limits.video.limit)}%` }} transition={{ duration: 1.2 }} />
          </div>
        </motion.div>
      </motion.div>

      {/* --- SON EKLENENLER TABLOSU (GÜNCELLENDİ: HER ZAMAN GÖRÜNÜR) --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.6 }} 
        className="mt-10"
      >
        
        {/* Glass Panel'e yeni 'premium-table-wrapper' sınıfını ekledik */}
        <div className="glass-panel premium-table-wrapper rounded-xl">
          
          <div className="section-header"> 
            <h3><FolderOpen size={18} className="text-purple-400"/> Son Portföyler</h3>
            {stats.total > 0 && (
              <Link href="/dashboard/portfolios">Tümünü Gör</Link>
            )}
          </div>
          
          {stats.total > 0 ? (
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Başlık</th>
                    <th>Konum</th>
                    <th>Tip</th>
                    <th>Tarih</th>
                    <th style={{textAlign: 'right'}}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.details.district} / {item.details.city}</td>
                      <td><span className="badge-type">{item.details.propertyType}</span></td>
                      <td className="date-cell"><Clock size={14} />{new Date(item.created_at).toLocaleDateString('tr-TR')}</td>
                      <td style={{textAlign: 'right'}}><Link href={`/dashboard/portfolios/${item.id}`}>Detay</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State Premium */
            <div className="empty-state-premium">
               <div className="icon-stack">
                 <div className="bg-circle">
                   <Search size={32} className="main-icon"/>
                 </div>
               </div>
               <h3>Henüz Kayıtlı Portföy Yok</h3>
               <p>Sisteme ilk portföyünüzü ekleyerek yapay zeka destekli içerik üretimine başlayın.</p>
               
               <Link href="/dashboard/generate" className="btn btn-primary btn-glow">
                 <PlusCircle size={18} className="mr-2"/> İlk Portföyünü Oluştur
               </Link>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}