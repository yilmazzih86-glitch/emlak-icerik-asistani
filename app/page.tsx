import Link from "next/link";
import { 
  ArrowRight, Building2, Sparkles, Wand2, 
  Users, FileText, Instagram, Linkedin, Clapperboard, 
  CheckCircle2, Image as ImageIcon, BarChart3, Check, Zap, MoveRight
} from "lucide-react";

export default function Home() {
  return (
    <main className="landing-page">
      
      {/* --- NAVBAR --- */}
      <header className="navbar glass-nav">
        <div className="container">
          <div className="logo">
            <div className="icon-box">
              <Building2 size={22} />
            </div>
            <span className="brand-name">Emlak İçerik Asistanı</span>
          </div>
          <nav className="nav-links">
            <Link href="/login" className="nav-item">Giriş Yap</Link>
            <Link href="/register" className="btn btn-primary-glow">
              Ücretsiz Dene
            </Link>
          </nav>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        {/* Background Glows */}
        <div className="glow-bg purple-glow"></div>
        <div className="glow-bg blue-glow"></div>
        
        <div className="container">
          <div className="hero-content">
            <div className="badge-pill">
              <Sparkles size={14} className="icon-spin" />
              <span>Yapay Zeka Destekli Emlak Platformu</span>
            </div>
            
            <h1 className="hero-title">
              Emlak Profesyonelleri İçin <br />
              <span className="text-gradient">Süper Güçler</span>
            </h1>
            
            <p className="hero-desc">
              Tek bir platformda portföy metinleri yazın, fotoğrafları iyileştirin, 
              sosyal medya görselleri üretin ve ofisinizi yönetin.
            </p>

            <div className="cta-group">
              <Link href="/register" className="btn btn-primary-lg">
                Hemen Başla <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="btn btn-outline-lg">
                Demo İncele
              </Link>
            </div>

            {/* Alt Özellik Listesi (Tikli) */}
            <div className="hero-features">
              <div className="h-feature">
                <CheckCircle2 className="text-green" size={18} /> <span>AI Metin Yazarı</span>
              </div>
              <div className="h-feature">
                <CheckCircle2 className="text-green" size={18} /> <span>Görsel İyileştirme</span>
              </div>
              <div className="h-feature">
                <CheckCircle2 className="text-green" size={18} /> <span>CRM & Ofis Yönetimi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE 1: İÇERİK SİHİRBAZI --- */}
      <section className="feature-section">
        <div className="container grid-layout">
          <div className="text-content">
            <div className="icon-wrapper purple">
              <Sparkles size={24} />
            </div>
            <h2>İçerik Sihirbazı</h2>
            <p>
              Mülkünüzün detaylarını girin, yapay zekamız saniyeler içinde 
              4 farklı kanalda profesyonel içerik üretsin.
            </p>
            <ul className="feature-list">
              <li>
                <Building2 size={18} className="text-orange" />
                <div>
                  <strong>Portal İlan Metni</strong>
                  <span className="sub-text">Sahibinden.com uyumlu, SEO dostu açıklama.</span>
                </div>
              </li>
              <li>
                <Instagram size={18} className="text-pink" />
                <div>
                  <strong>Instagram Caption</strong>
                  <span className="sub-text">Etkileyici, emojili ve hashtag'li gönderi metni.</span>
                </div>
              </li>
              <li>
                <Linkedin size={18} className="text-blue" />
                <div>
                  <strong>LinkedIn Makalesi</strong>
                  <span className="sub-text">Yatırımcı odaklı, kurumsal dil.</span>
                </div>
              </li>
              <li>
                <Clapperboard size={18} className="text-purple" />
                <div>
                  <strong>Reels Senaryosu</strong>
                  <span className="sub-text">Dakika dakika video çekim planı ve seslendirme.</span>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Sağ Taraf: AI Typing Mockup */}
          <div className="visual-content glass-card typing-mockup">
            <div className="window-controls">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="chat-interface">
              <div className="skeleton-group">
                <div className="line w-3/4"></div>
                <div className="line w-1/2"></div>
              </div>
              <div className="ai-response">
                <Sparkles size={16} className="ai-icon" />
                <div className="typing-text">
                  Harika bir deniz manzaralı daire...<span className="cursor">|</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE 2: GÖRSEL İYİLEŞTİRME --- */}
      <section className="feature-section reverse">
        <div className="container grid-layout">
          
          {/* Sol Taraf: Before/After Slider */}
          <div className="visual-content glass-card visual-compare-wrapper">
             <div className="compare-labels">
               <span className="label before">Önce (Bulanık)</span>
               <span className="label after">Sonra (4K Net)</span>
             </div>
             <div className="compare-image-container">
               <div className="scan-line">
                 <div className="scan-handle">
                   <MoveRight size={14} className="text-black" />
                 </div>
               </div>
             </div>
          </div>

          <div className="text-content">
            <div className="icon-wrapper blue">
              <Wand2 size={24} />
            </div>
            <h2>Görsel İyileştirme & Tasarım</h2>
            <p>
              Kötü ışıkta çekilmiş veya bulanık fotoğraflar artık sorun değil. 
              Yapay zeka ile fotoğraflarınızı galeri kalitesine getirin.
            </p>
            <ul className="feature-list simple">
              <li>
                <ImageIcon size={20} /> 
                <strong>Upscale & Netleştirme:</strong> Bulanık fotoğrafları keskinleştirin.
              </li>
              <li>
                <FileText size={20} /> 
                <strong>Sosyal Medya Şablonları:</strong> İlan fotoğrafını yükleyin, otomatik "Satılık/Kiralık" postu oluşturun.
              </li>
              <li>
                <FileText size={20} /> 
                <strong>Sunum PDF:</strong> Müşterileriniz için tek tıkla kurumsal sunum dosyası hazırlayın.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- FEATURE 3: OFİS YÖNETİMİ --- */}
      <section className="feature-section">
        <div className="container grid-layout">
          <div className="text-content">
            <div className="icon-wrapper orange">
              <Users size={24} />
            </div>
            <h2>Ofis & Ekip Yönetimi</h2>
            <p>
              Sadece içerik değil, işinizi de yönetin. CRM modülü ve raporlama araçları ile
              ofisinizin verimliliğini artırın.
            </p>
            <ul className="feature-list simple">
              <li>
                <CheckCircle2 size={20} /> 
                <div>
                  <strong>CRM Modülü:</strong> 
                  <span className="block text-sm text-gray-400">Müşteri taleplerini ve portföy eşleşmelerini takip edin.</span>
                </div>
              </li>
              <li>
                <Users size={20} /> 
                <div>
                  <strong>Ekip Yönetimi:</strong>
                  <span className="block text-sm text-gray-400">Danışmanlarınızın performansını izleyin.</span>
                </div>
              </li>
              <li>
                <BarChart3 size={20} /> 
                <div>
                  <strong>Ofis Raporları:</strong>
                  <span className="block text-sm text-gray-400">Haftalık ve aylık içerik üretim raporları.</span>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Sağ Taraf: CRM List Animation */}
          <div className="visual-content glass-card crm-mockup">
             <div className="crm-header">
               <div className="search-bar"></div>
               <div className="user-avatar"></div>
             </div>
             <div className="crm-list">
               <div className="crm-item animate-in delay-1">
                 <div className="circle"></div>
                 <div className="lines">
                   <div className="l-long"></div>
                   <div className="l-short"></div>
                 </div>
                 <div className="badge">Müşteri</div>
               </div>
               <div className="crm-item animate-in delay-2 active">
                 <div className="circle"></div>
                 <div className="lines">
                   <div className="l-long"></div>
                   <div className="l-short"></div>
                 </div>
                 <div className="badge green">Sıcak Takip</div>
               </div>
               <div className="crm-item animate-in delay-3">
                 <div className="circle"></div>
                 <div className="lines">
                   <div className="l-long"></div>
                   <div className="l-short"></div>
                 </div>
                 <div className="badge">Randevu</div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section className="pricing-section">
        <div className="container">
          <div className="section-header text-center mb-16">
            <h2>İşine En Uygun Gücü Seç</h2>
            <p>İster tek başına çalış, ister büyük bir ofis yönet.</p>
          </div>
          
          <div className="pricing-grid">
            
            {/* PLAN 1: FREELANCE */}
            <div className="pricing-card">
              <div className="card-top">
                <div className="icon-box"><Building2 size={24}/></div>
                <div className="plan-name">
                  <h3>Freelance</h3>
                  <span className="plan-badge">PAKET</span>
                </div>
              </div>
              <div className="price-area">
                <span className="amount">249 ₺</span>
                <span className="period">/ ay</span>
              </div>
              <ul className="features">
                <li><Check size={16}/> Aylık 15 Adet İçerik Üretimi</li>
                <li><Check size={16}/> Geçmiş: Son 10 Kayıt Tutulur</li>
                <li><Check size={16}/> Temel PDF Çıktısı (Görselsiz)</li>
                <li><Check size={16}/> AI Görsel İyileştirme (3 Adet/Ay)</li>
                <li><Check size={16}/> AI Sosyal Medya Görseli (1 Adet/Ay)</li>
                <li className="disabled"><XIcon/> Sora 2 Video</li>
                <li className="disabled"><XIcon/> Profesyonel PDF</li>
                <li className="disabled"><XIcon/> CRM & Ekip Yönetimi</li>
              </ul>
              <Link href="/register?plan=freelance" className="btn btn-outline-full">Paketi Seç</Link>
            </div>

            {/* PLAN 2: PROFESYONEL (Highlight) */}
            <div className="pricing-card popular">
              <div className="popular-tag">EN ÇOK TERCİH EDİLEN</div>
              <div className="card-top">
                <div className="icon-box purple"><Zap size={24}/></div>
                <div className="plan-name">
                  <h3>Profesyonel</h3>
                  <span className="plan-badge purple">PAKET</span>
                </div>
              </div>
              <div className="price-area">
                <span className="amount">799 ₺</span>
                <span className="period">/ ay</span>
              </div>
              <ul className="features">
                <li><Check size={16}/> <strong>Aylık 100 Adet</strong> İçerik Üretimi</li>
                <li><Check size={16}/> Geçmiş: Son 50 Kayıt Tutulur</li>
                <li><Check size={16}/> Profesyonel PDF (Görselli)</li>
                <li><Check size={16}/> AI Görsel İyileştirme (30 Adet/Ay)</li>
                <li><Check size={16}/> AI Sosyal Medya Görseli (15 Adet/Ay)</li>
                <li><Check size={16}/> Sora 2 Video (1 Video/Ay)</li>
                <li><Check size={16}/> CRM Lite (Müşteri Listesi)</li>
              </ul>
              <Link href="/register?plan=pro" className="btn btn-white-full">Paketi Seç</Link>
            </div>

            {/* PLAN 3: OFİS */}
            <div className="pricing-card">
              <div className="card-top">
                <div className="icon-box orange"><Users size={24}/></div>
                <div className="plan-name">
                  <h3>Ofis / Ekip</h3>
                  <span className="plan-badge orange">PAKET</span>
                </div>
              </div>
              <div className="price-area">
                <span className="amount">1.990 ₺</span>
                <span className="period">/ ay</span>
              </div>
              <ul className="features">
                <li><Check size={16}/> <strong>3 Kullanıcı Dahildir</strong></li>
                <li><Check size={16}/> Aylık 150 Adet İçerik Üretimi</li>
                <li><Check size={16}/> Geçmiş: Sınırsız Kayıt</li>
                <li><Check size={16}/> Özel Markalı PDF Teması</li>
                <li><Check size={16}/> AI Görsel İyileştirme (100 Adet/Ay)</li>
                <li><Check size={16}/> Sora 2 Video (2 Video/Ay)</li>
                <li><Check size={16}/> CRM Pro (Gelişmiş Yönetim)</li>
                <li><Check size={16}/> Ofis & Ekip Yönetim Paneli</li>
              </ul>
              <Link href="/register?plan=office" className="btn btn-outline-full">Paketi Seç</Link>
            </div>

          </div>
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="cta-banner">
        <div className="container text-center">
          <h2>Emlak İşinizi Geleceğe Taşıyın</h2>
          <p>Binlerce danışman yapay zeka ile zaman kazanıyor. Siz de geride kalmayın.</p>
          <Link href="/register" className="btn btn-white-pill">Ücretsiz Başlayın</Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="landing-footer">
        <div className="container">
          <p>© 2025 Spektrum Creative. Tüm hakları saklıdır.</p>
          <div className="footer-links">
            <Link href="#">Gizlilik</Link>
            <Link href="#">Kullanım Şartları</Link>
            <Link href="#">İletişim</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Basit X İkonu
function XIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
}