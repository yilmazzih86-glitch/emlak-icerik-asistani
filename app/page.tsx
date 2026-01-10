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
  MoreHorizontal, Plus, Filter, Calendar, MessageSquare, GripVertical, Phone, FileSignature,
  Star, HelpCircle, Minus
} from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, AnimatePresence } from "framer-motion";
import styles from "./page.module.scss";



const DashboardView = () => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
    className={styles.viewContainer}
  >
     {/* KPI GRID */}
     <div className={styles.statsGrid}>
        <motion.div whileHover={{ scale: 1.05 }} className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.cardTop}>
            <span className={styles.label}>Aktif Portföy</span>
            <div className={styles.iconBox}><LayoutDashboard size={14} /></div>
          </div>
          <div className={styles.value}>142</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className={`${styles.statCard} ${styles.purple}`}>
          <div className={styles.cardTop}>
            <span className={styles.label}>Kazanılan Zaman</span>
            <div className={styles.iconBox}><Zap size={14} /></div>
          </div>
          <div className={styles.value}>48 Saat</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className={`${styles.statCard} ${styles.orange}`}>
          <div className={styles.cardTop}>
            <span className={styles.label}>İçerik Kotası</span>
            <div className={styles.iconBox}><FileText size={14} /></div>
          </div>
          <div className={styles.value}>85/150</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '65%' }}></div>
          </div>
        </motion.div>
      </div>

      {/* RECENT TABLE */}
      <div className={styles.tablePreview}>
          <div className={styles.tableHeader}>
            <span>Son İşlemler</span>
            <span style={{opacity:0.5}}>Tümü</span>
          </div>
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
  </motion.div>
);

// 2. CRM Görünümü (Yeni - MessageSquare burada kullanılıyor)
const CrmView = () => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
    className={styles.viewContainer}
  >
    <div className={styles.crmList}>
      <h4 className={styles.viewTitle}>Bekleyen Talepler</h4>
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.crmItem}>
           <div className={styles.avatar}>{i === 1 ? 'AY' : i === 2 ? 'BK' : 'ME'}</div>
           <div className={styles.info}>
              <div className={styles.name}>Müşteri #{i}024</div>
              <div className={styles.detail}>2+1 Kiralık • İstanbul / Beşiktaş</div>
           </div>
           <div className={styles.actionBtn}>
              <MessageSquare size={14} />
           </div>
        </div>
      ))}
      <div className={styles.aiSuggestion}>
         <Sparkles size={12} className={styles.sparkle}/>
         <span>AI Önerisi: Bu müşteriler için 3 yeni portföy eşleşmesi bulundu.</span>
      </div>
    </div>
  </motion.div>
);

// 3. AI Tools Görünümü (Yeni)
const AiView = () => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
    className={styles.viewContainer}
  >
    <div className={styles.aiGenerator}>
       <div className={styles.promptBox}>
          <span className={styles.badge}>AI YAZAR</span>
          <p>"Bağdat caddesine yakın, deniz manzaralı, geniş teraslı 3+1 daire için lüks segment ilan metni yaz..."</p>
       </div>
       <div className={styles.generatingVisual}>
          <motion.div 
            className={styles.loadingBar}
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>İçerik üretiliyor...</span>
       </div>
       <div className={styles.resultPreview}>
          <div className={styles.line} style={{width:'90%'}}></div>
          <div className={styles.line} style={{width:'80%'}}></div>
          <div className={styles.line} style={{width:'95%'}}></div>
       </div>
    </div>
  </motion.div>
);

// --- YENİ BİLEŞEN: Dönen Aktivite Bildirimleri ---
const ActivityTicker = () => {
  const [index, setIndex] = useState(0);
  
  // Döngüye girecek mesajlar listesi
  const tasks = [
    { text: "Görev: Tapu randevusu al", icon: FileSignature, color: "#10b981" }, // Yeşil - İmza ikonu
    { text: "Arama: Ahmet Bey'i bilgilendir", icon: Phone, color: "#3b82f6" },   // Mavi - Telefon ikonu
    { text: "Uyarı: Sözleşme süresi doluyor", icon: Clock, color: "#f59e0b" },   // Turuncu - Saat ikonu
    { text: "Fırsat: Yeni portföy eşleşmesi", icon: Sparkles, color: "#7c3aed" } // Mor - Işıltı ikonu
  ];

  // 4 saniyede bir değiştir
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % tasks.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = tasks[index].icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index} // Key değiştiğinde animasyon yeniden başlar
        className={styles.activityPop}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
         <CurrentIcon size={14} style={{ color: tasks[index].color }} />
         <span>{tasks[index].text}</span>
      </motion.div>
    </AnimatePresence>
  );
};

