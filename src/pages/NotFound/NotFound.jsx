import { Link } from "react-router-dom";
import EmptyState from "../../components/EmptyState/EmptyState";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found">
      <EmptyState
        title="Page not found"
        message="The page you are looking for doesn't exist or was moved."
      />
      <Link to="/" className="pill-btn">
        Go home
      </Link>
    </div>
  );
}
