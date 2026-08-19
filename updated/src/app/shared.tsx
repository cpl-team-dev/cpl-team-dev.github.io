import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router";
import {
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Rss,
  Clock,
  Building2,
  X,
  ArrowRight,
} from "lucide-react";
import logoImg from "@/imports/Community-Playlink-Logo-Retina-scaled.webp";

/* ─── brand colours ─── */
export const C = {
  purple:     "#6B3FA0",   // core brand purple
  darkPurple: "#1C1040",   // near-black deep purple for headings
  navPurple:  "#2D1760",   // darkest purple for nav bg
  skyBlue:    "#87BCE0",
  sageGreen:  "#5A9A6F",
  navy:       "#1D3A56",
  red:        "#FF5A3C",   // vibrant coral-red
  orange:     "#FF5A3C",
  btnBlue:    "#6B3FA0",
  btnOrange:  "#FF5A3C",
};

/* ─── icon helpers ─── */
export function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.81a8.26 8.26 0 0 0 4.83 1.55V6.91a4.85 4.85 0 0 1-1.06-.22z" />
    </svg>
  );
}

export function TwitterXIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ─── wave ─── */
export function Wave({ fromColor, toColor }: { fromColor: string; toColor: string }) {
  return (
    <div style={{ background: fromColor, lineHeight: 0 }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 80 }}>
        <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill={toColor} />
      </svg>
    </div>
  );
}

/* ─── nav ─── */
const aboutItems: { label: string; desc: string; to: string }[] = [
  { label: "Meet The Staff",        desc: "The people behind Playlink",     to: "/about#meet-the-staff" },
  { label: "Meet The Trustee Board", desc: "Our volunteer board",           to: "/about#meet-the-trustee-board" },
  { label: "Partners",              desc: "Organisations we work with",     to: "/about#partners" },
  { label: "Policies",              desc: "Governance & documents",         to: "/about#policies" },
];
const servicesItems: { label: string; desc: string; to: string }[] = [
  { label: "Toy Libraries",         desc: "Borrow toys free of charge",     to: "/services#toy-libraries" },
  { label: "Playtime Sessions",     desc: "Weekly drop-in for under-5s",    to: "/services#playtime" },
  { label: "Party Hire",            desc: "Equipment for birthdays & events", to: "/services#party-hire" },
  { label: "Toddler Groups",        desc: "Groups we support across the city", to: "/services#toddler-groups" },
  { label: "Group Membership",      desc: "For schools & early years settings", to: "/services#group-membership" },
];

/* ─── animated dropdown panel ─── */
function NavDropdown({
  items,
  visible,
  onMouseEnter,
  onMouseLeave,
}: {
  items: { label: string; desc: string; to: string }[];
  visible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: "50%",
        transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-6px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.18s ease, transform 0.18s ease",
        zIndex: 100,
        minWidth: 260,
        background: "rgba(20, 10, 48, 0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
        padding: "6px",
        overflow: "hidden",
      }}
    >
      {/* top accent bar */}
      <div style={{ height: 2, background: "linear-gradient(90deg, #FF5A3C, #E83060)", borderRadius: "8px 8px 0 0", marginBottom: 6 }} />
      {items.map(({ label, desc, to }) => (
        <Link
          key={to}
          to={to}
          style={{ display: "flex", flexDirection: "column", gap: 1, padding: "9px 14px", borderRadius: 8, transition: "background 0.15s" }}
          className="group hover:bg-white/10"
        >
          <span style={{ color: "rgba(255,255,255,0.92)", fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{label}</span>
          <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>{desc}</span>
        </Link>
      ))}
    </div>
  );
}

