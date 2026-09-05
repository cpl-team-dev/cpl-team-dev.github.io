const CONTACT_FALLBACK_OPEN_TIMES =
  "Tuesday: 10am-1pm; Wednesday: 10am-1pm; Saturday: 10am-1pm";

const CONTACT_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseContactTime(value) {
  const match = String(value)
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  if (hours < 1 || hours > 12 || minutes > 59) return null;
  if (hours === 12) hours = 0;
  if (match[3] === "pm") hours += 12;
  return hours * 60 + minutes;
}

function parseContactOpenTimes(value) {
  if (typeof value !== "string" || !value.trim()) return [];

  return value
    .split(";")
    .map((entry) => {
      const separatorIndex = entry.indexOf(":");
      if (separatorIndex < 0) return null;

      const suppliedDay = entry.slice(0, separatorIndex).trim();
      const shortDay = suppliedDay.substring(0, 3);
      const jsDay = CONTACT_WEEKDAYS.findIndex(
        (weekday) =>
          weekday.substring(0, 3).toLowerCase() === shortDay.toLowerCase(),
      );
      const rawHours = entry.slice(separatorIndex + 1).trim();
      if (jsDay < 0 || !rawHours) return null;

      const range = rawHours.split(/\s*[-–—]\s*/);
      const startMinutes = parseContactTime(range[0]);
      const endMinutes = parseContactTime(range[1]);

      return {
        jsDay,
        short: suppliedDay.substring(0, 3),
        label: suppliedDay,
        hours: rawHours.replace(/\s*[-–—]\s*/, " – "),
        startMinutes,
        endMinutes,
      };
    })
    .filter(Boolean);
}

function parseContactCustomFields(value) {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch (_error) {
    return {};
  }
}

function createContactClockIcon() {
  const wrapper = document.createElement("span");
  wrapper.className = "announce-slot-icon";
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.innerHTML =
    '<svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M12 2.8A9.2 9.2 0 1 0 21.2 12 9.2 9.2 0 0 0 12 2.8Zm0 1.8A7.4 7.4 0 1 1 4.6 12 7.4 7.4 0 0 1 12 4.6Zm-.9 2.8v5.1c0 .2.1.5.3.6l3.5 2.4 1-1.5-2.9-2V7.4h-1.8Z" /></svg>';
  return wrapper;
}

function renderContactOpeningHours(openDays) {
  const todayIdx = new Date().getDay();

  document
    .querySelectorAll('[data-opening-hours="banner"]')
    .forEach((container) => {
      const fragment = document.createDocumentFragment();

      openDays.forEach((day) => {
        const slot = document.createElement("div");
        slot.className = "announce-slot";
        slot.dataset.openDay = String(day.jsDay);
        slot.setAttribute("role", "listitem");
        slot.classList.toggle("is-today", day.jsDay === todayIdx);
        slot.append(createContactClockIcon());

        const label = document.createElement("span");
        label.className = "announce-day";
        label.textContent = day.short;
        slot.append(label);

        const hours = document.createElement("span");
        hours.className = "announce-time";
        hours.textContent = day.hours;
        slot.append(hours);
        fragment.append(slot);
      });

      container.replaceChildren(fragment);
    });

  document
    .querySelectorAll('[data-opening-hours="contact"]')
    .forEach((container) => {
      const fragment = document.createDocumentFragment();

      openDays.forEach((day) => {
        const row = document.createElement("span");
        row.className = "contact-hours";

        const label = document.createElement("span");
        label.textContent = day.label;
        const hours = document.createElement("strong");
        hours.textContent = day.hours;
        row.append(label, hours);
        fragment.append(row);
      });

      container.replaceChildren(fragment);
    });

  document
    .querySelectorAll('[data-opening-hours="visit"]')
    .forEach((container) => {
      const fragment = document.createDocumentFragment();

      openDays.forEach((day) => {
        const row = document.createElement("span");
        const label = document.createElement("em");
        label.textContent = day.label;
        const hours = document.createElement("strong");
        hours.textContent = day.hours;
        row.append(label, hours);
        fragment.append(row);
      });

      container.replaceChildren(fragment);
    });
}

