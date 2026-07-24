import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://themonarkwebservices.com"),
  title: "TheMonarkWebServices | Web, Mobile & Software Development Agency",
  description: "TheMonarkWebServices builds modern websites, web applications, mobile apps, desktop applications, APIs, dashboards, and custom software solutions for businesses and entrepreneurs.",
  openGraph: {
    title: "TheMonarkWebServices | Digital Product Development",
    description: "Premium websites, applications, APIs, dashboards, and custom software—built for serious growth.",
    type: "website", siteName: "TheMonarkWebServices",
  },
  twitter: { card: "summary_large_image", title: "TheMonarkWebServices", description: "Your idea. Our code. One powerful digital product." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
