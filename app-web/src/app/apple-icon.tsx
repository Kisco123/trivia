import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Ícono para "Agregar a pantalla de inicio" en iOS (apple-touch-icon).
// Búho minimalista (dos ojos) sobre degradado violeta. Sin emoji para que
// renderice fiable en el build.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c5cff, #b794ff)",
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#2a1a5e" }} />
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
