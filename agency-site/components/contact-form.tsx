"use client";
import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { projectTypes, serviceOptions } from "@/lib/data";

type FormState = { fullName:string; email:string; phone:string; company:string; projectType:string; service:string; budget:string; timeline:string; description:string };
const initial:FormState = { fullName:"", email:"", phone:"", company:"", projectType:"", service:"", budget:"", timeline:"", description:"" };
function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-600" role="alert">{message}</p> : null;
}

export function ContactForm() {
  const [form,setForm]=useState(initial); const [errors,setErrors]=useState<Partial<Record<keyof FormState,string>>>({}); const [sent,setSent]=useState(false);
  const update=(key:keyof FormState,value:string)=>{setForm({...form,[key]:value});setErrors({...errors,[key]:undefined});};
  const submit=(e:React.FormEvent)=>{
    e.preventDefault(); const next:typeof errors={};
    if(form.fullName.trim().length<2) next.fullName="Please enter your full name.";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email="Please enter a valid email.";
    if(!form.projectType) next.projectType="Choose a project type.";
    if(!form.service) next.service="Choose the service you need.";
    if(form.description.trim().length<20) next.description="Please share at least 20 characters.";
    setErrors(next); if(Object.keys(next).length===0){setSent(true); setForm(initial);}
  };
  if(sent) return <div className="grid min-h-[480px] place-items-center rounded-[28px] border border-emerald-200 bg-emerald-50 p-8 text-center"><div><CheckCircle2 className="mx-auto text-emerald-600" size={54}/><h3 className="mt-5 text-2xl font-extrabold">Your project brief is ready.</h3><p className="muted mx-auto mt-3 max-w-md">This demo submission is validated in the browser and ready to connect to your preferred email, CRM, API, or database endpoint.</p><button onClick={()=>setSent(false)} className="mt-7 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Send another inquiry</button></div></div>;
  const fieldClass="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
  return <form onSubmit={submit} noValidate className="grid gap-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-bold">Full Name *<input className={fieldClass} value={form.fullName} onChange={e=>update("fullName",e.target.value)} autoComplete="name" aria-invalid={Boolean(errors.fullName)}/><FieldError message={errors.fullName}/></label>
      <label className="text-sm font-bold">Email *<input className={fieldClass} type="email" value={form.email} onChange={e=>update("email",e.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)}/><FieldError message={errors.email}/></label>
      <label className="text-sm font-bold">Phone Number<input className={fieldClass} type="tel" value={form.phone} onChange={e=>update("phone",e.target.value)} autoComplete="tel"/></label>
      <label className="text-sm font-bold">Company / Organization<input className={fieldClass} value={form.company} onChange={e=>update("company",e.target.value)} autoComplete="organization"/></label>
      <label className="text-sm font-bold">Type of Project *<select className={fieldClass} value={form.projectType} onChange={e=>update("projectType",e.target.value)} aria-invalid={Boolean(errors.projectType)}><option value="">Select a project</option>{projectTypes.map(x=><option key={x}>{x}</option>)}</select><FieldError message={errors.projectType}/></label>
      <label className="text-sm font-bold">Service Needed *<select className={fieldClass} value={form.service} onChange={e=>update("service",e.target.value)} aria-invalid={Boolean(errors.service)}><option value="">Select a service</option>{serviceOptions.map(x=><option key={x}>{x}</option>)}</select><FieldError message={errors.service}/></label>
      <label className="text-sm font-bold">Estimated Budget<select className={fieldClass} value={form.budget} onChange={e=>update("budget",e.target.value)}><option value="">Select a range</option>{["Under $2,500","$2,500 – $5,000","$5,000 – $10,000","$10,000 – $25,000","$25,000+"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="text-sm font-bold">Preferred Timeline<select className={fieldClass} value={form.timeline} onChange={e=>update("timeline",e.target.value)}><option value="">Select a timeline</option>{["As soon as possible","1–2 months","2–4 months","4–6 months","Flexible / Not sure"].map(x=><option key={x}>{x}</option>)}</select></label>
    </div>
    <label className="text-sm font-bold">Project Description *<textarea className="mt-2 min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Tell us about the product, users, goals, and any important requirements…" value={form.description} onChange={e=>update("description",e.target.value)} aria-invalid={Boolean(errors.description)}/><FieldError message={errors.description}/></label>
    <button type="submit" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-blue-600 px-7 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-200">Send Project Inquiry <Send size={17}/></button>
    <p className="text-center text-xs text-slate-400">No spam. Just a thoughtful conversation about your project.</p>
  </form>;
}
