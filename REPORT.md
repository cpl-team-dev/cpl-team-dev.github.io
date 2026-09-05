# Community Playlink — Southampton Market & SEO Analysis

**Prepared:** 11 August 2026
**Last updated:** 12 August 2026
**Subject:** community-playlink.com — positioning within the Southampton toy library / family-services market, and recommendations to improve search coverage for the Southampton area.

---

## Outstanding TODOs

Everything the repo itself can fix is done (see §0–§3 for detail). What's left is either genuine content work or happens outside this codebase entirely:

- **Write the real `/noticeboard/in-the-media/our-closure-makes-the-news/` page.** This is the one content gap the migration didn't close — it's currently a redirect stub (to `/noticeboard/`), not the rebuilt article the BBC/press coverage most likely links to. Still the single highest-value piece of missing content (§0.2).
- **Resubmit `sitemap.xml` in Google Search Console** immediately after cutover, and monitor Coverage/redirect errors for 4–6 weeks post-launch (§0.1).
- **Claim/optimise a Google Business Profile** (categories: Toy Library, Charity, Community Centre; service area: Southampton) — no listing currently surfaces in search (§4).
- **Submit listings to Happity, Southampton Rocks, and Netmums/Mumsnet local directories** — these aggregators dominate "toddler group Southampton" search and Community Playlink isn't on them yet (§2.2, §4).
- **Check NATLL (National Association of Toy and Leisure Libraries) accreditation/listing status** — a plausible, unclaimed backlink/accreditation opportunity (§2.4).
- **Spot-check NAP (name/address/phone) consistency** across third-party citations now that the domain migration is otherwise ready — hours/address may have drifted during the funding-crisis period (§4).
- **Keep the noticeboard active around the funding story** — this is ongoing editorial work, not a one-off fix; the funding-crisis coverage is a live SEO/PR asset only if the site keeps publishing against it (§2.5, §6).
- Add clouflare turnstile DONE
- Add google analytics DONE
- Add google business information
- Add google search console
- Restrict all traffic form outside of the UK DONE
- Allow bots to go through cloudflare DONE
- Add cookie bot
- Capture what the site looked like in commit 7d0046c89c9b5e4997eaeeef48634d7a7fc93ef2

---

## 0. Most important finding: production is not this codebase

Before anything else — **`www.community-playlink.com` is currently live on the old WordPress build, not this static site.**

- This repository (`cpl-team-dev.github.io`) has a `CNAME` file pointing at `www.community-playlink.com`, and its code (static `.html` files, ImageKit-hosted images, no CMS) is clearly a rebuild.
- But a live check of the domain right now shows WordPress fingerprints: `wp-json` links, `wp-content/cache` assets, and `x-redirect-by: WordPress` headers. The bare domain `community-playlink.com` (no `www`) is a WordPress 301-redirect front, and pages use **trailing-slash permalinks** (`/toy-libraries/`, `/how-it-works/`, `/toy-index/`, `/services/toy-libraries/`), not the `.html` paths used in this repo (`/services/toy-libraries.html`, `/toy-index.html`).
- Google, council directories, and charity/community sites have indexed and linked to the **old WordPress URLs** (confirmed via search: `/toy-index/`, `/services/toy-libraries/`, `/noticeboard/`, `/about/policies/`, `/services/playtime/`, `/noticeboard/announcements/save-community-playlink/`, etc.).

**Why this matters:** when this static rebuild goes live, every one of those indexed WordPress URLs will 404 unless redirects are put in place, because the URL structure has changed shape (extensionless trailing-slash → `.html`). That will destroy the accumulated backlink equity and rankings this domain has built up — including the significant press coverage it recently received (see §2.3) — right at the moment more visibility is most needed.

