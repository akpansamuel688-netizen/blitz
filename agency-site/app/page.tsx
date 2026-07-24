import { ArrowRight, Check, ChevronRight, Quote, Star } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ContactForm } from "@/components/contact-form";
import { FloatingContactButton } from "@/components/floating-contact";
import { Footer } from "@/components/footer";
import { IconBox, PrimaryLink, SectionHeading } from "@/components/ui";
import { benefits, buildItems, packages, process, projects, services, technologies, testimonials } from "@/lib/data";
import { siteConfig } from "@/lib/config";

export default function Home() {
  return <main>
    <Navbar />
    <Hero />

    <section className="border-b border-emerald-950/10 bg-[#dce9df] py-7">
      <div className="container-shell flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs font-extrabold tracking-[.14em] text-slate-400 uppercase">
        <span className="text-slate-900">Built for</span>{["Startups","Growing businesses","Enterprise teams","Visionary founders"].map(x=><span key={x}>{x}</span>)}
      </div>
    </section>

    <section id="services" className="section">
      <div className="container-shell">
        <SectionHeading eyebrow="Capabilities" title="Everything needed to build it right." copy="One focused partner across product design, engineering, integration, launch, and growth—so your digital product feels coherent from end to end." />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((item,i)=><article key={item.title} className={`card-hover rounded-[24px] border border-slate-200 bg-white p-7 ${i===2||i===3?"lg:col-span-1":""}`}>
            <div className="flex items-start justify-between"><IconBox icon={item.icon}/><span className="text-xs font-bold text-slate-300">0{i+1}</span></div>
            <h3 className="mt-6 text-xl font-extrabold tracking-tight">{item.title}</h3><p className="muted mt-3 min-h-12 text-sm leading-6">{item.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">{item.tags.map(tag=><span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">{tag}</span>)}</div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="section overflow-hidden bg-[#07111f] text-white">
      <div className="container-shell">
        <SectionHeading eyebrow="What can we build?" title="If it lives on a screen, we can make it exceptional." copy="From customer-facing platforms to the internal tools that quietly run your business." light />
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{buildItems.map((x,i)=><div key={x} className={`group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm font-semibold transition hover:border-cyan-300/40 hover:bg-white/[.08] ${i===16?"lg:col-span-2":""}`}><span>{x}</span><ChevronRight size={16} className="text-cyan-300 transition group-hover:translate-x-1"/></div>)}</div>
      </div>
    </section>

    <section className="section bg-[#edf4ee]">
      <div className="container-shell">
        <SectionHeading eyebrow="Development programs" title="The right engagement for where you are now." copy="Choose a clear starting point. We shape scope, team, and delivery around your product—not the other way around." centered/>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{packages.map(x=><article key={x.title} className={`card-hover flex min-h-[300px] flex-col rounded-[24px] border p-7 ${x.featured?"border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-600/20":"border-slate-200 bg-[#f8fbff]"}`}>
          <IconBox icon={x.icon} dark={x.featured}/>{x.featured&&<span className="absolute" />}
          <h3 className="mt-7 text-xl font-extrabold">{x.title}</h3><p className={`mt-3 text-sm leading-6 ${x.featured?"text-blue-100":"muted"}`}>{x.copy}</p>
          <a href="#contact" className={`group mt-auto flex items-center gap-2 pt-8 text-sm font-bold ${x.featured?"text-white":"text-blue-600"}`}>Request This Service <ArrowRight size={16} className="transition group-hover:translate-x-1"/></a>
        </article>)}</div>
      </div>
    </section>

    <section className="section bg-[#d9e8dc]">
      <div className="container-shell grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-28"><SectionHeading eyebrow="Why Monark" title="Serious work. Clear standards." copy="We combine thoughtful design with robust engineering to deliver work your customers trust and your team can grow."/><div className="mt-8"><PrimaryLink href="#contact">Build with us</PrimaryLink></div></div>
        <div className="grid gap-3 sm:grid-cols-2">{benefits.map(([name,Icon],i)=><div key={name} className="flex items-center gap-4 rounded-2xl border border-white bg-white/70 p-4 shadow-sm"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-cyan-300"><Icon size={18}/></span><div><p className="font-bold">{name}</p><p className="mt-1 text-xs text-slate-500">{i%2===0?"Intentional at every detail.":"Built into every delivery."}</p></div></div>)}</div>
      </div>
    </section>

    <section id="process" className="section bg-[#edf4ee]">
      <div className="container-shell">
        <SectionHeading eyebrow="Our process" title="Clarity at every stage." copy="A practical, collaborative path from first conversation to stable launch—and beyond."/>
        <div className="relative mt-14 grid gap-4 md:grid-cols-3">{process.map(([num,title,copy],i)=><article key={num} className={`relative rounded-2xl border p-6 ${i===8?"border-blue-600 bg-blue-600 text-white":"border-slate-200 bg-white"}`}><span className={`text-xs font-extrabold tracking-widest ${i===8?"text-cyan-200":"text-blue-600"}`}>{num}</span><h3 className="mt-6 text-lg font-extrabold">{title}</h3><p className={`mt-2 text-sm leading-6 ${i===8?"text-blue-100":"muted"}`}>{copy}</p>{i<8&&<span className="absolute -right-3 top-1/2 z-10 hidden size-6 place-items-center rounded-full bg-slate-950 text-white md:grid"><ChevronRight size={13}/></span>}</article>)}</div>
      </div>
    </section>

    <section id="technologies" className="section border-y border-emerald-950/10 bg-[#dfeae1]">
      <div className="container-shell">
        <SectionHeading eyebrow="Technology" title="Modern tools. Chosen with purpose." copy="A scalable stack for products that need to be fast today and maintainable tomorrow." centered/>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{technologies.map(([name,mark])=><div key={name} className="card-hover flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center"><span className="grid size-11 place-items-center rounded-xl bg-slate-950 text-xs font-black tracking-wider text-cyan-300">{mark}</span><p className="mt-3 text-sm font-bold">{name}</p></div>)}</div>
      </div>
    </section>

    <section id="portfolio" className="section bg-[#edf4ee]">
      <div className="container-shell">
        <SectionHeading eyebrow="Selected concepts" title="Products made to move businesses forward." copy="Representative project concepts showing the breadth of platforms we design and engineer."/>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{projects.map((x,i)=><article key={x.title} className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white">
          <div className={`relative h-56 overflow-hidden bg-slate-950 p-6`}>
            <div className={`absolute -right-12 -top-12 size-44 rounded-full blur-3xl ${i%3===0?"bg-cyan-400/30":i%3===1?"bg-violet-500/30":"bg-blue-500/30"}`}/><div className="dark-grid absolute inset-0"/>
            <div className="relative h-full rounded-xl border border-white/10 bg-white/[.06] p-4 transition duration-500 group-hover:-translate-y-2 group-hover:rotate-1"><div className="flex items-center justify-between"><x.icon className="text-cyan-300"/><span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold tracking-widest text-white uppercase">{x.category}</span></div><div className="mt-9 grid grid-cols-3 gap-2"><i className="h-16 rounded-lg bg-white/10"/><i className="col-span-2 h-16 rounded-lg bg-gradient-to-r from-blue-600/80 to-cyan-500/70"/></div><div className="mt-2 h-6 rounded-lg bg-white/5"/></div>
          </div>
          <div className="p-6"><span className="text-[11px] font-extrabold tracking-widest text-blue-600 uppercase">{x.category}</span><h3 className="mt-2 text-xl font-extrabold">{x.title}</h3><p className="muted mt-3 text-sm leading-6">{x.description}</p><div className="mt-5 flex flex-wrap gap-2">{x.tech.map(t=><span key={t} className="text-xs font-semibold text-slate-500">#{t.replace(" ","")}</span>)}</div><a href="#contact" className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-600">View Project <ArrowRight size={15}/></a></div>
        </article>)}</div>
      </div>
    </section>

    <section className="section bg-[#07111f] text-white">
      <div className="container-shell"><SectionHeading eyebrow="Client perspective" title="Trusted to turn complexity into momentum." light centered/>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">{testimonials.map(x=><figure key={x.name} className="rounded-[24px] border border-white/10 bg-white/[.05] p-7"><div className="flex items-center justify-between"><Quote className="text-cyan-300"/><div className="flex text-amber-300">{[1,2,3,4,5].map(i=><Star key={i} size={13} fill="currentColor"/>)}</div></div><blockquote className="mt-8 text-lg font-semibold leading-8">&ldquo;{x.quote}&rdquo;</blockquote><figcaption className="mt-8 border-t border-white/10 pt-5"><p className="font-bold">{x.name}</p><p className="mt-1 text-xs text-slate-400">{x.role}</p></figcaption></figure>)}</div>
      </div>
    </section>

    <section id="about" className="section bg-[#e3eee5]">
      <div className="container-shell grid gap-14 lg:grid-cols-2 lg:items-center">
        <div><SectionHeading eyebrow="About us" title="A product partner for ambitious people and organizations." copy="TheMonarkWebServices helps startups, businesses, entrepreneurs, organizations, and individuals turn promising ideas into reliable digital products."/><p className="muted mt-5 leading-7">We care about the details users notice and the foundations they never see: strong information architecture, maintainable code, secure implementation, fast experiences, and systems ready to evolve. Every engagement is grounded in quality, scalability, and open communication.</p><div className="mt-8"><PrimaryLink href="#contact">Talk about your idea</PrimaryLink></div></div>
        <div className="relative rounded-[32px] bg-[#cfdfd3] p-7 sm:p-10"><div className="absolute right-0 top-0 size-40 rounded-full bg-emerald-300/25 blur-3xl"/><p className="relative text-sm font-bold text-emerald-800">THE MONARK STANDARD</p><div className="relative mt-7 grid gap-4 sm:grid-cols-2">{["Business-aware decisions","Excellent user experience","Maintainable foundations","Measurable performance"].map((x,i)=><div key={x} className="rounded-2xl bg-[#f5f8f5] p-5 shadow-sm"><span className="grid size-8 place-items-center rounded-full bg-slate-950 text-cyan-300"><Check size={15}/></span><p className="mt-5 font-extrabold">{x}</p><p className="muted mt-2 text-xs leading-5">{["We connect technical choices to real goals.","We make complex products feel simple.","We build for the team that inherits the code.","We treat speed and quality as product features."][i]}</p></div>)}</div></div>
      </div>
    </section>

    <section id="contact" className="section border-t border-emerald-950/10 bg-[#d9e8dc]">
      <div className="container-shell grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
        <div><SectionHeading eyebrow="Start a project" title="Have an idea? Let’s build it." copy="Tell us what you’re planning and let TheMonarkWebServices turn it into a powerful digital product."/><div className="mt-9 space-y-5">{["A thoughtful response, not a generic sales pitch","Clear next steps and project-fit guidance","Your information stays private"].map(x=><p className="flex gap-3 text-sm font-semibold" key={x}><Check className="shrink-0 text-blue-600" size={18}/>{x}</p>)}</div><div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Prefer email?</p><a href={`mailto:${siteConfig.email}`} className="mt-2 block break-all font-bold text-blue-600">{siteConfig.email}</a></div></div>
        <ContactForm/>
      </div>
    </section>
    <Footer/>
    <FloatingContactButton/>
  </main>;
}
