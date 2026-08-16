# Jatin's Tube — YouTube Clone

A feature-rich YouTube clone built with **React 18**, **Vite**, and **React Router v7**, powered by the **YouTube Data API v3**.

## Features

- **Real video feed** — most popular videos with category filtering, infinite scroll, and channel avatars
- **Video playback with background play** — audio keeps playing while you browse; a floating mini-player lets you pause/resume/close it anywhere in the app
- **Watch page** — embedded player, title, view count, like / share / save actions, channel bar with subscribe, expandable description, and comment threads
- **Search** — debounce-free URL-driven results with pagination
- **Channel pages** — banner, subscriber stats, and uploads grid with infinite scroll
- **Personal library** — watch history, watch later, and liked videos persisted in `localStorage`
- **Dark mode** — theme toggle persisted across sessions
- **Responsive layout** — collapsible sidebar on desktop, drawer navigation on mobile
- **Skeletons, error states, and retry buttons** everywhere

## Getting started

```bash
npm install
npm run dev
```

### API key

1. Create a free key at the [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com) (enable the **YouTube Data API v3**).
2. Copy `.env.example` to `.env` and paste your key:

```bash
VITE_YOUTUBE_API_KEY=your_key_here
```

> The key is used client-side for public, read-only data. For production, consider proxying requests through a small backend so the key stays off the client.

## Scripts

| Command          | Description            |
| ---------------- | ---------------------- |
| `npm run dev`    | Start the dev server   |
| `npm run build`  | Production build       |
| `npm run lint`   | Run ESLint             |
| `npm run preview`| Preview production build |

## Project structure

```
src/
  context/        Global state (player, theme, library)
  services/       YouTube API wrapper, formatting, localStorage
  hooks/          Shared hooks (channel thumbnails)
  components/     Navbar, Sidebar, VideoCard, Chips, Comments, Player, MiniPlayer, ...
  pages/          Home, Watch, SearchResults, Channel, Library, NotFound
```

## How background play works

A single persistent `<iframe>` (managed by `BackgroundPlayer`) is shared app-wide. On the watch page it's rendered via a React portal into the player container; when you navigate away it moves off-screen (still mounted) and audio continues. The mini-player issues YouTube `postMessage` commands to pause/resume/stop.
