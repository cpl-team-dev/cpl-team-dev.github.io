import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, ChevronLeft, ChevronRight, Package, ZoomIn } from "lucide-react";
import { Link } from "react-router";
import { C } from "../shared";

const DISPLAY = "'Bricolage Grotesque', 'Inter', sans-serif";
const BODY    = "'Inter', sans-serif";

/* ─── data ─── */
interface Toy {
  id: number;
  name: string;
  category: string;
  img?: string;
}

const toys: Toy[] = [
  { id: 1,  name: "1 2 3 Jigsaw + Book",           category: "Puzzles",        img: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&q=80" },
  { id: 2,  name: "100 Words Book",                 category: "Toddler",        img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80" },
  { id: 3,  name: "100 Words Electronic Book",      category: "Toddler" },
  { id: 4,  name: "Alphabet Puzzle",                category: "Puzzles",        img: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80" },
  { id: 5,  name: "Baby Bouncer",                   category: "Baby",           img: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80" },
  { id: 6,  name: "Baby Gym",                       category: "Baby" },
  { id: 7,  name: "Ball Pool",                      category: "Outdoor",        img: "https://images.unsplash.com/photo-1520989602471-7c90c1f8a0a0?w=600&q=80" },
  { id: 8,  name: "Bead Maze",                      category: "Toddler",        img: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80" },
  { id: 9,  name: "Building Blocks (Large)",        category: "Construction",   img: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80" },
  { id: 10, name: "Connect Four",                   category: "Games",          img: "https://images.unsplash.com/photo-1611329857570-f02f340e7378?w=600&q=80" },
  { id: 11, name: "Doctor's Kit",                   category: "Role Play",      img: "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=600&q=80" },
  { id: 12, name: "Drawing Board (Magnetic)",       category: "Creative Play",  img: "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=600&q=80" },
  { id: 13, name: "Duplo Set (Large)",              category: "Construction",   img: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80" },
  { id: 14, name: "Farm Animal Set",                category: "Role Play",      img: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&q=80" },
  { id: 15, name: "Football",                       category: "Sports",         img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80" },
  { id: 16, name: "Giant Floor Puzzle (Animals)",   category: "Puzzles",        img: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80" },
  { id: 17, name: "Hopscotch Mat",                  category: "Outdoor" },
  { id: 18, name: "Kitchen Play Set",               category: "Role Play",      img: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=600&q=80" },
  { id: 19, name: "Lacing Beads",                   category: "Toddler",        img: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80" },
  { id: 20, name: "Magnifying Glass & Bug Set",     category: "Science",        img: "https://images.unsplash.com/photo-1532094349884-543559371e35?w=600&q=80" },
  { id: 21, name: "Musical Instruments Set",        category: "Creative Play",  img: "https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=600&q=80" },
  { id: 22, name: "Push Along Walker",              category: "Baby",           img: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80" },
  { id: 23, name: "Shape Sorter",                   category: "Baby",           img: "https://images.unsplash.com/photo-1600821986515-3ef5b0f29f39?w=600&q=80" },
  { id: 24, name: "Skittles Set",                   category: "Sports" },
  { id: 25, name: "Stacking Rings",                 category: "Baby",           img: "https://images.unsplash.com/photo-1600821986515-3ef5b0f29f39?w=600&q=80" },
  { id: 26, name: "Tool Bench",                     category: "Construction",   img: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80" },
  { id: 27, name: "Toy Car Garage",                 category: "Role Play",      img: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&q=80" },
  { id: 28, name: "Train Set (Wooden)",             category: "Construction",   img: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80" },
  { id: 29, name: "Tricycle",                       category: "Outdoor",        img: "https://images.unsplash.com/photo-1593103916129-87e179a70c1f?w=600&q=80" },
  { id: 30, name: "Water Play Table",               category: "Outdoor",        img: "https://images.unsplash.com/photo-1520989602471-7c90c1f8a0a0?w=600&q=80" },
];

/* Assign a height tier to each card for a staggered-height masonry feel */
const heights = [180, 220, 200, 240, 180, 200, 220, 180, 240, 200];
const getHeight = (id: number) => heights[(id - 1) % heights.length];

const categories = ["All", ...Array.from(new Set(toys.map(t => t.category))).sort()];

/* ─── lightbox ─── */
function Lightbox({ toys, index, onClose, onPrev, onNext }: {
  toys: Toy[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const toy = toys[index];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,4,28,0.92)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.2s ease both",
      }}
    >
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "min(680px, 92vw)",
          width: "100%",
          borderRadius: 24,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
        }}
      >
        {/* Image */}
        {toy.img ? (
          <img src={toy.img} alt={toy.name}
            style={{ width: "100%", height: "min(480px, 60vh)", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{
            width: "100%", height: 320,
            background: "linear-gradient(135deg, #EDE8F7, #D8CFF0)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Package size={56} style={{ color: C.purple, opacity: 0.3 }} />
          </div>
        )}

        {/* Info strip */}
        <div style={{ padding: "20px 24px 24px", background: "#fff" }}>
          <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: C.purple }}>
            {toy.category}
          </p>
          <h2 className="text-2xl font-extrabold" style={{ fontFamily: DISPLAY, color: C.darkPurple }}>
            {toy.name}
          </h2>
          <p className="text-sm mt-2" style={{ color: "#6B7280" }}>
            Available to borrow free of charge · Members may take up to 3 toys per visit
          </p>
          <div className="flex gap-2 mt-4">
            <span className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: "rgba(107,63,160,0.1)", color: C.purple }}>
              Free to borrow
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: "rgba(107,63,160,0.1)", color: C.purple }}>
              {toy.category}
            </span>
          </div>
        </div>

        {/* Close */}
        <button onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12,
            width: 36, height: 36, borderRadius: 18,
            background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
          <X size={16} />
        </button>

        {/* Counter */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(0,0,0,0.45)", borderRadius: 20,
          padding: "4px 10px", color: "#fff", fontSize: 11, fontWeight: 600,
        }}>
          {index + 1} / {toys.length}
        </div>
      </div>

      {/* Prev / Next arrows */}
      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); onPrev(); }}
          style={{
            position: "fixed", left: 16, top: "50%", transform: "translateY(-50%)",
            width: 44, height: 44, borderRadius: 22,
            background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
          <ChevronLeft size={22} />
        </button>
      )}
      {index < toys.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onNext(); }}
          style={{
            position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
            width: 44, height: 44, borderRadius: 22,
            background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
}

/* ─── toy card ─── */
function ToyCard({ toy, allToys, rank }: { toy: Toy; allToys: Toy[]; rank: number }) {
  const [hovering, setHovering] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const imgH = getHeight(rank + 1);

  const openLightbox = () => {
    const idx = allToys.findIndex(t => t.id === toy.id);
    setLbIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <>
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: hovering
            ? "0 16px 48px rgba(107,63,160,0.18)"
            : "0 2px 12px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.25s ease, transform 0.25s ease",
          transform: hovering ? "translateY(-3px)" : "none",
          cursor: "default",
        }}
      >
        {/* Image area */}
        <div
          style={{ position: "relative", height: imgH, overflow: "hidden", cursor: toy.img ? "zoom-in" : "default" }}
          onClick={toy.img ? openLightbox : undefined}
        >
          {toy.img ? (
            <>
              <img
                src={toy.img}
                alt={toy.name}
                style={{
                  width: "100%", height: "100%", objectFit: "cover", display: "block",
                  transition: "transform 0.5s ease",
                  transform: hovering ? "scale(1.06)" : "scale(1)",
                }}
              />
              {/* Hover overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(107,63,160,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: hovering ? 1 : 0,
                transition: "opacity 0.25s ease",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 22,
                  background: "rgba(255,255,255,0.95)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: hovering ? "scale(1)" : "scale(0.7)",
                  transition: "transform 0.25s ease",
                }}>
                  <ZoomIn size={18} style={{ color: C.purple }} />
                </div>
              </div>
            </>
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: "linear-gradient(135deg, #EDE8F7 0%, #D8CFF0 100%)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Package size={28} style={{ color: C.purple, opacity: 0.3 }} />
              <span style={{ fontSize: 10, color: C.purple, opacity: 0.4, fontWeight: 600, letterSpacing: "0.08em" }}>
                NO PHOTO YET
              </span>
            </div>
          )}
        </div>

        {/* Label */}
        <div style={{ padding: "12px 14px 14px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.purple, marginBottom: 4 }}>
            {toy.category}
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.darkPurple, lineHeight: 1.35, fontFamily: DISPLAY }}>
            {toy.name}
          </p>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          toys={allToys}
          index={lbIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLbIndex(i => Math.max(0, i - 1))}
          onNext={() => setLbIndex(i => Math.min(allToys.length - 1, i + 1))}
        />
      )}
    </>
  );
}

/* ─── skeleton card ─── */
const skeletonHeights = [180, 220, 200, 240, 180, 200, 220, 180, 240, 200, 220, 180, 200, 240, 180];

function SkeletonCard({ index }: { index: number }) {
  const imgH = skeletonHeights[index % skeletonHeights.length];
  return (
    <div className="animate-pulse" style={{ background: "#fff", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ height: imgH, background: "linear-gradient(110deg, #EDE8F7 30%, #DDD5F0 50%, #EDE8F7 70%)",
        backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite linear" }} />
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ height: 10, width: "40%", borderRadius: 6, background: "#EDE8F7" }} />
        <div style={{ height: 13, width: "75%", borderRadius: 6, background: "#F3F0FA" }} />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div style={{ columns: "var(--cols, 2)", columnGap: 16 }}
      className="[--cols:2] sm:[--cols:3] md:[--cols:4] lg:[--cols:5]">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} style={{ breakInside: "avoid", marginBottom: 16 }}>
          <SkeletonCard index={i} />
        </div>
      ))}
    </div>
  );
}

/* ─── page ─── */
export default function ToyLibrary() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shadowLeft, setShadowLeft] = useState(false);
  const [shadowRight, setShadowRight] = useState(true);

  const updateShadows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShadowLeft(el.scrollLeft > 4);
    setShadowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateShadows();
  }, [activeCategory]);

  const filtered = useMemo(() => toys.filter(t =>
    (activeCategory === "All" || t.category === activeCategory) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  ), [activeCategory, search]);

  return (
    <div style={{ fontFamily: BODY }}>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden px-6 py-24"
        style={{ background: "linear-gradient(135deg, #1C1040 0%, #3D1B7A 60%, #5A2E9A 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-white/70 text-xs font-medium">Free to borrow · Up to 3 toys per visit</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-4"
            style={{ fontFamily: DISPLAY }}>
            Toy <span style={{ color: "#FFD166" }}>Library</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Browse our collection of toys available to borrow free of charge. Click any toy to see more.
          </p>
        </div>
      </section>

      {/* ══ CATEGORY FILTER BAR ══ */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EDE8F7", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="max-w-6xl mx-auto flex items-stretch" style={{ minHeight: 52 }}>

          {/* Pinned active category */}
          <div className="flex items-center px-5 shrink-0"
            style={{ borderRight: "1px solid #EDE8F7" }}>
            <button className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold"
              style={{ background: C.darkPurple, color: "#fff" }}>
              {activeCategory}
            </button>
          </div>

          {/* Scrollable remaining categories — with dynamic shadows */}
          <div className="relative flex-1 overflow-hidden">
            {/* Left shadow */}
            <div className="absolute left-0 top-0 bottom-0 w-10 pointer-events-none z-10 transition-opacity duration-200"
              style={{
                background: "linear-gradient(to right, rgba(255,255,255,1), transparent)",
                opacity: shadowLeft ? 1 : 0,
              }} />
            {/* Right shadow */}
            <div className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none z-10 transition-opacity duration-200"
              style={{
                background: "linear-gradient(to left, rgba(255,255,255,1), transparent)",
                opacity: shadowRight ? 1 : 0,
              }} />
            <div
              ref={scrollRef}
              onScroll={updateShadows}
              className="flex items-center gap-2 px-4 h-full overflow-x-auto"
              style={{ scrollbarWidth: "none" }}>
              {categories.filter(c => c !== activeCategory).map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0"
                  style={{ background: "#F3F0FA", color: C.darkPurple }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ══ GRID ══ */}
      <section className="py-12 px-6" style={{ background: "#F7F5FB" }}>
        <div className="max-w-6xl mx-auto">

          {/* Search + count row */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <Search
                  size={16}
                  className="search-pulse absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: C.purple }}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search toys…"
                  className="w-full pl-10 pr-8 py-3 rounded-2xl text-sm outline-none transition-all"
                  style={{
                    background: "#fff",
                    border: "1.5px solid rgba(107,63,160,0.25)",
                    color: C.darkPurple,
                    boxShadow: "0 4px 24px rgba(107,63,160,0.18), 0 1px 4px rgba(107,63,160,0.1)",
                  }}
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium shrink-0">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          {loading ? (
            <SkeletonGrid />
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-sm">No toys found.</div>
          ) : (
            <div style={{
              columns: "var(--cols, 2)",
              columnGap: 16,
            }}
              className="[--cols:2] sm:[--cols:3] md:[--cols:4] lg:[--cols:5]"
            >
              {filtered.map((toy, i) => (
                <div key={toy.id} style={{ breakInside: "avoid", marginBottom: 16 }}>
                  <ToyCard toy={toy} allToys={filtered} rank={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ LOAD MORE INDICATOR ══ */}
      <div className="flex flex-col items-center gap-3 py-12" style={{ background: "#F7F5FB" }}>
        <div style={{ position: "relative", width: 48, height: 48 }}>
          {/* Outer ring */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `3px solid rgba(107,63,160,0.15)`,
          }} />
          {/* Spinning arc */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `3px solid transparent`,
            borderTopColor: C.purple,
            animation: "spin 0.9s linear infinite",
          }} />
        </div>
        <p className="text-xs font-semibold" style={{ color: C.purple, opacity: 0.5, letterSpacing: "0.08em" }}>
          LOADING MORE TOYS…
        </p>
      </div>

      {/* ══ INFO BAND ══ */}
      <section className="py-16 px-6" style={{ background: C.darkPurple }}>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { num: "Free", label: "Membership", sub: "Open to any family with children under 14" },
            { num: "3",    label: "Toys per visit", sub: "Take home up to three toys at a time" },
            { num: "3×",   label: "Weekly sessions", sub: "Tuesday, Wednesday & Saturday 10am–1pm" },
          ].map(({ num, label, sub }) => (
            <div key={label}>
              <p className="text-4xl font-extrabold text-white mb-1" style={{ fontFamily: DISPLAY }}>{num}</p>
              <p className="text-white font-semibold mb-1">{label}</p>
              <p className="text-white/40 text-xs leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/contact" className="btn-coral inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition-all">
            Visit us &amp; start borrowing
          </Link>
        </div>
      </section>

    </div>
  );
}
