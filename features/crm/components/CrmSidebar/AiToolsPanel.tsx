'use client';

import React, { useState } from 'react';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { AiToolMode, SmartMatchPortfolioCard, SmartMatchResponse } from '@/features/crm/api/types'; // Tipi import etmeyi unutmayın
import { 
  MessageSquare, Sparkles, Activity, 
  Copy, RefreshCw, Check, Loader2, AlertCircle,
  TrendingUp, Info, ExternalLink, MapPin, AlertTriangle, ListChecks
} from 'lucide-react'; // Eksik ikonları import edin

import styles from './AiToolsPanel.module.scss';

// ... AI_TOOLS dizisi aynı kalacak ...
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // Tip any veya union type olabilir
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleRunTool = async () => {
    if (!selectedCustomerId) {
      setError("Lütfen önce listeden bir müşteri seçin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let endpoint = '';
      let body = {};

      // MODA GÖRE ENDPOINT SEÇİMİ
      if (activeMode === 'message_draft') {
        endpoint = '/api/crm/message-draft';
        body = { customer_id: selectedCustomerId, deal_id: selectedDealId, message_goal: 'follow_up' };
      } 
      else if (activeMode === 'smart_match') {
        endpoint = '/api/crm/smart-match';
        body = { customer_id: selectedCustomerId };
      }
      else {
        throw new Error("Bu özellik henüz aktif değil.");
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'İşlem başarısız.');
      }

      const data = await response.json();
      setResult(data);

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
      {/* 1. ÜST MENÜ */}
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
        <div className={styles.toolHeader}>
          <h4>{activeToolDef?.label}</h4>
          <p>{activeToolDef?.desc}</p>
        </div>

        {error && (
          <div className={styles.errorMsg}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className={styles.resultContainer}>
            
            {/* --- MOD: MESAJ TASLAĞI --- */}
            {activeMode === 'message_draft' && result.draft && (
              <div className={styles.draftBox}>
                <div className={styles.draftHeader}>
                  <span>Mesaj Taslağı</span>
                  <button onClick={copyToClipboard} className={styles.iconBtn} title="Kopyala">
                    {isCopied ? <Check size={16} color="green"/> : <Copy size={16}/>}
                  </button>
                </div>
                <textarea readOnly value={result.draft} className={styles.draftTextarea}/>
              </div>
            )}

            {/* --- MOD: AKILLI EŞLEŞME (YENİ KISIM) --- */}
            {activeMode === 'smart_match' && result.portfolio_cards && (
  <div className={styles.smartMatchWrapper}>
    {/* Üst Bilgi Paneli */}
    {result.headline && <h3 className={styles.matchHeadline}>{result.headline}</h3>}
    
    {result.criteria_summary && (
      <div className={styles.criteriaBox}>
        <strong>Kullanılan Kriterler:</strong>
        <ul>
          {result.criteria_summary.map((c: string, i: number) => <li key={i}>{c}</li>)}
        </ul>
      </div>
    )}

    <div className={styles.matchList}>
      {result.portfolio_cards.map((item: SmartMatchPortfolioCard) => (
        <div key={item.portfolio_id} className={styles.matchCard}>
          
          {/* Skor ve Sıralama */}
          <div className={styles.cardHeader}>
            <span className={styles.rankBadge}>#{item.rank}</span>
            <div className={styles.scoreBadge}>
              <TrendingUp size={14} />
              <span>%{item.match_score} Uyum</span>
            </div>
          </div>

          {/* Portföy Özet Bilgileri */}
          <div className={styles.portfolioInfo}>
            <h5>{item.portfolio_details?.title || 'Portföy...'}</h5>
            <div className={styles.priceLoc}>
              <span className={styles.price}>
                {item.portfolio_details?.price.toLocaleString('tr-TR')} {item.portfolio_details?.currency}
              </span>
              <span className={styles.loc}>
                <MapPin size={12}/> {item.portfolio_details?.district}/{item.portfolio_details?.city}
              </span>
            </div>
          </div>

          {/* AI ANALİZ BÖLÜMLERİ */}
          <div className={styles.analysisGrid}>
            {/* 1. Neden Uygun? */}
            <div className={styles.analysisSection}>
              <label><Check size={14} color="#10b981"/> Neden Uygun?</label>
              <ul>
                {item.why_match.map((reason, i) => <li key={i}>{reason}</li>)}
              </ul>
            </div>

            {/* 2. Riskler ve İhlaller */}
            {(item.risks.length > 0 || item.violations.length > 0) && (
              <div className={styles.analysisSection}>
                <label><AlertTriangle size={14} color="#f59e0b"/> Dikkat Edilmesi Gerekenler</label>
                <ul>
                  {item.risks.map((risk, i) => <li key={i} className={styles.riskItem}>{risk}</li>)}
                  {item.violations.map((v, i) => (
                    <li key={i} className={styles.violationItem}>
                      <strong>{v.rule}:</strong> {v.note} ({v.delta > 0 ? '+' : ''}{v.delta})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. Doğrulanması Gerekenler */}
            <div className={styles.analysisSection}>
              <label><ListChecks size={14} color="#3b82f6"/> Müşteriye Sorulacaklar</label>
              <ul>
                {item.what_to_confirm.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>
          </div>

          <a href={`/dashboard/portfolios/${item.portfolio_id}`} target="_blank" className={styles.viewBtn}>
            Portföyü İncele <ExternalLink size={14} />
          </a>
        </div>
      ))}
    </div>

    {result.next_step && (
      <div className={styles.nextStepBox}>
        <Info size={16} />
        <p><strong>Danışman Önerisi:</strong> {result.next_step}</p>
      </div>
    )}
  </div>
)}

            {/* ORTAK BUTONLAR */}
            <div className={styles.actionButtons}>
              <button className={styles.secondaryBtn} onClick={() => setResult(null)}>
                <RefreshCw size={16} /> Yeniden Analiz Et
              </button>
              
              {result.whatsapp_url && (
                <a href={result.whatsapp_url} target="_blank" rel="noreferrer" className={styles.whatsappBtn}>
                  <MessageSquare size={18} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        ) : (
          /* BOŞ DURUM (Loading & Run Button) */
          <div className={styles.emptyState}>
            <button className={styles.runBtn} onClick={handleRunTool} disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className={styles.spin} size={20} /> Analiz Ediliyor...</>
              ) : (
                <><Sparkles size={20} /> {activeToolDef?.label} Çalıştır</>
              )}
            </button>
            {isLoading && <p className={styles.loadingText}>Yapay zeka verileri analiz ediyor...</p>}
          </div>
        )}
      </div>
    </div>
  );
}