const NOTICEBOARD_BLOG_PATH = "/blog";
const NOTICEBOARD_PAGE_SIZE = 50;
const NOTICEBOARD_TARGET_PARAM = "title";
const NOTICEBOARD_SCROLL_OFFSET = 24;

document.addEventListener("DOMContentLoaded", () => {
  const stack = document.getElementById("post-stack");
  if (!stack) return;

  loadNoticeboardPosts(stack, getRequestedPostSlug());
});

async function loadNoticeboardPosts(stack, requestedPostSlug) {
  try {
    const posts = await fetchAllBlogPosts();
    renderNoticeboardPosts(stack, posts, requestedPostSlug);
  } catch (error) {
    console.error("Failed to load noticeboard posts.", error);
    renderNoticeboardStatus(
      stack,
      "We couldn't load the latest news, please come back later and try again.",
      "error",
    );
  }
}

async function fetchAllBlogPosts() {
  if (typeof manageApiGet !== "function") {
    throw new Error("Noticeboard API is unavailable.");
  }

  const allPosts = [];
  let startRow = 1;

  while (true) {
    const result = await manageApiGet(NOTICEBOARD_BLOG_PATH, {
      startRow: startRow,
      endRow: startRow + NOTICEBOARD_PAGE_SIZE - 1,
    });
    const page = typeof extractApiList === "function" ? extractApiList(result) : [];

    allPosts.push(...page);

    const pagination =
      typeof extractApiPagination === "function"
        ? extractApiPagination(result, startRow, NOTICEBOARD_PAGE_SIZE, page.length)
        : {
            hasMore: page.length >= NOTICEBOARD_PAGE_SIZE,
            nextStartRow: startRow + page.length,
          };

    if (!pagination.hasMore || page.length === 0) {
      break;
    }

    startRow = pagination.nextStartRow;
  }

  return allPosts
    .map(normalisePost)
    .filter((post) => post.title && post.status !== "draft")
    .sort((a, b) => b.createdAtTime - a.createdAtTime);
}

function normalisePost(post) {
  const title = getTrimmedString(post && post.title);
  const excerpt = getTrimmedString(post && (post.exerpt || post.excerpt));
  const content = getTrimmedString(post && post.content);
  const tags = getTagList(post && post.tags);
  const createdAt = getTrimmedString(post && post.created_at);
  const createdAtTime = Date.parse(createdAt);

  return {
    id: getTrimmedString(post && post.id) || title,
    title: title,
    excerpt: excerpt || createExcerpt(content),
    content: content,
    imageUrl: getTrimmedString(post && post.image_url),
    status: getTrimmedString(post && post.status).toLowerCase(),
    tags: tags,
    createdAt: createdAt,
    createdAtTime: Number.isNaN(createdAtTime) ? 0 : createdAtTime,
  };
}

function renderNoticeboardPosts(stack, posts, requestedPostSlug) {
  if (!posts.length) {
    renderNoticeboardStatus(stack, "No noticeboard posts are available right now.", "empty");
    return;
  }

  stack.innerHTML = posts
    .map((post) => renderPostMarkup(post, requestedPostSlug))
    .join("");

  stack.querySelectorAll("[data-post-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".post-card");
      togglePostCard(card, button.getAttribute("aria-expanded") !== "true");
    });
  });

  revealRequestedPost(stack, requestedPostSlug);
}

function renderNoticeboardStatus(stack, message, state) {
  stack.innerHTML = `
    <div class="card noticeboard-status noticeboard-status-${escapeHtml(state)}">
      ${escapeHtml(message)}
    </div>
  `;
}

function renderPostMarkup(post, requestedPostSlug) {
  const categories = post.tags.length ? post.tags.join(" / ") : "General";
  const categoriesAttr = post.tags.join(" ").toLowerCase();
  const showExpandableContent = hasExpandableContent(post);
  const postSlug = createPostSlug(post.title);
  const isRequestedPost = Boolean(requestedPostSlug && postSlug === requestedPostSlug);
  const imageMarkup = post.imageUrl
    ? `
        <img
          src="${escapeHtml(post.imageUrl)}"
          alt="${escapeHtml(post.title)}"
          loading="${isRequestedPost ? "eager" : "lazy"}"
        />
      `
    : "";
  const excerptHiddenAttr = isRequestedPost && showExpandableContent ? " hidden" : "";
  const contentHiddenAttr = isRequestedPost ? "" : " hidden";
  const contentMarkup = showExpandableContent
    ? `
        <button
          class="link-red post-toggle"
          type="button"
          data-post-toggle
          aria-expanded="${isRequestedPost ? "true" : "false"}"
        >
          ${isRequestedPost ? "Show Less &rsaquo;" : "Continue Reading &rsaquo;"}
        </button>
        <div class="post-content" data-post-content${contentHiddenAttr}>
          ${formatContent(post.content)}
        </div>
      `
    : "";

  return `
    <article
      class="card post-card${isRequestedPost ? " post-card-targeted" : ""}"
      data-categories="${escapeHtml(categoriesAttr)}"
      data-expanded="${isRequestedPost ? "true" : "false"}"
      data-post-slug="${escapeHtml(postSlug)}"
    >
      ${imageMarkup}
      <h2>${escapeHtml(post.title)}</h2>
      <div class="post-meta">
        👤 Community Playlink Admin &middot; ⏱ ${escapeHtml(formatDisplayDate(post.createdAt))}
      </div>
      <div class="post-cats">📁 ${escapeHtml(categories)}</div>
      <div class="post-excerpt"${excerptHiddenAttr}>${renderInlineContent(post.excerpt)}</div>
      ${contentMarkup}
    </article>
  `;
}

