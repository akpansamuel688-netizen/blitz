import { ArrowDown, CheckCircle2, Code2, Layers3, Zap } from "lucide-react";
import { PrimaryLink } from "./ui";

export function Hero() {
  return <section id="home" className="relative overflow-hidden bg-[#07111f] text-white">
    <div className="dark-grid absolute inset-0 opacity-60" />
    <div className="absolute -left-40 top-20 size-[420px] rounded-full bg-blue-600/20 blur-[100px]" />
    <div className="absolute -right-40 bottom-0 size-[460px] rounded-full bg-cyan-400/15 blur-[100px]" />
    <div className="container-shell relative grid min-h-[calc(100vh-76px)] items-center gap-16 py-24 lg:grid-cols-[1.1fr_.9fr]">
      <div className="fade-up">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold tracking-widest text-cyan-300 uppercase"><span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />Digital product engineering</div>
        <h1 className="display max-w-4xl">Your idea.<br/>Our code. <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">One powerful</span> digital product.</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">From high-converting websites to powerful web, mobile, and desktop applications, TheMonarkWebServices turns ideas into fast, scalable, beautifully designed digital products.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><PrimaryLink href="#contact" dark>Start Your Project</PrimaryLink><a href="#services" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-bold transition hover:border-cyan-300/60 hover:bg-white/5">View Our Services <ArrowDown size={17}/></a></div>
        <div className="mt-11 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">{["Scalable by design","Transparent process","Built for real users"].map(x=><span className="flex items-center gap-2" key={x}><CheckCircle2 size={16} className="text-cyan-300"/>{x}</span>)}</div>
      </div>
      <div className="hero-orb relative mx-auto hidden w-full max-w-[480px] lg:block" aria-hidden>
        <div className="absolute -inset-10 rounded-full border border-cyan-300/10" />
        <div className="rounded-[32px] border border-white/10 bg-white/[.07] p-4 shadow-2xl shadow-blue-950 backdrop-blur-xl">
          <div className="rounded-[24px] border border-white/10 bg-[#0b1728] p-6">
            <div className="mb-7 flex items-center justify-between"><div className="flex gap-2"><i className="size-2.5 rounded-full bg-red-400"/><i className="size-2.5 rounded-full bg-amber-300"/><i className="size-2.5 rounded-full bg-emerald-400"/></div><span className="text-[10px] tracking-[.25em] text-slate-500">MONARK / BUILD</span></div>
            <div className="grid grid-cols-3 gap-3">{[{Icon:Code2,label:"PRODUCT"},{Icon:Layers3,label:"SYSTEM"},{Icon:Zap,label:"SPEED"}].map(({Icon,label})=><div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4"><Icon className="mb-4 text-cyan-300" size={20}/><span className="text-[9px] tracking-widest text-slate-400">{label}</span></div>)}</div>
            <div className="mt-3 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5">
              <div className="flex justify-between text-[10px] font-bold tracking-widest"><span>DIGITAL EXPERIENCE</span><span>LIVE</span></div>
              <div className="mt-10 h-2 rounded-full bg-white/20"><div className="h-full w-[78%] rounded-full bg-white"/></div>
              <div className="mt-3 flex justify-between text-xs"><span>Strategy to scale</span><span>78%</span></div>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_1.5fr] gap-3"><div className="h-24 rounded-2xl bg-white/5 p-4"><div className="h-2 w-10 rounded bg-cyan-300"/><div className="mt-6 text-2xl font-bold">4.9<span className="text-sm text-slate-500">/5</span></div></div><div className="flex h-24 items-end gap-2 rounded-2xl bg-white/5 p-4">{[35,55,44,78,67,92,84].map((h,i)=><i key={i} style={{height:`${h}%`}} className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-cyan-300"/>)}</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
