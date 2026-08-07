# Community Playlink Website

Static website source for the Community Playlink public site.

The project is a multi-page HTML/CSS/JavaScript site for a Southampton charity that supports families through toy libraries, playtime sessions, toddler groups, party hire, group membership, and community updates.

## What is in this repo

- `index.html`: homepage and charity overview
- `about.html`: aims, staff, trustees, partners, and policies links
- `services.html`: service landing page
- `services/`: individual service pages, plus the featured toy library page
- `noticeboard.html`: updates hub
- `noticeboard/`: staff updates and team detail pages
- `contact.html`: contact details and enquiry form page
- `support-us.html`: donations, toy donations, and volunteering
- `manage/login.html`: staff login flow
- `assets/css/`: shared and page-specific styling
- `assets/js/`: shared and page-specific client-side behavior

## Local development

This is a static site. There is no build step or package install required.

Run a simple local server from the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Using a local server is recommended instead of opening files directly, because relative links and page scripts are designed to run from a site root.

## Notes

- Many images, icons, and social/share assets are loaded from external `community-playlink.com` and `ik.imagekit.io` URLs.
- `manage/login.html` is the only page with a real application flow: it requests and verifies login codes against configured API endpoints and stores the returned token in `sessionStorage`.
- Some pages appear to be hand-built static pages, while others are exported or preserved from an older WordPress-based site, especially `toy-index.html`, `about/partners.html`, and `about/policies.html`.
- There are also a few references to legacy image paths such as `../legacy/...`, so visual checks in the browser are worth doing after content changes.

## Suggested edit workflow

1. Start the local server.
2. Make changes to the relevant HTML, CSS, or JS file.
3. Refresh the affected page in the browser.
4. Spot-check navigation, mobile menu behavior, and any page-specific scripts.

## Deployment context

This repository is structured like a GitHub Pages or static-hosting site: the HTML files live at the project root, and child pages live in content folders such as `services/`, `about/`, and `noticeboard/`.
