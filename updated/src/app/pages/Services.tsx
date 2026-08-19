import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight, Users, Gift, Star, Baby, Building2, ChevronDown } from "lucide-react";
import { C } from "../shared";

const DISPLAY = "'Bricolage Grotesque', 'Inter', sans-serif";
const BODY    = "'Inter', sans-serif";

/* ─── sticky service nav ─── */
const services = [
  { id: "toy-libraries",    label: "Toy Libraries",    icon: Gift,      color: C.red },
  { id: "playtime",         label: "Playtime",         icon: Baby,      color: C.purple },
  { id: "party-hire",       label: "Party Hire",       icon: Star,      color: "#5A9A6F" },
  { id: "toddler-groups",   label: "Toddler Groups",   icon: Users,     color: C.purple },
  { id: "group-membership", label: "Group Membership", icon: Building2, color: "#5A9A6F" },
];

function StickyServiceNav() {
  const [active, setActive] = useState("toy-libraries");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    services.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!show) return null;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-1"
      style={{ background: "rgba(28,16,64,0.95)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
      {services.map(s => {
        const Icon = s.icon;
        const isActive = active === s.id;
        return (
          <button key={s.id} onClick={() => scrollTo(s.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: isActive ? s.color : "transparent", color: isActive ? "#fff" : "rgba(255,255,255,0.55)" }}>
            <Icon size={13} />
            <span className="hidden md:inline">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─── service section ─── */
interface ServiceSectionProps {
  id: string;
  label: string;
  headline: string;
  body: React.ReactNode;
  img: string;
  accent: string;
  dark?: boolean;
  flip?: boolean;
  cta?: { label: string; to: string };
  pills?: string[];
}

function ServiceSection({ id, label, headline, body, img, accent, dark = false, flip = false, cta, pills }: ServiceSectionProps) {
  const bg = dark ? C.darkPurple : "#F7F5FB";
  const fgHeading = dark ? "#fff" : C.darkPurple;
  const fgBody = dark ? "rgba(255,255,255,0.6)" : "#4B5563";
  const labelColor = dark ? "#FFD166" : accent;

  return (
    <section id={id} className="overflow-hidden scroll-mt-16" style={{ background: bg }}>
      <div className={`grid md:grid-cols-2 min-h-[520px]`} style={{ direction: flip ? "rtl" : "ltr" }}>
        {/* Image side */}
        <div className="relative h-72 md:h-auto overflow-hidden" style={{ direction: "ltr" }}>
          <img src={img} alt={headline}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {pills && (
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
              {pills.map(p => (
                <span key={p} className="text-xs text-white font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>{p}</span>
              ))}
            </div>
          )}
        </div>

        {/* Content side */}
        <div className="flex flex-col justify-center px-10 py-16" style={{ direction: "ltr" }}>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: labelColor }}>{label}</p>
          <h2 className="text-4xl font-extrabold leading-tight mb-5" style={{ fontFamily: DISPLAY, color: fgHeading }}>{headline}</h2>
          <div className="text-sm leading-relaxed mb-6" style={{ color: fgBody, fontFamily: BODY }}>{body}</div>
          {cta && (
            <Link to={cta.to}
              className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: accent }}>
              {cta.label} <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-extrabold text-white mb-1" style={{ fontFamily: DISPLAY }}>{value}</p>
      <p className="text-white/50 text-xs font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default function Services() {
  return (
    <div style={{ fontFamily: BODY }}>
      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden px-6 py-24"
        style={{ background: "linear-gradient(135deg, #1C1040 0%, #3D1B7A 60%, #5A2E9A 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-white/70 text-xs font-medium">Southampton · Free to access · For all families</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: DISPLAY }}>
            What we <span style={{ color: "#FFD166" }}>offer</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed mb-10">
            From borrowing toys to hiring equipment for a birthday party — we&apos;ve got play covered for every family in Southampton.
          </p>
          {/* Quick-jump pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {services.map(s => (
              <button key={s.id}
                onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-white/20 text-white/80 hover:bg-white/10 transition-all">
                <s.icon size={13} style={{ color: s.color }} />
                {s.label}
                <ChevronDown size={11} className="opacity-50" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS STRIP ══ */}
      <div className="py-10 px-6" style={{ background: C.purple }}>
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value="5" label="Services" />
          <Stat value="3×" label="Weekly sessions" />
          <Stat value="Free" label="Toy library access" />
          <Stat value="50+" label="Years serving Southampton" />
        </div>
      </div>

      {/* ══ SERVICE SECTIONS ══ */}
      <ServiceSection
        id="toy-libraries"
        label="Our most popular service"
        headline="Free Toy Libraries for every family"
        img="https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80"
        accent={C.red}
        dark={false}
        flip={false}
        pills={["Tue, Wed & Sat 10am–1pm", "Free membership", "3 toys per visit"]}
        cta={{ label: "Explore the Toy Library", to: "/toy-library" }}
        body={<>
          <p className="mb-3">Our Toy Library gives families with children under 14 years old the opportunity to borrow toys free of charge. There&apos;s no catch — just bring the kids along, pick your three toys, and enjoy them at home!</p>
          <p>We have a wide range of toys for all ages, from baby toys to games for older children. All toys are checked and cleaned regularly to ensure they&apos;re safe and in good condition.</p>
          <p className="mt-3 font-semibold text-gray-800">Swaythling Neighbourhood Centre, Broadlands Road, SO16 3LS</p>
        </>}
      />

      <ServiceSection
        id="playtime"
        label="Families with children under 5"
        headline="Playtime Sessions every week"
        img="https://images.unsplash.com/photo-1605627079912-97c3810a11a4?w=800&q=80"
        accent={C.purple}
        dark={true}
        flip={true}
        pills={["Tuesdays 10:30–11:30am", "Wednesdays 10:30–11:30am"]}
        cta={{ label: "View all sessions", to: "/contact" }}
        body={<>
          <p className="mb-3">Our weekly Playtime sessions are a fantastic opportunity for parents, carers, and children under 5 to socialise and play together in a relaxed environment.</p>
          <p>There&apos;s a fantastic selection of toys, activities, and equipment to keep little ones entertained. Babies and toddlers love it — and so do the grown-ups!</p>
          <p className="mt-3 font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Swaythling Neighbourhood Centre · Free to attend</p>
        </>}
      />

      <ServiceSection
        id="party-hire"
        label="Make it special"
        headline="Party Hire — everything you need"
        img="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80"
        accent="#5A9A6F"
        dark={false}
        flip={false}
        pills={["Soft play equipment", "Ride-on toys", "Garden games", "From £40"]}
        cta={{ label: "Check availability", to: "/contact" }}
        body={<>
          <p className="mb-3">Need to throw an epic birthday party without breaking the bank? Our party hire service lets you borrow a huge range of fun, safe play equipment at very affordable prices.</p>
          <p>From bouncy ride-ons to soft play mats, garden games to themed toys — we have everything you need to make your little one&apos;s day extra special.</p>
          <p className="mt-3 font-semibold text-gray-800">Get in touch to check availability and book your equipment today.</p>
        </>}
      />

      <ServiceSection
        id="toddler-groups"
        label="Your local community"
        headline="Toddler Groups we support"
        img="https://images.unsplash.com/photo-1560421683-6856ea585c78?w=800&q=80"
        accent={C.purple}
        dark={true}
        flip={true}
        pills={["Multiple locations", "Southampton-wide"]}
        cta={{ label: "Find a group near you", to: "/contact" }}
        body={<>
          <p className="mb-3">We work in partnership with a variety of toddler and parent groups across Southampton, helping them to provide great play opportunities for local families.</p>
          <p>Whether you run a small community group or a large children&apos;s centre, we can help supply toys, equipment, and expertise to keep your sessions running brilliantly.</p>
          <p className="mt-3 font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Contact us to find a group near you, or to partner with us.</p>
        </>}
      />

      <ServiceSection
        id="group-membership"
        label="For organisations"
        headline="Group Membership Scheme"
        img="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80"
        accent="#5A9A6F"
        dark={false}
        flip={false}
        pills={["Schools", "Early years settings", "Children's centres", "Community groups"]}
        cta={{ label: "Enquire about membership", to: "/contact" }}
        body={<>
          <p className="mb-3">Our Group Membership Scheme allows nurseries, schools, children&apos;s centres, and community groups to access our extensive toy library at an affordable annual subscription.</p>
          <p>Members can borrow larger quantities of toys and equipment, and gain access to our specialist resources. It&apos;s an excellent way to enrich your setting&apos;s resources without a huge budget.</p>
          <p className="mt-3 font-semibold text-gray-800">Annual fee · Flexible borrowing · Dedicated support</p>
        </>}
      />

      {/* ══ CTA BAND ══ */}
      <section className="py-20 px-6 text-center"
        style={{ background: "linear-gradient(135deg, #FF5A3C, #FF8C42)" }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/70">Ready to get started?</p>
        <h2 className="text-4xl font-extrabold text-white mb-4" style={{ fontFamily: DISPLAY }}>
          Join the Playlink community
        </h2>
        <p className="text-white/80 text-base max-w-md mx-auto mb-8">
          Membership is free and open to any family with children under 14. Come and see us at any of our open sessions — no appointment needed.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/toy-library"
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 bg-white"
            style={{ color: C.red }}>
            Visit the Toy Library
          </Link>
          <Link to="/contact"
            className="px-6 py-3 rounded-xl font-semibold text-sm border-2 border-white/40 text-white transition-all hover:bg-white/10">
            Get in touch
          </Link>
        </div>
      </section>

    </div>
  );
}
