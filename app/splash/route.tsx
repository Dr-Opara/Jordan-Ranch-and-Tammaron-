import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedWidth = Number(url.searchParams.get("w") || 1170);
  const requestedHeight = Number(url.searchParams.get("h") || 2532);
  const width = Math.min(Math.max(requestedWidth, 640), 1320);
  const height = Math.min(Math.max(requestedHeight, 1136), 2868);

  return new ImageResponse(
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0b4a35", color:"#ffffff", fontFamily:"Arial, sans-serif" }}>
      <div style={{ width:360, height:360, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:76, background:"#ffffff" }}>
        <div style={{ width:260, height:196, display:"flex", position:"relative", alignItems:"center", justifyContent:"center" }}>
          <div style={{ position:"absolute", width:182, height:182, borderLeft:"16px solid #0b4a35", borderTop:"16px solid #0b4a35", transform:"rotate(45deg)", top:20, left:38 }} />
          <div style={{ position:"absolute", top:48, display:"flex", flexWrap:"wrap", width:42, height:42, gap:5 }}>
            <span style={{ width:18.5, height:18.5, background:"#54a33b" }} /><span style={{ width:18.5, height:18.5, background:"#54a33b" }} /><span style={{ width:18.5, height:18.5, background:"#54a33b" }} /><span style={{ width:18.5, height:18.5, background:"#54a33b" }} />
          </div>
          <div style={{ position:"absolute", top:98, fontWeight:900, fontSize:94, letterSpacing:"-10px", color:"#0b4a35" }}>JRT</div>
          <div style={{ position:"absolute", bottom:7, width:218, height:37, borderTop:"15px solid #54a33b", borderRadius:"50%", transform:"rotate(-3deg)" }} />
        </div>
        <div style={{ display:"flex", marginTop:4, fontSize:36, fontWeight:900, letterSpacing:"1.3px" }}><span style={{ color:"#0b4a35" }}>JRT.</span><span style={{ color:"#3f8f31" }}>COMMUNITY</span></div>
      </div>
      <div style={{ marginTop:42, display:"flex", fontSize:26, fontWeight:800, letterSpacing:"2px", textAlign:"center" }}>STRONGER TOGETHER. BETTER EVERY DAY.</div>
      <div style={{ marginTop:14, display:"flex", fontSize:20, opacity:.78 }}>Jordan Ranch + Tamarron</div>
    </div>,
    { width, height },
  );
}
