import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Elite Events",
  description: "Plataforma de eventos e ingressos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}