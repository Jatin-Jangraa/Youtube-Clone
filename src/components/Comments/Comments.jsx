import { useCallback, useEffect, useState } from "react";
import { FaThumbsUp, FaRegCommentDots } from "react-icons/fa6";
import { fetchComments } from "../../services/youtube";
import { fromNow, valueConvertor } from "../../services/format";
import Loader from "../Loader/Loader";
import ErrorView from "../ErrorView/ErrorView";
import "./Comments.css";

export default function Comments({ videoId }) {
  const [items, setItems] = useState([]);
  const [nextPageToken, setNextPageToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (token = "") => {
    if (token) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await fetchComments(videoId, token);
      setItems((prev) => (token ? [...prev, ...result.items] : result.items));
      setNextPageToken(result.nextPageToken || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [videoId]);

  useEffect(() => {
    setItems([]);
    setNextPageToken("");
    load();
  }, [videoId, load]);

  if (loading) return <Loader label="Loading comments..." />;
  if (error)
    return <ErrorView message={error} onRetry={() => load()} />;

  if (items.length === 0)
    return <p className="comments-empty">Comments are turned off.</p>;

  return (
    <section className="comments">
      <h3 className="comments-heading">
        {items.length}
        {nextPageToken ? "+" : ""} Comments
      </h3>

      <div className="comments-list">
        {items.map((item) => {
          const snippet = item.snippet?.topLevelComment?.snippet || {};
          return (
            <article className="comment" key={item.id}>
              <img
                className="comment-avatar"
                src={
                  snippet.authorProfileImageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    snippet.authorDisplayName || "?"
                  )}&background=9e9e9e&color=fff`
                }
                alt={snippet.authorDisplayName}
              />
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-author">
                    {snippet.authorDisplayName}
                  </span>
                  <span className="comment-time">
                    {snippet.publishedAt
                      ? fromNow(snippet.publishedAt)
                      : ""}
                  </span>
                </div>
                <p className="comment-text">{snippet.textDisplay}</p>
                <div className="comment-actions">
                  <button className="comment-like" type="button">
                    <FaThumbsUp />
                    {snippet.likeCount ? valueConvertor(snippet.likeCount) : ""}
                  </button>
                  {item.snippet?.totalReplyCount > 0 && (
                    <button
                      className="comment-replies"
                      type="button"
                    >
                      <FaRegCommentDots />
                      {item.snippet.totalReplyCount} replies
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {loadingMore && <Loader />}
      {nextPageToken && !loadingMore && (
        <button
          className="comments-more"
          type="button"
          onClick={() => load(nextPageToken)}
        >
          Load more comments
        </button>
      )}
    </section>
  );
}
