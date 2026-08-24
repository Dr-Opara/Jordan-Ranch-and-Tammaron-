import type { Metadata } from "next";
import Link from "next/link";
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
        <footer style={{maxWidth:760,margin:"28px auto 90px",padding:"0 20px",textAlign:"center",fontSize:13,color:"#667085"}}>
          <nav style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
            <Link href="/policies#privacy">Privacy</Link>
            <Link href="/policies#terms">Terms</Link>
            <Link href="/policies#community">Community Guidelines</Link>
            <Link href="/policies#marketplace">Marketplace Rules</Link>
            <Link href="/policies#advertising">Advertising Terms</Link>
            <Link href="/policies#deletion">Account & Data Deletion</Link>
            <Link href="/contact">Contact & Support</Link>
          </nav>
          <p>Jordan Ranch & Tamarron Residents is a product of <a href="https://theboringproduct.com/" target="_blank" rel="noopener noreferrer">The Boring Product</a>.</p>
          <p>© {new Date().getFullYear()} Jordan Ranch & Tamarron Residents · JRT.community</p>
        </footer>
      </body>
    </html>
  );
}
