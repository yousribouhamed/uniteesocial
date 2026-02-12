# Quick Start: Deploy & Test Integration

**Time to completion: ~15 minutes**

This guide gets you from code to working integration quickly.

---

## ⚡ 5-Minute Backend Setup

### 1. Run Database Migration

```bash
cd ~/Unitee/uniteesocial

# Push migration to Supabase
supabase db push

# Or if using Supabase dashboard:
# Copy content of supabase/migrations/20250212_announcements_events.sql
# Paste into SQL Editor in Supabase dashboard
# Run
```

### 2. Set Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAi...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAi...
```

Get these from Supabase project settings.

### 3. Start Backend

```bash
npm run dev
# Running on http://localhost:3000
```

---

## ⚡ 5-Minute Mobile App Setup

### 1. Configure Backend URL

In `/Users/mac/Unitee/unite app/.env`:
```
REACT_APP_PORTAL_URL=http://localhost:3000/api
REACT_APP_WEBSOCKET_URL=ws://localhost:3000/ws
```

### 2. Start Expo

```bash
cd ~/Unitee/unite\ app
npm start
# Scan QR code with iPhone camera or Expo Go app
```

---

## ✅ 5-Minute Integration Test

### Test 1: Health Check
```bash
curl http://localhost:3000/api/announcements
# Should return: { "success": true, "data": [] }
```

### Test 2: Login
In mobile app:
1. Tap "Register"
2. Enter email: `test@example.com`
3. Enter password: `Test123!`
4. Tap "Register"
5. Then login with same credentials

### Test 3: Create Announcement
```bash
# Get your user ID from Supabase (or from app response)
USER_ID="uuid-here"
TOKEN="jwt-token-from-login"

curl -X POST http://localhost:3000/api/announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Announcement",
    "content": "This is a test!",
    "category": "General",
    "author_name": "Test User"
  }'
```

### Test 4: View in App
In mobile app:
1. Go to Home screen
2. Should see new announcement within 5 seconds
3. Pull down to refresh if needed

---

## 🎯 Complete Checklist

### Backend
- [ ] Database migration pushed
- [ ] Environment variables set
- [ ] Backend running on localhost:3000
- [ ] API endpoints responding

### Mobile App
- [ ] Backend URL configured in .env
- [ ] App running on Expo
- [ ] Can register new user
- [ ] Can login with credentials

### Integration
- [ ] Create announcement via curl
- [ ] See it appear in app within 5 seconds
- [ ] RSVP to an event works
- [ ] Notifications can be created

---

## 🚀 Production Deployment

### Backend (Choose One)

**Vercel** (Recommended)
```bash
vercel link
vercel deploy
# Set env vars in Vercel dashboard
```

**AWS**
```bash
# Use AWS CLI or console to deploy Next.js
# Set environment variables in Lambda/API Gateway
```

**Docker**
```bash
docker build -t unitee-portal .
docker run -p 3000:3000 unitee-portal
```

### Mobile App

**App Store**
```bash
eas build --platform ios
eas submit --platform ios
```

**TestFlight**
```bash
eas build --platform ios
# Download and upload to TestFlight manually
```

### Environment Variables (Production)

**Backend**
```
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Mobile App**
```
REACT_APP_PORTAL_URL=https://yourdomain.com/api
REACT_APP_WEBSOCKET_URL=wss://yourdomain.com/ws
```

---

## 🔍 Debugging

### Check Backend Logs
```bash
# Local development
npm run dev
# Watch console for errors

# Production
# Check Vercel dashboard or AWS CloudWatch
```

### Check Mobile App Logs
In Expo dev tools:
```
🟢 WebSocket connected
📢 New announcement received
Fetching announcements...
```

### Common Issues

**"Cannot connect to portal"**
- Check backend URL in .env
- Check backend is running
- Try: `curl http://localhost:3000/api/announcements`

**"Announcement not appearing"**
- Check WebSocket connection (🟢 in logs)
- Try manual pull-to-refresh
- Check network tab for API calls

**"Login failing"**
- Check email/password are correct
- Check user exists in Supabase Auth
- Check `Authorization` header in requests

---

## 📊 Quick Status Check

Run this to check everything is working:

```bash
#!/bin/bash

echo "Checking Backend..."
curl -s http://localhost:3000/api/announcements | jq . && echo "✅ Backend OK" || echo "❌ Backend down"

echo "Checking Mobile App..."
# Check if app is running in Expo
# Look for QR code in terminal output

echo "All systems ready for integration testing!"
```

---

## 📚 Complete Documentation

For detailed information, see:
- `BACKEND_INTEGRATION_GUIDE.md` - Full technical details
- `COMPLETE_SETUP_GUIDE.md` - Step-by-step guide
- `INTEGRATION_EXAMPLES.md` - Code examples

---

## ✅ Success Criteria

You're done when:
- ✅ Backend responds to API calls
- ✅ Mobile app can login
- ✅ Can create announcements
- ✅ Announcements appear in app within 5 seconds
- ✅ WebSocket shows connection (or polling works)
- ✅ Users can RSVP to events
- ✅ Notifications are received

---

**That's it! Your integration is ready.** 🎉

Next: Deploy to production and gather user feedback.
