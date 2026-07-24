"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/data";

export function Navbar() {
  const [open, setOpen] = useState(false);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#e7f0e9]/90 backdrop-blur-xl">
    <nav className="container-shell flex h-[76px] items-center justify-between" aria-label="Primary navigation">
      <Link href="#home" className="flex items-center gap-3 font-extrabold tracking-tight" onClick={()=>setOpen(false)}>
        <span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-sm text-cyan-300 shadow-lg">M</span>
        <span className="hidden sm:inline">TheMonark<span className="text-blue-600">WebServices</span></span>
        <span className="sm:hidden">Monark<span className="text-blue-600">Web</span></span>
      </Link>
      <div className="hidden items-center gap-6 lg:flex">
        {navItems.map(item=><Link key={item.href} href={item.href} className="text-[13px] font-semibold text-slate-600 transition hover:text-blue-600">{item.label}</Link>)}
      </div>
      <div className="hidden lg:block"><Link href="#contact" className="inline-flex h-11 items-center rounded-full bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-600">Get a Quote</Link></div>
      <button className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white lg:hidden" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>{open?<X/>:<Menu/>}</button>
    </nav>
    {open && <div id="mobile-menu" className="fixed inset-x-0 top-[76px] h-[calc(100vh-76px)] border-t border-emerald-950/10 bg-[#e7f0e9] px-5 py-8 lg:hidden">
      <div className="mx-auto flex max-w-xl flex-col">
        {navItems.map((item,i)=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className="border-b border-slate-200 py-4 text-xl font-bold"><span className="mr-4 text-xs text-blue-600">0{i+1}</span>{item.label}</Link>)}
        <Link href="#contact" onClick={()=>setOpen(false)} className="mt-8 rounded-full bg-blue-600 px-6 py-4 text-center font-bold text-white">Get a Quote</Link>
      </div>
    </div>}
  </header>;
}
