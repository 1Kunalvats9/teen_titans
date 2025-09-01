# WebSocket Server URL Configuration

## Overview

The frontend has been updated to use the deployed WebSocket server at `https://learnos-websocket-server.onrender.com`.

## Configuration

### Environment Variables

Set the following environment variable in your deployment:

```bash
NEXT_PUBLIC_WEBSOCKET_URL=wss://learnos-websocket-server.onrender.com
```

### Local Development

For local development, you can either:

1. **Use the deployed server** (recommended):
   ```bash
   NEXT_PUBLIC_WEBSOCKET_URL=wss://learnos-websocket-server.onrender.com
   ```

2. **Use local WebSocket server**:
   ```bash
   NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
   ```

3. **Let it default** to the deployed server (current behavior)

## Changes Made

### 1. Constants Configuration (`src/constants/index.ts`)
Added WebSocket configuration:
```typescript
export const WEBSOCKET_CONFIG = {
  serverUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://learnos-websocket-server.onrender.com',
  localUrl: 'ws://localhost:3001',
  getUrl: () => {
    if (process.env.NODE_ENV === 'production') {
      return WEBSOCKET_CONFIG.serverUrl;
    }
    return process.env.NEXT_PUBLIC_WEBSOCKET_URL || WEBSOCKET_CONFIG.localUrl;
  }
};
```

### 2. CommunityChat Component (`src/components/community/CommunityChat.tsx`)
Updated to use the centralized WebSocket configuration:
```typescript
const wsUrl = `${WEBSOCKET_CONFIG.getUrl()}?communityId=${communityId}&userId=${user?.id}`;
```

## Deployment

### Vercel
1. Go to your Vercel project settings
2. Add environment variable:
   - Name: `NEXT_PUBLIC_WEBSOCKET_URL`
   - Value: `wss://learnos-websocket-server.onrender.com`
3. Redeploy your application

### Other Platforms
Add the environment variable `NEXT_PUBLIC_WEBSOCKET_URL=wss://learnos-websocket-server.onrender.com` to your deployment configuration.

## Testing

1. **Check WebSocket Connection**: Open browser dev tools and look for WebSocket connection logs
2. **Test Community Chat**: Try sending messages in a community to verify real-time functionality
3. **Monitor Console**: Look for connection success/error messages

## Troubleshooting

### Connection Issues
- Verify the WebSocket server is running: `https://learnos-websocket-server.onrender.com/health`
- Check browser console for WebSocket connection errors
- Ensure CORS is properly configured on the WebSocket server

### Environment Variable Issues
- Make sure `NEXT_PUBLIC_` prefix is used for client-side environment variables
- Restart your development server after changing environment variables
- Verify the environment variable is set in your deployment platform
