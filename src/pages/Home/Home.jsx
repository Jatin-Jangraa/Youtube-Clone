import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import VideoCard from "../../components/VideoCard/VideoCard";
import ErrorView from "../../components/ErrorView/ErrorView";
import Loader, { SkeletonCard } from "../../components/Loader/Loader";
import { useChannelThumbnails } from "../../hooks/useChannelThumbnails";
import { useLibrary } from "../../context/LibraryContext";
import { fetchPopularVideos } from "../../services/youtube";
import "./Home.css";

const VIDEO_KEY = (video) => video.id?.videoId || video.id;

const MAX_CATEGORIES = 4;
const VIDEOS_PER_CATEGORY = 15;

export default function Home() {
  const { history } = useLibrary();

  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [recommended, setRecommended] = useState(false);
  const sentinelRef = useRef(null);

  const watchedIds = useMemo(
    () => new Set(history.map((video) => video.id)),
    [history]
  );

  const channelThumbnails = useChannelThumbnails(videos);

  const loadRecommendations = useCallback(async () => {
    const categories = [];
    for (const video of history) {
      const categoryId = Number(video.categoryId);
      if (categoryId && !categories.includes(categoryId)) {
        categories.push(categoryId);
      }
      if (categories.length >= MAX_CATEGORIES) break;
    }
    if (categories.length === 0) return false;

    try {
      const results = await Promise.all(
        categories.map((categoryId) =>
          fetchPopularVideos("", VIDEOS_PER_CATEGORY, categoryId)
        )
      );
      const seen = new Set();
      const merged = [];
      for (const result of results) {
        for (const item of result.items || []) {
          const id = VIDEO_KEY(item);
          if (!id || seen.has(id) || watchedIds.has(id)) continue;
          seen.add(id);
          merged.push(item);
        }
      }
      setVideos(merged);
      setRecommended(true);
      return true;
    } catch {
      return false;
    }
  }, [history, watchedIds]);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVideos([]);
    setNextPageToken("");
    setRecommended(false);
    try {
      const usedRecommendations = await loadRecommendations();
      if (!usedRecommendations) {
        const result = await fetchPopularVideos();
        setVideos(result.items);
        setNextPageToken(result.nextPageToken);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadRecommendations]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || recommended || !nextPageToken || loading || loadingMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          fetchPopularVideos(nextPageToken)
            .then((result) => {
              setVideos((prev) => [...prev, ...result.items]);
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
  }, [nextPageToken, loading, loadingMore, recommended]);

  return (
    <div className="home-page">
      {recommended && (
        <div className="home-heading">
          <h2>Recommended for you</h2>
          <p>Based on your watch history</p>
        </div>
      )}

      {error && <ErrorView message={error} onRetry={loadFirstPage} />}

      {loading ? (
        <div className="feed-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {videos.length === 0 && !error ? (
            <div className="home-empty">
              No videos found. Try again later.
            </div>
          ) : (
            <div className="feed-grid">
              {videos.map((video) => (
                <VideoCard
                  key={VIDEO_KEY(video)}
                  video={video}
                  channelThumbnails={channelThumbnails}
                />
              ))}
            </div>
          )}
          <div ref={sentinelRef} className="feed-sentinel">
            {loadingMore && <Loader label="Loading more videos..." />}
            {!nextPageToken && videos.length > 0 && !loading && (
              <p className="feed-end">You&apos;ve reached the end of the feed.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
