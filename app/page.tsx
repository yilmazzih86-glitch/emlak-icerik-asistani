"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { 
  ArrowRight, Building2, Sparkles, Wand2, 
  Users, Instagram, Clapperboard, 
  CheckCircle2, FileText, Play, Check, X,
  LayoutDashboard, PlusCircle, Image as ImageIcon,
  Settings, Share2, Type, ImagePlus, Share, TrendingUp, ChevronRight,
  ChevronLeft, Briefcase, Zap, Video, Search, Bell, LayoutGrid, Home as HomeIcon,
  FileQuestion, Clock, Users2, ShieldAlert, ArrowDown,
  MoreHorizontal, Plus, Filter, Calendar
} from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, AnimatePresence } from "framer-motion";
import styles from "./page.module.scss";


export default function Home() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const floatAnimation = (delay: number, yOffset: number) => ({ y: [0, yOffset, 0], transition: { repeat: Infinity, duration: 4 + delay, ease: "easeInOut" as const, delay: delay } });

useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      if (Math.abs(delta) < 10) return;
      if (delta > 0 && currentScrollY > 250) {
      setIsVisible(false);
    } 
    // 3. Yukarı kaydırırken: Anında göster
    else if (delta < -10) {
      setIsVisible(true);
    }

      // Aşağı kaydırırken ve 100px'den fazla inilmişse gizle
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } 
      // Yukarı kaydırırken göster
      else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Fare ekranın üst 50 pikseline gelirse navbar'ı göster
      if (e.clientY < 50) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [lastScrollY]);

  return (
    <main className={styles.main} ref={ref}>
      
      {/* NAVBAR */}
      <motion.header
        className={styles.navbar}
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isVisible ? 0 : -100, 
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ 
  type: "spring", 
  stiffness: 260, 
  damping: 20, // 'Damping' değerini artırarak sallantıyı (bounce) azaltıp yumuşatıyoruz
  mass: 0.5,
  duration: isVisible ? 0.4 : 1.2, // Açılırken 0.4s (hızlı), kapanırken 1.2s (çok yavaş)
  ease: [0.23, 1, 0.32, 1]
}}   
>
        <div className={styles.container}>
            <div className={styles.navContent}>
                <div className={styles.logo}>
                    <div className={styles.iconBox}><Building2 size={24} color="#fff" /></div>
                    <span className={styles.brandName}>EstateOS</span>
                </div>
                <nav className={styles.navLinks}>
                    <Link href="/login" className={styles.link}>Giriş Yap</Link>
                    <Link href="/register?plan=free" className={styles.btnCta}>Ücretsiz Dene</Link>
                </nav>
            </div>
        </div>
      </motion.header>
      

      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        {/* Glow Arkalan */}
        <motion.div style={{ y: backgroundY }} className={`${styles.glowBg} ${styles.purple}`}></motion.div>
        
        <div className={styles.container}>
          <div className={styles.heroContent}>
            
            {/* 1. BADGE: Emlak İşletim Sistemi */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }} 
              className={styles.badgePill}
            >
              <Sparkles size={16} />
              <span>Emlak İşletim Sistemi</span>
            </motion.div>
            
            {/* 2. BAŞLIK: EstateOS */}
            <motion.h1 
              style={{ y: textY }} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            >
              <span className={styles.highlight}>EstateOS</span>
            </motion.h1>
            
            {/* 3. ALT BAŞLIK */}
            <motion.h2
              className={styles.subHeadline}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
            >
              Portföy, müşteri, içerik ve satış süreçleri tek platformda.
            </motion.h2>

            {/* 4. AÇIKLAMA */}
            <motion.p 
              className={styles.desc}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
            >
              Emlak danışmanları ve ofisler için özel geliştirilen EstateOS, 
              günlük operasyonunuzu tek bir sistem altında toplar. <br className="hidden md:block"/>
              Dağınık araçlar yerine kontrol sizde olsun.
            </motion.p>

            {/* 5. BUTONLAR */}
            <motion.div 
              className={styles.ctaGroup}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 }}
            >
              <Link href="/register?plan=free" className={styles.btnPrimary}>
                Ücretsiz Dene <ArrowRight size={18} />
              </Link>
              {/* Paketleri İncele butonu Pricing bölümüne kaydırır */}
              <Link href="#pricing" className={styles.btnOutline}>
                Paketleri İncele
              </Link>
            </motion.div>

            {/* 6. TRUST BAR (GÜVEN İFADELERİ) */}
            <motion.div 
              className={styles.trustBar}
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.7, duration: 1 }}
            >
              <div className={styles.trustItem}>
                <Check size={16} /> Kurulum gerekmez
              </div>
              <div className={styles.trustItem}>
                <Check size={16} /> Teknik bilgi gerekmez
              </div>
              <div className={styles.trustItem}>
                <Check size={16} /> Türkiye emlak sektörüne özel
              </div>
            </motion.div>

            {/* DASHBOARD VISUAL (ESTATE OS REALISTIC MOCKUP) */}
            <motion.div 
               initial={{ opacity: 0, y: 100, rotateX: 10, scale: 0.9 }} 
               animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} 
               transition={{ delay: 0.8, duration: 1.2, type: "spring", bounce: 0.2 }} 
               className={styles.heroVisual}
            >
              <div className={styles.mockupWindow}>
                {/* Window Controls */}
                <div className={styles.windowHeader}>
                   <div className={styles.dots}><span></span><span></span><span></span></div>
                   <div className={styles.addressBar}></div> {/* URL bar hidden/dimmed style */}
                </div>

                <div className={styles.windowBody}>
                  {/* SIDEBAR: components/dashboard/Sidebar.tsx'in mini hali */}
                  <div className={styles.sidebar}>
                    <div className={styles.logo}></div> {/* EstateOS Renkli Logo */}
                    
                    {/* Menü İkonları */}
                    <div className={`${styles.item} ${styles.active}`}><HomeIcon size={18}/></div>
                    <div className={styles.item}><LayoutDashboard size={18}/></div>
                    <div className={styles.item}><Users size={18}/></div>
                    <div className={styles.item}><ImageIcon size={18}/></div>
                    <div className={styles.item}><Share2 size={18}/></div>
                    
                    <div className={`${styles.item} ${styles.mtAuto}`}><Settings size={18}/></div>
                  </div>

                  {/* CONTENT AREA: app/dashboard/page.tsx'in mini hali */}
                  <div className={styles.content}>
                    
                    {/* Header */}
                    <div className={styles.dashHeader}>
                      <div className={styles.welcome}>
                        <h3>Hoş geldin, Burak 👋</h3>
                        <span>Elite Broker Paketi</span>
                      </div>
                      <div className={styles.actionBtn}>
                         <PlusCircle size={18} />
                      </div>
                    </div>

                    {/* KPI GRID (Gerçek renklerle) */}
                    <div className={styles.statsGrid}>
                      
                      {/* CARD 1: Mavi - Toplam Portföy */}
                      <div className={`${styles.statCard} ${styles.blue}`}>
                        <div className={styles.cardTop}>
                          <span className={styles.label}>Aktif Portföy</span>
                          <div className={styles.iconBox}><LayoutDashboard size={14} /></div>
                        </div>
                        <div className={styles.value}>142</div>
                      </div>

                      {/* CARD 2: Mor - Kazanılan Zaman */}
                      <div className={`${styles.statCard} ${styles.purple}`}>
                        <div className={styles.cardTop}>
                          <span className={styles.label}>Kazanılan Zaman</span>
                          <div className={styles.iconBox}><Zap size={14} /></div>
                        </div>
                        <div className={styles.value}>48 Saat</div>
                      </div>

                      {/* CARD 3: Turuncu - Limit & Progress */}
                      <div className={`${styles.statCard} ${styles.orange}`}>
                        <div className={styles.cardTop}>
                          <span className={styles.label}>İçerik Kotası</span>
                          <div className={styles.iconBox}><FileText size={14} /></div>
                        </div>
                        <div className={styles.value}>85/150</div>
                        <div className={styles.progressBar}>
                          <motion.div 
                            className={styles.progressFill} 
                            initial={{ width: 0 }} 
                            animate={{ width: '85%' }} 
                            transition={{ delay: 1.5, duration: 1 }} 
                          />
                        </div>
                      </div>

                    </div>

                    {/* RECENT TABLE (Mini) */}
                    <div className={styles.tablePreview}>
                       <div className={styles.tableHeader}>
                          <span>Son İşlemler</span>
                          <span style={{opacity:0.5}}>Tümü</span>
                       </div>
                       
                       {/* Row 1: İçerik Üretimi */}
                       <div className={styles.tableRow}>
                          <div className={styles.rowInfo}>
                             <div className={styles.rowIcon}><Sparkles size={14}/></div>
                             <div>
                               <div style={{fontWeight:600}}>Kadıköy 3+1 Daire</div>
                               <div style={{fontSize: '10px', opacity: 0.6}}>İçerik Oluşturuldu • 2dk önce</div>
                             </div>
                          </div>
                          <div className={styles.statusBadge}>Hazır</div>
                       </div>

                       {/* Row 2: Müşteri Eşleşmesi */}
                       <div className={styles.tableRow}>
                          <div className={styles.rowInfo}>
                             <div className={styles.rowIcon}><Users size={14}/></div>
                             <div>
                               <div style={{fontWeight:600}}>Ahmet Yılmaz</div>
                               <div style={{fontSize: '10px', opacity: 0.6}}>Portföy Eşleşti • 15dk önce</div>
                             </div>
                          </div>
                          <div className={styles.statusBadge} style={{background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6'}}>Potansiyel</div>
                       </div>
                       
                    </div>

                  </div>
                </div>
              </div>
              
              {/* ESTATE OS KONSEPT BADGELERİ */}
              
              {/* Sol Üst: CRM / Eşleşme */}
              <motion.div animate={floatAnimation(0, -15)} className={`${styles.floatingBadge} ${styles.pos1}`}>
                <div className={`${styles.icon} ${styles.blue}`}><Users size={14}/></div>
                <span>Müşteri Eşleşti!</span>
              </motion.div>

              {/* Sağ Üst: AI / İçerik */}
              <motion.div animate={floatAnimation(1, -20)} className={`${styles.floatingBadge} ${styles.pos2}`}>
                <div className={`${styles.icon} ${styles.purple}`}><Sparkles size={14}/></div>
                <span>İlan Metni Hazır</span>
              </motion.div>

              {/* Sol Alt: Görsel / Medya */}
              <motion.div animate={floatAnimation(0.5, 15)} className={`${styles.floatingBadge} ${styles.pos3}`}>
                <div className={`${styles.icon} ${styles.orange}`}><Instagram size={14}/></div>
                <span>Story Tasarlandı</span>
              </motion.div>

              {/* Sağ Alt: Video / UGC */}
              <motion.div animate={floatAnimation(1.5, 20)} className={`${styles.floatingBadge} ${styles.pos4}`}>
                <div className={`${styles.icon} ${styles.green}`}><Video size={14}/></div>
                <span>Reels Videosu Hazır</span>
              </motion.div>

            </motion.div>

          </div>
        </div>
      </section>
      <section className={styles.problemSection}>
        <div className={styles.container}>
          
          {/* Başlık Alanı */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.sectionHeader}
          >
            <div className={styles.miniLabel}>MEVCUT DURUM</div>
            <h2 className={styles.title}>Emlak işiniz neden <span className={styles.textWarning}>zor ilerliyor?</span></h2>
            <p className={styles.subtitle}>Geleneksel yöntemler artık hızınıza yetişemiyor.</p>
          </motion.div>

          {/* Problem Grid */}
          <div className={styles.problemGrid}>
            {[
              {
                icon: FileQuestion,
                title: "Dağınık Portföyler",
                desc: "Portföyler farklı yerlerde (Excel, defter, telefon), takibi ve güncellemesi imkansız hale geliyor."
              },
              {
                icon: Users2,
                title: "İletişim Kopukluğu",
                desc: "Müşteri süreci dağınık, geri dönüşler gecikiyor ve potansiyel alıcılar kaybediliyor."
              },
              {
                icon: Clock,
                title: "Zaman Kaybı",
                desc: "Her bir ilan ve sosyal medya içeriği için tasarım ve metin yazmak saatlerinizi alıyor."
              },
              {
                icon: ShieldAlert,
                title: "Geç Eşleşme",
                desc: "Doğru müşteriye doğru portföy ulaştığında iş işten geçmiş oluyor, satış kaçıyor."
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.03)" }}
                className={styles.problemCard}
              >
                <div className={styles.iconWrapper}>
                  <item.icon size={24} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Çözüm Köprüsü (Transition) */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.4 }}
             className={styles.solutionBridge}
          >
             <p>EstateOS, bu karmaşayı <strong>tek bir sistemde</strong> toplar.</p>
             <ArrowDown className={styles.bridgeIcon} size={20} />
          </motion.div>

        </div>
      </section>

      {/* ÇÖZÜM / SOLUTION SECTION - BENTO GRID (UPDATED V2) */}
      <section className={styles.solutionSection}>
        <div className={styles.container}>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={styles.solutionHeader}
          >
            <div className={styles.badge}>DEĞER ÖNERİSİ</div>
            <h2>Emlak Ofisiniz İçin <span className={styles.highlight}>7/24 Çalışan Ortak</span></h2>
            <p>Operasyonel yükü EstateOS'a bırakın, siz sadece satışa odaklanın.</p>
          </motion.div>

          {/* Grid Container */}
          <motion.div 
            className={styles.bentoGrid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
          >
            
            {/* 1. PORTFÖY: Saniyeler İçinde Satışa Hazır */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className={styles.bentoCard}
              whileHover="hover"
            >
              <div className={styles.cardContent}>
                <div className={`${styles.iconBox} ${styles.blue}`}><LayoutDashboard size={20}/></div>
                <h3>Saniyeler İçinde Satışa Hazır</h3>
                <ul>
                  <li>Pazarlama diliyle <strong>otomatik ilan metni</strong></li>
                  <li>Yapay zeka destekli görsel iyileştirme</li>
                  <li>Tek tıkla sunum dosyası hazırlama</li>
                </ul>
              </div>
              
              {/* CSS ART: LIST ANIMATION */}
              <div className={`${styles.cardVisual} ${styles.visualPortfolio}`}>
                <div className={styles.mockTable}>
                  <div className={styles.tHead}>
                    <span>Başlık</span><span>Fiyat</span><span>Durum</span>
                  </div>
                  <div className={styles.tRow}>
                    <div className={styles.cellMain}>
                      <div className={styles.thumb}></div>
                      <div className={styles.textLines}><span className={styles.lineL}></span><span className={styles.lineS}></span></div>
                    </div>
                    <div className={styles.cell}>₺₺₺</div>
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className={`${styles.statusBadge} ${styles.success}`}
                    >
                      Hazır
                    </motion.div>
                  </div>
                  <motion.div 
                    variants={{ hover: { x: 5 } }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={styles.tRow}
                  >
                    <div className={styles.cellMain}>
                      <div className={styles.thumb}></div>
                      <div className={styles.textLines}><span className={styles.lineL}></span><span className={styles.lineS}></span></div>
                    </div>
                    <div className={styles.cell}>₺₺₺</div>
                    <div className={`${styles.statusBadge} ${styles.warning}`}>Taslak</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* 2. CRM: Fırsat Kaçırmayan Hafıza (GÜNCELLENDİ) */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className={styles.bentoCard}
              whileHover="hover"
            >
              <div className={styles.cardContent}>
                <div className={`${styles.iconBox} ${styles.green}`}><Users size={20}/></div>
                <h3>Fırsat Kaçırmayan Hafıza</h3>
                <ul>
                  {/* İsteğinize göre burayı güncelledik: Hem AI araçları hem de standart CRM özellikleri */}
                  <li>Tek tıkla <strong>Mesaj Taslağı</strong> ve <strong>Portföy Eşleştirme</strong></li>
                  <li>Müşteriye özel <strong>Not ve Görev</strong> ekleme</li>
                  <li>Sessizlik analizi ile "Unutulan Müşteri" uyarısı</li>
                </ul>
              </div>

              {/* CSS ART: KANBAN DRAG ANIMATION */}
              <div className={`${styles.cardVisual} ${styles.visualCrm}`}>
                <div className={styles.kanbanBoard}>
                  <div className={styles.column}>
                    <div className={styles.colHead}><span className={styles.dot}></span>Takip</div>
                    <div className={styles.kanbanCard}><div className={styles.line}></div><div className={styles.tag}></div></div>
                    <div className={styles.kanbanCard}><div className={styles.line}></div></div>
                  </div>
                  <div className={styles.column}>
                    <div className={styles.colHead}><span className={`${styles.dot} ${styles.blue}`}></span>İşlem</div>
                    <motion.div 
                      className={`${styles.kanbanCard} ${styles.active}`}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className={styles.line}></div>
                      <div className={`${styles.tag} ${styles.blue}`}></div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 3. AI: Satışı Kapatan Stratejik Zeka */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className={styles.bentoCard}
              whileHover="hover"
            >
              <div className={styles.cardContent}>
                <div className={`${styles.iconBox} ${styles.violet}`}><Sparkles size={20}/></div>
                <h3>Satışı Kapatan Stratejik Zeka</h3>
                <ul>
                  <li><strong>%85+ Uyum skoru</strong> ile nokta atışı</li>
                  <li>"Neden satılır?" gerekçeli öneriler</li>
                  <li>Mevzuat ve rakip analizi desteği</li>
                </ul>
              </div>

              {/* CSS ART: AI TYPING ANIMATION */}
              <div className={`${styles.cardVisual} ${styles.visualAi}`}>
                <div className={styles.aiLayout}>
                  <div className={styles.aiSidebar}>
                     <div className={styles.line}></div><div className={styles.line}></div><div className={styles.line}></div>
                  </div>
                  <div className={styles.aiMain}>
                    <div className={styles.aiResult}>
                       <motion.div 
                         animate={{ rotate: [0, 15, -15, 0] }}
                         transition={{ duration: 4, repeat: Infinity }}
                         className={styles.sparkleIcon}
                       >
                         <Sparkles size={12}/>
                       </motion.div>
                       <div className={styles.lines}>
                         <motion.div animate={{ width: ["90%", "70%", "90%"] }} transition={{duration:3, repeat:Infinity}} className={styles.l1}></motion.div>
                         <motion.div animate={{ width: ["70%", "40%", "70%"] }} transition={{duration:4, repeat:Infinity}} className={styles.l2}></motion.div>
                         <motion.div animate={{ width: ["40%", "60%", "40%"] }} transition={{duration:2.5, repeat:Infinity}} className={styles.l3}></motion.div>
                       </div>
                    </div>
                    <div className={styles.aiInput}>
                       <div className={styles.placeholder}></div>
                       <motion.div variants={{ hover: { scale: 1.2 } }} className={styles.btn}></motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 4. MEDYA: Cebinizdeki Dijital Ajans */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className={styles.bentoCard}
              whileHover="hover"
            >
              <div className={styles.cardContent}>
                <div className={`${styles.iconBox} ${styles.orange}`}><Instagram size={20}/></div>
                <h3>Cebinizdeki Dijital Ajans</h3>
                <ul>
                  <li>Instagram Post & Story tasarımları</li>
                  <li>Otomatik <strong>Reels videosu</strong> kurgulama</li>
                  <li>Dikkat çekici sosyal medya metinleri</li>
                </ul>
              </div>

              {/* CSS ART: PLAY BUTTON PULSE */}
              <div className={`${styles.cardVisual} ${styles.visualSocial}`}>
                 <div className={styles.instaLayout}>
                    <div className={styles.postCard}>
                       <div className={styles.pHeader}><div className={styles.avatar}></div><div className={styles.name}></div></div>
                       <div className={styles.pImage}>
                          <motion.div 
                            className={styles.playBtn}
                            whileHover={{ scale: 1.2, backgroundColor: "rgba(255,255,255,0.2)" }}
                            animate={{ boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 10px rgba(255,255,255,0.5)", "0 0 0px rgba(255,255,255,0)"] }}
                            transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                          >
                            <Play size={12} fill="white"/>
                          </motion.div>
                       </div>
                       <div className={styles.pFooter}>
                          <div className={styles.actions}>
                            <motion.div variants={{ hover: { scale: 1.3, backgroundColor: "#ef4444" } }} className={styles.act}></motion.div>
                            <div className={styles.act}></div>
                          </div>
                          <div className={styles.caption}><div className={styles.line}></div><div className={styles.lineS}></div></div>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className={`${styles.sectionPadding} ${styles.pricingBg}`}>
  <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Size uygun <span className={styles.highlight}>EstateOS</span> paketini seçin</h2>
            <p>Tüm paketler aylık aboneliklidir. İhtiyacınıza göre dilediğiniz zaman yükseltebilirsiniz.</p>
          </div>
          <div className={styles.pricingGrid}>
            {[
              {
                name: "Freelance", key: "freelance", price: "499", icon: Briefcase, color: "orange",
                features: [
                  { text: "Aylık 15 Adet İçerik Metni Üretimi", included: true },
                  { text: "Geçmiş: Son 15 Kayıt Tutulur", included: true },
                  { text: "AI Görsel İyileştirme (3 Adet/Ay)", included: true }, 
                  { text: "AI Sosyal Medya Görseli (1 Adet/Ay)", included: true },
                  { text: "AI Destekli Müşteri İlişkileri Yönetimi", included: true },
                  { text: "UGC Video Üretimi", included: false },
                  { text: "Uzman AI Emlak Danışmanı [Yakında]", included: false },
                  { text: "9.600+ Verilik Bilgi Bankası Erişimi [Yakında]", included: false },
                ]
              },
              {
                name: "Profesyonel", key: "pro", price: "1.249", icon: Zap, color: "purple", popular: true,
                features: [
                  { text: "Aylık 100 Adet İçerik Metni Üretimi", included: true },
                  { text: "Geçmiş: Son 100 Kayıt Tutulur", included: true },
                  { text: "AI Görsel İyileştirme (30 Adet/Ay)", included: true },
                  { text: "AI Sosyal Medya Görseli (15 Adet/Ay)", included: true },
                  { text: "AI Destekli Müşteri İlişkileri Yönetimi", included: true },
                  { text: "UGC Video Üretimi (1 Adet/Ay)", included: true },
                  { text: "Uzman AI Emlak Danışmanı [Yakında]", included: false },
                  { text: "9.600+ Verilik Bilgi Bankası Erişimi [Yakında]", included: false },
                ]
              },
              {
                name: "Elite Broker", key: "office", price: "2.990", icon: Building2, color: "orange",
                features: [
                  { text: "Aylık 150 Adet İçerik Metni Üretimi", included: true },
                  { text: "Geçmiş: Sınırsız Kayıt Tutulur", included: true },
                  { text: "AI Görsel İyileştirme (100 Adet/Ay)", included: true },
                  { text: "AI Sosyal Medya Görseli (50 Adet/Ay)", included: true },
                  { text: "AI Destekli Müşteri İlişkileri Yönetimi", included: true },
                  { text: "UGC Video Üretimi (2 Adet/Ay)", included: true },
                  { text: "Uzman AI Emlak Danışmanı [Yakında]", included: true },
                  { text: "9.600+ Verilik Bilgi Bankası Erişimi [Yakında]", included: true },
                ]
              }
            ].map((plan, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}>
                {plan.popular && <div className={styles.popularTag}>EN ÇOK TERCİH EDİLEN</div>}
                <div className={styles.cardTop}>
                    <div className={`${styles.iconBox} ${styles[plan.color]}`}><plan.icon size={24} /></div>
                    <div><h3>{plan.name}</h3><span className={styles.planType}>Paket</span></div>
                </div>
                <div className={styles.priceArea}>
                    <span className={styles.amount}>{plan.price} ₺</span>
                    <span className={styles.period}>/ ay</span>
                </div>
                <ul className={styles.features}>
                    {plan.features.map((feature, i) => (
                        <li key={i} className={!feature.included ? styles.disabled : ""}>
                            {feature.included ? 
                                (<Check size={16} color={plan.popular ? "#a78bfa" : "#f97316"} />) : 
                                (<X size={16} color="#52525b" />)
                            }
                            <span>{feature.text}</span>
                        </li>
                    ))}
                </ul>
                <Link href={`/register?plan=${plan.key}`} className={`${styles.btn} ${plan.popular ? styles.btnPrimaryFull : styles.btnOutlineFull}`}>
                    {plan.popular ? "Hemen Başla" : "Seç"}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>© 2025 EstateOS | Emlak İşletim Sistemi | Tüm hakları saklıdır. </p>
          <div className={styles.footerLinks}>
            <Link href="#">Gizlilik</Link><Link href="#">Kullanım Şartları</Link><Link href="#">İletişim</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}