/* ─── mobile full-screen menu ─── */
function MobileMenu({ open: isOpen, onClose }: { open: boolean; onClose: () => void }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const DISPLAY = "'Bricolage Grotesque', 'Inter', sans-serif";

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const toggle = (s: string) => setExpandedSection(p => p === s ? null : s);

  const topLinks = [
    { label: "Home",         to: "/" },
    { label: "Noticeboard",  to: "/noticeboard" },
    { label: "Toy Library",  to: "/toy-library" },
    { label: "Contact",      to: "/contact" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 90,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Panel — slides in from the right */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 100,
          width: "min(360px, 92vw)",
          background: "linear-gradient(160deg, #1C1040 0%, #2D1760 60%, #3D1B7A 100%)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease",
          display: "flex", flexDirection: "column",
          boxShadow: isOpen ? "-20px 0 60px rgba(0,0,0,0.5)" : "none",
          overflowY: "auto",
        }}
      >
        {/* Dot texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Header row */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4"
          style={{
            background: "#7a57be",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}>
          <Link to="/" onClick={onClose}>
            <img src={logoImg} alt="Community Playlink" className="h-12 w-auto object-contain"/>
          </Link>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.6)" }}>
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="relative z-10 flex flex-col px-4 py-4 gap-1 flex-1">
          {topLinks.map(({ label, to }) => (
            <Link key={to} to={to} onClick={onClose}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-white font-semibold transition-all hover:bg-white/8"
              style={{ fontFamily: DISPLAY, fontSize: 18 }}>
              {label}
              <ArrowRight size={15} className="text-white/25" />
            </Link>
          ))}

          {/* About accordion */}
          <div>
            <button onClick={() => toggle("about")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white font-semibold transition-all hover:bg-white/8"
              style={{ fontFamily: DISPLAY, fontSize: 18 }}>
              <Link to="/about" onClick={onClose} className="flex-1 text-left" style={{ fontSize: 18 }}>About</Link>
              <ChevronDown size={16} className={`text-white/40 transition-transform duration-200 ${expandedSection === "about" ? "rotate-180" : ""}`} />
            </button>
            <div style={{
              maxHeight: expandedSection === "about" ? 400 : 0,
              overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}>
              <div className="ml-4 pl-4 pb-2 flex flex-col gap-0.5"
                style={{ borderLeft: "2px solid rgba(107,63,160,0.4)" }}>
                {aboutItems.map(({ label, desc, to }) => (
                  <Link key={to} to={to} onClick={onClose}
                    className="flex flex-col px-3 py-2.5 rounded-lg transition-all hover:bg-white/8">
                    <span className="text-white text-sm font-semibold">{label}</span>
                    <span className="text-white/40 text-xs mt-0.5">{desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Services accordion */}
          <div>
            <button onClick={() => toggle("services")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white font-semibold transition-all hover:bg-white/8"
              style={{ fontFamily: DISPLAY, fontSize: 18 }}>
              <Link to="/services" onClick={onClose} className="flex-1 text-left" style={{ fontSize: 18 }}>Services</Link>
              <ChevronDown size={16} className={`text-white/40 transition-transform duration-200 ${expandedSection === "services" ? "rotate-180" : ""}`} />
            </button>
            <div style={{
              maxHeight: expandedSection === "services" ? 400 : 0,
              overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}>
              <div className="ml-4 pl-4 pb-2 flex flex-col gap-0.5"
                style={{ borderLeft: "2px solid rgba(107,63,160,0.4)" }}>
                {servicesItems.map(({ label, desc, to }) => (
                  <Link key={to} to={to} onClick={onClose}
                    className="flex flex-col px-3 py-2.5 rounded-lg transition-all hover:bg-white/8">
                    <span className="text-white text-sm font-semibold">{label}</span>
                    <span className="text-white/40 text-xs mt-0.5">{desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Footer area */}
        <div className="relative z-10 px-6 py-6 flex flex-col gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link to="/support-us" onClick={onClose}
            className="btn-coral w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-base transition-all hover:opacity-90">
            Support Us <ArrowRight size={16} />
          </Link>
          <div className="flex justify-center gap-3">
            {([
              [Facebook, "Facebook"],
              [Instagram, "Instagram"],
              [Youtube, "YouTube"],
              [Rss, "RSS"],
            ] as [React.ComponentType<{ size: number }>, string][]).map(([Icon, label]) => (
              <a key={label} href="#" aria-label={label}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all">
                <Icon size={16} />
              </a>
            ))}
            <a href="#" aria-label="TikTok" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all">
              <TikTokIcon className="w-4 h-4" />
            </a>
            <a href="#" aria-label="X / Twitter" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all">
              <TwitterXIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export function Nav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const open = (name: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpenMenu(name);
  };
  const close = () => { leaveTimer.current = setTimeout(() => setOpenMenu(null), 150); };
  const cancelClose = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); };

  const navLink = "text-white/85 hover:text-white text-sm font-semibold px-3 py-2.5 rounded-md hover:bg-white/10 transition-all";

  return (
    <>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <nav
        className="px-4 relative z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(29,16,64,0.96)" : C.navPurple,
          backdropFilter: scrolled ? "blur(12px)" : undefined,
          WebkitBackdropFilter: scrolled ? "blur(12px)" : undefined,
          position: scrolled ? "fixed" : "sticky",
          top: 0, left: 0, right: 0,
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.25)" : undefined,
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-1 py-1">
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            <NavLink to="/" className={() => navLink}>Home</NavLink>

            <div className="relative" onMouseEnter={() => open("about")} onMouseLeave={close}>
              <div className={`flex items-center ${navLink}`}>
                <Link to="/about" className="flex items-center gap-1">About</Link>
                <ChevronDown size={13} className={`ml-1 transition-transform duration-200 ${openMenu === "about" ? "rotate-180" : ""}`} />
              </div>
              <NavDropdown items={aboutItems} visible={openMenu === "about"} onMouseEnter={cancelClose} onMouseLeave={close} />
            </div>

            <div className="relative" onMouseEnter={() => open("services")} onMouseLeave={close}>
              <div className={`flex items-center ${navLink}`}>
                <Link to="/services" className="flex items-center gap-1">Services</Link>
                <ChevronDown size={13} className={`ml-1 transition-transform duration-200 ${openMenu === "services" ? "rotate-180" : ""}`} />
              </div>
              <NavDropdown items={servicesItems} visible={openMenu === "services"} onMouseEnter={cancelClose} onMouseLeave={close} />
            </div>

            <Link to="/noticeboard" className={navLink}>Noticeboard</Link>
            <Link to="/toy-library" className={navLink}>Toy Library</Link>
            <Link to="/contact" className={navLink}>Contact</Link>
          </div>

          {/* Desktop Support Us */}
          <Link to="/support-us"
            className="btn-coral hidden md:flex ml-3 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95 shrink-0">
            Support Us
          </Link>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-xl hover:bg-white/10 transition-all ml-auto"
            aria-label="Open menu"
          >
            <span className="block w-5 h-0.5 bg-white rounded-full transition-all" />
            <span className="block w-5 h-0.5 bg-white rounded-full transition-all" />
            <span className="block w-3.5 h-0.5 bg-white/60 rounded-full transition-all" />
          </button>
        </div>
      </nav>
    </>
  );
}

/* ─── header ─── */
export function SiteHeader() {
  const openDays = [
    { short: "Tue", label: "Tuesday",   hours: "10am – 1pm", jsDay: 2 },
    { short: "Wed", label: "Wednesday", hours: "10am – 1pm", jsDay: 3 },
    { short: "Sat", label: "Saturday",  hours: "10am – 1pm", jsDay: 6 },
  ];
  const todayIdx = new Date().getDay();
  const nowHour  = new Date().getHours();
  const isOpenToday    = openDays.some(d => d.jsDay === todayIdx);
  const isCurrentlyOpen = isOpenToday && nowHour >= 10 && nowHour < 13;

  return (
    <>
      {/* Live opening hours bar */}
      <div style={{ background: C.darkPurple, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Status pill */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shrink-0 font-bold ${isCurrentlyOpen ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/60"}`}
            style={{ fontSize: 14 }}>
            <Building2 size={15} className="shrink-0" />
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isCurrentlyOpen ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
            {isCurrentlyOpen ? "Open now" : isOpenToday ? "Closed — opens 10am" : "Closed today"}
          </div>

          <span className="hidden sm:block w-px h-5 bg-white/15 shrink-0" />

          {/* Days */}
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            {openDays.map(({ short, hours, jsDay }) => {
              const isToday = jsDay === todayIdx;
              return (
                <div key={short} className="flex items-center gap-2.5">
                  <Clock size={14} className={isToday ? "text-yellow-300" : "text-white/30"} />
                  <span className="font-bold" style={{ fontSize: 15, color: isToday ? "#FFD166" : "rgba(255,255,255,0.45)" }}>{short}</span>
                  <span className="font-semibold" style={{ fontSize: 15, color: isToday ? "#fff" : "rgba(255,255,255,0.6)" }}>{hours}</span>
                </div>
              );
            })}
          </div>

          {/* Find us CTA */}
          <a
            href="#find-us"
            onClick={e => {
              const el = document.getElementById("find-us");
              if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
            }}
            className="ml-auto shrink-0 hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all hover:bg-white/10"
            style={{ color: "#FFD166", fontSize: 14 }}>
            <MapPin size={14} /> Find us
          </a>
        </div>
      </div>

      {/* Main header — logo only, centred */}
      <header style={{ background: "#7a57be" }} className="px-6 py-2 flex justify-center">
        <Link to="/">
          <img
            src={logoImg}
            alt="Community Playlink"
            className="h-36 w-auto object-contain"
          />
        </Link>
      </header>
    </>
  );
}

/* ─── shared footer ─── */
export function TestimonialsSection() { return null; }

export function SiteFooter() {
  return (
    <>
      {/* Join Us */}
      <section id="find-us" style={{ background: C.darkPurple }} className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 items-start">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#FFD166" }}>Come and visit us</p>
                <h2 className="text-4xl font-extrabold text-white leading-tight" style={{ fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif" }}>
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
                    <Phone size={15} className="text-white/70" />
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
            {/* Map */}
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

      {/* CTA Band */}
      <section className="relative overflow-hidden px-6 py-14"
        style={{ background: "linear-gradient(90deg, #FF5A3C 0%, #E83060 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white leading-tight" style={{ fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif" }}>
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
            <Link to="/support-us"
              className="px-6 py-3 rounded-xl border-2 border-white/40 font-semibold text-sm text-white hover:bg-white/10 transition-all">
              Volunteer
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}

/* ─── carousel (used on home) ─── */
const carouselImages = [
  "https://images.unsplash.com/photo-1630476504743-a4d342f88760?w=600&q=80",
  "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=600&q=80",
  "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80",
  "https://images.unsplash.com/photo-1605627079912-97c3810a11a4?w=600&q=80",
];

export function Carousel() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + carouselImages.length) % carouselImages.length);
  const next = () => setIdx((i) => (i + 1) % carouselImages.length);
  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg bg-white">
      <img src={carouselImages[idx]} alt="Community Playlink activities" className="w-full h-64 object-cover" />
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow">
        <ChevronRight size={20} />
      </button>
      <div className="flex justify-center gap-1.5 py-2">
        {carouselImages.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`rounded-full transition-all ${i === idx ? "w-6 h-2.5 bg-gray-600" : "w-2.5 h-2.5 bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
