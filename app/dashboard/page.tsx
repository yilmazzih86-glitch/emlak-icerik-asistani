"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PlusCircle, LayoutDashboard, Zap, FileText, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  // State yapısını yeni sisteme göre güncelledik
  const [stats, setStats] = useState({ 
    total: 0, 
    plan: 'free', 
    limit: 0, 
    used: 0, 
    recent: [] as any[] 
  });
  
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, portfoliosRes, countRes] = await Promise.all([
        // BURASI DEĞİŞTİ: Artık paket detaylarını çekiyoruz
        supabase.from("profiles").select("plan_type, listing_limit, listing_used").eq("id", user.id).single(),
        
        supabase.from("portfolios").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("portfolios").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      ]);

      setStats({
        total: countRes.count ?? 0,
        // Yeni verileri state'e işliyoruz (Varsayılan değerlerle)
        plan: profileRes.data?.plan_type || 'free',
        limit: profileRes.data?.listing_limit || 0,
        used: profileRes.data?.listing_used || 0,
        recent: portfoliosRes.data ?? []
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  // Animasyon Ayarları
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Hesaplanmış Veri: Kazanılan Zaman
  const timeSavedMinutes = stats.total * 45;
  const timeSavedDisplay = timeSavedMinutes > 60 
    ? `${(timeSavedMinutes / 60).toFixed(1)} Saat` 
    : `${timeSavedMinutes} dk`;

  // Progress Bar Yüzdesi Hesaplama (0'a bölme hatasını önlemek için kontrol)
  const progressPercent = stats.limit > 0 ? (stats.used / stats.limit) * 100 : 0;

  return (
    <div className="pt-6 pb-20">
      {/* Başlık */}
      <div className="dashboard-header">
        <div>
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            Genel Bakış
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Hoş geldin! Ajansının performans özeti burada.
          </motion.p>
        </div>
        <Link href="/dashboard/generate" className="btn btn-primary shadow-lg shadow-purple-500/20">
          <PlusCircle size={18} style={{ marginRight: '8px' }} />
          Yeni İçerik Üret
        </Link>
      </div>

      {/* İstatistik Kartları (Grid) */}
      <motion.div className="stats-grid" variants={container} initial="hidden" animate="show">
        
        {/* KART 1: TOPLAM PORTFÖY */}
        <motion.div variants={item} className="premium-card" style={{ '--card-color': '#3b82f6' } as any}>
          <div className="card-header">
            <div>
              <div className="label">Toplam Portföy</div>
              <div className="value">{stats.total}</div>
            </div>
            <div className="icon-box" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
              <LayoutDashboard size={24} />
            </div>
          </div>
          <div className="sub-text text-blue-300 bg-blue-500/10">
             <TrendingUp size={12} className="inline mr-1" /> Aktif İlanlar
          </div>
        </motion.div>

        {/* KART 2: KAZANILAN ZAMAN */}
        <motion.div variants={item} className="premium-card" style={{ '--card-color': '#a855f7' } as any}>
          <div className="card-header">
            <div>
              <div className="label">Kazanılan Zaman</div>
              <div className="value">{timeSavedDisplay}</div>
            </div>
            <div className="icon-box" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
              <Zap size={24} />
            </div>
          </div>
          <div className="sub-text text-purple-300 bg-purple-500/10">
             ⚡ AI Verimliliği
          </div>
        </motion.div>

        {/* KART 3: PAKET KULLANIMI (GÜNCELLENDİ) */}
        <motion.div variants={item} className="premium-card" style={{ '--card-color': '#f97316' } as any}>
          <div className="card-header mb-2"> {/* mb azaltıldı */}
            <div>
              <div className="label">Paket Kullanımı</div>
              <div className="value text-2xl mt-1">
                {stats.used} <span className="text-base text-gray-500 font-normal">/ {stats.limit}</span>
              </div>
            </div>
            <div className="icon-box" style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c' }}>
              <FileText size={24} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
            <motion.div 
              className="bg-orange-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          <div className="sub-text text-orange-300 bg-orange-500/10 mt-4">
             Paket: <span className="uppercase font-bold tracking-wide">{stats.plan}</span>
          </div>
        </motion.div>

      </motion.div>

      {/* TABLO KISMI */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10">
        {stats.total > 0 ? (
          <div className="glass-panel rounded-xl p-6">
            <div className="section-header"> 
              <h3>Son Eklenenler</h3>
              <Link href="/dashboard/portfolios">
                Tümünü Gör
              </Link>
            </div>
            
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
                      <td>
                        <span className="badge-type">
                          {item.details.propertyType}
                        </span>
                      </td>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        {new Date(item.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <Link href={`/dashboard/portfolios/${item.id}`}>
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-state">
             <h3>Henüz portföy eklenmedi</h3>
             <p>İlk portföyünüzü ekleyerek yapay zeka destekli içeriklerinizi oluşturmaya başlayın.</p>
             <Link href="/dashboard/generate" className="btn btn-outline">
               İlk Portföyü Ekle <ArrowRight size={16} style={{ marginLeft: '8px' }} />
             </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}