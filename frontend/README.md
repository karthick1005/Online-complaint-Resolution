# 🎫 Complaint Resolution Frontend

Modern, high-performance React application built with Vite and Tailwind CSS.

## 🛠️ Architecture & Tech Stack
- **Framework**: React 18+ (Vite for fast build/HMR)
- **Styling**: Tailwind CSS for utility-first design
- **State Management**: 
  - TanStack Query (React Query) for server state caching
  - Context API for Auth and Theme management
- **Real-time**: Socket.io-client for live notifications
- **Animations**: Framer Motion
- **UI Components**: Radix UI (Dialogs, Tabs, Toasts)
- **Icons**: Lucide React

## 📦 Project Structure
- `src/features/`: Domain-specific components/logic (complaints, users, dashboard)
- `src/components/`: Reusable UI/Layout components
- `src/context/`: Authentication and UI-state context providers
- `src/hooks/`: Custom React hooks for API and WebSocket integration
- `src/services/`: API communication layer (Axios instance)
- `src/utils/`: Formatting and helper utilities

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running locally at `http://localhost:5000`

### Local Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configuration**:
   Ensure `src/api.js` points to the correct backend endpoint (defaults to `http://localhost:5000`).
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
4. **Access Application**:
   Open `http://localhost:3000` in your browser.

## 🚀 Production Build
1. **Build optimized bundle**:
   ```bash
   npm run build
   ```
2. **Preview build locally**:
   ```bash
   npm run preview
   ```
3. **Deployment**:
   Deploy the `dist/` directory to Vercel, Netlify, or Nginx.

## 📱 Mobile-First Design
- Specific optimizations provided in `mobile-optimizations.css`.
- Fully responsive layout for and seamless mobile usage.
