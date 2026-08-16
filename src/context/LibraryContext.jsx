import { createContext, useCallback, useContext, useState } from "react";
import * as lib from "../services/library";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [history, setHistory] = useState(() => lib.getHistory());
  const [watchLater, setWatchLater] = useState(() => lib.getWatchLater());
  const [liked, setLiked] = useState(() => lib.getLiked());
  const [subscriptions, setSubscriptions] = useState(() =>
    lib.getSubscriptions()
  );

  const recordView = useCallback((video) => {
    setHistory(lib.addToHistory(video));
  }, []);

  const toggleSave = useCallback((video) => {
    setWatchLater(lib.toggleWatchLater(video));
    return lib.isWatchLater(video.id);
  }, []);

  const toggleLike = useCallback((video) => {
    setLiked(lib.toggleLiked(video));
    return lib.isLiked(video.id);
  }, []);

  const toggleSub = useCallback((channel) => {
    setSubscriptions(lib.toggleSubscription(channel));
    return lib.isSubscribed(channel.id);
  }, []);

  const clearAllHistory = useCallback(() => {
    setHistory(lib.clearHistory());
  }, []);

  const value = {
    history,
    watchLater,
    liked,
    subscriptions,
    recordView,
    toggleSave,
    toggleLike,
    toggleSub,
    clearAllHistory,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
