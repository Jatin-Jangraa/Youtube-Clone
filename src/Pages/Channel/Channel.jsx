import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchChannelById,
  fetchChannelVideos,
  fetchVideosByIds,
} from "../../services/youtube";
import { compactNumber } from "../../services/format";
import { useLibrary } from "../../context/LibraryContext";
import VideoCard from "../../components/VideoCard/VideoCard";
import ErrorView from "../../components/ErrorView/ErrorView";
import Loader from "../../components/Loader/Loader";
import "./Channel.css";

export default function Channel() {
  const { channelId } = useParams();
  const { toggleSub, subscriptions } = useLibrary();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  const loadChannel = useCallback(async () => {
    setLoading(true);
    setError(null);
    setChannel(null);
    setVideos([]);
    setNextPageToken("");
    try {
      const details = await fetchChannelById(channelId);
      if (!details) {
        setError("Channel not found.");
        return;
      }
      setChannel(details);
      await loadVideos(details.contentDetails.relatedPlaylists.uploads);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  const loadVideos = async (playlistId, token = "") => {
    const result = await fetchChannelVideos(playlistId, token);
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
    const mapped = result.items.map((item) => {
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
    return { items: mapped, nextPageToken: result.nextPageToken || "" };
  };

  useEffect(() => {
    loadChannel();
  }, [loadChannel]);

  useEffect(() => {
    const el = sentinelRef.current;
    const uploads = channel?.contentDetails?.relatedPlaylists?.uploads;
    if (!el || !uploads || !nextPageToken || loading || loadingMore) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          loadVideos(uploads, nextPageToken)
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
  }, [channel, nextPageToken, loading, loadingMore]);

  const isSubscribed = subscriptions.some((c) => c.id === channelId);

  if (error) return <ErrorView message={error} onRetry={loadChannel} />;
  if (loading) {
    return (
      <div className="channel-loading">
        <Loader label="Loading channel..." />
      </div>
    );
  }

  const bannerUrl =
    channel.brandingSettings?.image?.bannerImageUrl ||
    channel.snippet?.thumbnails?.high?.url;

  return (
    <div className="channel-page">
      {bannerUrl && (
        <div className="channel-banner">
          <img src={bannerUrl} alt="" />
        </div>
      )}

      <div className="channel-header">
        <img
          className="channel-logo"
          src={
            channel.snippet.thumbnails?.medium?.url ||
            channel.snippet.thumbnails?.default?.url
          }
          alt={channel.snippet.title}
        />
        <div className="channel-header-info">
          <h1 className="channel-title">{channel.snippet.title}</h1>
          <p className="channel-handle">
            @{channel.snippet.customUrl?.replace("@", "") || channelId}
          </p>
          <p className="channel-stats">
            {compactNumber(channel.statistics.subscriberCount)} subscribers •{" "}
            {compactNumber(channel.statistics.videoCount)} videos
          </p>
        </div>
        <button
          className={`primary-btn channel-subscribe ${isSubscribed ? "active" : ""}`}
          type="button"
          onClick={() =>
            toggleSub({
              id: channel.id,
              name: channel.snippet.title,
              avatar:
                channel.snippet.thumbnails?.default?.url ||
                channel.snippet.thumbnails?.medium?.url,
            })
          }
        >
          {isSubscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>

      {channel.snippet.description && (
        <p className="channel-description">{channel.snippet.description}</p>
      )}

      <h2 className="channel-videos-heading">Videos</h2>
      {videos.length === 0 ? (
        <p className="channel-empty">This channel has no videos yet.</p>
      ) : (
        <div className="channel-grid">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="channel-sentinel">
        {loadingMore && <Loader label="Loading more videos..." />}
        {!nextPageToken && videos.length > 0 && (
          <p className="channel-end">You&apos;ve reached the end.</p>
        )}
      </div>
    </div>
  );
}
