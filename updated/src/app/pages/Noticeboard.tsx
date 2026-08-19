import { useState, useEffect } from "react";
import { User, Clock, Folder, Tag, ArrowRight } from "lucide-react";
import { C } from "../shared";
import logoImg from "@/imports/Community-Playlink-Logo-Retina-scaled.webp";

const DISPLAY = "'Bricolage Grotesque', 'Inter', sans-serif";
const BODY    = "'Inter', sans-serif";

/* ─── types ─── */
interface Post {
  id: number;
  title: string;
  date: string;
  categories: string[];
  excerpt: React.ReactNode;
  image?: string;
  special?: "gofundme";
  readingTime?: string;
}

/* ─── data ─── */
const posts: Post[] = [
  {
    id: 1,
    title: "January Update",
    date: "18 January 2026",
    categories: ["Playtime Updates", "Service Updates", "Toy Library Updates"],
    readingTime: "2 min read",
    excerpt: "Thank you everyone for your fantastic responses to our pleas for help and support! We will now be able to continue to offer Toy Library sessions albeit twice a week, on Tuesdays and Wednesdays. We'll be back open from 6th January — come and see us.",
  },
  {
    id: 2,
    title: "Give Power to Play",
    date: "",
    categories: ["Fundraising", "Announcements"],
    readingTime: "1 min read",
    excerpt: "",
    special: "gofundme",
  },
  {
    id: 3,
    title: "Save Community Playlink!",
    date: "18 December 2025",
    categories: ["Announcements", "Fundraising"],
    readingTime: "3 min read",
    excerpt: "One of our members has set up a GoFundMe fundraiser to support us following the news of our upcoming closure. If you'd like to donate to the fundraiser, and help us keep the doors open for families across Southampton, please follow the link below.",
  },
  {
    id: 4,
    title: "Our closure makes the news",
    date: "18 December 2025",
    categories: ["In the Media"],
    readingTime: "2 min read",
    excerpt: "News about our potential closure has reached BBC News, the Daily Echo, and bitterpark.info. The outpouring of support from the local community has been overwhelming — thank you to everyone who has shared our story.",
    image: "https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?w=900&q=80",
  },
  {
    id: 5,
    title: "Community Playlink Appears on ITV Meridian",
    date: "3 December 2025",
    categories: ["Announcements"],
    readingTime: "1 min read",
    excerpt: "A segment about our potential closure aired on ITV Meridian this week. The coverage has helped raise awareness across the region. You can watch the full clip on our YouTube channel.",
  },
  {
    id: 6,
    title: "Closure Notice",
    date: "1 December 2025",
    categories: ["Party Hire Updates", "Playtime Updates", "Service Updates", "Toy Library Updates"],
    readingTime: "3 min read",
    excerpt: "Due to a lack of funding, we have been exploring all available options to remain open. We will be closing temporarily but plan to reopen the Toy Library on 6th January 2026. We will keep you updated as the situation develops.",
  },
];



/* ─── GoFundMe embed ─── */
const donors = [
  { name: "Bridie Coffey",    amount: "£25", note: "Recent donation" },
  { name: "Lucy Holderness",  amount: "£25", note: "Top donation" },
  { name: "Amy Wu",           amount: "£25", time: "2 hrs ago" },
  { name: "Dexter Rackham",   amount: "£25", time: "24 hrs ago" },
];

