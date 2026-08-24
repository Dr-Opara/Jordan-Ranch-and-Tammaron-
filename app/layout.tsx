import type { Metadata } from "next";
import AuthFooter from "@/components/auth-footer";
import "./globals.css";
import "./forms.css";

export const metadata: Metadata = {
  title: "Jordan Ranch & Tamarron",
  description: "Private marketplace, local businesses and resident deals for Jordan Ranch & Tamarron residents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AuthFooter />
      </body>
    </html>
  );
}
