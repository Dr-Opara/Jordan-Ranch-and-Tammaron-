import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#234e3f",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          fontWeight: 900,
          fontSize: 50,
          letterSpacing: "-2px",
          borderRadius: 40,
        }}
      >
        JRT
      </div>
    ),
    { width: 180, height: 180 },
  );
}
