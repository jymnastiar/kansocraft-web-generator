# ⚡ KansoCraft

<div align="center">

**Prompt to Production:** Next-Generation AI-Powered React Website Builder & Live Sandbox

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter_%2F_Vercel_AI_SDK-FF6B6B?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)

<br />

[Features](#-key-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Environment Variables](#-environment-variables) • [API Reference](#-api-endpoints) • [How It Works](#-how-it-works)

</div>

---

## 🌟 Overview

**KansoCraft** is a modern, next-generation AI Web Generator designed to transform natural language prompts into fully functional, responsive, and interactive multi-file React web applications.

Featuring a smart two-phase autonomous code generation pipeline, automated syntax and import verification, an in-browser live sandbox powered by CodeSandbox Sandpack, an AI Copilot for real-time iterative editing, ZIP export capabilities, and instant public web deployment.

---

## ✨ Key Features

- 🧠 **Two-Phase Autonomous AI Pipeline**
  - **Phase 1 (Architecture Planning):** Blueprints the application file structure (`App.js`, sub-components, styling, utils, mock data).
  - **Phase 2 (Concurrent Generation):** Generates source code for each file concurrently with strict concurrency control (`p-map`) and full dependency awareness.
- 🛡️ **Self-Healing Code Validator & Sanitizer**
  - Automatically detects and resolves missing or invalid component imports (e.g., Lucide icon names).
  - Normalizes markdown fences, repairs relative import paths, and ensures Tailwind CSS configurations compile without errors.
- ⚡ **Interactive In-Browser Live Preview (Sandpack)**
  - Runs the generated React application directly in the browser using the Sandpack bundler runtime.
  - Multi-device viewport toggling (**Desktop**, **Tablet**, **Mobile**).
- 💬 **AI Copilot & Iterative Chat**
  - Built-in chat interface to add new features, change design themes, refine layouts, or modify specific files with automatic diff tracking.
- 📂 **Interactive File Tree & Code Viewer**
  - Seamlessly explore the virtual folder structure and view component source code with syntax highlighting.
- 📦 **One-Click ZIP Export**
  - Download the entire project as a `.zip` archive ready for local development, complete with package configuration, Vite build scripts, and all component assets.
- 🚀 **Instant Public Web Publishing**
  - Publish and share your generated websites instantly via unique public links (`/publish/:id`).
- 🔐 **Supabase Authentication & MongoDB Persistence**
  - Secure user authentication managed via Supabase Auth, with all projects, virtual files, chat histories, and versions safely stored in MongoDB Atlas.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    User([👤 User / Browser])

    subgraph Frontend ["Client (React 19 + Vite + TypeScript)"]
        UI[KansoCraft UI & Dashboard]
        Sandpack[CodeSandbox Sandpack Runner]
        ZustandStore[(Zustand State Store)]
    end

    subgraph Backend ["Server (Node.js + Express 5)"]
        Router[Express Project & Chat Router]
        AuthMW[Supabase Auth Middleware]
        RateLimiter[Rate Limiters]

        subgraph AIEngine ["AI & Validation Pipeline"]
            Planner[Phase 1: Architecture Planner]
            Generator[Phase 2: Code Generator]
            Validator[Code Validator & Auto-Fixer]
            DiffEngine[Diff & Revision Engine]
        end
    end

    subgraph External ["External Services"]
        Supabase[(Supabase Auth)]
        OpenRouter[OpenRouter / Vercel AI SDK]
        MongoDB[(MongoDB Database)]
    end

    User -->|Prompt / Chat| UI
    UI -->|State Updates| ZustandStore
    UI -->|Render React App| Sandpack
    UI -->|API Requests with Bearer Token| Router

    Router --> AuthMW
    AuthMW -->|Verify Token| Supabase
    Router --> RateLimiter
    RateLimiter --> AIEngine

    Planner -->|Structured Plan Schema| OpenRouter
    Generator -->|Parallel File Generation| OpenRouter
    Generator --> Validator
    DiffEngine --> OpenRouter
    DiffEngine --> Validator

    Router -->|Save / Load Projects| MongoDB
```

---

## 💻 Tech Stack

### Frontend (`/client`)

- **Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/), `@base-ui/react`, Shadcn UI primitives, [Lucide React](https://lucide.dev/)
- **Live Sandbox:** [`@codesandbox/sandpack-react`](https://sandpack.codesandbox.io/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) with Immer middleware
- **Animations:** [Motion](https://motion.dev/) (Framer Motion)
- **Routing & Networking:** [React Router v7](https://reactrouter.com/), [Axios](https://axios-http.com/)
- **Auth Client:** [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript)
- **Utilities:** `jszip`, `file-saver`, `lodash.debounce`, `moment`

### Backend (`/server`)

- **Runtime & Framework:** [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/) (ES Modules)
- **AI Core:** [Vercel AI SDK](https://sdk.vercel.ai/), `@ai-sdk/openai` configured with [OpenRouter](https://openrouter.ai/)
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Validation & Schema:** [Zod](https://zod.dev/)
- **Security & Rate Limiting:** `express-rate-limit`, `cors`, `cookie-parser`
- **Concurrency & Logging:** `p-map`, `morgan`, `dotenv`

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following software installed:

- **Node.js**: v18.0.0 or later
- **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`
- **MongoDB**: MongoDB Atlas URI or a local MongoDB instance
- **Supabase Account**: For user authentication (URL & Anon Key)
- **OpenRouter Account**: For the AI Model API Key

---

### 1. Clone Repository

```bash
git clone https://github.com/jymnastiar/kansocraft-web-generator.git
cd kansocraft
```

---

### 2. Setup Backend (`/server`)

1. Navigate to the `server` directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   pnpm install
   # or npm install
   ```

3. Create the `.env` file from the example template:

   ```bash
   cp .env.example .env
   ```

4. Configure the environment variables in `server/.env` (see [Environment Variables](#-environment-variables)).

5. Start the backend server in development mode:

   ```bash
   pnpm dev
   # Server runs at http://localhost:3000
   ```

---

### 3. Setup Frontend (`/client`)

1. Open a new terminal and navigate to the `client` directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   pnpm install
   # or npm install
   ```

3. Create a `.env` file:

   ```env
   VITE_SUPABASE_URL="https://<your-project>.supabase.co"
   VITE_SUPABASE_ANON_KEY="sb_publishable_..."
   VITE_BASE_URL="http://localhost:3000"
   ```

4. Start the frontend development server:

   ```bash
   pnpm dev
   # Frontend runs at http://localhost:5173
   ```

---

## 🔑 Environment Variables

### Backend (`server/.env`)

| Variable                | Type   | Description                                             | Example                                                  |
| :---------------------- | :----- | :------------------------------------------------------ | :------------------------------------------------------- |
| `PORT`                  | Number | HTTP server port                                        | `3000`                                                   |
| `ORIGINS`               | String | Allowed origins for CORS API access (comma-separated)   | `http://localhost:5173,http://localhost:3000`            |
| `MONGODB_URI`           | String | MongoDB connection URI                                  | `mongodb+srv://user:pass@cluster.mongodb.net/kansocraft` |
| `SUPABASE_URL`          | String | Supabase project URL                                    | `https://your-project.supabase.co`                       |
| `SUPABASE_ANON_KEY`     | String | Supabase client anonymous API key                       | `sb_publishable_...`                                     |
| `OPENROUTER_API_KEY`    | String | API key for OpenRouter                                  | `sk-or-v1-...`                                           |
| `OPENROUTER_MODEL`      | String | LLM model to use for generation                         | `openrouter/free` or `anthropic/claude-3.5-sonnet`     |
| `AI_MAX_CONCURRENCY`    | Number | Number of files generated concurrently                  | `4`                                                      |
| `AI_REQUEST_TIMEOUT_MS` | Number | Timeout for AI requests in milliseconds                  | `90000`                                                  |

### Frontend (`client/.env`)

| Variable                 | Type   | Description                    | Example                            |
| :----------------------- | :----- | :----------------------------- | :--------------------------------- |
| `VITE_SUPABASE_URL`      | String | Supabase project URL           | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | String | Supabase client anonymous API key | `sb_publishable_...`               |
| `VITE_BASE_URL`          | String | Backend API base URL           | `http://localhost:3000`            |

---

## 📡 API Endpoints

All endpoints are protected by Supabase JWT Bearer token authentication unless marked as `[Public]`.

### Projects

| Method   | Endpoint                    |    Auth     | Description                                               |
| :------- | :-------------------------- | :---------: | :-------------------------------------------------------- |
| `POST`   | `/api/projects`             |     🔒      | Creates a new project and triggers the AI Gen Pipeline    |
| `GET`    | `/api/projects`             |     🔒      | Fetches all projects owned by the user                    |
| `GET`    | `/api/projects/:id`         |     🔒      | Fetches details of a specific project and all its files   |
| `PUT`    | `/api/projects/:id/files`   |     🔒      | Manually updates file contents                            |
| `POST`   | `/api/projects/:id/publish` |     🔒      | Toggles the publication status of a project               |
| `DELETE` | `/api/projects/:id`         |     🔒      | Deletes a project                                         |
| `GET`    | `/api/projects/public/:id`  | 🌐 [Public] | Fetches public project files                              |

### Copilot / AI Chat

| Method | Endpoint                 | Auth | Description                                                   |
| :----- | :----------------------- | :--: | :------------------------------------------------------------ |
| `POST` | `/api/projects/:id/chat` |  🔒  | Sends revision instructions to the AI Copilot for code edits  |

---

## ⚙️ How It Works

```
1. Input Prompt
   └─ User enters a prompt ("Modern SaaS dashboard with dark mode and analytics charts")

2. Phase 1: Planning
   └─ AI designs the file architecture: /App.js, /components/Sidebar.js, /components/Metrics.js, etc.

3. Phase 2: Generation & Validation
   ├─ Generates code for each file concurrently
   ├─ Code Validator detects and repairs broken imports, styling, and syntax
   └─ Saves the virtual file tree to MongoDB

4. Live Preview & Editing
   ├─ Client loads the file tree into the Sandpack in-browser runtime
   ├─ User tests interactivity in Desktop/Tablet/Mobile modes
   └─ User requests further updates via the AI Copilot Chat

5. Export / Publish
   ├─ Export: Download a ZIP archive complete with local build configurations
   └─ Publish: Generates a public shareable preview link
```

---

## 📜 Available Scripts

### In `/client`:

- `pnpm dev`: Runs the Vite development server
- `pnpm build`: Performs TypeScript type checks and compiles the production bundle
- `pnpm lint`: Runs ESLint for code analysis
- `pnpm preview`: Locally previews the production build

### In `/server`:

- `pnpm dev`: Runs the backend server with hot-reload via `nodemon`
- `pnpm start`: Runs the backend server in production mode

---

## 🤝 Contributing

Contributions are always welcome! If you'd like to contribute:

1. Fork the repository
2. Create a new feature branch (`git checkout -b feature/CoolFeature`)
3. Commit your changes (`git commit -m 'feat: add some cool feature'`)
4. Push to the branch (`git push origin feature/CoolFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC** License.

<div align="center">
  <sub>Built with ❤️ using React, Express, and OpenRouter AI.</sub>
</div>
