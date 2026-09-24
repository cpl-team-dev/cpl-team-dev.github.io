// Local dev (served from localhost / 127.0.0.1) talks to `wrangler dev` and
// uses Cloudflare's always-pass Turnstile test sitekey; everywhere else uses
// the deployed Worker and the real sitekey. The local Worker must be given
// the matching test secret in .dev.vars — see the mjhub-backend README.
const IS_LOCAL_DEV = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);

const API_BASE_URL = IS_LOCAL_DEV
  ? 'http://localhost:8787'
  : 'https://mjhub-cloudflare-proxy.mjhubandservices.workers.dev';

const TURNSTILE_SITEKEY = IS_LOCAL_DEV
  ? '1x00000000000000000000AA'
  : '0x4AAAAAAEOzS56m0M5xjAFe';

const ORGANISATION_ID = '5d00b8c8-3fdf-484b-9bbe-ac49830f6265';