const testimonials = [
  {
    name: "Merve Kaya",
    role: "Lüks Konut Uzmanı",
    company: "Remax Pro",
    image: "MK", // Avatar yerine harf kullanıyoruz, resim varsa url konabilir
    content: "Eskiden bir portföyün sosyal medya görselleri için 2 saat harcardım. EstateOS ile bu süre 5 dakikaya indi. Satışa odaklanmak için harika.",
    rating: 5
  },
  {
    name: "Caner Yılmaz",
    role: "Broker / Owner",
    company: "Keller Williams",
    image: "CY",
    content: "Ofisimdeki 15 danışmanın performansını tek ekrandan izleyebiliyorum. AI önerileri sayesinde geçen ay 'ölü' dediğimiz 3 satışı kapattık.",
    rating: 5
  },
  {
    name: "Selin Demir",
    role: "Freelance Danışman",
    company: "Bağımsız",
    image: "SD",
    content: "Tek başıma çalışıyorum ama arkamda dev bir ajans var gibi. Müşteri mesajlarına AI ile dönmek profesyonelliğimi ikiye katladı.",
    rating: 5
  }
];

// --- FAQ (Sıkça Sorulan Sorular) ---
const faqs = [
  {
    q: "Ücretsiz deneme süresinde kredi kartı gerekiyor mu?",
    a: "Hayır, EstateOS'u 14 gün boyunca kredi kartı bilgilerinizi girmeden, tüm özellikleriyle ücretsiz deneyebilirsiniz."
  },
  {
    q: "Mevcut portföylerimi Excel'den aktarabilir miyim?",
    a: "Evet, 'Toplu İçe Aktar' özelliği sayesinde Excel veya CSV formatındaki müşteri ve portföy listenizi saniyeler içinde sisteme yükleyebilirsiniz."
  },
  {
    q: "Aboneliğimi istediğim zaman iptal edebilir miyim?",
    a: "Kesinlikle. Hiçbir taahhüt yoktur. Paneliniz üzerinden tek tıkla aboneliğinizi dondurabilir veya iptal edebilirsiniz."
  },
  {
    q: "Yapay zeka içerikleri SEO uyumlu mu?",
    a: "Evet, oluşturulan ilan metinleri emlak platformlarının algoritmalarına ve Google SEO kriterlerine uygun anahtar kelimelerle optimize edilir."
  }
];

