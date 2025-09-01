# Environment Setup Guide for Teen Titans Learning Platform

## Required Environment Variables

Make sure your `.env.local` file contains the following variables:

```env
# Google AI API Key (for Gemini)
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Google Cloud Vision API Credentials (File path - RECOMMENDED)
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-credentials.json

# Cloudinary Configuration (for profile image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UNSIGNED_PRESET=your_upload_preset_name
```

## Setup Instructions

### 1. Google Cloud Vision API Setup

1. **Create a Google Cloud Project** (if you don't have one)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable the Vision API**
   - In the Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click on it and press "Enable"

3. **Create a Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details
   - Click "Create and Continue"

4. **Generate Service Account Key**
   - Click on your service account
   - Go to the "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Download the JSON file

5. **Set up Credentials File (RECOMMENDED)**
   ```bash
   # Create credentials directory
   mkdir -p teen_titans/credentials
   
   # Copy your downloaded JSON file to credentials directory
   cp /path/to/your/service-account-key.json teen_titans/credentials/google-credentials.json
   ```

6. **Update Environment Variable**
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-credentials.json
   ```

### 2. Google AI (Gemini) API Setup

1. **Get API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Set up Environment Variable**
   ```env
   GOOGLE_AI_API_KEY=your_gemini_api_key_here
   ```

### 3. Cloudinary Setup (for Profile Images)

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com/) and sign up
   - Get your cloud name, API key, and API secret from the dashboard

2. **Create Upload Preset (Optional but Recommended)**
   - Go to Settings > Upload
   - Create a new upload preset
   - Set it as "unsigned" for better security
   - Note the preset name

3. **Set up Environment Variables**
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_UNSIGNED_PRESET=your_preset_name
   ```

### 4. Security Setup

1. **Add to .gitignore**
   ```bash
   # Add this line to .gitignore
   echo "credentials/" >> .gitignore
   ```

2. **Verify Setup**
   ```bash
   # Check if credentials file exists
   ls -la credentials/google-credentials.json
   ```

### 5. Testing the Setup

1. **Test the APIs**
   - Visit `/api/chatbot/test` in your browser
   - This will show you if both APIs are working correctly

2. **Test Image Upload**
   - Go to the chatbot page
   - Upload an image with text
   - Check the browser console for logs
   - Verify that text is extracted and processed

3. **Test Profile Image Upload**
   - Complete the onboarding process
   - Upload a profile image during onboarding
   - Verify the image appears on the dashboard
   - Check that the image URL is saved in the database

## How It Works

### Chatbot Workflow
The chatbot now follows this workflow:

1. **Image Upload**: User uploads an image
2. **Text Extraction**: Google Cloud Vision API extracts text from the image (OCR)
3. **Text Processing**: Extracted text is sent to Gemini AI with context
4. **Response Generation**: Gemini AI generates a natural, conversational response
5. **Display**: Clean, formatted response is shown to the user

### Profile Image Workflow
The profile image system follows this workflow:

1. **Image Selection**: User selects or drags & drops an image during onboarding
2. **Image Preview**: Image is previewed before upload
3. **Cloudinary Upload**: Image is converted to base64 and uploaded to Cloudinary
4. **Database Storage**: Cloudinary URL is saved to the user's profile in the database
5. **Dashboard Display**: Profile image is displayed on the dashboard and throughout the app

### Key Features:
- **OCR Text Extraction**: Uses Google Cloud Vision API for accurate text detection
- **Context-Aware Responses**: Extracted text is included in the prompt for better understanding
- **Natural Language**: Responses are conversational and well-formatted
- **Fallback Support**: If Vision API fails, falls back to Gemini Vision
- **Error Handling**: Comprehensive error handling and logging

## Troubleshooting

### Common Issues

1. **Vision API Not Working**
   - Check if the service account has the "Cloud Vision API User" role
   - Verify the credentials file exists and is properly formatted
   - Make sure the Vision API is enabled in your project
   - Check the server logs for initialization messages

2. **Gemini API Not Working**
   - Verify your API key is correct
   - Check if you have billing enabled (required for Gemini)
   - Ensure you're using the correct model name

3. **Image Upload Issues**
   - Check browser console for errors
   - Verify the image format is supported (JPEG, PNG, etc.)
   - Make sure the image size is reasonable (< 10MB)

4. **Credential Errors**
   - Ensure the credentials file exists at `./credentials/google-credentials.json`
   - Check that the JSON file is properly formatted
   - Verify the service account has the necessary permissions
   - Check server logs for "Vision API initialized" messages

5. **No Text Extracted**
   - Ensure the image contains clear, readable text
   - Check that the text is not too small or blurry
   - Verify the image quality is good enough for OCR

6. **Profile Image Upload Issues**
   - Check if Cloudinary environment variables are properly set
   - Verify the image format is supported (JPG, PNG, GIF)
   - Ensure the image size is under 5MB
   - Check server logs for Cloudinary upload errors
   - Verify your Cloudinary account has sufficient upload credits

### Debug Information

The chatbot API includes extensive logging. Check your server logs for:
- Vision API initialization messages
- Image processing steps
- Text extraction results
- API response details
- Any error messages

### Environment Variable Format

Your `.env.local` should look like this:

```env
# Google AI API Key
GOOGLE_AI_API_KEY=AIzaSyCI5SI3n8D2um7ynJARQLIjY1blYxU85hc

# Google Cloud Vision API Credentials (File path - RECOMMENDED)
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-credentials.json
```

## Features

With this setup, your chatbot will be able to:

1. **Extract Text from Images**: Uses Google Cloud Vision API to detect and extract text
2. **Process Questions**: Sends extracted text to Gemini AI for analysis
3. **Generate Responses**: Provides natural, conversational answers
4. **Handle Various Content**: Works with text, math problems, diagrams, etc.
5. **Fallback Support**: Uses Gemini Vision if Vision API fails
6. **Clean Formatting**: Responses are well-formatted and easy to read

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your API keys secure
- Use environment-specific credentials for production
- Consider using Google Cloud IAM for better security in production
- The credentials file approach is more reliable and secure
