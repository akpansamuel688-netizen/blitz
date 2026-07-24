import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/config";
export function FloatingContactButton() {
  return <a href={`https://wa.me/${siteConfig.whatsapp}?text=Hello%20TheMonarkWebServices%2C%20I%27d%20like%20to%20discuss%20a%20project.`} target="_blank" rel="noreferrer" aria-label="Contact us on WhatsApp" className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-900/20 transition hover:-translate-y-1 hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-200"><MessageCircle size={25}/></a>;
}
