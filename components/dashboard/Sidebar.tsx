"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, PlusCircle, LogOut, Image as ImageIcon, 
  Video, Wand2, Lock, Crown, Users, FileBarChart, FileText, Contact, Settings 
} from "lucide-react";

export default function Sidebar({ user, profile }: { user: any, profile: any }) {
  const pathname = usePathname();
  const plan = profile?.plan_type || 'free';

  // Erişim Kontrolü
  const hasAccess = (requiredPlans: string[]) => {
    return requiredPlans.includes(plan);
  };

  const mainNav = [
    { name: "Genel Bakış", href: "/dashboard", icon: LayoutDashboard },
    { name: "Yeni İçerik Üret", href: "/dashboard/generate", icon: PlusCircle },
    { name: "Ayarlar", href: "/dashboard/settings", icon: Settings },
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

  return (
    <aside className="sidebar flex flex-col h-full">
      
      {/* --- YENİ ÜST ALAN (Profil & Çıkış) --- */}
      <div className="sidebar-header">
        
        {/* SOL: Profil Bilgisi */}
        <div className="header-left">
          <div className="avatar-circle avatar-sm shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profil" />
            ) : (
              <span className="text-xs font-bold text-white">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="user-info">
            <h3 title={profile?.full_name}>{profile?.full_name || "Kullanıcı"}</h3>
            <p title={profile?.agency_name}>{profile?.agency_name || "Freelance"}</p>
          </div>
        </div>

        {/* SAĞ: Çıkış Butonu (Kritik Düzeltme: action="/signout") */}
        <form action="/signout" method="post">
          <button 
            type="submit" 
            className="logout-btn" 
            title="Güvenli Çıkış"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>

      {/* MENÜLER */}
      <nav className="menu flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2 mt-4">
        
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase px-3 mb-2 tracking-widest opacity-70">Yönetim</p>
          <div className="space-y-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={isActive ? "active" : ""}>
                  <item.icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase px-3 mb-2 tracking-widest opacity-70">Müşteriler</p>
          <div className="space-y-1">
            {crmNav.map((item) => {
              const isActive = pathname === item.href;
              const isLocked = !hasAccess(item.allowed);
              const finalHref = isLocked ? "/dashboard/pricing" : item.href;
              return (
                <Link key={item.name} href={finalHref} className={`group relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500" : "text-gray-400 hover:text-white hover:bg-white/5"} ${isLocked ? "opacity-70 cursor-not-allowed" : ""}`}>
                  <item.icon size={18} className={isLocked ? "text-gray-600" : (isActive ? "text-blue-400" : "text-gray-400 group-hover:text-white")} />
                  <span className="text-sm font-medium">{item.name}</span>
                  {isLocked && <Lock size={14} className="absolute right-3 text-gray-600 group-hover:text-orange-500 transition-colors" />}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-70">AI Stüdyosu</p>
            {plan === 'free' && <Crown size={12} className="text-orange-400 animate-pulse" />}
          </div>
          <div className="space-y-1">
            {aiToolsNav.map((item) => {
              const isActive = pathname === item.href;
              const isLocked = !hasAccess(item.allowed);
              const finalHref = isLocked ? "/dashboard/pricing" : item.href;
              return (
                <Link key={item.name} href={finalHref} className={`group relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? "bg-purple-500/10 text-purple-400 border-l-2 border-purple-500" : "text-gray-400 hover:text-white hover:bg-white/5"} ${isLocked ? "opacity-70 cursor-not-allowed" : ""}`}>
                  <item.icon size={18} className={isLocked ? "text-gray-600" : (isActive ? "text-purple-400" : "text-gray-400 group-hover:text-white")} />
                  <span className="text-sm font-medium">{item.name}</span>
                  {isLocked && <Lock size={14} className="absolute right-3 text-gray-600 group-hover:text-orange-500 transition-colors" />}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase px-3 mb-2 tracking-widest opacity-70">Ofis</p>
          <div className="space-y-1">
            {officeNav.map((item) => {
              const isActive = pathname === item.href;
              const isLocked = !hasAccess(item.allowed);
              const finalHref = isLocked ? "/dashboard/pricing" : item.href;
              return (
                <Link key={item.name} href={finalHref} className={`group relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? "bg-orange-500/10 text-orange-400 border-l-2 border-orange-500" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                  <item.icon size={18} className={isLocked ? "text-gray-600" : (isActive ? "text-orange-400" : "text-gray-400 group-hover:text-white")} />
                  <span className="text-sm font-medium">{item.name}</span>
                  {isLocked && <Lock size={14} className="absolute right-3 text-gray-600 group-hover:text-orange-500 transition-colors" />}
                </Link>
              );
            })}
          </div>
        </div>

      </nav>
    </aside>
  );
}