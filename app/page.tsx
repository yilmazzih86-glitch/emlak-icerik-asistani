"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { 
  ArrowRight, Building2, Sparkles, Wand2, 
  Users, Instagram, Clapperboard, 
  CheckCircle2, FileText, Play, Check, X,
  LayoutDashboard, PlusCircle, Image as ImageIcon,
  Settings, Share2, Type, ImagePlus, Share, TrendingUp, ChevronRight, ChevronLeft, Briefcase, Zap
} from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";

// --- 1. FOTOĞRAF SLIDER ---
function CompareSlider() {
  const x = useMotionValue(0.5); 
  const widthPercentage = useTransform(x, value => `${value * 100}%`);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgImage = "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop')";

  return (
    <div className="interactive-visual slider-container" ref={containerRef}>
      <div className="img-after" style={{ backgroundImage: bgImage, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="badge-label">SONRASI (4K HDR)</div>
      </div>
      <motion.div className="img-before" style={{ width: widthPercentage, backgroundImage: bgImage, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(4px) grayscale(70%) brightness(0.8)' }}>
         <div className="badge-label left">ÖNCESİ</div>
      </motion.div>
      <motion.div className="slider-handle" style={{ left: widthPercentage }} drag="x" dragConstraints={containerRef} dragElastic={0} dragMomentum={false}
        onDrag={(e, info) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newX = (info.point.x - rect.left) / rect.width;
            x.set(Math.max(0, Math.min(1, newX)));
        }}
      >
        <div className="handle-line"></div>
        <div className="handle-circle"><ChevronLeft size={14} className="text-black" /><ChevronRight size={14} className="text-black" /></div>
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
        <div className="interactive-visual wizard-anim">
            <div className="fake-form">
                <div className="input-group"><label>Lokasyon</label><div className="input-box">{status !== 'idle' && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Kadıköy, Moda</motion.span>)}{status === 'typing' && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="cursor">|</motion.span>}</div></div>
                <div className="input-group"><label>Özellikler</label><div className="input-box">{(status === 'typing' || status === 'generating' || status === 'success') && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>3+1, Deniz Manzaralı</motion.span>)}</div></div>
                <div className={`action-btn ${status === 'generating' ? 'loading' : ''}`}>{status === 'generating' ? (<><Sparkles size={14} className="spin"/> Oluşturuluyor...</>) : "İçerik Oluştur"}</div>
                <motion.div className="success-card" initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: status === 'success' ? 1 : 0, y: status === 'success' ? 0 : 10, height: status === 'success' ? 'auto' : 0 }}>
                    <div className="success-header"><CheckCircle2 size={14} className="text-green-400"/><span>Hazır!</span></div>
                    <div className="skeleton-lines"><div className="line w-full"></div><div className="line w-3/4"></div><div className="line w-1/2"></div></div>
                </motion.div>
            </div>
        </div>
    );
}

// --- 3. SOSYAL MEDYA ---
function SocialAnim() {
    return (
        <div className="interactive-visual social-anim">
            <div className="phone-mockup">
                <div className="phone-header"><div className="avatar"></div><div className="username">emlak.ofisi</div></div>
                <div className="phone-content gradient-post"></div>
                <div className="phone-footer"><div className="btn-ph"></div><div className="btn-ph secondary"></div></div>
            </div>
            <div className="phone-mockup back-card"></div>
        </div>
    )
}

