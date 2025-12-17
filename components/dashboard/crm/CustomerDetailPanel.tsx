"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  X, Phone, MessageCircle, Mail, MapPin, Wallet, Calendar, 
  Clock, CheckCircle2, Plus, FileText, Star, Home, TrendingUp, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Customer, CrmActivity, CrmTask, CrmCustomerPortfolio, Portfolio } from "@/types";

interface CustomerDetailPanelProps {
  customer: Customer | null;
  onClose: () => void;
}

export default function CustomerDetailPanel({ customer, onClose }: CustomerDetailPanelProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'activity' | 'tasks' | 'portfolios' | 'ai'>('activity');
  
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [portfolios, setPortfolios] = useState<CrmCustomerPortfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState("");

  // Portföy Ekleme State
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [allPortfolios, setAllPortfolios] = useState<Portfolio[]>([]);

  useEffect(() => {
    if (customer) {
      fetchDetails();
    }
  }, [customer, activeTab]);

  const fetchDetails = async () => {
    if (!customer) return;
    setLoading(true);

    if (activeTab === 'activity') {
      const { data } = await supabase.from('crm_activities').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false });
      if(data) setActivities(data as any);
    } else if (activeTab === 'tasks') {
      const { data } = await supabase.from('crm_tasks').select('*').eq('customer_id', customer.id).order('due_date', { ascending: true });
      if(data) setTasks(data as any);
    } else if (activeTab === 'portfolios') {
      const { data } = await supabase.from('crm_customer_portfolios').select('*, portfolios(*)').eq('customer_id', customer.id).order('added_at', { ascending: false });
      if(data) setPortfolios(data as any);
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    if(!newNote || !customer) return;
    await supabase.from('crm_activities').insert({
      customer_id: customer.id,
      type: 'note',
      description: newNote,
      created_by: customer.user_id
    });
    await supabase.from('customers').update({ last_note: newNote }).eq('id', customer.id);
    setNewNote("");
    fetchDetails(); 
  };

  const openPortfolioModal = async () => {
    setIsPortfolioModalOpen(true);
    const { data } = await supabase.from('portfolios').select('*').eq('status', 'active').order('created_at', { ascending: false });
    if(data) setAllPortfolios(data as any);
  };

  const linkPortfolio = async (portfolioId: string) => {
    if(!customer) return;
    const { error } = await supabase.from('crm_customer_portfolios').insert({
      customer_id: customer.id,
      portfolio_id: portfolioId
    });
    if (!error) {
      await supabase.from('crm_activities').insert({
        customer_id: customer.id,
        type: 'task_done',
        description: 'Portföy önerildi.',
        created_by: customer.user_id
      });
      setIsPortfolioModalOpen(false);
      fetchDetails();
    }
  };

  if (!customer) return null;

  return (
    <AnimatePresence>
      <motion.div 
        key="backdrop" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose} 
        className="panel-backdrop"
      />
      
      {/* 2. Düzeltme: key="panel" eklendi */}
      <motion.div 
        key="panel"
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="customer-detail-panel"
      >
        {/* SOL PANEL */}
        <div className="left-sidebar custom-scrollbar">
           <div className="profile-header">
              <div className="avatar-large">
                 {customer.avatar_url ? <img src={customer.avatar_url} alt="Avatar"/> : customer.full_name.charAt(0).toUpperCase()}
              </div>
              <h2>{customer.full_name}</h2>
              {/* DÜZELTME: Tailwind sınıfları kaldırıldı */}
              <div className="profile-badges">
                <span className={`badge ${customer.type}`}>{customer.type === 'buy' ? 'ALICI' : 'SATICI'}</span>
                <span className="stage-tag">{customer.stage}</span>
              </div>
           </div>

           <div className="info-section">
              <label>İletişim</label>
              <div className="info-item"><Phone size={14}/> {customer.phone}</div>
              {customer.email && <div className="info-item"><Mail size={14}/> {customer.email}</div>}
              <button className="btn-whatsapp-full"><MessageCircle size={16}/> WhatsApp Başlat</button>
           </div>

           <div className="info-section note-box">
              <label>Hızlı Not Ekle</label>
              <textarea placeholder="Görüşme notu..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
              <button onClick={handleAddNote} className="btn-save-mini">Kaydet</button>
           </div>
        </div>

        {/* ORTA PANEL */}
        <div className="main-content">
           <div className="detail-header">
              <div className="tabs">
                 <button onClick={() => setActiveTab('activity')} className={activeTab === 'activity' ? 'active' : ''}>Etkileşimler</button>
                 <button onClick={() => setActiveTab('tasks')} className={activeTab === 'tasks' ? 'active' : ''}>Görevler</button>
                 <button onClick={() => setActiveTab('portfolios')} className={activeTab === 'portfolios' ? 'active' : ''}>Portföyler</button>
                 <button onClick={() => setActiveTab('ai')} className={activeTab === 'ai' ? 'active ai-tab' : 'ai-tab'}><Sparkles size={14}/> AI Analiz</button>
              </div>
              <button onClick={onClose} className="close-btn"><X size={20}/></button>
           </div>

           <div className="tab-content custom-scrollbar">
              
              {/* AKTİVİTE */}
              {activeTab === 'activity' && (
                 <div className="timeline">
                    {activities.length === 0 && <div className="empty-msg">Henüz aktivite yok.</div>}
                    {activities.map(act => (
                       <div key={act.id} className="timeline-item">
                          <div className="icon-wrapper"><FileText size={14}/></div>
                          <div className="content">
                             <div className="header">
                                <span className="date">{new Date(act.created_at).toLocaleDateString('tr-TR')}</span>
                             </div>
                             <p>{act.description}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              )}

              {/* GÖREVLER */}
              {activeTab === 'tasks' && (
                 <div className="task-list">
                    <div className="empty-msg">Görev yönetimi için Ajanda panelini kullanın.</div>
                    {tasks.map(task => (
                       <div key={task.id} className="task-row">
                          <input type="checkbox" checked={task.is_completed} readOnly />
                          <span>{task.title}</span>
                          <span className="date">{task.due_date ? new Date(task.due_date).toLocaleDateString('tr-TR') : '-'}</span>
                       </div>
                    ))}
                 </div>
              )}

              {/* PORTFÖYLER */}
              {activeTab === 'portfolios' && (
                 <div className="portfolio-tab-container">
                    <button onClick={openPortfolioModal} className="btn-add-portfolio">
                      <Plus size={16}/> Portföy Ekle / Eşleştir
                    </button>

                    <div className="portfolio-grid-mini">
                      {portfolios.length === 0 && <div className="empty-msg">Henüz portföy eklenmemiş.</div>}
                      {portfolios.map(p => (
                         <div key={p.id} className="mini-card">
                            <div className="img-box">
                               <img src={p.portfolios?.image_urls?.[0] || "https://via.placeholder.com/300?text=No+Image"} alt="Portfolio" />
                               <span className="match-score">%85 Uyum</span>
                            </div>
                            <div className="info">
                               <h4>{p.portfolios?.title}</h4>
                               <p>{p.portfolios?.price?.toLocaleString()} ₺</p>
                            </div>
                         </div>
                      ))}
                    </div>
                    
                    {/* PORTFÖY SEÇİM MODALI */}
                    {isPortfolioModalOpen && (
                      <div className="selection-modal-overlay">
                        <div className="selection-modal">
                          <div className="modal-header">
                             <h3>Portföy Seç</h3>
                             <button onClick={() => setIsPortfolioModalOpen(false)}><X size={20}/></button>
                          </div>
                          <div className="modal-list custom-scrollbar">
                             {allPortfolios.map(p => (
                               <div key={p.id} onClick={() => linkPortfolio(p.id)} className="list-item">
                                  <div className="thumb">
                                    {p.image_urls?.[0] ? <img src={p.image_urls[0]}/> : <Home size={20}/>}
                                  </div>
                                  <div className="details">
                                    <h4>{p.title}</h4>
                                    <p>{p.city} / {p.district} • <span>{p.price?.toLocaleString()} ₺</span></p>
                                  </div>
                                  <Plus size={16} className="add-icon"/>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    )}
                 </div>
              )}

              {/* AI ANALİZ - DÜZELTİLDİ: Tailwind sınıfları kaldırıldı */}
              {activeTab === 'ai' && (
                 <div className="ai-panel">
                    <div className="ai-card profile">
                       <h4><Star size={16}/> Müşteri Profili</h4>
                       <ul>
                          <li>Yatırımcı potansiyeli yüksek.</li>
                          <li>Nakit alım yapabilir.</li>
                          <li>Bölge dışına çıkmaya sıcak bakmıyor.</li>
                       </ul>
                    </div>
                    <div className="ai-card action">
                       <h4><TrendingUp size={16}/> Önerilen Aksiyon</h4>
                       <p>Bu müşteriyi "Kuşadası Projesi" için aramayı düşünebilirsiniz. Bütçesi ve istekleri %85 uyumlu.</p>
                    </div>
                 </div>
              )}

           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}