'use client';
import React, { useState } from 'react';
import { AiToolMode, AiResponse } from '../../api/types';
import styles from './AiToolsPanel.module.scss'; // SCSS dosyasını oluşturmalısın
import { Bot, MessageSquare, Search, Bell, HeartHandshake, Sparkles, Send } from 'lucide-react';

interface Props {
  customerId: string;
}

const TOOLS: { id: AiToolMode; label: string; icon: any; color: string }[] = [
  { id: 'message_draft', label: 'Mesaj Taslağı', icon: MessageSquare, color: '#25D366' }, // Whatsapp yeşili
  { id: 'smart_match', label: 'Akıllı Eşleşme', icon: Search, color: '#3B82F6' },
  { id: 'silence_detection', label: 'Takip Analizi', icon: Bell, color: '#F59E0B' },
  { id: 'post_sale', label: 'İlişki Hafızası', icon: HeartHandshake, color: '#8B5CF6' },
  { id: 'consultant_insight', label: 'Müşteri Özeti', icon: Sparkles, color: '#EC4899' },
];

export default function AiToolsPanel({ customerId }: Props) {
  const [activeTool, setActiveTool] = useState<AiToolMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResponse | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const runAiTool = async () => {
    if (!activeTool) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/crm/ai-orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeTool,
          customer_id: customerId,
          custom_prompt: customPrompt
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.aiContainer}>
      {/* Tool Seçimi Grid */}
      <div className={styles.toolGrid}>
        {TOOLS.map(tool => (
          <button 
            key={tool.id} 
            className={`${styles.toolBtn} ${activeTool === tool.id ? styles.active : ''}`}
            onClick={() => { setActiveTool(tool.id); setResult(null); }}
            style={{ borderColor: activeTool === tool.id ? tool.color : '' }}
          >
            <tool.icon size={20} color={tool.color} />
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Input Alanı (Opsiyonel Danışman Notu) */}
      {activeTool && (
        <div className={styles.activeZone}>
          <div className={styles.inputGroup}>
            <input 
              type="text" 
              placeholder="Örn: 'Daha resmi olsun' veya 'Kira bütçesine odaklansın'..." 
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            <button onClick={runAiTool} disabled={loading} className={styles.runBtn}>
              {loading ? <div className="spinner" /> : <Send size={16} />}
              AI Çalıştır
            </button>
          </div>
        </div>
      )}

      {/* Sonuç Alanı */}
      {result && (
        <div className={styles.resultBox}>
          {/* 1. Mesaj Taslağı İse */}
          {activeTool === 'message_draft' && (
            <div className={styles.messageDraft}>
              <div className={styles.bubble}>{result.content}</div>
              <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(result.content)}>
                Kopyala
              </button>
            </div>
          )}

          {/* 2. Eşleşme İse */}
          {activeTool === 'smart_match' && result.data && Array.isArray(result.data) && (
             <div className={styles.matchList}>
               {result.data.map((item: any, idx: number) => (
                 <div key={idx} className={styles.matchItem}>
                    <div className={styles.score}>{item.match_score}%</div>
                    <div className={styles.details}>
                      <h5>{item.portfolio_title}</h5>
                      <p>{item.reason}</p>
                    </div>
                 </div>
               ))}
             </div>
          )}

          {/* Diğerleri için Standart Markdown */}
          {!['message_draft', 'smart_match'].includes(activeTool!) && (
            <div className={styles.genericContent}>
              {result.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
}