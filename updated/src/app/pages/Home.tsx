import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ArrowRight, MapPin, Clock, Facebook, Instagram, Youtube, Rss,
  ChevronLeft, ChevronRight, Users, CalendarDays, Sparkles, Heart,
} from "lucide-react";
import { C, TikTokIcon, TwitterXIcon } from "../shared";

const DISPLAY = "'Bricolage Grotesque', 'Inter', sans-serif";
const BODY    = "'Inter', sans-serif";

/* ─── animated counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const inc = target / steps;
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + inc, target);
          setCount(Math.floor(cur));
          if (cur >= target) clearInterval(t);
        }, 1800 / steps);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── hero image mosaic ─── */
const heroImages = [
  { src: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&q=80", alt: "Children crafting" },
  { src: "https://images.unsplash.com/photo-1630476504743-a4d342f88760?w=500&q=80", alt: "Colourful artwork" },
  { src: "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=500&q=80", alt: "Children painting" },
  { src: "https://images.unsplash.com/photo-1593103916129-87e179a70c1f?w=500&q=80", alt: "Kids on swings" },
];

/* ─── testimonials ─── */
const testimonials = [
  { quote: "The toy library is the best thing about Southampton. The staff do a brilliant job.", author: "Parent member" },
  { quote: "An invaluable resource for the community — accessible toys for everyone. We couldn't manage without it.", author: "Regular visitor" },
  { quote: "My children love visiting every week. Something new to discover every time.", author: "Family member" },
  { quote: "Community Playlink has been a lifeline for our family. The playtime sessions are brilliant.", author: "Toddler group parent" },
  { quote: "Without the Toy Library my children would have led a much poorer life. Thank you!", author: "Long-term member" },
];

/* ─── slim auto-rotating quote strip ─── */
function QuoteStrip() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % testimonials.length);
        setFading(false);
      }, 300);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const t = testimonials[idx];
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
        <span className="text-white/30 text-xs font-bold tracking-widest uppercase shrink-0 hidden sm:block">What families say</span>
        <span className="w-px h-4 bg-white/20 shrink-0 hidden sm:block" />
        <p
          className="text-white/70 text-sm italic truncate transition-opacity duration-300"
          style={{ opacity: fading ? 0 : 1 }}
        >
          &ldquo;{t.quote}&rdquo;
          <span className="not-italic font-semibold ml-2 text-white/40">— {t.author}</span>
        </p>
        <div className="flex gap-1 shrink-0 ml-auto">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="rounded-full transition-all"
              style={{ width: i === idx ? 16 : 6, height: 6, background: i === idx ? "#FFD166" : "rgba(255,255,255,0.2)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── service card ─── */
interface ServiceItem { img: string; category: string; title: string; body: string; to: string; }
const services: ServiceItem[] = [
  { img: "https://images.unsplash.com/photo-1600821986515-3ef5b0f29f39?w=600&q=80", category: "Borrowing", title: "Toy Library", body: "Borrow high-quality educational toys and play equipment — completely free.", to: "/services#toy-libraries" },
  { img: "https://images.unsplash.com/photo-1630476504743-a4d342f88760?w=600&q=80", category: "Weekly sessions", title: "Playtime", body: "Free weekly sessions bursting with toys, crafts, songs and stories for under‑5s.", to: "/services#playtime" },
  { img: "https://images.unsplash.com/photo-1531956531700-dc0ee0f1f9a5?w=600&q=80", category: "Events", title: "Party Hire", body: "Hire from our extensive toy collection to make any party unforgettable.", to: "/services#party-hire" },
  { img: "https://images.unsplash.com/photo-1647627611823-d08fa901678e?w=600&q=80", category: "Community", title: "Toddler Groups", body: "A warm place for under‑5s and their families to connect, learn and grow.", to: "/services#toddler-groups" },
];

function ServiceCard({ item }: { item: ServiceItem }) {
  return (
    <Link to={item.to} className="group relative overflow-hidden rounded-2xl block bg-gray-900" style={{ aspectRatio: "4/5" }}>
      <img src={item.img} alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-widest uppercase opacity-70 text-white">{item.category}</span>
        <h3 className="text-xl font-extrabold text-white leading-tight" style={{ fontFamily: DISPLAY }}>{item.title}</h3>
        <p className="text-white/70 text-xs leading-relaxed mt-0.5 max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-300">{item.body}</p>
        <span className="flex items-center gap-1 text-xs font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ color: "#FFD166" }}>
          Find out more <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}

/* ─── full testimonials carousel ─── */
function Testimonials() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIdx(i => (i + 1) % testimonials.length);
  const t = testimonials[idx];
  return (
    <section className="py-20 px-4" style={{ background: "#F7F5FB" }}>
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold tracking-widest uppercase mb-8" style={{ color: C.purple }}>What families say</p>
        <div className="relative min-h-[140px] flex items-center justify-center">
          <span className="absolute -top-4 left-0 text-8xl font-serif leading-none select-none" style={{ color: C.purple, opacity: 0.12 }}>&ldquo;</span>
          <p key={idx} className="text-xl md:text-2xl font-medium leading-relaxed text-gray-800 transition-all animate-fadeIn" style={{ fontFamily: DISPLAY }}>
            &ldquo;{t.quote}&rdquo;
          </p>
        </div>
        <p className="mt-6 text-sm font-semibold" style={{ color: C.purple }}>— {t.author}</p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={prev} className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:bg-purple-50"
            style={{ borderColor: C.purple, color: C.purple }}>
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className="rounded-full transition-all"
                style={{ width: i === idx ? 24 : 8, height: 8, background: i === idx ? C.purple : "#D8D0EC" }} />
            ))}
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:bg-purple-50"
            style={{ borderColor: C.purple, color: C.purple }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── page ─── */
export default function Home() {
  return (
    <div style={{ fontFamily: BODY }}>

      {/* ══ HERO ══ */}
      <section
        className="relative overflow-hidden px-6 pt-16 pb-0 min-h-[92vh] flex flex-col justify-between"
        style={{ background: "linear-gradient(135deg, #1C1040 0%, #3D1B7A 60%, #5A2E9A 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative z-10 max-w-6xl mx-auto w-full grid md:grid-cols-[1fr_1fr] gap-12 items-center flex-1 pb-16">
          {/* Left: text */}
          <div className="flex flex-col gap-6 pt-8 md:pt-0">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 self-start">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/80 text-xs font-medium">Free · Open Tue, Wed &amp; Sat</span>
            </div>

            <h1 style={{ fontFamily: DISPLAY }} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
              Making play<br />
              <span style={{ color: "#FFD166" }}>free</span> since<br />
              1974.
            </h1>

            <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-sm">
              Community Playlink is a registered charity running free toy libraries and play sessions for families across Southampton.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/services"
                className="btn-coral flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95">
                Explore our services <ArrowRight size={16} />
              </Link>
              <Link to="/toy-library"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition-all">
                Toy index
              </Link>
            </div>
          </div>

          {/* Right: Ken Burns mosaic */}
          <div className="relative hidden md:grid grid-cols-2 gap-3" style={{ aspectRatio: "1" }}>
            {heroImages.map((img, i) => (
              <div key={i} className={`overflow-hidden rounded-2xl shadow-xl ${i === 0 ? "col-span-2 h-48" : "h-36"}`}
                style={{ transform: i % 2 === 1 ? "translateY(8px)" : undefined }}>
                <img src={img.src} alt={img.alt}
                  className={`w-full h-full object-cover kb-${i}`} />
              </div>
            ))}
            {/* floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "#FFF0CC" }}>🧸</div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Toys available</p>
                <p className="text-lg font-extrabold leading-none" style={{ color: C.darkPurple, fontFamily: DISPLAY }}>500+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 border-t border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { value: 47617, label: "Families helped", suffix: "" },
              { value: 50,    label: "Years serving Southampton", suffix: "+" },
              { value: 500,   label: "Toys in our library", suffix: "+" },
              { value: 100,   label: "Free to join", suffix: "%" },
            ].map(({ value, label, suffix }) => (
              <div key={label} className="py-5 px-6 text-center">
                <p className="text-3xl font-extrabold text-white" style={{ fontFamily: DISPLAY }}>
                  <Counter target={value} suffix={suffix} />
                </p>
                <p className="text-white/50 text-xs mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ══ SERVICES ══ */}
      <section className="py-20 px-4" style={{ background: "#F7F5FB" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: C.purple }}>What we offer</p>
              <h2 className="text-4xl font-extrabold leading-tight" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>
                Play is how<br />children learn.
              </h2>
            </div>
            <Link to="/services" className="flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all" style={{ color: C.purple }}>
              View all services <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map(item => <ServiceCard key={item.title} item={item} />)}
          </div>
        </div>
      </section>

      {/* ══ FOR GROUPS ══ */}
      <section className="py-0 overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[480px]">
          <div className="relative overflow-hidden order-2 md:order-1 h-64 md:h-auto">
            <img src="https://images.unsplash.com/photo-1593103916129-87e179a70c1f?w=800&q=80"
              alt="Children playing together" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 hidden md:block" />
          </div>
          <div className="flex flex-col justify-center px-10 py-14 order-1 md:order-2" style={{ background: C.darkPurple }}>
            <span className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#FFD166" }}>For toddler groups</span>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-5" style={{ fontFamily: DISPLAY }}>
              Supporting groups<br />across Southampton
            </h2>
            <p className="text-white/65 text-base leading-relaxed mb-8 max-w-sm">
              We offer an excellent Group Membership Scheme for toddler groups and early years settings. We love what you do — see what we can do to help you!
            </p>
            <Link to="/services#group-membership"
              className="self-start flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition-all">
              Learn about membership <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ IMPACT NUMBERS ══ */}
      <section className="py-24 px-4" style={{ background: C.darkPurple }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#FFD166" }}>Our impact</p>
            <h2 className="text-4xl font-extrabold text-white" style={{ fontFamily: DISPLAY }}>
              Play changes lives.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                value: 47617, suffix: "", icon: Users, iconBg: "#3D1B7A",
                label: "Families helped",
                desc: "Visitors through our doors in the last year alone",
              },
              {
                value: 500, suffix: "+", icon: Sparkles, iconBg: "#4A1F70",
                label: "Toys available",
                desc: "Quality, educational toys ready to borrow right now",
              },
              {
                value: 3, suffix: " days", icon: CalendarDays, iconBg: "#3D1B7A",
                label: "Open every week",
                desc: "Tuesday, Wednesday and Saturday — free, no booking needed",
              },
              {
                value: 50, suffix: "+ yrs", icon: Heart, iconBg: "#4A1F70",
                label: "Serving Southampton",
                desc: "Five decades of making play free for local families",
              },
            ].map(({ value, suffix, icon: Icon, iconBg, label, desc }) => (
              <div key={label}
                className="flex flex-col gap-5 p-7 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: iconBg }}>
                  <Icon size={20} className="text-white/80" />
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-white leading-none mb-2" style={{ fontFamily: DISPLAY }}>
                    <Counter target={value} suffix={suffix} />
                  </p>
                  <p className="text-white font-semibold text-sm mb-1">{label}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <Testimonials />

      {/* ══ JOIN US ══ */}
      <section id="find-us" style={{ background: C.darkPurple }} className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 items-start">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#FFD166" }}>Come and visit us</p>
                <h2 className="text-4xl font-extrabold text-white leading-tight" style={{ fontFamily: DISPLAY }}>
                  We&apos;d love to<br />meet you.
                </h2>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Drop in during opening hours to explore our toy library, join a playtime session, or just say hello. No booking needed.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <MapPin size={15} className="text-white/70" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Swaythling Neighbourhood Centre</p>
                    <p className="text-white/50 text-sm">Hampton Pk Wy, Southampton SO17 3AT</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <Clock size={15} className="text-white/70" />
                  </div>
                  <div className="text-sm">
                    {[["Tuesday", "10am – 1pm"], ["Wednesday", "10am – 1pm"], ["Saturday", "10am – 1pm"]].map(([day, hrs]) => (
                      <div key={day} className="flex gap-3">
                        <span className="text-white/50 w-24">{day}</span>
                        <span className="text-white font-medium">{hrs}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {([
                  [Facebook, "Facebook"],
                  [Instagram, "Instagram"],
                  [Youtube, "YouTube"],
                  [Rss, "RSS"],
                ] as [React.ComponentType<{ size: number }>, string][]).map(([Icon, label]) => (
                  <a key={label} href="#" aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
                    <Icon size={16} />
                  </a>
                ))}
                <a href="#" aria-label="TikTok" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
                  <TikTokIcon className="w-4 h-4" />
                </a>
                <a href="#" aria-label="X / Twitter" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
                  <TwitterXIcon className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl h-72 md:h-[420px] bg-gray-800">
              <iframe
                title="Community Playlink location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2513.1!2d-1.3800!3d50.9300!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCommunity%20Playlink!5e0!3m2!1sen!2suk!4v1"
                className="w-full h-full border-0"
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA BAND ══ */}
      <section className="relative overflow-hidden px-6 py-14"
        style={{ background: "linear-gradient(90deg, #FF5A3C 0%, #E83060 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white leading-tight" style={{ fontFamily: DISPLAY }}>
              Help us keep play free.
            </h2>
            <p className="text-white/75 text-sm mt-1">Every donation keeps our toy library running for the next family.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/support-us"
              className="px-6 py-3 rounded-xl bg-white font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
              style={{ color: C.red }}>
              Donate
            </Link>
            <Link to="/support-us#volunteering"
              className="px-6 py-3 rounded-xl border-2 border-white/40 font-semibold text-sm text-white hover:bg-white/10 transition-all">
              Volunteer
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