function GoFundMeEmbed() {
  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100"
      style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-44 bg-gray-50 p-5 flex flex-col items-center gap-3 border-b sm:border-b-0 sm:border-r border-gray-100">
          <img src={logoImg} alt="Community Playlink" className="w-28 object-contain" />
          <div className="text-center">
            <p className="text-xs text-gray-400">Gregory Perry for</p>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-700">Community Playlink</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Donation protected
          </div>
        </div>
        <div className="flex-1 p-5 flex flex-col gap-3">
          <div>
            <span className="text-2xl font-extrabold text-gray-800">£230 </span>
            <span className="text-gray-500 text-sm">raised of <strong>£1,600</strong></span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: "14%" }} />
          </div>
          <p className="text-xs text-gray-400">15 donations</p>
          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-xl text-white text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 transition-colors">Donate now</button>
            <button className="flex-1 py-2 rounded-xl text-white text-sm font-semibold bg-gray-800 hover:bg-gray-700 transition-colors">Share</button>
          </div>
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            {donors.map((d) => (
              <div key={d.name} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                  <User size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.note ?? d.time}</p>
                </div>
                <span className="text-xs font-bold text-gray-600">{d.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── skeleton rows ─── */
function SkeletonPost({ featured }: { featured?: boolean }) {
  return (
    <div className="animate-pulse">
      {featured && (
        <div className="rounded-2xl bg-gray-200 mb-5" style={{ height: 260 }} />
      )}
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-24 rounded-full bg-gray-200" />
        <div className="h-5 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="h-7 bg-gray-200 rounded-lg mb-3 w-3/4" />
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="h-4 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="flex gap-4">
        <div className="h-4 w-32 bg-gray-100 rounded" />
        <div className="h-4 w-24 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function SkeletonFeed() {
  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {[true, false, false, false].map((featured, i) => (
        <div key={i} className={i === 0 ? "pb-10" : "py-10"}>
          <SkeletonPost featured={featured} />
        </div>
      ))}
    </div>
  );
}

/* ─── post row (feed style, no cards) ─── */
function PostRow({ post, featured }: { post: Post; featured?: boolean }) {
  return (
    <article className="group">
      {/* Featured image — only shown when image exists and it's the lead */}
      {featured && post.image && (
        <div className="relative rounded-2xl overflow-hidden mb-6" style={{ height: 320 }}>
          <img src={post.image} alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Category tags */}
      {post.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.categories.map(cat => (
            <span key={cat}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(107,63,160,0.1)", color: C.purple }}>
              <Tag size={10} />
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h2 className={`font-extrabold leading-tight mb-3 hover:text-purple-700 transition-colors cursor-pointer ${featured ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}
        style={{ fontFamily: DISPLAY, color: C.darkPurple }}>
        {post.title}
      </h2>

      {/* GoFundMe inline embed */}
      {post.special === "gofundme" && <GoFundMeEmbed />}

      {/* Excerpt */}
      {post.excerpt && (
        <div className="text-gray-600 leading-relaxed mb-4"
          style={{ fontSize: featured ? 16 : 15, fontFamily: BODY }}>
          {post.excerpt}
        </div>
      )}

      {/* Meta row */}
      {post.special !== "gofundme" && <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <User size={12} />
          Community Playlink Admin
        </span>
        {post.date && (
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {post.date}
          </span>
        )}
        {post.readingTime && (
          <span className="flex items-center gap-1.5">
            <Folder size={12} />
            {post.readingTime}
          </span>
        )}
        <a href="#"
          className="ml-auto flex items-center gap-1 font-semibold transition-colors hover:gap-2"
          style={{ color: C.red }}>
          Read more <ArrowRight size={13} />
        </a>
      </div>}
    </article>
  );
}


/* ─── page ─── */
export default function Noticeboard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ fontFamily: BODY }}>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden px-6 py-24"
        style={{ background: "linear-gradient(135deg, #1C1040 0%, #3D1B7A 60%, #5A2E9A 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-white/70 text-xs font-medium">Latest news &amp; updates</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-4"
            style={{ fontFamily: DISPLAY }}>
            Notice<span style={{ color: "#FFD166" }}>board</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Stay up to date with everything happening at Community Playlink.
          </p>
        </div>
      </section>

      {/* ══ CONTENT ══ */}
      <section className="py-16 px-6" style={{ background: "#F7F5FB" }}>
        <div className="max-w-4xl mx-auto">

          {/* Feed */}
          <div className="min-w-0">
            {loading ? (
              <SkeletonFeed />
            ) : (
              <div className="flex flex-col divide-y divide-gray-200">
                {posts.map((post, i) => (
                  <div key={post.id} className={i === 0 ? "pb-10" : "py-10"}>
                    <PostRow post={post} featured={i === 0} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
