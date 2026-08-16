import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TiThMenu } from "react-icons/ti";
import { IoSearch } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";
import { BsFillSunFill, BsMoonStarsFill } from "react-icons/bs";
import { useTheme } from "../../context/ThemeContext";
import "./Navbar.css";

export default function Navbar({ onMenuClick }) {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const submit = (event) => {
    event.preventDefault();
    const q = query.trim();
    if (q) navigate(`/results?q=${encodeURIComponent(q)}`);
  };

  const getRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN";
    rec.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      setQuery(text);
      const q = text.trim();
      if (q) navigate(`/results?q=${encodeURIComponent(q)}`);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    return rec;
  };

  const toggleVoice = () => {
    const rec = getRecognition();
    if (!rec) {
      setUnsupported(true);
      window.setTimeout(() => setUnsupported(false), 2500);
      return;
    }
    if (listening) {
      rec.stop();
      setListening(false);
      return;
    }
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="icon-btn"
          onClick={onMenuClick}
          title="Menu"
          aria-label="Toggle menu"
          type="button"
        >
          <TiThMenu />
        </button>
        <Link to="/" className="navbar-logo" aria-label="Jatin's Tube">
          <svg
            className="navbar-logo-icon"
            viewBox="0 0 28 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="28" height="20" rx="6" fill="#FF0000" />
            <path d="M11 6l8 4-8 4V6z" fill="#fff" />
          </svg>
          <span className="navbar-logo-text">Jatin</span>
        </Link>
      </div>

      <div className="navbar-center">
        <form className="navbar-search" onSubmit={submit}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search"
          />
          <button
            type="submit"
            className="navbar-search-btn"
            aria-label="Submit search"
          >
            <IoSearch />
          </button>
        </form>

        <div className="voice-wrap">
          <button
            className={`icon-btn navbar-mic ${listening ? "listening" : ""}`}
            onClick={toggleVoice}
            title={listening ? "Stop voice search" : "Search with your voice"}
            aria-label="Search with your voice"
            type="button"
          >
            <FaMicrophone />
          </button>
          {(listening || unsupported) && (
            <div className="voice-pop" role="status">
              {listening ? "Listening..." : "Voice search not supported in this browser"}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="icon-btn"
          onClick={toggle}
          title={dark ? "Light mode" : "Dark mode"}
          aria-label="Toggle theme"
          type="button"
        >
          {dark ? <BsFillSunFill /> : <BsMoonStarsFill />}
        </button>
      </div>
    </header>
  );
}
