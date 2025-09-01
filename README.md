This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/building-your-application/deploying) for more details.

## AI Tutor Feature

This project includes an AI Tutor feature powered by **Vapi** for voice conversations and Google's Gemini AI for text-based interactions. The AI tutor, named Alisha, provides both voice and text-based learning sessions.

### Features
- **Voice-based Learning**: Interactive voice conversations with an AI tutor using Vapi
- **Text-based Learning**: Chat interface for text-based learning (coming soon)
- **Topic Selection**: Choose from various learning topics including Programming, Web Development, Data Science, and more
- **Adaptive Learning**: AI adjusts explanations based on difficulty level and user understanding
- **Real-time Voice Interaction**: Natural voice conversations with immediate responses
- **Conversation Transcripts**: View and review your learning conversations
- **Modern UI**: Beautiful, responsive interface with smooth animations

### Setup Requirements

To use the AI Tutor feature, you'll need to set up the following environment variables:

```bash
# Vapi Configuration (for voice conversations)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id

# Google AI (Gemini) - for text-based interactions
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Other services
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-credentials.json
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UNSIGNED_PRESET=your_upload_preset_name
```

### Vapi Setup

1. **Create a Vapi account** at [vapi.ai](https://vapi.ai)
2. **Create an AI assistant** in your Vapi dashboard
3. **Configure the assistant** with educational prompts and voice settings
4. **Get your credentials**:
   - Public API key from API Keys section
   - Assistant ID from your assistant details

For detailed Vapi setup instructions, see [VAPI_SETUP.md](./VAPI_SETUP.md)

### Usage

1. Navigate to the AI Tutor page (`/ai-tutor`)
2. Select a learning topic and difficulty level
3. Choose between Voice Chat or Text Chat
4. **Voice Chat**: Start a voice conversation with Alisha
5. **Text Chat**: Chat through text interface (coming soon)

The AI tutor will guide you through concepts, provide examples, and answer questions in a friendly, patient manner suitable for learning.

### Voice Chat Features

- **Natural Conversations**: Speak naturally with your AI tutor
- **Real-time Transcription**: See what you and the AI are saying
- **Mute/Unmute**: Control your microphone during conversations
- **Speaker Control**: Adjust audio output settings
- **Call Management**: Start, end, and restart voice sessions
- **Visual Indicators**: See when you or the AI is speaking

### Learning Topics

- **Programming Fundamentals**: Variables, Control Structures, Functions, OOP
- **Web Development**: HTML/CSS, JavaScript, React, Node.js, Databases
- **Data Science & AI**: Python, Statistics, Machine Learning, Data Visualization
- **Mobile Development**: React Native, Flutter, Mobile UI/UX
- **Cybersecurity**: Network Security, Cryptography, Penetration Testing
- **Cloud Computing**: AWS, Azure, Google Cloud, DevOps

## Community Features

This platform also includes community-based learning features:

- **Learning Communities**: Join topic-specific learning groups
- **Peer Support**: Connect with other learners
- **Shared Resources**: Access community-curated learning materials
- **Progress Tracking**: Monitor your learning journey

## Development

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- PostgreSQL database
- Vapi account for voice features

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd teen_titans

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Key Technologies
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Voice AI**: Vapi
- **Text AI**: Google Gemini
- **Styling**: Tailwind CSS, Framer Motion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