const AccordionItem = ({ question, answer, isOpen, onClick }: any) => {
  return (
    <motion.div 
      initial={false}
      className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}
      onClick={onClick}
    >
      <div className={styles.faqHeader}>
        <span className={styles.question}>{question}</span>
        <div className={styles.iconWrapper}>
           {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto", marginTop: 16 },
              collapsed: { opacity: 0, height: 0, marginTop: 0 }
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className={styles.answer}>{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function Home() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'ai'>('dashboard');
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const floatAnimation = (delay: number, yOffset: number) => ({ y: [0, yOffset, 0], transition: { repeat: Infinity, duration: 4 + delay, ease: "easeInOut" as const, delay: delay } });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
  {/* Tıkla Dene İpucu */}

  <div className={styles.mockupWindow}>
    <div className={styles.windowHeader}>
       <div className={styles.dots}><span></span><span></span><span></span></div>
       <div className={styles.addressBar}>estateos.app/dashboard</div>
    </div>

    <div className={styles.windowBody}>
      {/* Tıklanabilir Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.logo}></div>

        <div 
          className={`${styles.item} ${activeTab === 'dashboard' ? styles.active : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <HomeIcon size={18}/>
        </div>

        <div 
          className={`${styles.item} ${activeTab === 'crm' ? styles.active : ''}`}
          onClick={() => setActiveTab('crm')}
        >
          <Users size={18}/>
        </div>

        <div 
          className={`${styles.item} ${activeTab === 'ai' ? styles.active : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Sparkles size={18}/>
        </div>

        <div className={styles.item}><ImageIcon size={18}/></div>
        <div className={styles.item}><Share2 size={18}/></div>
        <div className={`${styles.item} ${styles.mtAuto}`}><Settings size={18}/></div>
      </div>

      {/* Değişen İçerik Alanı */}
      <div className={styles.content}>
        <div className={styles.dashHeader}>
          <div className={styles.welcome}>
            <motion.h3 key={activeTab} initial={{opacity:0}} animate={{opacity:1}}>
              {activeTab === 'dashboard' ? 'Hoş geldin, Burak 👋' : 
               activeTab === 'crm' ? 'Müşteri Yönetimi' : 'AI İçerik Sihirbazı'}
            </motion.h3>
            <span>Elite Broker Paketi</span>
          </div>
          <div className={styles.actionBtn}>
             <PlusCircle size={18} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardView key="dash" />}
          {activeTab === 'crm' && <CrmView key="crm" />}
          {activeTab === 'ai' && <AiView key="ai" />}
        </AnimatePresence>
      </div>
    </div>
  </div>

  {/* Sürüklenebilir (Draggable) Badge'lar - GripVertical burada kullanılıyor */}
  <motion.div drag dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }} 
    animate={floatAnimation(0, -15)} className={`${styles.floatingBadge} ${styles.pos1}`}
    style={{ cursor: 'grab' }} whileDrag={{ cursor: 'grabbing', scale: 1.1 }}
  >
    <div className={`${styles.icon} ${styles.blue}`}><Users size={14}/></div>
    <span>Müşteri Eşleşti!</span>
    <GripVertical size={12} style={{opacity:0.3, marginLeft:4}}/>
  </motion.div>

  <motion.div drag dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }} 
    animate={floatAnimation(1, -20)} className={`${styles.floatingBadge} ${styles.pos2}`}
    style={{ cursor: 'grab' }} whileDrag={{ cursor: 'grabbing', scale: 1.1 }}
  >
    <div className={`${styles.icon} ${styles.purple}`}><Sparkles size={14}/></div>
    <span>İlan Metni Hazır</span>
    <GripVertical size={12} style={{opacity:0.3, marginLeft:4}}/>
  </motion.div>

  <motion.div drag dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }} 
    animate={floatAnimation(0.5, 15)} className={`${styles.floatingBadge} ${styles.pos3}`}
    style={{ cursor: 'grab' }} whileDrag={{ cursor: 'grabbing', scale: 1.1 }}
  >
    <div className={`${styles.icon} ${styles.orange}`}><Instagram size={14}/></div>
    <span>Story Tasarlandı</span>
    <GripVertical size={12} style={{opacity:0.3, marginLeft:4}}/>
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

      {/* --- ÇÖZÜM / DEĞER ÖNERİSİ SECTION (GÜNCELLENMİŞ V3) --- */}
      <section className={styles.solutionSection}>
        <div className={styles.container}>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.solutionHeader}
          >
            <div className={styles.badge}>YETENEKLER</div>
            <h2>Emlak İşiniz İçin <span className={styles.highlight}>Tam Donanımlı İşletim Sistemi</span></h2>
            <p>Portföy yönetiminden satış kapatmaya kadar tüm süreç tek ekranda.</p>
          </motion.div>

          <motion.div 
            className={styles.bentoGrid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
          >
            
            {/* 1. PORTFÖY YÖNETİMİ: Tek Girdi, Çoklu Çıktı */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className={styles.bentoCard} whileHover="hover">
              <div className={styles.cardContent}>
                <div className={`${styles.iconBox} ${styles.blue}`}><LayoutDashboard size={20}/></div>
                <h3>Tek Tuşla Çoklu İçerik Üretimi</h3>
                <p className={styles.subText}>Portföy detaylarını girin; İlan metni, Instagram/LinkedIn post açıklaması ve Reels senaryo metni aynı anda üretilsin.</p>
              </div>
              
              <div className={`${styles.cardVisual} ${styles.visualContentGen}`}>
                 <div className={styles.genProcess}>
                    {/* Input Tarafı */}
                    <div className={styles.genInput}>
                       <div className={styles.miniFile}><Building2 size={12}/><span>Portföy Verisi</span></div>
                       <motion.div 
                         className={styles.genArrow}
                         animate={{ width: ["0%", "100%", "0%"], opacity: [0, 1, 0] }}
                         transition={{ duration: 3, repeat: Infinity }}
                       />
                    </div>
                    {/* Output Listesi */}
                    <div className={styles.genOutput}>
                       {[
                         { icon: <FileText size={10}/>, text: "Sahibinden İlan Metni", color: "blue" },
                         { icon: <Instagram size={10}/>, text: "Instagram Post Açıklaması", color: "pink" },
                         { icon: <Briefcase size={10}/>, text: "LinkedIn Yazısı", color: "blue" },
                         { icon: <Clapperboard size={10}/>, text: "Reels Senaryo Metni", color: "orange" }
                       ].map((item, i) => (
                         <motion.div 
                           key={i} 
                           className={styles.genItem}
                           initial={{ opacity: 0, x: 10 }}
                           whileInView={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.5, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                         >
                            <div className={`${styles.itemIcon} ${styles[item.color]}`}>{item.icon}</div>
                            <span>{item.text}</span>
                            <CheckCircle2 size={10} className={styles.check}/>
                         </motion.div>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>

            {/* 2. CRM: Kanban Pipeline & Aktivite */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className={styles.bentoCard} whileHover="hover">
  <div className={styles.cardContent}>
    <div className={`${styles.iconBox} ${styles.green}`}><Users size={20}/></div>
    <h3>Uçtan Uca Müşteri Takibi</h3>
    <p className={styles.subText}>Yeni müşteriden satışa giden Kanban yolculuğu. Sürükle-bırak yönetimi, aktivite ve görev takibi.</p>
  </div>

              <div className={`${styles.cardVisual} ${styles.visualKanban}`}>
                <div className={styles.kanbanBoard}>
                   {/* Column 1: Görüşüldü */}
                   <div className={styles.kCol}>
                      <div className={styles.kHeader}><span className={styles.dot}></span>Görüşüldü</div>
                      <div className={styles.kCard}>
                         <div className={styles.kAvatar}></div>
                         <div className={styles.kLines}><div className={styles.kLine}></div></div>
                      </div>
                   </div>
                   {/* Column 2: Teklif (Animasyonlu Geçiş) */}
                   <div className={styles.kCol}>
                      <div className={styles.kHeader}><span className={`${styles.dot} ${styles.orange}`}></span>Teklif / Pazarlık</div>
                      <motion.div 
                        className={`${styles.kCard} ${styles.active}`}
                        animate={{ y: [0, -40, 0], x: [0, 50, 0], scale: [1, 1.1, 1] }} // Kartın sütun değiştirmesi simülasyonu
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                         <div className={styles.kAvatar} style={{background: '#10b981'}}></div>
                         <div className={styles.kTag}>Satışa Yakın</div>
                      </motion.div>
                   </div>
                   {/* Column 3: Satış */}
                   <div className={styles.kCol}>
                      <div className={styles.kHeader}><span className={`${styles.dot} ${styles.green}`}></span>Satış Başarılı</div>
                   </div>
                </div>
                {/* Floating Activity Notification */}
                <ActivityTicker />
              </div>
            </motion.div>

            {/* 3. AI STRATEJİ: Mesaj Hazırlama & Eşleşme */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className={styles.bentoCard} whileHover="hover">
              <div className={styles.cardContent}>
                <div className={`${styles.iconBox} ${styles.violet}`}><Sparkles size={20}/></div>
                <h3>Satışı Kapatan Stratejik Zeka</h3>
                <p className={styles.subText}>Müşteri verisine göre kişiselleştirilmiş mesaj taslağı hazırlayın ve en uygun portföyleri eşleştirin.</p>
              </div>

              <div className={`${styles.cardVisual} ${styles.visualAiStrategy}`}>
                 <div className={styles.aiInterface}>
                    {/* Üst: Müşteri Profili */}
                    <div className={styles.clientProfile}>
                       <div className={styles.cpIcon}><Users size={12}/></div>
                       <div className={styles.cpInfo}>
                          <span className={styles.cpName}>Ahmet Yılmaz</span>
                          <span className={styles.cpTag}>Yatırımcı</span>
                       </div>
                    </div>
                    {/* Alt: AI Yazıyor */}
                    <div className={styles.aiMessageBlock}>
                       <div className={styles.aiHeader}>
                          <Sparkles size={10} color="#7c3aed"/>
                          <span>AI Mesaj Taslağı Hazırlıyor...</span>
                       </div>
                       <div className={styles.typewriterArea}>
                          <motion.p
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            className={styles.typingText}
                          >
                             "Ahmet Bey, ilgilendiğiniz Kadıköy bölgesinde, ROI oranı %15 olan yeni bir fırsat portföyümüz var..."
                          </motion.p>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>

            {/* 4. DİJİTAL AJANS: Görsel & Video Üretimi */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className={styles.bentoCard} whileHover="hover">
              <div className={styles.cardContent}>
                <div className={`${styles.iconBox} ${styles.orange}`}><ImageIcon size={20}/></div>
                <h3>Cebinizdeki Dijital Medya Ajansı</h3>
                <p className={styles.subText}>Profesyonel tasarımcıya ihtiyaç duymadan sosyal medya görselleri ve UGC emlak videoları üretin.</p>
              </div>

              <div className={`${styles.cardVisual} ${styles.visualAgency}`}>
                 <div className={styles.mediaStudio}>
                    {/* Sol: Görsel Üretimi */}
                    <div className={styles.postGenerator}>
                       <div className={styles.pgHeader}>Post</div>
                       <motion.div 
                          className={styles.pgImage}
                          animate={{ filter: ["blur(5px)", "blur(0px)"] }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                       >
                          <div className={styles.badgeOverlay}>FIRSAT</div>
                       </motion.div>
                    </div>
                    {/* Sağ: Video/Reels */}
                    <div className={styles.videoGenerator}>
                       <div className={styles.pgHeader}>UGC Video</div>
                       <div className={styles.videoFrame}>
                          <motion.div 
                             className={styles.playIcon}
                             animate={{ scale: [1, 1.2, 1] }}
                             transition={{ duration: 2, repeat: Infinity }}
                          >
                             <Play size={10} fill="white"/>
                          </motion.div>
                          <div className={styles.timelineBar}>
                             <motion.div className={styles.progress} animate={{ width: "100%" }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}/>
                          </div>
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

      {/* --- TESTIMONIALS SECTION --- */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
           <motion.div 
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
           >
              <h2 className={styles.title}>Danışmanlar <span className={styles.highlight}>Neler Söylüyor?</span></h2>
              <p className={styles.subtitle}>Türkiye genelinde 500+ profesyonel EstateOS kullanıyor.</p>
           </motion.div>

           <div className={styles.testimonialsGrid}>
              {testimonials.map((item, i) => (
                <motion.div 
                  key={i}
                  className={styles.testimonialCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                   <div className={styles.stars}>
                      {[...Array(item.rating)].map((_, starI) => (
                        <Star key={starI} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                   </div>
                   <p className={styles.comment}>"{item.content}"</p>
                   <div className={styles.profile}>
                      <div className={styles.avatar}>{item.image}</div>
                      <div className={styles.info}>
                         <div className={styles.name}>{item.name}</div>
                         <div className={styles.role}>{item.role}, {item.company}</div>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* ... Pricing Section Buraya Gelecek (Mevcut kodunuzda var) ... */}
      
      {/* Pricing Section bittikten hemen sonra, Footer'dan önce: */}
      
      {/* --- FAQ SECTION --- */}
      <section className={styles.sectionPadding}>
         <div className={styles.container}>
            <div className={styles.faqLayout}>
               {/* Sol Taraf: Başlık */}
               <div className={styles.faqInfo}>
                  <div className={styles.miniLabel} style={{color:'#a78bfa', borderColor:'rgba(124, 58, 237, 0.3)', background:'rgba(124, 58, 237, 0.1)'}}>DESTEK</div>
                  <h2>Aklınıza takılanlar mı var?</h2>
                  <p>Sıkça sorulan soruları derledik. Başka bir sorunuz varsa canlı destekten bize yazabilirsiniz.</p>
                  <Link href="/contact" className={styles.btnOutline} style={{display:'inline-flex', marginTop:'1rem'}}>
                     İletişime Geç
                  </Link>
               </div>
               
               {/* Sağ Taraf: Accordion */}
               <div className={styles.faqList}>
                  {faqs.map((faq, i) => (
                    <AccordionItem 
                      key={i} 
                      question={faq.q} 
                      answer={faq.a} 
                      isOpen={i === openFaqIndex}
                      onClick={() => setOpenFaqIndex(i === openFaqIndex ? null : i)}
                    />
                  ))}
               </div>
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