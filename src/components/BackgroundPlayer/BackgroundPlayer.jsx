import { useEffect, useRef } from "react";
import { usePlayer } from "../../context/PlayerContext";

export default function BackgroundPlayer() {
  const { current, inWatch } = usePlayer();
  const playerInstanceRef = useRef(null);

  useEffect(() => {
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch {
        /* ignore */
      }
      playerInstanceRef.current = null;
    }
  }, [inWatch]);

  useEffect(() => {
    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch {
          /* ignore */
        }
        playerInstanceRef.current = null;
      }
    };
  }, []);

  return null;
}
