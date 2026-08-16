const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const BASE_URL = "https://youtube.googleapis.com/youtube/v3";

if (!API_KEY) {
  console.error(
    "Missing VITE_YOUTUBE_API_KEY. Copy .env.example to .env and add your key."
  );
}

function buildUrl(path, params) {
  const url = new URL(`${BASE_URL}/${path}`);
  url.searchParams.set("key", API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const message = `YouTube API error ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

export async function fetchPopularVideos(pageToken = "", maxResults = 24) {
  const url = buildUrl("videos", {
    part: "snippet,contentDetails,statistics",
    chart: "mostPopular",
    maxResults,
    regionCode: "IN",
    pageToken,
  });
  const data = await getJson(url);
  return {
    items: data.items || [],
    nextPageToken: data.nextPageToken || "",
    totalResults: data.pageInfo?.totalResults || 0,
  };
}

export async function searchVideos(query, pageToken = "", maxResults = 24) {
  const url = buildUrl("search", {
    part: "snippet",
    maxResults,
    q: query,
    pageToken,
  });
  const data = await getJson(url);
  return {
    items: data.items || [],
    nextPageToken: data.nextPageToken || "",
    totalResults: data.pageInfo?.totalResults || 0,
  };
}

export async function fetchVideoById(videoId) {
  const url = buildUrl("videos", {
    part: "snippet,contentDetails,statistics",
    id: videoId,
  });
  const data = await getJson(url);
  return data.items?.[0] || null;
}

export async function fetchVideosByIds(ids) {
  const url = buildUrl("videos", {
    part: "snippet,contentDetails,statistics",
    id: ids.join(","),
    maxResults: 50,
  });
  const data = await getJson(url);
  return data.items || [];
}

export async function fetchChannelById(channelId) {
  const url = buildUrl("channels", {
    part: "snippet,contentDetails,statistics",
    id: channelId,
  });
  const data = await getJson(url);
  return data.items?.[0] || null;
}

export async function fetchChannelsByIds(ids) {
  const url = buildUrl("channels", {
    part: "snippet,statistics",
    id: ids.join(","),
    maxResults: 50,
  });
  const data = await getJson(url);
  return data.items || [];
}

export async function fetchPlaylistById(playlistId) {
  const url = buildUrl("playlists", {
    part: "snippet,contentDetails,status",
    id: playlistId,
  });
  const data = await getJson(url);
  return data.items?.[0] || null;
}

export async function fetchPlaylistsByIds(ids) {
  const url = buildUrl("playlists", {
    part: "snippet,contentDetails",
    id: ids.join(","),
    maxResults: 50,
  });
  const data = await getJson(url);
  return data.items || [];
}

export async function fetchChannelVideos(playlistId, pageToken = "", maxResults = 24) {
  const url = buildUrl("playlistItems", {
    part: "snippet,contentDetails",
    maxResults,
    playlistId,
    pageToken,
  });
  const data = await getJson(url);
  return {
    items: data.items || [],
    nextPageToken: data.nextPageToken || "",
  };
}

export async function fetchComments(videoId, pageToken = "") {
  const url = buildUrl("commentThreads", {
    part: "snippet,replies",
    videoId,
    maxResults: 20,
    textFormat: "plainText",
    pageToken,
  });
  const data = await getJson(url);
  return {
    items: data.items || [],
    nextPageToken: data.nextPageToken || "",
    totalResults: data.pageInfo?.totalResults || 0,
  };
}
