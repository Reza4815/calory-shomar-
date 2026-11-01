import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

const vazirmatn = localFont({
  src: [
    { path: "./fonts/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Vazirmatn-Medium.woff2", weight: "500", style: "normal" },
    {
      path: "./fonts/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    { path: "./fonts/Vazirmatn-Bold.woff2", weight: "700", style: "normal" },
    {
      path: "./fonts/Vazirmatn-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "رفا | سلامت و سبک زندگی",
  description:
    "رفا، دستیار هوشمند سلامت؛ ثبت غذا، آب، وزن، خواب، فعالیت و حال روزانه",
  applicationName: "رفا",
  appleWebApp: {
    capable: true,
    // این گزینه حیاتی است: پس‌زمینه نوار وضعیت را شفاف می‌کند تا با سایت یکی شود
    statusBarStyle: "black-translucent",
    title: "رفا",
  },
  formatDetection: { telephone: false },
  icons: { icon: [{ url: "/icons/icon-512.png", type: "image/png" }] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // حیاتی برای آیفون
  interactiveWidget: "resizes-content",
  themeColor: "#0b0c11",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="bg-bg text-text antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
