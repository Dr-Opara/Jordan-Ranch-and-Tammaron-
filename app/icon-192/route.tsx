import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#ffffff", fontFamily:"Arial, sans-serif" }}>
      <div style={{ width:150, height:150, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:34, background:"#ffffff" }}>
        <div style={{ width:105, height:76, display:"flex", position:"relative", alignItems:"center", justifyContent:"center" }}>
          <div style={{ position:"absolute", width:72, height:72, borderLeft:"7px solid #0b4a35", borderTop:"7px solid #0b4a35", transform:"rotate(45deg)", top:8, left:16 }} />
          <div style={{ position:"absolute", top:19, display:"flex", flexWrap:"wrap", width:18, height:18, gap:2 }}>
            <span style={{ width:8, height:8, background:"#54a33b" }} /><span style={{ width:8, height:8, background:"#54a33b" }} /><span style={{ width:8, height:8, background:"#54a33b" }} /><span style={{ width:8, height:8, background:"#54a33b" }} />
          </div>
          <div style={{ position:"absolute", top:39, fontWeight:900, fontSize:38, letterSpacing:"-4px", color:"#0b4a35" }}>JRT</div>
          <div style={{ position:"absolute", bottom:1, width:88, height:16, borderTop:"6px solid #54a33b", borderRadius:"50%", transform:"rotate(-3deg)" }} />
        </div>
        <div style={{ display:"flex", marginTop:1, fontSize:14, fontWeight:900, letterSpacing:".6px" }}><span style={{ color:"#0b4a35" }}>JRT.</span><span style={{ color:"#3f8f31" }}>COMMUNITY</span></div>
      </div>
    </div>,
    { width:192, height:192 },
  );
}
