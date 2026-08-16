import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import {
  fetchPlaylistById,
  fetchChannelVideos,
  fetchVideosByIds,
} from "../../services/youtube";
import { useLibrary } from "../../context/LibraryContext";
import { useChannelThumbnails } from "../../hooks/useChannelThumbnails";
import VideoCard from "../../components/VideoCard/VideoCard";
import ErrorView from "../../components/ErrorView/ErrorView";
import Loader from "../../components/Loader/Loader";
import "./Playlist.css";

export default function Playlist() {
  const { playlistId } = useParams();
  const { toggleSub, subscriptions } = useLibrary();

  const [playlist, setPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  const channelThumbnails = useChannelThumbnails(videos);

  const enrich = async (result) => {
    const ids = result.items
      .map((item) => item.contentDetails?.videoId)
      .filter(Boolean);
    let enriched = [];
    if (ids.length > 0) {
      try {
        enriched = await fetchVideosByIds(ids);
      } catch {
        enriched = [];
      }
    }
    const byId = {};
    enriched.forEach((v) => {
      byId[v.id] = v;
    });
    return result.items.map((item) => {
      const full = byId[item.contentDetails?.videoId];
      if (full) return full;
      return {
        id: item.contentDetails?.videoId,
        snippet: {
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          thumbnails: item.snippet.thumbnails,
          publishedAt: item.snippet.publishedAt,
        },
      };
    });
  };

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPlaylist(null);
    setVideos([]);
    setNextPageToken("");
    try {
      const details = await fetchPlaylistById(playlistId);
      if (!details) {
        setError("Playlist not found.");
        return;
      }
      setPlaylist(details);
      const result = await fetchChannelVideos(playlistId);
      setVideos(await enrich(result));
      setNextPageToken(result.nextPageToken || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !playlistId || !nextPageToken || loading || loadingMore) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          fetchChannelVideos(playlistId, nextPageToken)
            .then(async (result) => {
              const enriched = await enrich(result);
              setVideos((prev) => [...prev, ...enriched]);
              setNextPageToken(result.nextPageToken || "");
            })
            .catch(() => {})
            .finally(() => setLoadingMore(false));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [playlistId, nextPageToken, loading, loadingMore]);

  const isSubscribed = subscriptions.some(
    (c) => c.id === playlist?.snippet?.channelId
  );

  if (error) return <ErrorView message={error} onRetry={loadFirstPage} />;
  if (loading) {
    return (
      <div className="playlist-loading">
        <Loader label="Loading playlist..." />
      </div>
    );
  }

  const snippet = playlist?.snippet || {};
  const itemCount = playlist?.contentDetails?.itemCount || videos.length;

  return (
    <div className="playlist-page">
      <div className="playlist-hero">
        <Link
          className="playlist-hero-thumb"
          to={videos[0] ? `/watch/${videos[0].id?.videoId || videos[0].id}` : "#"}
          aria-label="Play first video in playlist"
        >
          {snippet.thumbnails?.maxres?.url ||
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ? (
            <img
              src={
                snippet.thumbnails?.maxres?.url ||
                snippet.thumbnails?.high?.url ||
                snippet.thumbnails?.medium?.url
              }
              alt={snippet.title}
            />
          ) : (
            <span className="playlist-hero-placeholder" aria-hidden="true" />
          )}
          <span className="playlist-hero-overlay">
            <FaPlay />
            <span>Play all</span>
          </span>
        </Link>

        <div className="playlist-hero-info">
          <h1 className="playlist-title">{snippet.title || "Untitled playlist"}</h1>
          <p className="playlist-meta">
            {playlist?.snippet?.channelTitle}
            {itemCount > 0 ? ` • ${itemCount} videos` : ""}
          </p>
          {snippet.description && (
            <p className="playlist-desc">{snippet.description}</p>
          )}
          {snippet.channelId && (
            <button
              className={`primary-btn playlist-subscribe ${isSubscribed ? "active" : ""}`}
              type="button"
              onClick={() =>
                toggleSub({
                  id: snippet.channelId,
                  name: snippet.channelTitle,
                  avatar:
                    snippet.thumbnails?.default?.url ||
                    snippet.thumbnails?.medium?.url,
                })
              }
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          )}
        </div>
      </div>

      {videos.length === 0 ? (
        <p className="playlist-empty">This playlist has no videos yet.</p>
      ) : (
        <div className="playlist-grid">
          {videos.map((video) => (
            <VideoCard
              key={video.id?.videoId || video.id}
              video={video}
              channelThumbnails={channelThumbnails}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="playlist-sentinel">
        {loadingMore && <Loader label="Loading more videos..." />}
        {!nextPageToken && videos.length > 0 && (
          <p className="playlist-end">You&apos;ve reached the end.</p>
        )}
      </div>
    </div>
  );
}
