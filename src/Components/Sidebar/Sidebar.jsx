import { Link, useLocation } from "react-router-dom";
import { FaHome, FaHistory, FaClock, FaThumbsUp } from "react-icons/fa";
import { useLibrary } from "../../context/LibraryContext";
import "./Sidebar.css";

const LIBRARY_LINKS = [
  { to: "/library/history", label: "History", icon: <FaHistory /> },
  { to: "/library/later", label: "Watch later", icon: <FaClock /> },
  { to: "/library/liked", label: "Liked videos", icon: <FaThumbsUp /> },
];

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const location = useLocation();
  const { subscriptions } = useLibrary();

  const renderLink = (to, label, icon, active = false) => (
    <Link
      key={to + label}
      to={to}
      className={`sidebar-item ${active ? "active" : ""}`}
      title={label}
      onClick={onClose}
    >
      <span className="sidebar-icon">{icon}</span>
      {!collapsed && <span className="sidebar-label">{label}</span>}
    </Link>
  );

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-inner">
          <section className="sidebar-section">
            {renderLink(
              "/",
              "Home",
              <FaHome />,
              location.pathname === "/"
            )}
          </section>

          <div className="sidebar-divider" />

          <section className="sidebar-section">
            <h3 className="sidebar-heading">{!collapsed && "You"}</h3>
            {LIBRARY_LINKS.map((item) =>
              renderLink(
                item.to,
                item.label,
                item.icon,
                location.pathname.startsWith(item.to)
              )
            )}
          </section>

          {!collapsed && subscriptions.length > 0 && (
            <>
              <div className="sidebar-divider" />
              <section className="sidebar-section">
                <h3 className="sidebar-heading">Subscriptions</h3>
                {subscriptions.map((channel) =>
                  renderLink(
                    `/channel/${channel.id}`,
                    channel.name,
                    <img
                      className="sidebar-sub-avatar"
                      src={channel.avatar}
                      alt=""
                    />
                  )
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
