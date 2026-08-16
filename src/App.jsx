import { useState } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import BackgroundPlayer from "./components/BackgroundPlayer/BackgroundPlayer";
import MiniPlayer from "./components/MiniPlayer/MiniPlayer";
import Home from "./pages/Home/Home";
import Watch from "./pages/Watch/Watch";
import SearchResults from "./pages/SearchResults/SearchResults";
import Channel from "./pages/Channel/Channel";
import Library from "./pages/Library/Library";
import Playlist from "./pages/Playlist/Playlist";
import NotFound from "./pages/NotFound/NotFound";
import { ThemeProvider } from "./context/ThemeContext";
import { LibraryProvider } from "./context/LibraryContext";
import { PlayerProvider } from "./context/PlayerContext";
import "./App.css";

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen((open) => !open);
    } else {
      setCollapsed((c) => !c);
    }
  };

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <Navbar onMenuClick={handleMenuClick} />
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <main className="app-main">
        <Outlet />
      </main>
      <BackgroundPlayer />
      <MiniPlayer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/watch/:videoId", element: <Watch /> },
      { path: "/results", element: <SearchResults /> },
      { path: "/channel/:channelId", element: <Channel /> },
      { path: "/playlist/:playlistId", element: <Playlist /> },
      { path: "/library/:type", element: <Library /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <PlayerProvider>
          <RouterProvider router={router} />
        </PlayerProvider>
      </LibraryProvider>
    </ThemeProvider>
  );
}

export default App;
