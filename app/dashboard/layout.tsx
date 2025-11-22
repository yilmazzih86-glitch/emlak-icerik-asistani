import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // 1. Oturum kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Profil ve Paket Bilgisini Çek (Sidebar için KRİTİK)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="app-layout">
      {/* Sidebar'a kullanıcı ve profil verisini gönderiyoruz */}
      <Sidebar user={user} profile={profile} />

      {/* Ana İçerik */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}