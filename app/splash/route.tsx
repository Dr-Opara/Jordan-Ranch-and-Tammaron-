import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedWidth = Number(url.searchParams.get("w") || 1170);
  const requestedHeight = Number(url.searchParams.get("h") || 2532);
  const width = Math.min(Math.max(requestedWidth, 640), 1320);
  const height = Math.min(Math.max(requestedHeight, 1136), 2868);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f7f5",
          color: "#111827",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 52,
            background: "#234e3f",
            color: "#ffffff",
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: "-3px",
          }}
        >
          JRT
        </div>
        <div style={{ marginTop: 34, display: "flex", fontSize: 46, fontWeight: 900, letterSpacing: "-2px" }}>
          JRT.Community
        </div>
        <div style={{ marginTop: 12, display: "flex", fontSize: 24, color: "#6b7280" }}>
          Jordan Ranch + Tamarron
        </div>
      </div>
    ),
    { width, height },
  );
}
