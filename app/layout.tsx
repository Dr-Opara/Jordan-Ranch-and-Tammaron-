import type { Metadata, Viewport } from "next";
import AuthFooter from "@/components/auth-footer";
import PwaInstall from "@/components/pwa-install";
import "./globals.css";
import "./forms.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jrt.community"),
  title: {
    default: "JRT.Community",
    template: "%s | JRT.Community",
  },
  description: "Private marketplace, local businesses and resident deals for Jordan Ranch & Tamarron residents.",
  applicationName: "JRT.Community",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "JRT.Community",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192", sizes: "192x192", type: "image/png" },
      { url: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#234e3f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="JRT.Community" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-startup-image" href="/splash?w=1170&h=2532" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash?w=1179&h=2556" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash?w=1290&h=2796" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash?w=1206&h=2622" media="(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash?w=1320&h=2868" media="(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)" />
      </head>
      <body>
        {children}
        <PwaInstall />
        <AuthFooter />
      </body>
    </html>
  );
}
