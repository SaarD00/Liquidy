<p align="center">
  <img src="https://img.shields.io/badge/Liquidy-Melodies-8B5CF6?style=for-the-badge&logo=music&logoColor=white" alt="Liquidy Melodies" />
</p>

<h1 align="center">🎵 Liquidy Melodies</h1>

<p align="center">
  <strong>A premium, AI-powered music streaming PWA with dynamic aesthetics and seamless background playback.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-18.x-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/typescript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-5.x-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/supabase-backend-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/gemini-ai-8E75B2?style=flat-square&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/pwa-ready-5A0FC8?style=flat-square&logo=pwa" alt="PWA" />
</p>

---

## ✨ Features

### 🎧 Immersive Playback
- **Universal Streaming** - Seamless integration with YouTube and Shazam APIs.
- **Background Playback (PWA)** - Continue listening while using other apps or with the screen locked (Mobile/Tablet supported).
- **Lock Screen Controls** - Native Media Session API integration for play, pause, seek, and artwork display on lock screens.
- **Smart Queue** - "Up Next" management with drag-and-drop reordering.

### 🤖 AI-Powered Experience
- **Gemini AI DJ** - Smart song recommendations based on your listening history and current mood.
- **Auto-Mix** - Infinite playback that keeps the vibe going when your queue ends.

### 🎨 Stunning Visuals
- **Liquid Aesthetics** - Glassmorphism design with fluid animations and transitions.
- **Dynamic Themes** - The UI automatically adapts colors based on the artwork of the currently playing track.
- **Obsidian Mode** - A deep, sleeker dark mode for AMOLED screens.
- **Responsive** - Perfectly optimized for Desktop, Tablet, and Mobile devices.

### 📲 Progressive Web App (PWA)
- **Installable** - Add to your Home Screen on iOS, Android, Windows, and macOS.
- **App-Like Feel** - Runs standalone without browser UI, feeling just like a native app.
- **Offline Capable** - Caches core assets for faster load times.

### 👤 User Features
- **Supabase Auth** - Secure user accounts and profile management.
- **Cloud Sync** - Sync your playlists, favorites, and history across all your devices.
- **Social Implementation** - (Coming Soon) Share playlists and see what friends are listening to.

---

## 🚀 Demo

> [Add your deployed demo link here]

---

## 📦 Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- RapidAPI Account (YouTube & Shazam APIs)
- Supabase Project
- Google Gemini API Key

### Clone the Repository

```bash
git clone https://github.com/yourusername/liquid-melodies.git
cd liquid-melodies
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

2. Configure your `.env` file with the following keys:

```env
# App
VITE_APP_URL=http://localhost:8080

# External APIs (RapidAPI)
VITE_RAPIDAPI_KEY=your_rapidapi_key
VITE_YOUTUBE_HOST=youtube-v31.p.rapidapi.com
VITE_SHAZAM_HOST=shazam-core.p.rapidapi.com

# AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Backend (Supabase)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Start Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:8080`

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Framer Motion |
| **Backend** | Supabase (Auth, Database, Edge Functions) |
| **AI** | Google Gemini Generative AI |
| **PWA** | Vite PWA Plugin, Service Workers |
| **APIs** | rapidapi-youtube-v3, rapidapi-shazam-core |
| **State** | React Context API, TanStack Query |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the incredible backend infrastructure.
- [Google Gemini](https://deepmind.google/technologies/gemini/) for powering the AI recommendations.
- [RapidAPI](https://rapidapi.com) for music data access.
- [Lucide](https://lucide.dev) for the clean icon set.

---

<p align="center">
  Made with ❤️ by Arindam & The Liquidy Team
</p>
