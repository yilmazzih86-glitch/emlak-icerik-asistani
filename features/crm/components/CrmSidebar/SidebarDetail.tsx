// features/crm/components/CrmSidebar/SidebarDetail.tsx

import React from 'react';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { STAGE_LABELS } from '@/features/crm/api/types';
import { 
  X, Phone, Mail, MapPin, Calendar, 
  CheckSquare, MessageSquare, BrainCircuit, History, User 
} from 'lucide-react';
import styles from './CrmSidebar.module.scss'; // Ortak stilleri kullanıyoruz
import AiToolsPanel from './AiToolsPanel'; // Bir sonraki adımda güncelleyeceğiz

const SidebarDetail = () => {
  const { 
    selectedCustomerDetail, 
    isLoading, 
    closeSidebar, 
    activeDetailTab, 
    setDetailTab 
  } = useCrmStore();

  // Yükleniyor durumu (Skeleton Effect)
  if (isLoading || !selectedCustomerDetail) {
    return (
      <aside className={styles.sidebarDetail}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Müşteri profili ve analizler yükleniyor...</p>
        </div>
      </aside>
    );
  }

  const { full_name, phone, email, stage, budget_min, budget_max, location_interest, notes } = selectedCustomerDetail;

  // Para formatı
  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className={styles.sidebarDetail}>
      {/* --- HEADER --- */}
      <header className={styles.detailHeader}>
        <div className={styles.headerTop}>
          <button onClick={closeSidebar} className={styles.closeBtn}>
            <X size={20} />
          </button>
          <span className={`${styles.badge} ${styles[stage || 'NEW']}`}>
            {stage ? STAGE_LABELS[stage] : 'Yeni Müşteri'}
          </span>
        </div>
        
        <div className={styles.profileSummary}>
          <div className={styles.avatarLarge}>
            {full_name.charAt(0).toUpperCase()}
          </div>
          <h2>{full_name}</h2>
          <div className={styles.quickContacts}>
            <a href={`tel:${phone}`} className={styles.contactLink}><Phone size={14} /> {phone}</a>
            {email && <a href={`mailto:${email}`} className={styles.contactLink}><Mail size={14} /> {email}</a>}
          </div>
        </div>

        {/* --- TABS --- */}
        <nav className={styles.tabs}>
          <button 
            className={activeDetailTab === 'info' ? styles.active : ''} 
            onClick={() => setDetailTab('info')}
          >
            <User size={16} /> Bilgi
          </button>
          <button 
            className={activeDetailTab === 'history' ? styles.active : ''} 
            onClick={() => setDetailTab('history')}
          >
            <History size={16} /> Geçmiş
          </button>
          <button 
            className={activeDetailTab === 'tasks' ? styles.active : ''} 
            onClick={() => setDetailTab('tasks')}
          >
            <CheckSquare size={16} /> Görevler
          </button>
          <button 
            className={`${styles.aiTab} ${activeDetailTab === 'ai' ? styles.active : ''}`} 
            onClick={() => setDetailTab('ai')}
          >
            <BrainCircuit size={16} /> AI Asistan
          </button>
        </nav>
      </header>

      {/* --- CONTENT AREA --- */}
      <div className={styles.detailContent}>
        
        {/* TAB 1: BİLGİ */}
        {activeDetailTab === 'info' && (
          <div className={styles.infoTab}>
            <section className={styles.section}>
              <h3>Tercihler</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Bütçe Aralığı</label>
                  <span>{formatCurrency(budget_min)} - {formatCurrency(budget_max)}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>İlgilenilen Konum</label>
                  <span><MapPin size={14}/> {location_interest || 'Belirtilmemiş'}</span>
                </div>
              </div>
            </section>
            
            <section className={styles.section}>
              <h3>Notlar</h3>
              <div className={styles.noteBox}>
                {notes || 'Müşteri hakkında henüz bir not girilmemiş.'}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: GEÇMİŞ (Zaman Tüneli) */}
        {activeDetailTab === 'history' && (
          <div className={styles.timelineTab}>
            {selectedCustomerDetail.activities.length === 0 ? (
              <p className={styles.emptyState}>Henüz bir aktivite kaydı yok.</p>
            ) : (
              <div className={styles.timeline}>
                {selectedCustomerDetail.activities.map((activity) => (
                  <div key={activity.id} className={styles.timelineItem}>
                    <div className={`${styles.icon} ${styles[activity.type]}`}>
                      {activity.type === 'call' && <Phone size={14} />}
                      {activity.type === 'meeting' && <Calendar size={14} />}
                      {activity.type === 'note' && <MessageSquare size={14} />}
                      {activity.type === 'ai_log' && <BrainCircuit size={14} />}
                    </div>
                    <div className={styles.content}>
                      <p>{activity.description}</p>
                      <span className={styles.date}>{formatDate(activity.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GÖREVLER & RANDEVULAR */}
        {activeDetailTab === 'tasks' && (
          <div className={styles.tasksTab}>
            <h3>Yaklaşan Randevular</h3>
            {selectedCustomerDetail.appointments.map(app => (
              <div key={app.id} className={styles.taskCard}>
                <div className={styles.taskHeader}>
                  <Calendar size={16} className={styles.iconAccent}/>
                  <span>{formatDate(app.appointment_date)}</span>
                </div>
                <h4>{app.title}</h4>
                {app.location && <p className={styles.location}><MapPin size={12}/> {app.location}</p>}
              </div>
            ))}

            <h3 style={{marginTop: '1.5rem'}}>Yapılacaklar</h3>
            {selectedCustomerDetail.tasks.map(task => (
              <div key={task.id} className={`${styles.taskCard} ${task.is_completed ? styles.completed : ''}`}>
                <div className={styles.checkbox}>
                  {task.is_completed ? <CheckSquare size={18} color="green"/> : <div className={styles.box} />}
                </div>
                <div className={styles.taskInfo}>
                  <span className={styles.taskTitle}>{task.title}</span>
                  {task.due_date && <span className={styles.dueDate}>{formatDate(task.due_date)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: AI ASİSTAN */}
        {activeDetailTab === 'ai' && (
          <AiToolsPanel />
        )}

      </div>
    </aside>
  );
};

export default SidebarDetail;