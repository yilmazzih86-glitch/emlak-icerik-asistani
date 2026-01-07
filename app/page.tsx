"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { 
  ArrowRight, Building2, Sparkles, Wand2, 
  Users, Instagram, Clapperboard, 
  CheckCircle2, FileText, Play, Check, X,
  LayoutDashboard, PlusCircle, Image as ImageIcon,
  Settings, Share2, Type, ImagePlus, Share, TrendingUp, ChevronRight,
  ChevronLeft, Briefcase, Zap, Video, Search, Bell, LayoutGrid, Home as HomeIcon
} from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import styles from "./page.module.scss";

// --- 1. FOTOĞRAF SLIDER ---
function CompareSlider() {
  const x = useMotionValue(0.5); 
  const widthPercentage = useTransform(x, value => `${value * 100}%`);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgImage = "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop')";

  return (
    <div className={`${styles.interactiveVisual} ${styles.sliderContainer}`} ref={containerRef}>
      <div className={styles.imgAfter} style={{ backgroundImage: bgImage, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className={styles.badgeLabel}>SONRASI (4K HDR)</div>
      </div>
      <motion.div className={styles.imgBefore} style={{ width: widthPercentage, backgroundImage: bgImage, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(4px) grayscale(70%) brightness(0.8)' }}>
         <div className={`${styles.badgeLabel} ${styles.left}`}>ÖNCESİ</div>
      </motion.div>
      <motion.div className={styles.sliderHandle} style={{ left: widthPercentage }} drag="x" dragConstraints={containerRef} dragElastic={0} dragMomentum={false}
        onDrag={(e, info) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newX = (info.point.x - rect.left) / rect.width;
            x.set(Math.max(0, Math.min(1, newX)));
        }}
      >
        <div className={styles.handleLine}></div>
        <div className={styles.handleCircle}>
            <ChevronLeft size={14} color="#000" />
            <ChevronRight size={14} color="#000" />
        </div>
      </motion.div>
    </div>
  );
}

// --- 2. İÇERİK SİHİRBAZI ---
function ContentWizardAnim() {
    const [status, setStatus] = useState<'idle' | 'typing' | 'generating' | 'success'>('idle');
    useEffect(() => {
        const cycle = async () => {
            setStatus('idle'); await newqp(500);
            setStatus('typing'); await newqp(2000);
            setStatus('generating'); await newqp(1500);
            setStatus('success'); await newqp(3000);
            cycle();
        };
        cycle();
    }, []);
    const newqp = (ms: number) => new Promise(r => setTimeout(r, ms));

    return (
        <div className={`${styles.interactiveVisual} ${styles.wizardAnim}`}>
            <div className={styles.fakeForm}>
                <div className={styles.inputGroup}>
                    <label>Lokasyon</label>
                    <div className={styles.inputBox}>
                        {status !== 'idle' && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Kadıköy, Moda</motion.span>)}
                        {status === 'typing' && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="cursor">|</motion.span>}
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label>Özellikler</label>
                    <div className={styles.inputBox}>
                        {(status === 'typing' || status === 'generating' || status === 'success') && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>3+1, Deniz Manzaralı</motion.span>)}
                    </div>
                </div>
                <div className={`${styles.actionBtn} ${status === 'generating' ? styles.loading : ''}`}>
                    {status === 'generating' ? (<><Sparkles size={14} className={styles.spin}/> Oluşturuluyor...</>) : "İçerik Oluştur"}
                </div>
                <motion.div className={styles.successCard} initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: status === 'success' ? 1 : 0, y: status === 'success' ? 0 : 10, height: status === 'success' ? 'auto' : 0 }}>
                    <div className={styles.successHeader}><CheckCircle2 size={14} /><span>Hazır!</span></div>
                    <div className={styles.skeletonLines}>
                        <div className={styles.line} style={{width: '100%'}}></div>
                        <div className={styles.line} style={{width: '75%'}}></div>
                        <div className={styles.line} style={{width: '50%'}}></div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// --- 3. SOSYAL MEDYA ---
function SocialAnim() {
    return (
        <div className={`${styles.interactiveVisual} ${styles.socialAnim}`}>
            <div className={styles.phoneMockup}>
                <div className={styles.phoneHeader}><div className={styles.avatar}></div><div className={styles.username}></div></div>
                <div className={styles.phoneContent}></div>
                <div className={styles.phoneFooter}><div className={styles.btnPh}></div><div className={`${styles.btnPh} ${styles.secondary}`}></div></div>
            </div>
            <div className={`${styles.phoneMockup} ${styles.backCard}`}></div>
        </div>
    )
}

// --- 4. CRM ---
function CrmAnim() {
    return (
        <div className={`${styles.interactiveVisual} ${styles.crmAnim}`}>
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>Aylık Performans</div>
                <div className={styles.chartBody}>
                    <svg viewBox="0 0 100 40" style={{width: '100%', overflow: 'visible'}}>
                        <defs><linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.2"/><stop offset="100%" stopColor="#22c55e" stopOpacity="0"/></linearGradient></defs>
                        <motion.path d="M0 40 L0 35 Q 20 30, 40 20 T 100 5 L 100 40 Z" fill="url(#chartGradient)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}/>
                        <motion.path d="M0 35 Q 20 30, 40 20 T 100 5" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeOut" }}/>
                    </svg>
                </div>
                <div className={styles.chartValue}>+24 <span>İşlem</span></div>
            </div>
        </div>
    )
}

export default function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const floatAnimation = (delay: number, yOffset: number) => ({ y: [0, yOffset, 0], transition: { repeat: Infinity, duration: 4 + delay, ease: "easeInOut" as const, delay: delay } });

  return (
    <main className={styles.main} ref={ref}>
      
      {/* NAVBAR */}
      <motion.header initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className={styles.navbar}>
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
                        <div className={styles.value}>48.5 Saat</div>
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

      {/* BENTO GRID FEATURES */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>İş Akışınızı Hızlandırın</h2>
            <p>Emlak danışmanlarının en çok zaman kaybettiği işleri yapay zekaya devredin.</p>
          </div>
          <div className={styles.bentoGrid}>
            <motion.div whileHover={{ y: -5 }} className={`${styles.bentoCard} ${styles.large}`}>
                <div className={styles.cardContent}>
                    <div className={`${styles.iconBox} ${styles.purple}`}><Type size={24} /></div>
                    <h3>İçerik Sihirbazı</h3>
                    <p>Bilgileri girin, AI saniyeler içinde tüm platformlar için pazarlama metinlerini yazsın.</p>
                </div>
                <ContentWizardAnim />
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className={styles.bentoCard}>
                <div className={styles.cardContent}>
                    <div className={`${styles.iconBox} ${styles.blue}`}><ImagePlus size={24} /></div>
                    <h3>Fotoğraf İyileştirme</h3>
                    <p>Karanlık ve cansız fotoğrafları AI ile 4K HDR kalitesine getirin.</p>
                </div>
                <CompareSlider />
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className={styles.bentoCard}>
                <div className={styles.cardContent}>
                    <div className={`${styles.iconBox} ${styles.orange}`}><Share size={24} /></div>
                    <h3>Sosyal Medya Tasarımı</h3>
                    <p>Kurumsal kimliğinize uygun hazır "Satılık/Kiralık" gönderileri.</p>
                </div>
                <SocialAnim />
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className={`${styles.bentoCard} ${styles.wide}`}>
                <div className={styles.cardContent}>
                    <div className={`${styles.iconBox} ${styles.green}`}><TrendingUp size={24} /></div>
                    <h3>CRM & Ekip Yönetimi</h3>
                    <p>Performansı takip edin, ekibinizi yönetin.</p>
                </div>
                <CrmAnim />
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className={`${styles.sectionPadding} ${styles.pricingBg}`}>
  <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Paket Seçenekleri</h2>
            <p>İster tek başına çalış, ister büyük bir ofis yönet. İhtiyacına uygun gücü seç.</p>
          </div>
          <div className={styles.pricingGrid}>
            {[
              {
                name: "Freelance", key: "freelance", price: "499", icon: Briefcase, color: "blue",
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
                                (<Check size={16} color={plan.popular ? "#a78bfa" : "#4ade80"} />) : 
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
          <p>© 2025 EstateOS. Tüm hakları saklıdır.</p>
          <div className={styles.footerLinks}>
            <Link href="#">Gizlilik</Link><Link href="#">Kullanım Şartları</Link><Link href="#">İletişim</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}