// --- 4. CRM ---
function CrmAnim() {
    return (
        <div className="interactive-visual crm-anim">
            <div className="chart-container">
                <div className="chart-header">Aylık Performans</div>
                <div className="chart-body">
                    <svg viewBox="0 0 100 40" className="chart-svg">
                        <defs><linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.2"/><stop offset="100%" stopColor="#22c55e" stopOpacity="0"/></linearGradient></defs>
                        <motion.path d="M0 40 L0 35 Q 20 30, 40 20 T 100 5 L 100 40 Z" fill="url(#chartGradient)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}/>
                        <motion.path d="M0 35 Q 20 30, 40 20 T 100 5" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeOut" }}/>
                    </svg>
                </div>
                <div className="chart-value">+24 <span>İşlem</span></div>
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
    <main className="landing-page" ref={ref}>
      
      {/* NAVBAR */}
      <motion.header initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="navbar glass-nav">
        <div className="container">
          <div className="logo"><div className="icon-box"><Building2 size={24} /></div><span className="brand-name">Emlak İçerik Asistanı</span></div>
          <nav className="nav-links">
            <Link href="/login" className="nav-item">Giriş Yap</Link>
            {/* Ücretsiz Dene Butonu -> plan=free */}
            <Link href="/register?plan=free" className="btn btn-primary-glow">Ücretsiz Dene</Link>
          </nav>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <motion.div style={{ y: backgroundY }} className="glow-bg purple-glow"></motion.div>
        <motion.div style={{ y: backgroundY }} className="glow-bg orange-glow"></motion.div>
        
        <div className="container">
          <div className="hero-content">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="badge-pill brand-badge">
              <Sparkles size={14} className="icon-spin" /><span>Yapay Zeka Destekli Emlak Platformu</span>
            </motion.div>
            
            <motion.h1 style={{ y: textY }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="hero-title">
              Emlak Profesyonelleri İçin <br /><span className="text-gradient-brand">Süper Güçler</span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="hero-desc">
              Tek bir platformda portföy metinleri yazın, fotoğrafları 4K kaliteye getirin, sosyal medya görselleri ve videoları üretin.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="cta-group">
              {/* HERO Ücretsiz Dene Butonu -> plan=free */}
              <Link href="/register?plan=free" className="btn btn-primary-lg">Ücretsiz Dene <ArrowRight size={20} /></Link>
              <Link href="/login" className="btn btn-outline-lg">Giriş Yap</Link>
            </motion.div>

            {/* DASHBOARD VISUAL */}
            <motion.div initial={{ opacity: 0, y: 100, rotateX: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} transition={{ delay: 0.8, duration: 1.2, type: "spring", bounce: 0.3 }} className="hero-visual glass-panel brand-border">
              <div className="mockup-window realistic">
                <div className="window-header"><div className="dots"><span></span><span></span><span></span></div><div className="address-bar">emlakasistani.com/dashboard</div></div>
                <div className="window-body dashboard-layout">
                  <div className="dash-sidebar">
                    <div className="sidebar-item active"><LayoutDashboard size={16}/></div><div className="sidebar-item"><PlusCircle size={16}/></div><div className="sidebar-item"><ImageIcon size={16}/></div><div className="sidebar-item mt-auto"><Settings size={16}/></div>
                  </div>
                  <div className="dash-content">
                    <div className="dash-header"><div className="dash-title">Genel Bakış</div><div className="dash-user">UA</div></div>
                    <div className="dash-stats-grid">
                      <div className="stat-card purple"><span>Toplam Portföy</span><h3>24 Adet</h3></div>
                      <div className="stat-card orange"><span>Kalan Kredi</span><h3>850 Kredi</h3></div>
                    </div>
                    <div className="dash-recent">
                      <div className="recent-title">Son İşlemler</div>
                      <div className="recent-list">
                        <div className="recent-item"><div className="icon p-bg"><Sparkles size={14}/></div><div className="info">Ataşehir 3+1 Daire <span>İçerik Üretildi</span></div></div>
                        <div className="recent-item"><div className="icon o-bg"><ImageIcon size={14}/></div><div className="info">Villa Fotoğrafları <span>AI İyileştirme</span></div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div animate={floatAnimation(0, -15)} className="floating-badge top-left"><CheckCircle2 size={18} className="text-green"/> <span>İlan Hazırlandı</span></motion.div>
              <motion.div animate={floatAnimation(1, -20)} className="floating-badge top-right"><Wand2 size={18} className="text-purple"/> <span>AI Fotoğraf İyileştirildi</span></motion.div>
              <motion.div animate={floatAnimation(0.5, 15)} className="floating-badge bottom-left"><Share2 size={18} className="text-orange"/> <span>Sosyal Medya Görseli</span></motion.div>
              <motion.div animate={floatAnimation(1.5, 20)} className="floating-badge bottom-right"><Clapperboard size={18} className="text-blue"/> <span>AI Video Üretildi</span></motion.div>
              <motion.div animate={floatAnimation(2, -10)} className="floating-badge center-right"><FileText size={18} className="text-red"/> <span>PDF Sunum Hazır</span></motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header center">
            <h2>İş Akışınızı Hızlandırın</h2>
            <p>Emlak danışmanlarının en çok zaman kaybettiği işleri yapay zekaya devredin.</p>
          </div>
          <div className="bento-grid">
            <motion.div whileHover={{ y: -5 }} className="bento-card large"><div className="card-content"><div className="icon-box purple"><Type size={24} /></div><h3>İçerik Sihirbazı</h3><p>Bilgileri girin, AI saniyeler içinde tüm platformlar için pazarlama metinlerini yazsın.</p></div><ContentWizardAnim /></motion.div>
            <motion.div whileHover={{ y: -5 }} className="bento-card"><div className="card-content"><div className="icon-box blue"><ImagePlus size={24} /></div><h3>Fotoğraf İyileştirme</h3><p>Karanlık ve cansız fotoğrafları AI ile 4K HDR kalitesine getirin.</p></div><CompareSlider /></motion.div>
            <motion.div whileHover={{ y: -5 }} className="bento-card"><div className="card-content"><div className="icon-box orange"><Share size={24} /></div><h3>Sosyal Medya Tasarımı</h3><p>Kurumsal kimliğinize uygun hazır "Satılık/Kiralık" gönderileri.</p></div><SocialAnim /></motion.div>
            <motion.div whileHover={{ y: -5 }} className="bento-card wide"><div className="card-content"><div className="icon-box green"><TrendingUp size={24} /></div><h3>CRM & Ekip Yönetimi</h3><p>Performansı takip edin, ekibinizi yönetin.</p></div><CrmAnim /></motion.div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="section-padding pricing-bg">
        <div className="container">
          <div className="section-header center">
            <h2>Paket Seçenekleri</h2>
            <p>İster tek başına çalış, ister büyük bir ofis yönet. İhtiyacına uygun gücü seç.</p>
          </div>
          <div className="pricing-grid">
            {[
              {
                name: "Freelance", key: "freelance", price: "249", icon: Briefcase, color: "blue",
                features: [
                  { text: "Aylık 15 Adet İçerik Üretimi", included: true },
                  { text: "Geçmiş: Son 10 Kayıt Tutulur", included: true },
                  { text: "Temel PDF Çıktısı (Görselsiz)", included: true },
                  { text: "AI Görsel İyileştirme (3 Adet/Ay)", included: true },
                  { text: "AI Sosyal Medya Görseli (1 Adet/Ay)", included: true },
                  { text: "Sora 2 Video", included: false },
                  { text: "CRM Lite (Müşteri Listesi)", included: false },
                  { text: "Ofis & Ekip Yönetim Paneli", included: false },
                ]
              },
              {
                name: "Profesyonel", key: "pro", price: "799", icon: Zap, color: "purple", popular: true,
                features: [
                  { text: "Aylık 100 Adet İçerik Üretimi", included: true },
                  { text: "Geçmiş: Son 50 Kayıt Tutulur", included: true },
                  { text: "Profesyonel PDF (Görselli)", included: true },
                  { text: "AI Görsel İyileştirme (30 Adet/Ay)", included: true },
                  { text: "AI Sosyal Medya Görseli (15 Adet/Ay)", included: true },
                  { text: "Sora 2 Video (1 Video/Ay)", included: true },
                  { text: "CRM Lite (Müşteri Listesi)", included: true },
                  { text: "Ofis & Ekip Yönetim Paneli", included: false },
                ]
              },
              {
                name: "Ofis / Ekip", key: "office", price: "1.990", icon: Building2, color: "orange",
                features: [
                  { text: "3 Kullanıcı Dahildir", included: true },
                  { text: "Aylık 150 Adet İçerik Üretimi", included: true },
                  { text: "Geçmiş: Sınırsız Kayıt", included: true },
                  { text: "Özel Markalı PDF Teması", included: true },
                  { text: "AI Görsel İyileştirme (100 Adet)", included: true },
                  { text: "AI Sosyal Medya (50 Adet)", included: true },
                  { text: "Sora 2 Video (2 Video/Ay)", included: true },
                  { text: "CRM Pro & Ekip Yönetimi", included: true },
                ]
              }
            ].map((plan, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-tag">EN ÇOK TERCİH EDİLEN</div>}
                <div className="card-top"><div className={`icon-box ${plan.color}`}><plan.icon size={24} /></div><div><h3>{plan.name}</h3><span className="plan-type">Paket</span></div></div>
                <div className="price-area"><span className="amount">{plan.price} ₺</span><span className="period">/ ay</span></div>
                <ul className="features">{plan.features.map((feature, i) => (<li key={i} className={!feature.included ? "disabled" : ""}>{feature.included ? (<Check size={16} className={plan.popular ? "text-purple-400" : "text-green-400"} />) : (<X size={16} className="text-gray-600" />)}<span>{feature.text}</span></li>))}</ul>
                <Link href={`/register?plan=${plan.key}`} className={plan.popular ? "btn btn-primary-full" : "btn btn-outline-full"}>{plan.popular ? "Hemen Başla" : "Seç"}</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="container">
          <p>© 2025 Emlak İçerik Asistanı. Tüm hakları saklıdır.</p>
          <div className="footer-links">
            <Link href="#">Gizlilik</Link><Link href="#">Kullanım Şartları</Link><Link href="#">İletişim</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}