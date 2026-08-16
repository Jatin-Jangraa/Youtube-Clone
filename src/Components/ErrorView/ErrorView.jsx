import "./ErrorView.css";

export default function ErrorView({ message, onRetry }) {
  return (
    <div className="error-view">
      <h2>Something went wrong</h2>
      <p>{message || "Failed to load content. Please try again."}</p>
      {onRetry && (
        <button className="pill-btn" type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
