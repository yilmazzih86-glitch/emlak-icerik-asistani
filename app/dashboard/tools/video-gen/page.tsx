"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Play, Pause, Wand2, Download, AlertCircle, 
  CheckCircle2, Clock, Type, User, Mic, LayoutTemplate 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ugc-studio.module.scss";
import { useEffect } from "react";

// --- CSV VERİLERİNDEN OLUŞTURULAN SABİTLER ---
const AVATARS = [
  { 
    id: 'av_f_01', 
    label: 'Lina – Podcast Konuşmacı', 
    gender: 'female', 
    image_url: 'https://xnumblomxjbvfkgetfvd.supabase.co/storage/v1/object/public/ugc-avatars/female/av_f_01.png' 
  },
  { 
    id: 'av_m_01', 
    label: 'Atlas – Podcast Konuşmacı', 
    gender: 'male', 
    image_url: 'https://xnumblomxjbvfkgetfvd.supabase.co/storage/v1/object/public/ugc-avatars/male/av_m_01.png' 
  },
];

const VOICES = [
  { 
    id: 'atlas_m_01', 
    label: 'Atlas – Güven Veren', 
    gender: 'male', 
    preview_url: 'https://xnumblomxjbvfkgetfvd.supabase.co/storage/v1/object/public/voice-previews/male/atlas_m_01.mp3' 
  },
  { 
    id: 'lina_f_01', 
    label: 'Lina – Kurumsal', 
    gender: 'female', 
    preview_url: 'https://xnumblomxjbvfkgetfvd.supabase.co/storage/v1/object/public/voice-previews/female/lina_f_01.mp3' 
  },
];

// --- SÜRE VE KREDİ AYARLARI ---
const DURATION_OPTS = [
  { seconds: 15, credit: 1, charLimit: 200 },
  { seconds: 30, credit: 2, charLimit: 450 },
  { seconds: 45, credit: 3, charLimit: 650 },
];

