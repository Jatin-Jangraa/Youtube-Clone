const KEYS = {
  history: "jtube:history",
  watchLater: "jtube:watchLater",
  liked: "jtube:liked",
  theme: "jtube:theme",
  subscriptions: "jtube:subscriptions",
};

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getHistory() {
  return read(KEYS.history);
}

export function addToHistory(video) {
  if (!video?.id) return getHistory();
  const list = read(KEYS.history).filter((v) => v.id !== video.id);
  list.unshift(video);
  const trimmed = list.slice(0, 200);
  write(KEYS.history, trimmed);
  return trimmed;
}

export function clearHistory() {
  write(KEYS.history, []);
  return [];
}

export function getWatchLater() {
  return read(KEYS.watchLater);
}

export function toggleWatchLater(video) {
  const list = read(KEYS.watchLater);
  const exists = list.some((v) => v.id === video.id);
  const next = exists
    ? list.filter((v) => v.id !== video.id)
    : [video, ...list];
  write(KEYS.watchLater, next);
  return next;
}

export function isWatchLater(videoId) {
  return read(KEYS.watchLater).some((v) => v.id === videoId);
}

export function getLiked() {
  return read(KEYS.liked);
}

export function toggleLiked(video) {
  const list = read(KEYS.liked);
  const exists = list.some((v) => v.id === video.id);
  const next = exists ? list.filter((v) => v.id !== video.id) : [video, ...list];
  write(KEYS.liked, next);
  return next;
}

export function isLiked(videoId) {
  return read(KEYS.liked).some((v) => v.id === videoId);
}

export function getSubscriptions() {
  return read(KEYS.subscriptions);
}

export function toggleSubscription(channel) {
  const list = read(KEYS.subscriptions);
  const exists = list.some((c) => c.id === channel.id);
  const next = exists
    ? list.filter((c) => c.id !== channel.id)
    : [channel, ...list];
  write(KEYS.subscriptions, next);
  return next;
}

export function isSubscribed(channelId) {
  return read(KEYS.subscriptions).some((c) => c.id === channelId);
}

export function getTheme() {
  return localStorage.getItem(KEYS.theme) || "light";
}

export function setTheme(theme) {
  localStorage.setItem(KEYS.theme, theme);
}
