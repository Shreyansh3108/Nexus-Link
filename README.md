# ⚡ NexusLink

<div align="center">
  <a href="(https://nexus-link-two.vercel.app/)" target="_blank">
    <img src="[https://img.shields.io/badge/](https://img.shields.io/badge/)🔴_Live_Demo-Vercel-black?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
  <img src="[https://img.shields.io/github/stars/Shreyansh3108/Nexus-Link?style=for-the-badge&color=yellow](https://img.shields.io/github/stars/Shreyansh3108/Nexus-Link?style=for-the-badge&color=yellow)" alt="Stars" />
  <img src="[https://img.shields.io/github/forks/Shreyansh3108/Nexus-Link?style=for-the-badge&color=blue](https://img.shields.io/github/forks/Shreyansh3108/Nexus-Link?style=for-the-badge&color=blue)" alt="Forks" />
  <img src="[https://img.shields.io/github/license/Shreyansh3108/Nexus-Link?style=for-the-badge&color=green](https://img.shields.io/github/license/Shreyansh3108/Nexus-Link?style=for-the-badge&color=green)" alt="License" />
</div>

<br />

**NexusLink** is a high-performance, edge-cached URL shortener built for developers. It features secure custom aliases, real-time analytics polling, and a highly optimized backend infrastructure designed to minimize P99 latency using Redis caching.

##  Architecture & System Design

The core philosophy behind NexusLink is **speed and scale**. To prevent database bottlenecks during high-traffic redirects, the system implements a distributed caching strategy.

1. **Client Request:** The user clicks a short link.
2. **Edge Cache (Upstash Redis):** The Express backend instantly checks Redis for the mapped long URL.
3. **Cache Hit:** If found, the user is redirected immediately (Sub-15ms P99 Latency).
4. **Cache Miss:** If not found, the backend queries the PostgreSQL database (Supabase), caches the result in Redis for future requests, and then redirects the user.
5. **Asynchronous Analytics:** Click tracking is handled asynchronously to ensure the redirect speed is never compromised by database write operations.

## ✨ Key Features

* **Sub-Millisecond Redirects:** Powered by Upstash Redis edge caching.
* **Custom Aliases:** Users can define their own branded short links (e.g., `domain.com/my-resume`).
* **Real-Time Analytics Dashboard:** Dynamic charts utilizing Recharts and live-polling to visualize global traffic volume instantly.
* **API Security:** Backend routes are protected via custom header-based API keys (`x-api-key`) to prevent unauthorized scraping or link generation.
* **Glassmorphism UI:** A highly polished, responsive frontend built with Tailwind CSS, Framer Motion, and Aceternity UI components.

## 🛠️ Tech Stack

**Frontend:**
* [Next.js](https://nextjs.org/) (App Router)
* [React](https://reactjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Framer Motion](https://www.framer.com/motion/)
* [Recharts](https://recharts.org/)

**Backend & Infrastructure:**
* [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* [Supabase](https://supabase.com/) (PostgreSQL Database)
* [Upstash](https://upstash.com/) (Redis Cache)
* [Vercel](https://vercel.com/) (Frontend Deployment)
* [Render](https://render.com/) (Backend API Deployment)

## 💻 Local Setup

To run this project locally, you will need Node.js installed. The project is structured as a monorepo containing both the frontend and backend.

### 1. Clone the repository
```bash
git clone https://github.com/Shreyansh3108/Nexus-Link.git
cd Nexus-Link
```

### 2. Setup the Backend Engine
```bash
cd nexuslink-backend
npm install
```

Create a `.env` file in the `nexuslink-backend` directory and add your keys:
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
API_KEY=your_custom_secret_key
```

Start the backend server:
```bash
node server.js
```

### 3. Setup the Frontend Dashboard
Open a new terminal window and navigate to the frontend folder:
```bash
cd nexuslink-frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
```

Open `http://localhost:3001` in your browser to view the application.

---
> Designed and built for the modern web.
