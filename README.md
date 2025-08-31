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

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## AI Tutor Feature

This project includes an AI Tutor feature powered by VAPI and Google's Gemini AI. The AI tutor, named Alisha, provides voice-based learning sessions with the following capabilities:

### Features
- **Voice-based Learning**: Interactive conversations with an AI tutor using ElevenLabs voice synthesis
- **Topic Selection**: Choose from various learning topics including Programming, Web Development, Data Science, and more
- **Adaptive Learning**: AI adjusts explanations based on difficulty level and user understanding
- **Conversation History**: Track and resume previous learning sessions
- **Real-time Interaction**: Natural voice conversations with immediate responses

### Setup Requirements

To use the AI Tutor feature, you'll need to set up the following environment variables:

```bash
# VAPI Configuration
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### VAPI Workflow Setup

1. Create a VAPI account at [vapi.ai](https://vapi.ai)
2. Create a new workflow for the AI tutor
3. Configure the workflow to use ElevenLabs voice "Alisha - Soft and Engaging"
4. Set up the workflow to handle learning conversations with the following variables:
   - `username`: User's name
   - `userid`: User's ID
   - `conversationid`: Conversation ID
   - `topic`: Learning topic
   - `voice`: Voice configuration
   - `assistant_name`: AI assistant name
   - `welcome_message`: Initial greeting

### Usage

1. Navigate to the dashboard
2. Click on "AI Tutor Chat" in the Quick Actions section
3. Select a learning topic and difficulty level
4. Start a voice conversation with Alisha
5. Ask questions and learn through interactive dialogue

The AI tutor will guide you through concepts, provide examples, and answer questions in a friendly, patient manner suitable for learning.
