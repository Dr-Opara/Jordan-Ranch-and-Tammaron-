import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#ffffff", fontFamily:"Arial, sans-serif" }}>
      <div style={{ width:142, height:142, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:32, background:"#ffffff" }}>
        <div style={{ width:100, height:73, display:"flex", position:"relative", alignItems:"center", justifyContent:"center" }}>
          <div style={{ position:"absolute", width:68, height:68, borderLeft:"7px solid #0b4a35", borderTop:"7px solid #0b4a35", transform:"rotate(45deg)", top:8, left:15 }} />
          <div style={{ position:"absolute", top:18, display:"flex", flexWrap:"wrap", width:17, height:17, gap:2 }}>
            <span style={{ width:7.5, height:7.5, background:"#54a33b" }} /><span style={{ width:7.5, height:7.5, background:"#54a33b" }} /><span style={{ width:7.5, height:7.5, background:"#54a33b" }} /><span style={{ width:7.5, height:7.5, background:"#54a33b" }} />
          </div>
          <div style={{ position:"absolute", top:37, fontWeight:900, fontSize:36, letterSpacing:"-3.7px", color:"#0b4a35" }}>JRT</div>
          <div style={{ position:"absolute", bottom:1, width:84, height:15, borderTop:"6px solid #54a33b", borderRadius:"50%", transform:"rotate(-3deg)" }} />
        </div>
        <div style={{ display:"flex", marginTop:1, fontSize:13, fontWeight:900, letterSpacing:".5px" }}><span style={{ color:"#0b4a35" }}>JRT.</span><span style={{ color:"#3f8f31" }}>COMMUNITY</span></div>
      </div>
    </div>,
    { width:180, height:180 },
  );
}
