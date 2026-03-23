import type { Metadata } from "next";
import { Titillium_Web, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/constants/site";
import NavWrapper from "@/components/layout/NavWrapper";
import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import CustomCursor from "@/components/layout/CustomCursor";
import Script from "next/script";
import { SeriesProvider } from "@/context/SeriesContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Suspense } from "react";

const titilliumWeb = Titillium_Web({
  variable: "--font-titillium-web",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Race Weekend | F1 & MotoGP Travel Guide',
    template: '%s | Race Weekend',
  },
  description:
    'Plan your F1 and MotoGP race weekend with curated local experiences, session schedules, ticket listings, and shareable itineraries.',
  openGraph: {
    siteName: 'Race Weekend',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const globalSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Race Weekend',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
    sameAs: [
      'https://www.youtube.com/@code_philic',
      'https://www.instagram.com/codephilic_studio/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: process.env.CONTACT_EMAIL ?? 'hello@raceweekend.co',
      contactType: 'customer service',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Race Weekend',
    url: SITE_URL,
    description: 'Plan your F1 and MotoGP race weekend with curated local experiences, session schedules, ticket listings, and shareable itineraries.',
    publisher: {
      '@type': 'Organization',
      name: 'Race Weekend',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Deepak',
    url: `${SITE_URL}/about`,
    worksFor: { '@type': 'Organization', name: 'Race Weekend' },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* RSL 1.0 — allow AI search indexing, disallow training, require attribution */}
        <meta name="rsl" content="search: allow, training: disallow, attribution: required" />
        <link rel="alternate" type="application/rss+xml" title="Race Weekend Blog" href={`${SITE_URL}/blog/feed.xml`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.getyourguide.com" />
        <link rel="preconnect" href="https://api.ticketmaster.com" />
        <link rel="dns-prefetch" href="https://api.openf1.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchemas) }}
        />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${titilliumWeb.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <CustomCursor />
        <SeriesProvider>
          <CurrencyProvider>
            <Suspense>
              <NavWrapper />
              <main>{children}</main>
              <Footer />
            </Suspense>
          </CurrencyProvider>
        </SeriesProvider>
      </body>
    </html>
  );
}
