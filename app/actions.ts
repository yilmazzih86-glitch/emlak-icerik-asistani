"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Kullanıcının paketini ve LİMİTLERİNİ güncelleyen fonksiyon
export async function upgradeUserPlan(plan: 'freelance' | 'pro' | 'office') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Kullanıcı bulunamadı");

  // --- PAKET LİMİT TANIMLARI ---
  // Varsayılan (Free)
  let limits = {
    listing: 3,
    image: 0,
    social: 0,
    video: 0
  };

  // Freelance Paketi
  if (plan === 'freelance') {
    limits = { 
      listing: 15, 
      image: 3, 
      social: 1, 
      video: 0 
    };
  } 
  // Pro Paketi
  else if (plan === 'pro') {
    limits = { 
      listing: 100, 
      image: 30, 
      social: 15, 
      video: 1 
    };
  } 
  // Office Paketi
  else if (plan === 'office') {
    limits = { 
      listing: 150, 
      image: 100, 
      social: 50, 
      video: 2 
    };
  }

  // Veritabanını Güncelle
  // BURASI KRİTİK: Tüm _limit sütunlarını doğru eşlediğimizden emin oluyoruz.
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_type: plan,
      listing_limit: limits.listing,
      image_ai_limit: limits.image,
      social_ai_limit: limits.social, // Yeni eklendi
      video_ai_limit: limits.video,   // Yeni eklendi
      renews_at: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString() // 1 ay sonraya yenileme tarihi
    })
    .eq('id', user.id);

  if (error) {
    console.error("Upgrade Error:", error);
    return { success: false, message: "Paket yükseltilemedi." };
  }

  // Dashboard'ı yenile
  revalidatePath('/dashboard'); 
  redirect('/dashboard');
}