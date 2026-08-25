import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um bundle auto-contido em .next/standalone, usado pela imagem Docker
  // para rodar sem precisar do node_modules completo em produção.
  output: "standalone",
};

export default nextConfig;
