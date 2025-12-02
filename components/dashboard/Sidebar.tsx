"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, PlusCircle, LogOut, Image as ImageIcon, 
  Video, Wand2, Lock, Crown, Users, FileBarChart, FileText, Contact, Settings,
  ChevronRight, Sparkles, FolderOpen
} from "lucide-react";

export default function Sidebar({ user, profile }: { user: any, profile: any }) {
  const pathname = usePathname();
  const plan = profile?.plan_type || 'free';

  const planLabels: any = {
    free: "Demo Paket",
    freelance: "Freelance",
    pro: "Pro Plan",
    office: "Ofis / Ekip"
  };

  const hasAccess = (requiredPlans: string[]) => {
    return requiredPlans.includes(plan);
  };

  // --- 1. MENÜ GRUPLARI ---

  const mainNav = [
    { name: "Genel Bakış", href: "/dashboard", icon: LayoutDashboard },
    { name: "Yeni İçerik Üret", href: "/dashboard/generate", icon: PlusCircle },
    { name: "Ayarlar", href: "/dashboard/settings", icon: Settings },
  ];

  // YENİ EKLENEN: Portföy Yönetimi
  const portfolioNav = [
    { name: "Portföy Listesi", href: "/dashboard/portfolios", icon: FolderOpen },
    { name: "Yeni Portföy Ekle", href: "/dashboard/portfolios/new", icon: PlusCircle },
  ];

  const crmNav = [
    { name: "Müşteri Listesi", href: "/dashboard/crm", icon: Contact, allowed: ['pro', 'office'] }
  ];

  const aiToolsNav = [
    { name: "Görsel İyileştirme", href: "/dashboard/tools/enhancer", icon: Wand2, allowed: ['freelance', 'pro', 'office'] },
    { name: "Sosyal Medya Görseli", href: "/dashboard/tools/image-gen", icon: ImageIcon, allowed: ['freelance', 'pro', 'office'] },
    { name: "Sora Video Üretimi", href: "/dashboard/tools/video-gen", icon: Video, allowed: ['pro', 'office'] },
    { name: "Sunum & PDF", href: "/dashboard/tools/pdf-builder", icon: FileText, allowed: ['free', 'freelance', 'pro', 'office'] },
  ];

  const officeNav = [
    { name: "Ekip Yönetimi", href: "/dashboard/team", icon: Users, allowed: ['office'] },
    { name: "Ofis Raporları", href: "/dashboard/reports", icon: FileBarChart, allowed: ['office'] },
  ];

  // Link Render Fonksiyonu (DÜZELTİLMİŞ HALİ)
  const renderNavLink = (item: any) => {
    let isActive = false;

    // 1. Ana sayfa (/dashboard) -> Sadece tam eşleşmede yansın
    if (item.href === "/dashboard") {
      isActive = pathname === "/dashboard";
    } 
    // 2. Portföy Listesi (/dashboard/portfolios) -> Sadece tam eşleşmede yansın (alt sayfada yanmasın)
    else if (item.href === "/dashboard/portfolios") {
      isActive = pathname.startsWith("/dashboard/portfolios") && pathname !== "/dashboard/portfolios/new";
    }
    // 3. Diğer tüm sayfalar -> Alt sayfalarıyla birlikte yansın (startsWith)
    else {
      isActive = pathname.startsWith(item.href);
    }

    const isLocked = item.allowed ? !hasAccess(item.allowed) : false;
    const finalHref = isLocked ? "/dashboard/pricing" : item.href;

    return (
      <Link 
        key={item.name} 
        href={finalHref} 
        className={`${isActive ? "active" : ""} ${isLocked ? "opacity-60 cursor-not-allowed" : ""} group relative`}
      >
        <item.icon size={18} className={isLocked ? "text-gray-600" : ""} />
        <span className="text-sm font-medium">{item.name}</span>
        {isLocked && <Lock size={14} className="absolute right-3 text-gray-600 group-hover:text-orange-500 transition-colors" />}
      </Link>
    );
  };

  return (
    <aside className="sidebar flex flex-col h-full">
      
      {/* HEADER (PROFİL) */}
      <div className="sidebar-header expanded">
        <div className="user-profile-card">
          <div className="profile-top">
            <div className="avatar-circle avatar-md">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profil" />
              ) : (
                <span className="text-sm font-bold text-white">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="user-info-expanded">
              <h3 title={profile?.full_name || "Kullanıcı"}>
                {profile?.full_name || "Kullanıcı"}
              </h3>
              <p title={profile?.agency_name || "Freelance"}>
                {profile?.agency_name || "Freelance Danışman"}
              </p>
            </div>
          </div>

          <div className="plan-badge-container">
             <div className={`plan-pill ${plan}`}>
                <Sparkles size={10} className="fill-current" />
                <span>{planLabels[plan] || 'Paket Seçilmedi'}</span>
             </div>
             {plan !== 'office' && (
               <Link href="/dashboard/pricing" className="upgrade-link">
                  Yükselt <ChevronRight size={10} />
               </Link>
             )}
          </div>
        </div>
      </div>

      {/* MENÜLER */}
      <nav className="menu flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2 mt-2">
        
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase px-3 mb-2 tracking-widest opacity-70">Yönetim</p>
          <div className="space-y-1">
            {mainNav.map((item) => renderNavLink(item))}
          </div>
        </div>

        {/* YENİ EKLENEN: PORTFÖY YÖNETİMİ */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase px-3 mb-2 tracking-widest opacity-70">Portföy Yönetimi</p>
          <div className="space-y-1">
            {portfolioNav.map((item) => renderNavLink(item))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase px-3 mb-2 tracking-widest opacity-70">Müşteriler</p>
          <div className="space-y-1">
            {crmNav.map((item) => renderNavLink(item))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-70">AI Stüdyosu</p>
            {plan === 'free' && <Crown size={12} className="text-orange-400 animate-pulse" />}
          </div>
          <div className="space-y-1">
            {aiToolsNav.map((item) => renderNavLink(item))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase px-3 mb-2 tracking-widest opacity-70">Ofis</p>
          <div className="space-y-1">
            {officeNav.map((item) => renderNavLink(item))}
          </div>
        </div>

      </nav>

      {/* FOOTER (ÇIKIŞ) */}
      <div className="sidebar-footer">
        <form action="/signout" method="post" className="w-full">
          <button type="submit" className="logout-btn-full">
            <LogOut size={16} />
            <span>Güvenli Çıkış</span>
          </button>
        </form>
      </div>

    </aside>
  );
}