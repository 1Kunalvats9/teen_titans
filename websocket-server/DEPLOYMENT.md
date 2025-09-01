# WebSocket Server Deployment Guide

## 🚀 Deployed Server
- **URL**: `wss://learnos-websocket-server.onrender.com`
- **Status**: ✅ Production Ready

## 🔧 CORS Configuration
The server now accepts connections from:
- `http://localhost:3000` (Local Development)
- `https://teen-titans.vercel.app` (Production Frontend)

## 📝 Environment Variables
Set these in your Render dashboard:

```bash
# Required
PORT=3001
NODE_ENV=production

# Frontend URL (Optional - defaults to teen-titans.vercel.app)
FRONTEND_URL=https://teen-titans.vercel.app

# Keep-alive settings
KEEP_ALIVE_INTERVAL=600000  # 10 minutes in milliseconds
RENDER_EXTERNAL_URL=https://learnos-websocket-server.onrender.com
```

## 🔄 Deployment Steps
1. **Push Changes**: `git add . && git commit -m "Update CORS for Vercel frontend" && git push`
2. **Render Auto-Deploy**: Changes will automatically deploy to Render
3. **Verify**: Check that WebSocket connections work from your Vercel frontend

## ✅ What's Fixed
- **CORS**: Now accepts requests from teen-titans.vercel.app
- **API Calls**: Updated to use production frontend URL
- **Local Development**: Still works with localhost:3000
- **Production**: Fully compatible with Vercel deployment

## 🧪 Testing
1. **Local**: `ws://localhost:3001` (Development)
2. **Production**: `wss://learnos-websocket-server.onrender.com` (Vercel)

## 🚨 Important Notes
- **No Breaking Changes**: Local development still works
- **Automatic Detection**: Frontend automatically uses correct WebSocket URL
- **Secure**: Production uses WSS (secure WebSocket)
- **Scalable**: Render handles auto-scaling and uptime
