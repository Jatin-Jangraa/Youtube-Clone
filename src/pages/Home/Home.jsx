import { useCallback, useEffect, useRef, useState } from "react";
import VideoCard from "../../components/VideoCard/VideoCard";
import ErrorView from "../../components/ErrorView/ErrorView";
import Loader, { SkeletonCard } from "../../components/Loader/Loader";
import { useChannelThumbnails } from "../../hooks/useChannelThumbnails";
import { fetchPopularVideos } from "../../services/youtube";
import "./Home.css";

const VIDEO_KEY = (video) => video.id?.videoId || video.id;

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  const channelThumbnails = useChannelThumbnails(videos);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVideos([]);
    setNextPageToken("");
    try {
      const result = await fetchPopularVideos();
      setVideos(result.items);
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !nextPageToken || loading || loadingMore) return undefined;

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
  }, [nextPageToken, loading, loadingMore]);

  return (
    <div className="home-page">
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
            <div className="home-empty">No videos found. Try again later.</div>
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
