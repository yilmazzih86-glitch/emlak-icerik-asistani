// features/crm/components/CrmSidebar/AiToolsPanel.tsx

import React, { useState } from 'react';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { AiToolMode, AiResponse } from '@/features/crm/api/types';
import { 
  MessageSquare, BrainCircuit, Activity, 
  UserCheck, Sparkles, Copy, RefreshCw, ChevronRight 
} from 'lucide-react';
import styles from './AiToolsPanel.module.scss'; // Stilleri aşağıda vereceğim

// Araç Tanımları
const AI_TOOLS: { mode: AiToolMode; label: string; icon: any; desc: string }[] = [
  { 
    mode: 'message_draft', 
    label: 'Mesaj Hazırla', 
    icon: MessageSquare, 
    desc: 'Müşteri profiline ve aşamasına uygun mesaj taslağı oluşturur.' 
  },
  { 
    mode: 'smart_match', 
    label: 'Akıllı Eşleşme', 
    icon: Sparkles, 
    desc: 'Kriterlere en uygun portföyleri skorlayarak önerir.' 
  },
  { 
    mode: 'tracking_perception', 
    label: 'Takip Analizi', 
    icon: Activity, 
    desc: 'Sessizlik durumunu ve riskleri analiz eder.' 
  },
  { 
    mode: 'after_sales', 
    label: 'Satış Sonrası', 
    icon: UserCheck, 
    desc: 'Uzun vadeli ilişki için temas önerileri sunar.' 
  },
  { 
    mode: 'insight', 
    label: 'Danışman İçgörü', 
    icon: BrainCircuit, 
    desc: 'Tüm sürecin özetini ve bir sonraki adımı planlar.' 
  }
];

const AiToolsPanel = () => {
  const { selectedCustomerId, selectedCustomerDetail } = useCrmStore();
  const [activeMode, setActiveMode] = useState<AiToolMode>('insight'); // Varsayılan: İçgörü
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiResponse | null>(null);

  // AI İsteği
  const handleGenerate = async () => {
    if (!selectedCustomerId) return;
    
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/crm/ai-orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeMode,
          customerId: selectedCustomerId,
          // Müşteri verilerini de göndererek n8n tarafını besliyoruz
          context: {
            name: selectedCustomerDetail?.full_name,
            stage: selectedCustomerDetail?.stage,
            lastActivity: selectedCustomerDetail?.activities?.[0]
          }
        }),
      });

      if (!res.ok) throw new Error('AI Servisi yanıt vermedi.');

      const data = await res.json();
      setResponse(data); // { type, content, data? }
    } catch (error) {
      console.error(error);
      setResponse({ type: activeMode, content: 'Üzgünüm, şu an analiz yapılamadı. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  // Kopyalama Fonksiyonu
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Metin kopyalandı!');
  };

  // Aktif aracın tanımını bul
  const currentTool = AI_TOOLS.find(t => t.mode === activeMode);

  return (
    <div className={styles.container}>
      
      {/* 1. ARAÇ SEÇİM MENÜSÜ (Yatay Kaydırmalı) */}
      <div className={styles.toolsMenu}>
        {AI_TOOLS.map((tool) => (
          <button
            key={tool.mode}
            className={`${styles.toolBtn} ${activeMode === tool.mode ? styles.active : ''}`}
            onClick={() => { setActiveMode(tool.mode); setResponse(null); }}
          >
            <tool.icon size={18} />
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* 2. AKSİYON ALANI */}
      <div className={styles.actionArea}>
        <div className={styles.toolInfo}>
          <h4>{currentTool?.label}</h4>
          <p>{currentTool?.desc}</p>
        </div>
        
        <button 
          className={styles.generateBtn} 
          onClick={handleGenerate} 
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className={styles.spin} size={16} /> Analiz Ediliyor...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Çalıştır
            </>
          )}
        </button>
      </div>

      {/* 3. ÇIKTI ALANI */}
      <div className={styles.outputArea}>
        {loading && (
          <div className={styles.skeletonText}>
            <div className={styles.line}></div>
            <div className={styles.line} style={{ width: '80%' }}></div>
            <div className={styles.line} style={{ width: '60%' }}></div>
          </div>
        )}

        {!loading && response && (
          <div className={`${styles.resultCard} ${styles[response.type]}`}>
            
            {/* a) Mesaj Modu Çıktısı */}
            {response.type === 'message_draft' && (
              <div className={styles.messageBox}>
                <div className={styles.boxHeader}>
                  <span>Önerilen Taslak</span>
                  <button onClick={() => copyToClipboard(response.content)} title="Kopyala">
                    <Copy size={14} />
                  </button>
                </div>
                <textarea 
                  readOnly 
                  value={response.content} 
                  className={styles.textArea}
                />
              </div>
            )}

            {/* b) Akıllı Eşleşme Çıktısı (Liste) */}
            {response.type === 'smart_match' && response.data && Array.isArray(response.data) && (
              <div className={styles.portfolioList}>
                <p className={styles.summaryText}>{response.content}</p>
                {response.data.map((item: any, idx: number) => (
                  <div key={idx} className={styles.portfolioItem}>
                    <div className={styles.pInfo}>
                      <h5>{item.title}</h5>
                      <span className={styles.price}>{item.price}</span>
                    </div>
                    <div className={styles.pScore}>
                      Uyum: <strong>%{item.match_score}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* c) Standart Metin Çıktısı (İçgörü, Takip vb.) */}
            {['insight', 'tracking_perception', 'after_sales'].includes(response.type) && (
              <div className={styles.standardContent}>
                <div className={styles.aiBadge}>AI Analizi</div>
                <div className={styles.markdownLike}>
                  {response.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default AiToolsPanel;