**Recommendation (do this before cutover, not after):**
1. ~~Crawl the live WordPress site's sitemap and export a full URL list.~~ **Done** — the live site runs Jetpack, whose sitemap index (`/sitemap.xml` → `/sitemap-index-1.xml` → `/sitemap-1.xml` … `/sitemap-4.xml`) lists **3,613 URLs**: 37 real pages plus **3,576 individual toy-catalogue pages** (`/services/toy-libraries/toy-library/toy/<toy-name>/`) — the old site gave every item in stock its own indexable URL, which this rebuild has deliberately consolidated into a single browsable `toy-index/`/`toy-library/` page (reflected in `robots.txt`).
2. ~~Build a 1:1 (or closest-match) redirect map~~ **Done**, then **superseded** — see §0.1.
3. ~~Implement as 301s at the edge~~ **Mostly moot now** — the static site itself was restructured to match the old WordPress URL shape directly (see §0.1), so almost nothing needs an edge redirect any more. What's left: activate the single remaining apex-domain rule in Cloudflare before DNS cutover (GitHub Pages can't do server-side redirects, so the apex `community-playlink.com/` → `https://www.community-playlink.com/` hop still needs to happen at the edge).
4. Resubmit the sitemap in Google Search Console immediately after cutover and monitor Coverage/redirect errors for the following 4–6 weeks. **Not yet done** — happens post-launch.

Everything below assumed this redirect work would happen at the Cloudflare edge; in practice the rebuild went further and made the *site itself* match almost every old WordPress URL, which is a better outcome (no external redirect list to maintain, no extra redirect hop for visitors).

### 0.1 Redirect strategy: from a 49-row CSV to URL-structure parity

The original plan (as of 11 August) was a 49-row Cloudflare Bulk Redirect CSV mapping every old WordPress URL to this site's `.html` paths. That approach has been superseded by a better one, executed directly in this repo:

