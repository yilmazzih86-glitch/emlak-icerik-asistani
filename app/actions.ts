"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Kullanıcının paketini yükselten sihirli fonksiyon
export async function upgradeUserPlan(plan: 'freelance' | 'pro' | 'office') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Kullanıcı bulunamadı");

  // LİMİTLERİ BELİRLE
  let limits = {
    listing: 15,
    image_ai: 0,
    social_ai: 0,
    video_ai: 0
  };

  // 1. Freelance Paketi (Tadımlık Haklar)
  if (plan === 'freelance') {
    limits = {
      listing: 15,
      image_ai: 3,  // <-- ARTIK 3 HAKKI VAR
      social_ai: 1, // <-- ARTIK 1 HAKKI VAR
      video_ai: 0
    };
  }

  // 2. Pro Paketi
  if (plan === 'pro') {
    limits = {
      listing: 100,
      image_ai: 30,
      social_ai: 15,
      video_ai: 1
    };
  }

  // 3. Office Paketi
  if (plan === 'office') {
    limits = {
      listing: 150,
      image_ai: 100,
      social_ai: 50,
      video_ai: 2
    };
  }

  // Veritabanını Güncelle
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_type: plan,
      listing_limit: limits.listing,
      image_ai_limit: limits.image_ai,
      // Veritabanında bu kolonları açtığımızı varsayıyorum, 
      // açmadıysan SQL ile eklemen gerekir (Aşağıda verdim)
    })
    .eq('id', user.id);

  if (error) {
    console.error(error);
    return { success: false, message: "Paket yükseltilemedi." };
  }

  // 4. Verileri tazeleyip Dashboard'a gönder
  revalidatePath('/dashboard'); 
  redirect('/dashboard');
}