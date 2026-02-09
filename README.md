<p align="center">
  <img src="https://img.shields.io/badge/Saarify-Music%20Streaming-8B5CF6?style=for-the-badge&logo=music&logoColor=white" alt="Saarify" />
</p>

<h1 align="center">🎵 Saarify</h1>

<p align="center">
  <strong>A modern, beautiful music streaming web app with YouTube integration</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#usage">Usage</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-18.x-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/typescript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-5.x-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/tailwindcss-3.x-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
</p>

---

## ✨ Features

### 🎧 Music Playback
- **YouTube Integration** - Stream music directly from YouTube
- **Shazam Fallback** - Automatic fallback to Shazam API when YouTube results aren't available
- **Background Playback** - Music continues playing while browsing
- **Play/Pause/Resume** - Full playback controls with resume from where you left off
- **Progress Bar** - Real-time progress tracking with seek functionality

### 🎨 Beautiful UI/UX
- **Modern Design** - Premium glassmorphism design with smooth animations
- **Dynamic Background** - Background gradient changes based on album art colors (optional)
- **Responsive Layout** - Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Themes** - Multiple theme options with color customization
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions

### 📱 Core Features
- **Search** - Search for any song or artist
- **Quick Picks** - Pre-defined genre shortcuts (Lo-fi, Rock, Pop, Hip Hop, Jazz, Electronic)
- **Queue Management** - Up Next queue with track management
- **Favorites** - Save your favorite tracks
- **Library** - Access your saved music

### ⚙️ Settings
- **Theme Toggle** - Switch between light and dark mode
- **Color Themes** - Choose from multiple accent color options
- **Dynamic Background** - Toggle album art-based background colors

---

## 🚀 Demo

> Add your deployed demo link here

---

## 📦 Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- RapidAPI account (for YouTube and Shazam APIs)

### Clone the Repository

```bash
git clone https://github.com/yourusername/saarify.git
cd saarify
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your API keys to `.env`:
```env
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
VITE_YOUTUBE_HOST=youtube-v31.p.rapidapi.com
VITE_SHAZAM_HOST=shazam-core.p.rapidapi.com
```

### Start Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`

---

## 🔧 Configuration

### API Keys

This app uses RapidAPI to access YouTube and Shazam APIs:

1. Create an account at [RapidAPI](https://rapidapi.com)
2. Subscribe to:
   - [YouTube v3 API](https://rapidapi.com/ytdlfree/api/youtube-v31)
   - [Shazam Core API](https://rapidapi.com/tipsters/api/shazam-core)
3. Copy your RapidAPI key to the `.env` file

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_RAPIDAPI_KEY` | Your RapidAPI key | Yes |
| `VITE_YOUTUBE_HOST` | YouTube API host | No (has default) |
| `VITE_SHAZAM_HOST` | Shazam API host | No (has default) |

---

## 🎯 Usage

### Playing Music

1. **Search** - Use the search bar to find songs or artists
2. **Quick Picks** - Click on genre buttons for quick discovery
3. **Play** - Click on any track card to start playing
4. **Controls** - Use the floating player for play/pause, skip, and volume

### Player Controls

- **Play/Pause** - Click the play button or use the floating player
- **Seek** - Click anywhere on the progress bar to jump to that position
- **Skip** - Use next/previous buttons to navigate the queue
- **Volume** - Adjust volume using the volume slider (desktop)

### Settings

Access settings via the gear icon in the sidebar:
- Toggle between light/dark mode
- Enable/disable dynamic background
- Choose accent colors

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Styling |
| **Framer Motion** | Animations |
| **React Router** | Navigation |
| **TanStack Query** | Data Fetching |
| **Lucide React** | Icons |

### APIs Used

- **YouTube Data API v3** (via RapidAPI) - Primary music source
- **Shazam Core API** (via RapidAPI) - Fallback music source

---

## 📁 Project Structure

```
saarify/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── MusicPlayer.tsx # Main player component
│   │   ├── SearchBar.tsx   # Search component
│   │   ├── BottomNav.tsx   # Mobile navigation
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   ├── PlayerContext.tsx
│   │   ├── SettingsContext.tsx
│   │   ├── FavoritesContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/                # Utilities & API
│   │   ├── api.ts          # API functions
│   │   └── colorExtractor.ts
│   ├── pages/              # Page components
│   │   ├── Index.tsx
│   │   ├── SearchPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── ...
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── .env.example            # Environment template
├── .gitignore
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [RapidAPI](https://rapidapi.com) for API access
- [Tailwind CSS](https://tailwindcss.com) for styling utilities
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide](https://lucide.dev) for beautiful icons

---

## 📧 Contact

For questions or feedback, please open an issue or reach out:

- GitHub Issues: [Create an issue](https://github.com/yourusername/saarify/issues)

---

<p align="center">
  Made with ❤️ by the Saarify Team
</p>

<p align="center">
  <strong>⭐ Star this repo if you like it!</strong>
</p>
