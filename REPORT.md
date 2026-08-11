# Community Playlink — Southampton Market & SEO Analysis

**Prepared:** 11 August 2026
**Subject:** community-playlink.com — positioning within the Southampton toy library / family-services market, and recommendations to improve search coverage for the Southampton area.

---

## 0. Most important finding: production is not this codebase

Before anything else — **`www.community-playlink.com` is currently live on the old WordPress build, not this static site.**

- This repository (`cpl-team-dev.github.io`) has a `CNAME` file pointing at `www.community-playlink.com`, and its code (static `.html` files, ImageKit-hosted images, no CMS) is clearly a rebuild.
- But a live check of the domain right now shows WordPress fingerprints: `wp-json` links, `wp-content/cache` assets, and `x-redirect-by: WordPress` headers. The bare domain `community-playlink.com` (no `www`) is a WordPress 301-redirect front, and pages use **trailing-slash permalinks** (`/toy-libraries/`, `/how-it-works/`, `/toy-index/`, `/services/toy-libraries/`), not the `.html` paths used in this repo (`/services/toy-libraries.html`, `/toy-index.html`).
- Google, council directories, and charity/community sites have indexed and linked to the **old WordPress URLs** (confirmed via search: `/toy-index/`, `/services/toy-libraries/`, `/noticeboard/`, `/about/policies/`, `/services/playtime/`, `/noticeboard/announcements/save-community-playlink/`, etc.).

**Why this matters:** when this static rebuild goes live, every one of those indexed WordPress URLs will 404 unless redirects are put in place, because the URL structure has changed shape (extensionless trailing-slash → `.html`). That will destroy the accumulated backlink equity and rankings this domain has built up — including the significant press coverage it recently received (see §2.3) — right at the moment more visibility is most needed.

