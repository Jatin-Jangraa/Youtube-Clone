import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import "./PlaylistCard.css";

export default function PlaylistCard({ playlist, itemCount = 0, layout = "row" }) {
  const snippet = playlist.snippet || {};
  const playlistId =
    playlist.id?.playlistId || playlist.id || playlist.id?.videoId;
  const title = snippet.title || playlist.title || "Untitled playlist";
  const channelTitle = snippet.channelTitle || playlist.channelTitle || "";
  const channelId = snippet.channelId || playlist.channelId || "";
  const thumbUrl =
    snippet.thumbnails?.medium?.url ||
    snippet.thumbnails?.default?.url ||
    playlist.thumbnail ||
    "";

  return (
    <div className={`playlist-card playlist-card-${layout}`}>
      <Link
        to={`/playlist/${playlistId}`}
        className="playlist-thumb"
        aria-label={`Open playlist ${title}`}
      >
        <span className="playlist-stack" aria-hidden="true" />
        {thumbUrl ? (
          <img src={thumbUrl} alt={title} loading="lazy" />
        ) : (
          <span className="playlist-thumb-placeholder" aria-hidden="true" />
        )}
        <span className="playlist-overlay">
          <FaPlay />
          {itemCount > 0 && <span className="playlist-count">{itemCount}</span>}
        </span>
      </Link>

      <div className="playlist-info">
        <p className="playlist-eyebrow">Playlist</p>
        <h3 className="playlist-title">
          <Link to={`/playlist/${playlistId}`}>{title}</Link>
        </h3>
        {channelTitle && (
          <Link to={`/channel/${channelId}`} className="playlist-channel">
            {channelTitle}
          </Link>
        )}
        <p className="playlist-meta">
          View full playlist
          {itemCount > 0 ? ` • ${itemCount} videos` : ""}
        </p>
      </div>
    </div>
  );
}