- **Every page that had a `.html` file at the site root or one level deep was converted to a directory with an `index.html`** (`about.html` → `about/index.html`, `services/party-hire.html` → `services/party-hire/index.html`, and so on, across `about/`, `services/`, `noticeboard/`, `contact/`, `support-us/`, `toy-index/`, including all 10 team-detail pages and both staff-update posts). This makes the new site's URLs **structurally identical** to the old WordPress permalinks (trailing-slash, no `.html`) — so most of the original 49 redirect rows became unnecessary the moment the matching directory existed, because the "old" URL simply *is* the new URL now.
- Every internal link across all pages (nav, footer, breadcrumbs, canonical/OG tags, JSON-LD, cross-page mentions) was rewritten to match — including catching and fixing several depth-calculation bugs introduced by the moves themselves (pages one level too shallow or too deep for their new location), and a handful of "bare" relative links that a straightforward find-and-replace missed.
- For the handful of legacy WordPress slugs that **don't** match the new site's own naming (e.g. `/noticeboard/uncategorised/why-is-play-important/` vs. the site's own `why-is-play-important/`, or `/contact/become-a-member/` vs. `/services/group-membership-scheme/`), a **bare static HTML page was built at the exact legacy path** — `<meta http-equiv="refresh">` + a JS `location.replace` + a no-JS fallback link + a `rel="canonical"` pointing at the real page. This avoids relying on an external edge redirect at all for these cases; the redirect ships as part of the static site.
- `/services/toy-libraries/guidelines/` was a special case: a raw WordPress page export had been dropped into the repo at that exact path. It's been fully rebuilt in the site's own template (same header/nav/footer, correct CSS classes, no WordPress markup left), and the previously-empty "Individual" guidelines section (the WP source had the heading with no body copy) was written from scratch, consistent with facts stated elsewhere on the site.

**Net result:** `cloudflare-bulk-redirects-master.csv` is down from 49 rows to **1** — the apex-domain rule (`community-playlink.com/` → `https://www.community-playlink.com/`), which can't be done any other way since it has to happen before any request reaches GitHub Pages. Everything else old WordPress URLs needed is now served natively by the static site or by one of its own redirect stub pages. A full-site link audit (all internal `href`/`src` targets, case-sensitivity checked against GitHub Pages' case-sensitive Linux host, and every anchor `#fragment` checked against the target page's actual `id`s) confirms zero broken internal links across all pages.

**Still to do:** create the actual Cloudflare Bulk Redirect List/Rule for that one remaining apex row and activate it before DNS cutover — that's a dashboard action outside this repo.

### 0.2 Content gap this surfaced

Comparing the 37 real WordPress pages against this repo originally showed 14 old pages with no equivalent content. One has since been resolved — `/noticeboard/announcements/save-community-playlink/` now has a fully rebuilt, expanded page (with a live fundraising total, FAQ schema, and internal links into the rest of the site) at `noticeboard/announcements/save-community-playlink/index.html` — no redirect needed at all, since the URL-structure migration (§0.1) means that path now serves the real page directly.

One remaining gap is still high-value and should be prioritised for actual migration before launch:

- `/noticeboard/in-the-media/our-closure-makes-the-news/` — very likely the page the BBC/regional press coverage in §2.5 links to or references. It currently redirects to the generic `/noticeboard/` listing rather than a real article, which still weakens exactly the earned press backlink the charity most needs right now. **This is the one content gap not yet closed — see the Outstanding TODOs at the top of this report.**

The remaining 12 (`community-playlink-appears-on-itv-meridian`, `welcome-to-our-new-website`, `weve-moved`, `mayflower-studio-mast-family-fun-day`, `service-updates/closure-notice`, `service-updates/january-update`, `thank-you-marcel-and-jess-mulders`, `services/toy-libraries/guidelines`, and the four `/contact/*` sub-forms: `become-a-member`, `new-toy-request`, `party-hire`, `request-a-toy`) have all now been triaged. `services/toy-libraries/guidelines/` was rebuilt as a real page in the site's own template (its previously-empty "Individual" section was written from scratch). The other 11 are consciously retired/consolidated content, each now served by a lightweight static redirect page at its exact legacy URL rather than left to 404 or fall through to an external edge redirect.

---

## 1. What Community Playlink is, in market terms

- Registered charity (est. **1974**, 50+ years running), based at **Swaythling Neighbourhood Centre, Hampton Park Way, Southampton SO17 3AT**.
- Core offer: a genuinely **free** toy library (0–14 yrs) — borrow toys like library books — plus playtime sessions, toddler group support, a group/childminder bulk-loan membership scheme, and party toy/equipment hire.
- Positioned as **the** city-wide, charity-run toy library for Southampton — most alternatives are either council-run micro-services tied to a single Family Hub, or commercial party-hire companies with a completely different (paid, one-off) business model.

## 2. The competitive/adjacent landscape in Southampton

### 2.1 Direct "toy library" providers (low competition, mostly complementary)
- **Sure Start Weston Toy Library** — listed in the council directory but marked **"not available until further notice"** — effectively inactive.
- **Southampton Best Start Family Hubs** — toy/book libraries exist inside some Family Hub sessions (per southampton.gov.uk), but these are folded into a generic "what's on" schedule, not a dedicated, brand-led service.
- Council directory entries also associate Community Playlink itself with satellite sites at **Clovelly Children's Centre** (Newtown) and **Pickles Coppice Children's Centre** (Millbrook) in addition to Swaythling — this multi-site reach is now reflected in the site's own location content (see §3 item 5).
- **Conclusion:** Community Playlink has effectively no direct like-for-like competitor in Southampton for a *dedicated, standalone, free toy library brand*. The market gap is real, and it's now being defended with location-specific content (§3).

### 2.2 Adjacent attention-competitors (toddler groups & baby classes)
Searches for "toddler group Southampton" surface a crowded field that competes for the same parents' time/attention, even though most aren't toy libraries:
- Southampton City Farm (paid toddler group), Freemantle Baptist Church, Ascension "Footsteps Tots", plus dozens of paid classes aggregated on **Happity**, **Southampton Rocks**, and **Little Ankle Biters (Hants)**.
- These aggregator/directory sites (Happity, Southampton Rocks) rank strongly for exactly the kind of queries parents use, and **Community Playlink does not appear to be listed on them** — a clear, low-effort citation-building opportunity (see §5).

### 2.3 Commercial party/soft-play hire (this is genuine commercial competition)
The site's **Party Hire** service (loaning toys/soft play/equipment for parties) puts it in the same search results as for-profit operators who are far more aggressively optimised for "Southampton" + service terms:
- Southampton Soft Play Hire, LA Soft Play Hire (Eastleigh/Chandler's Ford/Southampton), Bouncetastic Castles, Sapphie's Soft Play, JJs Party Hire, Soft Play Party Hire (Bournemouth/Southampton/Portsmouth).
- Every one of these has "Southampton" (or a named town) baked into their domain, title tags, and H1s. `services/party-hire/`'s title/meta description now read **"Party Hire & Soft Play Hire Southampton | Community Playlink"** — fixed (see §3) — so it now competes on those terms while still leading with the charity/affordability angle ("hire toys from a toy library, support a good cause") these commercial firms can't match.

### 2.4 National context
The **National Association of Toy and Leisure Libraries (NATLL)** is the UK sector body (Good Toy Guide, quality accreditation, helpline). There's no evidence Community Playlink is currently listed/affiliated in a way that surfaces in search — an accreditation/backlink opportunity if not already pursued.

### 2.5 Recent news relevance
Community Playlink received real press attention (BBC, and other outlets referencing an AOL/regional syndication) over a **council funding cut** — the charity's ~£45,000/year running cost lost its Southampton City Council grant, staff were put on notice, and a public crowdfunding/"Save Community Playlink" campaign followed. This is a **major, ongoing SEO and PR asset**: people who read that coverage will search "Community Playlink," "toy library Southampton funding," "save community playlink," etc. The site should be actively capturing that traffic with an up-to-date, keyword-rich noticeboard post and a prominent, current donate/support pathway. **Confirmed:** `support-us/` and `noticeboard/announcements/save-community-playlink/` both exist on the new build, the latter fully rebuilt with a live fundraising total, FAQ schema, and internal links — but it still needs to be kept current as the fundraiser progresses (see Outstanding TODOs).

---

## 3. On-page SEO audit of this codebase

**What's already good:**
- Meta descriptions, Open Graph/Twitter tags, canonical links, and breadcrumb JSON-LD are present and consistent across pages.
- `index.html` includes Organization schema with `addressLocality: Southampton` and a UK Charity Number `propertyID`.
- `sitemap.xml` and `robots.txt` exist, correctly exclude `/manage/` admin pages, and are now fully in sync with the directory-style URL structure (see §0.1).
- Image `alt` text is descriptive rather than generic.
- Every internal link on the site (`href`/`src` across all pages, plus every `#fragment` anchor) has been audited and resolves correctly — including a case-sensitivity check, since GitHub Pages serves from a case-sensitive host even though local development on macOS wouldn't catch a mismatch.

**Gaps originally found — now resolved, in order raised:**

1. **✅ Resolved — every page `<title>` now contains "Southampton."** The original audit found the whole site following `Community Playlink – [Section]` with no location qualifier. Verified against the current codebase, every page title now includes it:
   - `index.html` → `Community Playlink Southampton | Toy Library & Play Services`
   - `about/index.html` → `About Community Playlink Southampton | Children's Charity`
   - `services/toy-libraries/index.html` → `Toy Libraries in Southampton | Community Playlink`
   - `services/party-hire/index.html` → `Party Hire & Soft Play Hire Southampton | Community Playlink`
   - `services/playtime/`, `services/toddler-groups/`, `services/group-membership-scheme/`, `support-us/`, `contact/`, `noticeboard/` — all follow the same pattern.

2. **✅ Resolved — `services/party-hire/`** now leads with "Party Hire & Soft Play Hire Southampton" in both title and meta description, directly matching the commercial competitors' keyword pattern from §2.3.

3. **✅ Resolved (and a related bug caught in the process) — `robots.txt`.** The disallow rule is deliberate: both `/noticeboard/` and `/services/toy-libraries/toy-library/` fetch their real content from a JS-driven endpoint at render time, so blocking the shell page from indexing is correct. However, the URL-structure migration (§0.1) had left the rules pointing at the old dead paths — `/noticeboard.html` and `/services/toy-libraries/toy-library.html` — which no longer exist, so **the rules had silently stopped blocking anything**. Fixed to `Disallow: /noticeboard/$` and `Disallow: /services/toy-libraries/toy-library/$` (the `$` end-anchor matters: without it, a bare `/noticeboard/` disallow would also have blocked every real subpage underneath — team-detail bios, announcements, staff updates — which should stay indexable).

4. **✅ Resolved — FAQ schema** now present on both the Toy Libraries and Party Hire pages.

5. **✅ Resolved — satellite locations are now surfaced.** `services/toy-libraries/index.html` has a dedicated paragraph naming Clovelly Children's Centre (Newtown) and Pickles Coppice Children's Centre (Millbrook), using the exact "toy library Newtown/Millbrook Southampton" long-tail phrasing recommended in §5.

6. **Still ongoing — noticeboard/blog freshness.** This isn't a one-off fix; see the Outstanding TODOs at the top of this report. Google favours sites that publish regularly for "near me"/local queries, and the funding-crisis story (§2.5) is exactly the kind of content worth continued update posts to keep capturing referral searches from news coverage.

---

## 4. Off-site presence / citations audit

Current known citations (via search): Southampton City Council services directory (`sid.southampton.gov.uk`), So:Linked, Southampton Voluntary Services, Swaythling Neighbourhood Centre's own site, Mimoji, Facebook, Charity Commission register, and press coverage (BBC, regional/syndicated outlets).

**Gaps:**
- **Not found** on Happity or Southampton Rocks — the two aggregator sites that dominate "toddler group/baby class Southampton" search results and reach exactly this audience.
- **No confirmed Google Business Profile** surfaced in search for "Community Playlink" — if one doesn't exist or isn't claimed/optimised, this is one of the single highest-leverage local-SEO actions available (map pack visibility for "toy library near me" searches).
- **NAP (Name/Address/Phone) consistency** should be spot-checked across all citations once the domain migration (§0) happens, since address/hours can drift across third-party listings when a charity's operating hours change (as happened during the funding crisis).

---

## 5. Keyword recommendations

Grouped by intent, for use across titles, H1s, meta descriptions, and body copy (naturally, not stuffed). Titles now cover the primary/service-specific groups below (§3); the "Newtown/Millbrook" long-tail terms are live in body copy (§3 item 5); "why is play important" already exists as a full noticeboard article. The rest remain open opportunities for future content:

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

1. ✅ **Done** — the redirect/URL-structure migration (§0.1) is complete in the repo. The "Save Community Playlink" appeal is real, current content (§0.2). What's left is entirely outside the repo: activate the single remaining apex-domain rule in Cloudflare before DNS cutover, and write the real `/noticeboard/in-the-media/our-closure-makes-the-news/` article — see Outstanding TODOs at the top.
2. ✅ **Done** — every page `<title>` now includes "Southampton" and the relevant service term (§3 item 1).
3. ✅ **Done** — `services/party-hire/` title/description now competes on "party hire/soft play hire Southampton" terms while leading with the free/charitable differentiator (§3 item 2).
4. **Open** — claim/optimise a Google Business Profile (categories: Toy Library, Charity, Community Centre; service area: Southampton).
5. **Open** — submit listings to Happity and Southampton Rocks (and Netmums/Mumsnet local listings if not already present).
6. ✅ **Done** — short location paragraphs for Clovelly and Pickles Coppice now live on the Toy Libraries page (§3 item 5).
7. ✅ **Done** — FAQ schema added to the Toy Libraries and Party Hire pages (§3 item 4).
8. **Ongoing** — keep the noticeboard active around the funding story to keep capturing referral/news-driven search traffic and reinforce freshness signals. Not a one-off task; revisit regularly.
9. ✅ **Done** — `robots.txt`'s disallow rules were checked, found stale (pointing at pre-migration dead paths, so silently blocking nothing), and corrected with exact-match `$` anchors so only the two JS-rendered shell pages are blocked, not their real subpages (§3 item 3).
