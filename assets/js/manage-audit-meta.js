function parseManageAuditMeta(rawValue) {
  let parsed = rawValue;

  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();
    if (!trimmed) return { modifiedBy: "", modifiedAt: "" };
    try {
      parsed = JSON.parse(trimmed);
    } catch (error) {
      return { modifiedBy: "", modifiedAt: "" };
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { modifiedBy: "", modifiedAt: "" };
  }

  return {
    modifiedBy: parsed.modified_by ? String(parsed.modified_by) : "",
    modifiedAt: parsed.modified_at ? parsed.modified_at : "",
  };
}

function formatManageAuditTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getManageAuditMetaDisplay(rawValue) {
  const meta = parseManageAuditMeta(rawValue);
  return {
    modifiedBy: meta.modifiedBy || "Not present",
    modifiedAt: meta.modifiedAt ? formatManageAuditTimestamp(meta.modifiedAt) : "Not present",
  };
}
