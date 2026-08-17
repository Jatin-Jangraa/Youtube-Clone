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

export async function fetchPopularVideos(
  pageToken = "",
  maxResults = 24,
  categoryId = ""
) {
  const url = buildUrl("videos", {
    part: "snippet,contentDetails,statistics",
    chart: "mostPopular",
    maxResults,
    regionCode: "IN",
    videoCategoryId: categoryId,
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

export async function searchVideosWithDetails(query, pageToken = "", maxResults = 12) {
  const url = buildUrl("search", {
    part: "snippet",
    maxResults,
    q: query,
    type: "video",
    pageToken,
  });
  const data = await getJson(url);
  const ids = (data.items || [])
    .map((item) => item.id?.videoId)
    .filter(Boolean);
  if (ids.length === 0) return { items: [], nextPageToken: "", totalResults: 0 };
  const videos = await fetchVideosByIds(ids);
  return {
    items: videos,
    nextPageToken: data.nextPageToken || "",
    totalResults: data.pageInfo?.totalResults || 0,
  };
}

export function extractKeywords(titles) {
  const stopwords = new Set([
    "the","a","an","is","are","was","were","be","been","being",
    "have","has","had","do","does","did","will","would","could",
    "should","may","might","shall","can","need","dare","ought",
    "used","to","of","in","for","on","with","at","by","from",
    "as","into","through","during","before","after","above","below",
    "between","out","off","over","under","again","further","then",
    "once","here","there","when","where","why","how","all","each",
    "every","both","few","more","most","other","some","such","no",
    "not","only","own","same","so","than","too","very","just",
    "but","and","or","if","while","about","up","its","it","he",
    "she","they","them","their","his","her","my","your","our",
    "this","that","these","those","what","which","who","whom",
    "episode","part","full","video","movie","song","official",
    "trailer","new","watch","live","hd","mp3","mp4",
  ]);

  const wordCount = {};
  for (const title of titles) {
    if (!title) continue;
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.has(w));
    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  }

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

export async function fetchRelatedVideos(videoId, categoryId = "", title = "") {
  const seen = new Set([videoId]);
  const results = [];

  const addItems = (items) => {
    for (const item of items || []) {
      const id = item.id?.videoId || item.id;
      if (!seen.has(id)) {
        seen.add(id);
        results.push(item);
      }
    }
  };

  if (title) {
    const searchQueries = [];

    const fullTitle = title.trim().slice(0, 100);
    if (fullTitle.length > 3) searchQueries.push(fullTitle);

    const noPipe = title.split(/[|\-–]/)[0].trim();
    if (noPipe.length > 5 && noPipe !== fullTitle) searchQueries.push(noPipe);

    const keywords = extractKeywords([title]);
    if (keywords.length >= 3) {
      searchQueries.push(keywords.slice(0, 3).join(" "));
    }

    const searchResults = await Promise.all(
      searchQueries.map((q) =>
        searchVideosWithDetails(q, "", 20).catch(() => ({ items: [] }))
      )
    );
    for (const r of searchResults) addItems(r.items);
  }

  if (results.length < 8 && categoryId) {
    try {
      const catResult = await fetchPopularVideos("", 20, categoryId);
      addItems(catResult.items);
    } catch {
      /* ignore */
    }
  }

  if (results.length < 8) {
    try {
      const popResult = await fetchPopularVideos("", 15);
      addItems(popResult.items);
    } catch {
      /* ignore */
    }
  }

  return results.slice(0, 24);
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
