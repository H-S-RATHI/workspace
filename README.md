# Enhanced Social Media & Marketplace Platform

A comprehensive web application featuring messaging, content sharing, marketplace, and social networking capabilities with advanced features and Cloudinary integration.

## 🚀 Enhanced Features

### 🔐 Authentication & Security
- Phone/Email OTP verification
- Two-Factor Authentication (2FA)
- End-to-end encryption for messages
- Device management and login alerts

### 💬 Messages Tab
- **Chat**: Real-time messaging with E2EE, group chats (up to 8 participants), AI smart replies
- **Calls**: Voice & video calling with WebRTC, call recording, background blur
- **Status**: 24-hour disappearing stories with interactive elements (polls, Q&A)

### 🔍 Enhanced Discover Tab
- **Rich Post Creation**: Create posts with multiple media files, hashtags, and location using Cloudinary
- **Advanced Engagement**: Like, comment, share (to stories/external platforms), and save posts
- **Content Categories**: Browse posts by categories (Technology, Fashion, Food, etc.)
- **Trending Discovery**: Real-time trending hashtags and content
- **Smart Search**: Advanced search across posts, users, and hashtags
- **Personalized Feed**: AI-powered recommendations based on user interactions
- **Carousel Posts**: Support for multiple images/videos in a single post
- **Save Collections**: Save posts for later viewing with organized collections

### 🛒 Enhanced Marketplace Tab
- **Advanced Shopping**: Full shopping cart with quantity management and real-time updates
- **Wishlist**: Save products for later purchase with organized collections
- **Order Management**: Complete order tracking from placement to delivery
- **Product Reviews**: Rate and review purchased products with photos
- **Smart Filtering**: Filter by category, price range, condition, location, and ratings
- **Seller Profiles**: Comprehensive seller information and product catalogs
- **Payment Integration**: Secure checkout with multiple payment options
- **Inventory Management**: Real-time stock tracking and availability updates

### 👤 Profile Tab
- **Enhanced Analytics**: Detailed insights on post performance and engagement
- **Content Management**: Organize posts, saved items, and shopping history
- **Business Tools**: Advanced seller dashboard with sales analytics
- **Privacy Controls**: Granular privacy settings and data management

## 🛠 Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL for relational data with enhanced schema
- Redis for caching and sessions
- WebSocket for real-time features
- JWT for authentication
- **Cloudinary** for media storage and optimization
- **Multer** for file upload handling
- Microservices architecture

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Socket.io for real-time communication
- **React Dropzone** for drag-and-drop file uploads
- **Cloudinary React** for media management
- PWA capabilities
- Responsive design (mobile-first)

### New Integrations
- **Cloudinary**: Cloud-based media management and optimization
- **Advanced Database Schema**: Enhanced tables for engagement, e-commerce, and analytics
- **Real-time Updates**: Live engagement tracking and cart synchronization
- **AI Recommendations**: Machine learning-based content suggestions

## Project Structure

```
/workspace/
├── backend/          # Node.js backend services
├── frontend/         # React.js frontend application
└── README.md
```

## 🚀 Quick Start

### Automated Setup
Run the setup script for automatic configuration:
```bash
./setup.sh
```

### Manual Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workspace
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy and edit environment files
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Set up Cloudinary**
   - Create account at [Cloudinary](https://cloudinary.com)
   - Add credentials to `backend/.env`:
     ```env
     CLOUDINARY_CLOUD_NAME=your-cloud-name
     CLOUDINARY_API_KEY=your-api-key
     CLOUDINARY_API_SECRET=your-api-secret
     ```

5. **Run database migrations**
   ```bash
   cd backend
   npm run migrate
   ```

6. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:12001
   - Backend API: http://localhost:12000

## 📚 Documentation

- **Enhanced Features**: [ENHANCED_FEATURES.md](./ENHANCED_FEATURES.md)
- **API Documentation**: Available at `/api/v1/docs` when server is running
- **Database Schema**: See migration files in `backend/migrations/`

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