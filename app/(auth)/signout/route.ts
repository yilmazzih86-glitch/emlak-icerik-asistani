import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // 1. Supabase istemcisini oluştur
  const supabase = await createClient();

  // 2. Sunucu tarafındaki oturumu kapat
  // Bu işlem cookie'leri temizler ve oturumu sonlandırır.
  await supabase.auth.signOut();

  // 3. Kullanıcıyı Anasayfaya yönlendir (app/page.tsx -> /)
  // Oturum kapandıktan sonra landing page'e döner.
  return NextResponse.redirect(new URL("/", request.url), {
    status: 302,
  });
}