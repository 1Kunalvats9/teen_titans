# Vapi AI Tutor Voice Integration Setup

This guide will help you set up Vapi for voice conversations with your AI tutor.

## Prerequisites

1. **Vapi Account**: Sign up at [vapi.ai](https://vapi.ai)
2. **Assistant Setup**: Create an AI assistant in your Vapi dashboard
3. **Environment Variables**: Configure your `.env.local` file

## Step 1: Create Vapi Account

1. Go to [vapi.ai](https://vapi.ai) and sign up
2. Complete the onboarding process
3. Navigate to your dashboard

## Step 2: Create an AI Assistant

1. In your Vapi dashboard, go to "Assistants"
2. Click "Create Assistant"
3. Configure your assistant:

### Basic Settings
- **Name**: "AI Learning Tutor" (or your preferred name)
- **Description**: "AI tutor for educational conversations"

### Model Configuration
- **Provider**: OpenAI (or your preferred provider)
- **Model**: GPT-4 or GPT-3.5-turbo
- **Temperature**: 0.7 (for balanced creativity and accuracy)

### Voice Configuration
- **Provider**: ElevenLabs (recommended for natural voice)
- **Voice**: Choose a voice that matches your tutor's personality
- **Speed**: 1.0 (normal speed)

### System Prompt
Use this system prompt for an effective AI tutor:

```
You are an AI learning assistant named Alisha, designed to help students learn various topics in technology and programming. Your role is to:

1. Be patient, encouraging, and supportive
2. Explain complex concepts in simple terms
3. Provide relevant examples and analogies
4. Ask clarifying questions when needed
5. Adapt your teaching style to the student's level
6. Keep responses concise but comprehensive
7. Use a friendly, conversational tone

When a student asks a question:
- First, understand what they're asking
- Provide a clear, structured explanation
- Include practical examples when possible
- Ask if they need clarification
- Encourage them to ask follow-up questions

Remember: You're not just providing answers, you're helping students learn and understand concepts deeply.
```

## Step 3: Get Your Credentials

1. **Public API Key**:
   - Go to "API Keys" in your Vapi dashboard
   - Copy your public API key (starts with `pk_`)

2. **Assistant ID**:
   - Go to "Assistants" in your Vapi dashboard
   - Click on your AI tutor assistant
   - Copy the Assistant ID from the URL or details page

## Step 4: Environment Configuration

Create or update your `.env.local` file in the project root:

```env
# Vapi Configuration
NEXT_PUBLIC_VAPI_PUBLIC_KEY=pk_your_public_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here

# Other existing environment variables...
GOOGLE_AI_API_KEY=your_gemini_api_key_here
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-credentials.json
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UNSIGNED_PRESET=your_upload_preset_name
```

## Step 5: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the AI Tutor page**:
   - Go to `/ai-tutor` in your browser
   - Select a learning topic and difficulty
   - Click "Start Voice Chat"

3. **Test the voice conversation**:
   - Allow microphone access when prompted
   - Speak naturally with your AI tutor
   - Test mute/unmute functionality
   - Check the conversation transcript

## Step 6: Customize Your Assistant (Optional)

### Voice Customization
- **ElevenLabs Voices**: Choose from various natural-sounding voices
- **Voice Cloning**: Create a custom voice for your brand
- **Language Support**: Configure for multiple languages

### Conversation Flow
- **Greeting Messages**: Customize how your tutor introduces topics
- **Response Length**: Adjust for concise or detailed explanations
- **Personality**: Fine-tune the tutor's teaching style

### Advanced Features
- **Function Calling**: Add capabilities like searching, calculations, etc.
- **Memory**: Enable conversation context retention
- **Analytics**: Track conversation quality and student engagement

## Troubleshooting

### Common Issues

1. **"Vapi public key not configured"**
   - Check your `.env.local` file
   - Ensure `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is set correctly
   - Restart your development server

2. **"Vapi assistant ID not configured"**
   - Verify `NEXT_PUBLIC_VAPI_ASSISTANT_ID` in `.env.local`
   - Check that the assistant ID is correct
   - Ensure the assistant is active in your Vapi dashboard

3. **Microphone not working**
   - Check browser permissions
   - Ensure HTTPS (required for microphone access)
   - Test with a different browser

4. **Call not connecting**
   - Verify your Vapi account has sufficient credits
   - Check the Vapi dashboard for any errors
   - Ensure your assistant is properly configured

5. **Poor voice quality**
   - Check your internet connection
   - Try a different voice provider
   - Adjust voice settings in your assistant configuration

### Debug Information

Check your browser console for:
- Vapi initialization messages
- Connection status updates
- Error messages and stack traces

### Environment Variable Verification

The AI Tutor page shows configuration status:
- ✅ Vapi Public Key: Configured
- ✅ Assistant ID: Configured

If either shows ❌, check your `.env.local` file.

## Best Practices

### Security
- Never commit `.env.local` to version control
- Use environment-specific keys for production
- Regularly rotate your API keys

### Performance
- Monitor your Vapi usage and costs
- Optimize assistant responses for faster conversations
- Use appropriate voice models for your use case

### User Experience
- Test with different accents and speaking speeds
- Provide clear instructions for users
- Include fallback options for voice issues

## Advanced Configuration

### Webhook Integration
For production applications, consider setting up webhooks:
- Call analytics and logging
- Conversation storage and retrieval
- Integration with your backend systems

### Multi-language Support
Configure your assistant for multiple languages:
- Set up language-specific system prompts
- Use appropriate voice models for each language
- Handle language switching gracefully

### Analytics and Monitoring
Track conversation quality:
- Student engagement metrics
- Learning outcome assessments
- Voice quality monitoring

## Support

- **Vapi Documentation**: [docs.vapi.ai](https://docs.vapi.ai)
- **Vapi Community**: [community.vapi.ai](https://community.vapi.ai)
- **API Reference**: [api.vapi.ai](https://api.vapi.ai)

## Next Steps

After setting up the basic voice integration:

1. **Customize the UI**: Modify the voice widget appearance
2. **Add Features**: Implement conversation history, notes, etc.
3. **Integrate with Backend**: Store conversations and learning progress
4. **Deploy**: Move to production with proper environment configuration

Your AI tutor is now ready to provide engaging voice-based learning experiences!
