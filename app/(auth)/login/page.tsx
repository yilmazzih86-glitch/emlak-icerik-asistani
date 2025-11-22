"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client"; // Client bağlantımız

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Başarılı giriş -> Dashboard'a yönlendir
      router.push("/dashboard");
      router.refresh(); // Router cache'ini temizle
    } catch (err: any) {
      setError(err.message || "Giriş yapılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo & Başlık */}
        <div className="header">
          <div 
            style={{
              width: '40px', height: '40px', 
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem auto', color: 'white'
            }}
          >
            <Building2 size={20} />
          </div>
          <h2>Tekrar Hoş Geldiniz</h2>
          <p>Hesabınıza giriş yaparak içerik üretmeye devam edin.</p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem', 
            borderRadius: '0.5rem', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            fontSize: '0.875rem'
          }}>
            {error === "Invalid login credentials" 
              ? "E-posta veya şifre hatalı." 
              : error}
          </div>
        )}

        {/* Login Formu */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>E-posta Adresi</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="ornek@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} />
                Giriş yapılıyor...
              </>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        {/* Footer Linkleri */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
          Hesabınız yok mu?{" "}
          <Link href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
            Hemen Kayıt Olun
          </Link>
        </div>
      </div>
    </div>
  );
}