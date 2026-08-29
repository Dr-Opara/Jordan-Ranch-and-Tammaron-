import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#ffffff", fontFamily:"Arial, sans-serif" }}>
      <div style={{ width:400, height:400, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:92, background:"#ffffff" }}>
        <div style={{ width:300, height:225, display:"flex", position:"relative", alignItems:"center", justifyContent:"center" }}>
          <div style={{ position:"absolute", width:210, height:210, borderLeft:"18px solid #0b4a35", borderTop:"18px solid #0b4a35", transform:"rotate(45deg)", top:22, left:44 }} />
          <div style={{ position:"absolute", top:55, display:"flex", flexWrap:"wrap", width:48, height:48, gap:6 }}>
            <span style={{ width:21, height:21, background:"#54a33b" }} /><span style={{ width:21, height:21, background:"#54a33b" }} /><span style={{ width:21, height:21, background:"#54a33b" }} /><span style={{ width:21, height:21, background:"#54a33b" }} />
          </div>
          <div style={{ position:"absolute", top:112, fontWeight:900, fontSize:108, letterSpacing:"-11px", color:"#0b4a35" }}>JRT</div>
          <div style={{ position:"absolute", bottom:8, width:250, height:42, borderTop:"17px solid #54a33b", borderRadius:"50%", transform:"rotate(-3deg)" }} />
        </div>
        <div style={{ display:"flex", marginTop:2, fontSize:42, fontWeight:900, letterSpacing:"1.5px" }}><span style={{ color:"#0b4a35" }}>JRT.</span><span style={{ color:"#3f8f31" }}>COMMUNITY</span></div>
      </div>
    </div>,
    { width:512, height:512 },
  );
}