function revealRequestedPost(stack, requestedPostSlug) {
  if (!requestedPostSlug) return;

  const card = stack.querySelector(`[data-post-slug="${requestedPostSlug}"]`);
  if (!card) return;

  const targetButton = card.querySelector("[data-post-toggle]");
  if (targetButton && targetButton.getAttribute("aria-expanded") !== "true") {
    togglePostCard(card, true);
  }

  waitForCardAssets(card).finally(() => {
    scrollPostCardIntoView(card);

    window.setTimeout(() => {
      scrollPostCardIntoView(card);
    }, 450);
  });
}

function togglePostCard(card, shouldExpand) {
  const button = card ? card.querySelector("[data-post-toggle]") : null;
  const content = card ? card.querySelector("[data-post-content]") : null;
  const excerpt = card ? card.querySelector(".post-excerpt") : null;
  if (!card || !button || !content) return;

  button.setAttribute("aria-expanded", shouldExpand ? "true" : "false");
  button.textContent = shouldExpand ? "Show Less ›" : "Continue Reading ›";
  card.dataset.expanded = shouldExpand ? "true" : "false";
  content.hidden = !shouldExpand;

  if (excerpt) {
    excerpt.hidden = shouldExpand;
  }
}

function scrollPostCardIntoView(card) {
  const top = card.getBoundingClientRect().top + window.scrollY - NOTICEBOARD_SCROLL_OFFSET;
  window.scrollTo({
    top: Math.max(top, 0),
    behavior: "smooth",
  });
}

function waitForCardAssets(card) {
  const pendingImages = Array.from(card.querySelectorAll("img")).filter((image) => !image.complete);

  if (!pendingImages.length) {
    return Promise.resolve();
  }

  return Promise.race([
    Promise.all(
      pendingImages.map(
        (image) =>
          new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          }),
      ),
    ),
    new Promise((resolve) => {
      window.setTimeout(resolve, 1200);
    }),
  ]);
}

function getRequestedPostSlug() {
  try {
    const params = new URLSearchParams(window.location.search);
    return createPostSlug(params.get(NOTICEBOARD_TARGET_PARAM));
  } catch {
    return "";
  }
}

function createPostSlug(value) {
  return getTrimmedString(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getTagList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => getTrimmedString(item))
      .filter(Boolean);
  }

  return getTrimmedString(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createExcerpt(content) {
  const plainText = content.replace(/\s+/g, " ").trim();
  if (!plainText) return "";
  if (plainText.length <= 180) return plainText;
  return `${plainText.slice(0, 177).trimEnd()}...`;
}

function formatDisplayDate(value) {
  if (!value) return "Date unavailable";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatContent(content) {
  const formatted = renderInlineContent(content)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br />");

  return formatted ? `<p>${formatted}</p>` : "";
}

function renderInlineContent(content) {
  const source = String(content == null ? "" : content);
  const markdownLinkPattern = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;

  let html = "";
  let lastIndex = 0;
  let match;

  while ((match = markdownLinkPattern.exec(source)) !== null) {
    const matchIndex = match.index;
    const matchText = match[0];
    const label = match[1];
    const rawHref = match[2];
    const safeHref = getSafeHref(rawHref);

    html += escapeHtml(source.slice(lastIndex, matchIndex));

    if (safeHref) {
      html += buildAnchorMarkup(label, safeHref);
    } else {
      html += escapeHtml(matchText);
    }

    lastIndex = matchIndex + matchText.length;
  }

  html += escapeHtml(source.slice(lastIndex));
  return html;
}

function buildAnchorMarkup(label, href) {
  const escapedLabel = escapeHtml(label);
  const escapedHref = escapeHtml(href);
  const externalAttrs = isExternalHref(href)
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";

  return `<a href="${escapedHref}"${externalAttrs}>${escapedLabel}</a>`;
}

function getSafeHref(value) {
  const href = getTrimmedString(value);
  if (!href) return "";

  if (/^https?:\/\//i.test(href)) {
    try {
      const parsed = new URL(href);
      return /^https?:$/i.test(parsed.protocol) ? parsed.href : "";
    } catch {
      return "";
    }
  }

  if (/^(\/(?!\/)|\.{1,2}\/)/.test(href)) {
    return href;
  }

  return "";
}

function isExternalHref(href) {
  try {
    const parsed = new URL(href, window.location.href);
    return parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function hasExpandableContent(post) {
  if (!post.content) return false;

  return normaliseWhitespace(post.content) !== normaliseWhitespace(post.excerpt);
}

function normaliseWhitespace(value) {
  return getTrimmedString(value).replace(/\s+/g, " ");
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}