export default function UGCStudioPage() {
  const supabase = createClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State Yönetimi
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[1]); // Lina default
  const [durationConfig, setDurationConfig] = useState(DURATION_OPTS[0]); // Default 15s
  const [script, setScript] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  
  // İşlem Stateleri
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Ses Önizleme Mantığı
  const toggleAudio = (url: string, id: string) => {
    if (playingVoiceId === id) {
      audioRef.current?.pause();
      setPlayingVoiceId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setPlayingVoiceId(id);
      audioRef.current.onended = () => setPlayingVoiceId(null);
    }
  };
  // Realtime Dinleme İçin Düzeltilmiş useEffect
  useEffect(() => {
    if (!generating) return;

    let channel: any;

    const startListening = async () => {
      // 1. Önce kullanıcı ID'sini al
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Doğru ID ile kanalı aç
      channel = supabase
        .channel('video-updates-' + user.id) // Kanal ismini benzersiz yapalım
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'generated_videos',
            filter: `user_id=eq.${user.id}` // ARTIK DOĞRU ÇALIŞACAK
          },
          (payload: any) => {
            console.log("Realtime Update Geldi:", payload); // Debug için log
            const newRow = payload.new;
            if (newRow.status === 'COMPLETED' && newRow.video_url) {
              setVideoUrl(newRow.video_url);
              setGenerating(false);
              
              // Temizlik
              if (channel) supabase.removeChannel(channel);
            }
          }
        )
        .subscribe((status) => {
          console.log("Abonelik Durumu:", status); // Bağlantı durumunu konsolda görün
        });
    };

    startListening();

    // Cleanup: Component kapanırsa dinlemeyi durdur
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [generating, supabase]);

  // Video Üretim, Kredi Düşme ve Webhook Gönderimi
  const handleGenerate = async () => {
    // Validasyonlar
    if (!script.trim()) return alert("Lütfen konuşma metni giriniz.");
    if (script.length > durationConfig.charLimit) return alert("Karakter sınırı aşıldı!");

    setGenerating(true);
    setVideoUrl(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum açmalısınız.");

      // 1. KREDİ DÜŞ (RPC) - Aynı kalıyor
      const { data: success, error: rpcError } = await supabase.rpc('use_video_ai_credit', {
        p_user_id: user.id,
        p_count: durationConfig.credit 
      });
      if (rpcError || !success) throw new Error("Yetersiz Kredi!");

      // 2. ÖNCE SUPABASE'E "PROCESSING" KAYDI AT
      const { data: insertData, error: insertError } = await supabase
        .from('generated_videos')
        .insert({
          user_id: user.id,
          prompt: script.substring(0, 50) + "...",
          status: 'processing'
        })
        .select()
        .single();

      if (insertError) throw insertError;
      const recordId = insertData.id;

      // 3. API'YI TETİKLE (Artık yanıt beklemiyoruz, sadece tetikliyoruz)
      const payload = {
        video_record_id: recordId, // ID'yi n8n'e yolluyoruz
        user_id: user.id,
        avatar_id: selectedAvatar.id,
        voice_preset_id: selectedVoice.id,
        script_text: script,
        duration_sec: durationConfig.seconds
      };

      await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Burada işlem bitmedi! "generating" state'i true kaldı.
      // Yukarıdaki useEffect, Supabase'den "completed" haberi gelince bitirecek.

    } catch (error: any) {
      alert(error.message);
      setGenerating(false);
    }
  };

  return (
    <div className={styles.studioContainer}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <LayoutTemplate size={24} color="#7c3aed" />
          </div>
          <div>
            <h1>UGC Video <span className={styles.highlight}>Creator</span></h1>
            <p>Gerçekçi avatarlar ve seslerle sosyal medya içerikleri üretin.</p>
          </div>
        </div>
        <div className={styles.creditBadge}>
          <span>Maliyet:</span>
          <strong>{durationConfig.credit} Kredi</strong>
        </div>
      </header>

      <div className={styles.mainGrid}>
        
        {/* --- SOL PANEL: AYARLAR --- */}
        <div className={`${styles.glassPanel} ${styles.controlPanel}`}>
          
          {/* 1. AVATAR SEÇİMİ */}
          <section className={styles.section}>
            <h3><User size={16} /> Avatar Seçimi</h3>
            <div className={styles.avatarGrid}>
              {AVATARS.map((avatar) => (
                <div 
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`${styles.avatarCard} ${selectedAvatar.id === avatar.id ? styles.active : ''}`}
                >
                  <img src={avatar.image_url} alt={avatar.label} />
                  <div className={styles.overlay}>
                    <CheckCircle2 size={16} />
                  </div>
                </div>
              ))}
            </div>
            <p className={styles.selectionLabel}>{selectedAvatar.label}</p>
          </section>

          {/* 2. SES SEÇİMİ */}
          <section className={styles.section}>
            <h3><Mic size={16} /> Seslendirmen</h3>
            <div className={styles.voiceList}>
              {VOICES.map((voice) => (
                <div 
                  key={voice.id} 
                  className={`${styles.voiceItem} ${selectedVoice.id === voice.id ? styles.active : ''}`}
                  onClick={() => setSelectedVoice(voice)}
                >
                  <div className={styles.voiceInfo}>
                    <button 
                      className={styles.playBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAudio(voice.preview_url, voice.id);
                      }}
                    >
                      {playingVoiceId === voice.id ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <span>{voice.label}</span>
                  </div>
                  {selectedVoice.id === voice.id && <div className={styles.dot} />}
                </div>
              ))}
            </div>
          </section>

          {/* 3. SÜRE SEÇİMİ */}
          <section className={styles.section}>
            <h3><Clock size={16} /> Video Süresi</h3>
            <div className={styles.durationTabs}>
              {DURATION_OPTS.map((opt) => (
                <button
                  key={opt.seconds}
                  onClick={() => {
                    setDurationConfig(opt);
                  }}
                  className={`${styles.tab} ${durationConfig.seconds === opt.seconds ? styles.active : ''}`}
                >
                  <span className={styles.sec}>{opt.seconds}s</span>
                  <span className={styles.cred}>{opt.credit} Kredi</span>
                </button>
              ))}
            </div>
          </section>

        </div>

        {/* --- ORTA PANEL: EDİTÖR --- */}
        <div className={`${styles.glassPanel} ${styles.editorPanel}`}>
          <div className={styles.sectionHeader}>
            <h3><Type size={16} /> Konuşma Metni (Script)</h3>
            <span className={`${styles.charCount} ${script.length > durationConfig.charLimit ? styles.error : ''}`}>
              {script.length} / {durationConfig.charLimit}
            </span>
          </div>
          
          <textarea
            className={styles.scriptArea}
            placeholder={`Video için konuşma metnini buraya girin. ${durationConfig.seconds} saniyelik video için en fazla ${durationConfig.charLimit} karakter yazabilirsiniz.`}
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />

          {script.length > durationConfig.charLimit && (
            <div className={styles.warning}>
              <AlertCircle size={14} />
              <span>Metin çok uzun! Lütfen kısaltın veya süreyi artırın.</span>
            </div>
          )}

          <div className={styles.actionArea}>
            <button 
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={generating || script.length > durationConfig.charLimit || !script}
            >
              {generating ? (
                <>
                  <div className={styles.loader}></div> 
                  Üretiliyor...
                </>
              ) : (
                <><Wand2 size={18} /> UGC Video Üret (-{durationConfig.credit} Kredi)</>
              )}
            </button>
          </div>
        </div>

        {/* --- SAĞ PANEL: ÖNİZLEME --- */}
        <div className={`${styles.glassPanel} ${styles.previewPanel}`}>
          <AnimatePresence mode="wait">
            {!videoUrl && !generating ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={styles.emptyState}
              >
                <div className={styles.placeholderAvatar}>
                  <img src={selectedAvatar.image_url} alt="Preview" />
                </div>
                <p>Hazır olduğunda videonuz burada görünecek.</p>
              </motion.div>
            ) : generating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={styles.loadingState}
              >
                <div className={styles.spinner}>
                  <div className={styles.blob}></div>
                  <div className={styles.blob}></div>
                </div>
                <h3>Yapay Zeka Çalışıyor</h3>
                <p>Ses klonlanıyor ve dudak senkronizasyonu yapılıyor...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className={styles.resultState}
              >
                <video src={videoUrl!} controls autoPlay loop className={styles.finalVideo} />
                <button className={styles.downloadBtn} onClick={() => window.open(videoUrl!, '_blank')}>
                  <Download size={16} /> Videoyu İndir
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}