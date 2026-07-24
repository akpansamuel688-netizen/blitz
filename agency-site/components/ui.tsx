import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function SectionHeading({ eyebrow, title, copy, light = false, centered = false }: { eyebrow:string; title:string; copy?:string; light?:boolean; centered?:boolean }) {
  return <div className={`${centered ? "mx-auto text-center" : ""} max-w-3xl`}>
    <p className={`eyebrow ${light ? "!text-cyan-300" : ""}`}>{eyebrow}</p>
    <h2 className={`section-title mt-4 ${light ? "text-white" : ""}`}>{title}</h2>
    {copy && <p className={`mt-5 text-lg leading-8 ${light ? "text-slate-300" : "muted"}`}>{copy}</p>}
  </div>;
}

export function IconBox({ icon:Icon, dark=false }: { icon:LucideIcon; dark?:boolean }) {
  return <span className={`grid size-11 place-items-center rounded-xl ${dark ? "bg-white/10 text-cyan-300" : "bg-blue-50 text-blue-600"}`}><Icon size={21} aria-hidden /></span>;
}

export function PrimaryLink({ href, children, dark=false }: { href:string; children:React.ReactNode; dark?:boolean }) {
  return <Link href={href} className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 ${dark ? "bg-white text-slate-950 hover:bg-cyan-100" : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"}`}>
    {children}<ArrowRight size={17} className="transition group-hover:translate-x-1" aria-hidden />
  </Link>;
}
