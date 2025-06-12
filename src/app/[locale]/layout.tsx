// app/[locale]/layout.tsx (Should be a Server Component)
import type { Metadata } from "next";
import "../globals.css";
import { Inter } from "next/font/google";
import Providers from "../providers";
import { SpeedInsights } from "@vercel/speed-insights/next"
// No Header/Logo imports here

export const metadata: Metadata = {
  title: 'ReWear',
  description: 'Rewear - Your online marketplace for second-hand fashion.',
  viewport: 'width=device-width, initial-scale=1',
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <html lang={locale} className={inter.className}>
      {/* Add min-h-screen and flex setup for potential sticky footer */}
      <body className="flex flex-col min-h-screen">
        <Providers>
          <SpeedInsights />
          {/* No header is rendered globally by the layout */}
          {/* Pages themselves will render their required header */}
          <main className="flex-grow"> {/* flex-grow allows main content to fill space */}
            {children}
          </main>
          {/* Optional Footer could go here */}
          {/* <footer className="bg-gray-200 p-4 text-center">My Footer</footer> */}
        </Providers>
      </body>
    </html>
  );
} 