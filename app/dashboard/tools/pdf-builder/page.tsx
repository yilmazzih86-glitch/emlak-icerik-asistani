"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileText, Hammer, Ruler, Construction, Sparkles } from "lucide-react";
import Link from "next/link";
import styles from "./pdf-builder.module.scss"; // CSS Module kullanımı

export default function PdfBuilderPage() {
  return (
    <div className={styles.container}>
      
      {/* Arkaplan Dekoratif Işıklar */}
      <div className={`${styles.glowOrb} ${styles.glowPurple}`} />
      <div className={`${styles.glowOrb} ${styles.glowOrange}`} />

      {/* Ana Kart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={styles.glassCard}
      >
        
        {/* Animasyonlu İkon Kompozisyonu */}
        <div className={styles.iconComposition}>
          {/* Merkezdeki Belge İkonu */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={styles.mainIcon}
          >
            <FileText size={100} strokeWidth={1} />
          </motion.div>

          {/* Dönen Çekiç */}
          <motion.div
            className={`${styles.floatingIcon} ${styles.hammerIcon}`}
            animate={{ 
              y: [0, -15, 0], 
              rotate: [0, 15, 0] 
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Hammer size={32} />
          </motion.div>

          {/* Sallanan Cetvel */}
          <motion.div
            className={`${styles.floatingIcon} ${styles.rulerIcon}`}
            animate={{ 
              y: [0, 10, 0], 
              rotate: [0, -10, 0] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Ruler size={32} />
          </motion.div>

          {/* Işıltılar */}
          <motion.div
            className={styles.sparkleIcon}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={24} />
          </motion.div>
        </div>

        {/* Metin Alanı */}
        <div className={styles.textContent}>
          <div className={styles.badge}>
            <Construction size={14} />
            <span>Geliştirme Aşamasında</span>
          </div>
          
          <h1 className={styles.title}>
            PDF Sihirbazı Hazırlanıyor
          </h1>
          
          <p className={styles.description}>
            İlanlarınızı tek tıkla profesyonel, markalı PDF kataloglarına dönüştürecek bu modül üzerinde çalışıyoruz. Çok yakında hizmetinizde!
          </p>
        </div>

        {/* Aksiyon Butonu */}
        <Link href="/dashboard" className={styles.linkWrapper}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.actionButton}
          >
            <ArrowLeft size={20} />
            <span>Panoya Geri Dön</span>
          </motion.button>
        </Link>

      </motion.div>

      {/* Alt Bilgi */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className={styles.footerInfo}
      >
        modül_v0.9.beta
      </motion.p>
    </div>
  );
}