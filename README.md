# Social Media & Marketplace Platform

A comprehensive web application featuring messaging, content sharing, marketplace, and social networking capabilities.

## Features

### 🔐 Authentication & Security
- Phone/Email OTP verification
- Two-Factor Authentication (2FA)
- End-to-end encryption for messages
- Device management and login alerts

### 💬 Messages Tab
- **Chat**: Real-time messaging with E2EE, group chats (up to 8 participants), AI smart replies
- **Calls**: Voice & video calling with WebRTC, call recording, background blur
- **Status**: 24-hour disappearing stories with interactive elements (polls, Q&A)

### 🔍 Discover Tab
- **Feed**: Algorithmic content feed with "Following" vs "For You" toggles
- **Reels**: Short-form video creation with AR filters, beat-synced transitions
- **Search**: Visual search, trending content, hashtag discovery

### 🛒 Marketplace Tab
- **Shop**: AI-powered product discovery, personalized recommendations
- **Sell**: Three-step listing process with AI product recognition
- **Deals**: Viral mechanics (share-to-earn, group buys, flash sales)

### 👤 Profile Tab
- **Profile**: Social dashboard with analytics and achievements
- **Settings**: Privacy controls, security management, data export
- **Tools**: Business tier with inventory management, creator studio

## Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL for relational data
- Redis for caching and sessions
- WebSocket for real-time features
- JWT for authentication
- Microservices architecture

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Socket.io for real-time communication
- PWA capabilities
- Responsive design (mobile-first)

## Project Structure

```
/workspace/
├── backend/          # Node.js backend services
├── frontend/         # React.js frontend application
└── README.md
```

## Getting Started

1. Clone the repository
2. Install dependencies for both backend and frontend
3. Set up environment variables
4. Run the development servers

## Responsive Design

### Mobile Layout
```
[Status Bar]          ← Time, battery, network
[Sub-Tabs Bar]        ← Contextual to active main tab (40px)
[───────────────]
[ Content Area ]      ← 80% of screen (scrollable)
[───────────────]
[Main Tabs Bar]       ← Messages • Discover • Marketplace • Profile (60px)
```

### Desktop Layout
```
+----------------------------------------------------------------+
| Logo | Search | 🔔 • UserPic | [Settings]  ← Top Global Bar   |
+---------+-----------------------------------------------------+
| Msg     | [Sub-Tabs]                                          |
| Discover| +-----------------------------------------------+ | |
| Market  | |               Content Area                   | |C|
| Profile | | (Adaptive Grid/Chat/Editor)                  | |h|
|         | |                                               | |a|
|         | +-----------------------------------------------+ |t|
|         |                                                   | |
+---------+-----------------------------------------------------+
  Left Sidebar (200px)    Main Content (700-900px)      Right Panel (300px)
```

## License

MIT License