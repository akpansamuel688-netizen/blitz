import Link from "next/link";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { navItems } from "@/lib/data";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return <footer className="bg-[#050c16] py-16 text-white">
    <div className="container-shell">
      <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div><div className="text-xl font-extrabold">TheMonark<span className="text-cyan-300">WebServices</span></div><p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">Strategic design and modern engineering for digital products that deserve to be taken seriously.</p></div>
        <div><h3 className="text-sm font-bold">Navigate</h3><div className="mt-4 grid gap-3">{navItems.slice(1).map(x=><Link key={x.href} href={x.href} className="text-sm text-slate-400 hover:text-cyan-300">{x.label}</Link>)}</div></div>
        <div><h3 className="text-sm font-bold">Services</h3><div className="mt-4 grid gap-3">{["Web Applications","Mobile Apps","Desktop Apps","APIs & Backends","Custom Software"].map(x=><Link key={x} href="#services" className="text-sm text-slate-400 hover:text-cyan-300">{x}</Link>)}</div></div>
        <div><h3 className="text-sm font-bold">Start a conversation</h3><a href={`mailto:${siteConfig.email}`} className="mt-4 block break-all text-sm text-cyan-300">{siteConfig.email}</a><p className="mt-3 text-sm text-slate-400">{siteConfig.location}</p><div className="mt-6 flex gap-3">{[{Icon:Linkedin,label:"LinkedIn"},{Icon:Github,label:"GitHub"},{Icon:Instagram,label:"Instagram"},{Icon:Twitter,label:"X / Twitter"}].map(({Icon,label})=><a key={label} href="#" aria-label={label} className="grid size-9 place-items-center rounded-full border border-white/10 text-slate-400 hover:border-cyan-300 hover:text-cyan-300"><Icon size={16}/></a>)}</div></div>
      </div>
      <div className="flex flex-col gap-3 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} TheMonarkWebServices. All rights reserved.</p><p>Designed for ambitious ideas. Engineered for growth.</p></div>
    </div>
  </footer>;
}
