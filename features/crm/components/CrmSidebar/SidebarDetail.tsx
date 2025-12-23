// features/crm/components/CrmSidebar/SidebarDetail.tsx

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { crmService } from '@/features/crm/api/crmService';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { ActivityType } from '../../api/types';
import { 
  X, Phone, Mail, MapPin, Calendar, 
  CheckSquare, MessageSquare, BrainCircuit, History, User, 
  Send, FileText, CheckCircle2 // Eksik ikonlar eklendi
} from 'lucide-react';
import styles from './CrmSidebar.module.scss';
import AiToolsPanel from './AiToolsPanel';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Badge } from '@/components/ui/Badge/Badge';

// YARDIMCI FONKSİYONLAR
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
};

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'call': return <Phone size={14} />;
    case 'meeting': return <Calendar size={14} />;
    case 'whatsapp': return <MessageSquare size={14} />;
    case 'email': return <Mail size={14} />;
    case 'note': return <FileText size={14} />;
    case 'task_done': return <CheckCircle2 size={14} />;
    default: return <FileText size={14} />;
  }
};

export default function SidebarDetail() {
  const { 
    selectedCustomerDetail,
    closeSidebar, 
    activeDetailTab, 
    setDetailTab,
    addActivityToState // EKSİK OLAN FONKSİYON EKLENDİ
  } = useCrmStore();

  // "customer" değişkenini selectedCustomerDetail üzerinden tanımlıyoruz
  const customer = selectedCustomerDetail;

  const [actType, setActType] = useState<ActivityType>('note');
  const [actDesc, setActDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    fetchUser();
  }, []);

  // NULL CHECK: Veri yoksa render etme
  if (!customer) return null;

  const handleAddActivity = async () => {
    if (!actDesc.trim()) return alert("Lütfen bir açıklama girin.");
    if (!currentUserId) return;

    setIsSubmitting(true);
    try {
      const newActivity = await crmService.createActivity({
        customer_id: customer.id,
        type: actType,
        description: actDesc,
        created_by: currentUserId,
        meta: {}
      });

      if (newActivity) {
        addActivityToState(newActivity); // EKSİK KOD EKLENDİ: Store güncellemesi
      }
      
      setActDesc('');
      setActType('note');
    } catch (error) {
      console.error("Hata:", error);
      alert("Aktivite eklenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.detailContainer}>
      {/* HEADER */}
      <header className={styles.detailHeader}>
        <div className={styles.headerTop}>
          <button onClick={closeSidebar} className={styles.backBtn}><X size={18} /></button>
        </div>

        <div className={styles.profileSection}>
  {/* DÜZELTME 1: Avatar Kullanımı */}
  {/* 'alt' ve 'fallback' kaldırıldı, çünkü bileşen bunları kendi hallediyor */}
  <Avatar 
    src={customer.avatar_url} 
    name={customer.full_name} 
    size="xl" 
  />
          <h2>{customer.full_name}</h2>
          <span className={styles.subInfo}>{customer.phone}</span>
          <div className={styles.tags}>
     {/* DÜZELTME 2: Badge Renkleri */}
     {/* 'blue' -> 'info' (Mavi), 'outline' -> 'default' (Gri) olarak değiştirildi */}
     <Badge variant="info">{customer.stage || 'Yeni'}</Badge>
     {customer.source && <Badge variant="default">{customer.source}</Badge>}
  </div>
</div>

        <div className={styles.tabs}>
          <button className={activeDetailTab === 'info' ? styles.active : ''} onClick={() => setDetailTab('info')}>Bilgiler</button>
          <button className={activeDetailTab === 'history' ? styles.active : ''} onClick={() => setDetailTab('history')}>Geçmiş</button>
          <button className={activeDetailTab === 'tasks' ? styles.active : ''} onClick={() => setDetailTab('tasks')}>Görevler</button>
          <button className={activeDetailTab === 'ai' ? styles.active : ''} onClick={() => setDetailTab('ai')}>AI Asistan</button>
        </div>
      </header>

      {/* İÇERİK */}
      <div className={styles.contentArea}>
        
        {/* TAB 1: INFO */}
        {activeDetailTab === 'info' && (
          <div className={styles.infoTab}>
             <div className={styles.infoGroup}>
                <label>E-Posta</label>
                <p>{customer.email || '-'}</p>
             </div>
             <div className={styles.infoGroup}>
                <label>Bütçe</label>
                <p>{customer.budget_min ? `${customer.budget_min} - ${customer.budget_max}` : '-'}</p>
             </div>
             <div className={styles.infoGroup}>
                <label>Notlar</label>
                <p className={styles.notes}>{customer.notes || 'Not yok.'}</p>
             </div>
          </div>
        )}

        {/* TAB 2: GEÇMİŞ (HISTORY) */}
        {activeDetailTab === 'history' && (
          <div className={styles.historyTab}>
            {/* Yeni Aktivite Kutusu */}
            <div className={styles.newActivityBox}>
              <div className={styles.boxHeader}>
                <select 
                  value={actType} 
                  onChange={(e) => setActType(e.target.value as ActivityType)}
                  className={styles.typeSelect}
                >
                  <option value="note">Not Al</option>
                  <option value="call">Telefon</option>
                  <option value="meeting">Toplantı</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <textarea 
                placeholder="Detaylar..."
                value={actDesc}
                onChange={(e) => setActDesc(e.target.value)}
                rows={3}
              />
              <div className={styles.boxFooter}>
                <button onClick={handleAddActivity} disabled={isSubmitting || !actDesc} className={styles.sendBtn}>
                  {isSubmitting ? '...' : <><Send size={14}/> Ekle</>}
                </button>
              </div>
            </div>

            {/* Liste */}
            <div className={styles.timeline}>
              {customer.activities && customer.activities.length > 0 ? (
                customer.activities.map((act) => (
                  <div key={act.id} className={styles.timelineItem}>
                    <div className={styles.iconWrapper}>
                      {getActivityIcon(act.type)}
                    </div>
                    <div className={styles.itemContent}>
                      <div className={styles.itemHeader}>
                        <span className={styles.actType}>{act.type}</span>
                        <span className={styles.date}>{formatDate(act.created_at)}</span>
                      </div>
                      <p>{act.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <History size={32} />
                  <p>Henüz kayıt yok.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: GÖREVLER (TASKS) */}
        {activeDetailTab === 'tasks' && (
          <div className={styles.tasksTab}>
            <h3>Yapılacaklar</h3>
            {customer.tasks && customer.tasks.map(task => (
              <div key={task.id} className={styles.taskCard}>
                <div className={styles.taskInfo}>
                  <span>{task.title}</span>
                  {task.due_date && <span className={styles.dueDate}>{formatDate(task.due_date)}</span>}
                </div>
              </div>
            ))}
             {(!customer.tasks || customer.tasks.length === 0) && <p>Görev yok.</p>}
          </div>
        )}

        {/* TAB 4: AI */}
        {activeDetailTab === 'ai' && <AiToolsPanel />}
      </div>
    </div>
  );
}