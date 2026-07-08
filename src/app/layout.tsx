import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Brand Camp · ADN de Marca",
  description: "Reto de 5 semanas del curso ADN de Marca — 7ma Edición",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
