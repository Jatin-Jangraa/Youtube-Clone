import { useEffect, useState } from "react";
import { fetchChannelsByIds } from "../services/youtube";

export function useChannelThumbnails(videos) {
  const [thumbs, setThumbs] = useState({});

  useEffect(() => {
    const ids = [
      ...new Set(
        (videos || [])
          .map((v) => v.snippet?.channelId || v.channelId)
          .filter(Boolean)
      ),
    ];
    if (ids.length === 0) {
      setThumbs({});
      return undefined;
    }

    let cancelled = false;
    fetchChannelsByIds(ids)
      .then((channels) => {
        if (cancelled) return;
        const map = {};
        channels.forEach((channel) => {
          map[channel.id] =
            channel.snippet?.thumbnails?.default?.url ||
            channel.snippet?.thumbnails?.medium?.url ||
            "";
        });
        setThumbs(map);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [videos]);

  return thumbs;
}
