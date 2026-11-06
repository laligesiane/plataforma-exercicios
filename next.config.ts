import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // PDF escaneado (até 3 MB, em base64) vai para a IA ler como imagem ao gerar um resumo.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

export default nextConfig;
