import { Link } from "react-router-dom";
import { FaPlay, FaPause, FaTimes } from "react-icons/fa";
import { usePlayer } from "../../context/PlayerContext";
import "./MiniPlayer.css";

export default function MiniPlayer() {
  const { current, playing, inWatch, resumeVideo, pauseVideo, stopPlayer } =
    usePlayer();

  if (!current || inWatch) return null;

  return (
    <div className="mini-player">
      <Link to={`/watch/${current.videoId}`} className="mini-thumb">
        {current.thumbnail && <img src={current.thumbnail} alt="" />}
      </Link>
      <div className="mini-meta">
        <p className="mini-title">{current.title || "Now playing"}</p>
        <p className="mini-channel">{current.channelTitle || ""}</p>
      </div>
      <button
        className="icon-btn mini-btn"
        title={playing ? "Pause" : "Play"}
        onClick={playing ? pauseVideo : resumeVideo}
        type="button"
      >
        {playing ? <FaPause /> : <FaPlay />}
      </button>
      <button
        className="icon-btn mini-btn"
        title="Close player"
        onClick={stopPlayer}
        type="button"
      >
        <FaTimes />
      </button>
    </div>
  );
}
