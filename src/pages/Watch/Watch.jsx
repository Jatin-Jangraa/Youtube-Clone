import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { BiSolidLike, BiSolidDislike, BiLike } from "react-icons/bi";
import { IoIosShareAlt } from "react-icons/io";
import { FaClock, FaCheck } from "react-icons/fa6";
import { usePlayer } from "../../context/PlayerContext";
import { useLibrary } from "../../context/LibraryContext";
import {
  fetchVideoById,
  fetchChannelById,
  fetchPopularVideos,
} from "../../services/youtube";
import { valueConvertor, compactNumber, fromNow } from "../../services/format";
import VideoCard from "../../components/VideoCard/VideoCard";
import Comments from "../../components/Comments/Comments";
import ErrorView from "../../components/ErrorView/ErrorView";
import Loader from "../../components/Loader/Loader";
import { useChannelThumbnails } from "../../hooks/useChannelThumbnails";
import "./Watch.css";

export default function Watch() {
  const { videoId } = useParams();
  const { current, playVideo, setPlayerTarget, setInWatch } = usePlayer();
  const {
    recordView,
    toggleLike,
    toggleSave,
    toggleSub,
    liked,
    watchLater,
    subscriptions,
  } = useLibrary();

  const playerRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const channelThumbnails = useChannelThumbnails(recommendations);

  useEffect(() => {
    setPlayerTarget(playerRef.current);
    setInWatch(true);
    return () => {
      setPlayerTarget(null);
      setInWatch(false);
    };
  }, [setPlayerTarget, setInWatch]);

  useEffect(() => {
    if (current?.videoId !== videoId) {
      playVideo({ videoId });
    }
  }, [videoId, current?.videoId, playVideo]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setVideo(null);
    setChannel(null);
    setRecommendations([]);

    let cancelled = false;

    (async () => {
      try {
        const details = await fetchVideoById(videoId);
        if (cancelled || !details) {
          if (!cancelled) setError("Video unavailable.");
          return;
        }
        setVideo(details);

        const [channelResult, recsResult] = await Promise.allSettled([
          fetchChannelById(details.snippet.channelId),
          fetchPopularVideos("", 24),
        ]);
        if (cancelled) return;
        if (channelResult.status === "fulfilled") {
          setChannel(channelResult.value);
        }
        if (recsResult.status === "fulfilled") {
          setRecommendations(
            recsResult.value.items.filter(
              (rec) => (rec.id?.videoId || rec.id) !== videoId
            )
          );
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    if (video) {
      playVideo({
        videoId: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        thumbnail:
          video.snippet.thumbnails?.medium?.url ||
          video.snippet.thumbnails?.default?.url,
      });
    }
  }, [video, playVideo]);

  useEffect(() => {
    if (video) {
      recordView({
        id: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        thumbnail:
          video.snippet.thumbnails?.medium?.url ||
          video.snippet.thumbnails?.default?.url,
        publishedAt: video.snippet.publishedAt,
        viewCount: video.statistics?.viewCount,
        duration: video.contentDetails?.duration,
      });
    }
  }, [video, recordView]);

  const libraryVideo = useMemo(() => {
    if (!video) return null;
    return {
      id: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      thumbnail:
        video.snippet.thumbnails?.medium?.url ||
        video.snippet.thumbnails?.default?.url,
      publishedAt: video.snippet.publishedAt,
      viewCount: video.statistics?.viewCount,
      duration: video.contentDetails?.duration,
    };
  }, [video]);

  const isLiked = liked.some((v) => v.id === videoId);
  const isSaved = watchLater.some((v) => v.id === videoId);
  const isSubscribed = subscriptions.some((c) => c.id === video?.snippet?.channelId);

  const handleLike = () => {
    if (disliked) setDisliked(false);
    if (libraryVideo) toggleLike(libraryVideo);
  };

  const handleDislike = () => {
    if (isLiked && libraryVideo) toggleLike(libraryVideo);
    setDisliked((d) => !d);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const description = video?.snippet?.description || "";
  const showToggle = description.length > 250;
  const displayDescription =
    showToggle && !descExpanded
      ? `${description.slice(0, 250)}...`
      : description;

  if (error) return <ErrorView message={error} />;
  if (loading) return <Loader label="Loading video..." />;

  return (
    <div className="watch-page">
      <div className="watch-main">
        <div className="player-shell">
          <div className="player-area" ref={playerRef} />
          {!current && (
            <div className="player-placeholder">
              <h3>No video playing</h3>
              <p>Choose a video from the feed or recommendations.</p>
            </div>
          )}
        </div>

        <h1 className="watch-title">
          {video?.snippet?.title || "Untitled"}
        </h1>

        <div className="watch-meta">
          <span>{valueConvertor(video.statistics.viewCount)} views</span>
          <span className="meta-dot">•</span>
          <span>{fromNow(video.snippet.publishedAt)}</span>
        </div>

        <div className="watch-actions">
          <div className="like-box">
            <button
              className={`action like ${isLiked ? "active" : ""}`}
              type="button"
              onClick={handleLike}
            >
              {isLiked ? <BiSolidLike /> : <BiLike />}
              {valueConvertor(video.statistics.likeCount)}
            </button>
            <button
              className={`action dislike ${disliked ? "active" : ""}`}
              type="button"
              title="Dislike"
              aria-label="Dislike"
              onClick={handleDislike}
            >
              <BiSolidDislike />
            </button>
          </div>

          <button className="action" type="button" onClick={handleShare}>
            <IoIosShareAlt />
            {copied ? "Copied" : "Share"}
          </button>

          <button
            className={`action ${isSaved ? "active" : ""}`}
            type="button"
            onClick={() => libraryVideo && toggleSave(libraryVideo)}
          >
            {isSaved ? <FaCheck /> : <FaClock />}
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>

        {channel && (
          <div className="watch-channel">
            <img
              className="channel-avatar"
              src={
                channel.snippet.thumbnails?.default?.url ||
                channel.snippet.thumbnails?.medium?.url
              }
              alt={channel.snippet.title}
            />
            <div className="channel-info">
              <p className="channel-name">{channel.snippet.title}</p>
              <p className="channel-subs">
                {compactNumber(channel.statistics.subscriberCount)} subscribers
              </p>
            </div>
            <button
              className={`primary-btn subscribe-btn ${isSubscribed ? "active" : ""}`}
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
        )}

        {description && (
          <div className="watch-description">
            <p className="desc-text">{displayDescription}</p>
            {showToggle && (
              <button
                className="desc-toggle"
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
              >
                {descExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        <Comments videoId={videoId} />
      </div>

      <aside className="watch-side">
        <h3 className="watch-side-heading">Up next</h3>
        {recommendations.length === 0 ? (
          <p className="watch-side-empty">No recommendations available.</p>
        ) : (
          <div className="watch-side-list">
            {recommendations.map((rec) => (
              <VideoCard
                key={rec.id?.videoId || rec.id}
                video={rec}
                channelThumbnails={channelThumbnails}
                layout="row"
              />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
