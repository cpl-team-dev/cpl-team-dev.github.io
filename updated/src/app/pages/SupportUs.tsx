import { useState } from "react";
import { ArrowRight, Gift, Heart, Users, CheckCircle, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router";
import { C } from "../shared";

const DISPLAY = "'Bricolage Grotesque', 'Inter', sans-serif";
const BODY    = "'Inter', sans-serif";

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-400";

function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className="text-xs font-bold tracking-widest uppercase mb-3"
      style={{ color: light ? "#FFD166" : C.purple }}>{children}</p>
  );
}

/* ─── custom checkbox ─── */
function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div onClick={onChange}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "border-purple-600 bg-purple-600" : "border-gray-300 group-hover:border-purple-400"}`}>
        {checked && (
          <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
            <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

/* ─── volunteer form ─── */
const volunteeringFor = ["No", "Duke of Edinburgh Award", "Work Experience", "Other"];
const involvedWith = [
  "Toy Library Helper",
  "Toy Checker/Cleaner",
  "Toy Cataloguer",
  "General Office Helper",
  "DIY: mending wooden toys",
  "Social Media Helper",
  "Other",
];

function VolunteerForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", volunteering: "", why: "", availability: "" });
  const [involved, setInvolved] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleInvolved = (v: string) =>
    setInvolved(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "#ECFDF5" }}>
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-2xl font-extrabold mb-2" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>Application submitted!</h3>
        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
          Thank you for your interest in volunteering. We&apos;ll be in touch soon.
        </p>
        <button onClick={() => setSubmitted(false)}
          className="mt-8 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all hover:bg-purple-50"
          style={{ borderColor: C.purple, color: C.purple }}>
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-wide uppercase" style={{ color: C.darkPurple }}>Name <span style={{ color: C.red }}>*</span></label>
          <input type="text" required value={form.name} onChange={set("name")} placeholder="Your name" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-wide uppercase" style={{ color: C.darkPurple }}>Email <span style={{ color: C.red }}>*</span></label>
          <input type="email" required value={form.email} onChange={set("email")} placeholder="your@email.com" className={inputCls} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold tracking-wide uppercase" style={{ color: C.darkPurple }}>Phone</label>
        <input type="tel" value={form.phone} onChange={set("phone")} placeholder="Optional" className={inputCls} />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-wide uppercase" style={{ color: C.darkPurple }}>
          Is there anything you&apos;re volunteering for? <span style={{ color: C.red }}>*</span>
        </p>
        <p className="text-xs text-gray-400 -mt-1">e.g. Duke of Edinburgh Award</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {volunteeringFor.map(opt => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${form.volunteering === opt ? "border-purple-600" : "border-gray-300 group-hover:border-purple-400"}`}>
                {form.volunteering === opt && <div className="w-2 h-2 rounded-full bg-purple-600" />}
              </div>
              <input type="radio" name="volunteering" value={opt} checked={form.volunteering === opt} onChange={set("volunteering")} required className="sr-only" />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-wide uppercase" style={{ color: C.darkPurple }}>
          What would you like to get involved with? <span style={{ color: C.red }}>*</span>
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {involvedWith.map(opt => (
            <Checkbox key={opt} checked={involved.includes(opt)} onChange={() => toggleInvolved(opt)} label={opt} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold tracking-wide uppercase" style={{ color: C.darkPurple }}>Why do you want to get involved? <span style={{ color: C.red }}>*</span></label>
        <textarea required value={form.why} onChange={set("why")} rows={4} placeholder="Tell us a little about yourself…" className={inputCls + " resize-y"} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold tracking-wide uppercase" style={{ color: C.darkPurple }}>What&apos;s your availability? <span style={{ color: C.red }}>*</span></label>
        <textarea required value={form.availability} onChange={set("availability")} rows={3} placeholder="Days, times, hours per week…" className={inputCls + " resize-y"} />
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <div onClick={() => setConsent(!consent)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${consent ? "border-purple-600 bg-purple-600" : "border-gray-300 group-hover:border-purple-400"}`}>
          {consent && (
            <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
              <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required className="sr-only" />
        <span className="text-sm text-gray-600 leading-relaxed">
          I agree to the{" "}
          <Link to="/about#policies" style={{ color: C.red }} className="underline underline-offset-2 hover:no-underline">privacy policy</Link>.
        </span>
      </label>

      <button type="submit"
        className="self-start flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
        style={{ background: C.purple }}>
        Submit application <ArrowRight size={15} />
      </button>
    </form>
  );
}

export default function SupportUs() {
  return (
    <div style={{ fontFamily: BODY }}>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden px-6 py-24"
        style={{ background: "linear-gradient(135deg, #1C1040 0%, #3D1B7A 60%, #5A2E9A 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-4"
            style={{ fontFamily: DISPLAY }}>
            Support <span style={{ color: "#FFD166" }}>our mission</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Community Playlink runs entirely on the generosity of volunteers, donors, and toy donors. Every contribution — big or small — keeps play free for families in Southampton.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { label: "Give toys", href: "#give-toys" },
              { label: "Donate", href: "#donate" },
              { label: "Volunteer", href: "#volunteering" },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                onClick={e => { e.preventDefault(); document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className="px-5 py-2.5 rounded-full border border-white/25 text-white/85 text-sm font-semibold hover:bg-white/10 transition-all">
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ THREE WAYS ══ */}
      <section className="py-16 px-6" style={{ background: "#F7F5FB" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Label>Three ways to help</Label>
            <h2 className="text-4xl font-extrabold" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>
              How you can make a difference
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Gift,
                color: C.red,
                bg: "#FFF0ED",
                title: "Give Toys",
                href: "#give-toys",
                body: "Give toys a second life and bring joy to countless children by donating your unwanted, quality toys to us.",
              },
              {
                icon: Heart,
                color: "#5A9A6F",
                bg: "#EEF7F1",
                title: "Donate",
                href: "#donate",
                body: "Help us keep supporting local families in the face of increased pressure from the cost of living crisis.",
              },
              {
                icon: Users,
                color: C.purple,
                bg: "#EDE8F7",
                title: "Volunteer",
                href: "#volunteering",
                body: "Love making a difference in your community? We rely on volunteers to keep our services running.",
              },
            ].map(({ icon: Icon, color, bg, title, href, body }) => (
              <a key={title} href={href}
                onClick={e => { e.preventDefault(); document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className="group bg-white rounded-2xl p-7 flex flex-col gap-4 hover:shadow-lg transition-all border border-transparent hover:border-purple-100 cursor-pointer">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: bg }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold mb-1.5" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold mt-auto group-hover:gap-2 transition-all" style={{ color }}>
                  Find out more <ArrowRight size={14} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GIVE TOYS ══ */}
      <section id="give-toys" className="overflow-hidden scroll-mt-16">
        <div className="grid md:grid-cols-2 min-h-[440px]">
          <div className="relative h-64 md:h-auto overflow-hidden">
            <img src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80"
              alt="Toy library shelves"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <div className="flex flex-col justify-center px-10 py-16" style={{ background: C.darkPurple }}>
            <Label light>Give something back</Label>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-5" style={{ fontFamily: DISPLAY }}>
              Give toys a<br />second life.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              We accept donations of quality, complete toys in good condition, suitable for children from 0–14 years old. Bring them to our base at Swaythling Neighbourhood Centre.
            </p>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              You have the opportunity to make a massive difference — reducing clutter and preventing perfectly usable toys from ending up in landfill.
            </p>
            <Link to="/contact"
              className="btn-coral self-start flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90">
              Find us <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ DONATE ══ */}
      <section id="donate" className="py-20 px-6 scroll-mt-16" style={{ background: "#F7F5FB" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <Label>Financial support</Label>
            <h2 className="text-4xl font-extrabold leading-tight mb-5" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>
              Every donation<br />keeps us going.
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              We receive very few monetary donations, meaning we rely heavily on grants that are increasingly under pressure from spending cuts. The cost of living crisis has massively increased the number of people using our services — while also increasing the workload for our limited staff and volunteers.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">Your donation directly enables us to:</p>
            <div className="flex flex-col gap-3 mb-8">
              {[
                "Hire more paid staff and increase staff hours",
                "Purchase new, quality toys requested by members",
                "Offer more playtime sessions every week",
                "Maintain our extensive offering of educational toys",
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#ECFDF5" }}>
                    <CheckCircle size={13} className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
            <a href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "#5A9A6F" }}>
              <Heart size={15} /> Donate now
            </a>
          </div>

          {/* Impact stat card */}
          <div className="rounded-2xl p-10 flex flex-col gap-6 text-center" style={{ background: C.darkPurple }}>
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#FFD166" }}>Your impact</p>
            <div className="flex flex-col gap-4">
              {[
                { amount: "£5", impact: "buys a brand new toy for a child who needs it" },
                { amount: "£20", impact: "covers the cost of a playtime session for families" },
                { amount: "£50", impact: "helps maintain our toy library for a month" },
              ].map(({ amount, impact }) => (
                <div key={amount} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: DISPLAY }}>{amount}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{impact}</p>
                </div>
              ))}
            </div>
            <a href="#"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "#5A9A6F" }}>
              <LinkIcon size={14} /> Go to donation page
            </a>
          </div>
        </div>
      </section>

      {/* ══ VOLUNTEERING ══ */}
      <section id="volunteering" className="py-20 px-6 scroll-mt-16" style={{ background: C.darkPurple }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_1.6fr] gap-12 items-start">

            {/* Left info */}
            <div>
              <Label light>Get involved</Label>
              <h2 className="text-4xl font-extrabold text-white leading-tight mb-5" style={{ fontFamily: DISPLAY }}>
                Volunteer<br />with us.
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                As a small, local charity, volunteers are extremely important to keep Community Playlink running. It&apos;s also a brilliant opportunity to get work experience if you&apos;re studying to work with children, or need volunteering hours for a programme like the Duke of Edinburgh award.
              </p>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#FFD166" }}>You could help with</p>
              <div className="flex flex-col gap-2">
                {[
                  "Helping with the toy library",
                  "General office duties",
                  "Checking and cleaning toys",
                  "Cataloguing toys",
                  "DIY — mending wooden toys",
                  "Social media support",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#FFD166" }} />
                    <p className="text-white/70 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-extrabold mb-1" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>Volunteer application</h3>
              <p className="text-gray-500 text-sm mb-6">Fill in the form and we&apos;ll get back to you as soon as possible.</p>
              <VolunteerForm />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