**Recommendation (do this before cutover, not after):**
1. ~~Crawl the live WordPress site's sitemap and export a full URL list.~~ **Done** — the live site runs Jetpack, whose sitemap index (`/sitemap.xml` → `/sitemap-index-1.xml` → `/sitemap-1.xml` … `/sitemap-4.xml`) lists **3,613 URLs**: 37 real pages plus **3,576 individual toy-catalogue pages** (`/services/toy-libraries/toy-library/toy/<toy-name>/`) — the old site gave every item in stock its own indexable URL, which this rebuild has deliberately consolidated into a single browsable `toy-index.html`/`toy-library.html` (already reflected in `robots.txt`).
2. ~~Build a 1:1 (or closest-match) redirect map~~ **Done** — see the three ready-to-upload CSVs below.
3. Implement as 301s at the edge (GitHub Pages can't do server-side redirects; the domain already sits behind Cloudflare per its response headers, so **Cloudflare Bulk Redirects** is the right tool).
4. Resubmit the sitemap in Google Search Console immediately after cutover and monitor Coverage/redirect errors for the following 4–6 weeks.

Everything below assumes this redirect work happens; the on-page recommendations are otherwise moot if the URLs 404 on launch.

### 0.1 Cloudflare Bulk Redirect CSVs (ready to upload)

Three CSV files have been generated in [`/redirects`](./redirects) in Cloudflare's required import format — **no header row**, columns: `source_url,target_url,status_code,preserve_query_string,include_subdomains,subpath_matching,preserve_path_suffix`.

| File | Rows | Purpose |
|---|---|---|
| [`cloudflare-bulk-redirects-verified.csv`](./redirects/cloudflare-bulk-redirects-verified.csv) | 23 | Every old WordPress URL that has a **confirmed, content-equivalent page** on the new static site (about, policies, contact, services, support-us, toy-index, the two migrated noticeboard posts, etc.), mapped 1:1 to its new `.html` path. Row 23 is a single **subpath-matching wildcard rule** — `.../toy-library/toy` → `/toy-index.html` with `subpath_matching=TRUE` — that collapses all 3,576 old per-toy URLs onto the new consolidated catalogue page in one rule, instead of 3,576 rows. |
| [`cloudflare-bulk-redirects-fallback.csv`](./redirects/cloudflare-bulk-redirects-fallback.csv) | 14 | Old URLs whose **content hasn't been rebuilt on the new site yet** (see §0.2). These are pointed at the closest live parent page (mostly `/noticeboard.html` or `/contact.html`) purely to avoid a 404 at launch — they are a stopgap, not a real fix. |
| [`cloudflare-bulk-redirects-apex-domain.csv`](./redirects/cloudflare-bulk-redirects-apex-domain.csv) | 1 | Handles the bare `community-playlink.com` → `www.community-playlink.com` redirect, which currently happens **inside WordPress** (`x-redirect-by: WordPress` in the response headers) and will disappear the moment WordPress is switched off. One path-preserving rule replaces it. |

**How to upload (Cloudflare dashboard → Rules → Redirect Rules → Bulk Redirects):**
1. Create a Bulk Redirect List (e.g. `cpl-migration-verified`), choose **Upload a CSV file**, and import `cloudflare-bulk-redirects-verified.csv`. Repeat for a second list with the fallback CSV, and a third with the apex-domain CSV.
2. A list alone does nothing — create a **Bulk Redirect Rule** for each list (or one rule referencing all three) with the condition scoped to the `community-playlink.com` zone, so it fires on every request.
3. Upload and activate **before** flipping DNS/removing WordPress, so there's no gap where old URLs 404.
4. Note the apex-domain rule (file 3) means apex requests take **two redirect hops** for old-style paths (apex old-path → www old-path → www new-path). That's acceptable for a one-off migration, but can be flattened to a single hop later by duplicating the verified/fallback rows onto the apex host directly if it's worth the extra maintenance.

### 0.2 Content gap this surfaced

Comparing the 37 real WordPress pages against this repo shows **14 old pages have no equivalent content yet**, which is why they're in the fallback CSV rather than the verified one. Two are high-value and should be prioritised for actual migration (not left on the fallback redirect) before launch:

- `/noticeboard/in-the-media/our-closure-makes-the-news/` — very likely the page the BBC/regional press coverage in §2.5 links to or references. Losing this to a generic `/noticeboard.html` redirect weakens exactly the earned press backlink the charity most needs right now.
- `/noticeboard/announcements/save-community-playlink/` — the crowdfunding/"Save Community Playlink" appeal post, same reasoning.

The remaining 12 (`community-playlink-appears-on-itv-meridian`, `welcome-to-our-new-website`, `weve-moved`, `mayflower-studio-mast-family-fun-day`, `service-updates/closure-notice`, `service-updates/january-update`, `thank-you-marcel-and-jess-mulders`, `services/toy-libraries/guidelines`, and the four `/contact/*` sub-forms: `become-a-member`, `new-toy-request`, `party-hire`, `request-a-toy`) are lower-priority but should still be triaged — either rebuilt as real pages or consciously accepted as retired content.

---

## 1. What Community Playlink is, in market terms

- Registered charity (est. **1974**, 50+ years running), based at **Swaythling Neighbourhood Centre, Hampton Park Way, Southampton SO17 3AT**.
- Core offer: a genuinely **free** toy library (0–14 yrs) — borrow toys like library books — plus playtime sessions, toddler group support, a group/childminder bulk-loan membership scheme, and party toy/equipment hire.
- Positioned as **the** city-wide, charity-run toy library for Southampton — most alternatives are either council-run micro-services tied to a single Family Hub, or commercial party-hire companies with a completely different (paid, one-off) business model.

## 2. The competitive/adjacent landscape in Southampton

### 2.1 Direct "toy library" providers (low competition, mostly complementary)
- **Sure Start Weston Toy Library** — listed in the council directory but marked **"not available until further notice"** — effectively inactive.
- **Southampton Best Start Family Hubs** — toy/book libraries exist inside some Family Hub sessions (per southampton.gov.uk), but these are folded into a generic "what's on" schedule, not a dedicated, brand-led service.
- Council directory entries also associate Community Playlink itself with satellite sites at **Clovelly Children's Centre** (Newtown) and **Pickles Coppice Children's Centre** (Millbrook) in addition to Swaythling — this is an asset (multi-site reach) that isn't reflected in the current site's location content.
- **Conclusion:** Community Playlink has effectively no direct like-for-like competitor in Southampton for a *dedicated, standalone, free toy library brand*. The market gap is real, but it isn't being defended with location-specific content (see §3).

### 2.2 Adjacent attention-competitors (toddler groups & baby classes)
Searches for "toddler group Southampton" surface a crowded field that competes for the same parents' time/attention, even though most aren't toy libraries:
- Southampton City Farm (paid toddler group), Freemantle Baptist Church, Ascension "Footsteps Tots", plus dozens of paid classes aggregated on **Happity**, **Southampton Rocks**, and **Little Ankle Biters (Hants)**.
- These aggregator/directory sites (Happity, Southampton Rocks) rank strongly for exactly the kind of queries parents use, and **Community Playlink does not appear to be listed on them** — a clear, low-effort citation-building opportunity (see §5).

### 2.3 Commercial party/soft-play hire (this is genuine commercial competition)
The site's **Party Hire** service (loaning toys/soft play/equipment for parties) puts it in the same search results as for-profit operators who are far more aggressively optimised for "Southampton" + service terms:
- Southampton Soft Play Hire, LA Soft Play Hire (Eastleigh/Chandler's Ford/Southampton), Bouncetastic Castles, Sapphie's Soft Play, JJs Party Hire, Soft Play Party Hire (Bournemouth/Southampton/Portsmouth).
- Every one of these has "Southampton" (or a named town) baked into their domain, title tags, and H1s. **Community Playlink's `services/party-hire.html` currently has neither "Southampton" nor "soft play" in its `<title>` or meta description** — it will lose this keyword fight by default, even though its charity/affordability angle ("hire toys from a toy library, support a good cause") is a genuinely differentiated pitch these commercial firms can't make.

### 2.4 National context
The **National Association of Toy and Leisure Libraries (NATLL)** is the UK sector body (Good Toy Guide, quality accreditation, helpline). There's no evidence Community Playlink is currently listed/affiliated in a way that surfaces in search — an accreditation/backlink opportunity if not already pursued.

### 2.5 Recent news relevance
Community Playlink received real press attention (BBC, and other outlets referencing an AOL/regional syndication) over a **council funding cut** — the charity's ~£45,000/year running cost lost its Southampton City Council grant, staff were put on notice, and a public crowdfunding/"Save Community Playlink" campaign followed. This is a **major, ongoing SEO and PR asset**: people who read that coverage will search "Community Playlink," "toy library Southampton funding," "save community playlink," etc. The site should be actively capturing that traffic with an up-to-date, keyword-rich noticeboard post and a prominent, current donate/support pathway — not just relying on the existing `support-us.html` and the `noticeboard/announcements/save-community-playlink/` post from the old site (confirm this exists on the new build and is current).

---

## 3. On-page SEO audit of this codebase

**What's already good:**
- Meta descriptions, Open Graph/Twitter tags, canonical links, and breadcrumb JSON-LD are present and consistent across pages.
- `index.html` includes Organization schema with `addressLocality: Southampton` and a UK Charity Number `propertyID`.
- `sitemap.xml` and `robots.txt` exist and are reasonably well-formed (sitemap correctly excludes `/manage/` admin pages).
- Image `alt` text is descriptive rather than generic.

**Gaps found — the single biggest one first:**

1. **No page `<title>` tag in the entire site contains "Southampton."** Titles are the strongest on-page local-SEO signal, and every page follows the pattern `Community Playlink – [Section]` with no location or service qualifier:
   - `index.html` → `Community Playlink – Empowering through play.`
   - `services/toy-libraries.html` → `Community Playlink – Toy Libraries`
   - `services/party-hire.html` → `Community Playlink – Party Hire`
   - ...and so on for about, contact, noticeboard, playtime, toddler-groups, group-membership-scheme, support-us.

   Meanwhile meta *descriptions* do mention Southampton on some pages (toy-libraries, services, about) — but Google weights the title tag far more heavily for ranking, and it's what shows as the blue link in results. This is a straightforward, low-risk, high-impact fix.

2. **`services/party-hire.html`** has neither "Southampton" nor "soft play"/"party hire Southampton" phrasing in its title or meta description, despite competing directly with commercial soft-play companies that do (§2.3).

3. **`robots.txt` disallows `/services/toy-libraries/toy-library.html`** — confirm this is deliberate (e.g. it's a live/dynamic toy-search tool with low unique-content value) rather than an accidental block of a page that could otherwise rank for "toy index Southampton" type queries.

4. **No FAQ schema** on the Toy Libraries or Party Hire pages, despite both having natural Q&A content ("How does it work?", "Who can borrow?", "What toys do you have?"). FAQ markup is a cheap way to win extra SERP real estate.

5. **Satellite locations aren't surfaced.** The council directory lists Community Playlink activity at Clovelly Children's Centre (Newtown) and Pickles Coppice Children's Centre (Millbrook) in addition to Swaythling — none of this appears in the current site's location/contact content. Dedicated location mentions (even a paragraph each, not full pages) would help capture "toy library Newtown/Millbrook Southampton" long-tail searches and reinforce the citywide (not just Swaythling) coverage claim already made in the copy ("Southampton and the surrounding areas").

6. **Noticeboard/blog freshness.** Google favours sites that publish regularly for "near me"/local queries. The noticeboard exists but cadence should be checked — the funding-crisis story (§2.5) is exactly the kind of content worth an update post to keep capturing referral searches from news coverage.

---

## 4. Off-site presence / citations audit

Current known citations (via search): Southampton City Council services directory (`sid.southampton.gov.uk`), So:Linked, Southampton Voluntary Services, Swaythling Neighbourhood Centre's own site, Mimoji, Facebook, Charity Commission register, and press coverage (BBC, regional/syndicated outlets).

**Gaps:**
- **Not found** on Happity or Southampton Rocks — the two aggregator sites that dominate "toddler group/baby class Southampton" search results and reach exactly this audience.
- **No confirmed Google Business Profile** surfaced in search for "Community Playlink" — if one doesn't exist or isn't claimed/optimised, this is one of the single highest-leverage local-SEO actions available (map pack visibility for "toy library near me" searches).
- **NAP (Name/Address/Phone) consistency** should be spot-checked across all citations once the domain migration (§0) happens, since address/hours can drift across third-party listings when a charity's operating hours change (as happened during the funding crisis).

---

## 5. Keyword recommendations

Grouped by intent, for use across titles, H1s, meta descriptions, and body copy (naturally, not stuffed):

**Primary / branded + core service (fix titles first):**
- toy library Southampton
- free toy library Southampton
- Community Playlink Southampton
- Swaythling toy library
- toy library near me (Southampton)

**Service-specific local:**
- toddler groups Southampton
- baby and toddler group Southampton free
- party hire Southampton / soft play hire Southampton
- toy hire for parties Southampton
- childminder toy loan scheme Southampton
- group membership toy library Southampton
- playgroup Swaythling / playgroup Southampton

**Audience/need-based long-tail (underused, low competition):**
- special needs toys Southampton
- toys for children with disabilities Southampton
- educational toys to borrow Southampton
- toy library Newtown Southampton (Clovelly)
- toy library Millbrook Southampton (Pickles Coppice)
- EYFS toys loan Southampton
- sensory toys loan Southampton

**Charity/support intent (capturing the funding-story audience):**
- donate toy library Southampton
- support Community Playlink
- save Community Playlink
- Southampton children's charity toy library
- volunteer toy library Southampton

**Informational (good for noticeboard/blog content and internal linking):**
- why is play important
- benefits of toy libraries
- how does a toy library work

---

## 6. Prioritised action list

1. **Before launch:** upload and activate the three Cloudflare Bulk Redirect CSVs in `/redirects` (§0.1), and migrate the two high-value content gaps in §0.2 (the closure/press post and the "Save Community Playlink" appeal) rather than leaving them on the generic fallback redirect. This protects existing rankings and the press-driven backlink profile.
2. Rewrite every page `<title>` to include "Southampton" (and the relevant service term), keeping meta descriptions as-is where they're already good.
3. Rewrite `party-hire.html` title/description/H1 copy to compete on "party hire/soft play hire Southampton" terms while leading with the free/charitable differentiator.
4. Claim/optimise a Google Business Profile (categories: Toy Library, Charity, Community Centre; service area: Southampton).
5. Submit listings to Happity and Southampton Rocks (and Netmums/Mumsnet local listings if not already present).
6. Add short location paragraphs for Clovelly and Pickles Coppice sites to capture area-specific searches.
7. Add FAQ schema to the Toy Libraries and Party Hire pages.
8. Keep the noticeboard active around the funding story to keep capturing referral/news-driven search traffic and reinforce freshness signals.
9. Re-verify `robots.txt`'s disallow rule on the toy catalogue page is intentional.
