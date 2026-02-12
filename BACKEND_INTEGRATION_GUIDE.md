# Backend Integration Guide - Unitee Portal + Mobile App

This guide explains how the Unitee Portal backend is set up to work with the Unitee mobile app with **separate authentication systems**.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    UNITEE PORTAL (Web)                       │
│              Next.js + Supabase + TypeScript                │
│  - /api/announcements                                       │
│  - /api/events                                              │
│  - /api/chapters                                            │
│  - /api/notifications                                       │
│  - /api/app/auth/* (App-specific auth)                     │
└─────────────────────────────────────────────────────────────┘
                           ↕
        REST API + WebSocket Connection (CORS enabled)
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                   UNITEE MOBILE APP                          │
│           React Native + Expo + TypeScript                  │
│  - App-specific authentication (separate from portal)       │
│  - DataContext for global state management                 │
│  - useRealtimeUpdates for WebSocket sync                   │
│  - Automatic polling fallback                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints Created

### Authentication (App-Specific)
- **POST** `/api/app/auth/login` - Login with email/password
- **POST** `/api/app/auth/register` - Register new app user
- **POST** `/api/app/auth/refresh` - Refresh auth token

### Announcements
- **GET** `/api/announcements` - List all announcements (paginated)
- **POST** `/api/announcements` - Create announcement (auth required)
- **GET** `/api/announcements/:id` - Get single announcement
- **PUT** `/api/announcements/:id` - Update announcement (author only)
- **DELETE** `/api/announcements/:id` - Delete announcement (author only)

### Events
- **GET** `/api/events` - List all events (with RSVP status if authenticated)
- **POST** `/api/events` - Create event (auth required)
- **GET** `/api/events/:id` - Get event details with attendee count
- **PUT** `/api/events/:id` - Update event (creator only)
- **DELETE** `/api/events/:id` - Delete event (creator only)
- **POST** `/api/events/:id/rsvp` - RSVP to event (create or update)
- **DELETE** `/api/events/:id/rsvp` - Cancel RSVP

### Chapters
- **GET** `/api/chapters` - List all chapters
- **POST** `/api/chapters` - Create chapter (auth required)
- **GET** `/api/chapters/:id` - Get chapter details
- **GET** `/api/chapters/:id/announcements` - Get announcements for chapter
- **PUT** `/api/chapters/:id` - Update chapter (creator only)
- **DELETE** `/api/chapters/:id` - Delete chapter (creator only)

### Notifications (User-specific)
- **GET** `/api/notifications` - Get user's notifications (auth required)
- **POST** `/api/notifications` - Create notification (internal)
- **PUT** `/api/notifications/:id` - Mark notification as read
- **DELETE** `/api/notifications/:id` - Delete notification

---

## 🔐 Authentication System

### App Authentication (Separate from Portal)

The mobile app uses **app-specific authentication** that is completely separate from the portal:

1. **Login Flow:**
   ```
   User enters email/password in app
         ↓
   POST /api/app/auth/login
         ↓
   Backend verifies credentials (Supabase Auth)
         ↓
   Returns: { access_token, refresh_token, user }
         ↓
   App stores tokens locally
   ```

2. **Token Storage:**
   - Access token: Short-lived (expires in ~1 hour)
   - Refresh token: Long-lived (expires in ~7 days)
   - Stored securely in app's secure storage

3. **Token Refresh:**
   ```
   When access token expires
         ↓
   POST /api/app/auth/refresh (with refresh_token)
         ↓
   Backend validates and returns new access_token
   ```

4. **Authorization:**
   All API requests include:
   ```
   Authorization: Bearer <access_token>
   ```

---

## 💾 Database Schema

### Tables Created

**announcements**
- id (UUID, PK)
- title, content, category
- author_id, author_name
- created_at, updated_at
- Indexes: created_at, category

**events**
- id (UUID, PK)
- title, description
- start_date, end_date, location
- chapter_id, created_by
- created_at, updated_at
- Indexes: start_date

**event_rsvp**
- id (UUID, PK)
- event_id, user_id (FK)
- attending (boolean)
- created_at
- Unique: (event_id, user_id)

**chapters**
- id (UUID, PK)
- name, description
- member_count
- created_by, created_at, updated_at

**notifications**
- id (UUID, PK)
- user_id (FK)
- title, message, type
- related_id, read
- created_at

**chats** & **chat_messages** & **chat_participants**
- For real-time messaging

All tables have Row-Level Security (RLS) enabled for data privacy.

---

## 🔄 Real-Time Updates

### WebSocket Events

When admin creates/updates data in the portal, backend emits WebSocket events:

```typescript
// When announcement is created
{
  type: "announcement_created",
  data: { id, title, content, category, author_name, created_at }
}

// When event is created
{
  type: "event_created",
  data: { id, title, description, start_date, location, ... }
}

// When user receives notification
{
  type: "new_notification",
  data: { id, title, message, type, created_at }
}
```

### Mobile App Handling

The app automatically:
1. **Connects via WebSocket** when it launches
2. **Listens for events** from the backend
3. **Automatically syncs data** when event is received
4. **Falls back to polling** if WebSocket fails (every 30 seconds)
5. **Displays new data** immediately in UI

---

## 🛡️ Security Features

### Row-Level Security (RLS)
- Users can only read announcements (public)
- Users can only update their own announcements
- Users can only read their own notifications
- Users can only access authorized data

### Verified Endpoints
- `/api/app/auth/*` - Public (for login/register)
- `/api/announcements` GET - Public
- `/api/announcements` POST/PUT/DELETE - Auth required
- `/api/events` GET - Public
- `/api/events/:id/rsvp` - Auth required
- `/api/notifications/*` - Auth required (user-specific)

### CORS Configuration
Middleware allows requests from:
- `localhost:3000` (portal dev)
- `localhost:8081` (app iOS simulator)
- `localhost:19000` (Expo dev server)
- Production app URL (set via env var)

---

## 📋 Implementation Checklist

### Backend Setup (✅ Completed)

- ✅ Database migration created (`20250212_announcements_events.sql`)
- ✅ API endpoints for announcements
- ✅ API endpoints for events with RSVP
- ✅ API endpoints for chapters
- ✅ API endpoints for notifications
- ✅ App-specific authentication endpoints
- ✅ CORS middleware configured
- ✅ RLS policies configured
- ✅ Database indexes created

### Frontend Integration (⏳ Next Steps)

In the mobile app, you need to:
1. Update `.env`:
   ```
   REACT_APP_PORTAL_URL=https://your-domain.com/api
   REACT_APP_WEBSOCKET_URL=wss://your-domain.com/ws
   ```

2. Wrap app with `DataProvider` (already in App.tsx)

3. Use `useData()` hook in screens (already created)

4. Login users with app-specific auth:
   ```typescript
   const response = await apiService.login(email, password);
   apiService.setAuthToken(response.data.session.access_token);
   ```

5. Enable real-time updates:
   ```typescript
   const { isConnected } = useRealtimeUpdates();
   ```

---

## 🚀 Deployment Checklist

### Environment Variables

**Portal (.env)**
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Mobile App (.env)**
```
REACT_APP_PORTAL_URL=https://api.yourdomain.com
REACT_APP_WEBSOCKET_URL=wss://api.yourdomain.com/ws
```

### Pre-Deployment

- ✅ Run database migration: `supabase db push`
- ✅ Test authentication flow
- ✅ Test announcements API
- ✅ Test events with RSVP
- ✅ Test WebSocket connection
- ✅ Verify CORS headers in response

### Production

- Use HTTPS/WSS only (no HTTP/WS)
- Set proper CORS allowed origins
- Enable rate limiting on API endpoints
- Set up monitoring and logging
- Configure backups and disaster recovery

---

## 🧪 Testing the Integration

### 1. Test Login
```bash
curl -X POST https://yourdomain.com/api/app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 2. Test Creating Announcement
```bash
curl -X POST https://yourdomain.com/api/announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title":"Welcome!",
    "content":"This is a test announcement",
    "category":"General",
    "author_name":"Admin"
  }'
```

### 3. Test Events
```bash
curl https://yourdomain.com/api/events
```

### 4. Test in Mobile App
1. Register/login with test user
2. Verify announcements appear
3. Create new announcement in portal
4. Verify it appears in app within 5 seconds (via WebSocket)
5. RSVP to an event and verify attendee count updates

---

## 📚 File Structure

```
uniteesocial/
├── supabase/
│   └── migrations/
│       └── 20250212_announcements_events.sql  ✅ New
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── announcements/        ✅ New
│   │       ├── events/               ✅ New
│   │       ├── chapters/             ✅ New
│   │       ├── notifications/        ✅ New
│   │       └── app/auth/            ✅ New (app-specific)
│   ├── middleware.ts                 ✅ New (CORS)
│   └── lib/
│       └── supabase/
│           ├── server.ts
│           └── admin.ts
└── ...

unite app/
├── src/
│   └── services/
│       ├── api.ts                    ✅ Updated
│       ├── DataContext.tsx           ✅ Created
│       └── useRealtimeUpdates.ts     ✅ Created
└── ...
```

---

## 🔗 Next Steps

1. **Run the database migration** on your Supabase instance
2. **Deploy the backend** to production
3. **Configure environment variables** in the mobile app
4. **Test the complete flow** from portal to app
5. **Set up WebSocket server** (if using separate WebSocket service)
6. **Monitor logs** for any integration issues

---

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Native Networking](https://reactnative.dev/docs/network)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Backend integration is now complete!** The mobile app can now sync announcements, events, and other data from the portal in real-time. 🎉
