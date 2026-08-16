import { Link } from "react-router-dom";
import { FaBell, FaCheck } from "react-icons/fa";
import { useLibrary } from "../../context/LibraryContext";
import { compactNumber, valueConvertor } from "../../services/format";
import "./ChannelCard.css";

export default function ChannelCard({ channel, stats }) {
  const { toggleSub, subscriptions } = useLibrary();
  const snippet = channel.snippet || {};
  const channelId = channel.id?.channelId || channel.id;
  const name = snippet.title || channel.title || "Channel";
  const description = snippet.description || "";
  const handle = snippet.customUrl
    ? snippet.customUrl.replace("@", "")
    : snippet.channelId || channelId;
  const avatarUrl =
    snippet.thumbnails?.medium?.url ||
    snippet.thumbnails?.default?.url ||
    channel.thumbnail ||
    "";
  const subscriberCount = stats?.statistics?.subscriberCount;
  const videoCount = stats?.statistics?.videoCount;

  const isSubscribed = subscriptions.some((c) => c.id === channelId);

  const handleSubscribe = () => {
    toggleSub({
      id: channelId,
      name,
      avatar: avatarUrl,
    });
  };

  return (
    <div className="channel-card">
      <Link
        to={`/channel/${channelId}`}
        className="channel-card-avatar"
        aria-label={`Open ${name}`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} loading="lazy" />
        ) : (
          <span className="channel-card-avatar-placeholder">
            {name?.[0] || "?"}
          </span>
        )}
      </Link>

      <div className="channel-card-info">
        <Link to={`/channel/${channelId}`} className="channel-card-name">
          {name}
        </Link>
        <p className="channel-card-handle">@{handle}</p>
        {(subscriberCount || videoCount) && (
          <p className="channel-card-stats">
            {subscriberCount
              ? `${valueConvertor(subscriberCount)} subscribers`
              : ""}
            {subscriberCount && videoCount ? " • " : ""}
            {videoCount ? `${compactNumber(videoCount)} videos` : ""}
          </p>
        )}
        {description && (
          <p className="channel-card-desc">
            {description.length > 160
              ? `${description.slice(0, 160)}...`
              : description}
          </p>
        )}
      </div>

      <div className="channel-card-actions">
        <button
          className={`pill-btn subscribe-btn ${isSubscribed ? "active" : ""}`}
          type="button"
          onClick={handleSubscribe}
          title={isSubscribed ? "Unsubscribe" : "Subscribe"}
        >
          {isSubscribed ? <FaCheck /> : <FaBell />}
          {isSubscribed ? "Subscribed" : "Subscribe"}
        </button>
        <Link to={`/channel/${channelId}`} className="pill-btn">
          View channel
        </Link>
      </div>
    </div>
  );
}
