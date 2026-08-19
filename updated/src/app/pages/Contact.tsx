import { useState } from "react";
import { Mail, Phone, Facebook, Instagram, Youtube, Rss, CheckCircle, ArrowRight, Clock, MapPin } from "lucide-react";
import { Link } from "react-router";
import { C, TikTokIcon, TwitterXIcon } from "../shared";

const DISPLAY = "'Bricolage Grotesque', 'Inter', sans-serif";
const BODY    = "'Inter', sans-serif";

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-400";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold tracking-wide uppercase" style={{ color: C.darkPurple }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "#ECFDF5" }}>
        <CheckCircle size={32} className="text-emerald-500" />
      </div>
      <h3 className="text-2xl font-extrabold mb-2" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>Message sent!</h3>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
        Thanks for getting in touch. We&apos;ll get back to you as soon as we can.
      </p>
      <button onClick={onReset}
        className="mt-8 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all hover:bg-purple-50"
        style={{ borderColor: C.purple, color: C.purple }}>
        Send another message
      </button>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setConsent(false);
  };

  return (
    <div style={{ fontFamily: BODY }}>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden px-6 py-24"
        style={{ background: "linear-gradient(135deg, #1C1040 0%, #3D1B7A 60%, #5A2E9A 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-4"
            style={{ fontFamily: DISPLAY }}>
            Get in <span style={{ color: "#FFD166" }}>touch</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Questions, feedback, or just want to say hello — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* ══ CONTACT INFO + FORM ══ */}
      <section className="py-16 px-6" style={{ background: "#F7F5FB" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1.6fr] gap-10 items-start">

          {/* Left — info panel */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl p-7 flex flex-col gap-5" style={{ background: C.darkPurple }}>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#FFD166" }}>Reach us directly</p>
              <a href="mailto:CPLTeam@community-playlink.com"
                className="group flex items-start gap-4 rounded-xl p-4 transition-all hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.purple }}>
                  <Mail size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/50 text-xs mb-0.5">Email</p>
                  <p className="text-white text-sm font-semibold break-all">CPLTeam@community-playlink.com</p>
                </div>
              </a>
              <a href="tel:02380335362"
                className="group flex items-start gap-4 rounded-xl p-4 transition-all hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.purple }}>
                  <Phone size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white/50 text-xs mb-0.5">Phone</p>
                  <p className="text-white text-sm font-semibold">02380 335362</p>
                </div>
              </a>
              <div className="flex items-start gap-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.purple }}>
                  <MapPin size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white/50 text-xs mb-0.5">Address</p>
                  <p className="text-white text-sm font-semibold">Swaythling Neighbourhood Centre</p>
                  <p className="text-white/50 text-xs mt-0.5">Broadlands Road, Southampton, SO16 3LS</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.purple }}>
                  <Clock size={16} className="text-white" />
                </div>
                <div className="text-sm">
                  <p className="text-white/50 text-xs mb-1.5">Opening hours</p>
                  {[["Tuesday", "10am – 1pm"], ["Wednesday", "10am – 1pm"], ["Saturday", "10am – 1pm"]].map(([day, hrs]) => (
                    <div key={day} className="flex gap-3">
                      <span className="text-white/50 w-24">{day}</span>
                      <span className="text-white font-medium">{hrs}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — contact form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            {submitted ? <SuccessState onReset={reset} /> : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: C.purple }}>Send a message</p>
                  <h2 className="text-2xl font-extrabold" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>We&apos;ll get back to you soon</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Note: our office isn&apos;t open every day — if you leave a message we&apos;ll respond as soon as we can.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Name" required>
                    <input type="text" value={form.name} onChange={set("name")} required
                      placeholder="Your name" className={inputCls} />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" value={form.email} onChange={set("email")} required
                      placeholder="your@email.com" className={inputCls} />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Phone">
                    <input type="tel" value={form.phone} onChange={set("phone")}
                      placeholder="Optional" className={inputCls} />
                  </Field>
                  <Field label="Subject" required>
                    <select value={form.subject} onChange={set("subject")} required className={inputCls}>
                      <option value="">Select a topic…</option>
                      <option>Toy Library</option>
                      <option>Playtime Sessions</option>
                      <option>Party Hire</option>
                      <option>Group Membership</option>
                      <option>Volunteering</option>
                      <option>Donation</option>
                      <option>Other</option>
                    </select>
                  </Field>
                </div>

                <Field label="Message" required>
                  <textarea value={form.message} onChange={set("message")} required rows={5}
                    placeholder="How can we help?" className={inputCls + " resize-y"} />
                </Field>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${consent ? "border-purple-600 bg-purple-600" : "border-gray-300 group-hover:border-purple-400"}`}
                    onClick={() => setConsent(!consent)}>
                    {consent && (
                      <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                        <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required className="sr-only" />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link to="/about#policies" style={{ color: C.red }} className="underline underline-offset-2 hover:no-underline">privacy policy</Link>
                    {" "}and{" "}
                    <Link to="/about#policies" style={{ color: C.red }} className="underline underline-offset-2 hover:no-underline">terms and conditions</Link>.
                  </span>
                </label>

                <button type="submit"
                  className="self-start flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                  style={{ background: C.purple }}>
                  Send message <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
