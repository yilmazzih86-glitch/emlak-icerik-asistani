import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss"; // Hazırladığımız SCSS dosyasını buraya çağırıyoruz

// Google Font (Inter) ayarı - Okunaklı ve modern
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Emlak İçerik Asistanı",
  description: "Emlak danışmanları için yapay zeka destekli içerik üretim platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}