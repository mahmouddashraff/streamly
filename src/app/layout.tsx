import type { Metadata } from "next";
import { Geist, Geist_Mono, Qahiri } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MyListProvider } from "@/components/MyListProvider";
import { I18nProvider } from "@/components/I18nProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Locale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const qahiri = Qahiri({
  weight: "400",
  subsets: ["latin", "arabic"],
  variable: "--font-qahiri",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name || "شاهد الحدث اليوم";
  return {
    title: `${siteName} | Premium Streaming`,
    description: settings?.site_description || "A cinematic journey beyond the edge of the known world.",
    appleWebApp: {
      title: "شاهد الحدث اليوم",
      statusBarStyle: "black-translucent",
      capable: true,
    },
    applicationName: "شاهد الحدث اليوم",
    icons: {
      icon: "/pwa-icon-ar-v2.png",
      apple: "/pwa-icon-ar-v2.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const cookieStore = await cookies();
  const defaultLocale = settings?.default_language || "ar";
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || defaultLocale) as Locale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="dark overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${qahiri.variable} antialiased bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden w-full`}
      >
        <I18nProvider locale={locale}>
          <AuthProvider>
            <MyListProvider>
              <Navbar settings={settings} />
              <main className="flex-1">{children}</main>
              <Footer settings={settings} />
            </MyListProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
