import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePlayer } from "../../context/PlayerContext";

export default function BackgroundPlayer() {
  const { current, target, commandsRef, setPlaying } = usePlayer();
  const iframeRef = useRef(null);
  const videoId = current?.videoId;

  useEffect(() => {
    const send = (func) => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args: [] }),
        "*"
      );
    };
    commandsRef.current = {
      play: () => send("playVideo"),
      pause: () => send("pauseVideo"),
      stop: () => send("stopVideo"),
    };
    return () => {
      commandsRef.current = {};
    };
  }, [videoId, commandsRef]);

  useEffect(() => {
    const onMessage = (event) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
        return;
      }
      try {
        const data = JSON.parse(event.data);
        if (data.event === "onStateChange") {
          const state = Number(data.info);
          if (state === 1) setPlaying(true);
          else if (state === 2 || state === 0) setPlaying(false);
        }
      } catch {
        // ignore unrelated messages
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [videoId, setPlaying]);

  if (!current || !target) return null;

  return createPortal(
    <iframe
      ref={iframeRef}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&playsinline=1`}
      title={current.title || "Video player"}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      frameBorder="0"
      className="youtube-iframe"
    />,
    target
  );
}
