import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playerTarget, setPlayerTargetState] = useState(null);
  const [inWatch, setInWatch] = useState(false);

  const commandsRef = useRef({});
  const offscreenRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.id = "jtube-offscreen-player";
    el.setAttribute("aria-hidden", "true");
    el.style.cssText =
      "position:fixed;top:-10000px;left:-10000px;width:1px;height:1px;overflow:hidden;pointer-events:none;";
    document.body.appendChild(el);
    offscreenRef.current = el;
    return () => el.remove();
  }, []);

  const target = playerTarget || offscreenRef.current;

  const playVideo = useCallback((video) => {
    if (video?.videoId) setCurrent(video);
    setPlaying(true);
  }, []);

  const pauseVideo = useCallback(() => {
    commandsRef.current.pause?.();
    setPlaying(false);
  }, []);

  const resumeVideo = useCallback(() => {
    commandsRef.current.play?.();
    setPlaying(true);
  }, []);

  const stopPlayer = useCallback(() => {
    commandsRef.current.stop?.();
    setCurrent(null);
    setPlaying(false);
    setInWatch(false);
  }, []);

  const value = useMemo(
    () => ({
      current,
      playing,
      target,
      inWatch,
      commandsRef,
      setPlayerTarget: setPlayerTargetState,
      setInWatch,
      setPlaying,
      playVideo,
      pauseVideo,
      resumeVideo,
      stopPlayer,
    }),
    [current, playing, target, inWatch, playVideo, pauseVideo, resumeVideo, stopPlayer]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
