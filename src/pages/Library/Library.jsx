import { useParams } from "react-router-dom";
import {
  FaClockRotateLeft,
  FaClock,
  FaThumbsUp,
  FaTrash,
} from "react-icons/fa6";
import { useLibrary } from "../../context/LibraryContext";
import VideoCard from "../../components/VideoCard/VideoCard";
import EmptyState from "../../components/EmptyState/EmptyState";
import "./Library.css";

const CONFIG = {
  history: {
    title: "Watch history",
    icon: <FaClockRotateLeft />,
    empty: "Videos you watch will show up here.",
  },
  later: {
    title: "Watch later",
    icon: <FaClock />,
    empty: "Save videos to watch them later.",
  },
  liked: {
    title: "Liked videos",
    icon: <FaThumbsUp />,
    empty: "Videos you like will show up here.",
  },
};

export default function Library() {
  const { type } = useParams();
  const { history, watchLater, liked, clearAllHistory } = useLibrary();

  const config = CONFIG[type] || CONFIG.liked;
  const videos =
    type === "history" ? history : type === "later" ? watchLater : liked;

  return (
    <div className="library-page">
      <div className="library-header">
        <div className="library-icon">{config.icon}</div>
        <h1 className="library-title">{config.title}</h1>
        {type === "history" && videos.length > 0 && (
          <button
            className="pill-btn library-clear"
            type="button"
            onClick={clearAllHistory}
          >
            <FaTrash />
            Clear history
          </button>
        )}
      </div>

      {videos.length === 0 ? (
        <EmptyState title={config.title} message={config.empty} icon={config.icon} />
      ) : (
        <div className="library-grid">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
