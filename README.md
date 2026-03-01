<div align="center">

# 🌐 WebScope Pro

**A production-ready web scraping dashboard built with Next.js 14**

Scrape any website — including client-side rendered apps — and instantly view titles, headings, meta descriptions, and visible body text. All results are stored, searchable, and displayed in a beautiful authenticated dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-24-40B5A4?logo=puppeteer&logoColor=white)](https://pptr.dev/)

</div>

---

## ✨ Features

- **🔒 Authentication** — Email/password auth with NextAuth.js (credentials + JWT)
- **🤖 Puppeteer Scraping** — Headless Chromium renders JavaScript before extracting data — works on SPAs, React, and Next.js sites
- **📊 Dashboard** — Stats cards, paginated logs table, detail modals, real-time feed
- **🗄️ Persistent Storage** — All scrape results saved to Neon PostgreSQL via Prisma ORM
- **⚡ Real-time Updates** — Socket.IO broadcasts new scrape logs instantly
- **🌙 Dark Mode** — Toggle between light and dark themes
- **🛡️ Validation** — Zod schemas for URL, registration, and login inputs
- **📱 Responsive** — Mobile-first UI with Tailwind CSS

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Auth | NextAuth.js v4 (Credentials + JWT) |
| Scraping | Puppeteer (headless Chromium) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 |
| Validation | Zod 4 |
| Real-time | Socket.IO 4 |
| Password Hashing | bcrypt.js |

---

## 📁 Project Structure

```
webscope/
├── prisma/
│   └── schema.prisma          # Database models (User, RequestLog, ScrapedData)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │   │   │   └── register/route.ts        # POST /api/auth/register
│   │   │   ├── logs/
│   │   │   │   ├── [id]/route.ts            # DELETE /api/logs/:id
│   │   │   │   └── route.ts                 # GET  /api/logs
│   │   │   ├── scrape/route.ts              # POST /api/scrape
│   │   │   └── stats/route.ts               # GET  /api/stats
│   │   ├── auth/
│   │   │   ├── login/page.tsx               # Login page
│   │   │   └── register/page.tsx            # Register page
│   │   ├── dashboard/page.tsx               # Protected dashboard
│   │   ├── layout.tsx                       # Root layout + SessionProvider
│   │   ├── page.tsx                         # Landing page
│   │   └── globals.css                      # Global styles + animations
│   ├── components/
│   │   ├── Button.tsx           # Reusable button (variants, loading)
│   │   ├── Card.tsx             # Glass-effect card wrapper
│   │   ├── DetailModal.tsx      # Scrape result detail modal
│   │   ├── EmptyState.tsx       # Empty state illustration
│   │   ├── LoadingSpinner.tsx   # Spinner component
│   │   ├── LogsTable.tsx        # Paginated logs table
│   │   ├── Navbar.tsx           # Sticky nav with auth + theme toggle
│   │   ├── Pagination.tsx       # Page navigation controls
│   │   ├── RequestHistory.tsx   # Request history list
│   │   ├── ResponseTimeBadge.tsx# Color-coded response time badge
│   │   ├── ScrapeResultCard.tsx # Quick result preview card
│   │   ├── SessionProvider.tsx  # NextAuth session wrapper
│   │   ├── SkeletonLoader.tsx   # Loading skeleton
│   │   ├── StatsCards.tsx       # Stats overview (3-column grid)
│   │   ├── StatusBadge.tsx      # HTTP status code badge
│   │   └── ThemeToggle.tsx      # Dark/light mode toggle
│   ├── lib/
│   │   ├── auth.ts              # NextAuth config (credentials provider)
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── socket.ts            # Socket.IO server init
│   │   └── validators.ts        # Zod schemas (URL, register, login)
│   ├── pages/api/
│   │   └── socketio.ts          # Socket.IO handshake endpoint
│   ├── types/
│   │   ├── index.ts             # Shared TypeScript interfaces
│   │   └── next-auth.d.ts       # NextAuth type augmentation
│   └── middleware.ts            # Protects /dashboard routes
├── .env                         # Environment variables
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

---

## 🗃️ Database Schema

```prisma
model User {
  id        String       @id @default(uuid())
  name      String?
  email     String       @unique
  password  String
  logs      RequestLog[]
  createdAt DateTime     @default(now())
}

model RequestLog {
  id           String        @id @default(uuid())
  url          String
  method       String
  statusCode   Int
  responseTime Int
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  scrapedData  ScrapedData[]
  createdAt    DateTime      @default(now())
}

model ScrapedData {
  id        String     @id @default(uuid())
  requestId String
  request   RequestLog @relation(fields: [requestId], references: [id], onDelete: Cascade)
  title     String
  headings  String[]
  meta      String?
  bodyText  String?
  createdAt DateTime   @default(now())
}
```

---

## 🔌 API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Create new user account |
| `POST` | `/api/auth/[...nextauth]` | No | NextAuth sign-in / sign-out |
| `POST` | `/api/scrape` | Yes | Scrape a URL with Puppeteer |
| `GET` | `/api/logs?page=1&pageSize=10` | Yes | Paginated scrape history |
| `DELETE` | `/api/logs/:id` | Yes | Delete a log (ownership verified) |
| `GET` | `/api/stats` | Yes | Dashboard stats (total, avg time, success %) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** database (or a [Neon](https://neon.tech) free tier)

### 1. Clone the repo

```bash
git clone https://github.com/Tusharxhub/webscope.git
cd webscope
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string (Neon or local)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

> Generate a secret: `openssl rand -base64 32`

### 4. Push database schema

```bash
npx prisma db push
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — register an account and start scraping.

---

## 🏗️ Build for Production

```bash
npm run build   # Runs prisma generate + next build
npm start       # Starts production server
```

---

## 📡 How Scraping Works

1. User submits a URL from the dashboard
2. Server validates the URL with Zod
3. **Puppeteer** launches headless Chromium
4. Navigates to the page, waits for `networkidle2` (JavaScript fully rendered)
5. Extracts from the live DOM:
   - `document.title`
   - All `<h1>` and `<h2>` elements
   - `<meta name="description">` content
   - `document.body.innerText` (truncated to 5000 chars)
6. Records HTTP status code and response time
7. Saves everything to PostgreSQL via Prisma
8. Broadcasts the new log via Socket.IO
9. Returns structured JSON to the frontend

> **Why Puppeteer?** Traditional HTTP scrapers (Axios + Cheerio) only see the raw HTML. Modern sites built with React, Next.js, or Vue render content via JavaScript — Puppeteer runs a real browser to capture the fully-rendered page.

---

## 🎨 UI Design

- **Gradient backgrounds** — `gray-50 → blue-50` (light) / `gray-950 → indigo-950` (dark)
- **Glass-effect cards** — `bg-white/70 backdrop-blur-xl` with soft borders
- **Indigo primary** accent with **emerald** success and **rose** error badges
- **Smooth transitions** — fade-in animations, hover scale effects
- **Skeleton loaders** during data fetching
- **Empty state** illustration when no scrapes exist
- **Fully responsive** — works on mobile, tablet, and desktop

---

## 🛡️ Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT-based sessions via NextAuth
- Middleware protects `/dashboard` routes
- API routes verify session before any DB operation
- Log deletion checks ownership (`userId`)
- Rate limiting on scrape endpoint (1 request per 3 seconds per user)
- Input validation with Zod on all endpoints
- Puppeteer runs with `--no-sandbox --disable-dev-shm-usage` for containerized environments

---

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing |
| `NEXTAUTH_URL` | Yes | Base URL of the app (`http://localhost:3000`) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Tushar](https://github.com/Tusharxhub)**

</div>