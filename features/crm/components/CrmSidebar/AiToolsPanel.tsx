'use client';

import React, { useState } from 'react';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore'; //
import { AiToolMode } from '@/features/crm/api/types'; //
import { 
  MessageSquare, Sparkles, Activity, 
  Copy, RefreshCw, Check, Loader2, AlertCircle 
} from 'lucide-react';
import styles from './AiToolsPanel.module.scss'; //

// Araç Tanımları
const AI_TOOLS: { mode: AiToolMode; label: string; icon: any; desc: string }[] = [
  { 
    mode: 'message_draft', 
    label: 'Mesaj Hazırla', 
    icon: MessageSquare, 
    desc: 'Müşteri geçmişine ve portföy durumuna göre taslak oluşturur.' 
  },
  { 
    mode: 'smart_match', 
    label: 'Akıllı Eşleşme', 
    icon: Sparkles, 
    desc: 'Müşteri kriterlerine uygun portföyleri önerir.' 
  },
  { 
    mode: 'tracking_perception', 
    label: 'Takip Analizi', 
    icon: Activity, 
    desc: 'Müşteri nabzını ve risk durumunu ölçer.' 
  },
];

export default function AiToolsPanel({ currentMode = 'message_draft' }: { currentMode?: AiToolMode }) {
  const { selectedCustomerId, selectedDealId } = useCrmStore();
  const [activeMode, setActiveMode] = useState<AiToolMode>(currentMode);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ draft?: string; whatsapp_url?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Çalıştır Butonu Mantığı
  const handleRunTool = async () => {
    if (!selectedCustomerId) {
      setError("Lütfen önce listeden bir müşteri seçin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Sadece 'message_draft' modu için özel backend rotamızı kullanıyoruz
      if (activeMode === 'message_draft') {
        const response = await fetch('/api/crm/message-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: selectedCustomerId,
            deal_id: selectedDealId, // Opsiyonel
            message_goal: 'follow_up'
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'İşlem başarısız.');
        }

        const data = await response.json();
        setResult(data); 
      } else {
        // Diğer modlar için placeholder (İleride eklenebilir)
        setError("Bu özellik henüz aktif değil.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Beklenmedik bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.draft) {
      navigator.clipboard.writeText(result.draft);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const activeToolDef = AI_TOOLS.find(t => t.mode === activeMode);

  return (
    <div className={styles.container}>
      {/* 1. ÜST MENÜ (Tablar) */}
      <div className={styles.toolsMenu}>
        {AI_TOOLS.map((tool) => (
          <button
            key={tool.mode}
            className={`${styles.toolBtn} ${activeMode === tool.mode ? styles.active : ''}`}
            onClick={() => { setActiveMode(tool.mode); setResult(null); setError(null); }}
          >
            <tool.icon size={20} />
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* 2. İÇERİK ALANI */}
      <div className={styles.contentArea}>
        
        {/* Başlık */}
        <div className={styles.toolHeader}>
          <h4>{activeToolDef?.label}</h4>
          <p>{activeToolDef?.desc}</p>
        </div>

        {/* Hata Bildirimi */}
        {error && (
          <div className={styles.errorMsg}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* SONUÇ GÖSTERİMİ */}
        {result ? (
          <div className={styles.resultContainer}>
            
            {/* Mesaj Taslağı */}
            {result.draft && (
              <div className={styles.draftBox}>
                <div className={styles.draftHeader}>
                  <span>Mesaj Taslağı</span>
                  <button onClick={copyToClipboard} className={styles.iconBtn} title="Kopyala">
                    {isCopied ? <Check size={16} color="green"/> : <Copy size={16}/>}
                  </button>
                </div>
                <textarea 
                  readOnly 
                  value={result.draft} 
                  className={styles.draftTextarea}
                />
              </div>
            )}

            {/* Aksiyon Butonları */}
            <div className={styles.actionButtons}>
              <button className={styles.secondaryBtn} onClick={() => setResult(null)}>
                <RefreshCw size={16} /> Yeniden
              </button>
              
              {result.whatsapp_url && (
                <a 
                  href={result.whatsapp_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className={styles.whatsappBtn}
                >
                  <MessageSquare size={18} /> WhatsApp'ta Aç
                </a>
              )}
            </div>
          </div>
        ) : (
          /* BOŞ DURUM: ÇALIŞTIR BUTONU */
          <div className={styles.emptyState}>
            <button 
              className={styles.runBtn} 
              onClick={handleRunTool} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.spin} size={20} />
                  Mesaj Hazırlanıyor...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  {activeToolDef?.label} Çalıştır
                </>
              )}
            </button>
            {isLoading && <p className={styles.loadingText}>Veriler analiz ediliyor, lütfen bekleyin...</p>}
          </div>
        )}
      </div>
    </div>
  );
}