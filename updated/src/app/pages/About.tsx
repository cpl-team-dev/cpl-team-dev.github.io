import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Mail, Phone, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { C } from "../shared";

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
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
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

/* ─── modern person card ─── */
function PersonCard({ img, name, role }: { img: string; name: string; role: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gray-900" style={{ aspectRatio: "3/4" }}>
      <img src={img} alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-white font-bold text-base leading-tight" style={{ fontFamily: DISPLAY }}>{name}</p>
        <p className="text-white/60 text-xs mt-0.5">{role}</p>
        <a href="#" className="inline-flex items-center gap-1 text-xs font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "#FFD166" }}>
          Read more <ArrowRight size={12} />
        </a>
      </div>
    </div>
  );
}

/* ─── FAQ accordion with smooth animation ─── */
function FaqItem({ q, a, defaultOpen = false }: { q: string; a: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b last:border-0" style={{ borderColor: "rgba(107,63,160,0.15)" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left font-semibold text-gray-900 hover:text-purple-700 transition-colors gap-4"
        style={{ fontFamily: DISPLAY }}>
        <span>{q}</span>
        <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{ background: open ? C.purple : "#EDE8F7", color: open ? "#fff" : C.purple }}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-64 pb-5" : "max-h-0"}`}>
        <div className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: BODY }}>{a}</div>
      </div>
    </div>
  );
}

