import "./Loader.css";

export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader">
      <span className="loader-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="video-card">
      <div className="skeleton skeleton-thumb" />
      <div className="skeleton-row">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton-lines">
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      </div>
    </div>
  );
}