function updateContactOpeningStatus(openDays) {
  const now = new Date();
  const today = openDays.find((day) => day.jsDay === now.getDay());
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const hasTimeRange =
    today &&
    Number.isFinite(today.startMinutes) &&
    Number.isFinite(today.endMinutes);
  const isCurrentlyOpen =
    hasTimeRange &&
    nowMinutes >= today.startMinutes &&
    nowMinutes < today.endMinutes;
  const opensLaterToday = hasTimeRange && nowMinutes < today.startMinutes;
  const status = document.querySelector("[data-opening-status]");
  const statusText = status?.querySelector(".announce-status-text");

  document.querySelectorAll(".announce-slot").forEach((slot) => {
    slot.classList.toggle(
      "is-today",
      Number(slot.getAttribute("data-open-day")) === now.getDay(),
    );
  });

  if (!status || !statusText) return;

  status.classList.toggle("is-open", Boolean(isCurrentlyOpen));
  statusText.textContent = isCurrentlyOpen
    ? "Open now"
    : opensLaterToday
      ? `Closed - opens ${today.hours.split("–")[0].trim()}`
      : "Closed today";
}

function updateContactPlaytime(customFields) {
  const lineOne = customFields.free_playtimes_line_1;
  const lineTwo = customFields.free_playtimes_line_2;

  if (typeof lineOne === "string" && lineOne.trim()) {
    document
      .querySelectorAll('[data-free-playtimes-line="1"]')
      .forEach((element) => {
        element.textContent = lineOne.trim();
      });
  }

  if (typeof lineTwo === "string" && lineTwo.trim()) {
    document
      .querySelectorAll('[data-free-playtimes-line="2"]')
      .forEach((element) => {
        element.textContent = lineTwo.trim();
      });
  }
}

async function loadContactOrganisationSchedule() {
  if (
    typeof API_BASE_URL !== "string" ||
    !API_BASE_URL.trim() ||
    typeof ORGANISATION_ID !== "string" ||
    !ORGANISATION_ID.trim()
  ) {
    return;
  }

  try {
    const baseUrl = API_BASE_URL.replace(/\/+$/, "");
    const query = new URLSearchParams({ organisation_id: ORGANISATION_ID });
    const response = await fetch(
      `${baseUrl}/organisation?${query.toString()}`,
      {
        headers: { Accept: "application/json" },
      },
    );
    if (!response.ok) return;

    const result = await response.json();
    const record = result?.record || result?.organisation || result?.data;
    const customFields = parseContactCustomFields(record?.custom_1);
    const parsedOpenDays = parseContactOpenTimes(customFields.open_times);

    const banner = document.querySelector("[data-announce-carousel]");
    if (banner) banner.dataset.scheduleSource = "organisation";

    if (parsedOpenDays.length) {
      renderContactOpeningHours(parsedOpenDays);
      updateContactOpeningStatus(parsedOpenDays);
    }
    updateContactPlaytime(customFields);
  } catch (_error) {
    // The static fallback remains visible if the organisation service is unavailable.
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const fallbackOpenDays = parseContactOpenTimes(CONTACT_FALLBACK_OPEN_TIMES);
  renderContactOpeningHours(fallbackOpenDays);
  updateContactOpeningStatus(fallbackOpenDays);
  loadContactOrganisationSchedule();

  const announceCarousel = document.querySelector("[data-announce-carousel]");
  if (announceCarousel) {
    const panels = Array.from(
      announceCarousel.querySelectorAll("[data-announce-panel]"),
    );
    const dots = Array.from(
      announceCarousel.querySelectorAll("[data-announce-dot]"),
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let activeIndex = 0;
    let rotationId;

    const showPanel = (nextIndex) => {
      activeIndex = (nextIndex + panels.length) % panels.length;
      panels.forEach((panel, index) => {
        const isActive = index === activeIndex;
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
        panel.inert = !isActive;
      });
      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    const startRotation = () => {
      if (!prefersReducedMotion && !rotationId) {
        announceCarousel.classList.remove("is-paused");
        rotationId = window.setInterval(() => showPanel(activeIndex + 1), 5000);
      }
    };

    const stopRotation = () => {
      window.clearInterval(rotationId);
      rotationId = undefined;
      announceCarousel.classList.add("is-paused");
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showPanel(index);
        stopRotation();
        startRotation();
      });
    });

    announceCarousel.addEventListener("mouseenter", stopRotation);
    announceCarousel.addEventListener("mouseleave", startRotation);
    announceCarousel.addEventListener("focusin", stopRotation);
    announceCarousel.addEventListener("focusout", (event) => {
      if (!announceCarousel.contains(event.relatedTarget)) startRotation();
    });

    showPanel(activeIndex);
    startRotation();
  }
});
