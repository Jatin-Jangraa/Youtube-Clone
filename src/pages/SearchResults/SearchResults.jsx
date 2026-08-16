import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import VideoCard from "../../components/VideoCard/VideoCard";
import PlaylistCard from "../../components/PlaylistCard/PlaylistCard";
import ChannelCard from "../../components/ChannelCard/ChannelCard";
import ErrorView from "../../components/ErrorView/ErrorView";
import EmptyState from "../../components/EmptyState/EmptyState";
import Loader, { SkeletonCard } from "../../components/Loader/Loader";
import { useChannelThumbnails } from "../../hooks/useChannelThumbnails";
import {
  searchVideos,
  fetchPlaylistsByIds,
  fetchChannelsByIds,
} from "../../services/youtube";
import "./SearchResults.css";

const VIDEO_KEY = (video) => video.id?.videoId || video.id;
const PLAYLIST_KEY = (item) => item.id?.playlistId || item.id;
const CHANNEL_KEY = (item) => item.id?.channelId || item.id;

const FILTERS = [
  { id: "all", label: "All" },
  { id: "video", label: "Videos" },
  { id: "playlist", label: "Playlists" },
  { id: "channel", label: "Channels" },
];

function kindOf(item) {
  return item?.id?.kind || "";
}

function isVideo(item) {
  return kindOf(item).includes("video") || !!item.id?.videoId;
}

function isPlaylist(item) {
  return kindOf(item).includes("playlist") || !!item.id?.playlistId;
}

function isChannel(item) {
  return kindOf(item).includes("channel") || !!item.id?.channelId;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const filter = searchParams.get("filter") || "all";

  const [items, setItems] = useState([]);
  const [nextPageToken, setNextPageToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [playlistCounts, setPlaylistCounts] = useState({});
  const [channelStats, setChannelStats] = useState({});
  const sentinelRef = useRef(null);

  const videos = useMemo(() => items.filter(isVideo), [items]);
  const channelThumbnails = useChannelThumbnails(videos);

  const loadFirstPage = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    setItems([]);
    setNextPageToken("");
    setPlaylistCounts({});
    setChannelStats({});
    try {
      const result = await searchVideos(q);
      setItems(result.items);
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query) loadFirstPage(query);
  }, [query, loadFirstPage]);

  useEffect(() => {
    const playlistIds = [
      ...new Set(
        items.filter(isPlaylist).map((item) => PLAYLIST_KEY(item)).filter(Boolean)
      ),
    ];
    const channelIds = [
      ...new Set(
        items.filter(isChannel).map((item) => CHANNEL_KEY(item)).filter(Boolean)
      ),
    ];

    if (playlistIds.length > 0) {
      fetchPlaylistsByIds(playlistIds)
        .then((playlists) => {
          const map = {};
          playlists.forEach((pl) => {
            map[pl.id] = pl.contentDetails?.itemCount || 0;
          });
          setPlaylistCounts((prev) => ({ ...prev, ...map }));
        })
        .catch(() => {});
    }
    if (channelIds.length > 0) {
      fetchChannelsByIds(channelIds)
        .then((channels) => {
          const map = {};
          channels.forEach((ch) => {
            map[ch.id] = ch;
          });
          setChannelStats((prev) => ({ ...prev, ...map }));
        })
        .catch(() => {});
    }
  }, [items]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !query || !nextPageToken || loading || loadingMore) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          searchVideos(query, nextPageToken)
            .then((result) => {
              setItems((prev) => [...prev, ...result.items]);
              setNextPageToken(result.nextPageToken);
            })
            .catch(() => {})
            .finally(() => setLoadingMore(false));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [query, nextPageToken, loading, loadingMore]);

  const filteredItems = useMemo(() => {
    if (filter === "video") return videos;
    if (filter === "playlist") return items.filter(isPlaylist);
    if (filter === "channel") return items.filter(isChannel);
    return items;
  }, [items, videos, filter]);

  const handleFilter = (id) => {
    setSearchParams(
      id === "all" ? { q: query } : { q: query, filter: id },
      { replace: true }
    );
  };

  const renderItem = (item) => {
    if (isPlaylist(item)) {
      return (
        <PlaylistCard
          key={PLAYLIST_KEY(item)}
          playlist={item}
          itemCount={playlistCounts[PLAYLIST_KEY(item)]}
        />
      );
    }
    if (isChannel(item)) {
      return (
        <ChannelCard
          key={CHANNEL_KEY(item)}
          channel={item}
          stats={channelStats[CHANNEL_KEY(item)]}
        />
      );
    }
    return (
      <VideoCard
        key={VIDEO_KEY(item)}
        video={item}
        channelThumbnails={channelThumbnails}
        layout="row"
      />
    );
  };

  if (!query) {
    return (
      <EmptyState
        icon={<IoSearch />}
        title="Search YouTube"
        message="Type something in the search bar to find videos, playlists and channels."
      />
    );
  }

  return (
    <div className="search-results">
      <h1 className="search-title">
        Results for <span>&quot;{query}&quot;</span>
      </h1>

      <div className="search-filters" aria-label="Result filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            className={`pill-btn filter-tab ${filter === f.id ? "active" : ""}`}
            onClick={() => handleFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <ErrorView message={error} onRetry={() => loadFirstPage(query)} />}

      {loading ? (
        <div className="search-list">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<IoSearch />}
          title="No results found"
          message="Try different keywords or check the spelling."
        />
      ) : (
        <div className="search-list">{filteredItems.map(renderItem)}</div>
      )}

      <div ref={sentinelRef} className="search-sentinel">
        {loadingMore && <Loader label="Loading more results..." />}
        {!nextPageToken && filteredItems.length > 0 && !loading && (
          <p className="search-end">You&apos;ve reached the end of the results.</p>
        )}
      </div>
    </div>
  );
}
