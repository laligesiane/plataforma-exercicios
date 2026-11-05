import { ImageResponse } from "next/og";

// Imagem que aparece quando alguém compartilha um link da Repasa (WhatsApp, Instagram, Google).
export const alt = "Repasa: seu melhor amigo na hora de aprender";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagemCompartilhar() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "linear-gradient(135deg, #ffffff 0%, #e3f6ee 100%)",
          color: "#14213d",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="120" height="120" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill="#0f9d6b" />
            <path d="M32 50 V28" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
            <path d="M32 31 C26 17 12 17 9 25 C17 34 27 35 32 31Z" fill="#fff" />
            <path d="M32 31 C38 15 53 15 56 23 C48 33 37 35 32 31Z" fill="#e3f6ee" />
          </svg>
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>Repasa</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 60, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>
          Seu melhor amigo na hora de aprender.
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#4b5563" }}>
          Resumos, mapas mentais e exercícios que explicam cada erro. Sem anúncios.
        </div>
      </div>
    ),
    size,
  );
}
