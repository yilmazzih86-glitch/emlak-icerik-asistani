// features/crm/components/CrmSidebar/CrmSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styles from './CrmSidebar.module.scss';
import { 
  X, User, CheckSquare, Activity, Sparkles, 
  Plus, Send, Target, AlertTriangle, History, 
  BrainCircuit, Loader2, Copy, Check, RotateCcw, 
  Search, Users, UserPlus, MessageCircle 
} from 'lucide-react'; // image_7fe350.png'deki Sparkles hatası düzeltildi
import { Customer, CrmTask, CrmActivity, AiAutomationMode } from '@/features/crm/api/types';
import { crmService } from '@/features/crm/api/crmService';
import { Button } from '@/components/ui/Button/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  onTransferToOpportunity: (customerId: string) => Promise<void>;
}

export const CrmSidebar = ({ isOpen, onClose, customer, onSelectCustomer, onTransferToOpportunity }: Props) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [poolCustomers, setPoolCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingPool, setIsLoadingPool] = useState(false);

  // Form State'leri
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newActivityNote, setNewActivityNote] = useState('');

  // AI State'leri
  const [aiLoading, setAiLoading] = useState<AiAutomationMode | null>(null);
  const [aiResult, setAiResult] = useState<{ mode: AiAutomationMode, text: string } | null>(null);

  // 1. Havuz Verilerini Yükle (Eğer müşteri seçili değilse)
  useEffect(() => {
    if (isOpen && !customer) {
      const fetchPool = async () => {
        try {
          setIsLoadingPool(true);
          const data = await crmService.getAllCustomers();
          setPoolCustomers(data);
        } catch (err) { console.error(err); } finally { setIsLoadingPool(false); }
      };
      fetchPool();
    }
  }, [isOpen, customer]);

  // 2. Müşteri Detaylarını Yükle (Eğer müşteri seçili ise)
  useEffect(() => {
    if (customer && isOpen) {
      const fetchDetails = async () => {
        const [tData, aData] = await Promise.all([
          crmService.getCustomerTasks(customer.id),
          crmService.getCustomerActivities(customer.id)
        ]);
        setTasks(tData);
        setActivities(aData);
      };
      fetchDetails();
    }
  }, [customer, isOpen]);

  const runAiAutomation = async (mode: AiAutomationMode) => {
    if (!customer) return;
    try {
      setAiLoading(mode);
      setAiResult(null);
      const res = await crmService.executeAiAutomation({ mode, customer_id: customer.id });
      setAiResult({ mode, text: res.output });
    } catch (err) { alert("AI işlemi sırasında bir hata oluştu."); } finally { setAiLoading(null); }
  };

  // image_7ffd92.png'deki 5'li yapı ve açıklamalar
  const aiOptions = [
    { id: 'message_draft', label: 'Mesaj Hazırlama', icon: <Send size={18}/>, desc: 'Aşama ve etkileşimi analiz ederek WhatsApp taslağı üretir.' },
    { id: 'smart_match', label: 'Akıllı Eşleştirme', icon: <Target size={18}/>, desc: 'Müşteri kriterlerine göre en uygun portföyleri skorlar.' },
    { id: 'followup_alert', label: 'Takip & Sessizlik', icon: <AlertTriangle size={18}/>, desc: 'İletişim kopukluğu olan riskli müşterileri tespit eder.' },
    { id: 'relationship_memo', label: 'Satış Sonrası', icon: <History size={18}/>, desc: 'İlişki hafızası ile zaman bazlı temas önerileri sunar.' },
    { id: 'consultant_insight', label: 'Danışman İçgörü', icon: <BrainCircuit size={18}/>, desc: 'Süreci tarayarak atılması gereken bir sonraki adımı belirtir.' }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* image_7ff2e9.png'deki ovalleşme SCSS'de sabit ölçü ile çözülecek */}
        <button className={styles.closeBtn} onClick={onClose}><X size={20}/></button>

        <div className={styles.sidebar__content}>
          {!customer ? (
            /* --- MÜŞTERİ HAVUZU GÖRÜNÜMÜ --- */
            <div className={styles.poolSection}>
              <div className={styles.poolHeader}>
                <Users size={22} color="#8b5cf6" />
                <h2>Müşteri Havuzu</h2>
              </div>
              <div className={styles.searchBar}>
                <Search size={16} />
                <input placeholder="Müşteri ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className={styles.list}>
                {isLoadingPool ? <div className={styles.center}><Loader2 className="animate-spin" /></div> : 
                  poolCustomers.filter(c => c.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                    <div key={c.id} className={styles.poolItem}>
                      <div className={styles.info} onClick={() => onSelectCustomer(c)}>
                        <p className={styles.name}>{c.full_name}</p>
                        <small className={styles.phone}>{c.phone || 'Telefon Yok'}</small>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => onTransferToOpportunity(c.id)} icon={<UserPlus size={14}/>}>Aktar</Button>
                    </div>
                  ))
                }
              </div>
            </div>
          ) : (
            /* --- MÜŞTERİ DETAY GÖRÜNÜMÜ --- */
            <>
              <div className={styles.detailHeader}>
                <div className={styles.avatar}>{customer.full_name.charAt(0)}</div>
                <h2>{customer.full_name}</h2>
              </div>

              <nav className={styles.tabs}>
                <button className={activeTab === 'profile' ? styles.active : ''} onClick={() => setActiveTab('profile')}>PROFIL</button>
                <button className={activeTab === 'tasks' ? styles.active : ''} onClick={() => setActiveTab('tasks')}>GÖREVLER</button>
                <button className={activeTab === 'activities' ? styles.active : ''} onClick={() => setActiveTab('activities')}>AKIŞ</button>
                <button className={activeTab === 'ai' ? styles.active : ''} onClick={() => setActiveTab('ai')}><Sparkles size={14}/> AI</button>
                <button className={styles.backBtn} onClick={() => onSelectCustomer(null)}><RotateCcw size={14}/></button>
              </nav>

              <div className={styles.tabBody}>
                {activeTab === 'profile' && (
                  <div className={styles.profileGrid}>
                    <div className={styles.infoCard}>
                      <label>İLETİŞİM</label>
                      <p><strong>Tel:</strong> {customer.phone}</p>
                      <p><strong>E-posta:</strong> {customer.email || 'Girilmemiş'}</p>
                    </div>
                    <div className={styles.infoCard}>
                      <label>TERCİHLER</label>
                      <p><strong>Bütçe:</strong> {customer.budget_max?.toLocaleString()} TL</p>
                      <p><strong>Bölgeler:</strong> {customer.interested_districts?.join(', ') || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                )}

                {/* image_7ffd38.png: Ekle Butonlu Görev Girişi */}
                {activeTab === 'tasks' && (
                  <div className={styles.inputSection}>
                    <div className={styles.actionInput}>
                      <input placeholder="Yeni görev..." value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                      <Button variant="primary" size="sm" icon={<Plus size={16}/>}>Ekle</Button>
                    </div>
                    <div className={styles.scrollList}>
                      {tasks.map(t => <div key={t.id} className={styles.listItem}>{t.title}</div>)}
                    </div>
                  </div>
                )}

                {/* image_7ffd58.png: Ekle Butonlu Aktivite Girişi */}
                {activeTab === 'activities' && (
                  <div className={styles.inputSection}>
                    <div className={styles.actionInput}>
                      <input placeholder="Aktivite notu..." value={newActivityNote} onChange={e => setNewActivityNote(e.target.value)} />
                      <Button variant="ghost" size="sm" icon={<MessageCircle size={16}/>}>Ekle</Button>
                    </div>
                    <div className={styles.scrollList}>
                      {activities.map(a => <div key={a.id} className={styles.listItem}>{a.description}</div>)}
                    </div>
                  </div>
                )}

                {/* image_7ffd92.png: 5'li AI Grid Yapısı */}
                {activeTab === 'ai' && (
                  <div className={styles.aiSection}>
                    {!aiResult ? (
                      <div className={styles.aiGrid}>
                        {aiOptions.map(opt => (
                          <div key={opt.id} className={styles.aiCard} onClick={() => runAiAutomation(opt.id as any)}>
                            <div className={styles.aiCard__header}>
                              <div className={styles.icon}>{aiLoading === opt.id ? <Loader2 className="animate-spin" /> : opt.icon}</div>
                              <span>{opt.label}</span>
                            </div>
                            <p>{opt.desc}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.aiResponse}>
                        <div className={styles.aiResponse__header}>
                          <h4>AI Analizi</h4>
                          <button onClick={() => setAiResult(null)}><RotateCcw size={14}/> Geri</button>
                        </div>
                        <div className={styles.aiResponse__body}>{aiResult.text}</div>
                        <Button variant="primary" style={{width:'100%'}} onClick={() => navigator.clipboard.writeText(aiResult.text)}>Kopyala</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};