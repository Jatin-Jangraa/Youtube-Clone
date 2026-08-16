const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const TIME_UNITS = [
  { label: "year", seconds: 31536000 },
  { label: "month", seconds: 2592000 },
  { label: "week", seconds: 604800 },
  { label: "day", seconds: 86400 },
  { label: "hour", seconds: 3600 },
  { label: "minute", seconds: 60 },
];

export function valueConvertor(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(num % 1000000000 === 0 ? 0 : 1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
  }
  return String(num);
}

export function fromNow(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
  for (const unit of TIME_UNITS) {
    if (Math.abs(seconds) >= unit.seconds) {
      return rtf.format(Math.round(seconds / unit.seconds), unit.label);
    }
  }
  return rtf.format(seconds, "second");
}

export function formatDuration(duration) {
  const match = duration?.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "";
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  const padded = (n) => String(n).padStart(2, "0");
  if (hours > 0) return `${hours}:${padded(minutes)}:${padded(seconds)}`;
  return `${minutes}:${padded(seconds)}`;
}

export function compactNumber(value) {
  return Number(value)?.toLocaleString("en-IN") ?? value;
}

export function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
}

export function getVideoIdFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}
