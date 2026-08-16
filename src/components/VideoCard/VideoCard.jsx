import { Link } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";
import {
  valueConvertor,
  fromNow,
  formatDuration,
} from "../../services/format";
import "./VideoCard.css";

export default function VideoCard({ video, channelThumbnails = {}, layout = "grid" }) {
  const { playVideo } = usePlayer();
  const snippet = video.snippet || {};
  const stats = video.statistics || {};

  const videoId = video.id?.videoId || video.id;
  const title = snippet.title || video.title || "Untitled";
  const channelTitle = snippet.channelTitle || video.channelTitle || "";
  const channelId = snippet.channelId || video.channelId || "";
  const viewCount = stats.viewCount || video.viewCount || 0;
  const publishedAt = snippet.publishedAt || video.publishedAt;
  const thumbUrl =
    snippet.thumbnails?.medium?.url ||
    snippet.thumbnails?.default?.url ||
    video.thumbnail ||
    "";
  const duration = formatDuration(
    video.contentDetails?.duration || video.duration
  );
  const channelThumb = channelThumbnails[channelId];

  const handlePlay = () => {
    playVideo({
      videoId,
      title,
      channelTitle,
      channelId,
      thumbnail: thumbUrl,
    });
  };

  return (
    <div className={`video-card video-card-${layout}`}>
      <Link
        to={`/watch/${videoId}`}
        className="video-card-thumb"
        onClick={handlePlay}
        aria-label={`Play ${title}`}
      >
        <img src={thumbUrl} alt={title} loading="lazy" />
        {duration && <span className="duration-badge">{duration}</span>}
      </Link>

      <div className="video-card-body">
        {channelId && (
          <Link
            to={`/channel/${channelId}`}
            className="video-card-avatar"
            aria-label={`Go to ${channelTitle}`}
          >
            {channelThumb ? (
              <img src={channelThumb} alt="" />
            ) : (
              <span className="avatar-placeholder">
                {channelTitle?.[0] || "?"}
              </span>
            )}
          </Link>
        )}
        <div className="video-card-info">
          <h3 className="video-card-title">
            <Link to={`/watch/${videoId}`} onClick={handlePlay}>
              {title}
            </Link>
          </h3>
          {channelTitle && (
            <Link to={`/channel/${channelId}`} className="video-card-channel">
              {channelTitle}
            </Link>
          )}
          {(viewCount || publishedAt) && (
            <p className="video-card-meta">
              {viewCount ? `${valueConvertor(viewCount)} views` : ""}
              {viewCount && publishedAt ? " • " : ""}
              {publishedAt ? fromNow(publishedAt) : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
