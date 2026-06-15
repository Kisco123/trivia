import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon (pestaña del navegador): mismo búho minimalista.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#7c5cff",
          borderRadius: 7,
        }}
      >
        <div style={{ display: "flex", gap: 3 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
