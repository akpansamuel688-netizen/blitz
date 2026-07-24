import {
  AppWindow, Blocks, Bot, Braces, BriefcaseBusiness, ChartNoAxesCombined,
  CloudCog, Code2, Database, Gauge, Globe2, Laptop, LayoutDashboard,
  LockKeyhole, MonitorSmartphone, Paintbrush, PanelsTopLeft, PlugZap,
  Rocket, ServerCog, ShieldCheck, ShoppingBag, Smartphone, Sparkles,
  Wrench,
} from "lucide-react";

export const navItems = [
  { label: "Home", href: "#home" }, { label: "Services", href: "#services" },
  { label: "Our Process", href: "#process" }, { label: "Portfolio", href: "#portfolio" },
  { label: "Technologies", href: "#technologies" }, { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const services = [
  { title: "Front-End Development", description: "Fast, accessible interfaces engineered to feel effortless on every screen.", icon: PanelsTopLeft, tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { title: "Back-End Development", description: "Secure APIs, reliable databases, authentication, and integrations built to scale.", icon: ServerCog, tags: ["Node.js", "REST APIs", "PostgreSQL", "Supabase"] },
  { title: "Full-Stack Development", description: "Complete product delivery—from the first interface to infrastructure and support.", icon: Blocks, tags: ["Frontend", "Backend", "Database", "Deployment"] },
  { title: "Web Applications", description: "SaaS, portals, dashboards, booking, commerce, and operational platforms.", icon: AppWindow, tags: ["SaaS", "Dashboards", "Portals", "Platforms"] },
  { title: "Mobile Applications", description: "Polished mobile-first products for iOS, Android, and the modern web.", icon: Smartphone, tags: ["React Native", "Expo", "PWA"] },
  { title: "Desktop Applications", description: "Purpose-built cross-platform software for modern business workflows.", icon: Laptop, tags: ["Electron", "Tauri", "Cross-platform"] },
  { title: "UI/UX Implementation", description: "Design concepts transformed into precise, responsive, interactive experiences.", icon: Paintbrush, tags: ["Design systems", "Accessibility", "Motion"] },
  { title: "API & Integrations", description: "Payments, email, SMS, identity, cloud services, and external APIs connected cleanly.", icon: PlugZap, tags: ["Payments", "Auth", "Cloud", "Automation"] },
  { title: "Website Development", description: "High-converting business, corporate, startup, portfolio, and commerce websites.", icon: Globe2, tags: ["Corporate", "Landing pages", "E-commerce"] },
  { title: "Maintenance & Optimization", description: "Ongoing improvements that keep your product secure, fast, and current.", icon: Wrench, tags: ["Performance", "Security", "Features", "Redesign"] },
];

export const buildItems = [
  "Business Websites", "E-commerce Platforms", "Banking & Fintech Dashboards",
  "Admin Control Panels", "SaaS Platforms", "Customer Portals", "Booking Systems",
  "Real Estate Platforms", "Healthcare Platforms", "Educational Platforms",
  "Social Platforms", "Marketplace Websites", "Subscription Platforms",
  "Mobile Apps", "Desktop Applications", "API Services", "Internal Business Tools",
];

export const packages = [
  { title: "Front-End Development", copy: "For established APIs that need an exceptional, production-ready interface.", icon: Code2 },
  { title: "Back-End Development", copy: "APIs, data models, authentication, infrastructure, and business logic.", icon: Database },
  { title: "Full Web Development", copy: "Complete frontend, backend, database, deployment, and launch support.", icon: Globe2, featured: true },
  { title: "Mobile App Development", copy: "Complete mobile product development for iOS and Android.", icon: Smartphone },
  { title: "Desktop App Development", copy: "Business applications for Windows, macOS, and cross-platform use.", icon: Laptop },
  { title: "Custom Development", copy: "A tailored engagement for software that does not fit a standard package.", icon: Sparkles },
];

export const benefits = [
  ["Clean & Modern Design", Paintbrush], ["Responsive Development", MonitorSmartphone],
  ["Scalable Architecture", Blocks], ["Secure Practices", ShieldCheck],
  ["Performance Optimization", Gauge], ["SEO-Friendly Development", ChartNoAxesCombined],
  ["Reliable Communication", BriefcaseBusiness], ["Custom Solutions", Braces],
  ["Long-Term Support", Wrench], ["Professional Delivery", Rocket],
] as const;

export const process = [
  ["01", "Discovery", "We explore your goals, users, and business context."],
  ["02", "Requirements", "We turn ideas into clear, actionable product requirements."],
  ["03", "Planning", "Scope, milestones, priorities, and delivery path are aligned."],
  ["04", "UI / Architecture", "Experience and technical foundations take shape."],
  ["05", "Development", "Your product is built in focused, visible iterations."],
  ["06", "Testing", "Quality, accessibility, performance, and edge cases are verified."],
  ["07", "Client Review", "You review the product and guide final refinements."],
  ["08", "Deployment", "We launch with a stable, production-ready setup."],
  ["09", "Support", "We stay available for maintenance and future growth."],
];

export const technologies = [
  ["Next.js", "NX"], ["React", "RE"], ["TypeScript", "TS"], ["JavaScript", "JS"],
  ["Node.js", "ND"], ["Tailwind CSS", "TW"], ["PostgreSQL", "PG"], ["MongoDB", "MG"],
  ["Supabase", "SB"], ["Firebase", "FB"], ["Git", "GT"], ["GitHub", "GH"],
  ["Vercel", "VC"], ["React Native", "RN"], ["Electron", "EL"],
];

export const projects = [
  { title: "Fintech Banking Dashboard", category: "Fintech", description: "A secure, real-time financial command center for modern banking teams.", tech: ["Next.js", "TypeScript", "PostgreSQL"], accent: "cyan", icon: LayoutDashboard },
  { title: "Modern E-commerce Platform", category: "Commerce", description: "A conversion-focused retail experience with a seamless purchasing journey.", tech: ["React", "Node.js", "Stripe"], accent: "violet", icon: ShoppingBag },
  { title: "SaaS Admin Dashboard", category: "SaaS", description: "An intelligent operations hub for teams, insights, billing, and permissions.", tech: ["Next.js", "Supabase", "Tailwind"], accent: "blue", icon: ChartNoAxesCombined },
  { title: "Business Management Portal", category: "Operations", description: "One connected workspace for customers, teams, projects, and reporting.", tech: ["TypeScript", "PostgreSQL", "APIs"], accent: "emerald", icon: BriefcaseBusiness },
  { title: "Booking Application", category: "Web App", description: "A smooth scheduling platform that turns availability into confirmed bookings.", tech: ["React", "Node.js", "Payments"], accent: "amber", icon: AppWindow },
  { title: "Corporate Website", category: "Website", description: "A premium digital presence designed to build authority and generate demand.", tech: ["Next.js", "CMS", "SEO"], accent: "rose", icon: Globe2 },
];

export const testimonials = [
  { quote: "They understood the business behind the brief. The finished platform feels considered, fast, and genuinely premium.", name: "Amara K.", role: "Founder, Northline Studio" },
  { quote: "Communication was clear from discovery to launch. We always knew what was happening and why it mattered.", name: "Daniel R.", role: "Operations Director, Lumio" },
  { quote: "The team turned a complicated workflow into a product our customers can use without training. That is rare.", name: "Maya S.", role: "Product Lead, Vertex Labs" },
];

export const projectTypes = ["Website", "Web Application", "Mobile Application", "Desktop Application", "API / Backend", "E-commerce", "SaaS", "Other"];
export const serviceOptions = ["Front-End Development", "Back-End Development", "Full-Stack Development", "Mobile Development", "Desktop Development", "UI Implementation", "Maintenance", "Custom Development"];
