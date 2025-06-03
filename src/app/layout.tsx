// app/layout.tsx (Should be a Server Component)
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers";
// No Header/Logo imports here

export const metadata: Metadata = {
  title: 'ReWear',
  description: 'Rewear - Your online marketplace for second-hand fashion.',
  viewport: 'width=device-width, initial-scale=1',
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      {/* Add min-h-screen and flex setup for potential sticky footer */}
      <body className="flex flex-col min-h-screen">
        <Providers>
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