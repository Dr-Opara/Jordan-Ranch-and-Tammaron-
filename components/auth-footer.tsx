"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const visiblePaths = new Set(["/login", "/signup", "/advertise/signup"]);

export default function AuthFooter() {
  const pathname = usePathname();
  if (!visiblePaths.has(pathname)) return null;

  return (
    <footer style={{maxWidth:760,margin:"28px auto 40px",padding:"0 20px",textAlign:"center",fontSize:13,color:"#667085"}}>
      <nav style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
        <Link href="/policies#privacy">Privacy</Link>
        <Link href="/policies#terms">Terms</Link>
        <Link href="/policies#community">Community Guidelines</Link>
        <Link href="/policies#marketplace">Marketplace Rules</Link>
        <Link href="/policies#advertising">Advertising Terms</Link>
        <Link href="/policies#deletion">Account & Data Deletion</Link>
        <Link href="/contact">Contact & Support</Link>
      </nav>
      <p>JRT.Community is a product of <a href="https://theboringproduct.com/" target="_blank" rel="noopener noreferrer">The Boring Product</a>.</p>
      <p style={{maxWidth:680,margin:"8px auto"}}>
        JRT.Community is an independent resident community app and is not affiliated with JordanRanchTexas.com, community developers, HOAs, property managers, or other official community organizations.
      </p>
      <p>© {new Date().getFullYear()} Jordan Ranch & Tamarron Residents · JRT.community</p>
    </footer>
  );
}
