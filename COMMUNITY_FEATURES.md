# Community Features Implementation

This document describes the new community features added to the Teen Titans learning platform.

## Features Implemented

### 1. Profile Editing
- Users can edit their display name and profile image
- Profile editor accessible from the dashboard header
- Image upload with preview functionality
- Real-time profile updates

### 2. Community System
- View all active communities
- Join communities with one click
- Community member counts and message counts
- Community descriptions and creation dates

### 3. Real-time Community Chat
- WebSocket-based real-time messaging
- Auto-disappearing messages (5-day expiration)
- User avatars and names in chat
- Connection status indicators
- Message timestamps

### 4. WebSocket Server
- Separate Node.js WebSocket server
- Room-based messaging (per community)
- Automatic reconnection
- Health check endpoint
- CORS support for localhost:3000

## Database Schema Changes

### New Models Added

#### Community
```prisma
model Community {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members  CommunityMember[]
  messages CommunityMessage[]
}
```

#### CommunityMember
```prisma
model CommunityMember {
  role     String   @default("MEMBER")
  joinedAt DateTime @default(now())

  userId      String
  communityId String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  community   Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  @@id([userId, communityId])
}
```

#### CommunityMessage
```prisma
model CommunityMessage {
  id        String   @id @default(cuid())
  content   String   @db.Text
  createdAt DateTime @default(now())
  expiresAt DateTime // Auto-deletion after 5 days

  authorId    String
  communityId String
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  community   Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  @@index([communityId, createdAt])
  @@index([expiresAt])
}
```

## API Routes

### Communities
- `GET /api/communities` - Fetch all active communities
- `POST /api/communities/seed` - Seed initial communities (for testing)
- `GET /api/communities/[communityId]` - Get specific community details
- `POST /api/communities/[communityId]/join` - Join a community

### Messages
- `GET /api/communities/[communityId]/messages` - Fetch community messages
- `POST /api/communities/[communityId]/messages` - Send a message

### Cleanup
- `POST /api/cleanup/expired-messages` - Clean up expired messages

## Components

### Profile Editor
- `src/components/dashboard/ProfileEditor.tsx` - Profile editing modal
- Integrated into dashboard header with click-to-edit functionality

### Community Components
- `src/components/community/CommunityList.tsx` - List of all communities
- `src/components/community/CommunityChat.tsx` - Real-time chat interface

### Pages
- `src/app/community/page.tsx` - Main communities page
- `src/app/community/[communityId]/page.tsx` - Individual community page

## WebSocket Server

### Location
- `../websocket-server/` (outside the Next.js app)

### Features
- Real-time message broadcasting
- Community-based rooms
- Connection management
- Health monitoring

### Usage
```bash
cd websocket-server
npm install
npm run dev
```

## Setup Instructions

### 1. Database Migration
```bash
npx prisma migrate dev --name add_communities
```

### 2. Install WebSocket Server Dependencies
```bash
cd ../websocket-server
npm install
```

### 3. Start Both Servers
```bash
# Option 1: Use the provided script
./start-servers.sh

# Option 2: Start manually
# Terminal 1: WebSocket server
cd ../websocket-server && npm run dev

# Terminal 2: Next.js app
npm run dev
```

### 4. Seed Initial Communities
Visit `/api/communities/seed` in your browser or make a POST request to seed initial communities.

## Usage Flow

1. **Profile Editing**: Click on profile image in dashboard header → Edit profile → Save changes
2. **Community Discovery**: Navigate to Communities page → View available communities
3. **Joining Communities**: Click "Join Community" on any community card
4. **Chatting**: Click "View Community" → Real-time chat interface opens
5. **Messaging**: Type messages in the chat input → Messages appear in real-time for all members

## Security Features

- User authentication required for all community features
- Membership validation before accessing community content
- CORS protection on WebSocket server
- Input validation and sanitization
- Auto-cleanup of expired messages

## Performance Considerations

- Messages auto-expire after 5 days to prevent database bloat
- WebSocket connections are room-based for efficient broadcasting
- Database indexes on frequently queried fields
- Lazy loading of community lists and messages

## Future Enhancements

- Community moderation tools
- Message reactions and replies
- File sharing in communities
- Community categories and tags
- Push notifications for new messages
- Community analytics and insights
