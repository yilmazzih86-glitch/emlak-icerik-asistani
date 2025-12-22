'use client';
import React, { useState } from 'react';
import { AiToolMode, AiResponse } from '../../api/types';
import styles from './AiToolsPanel.module.scss';
import { MessageSquare, Search, Bell, HeartHandshake, Sparkles, Send } from 'lucide-react';

const TOOLS = [
  { id: 'message_draft', label: 'Mesaj Hazırlama', desc: 'WhatsApp/SMS taslağı üretir.', icon: MessageSquare, color: '#25D366' },
  { id: 'smart_match', label: 'Akıllı Eşleştirme', desc: 'Portföy skorlaması yapar.', icon: Search, color: '#3B82F6' },
  { id: 'silence_detection', label: 'Takip & Sessizlik', desc: 'İletişim kopukluğunu analiz eder.', icon: Bell, color: '#F59E0B' },
  { id: 'post_sale', label: 'İlişki Hafızası', desc: 'Satış sonrası temas önerir.', icon: HeartHandshake, color: '#8B5CF6' },
  { id: 'consultant_insight', label: 'Danışman İçgörüsü', desc: 'Müşteri özetini sunar.', icon: Sparkles, color: '#EC4899' },
];

export default function AiToolsPanel({ customerId }: { customerId: string }) {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResponse | null>(null);

  const runAi = async (mode: string) => {
    setActiveTool(mode);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/crm/ai-orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, customer_id: customerId })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.aiWrapper}>
      <div className={styles.toolGrid}>
        {TOOLS.map(tool => (
          <button key={tool.id} onClick={() => runAi(tool.id)} className={styles.toolCard} disabled={loading}>
            <div className={styles.iconBox} style={{ background: tool.color + '20' }}>
               <tool.icon size={22} color={tool.color} />
            </div>
            <div className={styles.toolInfo}>
              <strong>{tool.label}</strong>
              <span>{tool.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {loading && <div className={styles.loader}>AI Analiz Ediyor...</div>}

      {result && (
        <div className={styles.resultContainer}>
           <div className={styles.resultHeader}><Sparkles size={16}/> AI Önerisi</div>
           <div className={styles.resultBody}>{result.content}</div>
           <button onClick={() => navigator.clipboard.writeText(result.content)} className={styles.copyBtn}>
             Taslağı Kopyala
           </button>
        </div>
      )}
    </div>
  );
}