/* ─── data ─── */
const staff = [
  { img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80", name: "Elaine Buckland",    role: "Senior Toy Librarian" },
  { img: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&q=80", name: "Jo Snape",           role: "Play Development Officer" },
  { img: "https://images.unsplash.com/photo-1758691737605-69a0e78bd193?w=400&q=80", name: "Joyce Hamilton-Dyer", role: "Assistant Toy Librarian" },
];

const trustees = [
  { img: "https://images.unsplash.com/photo-1714976693236-6d4783342e94?w=400&q=80", name: "Dot Capes",      role: "Secretary" },
  { img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80", name: "Emma Barrett",   role: "Trustee" },
  { img: "https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?w=400&q=80", name: "John McGibbon",  role: "Vice Chair" },
  { img: "https://images.unsplash.com/photo-1758691737605-69a0e78bd193?w=400&q=80", name: "Lorraine Pugh",  role: "Trustee" },
  { img: "https://images.unsplash.com/photo-1600878459138-e1123b37cb30?w=400&q=80", name: "Ralph Crump",    role: "Honorary Treasurer" },
  { img: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&q=80", name: "Richard Maunder", role: "Chair" },
  { img: "https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?w=400&q=80", name: "Terry Pugh",     role: "Trustee" },
];

const aims = [
  "To advance the education of children and their carers, by providing or assisting in the provision of facilities and activities for individuals and group play in which parents, guardians and carers can participate when appropriate;",
  "To advance the education of parents and carers in the better care and upbringing of children and promote the significance of play in allowing children to learn and develop across such a broad range of developmental areas;",
  "To promote the preservation and protection of health of such children, their carers and expectant parents.",
];

const policies = ["Safeguarding Policy", "Privacy Policy", "Equal Opportunities Policy", "Health & Safety Policy", "Complaints Procedure"];

/* ─── section label ─── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.purple }}>{children}</p>
  );
}

export default function About() {
  return (
    <div style={{ fontFamily: BODY }}>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden px-6 py-24"
        style={{ background: "linear-gradient(135deg, #1C1040 0%, #3D1B7A 60%, #5A2E9A 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-white/70 text-xs font-medium">Est. 1974 · Southampton · Registered Charity No. 1184505</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: DISPLAY }}>
            About<br /><span style={{ color: "#FFD166" }}>Community Playlink</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
            A small charity with a big mission — making play free and accessible for every child in Southampton since 1974.
          </p>
        </div>
      </section>

      {/* ══ WHO WE ARE + STATS ══ */}
      <section className="py-20 px-6" style={{ background: "#F7F5FB" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1.4fr_1fr] gap-12 items-start">
          <div>
            <Label>Who we are</Label>
            <h2 className="text-4xl font-extrabold leading-tight mb-6" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>
              Free play for every child, every family.
            </h2>
            <div className="flex flex-col gap-4 text-gray-600 text-base leading-relaxed">
              <p>Community Playlink is a registered charity operating free <Link to="/toy-library" style={{ color: C.red }} className="underline underline-offset-2 hover:no-underline">toy libraries</Link> for families with children under 14 years old. We also support toddler groups and early years settings in Southampton and the surrounding areas.</p>
              <p>We run weekly <Link to="/services#playtime" style={{ color: C.red }} className="underline underline-offset-2 hover:no-underline">playtime sessions</Link> for families with children under 5 — come and join in these fun sessions at Swaythling Neighbourhood Centre!</p>
              <p>We work in partnership with many organisations to further our aims, relying on funding from grants, individuals and community activities.</p>
            </div>
            <div className="flex gap-3 mt-8">
              <Link to="/contact"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: C.purple }}>
                Get in touch <ArrowRight size={15} />
              </Link>
              <Link to="/support-us"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:bg-purple-50"
                style={{ borderColor: C.purple, color: C.purple }}>
                Support us
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Animated stat */}
            <div className="rounded-2xl p-8 text-center" style={{ background: C.darkPurple }}>
              <p className="text-6xl font-extrabold text-white mb-1" style={{ fontFamily: DISPLAY }}>
                <Counter target={47617} />
              </p>
              <p className="text-white/50 text-sm font-medium">visitors in the last year</p>
            </div>

            {/* Quote */}
            <div className="rounded-2xl p-6 border-l-4 bg-white" style={{ borderColor: C.purple }}>
              <p className="text-gray-600 text-sm italic leading-relaxed">
                &ldquo;Without the Toy Library, my children would have led a much poorer life. They learnt to walk using the push-along walkers. Their imagination has been enriched by all the role play. Thank You!&rdquo;
              </p>
              <p className="text-xs font-semibold mt-3" style={{ color: C.purple }}>— Community Playlink member</p>
            </div>

            {/* Contact mini */}
            <div className="bg-white rounded-2xl p-6 flex flex-col gap-3">
              <p className="text-sm font-bold text-gray-800">Get in touch</p>
              <a href="mailto:CPLTeam@community-playlink.com" style={{ color: C.red }}
                className="flex items-center gap-2 text-sm hover:underline underline-offset-2">
                <Mail size={15} className="shrink-0" /> CPLTeam@community-playlink.com
              </a>
              <a href="tel:02380335362" style={{ color: C.red }}
                className="flex items-center gap-2 text-sm hover:underline underline-offset-2">
                <Phone size={15} className="shrink-0" /> 02380 335362
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ OUR AIMS ══ */}
      <section className="py-20 px-6" style={{ background: C.darkPurple }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#FFD166" }}>What we stand for</p>
            <h2 className="text-4xl font-extrabold text-white" style={{ fontFamily: DISPLAY }}>Our aims</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {aims.map((aim, i) => (
              <div key={i} className="rounded-2xl p-7 flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-extrabold shrink-0"
                  style={{ background: C.purple, color: "#FFD166", fontFamily: DISPLAY }}>
                  {i + 1}
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{aim}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <a href="#" className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-all">
              <FileText size={16} /> Our Constitution
            </a>
          </div>
        </div>
      </section>

      {/* ══ STAFF ══ */}
      <section id="meet-the-staff" className="py-20 px-6" style={{ background: "#F7F5FB", scrollMarginTop: "4rem" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <Label>The team</Label>
              <h2 className="text-4xl font-extrabold" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>Meet the staff</h2>
            </div>
            <p className="text-gray-500 text-sm max-w-xs text-right">Our small but dedicated team are passionate about making play accessible to all.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {staff.map(p => <PersonCard key={p.name} {...p} />)}
          </div>
        </div>
      </section>

      {/* ══ TRUSTEES ══ */}
      <section id="meet-the-trustee-board" className="py-20 px-6" style={{ background: C.darkPurple, scrollMarginTop: "4rem" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#FFD166" }}>Governance</p>
            <h2 className="text-4xl font-extrabold text-white" style={{ fontFamily: DISPLAY }}>Meet the Trustee Board</h2>
            <p className="text-white/50 text-sm mt-2 max-w-md">Our volunteers keep Community Playlink running — managing finances, applying for grants, and much more.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {trustees.map(p => (
              <div key={p.name} className="group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <img src={p.img} alt={p.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-purple-400 transition-all" />
                <div className="text-center">
                  <p className="text-white text-sm font-semibold leading-tight">{p.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ NEWS ══ */}
      <section className="py-20 px-6" style={{ background: "#F7F5FB" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <Label>Latest updates</Label>
              <h2 className="text-4xl font-extrabold" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>Staff &amp; Trustee news</h2>
            </div>
            <Link to="/noticeboard" className="flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all" style={{ color: C.purple }}>
              All news <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[{
              date: "30 September 2024",
              title: "September 2024 Update",
              excerpt: "This month, Elaine and Jo took part in training with other practitioners in Southampton, as part of the Peep Learning Together Programme — helping parents and carers make the most of everyday learning opportunities.",
              img: "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=500&q=80",
            }, {
              date: "1 February 2024",
              title: "Welcome to our new Assistant Toy Librarian!",
              excerpt: "Our new Assistant Toy Librarian, Joyce Hamilton-Dyer, has joined the Community Playlink family. You can pop in to meet her on Thursdays and Saturdays — she's been a member herself for four years!",
              img: "https://images.unsplash.com/photo-1758691737605-69a0e78bd193?w=500&q=80",
            }].map(a => (
              <div key={a.title} className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                <div className="h-48 overflow-hidden">
                  <img src={a.img} alt={a.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <span className="text-xs font-bold tracking-wide uppercase" style={{ color: C.purple }}>{a.date}</span>
                  <h3 className="font-extrabold text-gray-900 leading-snug" style={{ fontFamily: DISPLAY }}>{a.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{a.excerpt}</p>
                  <a href="#" className="flex items-center gap-1 text-sm font-semibold mt-1 hover:gap-2 transition-all" style={{ color: C.red }}>
                    Continue reading <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARTNERS ══ */}
      <section id="partners" className="py-16 px-6" style={{ background: C.darkPurple, scrollMarginTop: "4rem" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#FFD166" }}>Working together</p>
          <h2 className="text-3xl font-extrabold text-white mb-4" style={{ fontFamily: DISPLAY }}>Our Partners</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xl mx-auto">
            Community Playlink works in partnership with a wide range of local organisations, charities, and statutory bodies across Southampton. We&apos;re grateful for every collaboration that helps us reach more families.
          </p>
        </div>
      </section>

      {/* ══ POLICIES ══ */}
      <section id="policies" className="py-16 px-6" style={{ background: "#F7F5FB", scrollMarginTop: "4rem" }}>
        <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_1.5fr] gap-12 items-start">
          <div>
            <Label>Governance</Label>
            <h2 className="text-3xl font-extrabold" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>Policies &amp; Documents</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {policies.map(p => (
              <a key={p} href="#"
                className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-transparent hover:border-purple-200 hover:shadow-sm transition-all">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                  style={{ background: "#EDE8F7" }}>
                  <FileText size={16} style={{ color: C.purple }} />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">{p}</span>
                <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-purple-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-20 px-6" style={{ background: "#1C1040" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#FFD166" }}>Got questions?</p>
            <h2 className="text-4xl font-extrabold text-white" style={{ fontFamily: DISPLAY }}>Frequently asked questions</h2>
            <p className="text-white/50 text-sm mt-3">
              Can&apos;t find what you&apos;re looking for?{" "}
              <Link to="/contact" style={{ color: "#FFD166" }} className="hover:underline">Get in touch →</Link>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6">
            <FaqItem q="How are you funded?" defaultOpen
              a={<>We are a Registered Charity (number 1184505). We are funded entirely by our <a href="#" style={{ color: C.red }} className="underline">partners</a> and <a href="#" style={{ color: C.red }} className="underline">your donations</a>.</>} />
            <FaqItem q="Is it really free?" defaultOpen
              a={<>Borrowing toys from our Toy Library is free, as is attending our Playtime sessions. We do charge groups through our <a href="#" style={{ color: C.red }} className="underline">Group Membership Scheme</a>, and also charge for <a href="#" style={{ color: C.red }} className="underline">Party Hire</a>.</>} />
            <FaqItem q="Who can use the Toy Library?"
              a="The Toy Library is open to any family with children under 14 years of age living in the Southampton area." />
            <FaqItem q="Do I need to be a member?"
              a="Yes, membership is required to borrow toys. Membership is free and you can sign up at any of our opening sessions." />
            <FaqItem q="How many toys can I borrow at once?"
              a="Members can borrow up to 3 toys at a time for a period of 3 weeks." />
          </div>
        </div>
      </section>

    </div>
  );
}
