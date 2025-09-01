# 🚀 Production Deployment Guide for teen-titans.vercel.app

## **✅ What's Already Fixed**
- ✅ WebSocket CORS for Vercel frontend
- ✅ NextAuth production configuration
- ✅ Login redirects and authentication flow
- ✅ Theme switching across all routes
- ✅ Environment variable templates

## **🔑 GCP Vision API Credentials - CRITICAL FOR PRODUCTION**

### **❌ Problem:**
Your local setup uses:
```bash
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-credentials.json
```

**This won't work on Vercel because:**
- Vercel doesn't have access to your local files
- The credentials file path doesn't exist in production
- Vision API calls will fail

### **✅ Solution: Convert to Environment Variable**

#### **Step 1: Run the Preparation Script**
```bash
cd teen_titans
node scripts/prepare-gcp-credentials.js
```

This will output your credentials as a single-line environment variable.

#### **Step 2: Set in Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `teen-titans` project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   Name: GOOGLE_APPLICATION_CREDENTIALS
   Value: [Output from the script]
   Environment: Production
   ```

## **🌍 Complete Environment Variables for Production**

### **Required Variables:**
```bash
# NextAuth
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=https://teen-titans.vercel.app

# Database
DATABASE_URL=your_production_database_url

# GCP Vision API (CRITICAL)
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account",...}

# WebSocket
NEXT_PUBLIC_WEBSOCKET_URL=wss://learnos-websocket-server.onrender.com
```

### **Optional Variables:**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email
EMAIL_SERVER_HOST=your_email_host
EMAIL_SERVER_PASSWORD=your_email_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Vapi
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
```

## **🚀 Deployment Steps**

### **1. Prepare GCP Credentials**
```bash
cd teen_titans
node scripts/prepare-gcp-credentials.js
```

### **2. Set Vercel Environment Variables**
- Copy the output from the script
- Paste in Vercel dashboard environment variables

### **3. Deploy Frontend**
```bash
git add .
git commit -m "Fix production deployment and GCP credentials"
git push origin main
```

### **4. Deploy WebSocket Server**
```bash
cd websocket-server
git add .
git commit -m "Update CORS for Vercel frontend"
git push origin main
```

## **🧪 Testing Production**

### **Test Vision API:**
1. Visit: https://teen-titans.vercel.app/chatbot
2. Upload an image with text
3. Check if text extraction works

### **Test WebSocket:**
1. Visit: https://teen-titans.vercel.app/community
2. Check if real-time features work

### **Test Authentication:**
1. Login should redirect to dashboard
2. Theme switching should work on all pages

## **🔍 Troubleshooting**

### **Vision API Not Working:**
- ✅ Check `GOOGLE_APPLICATION_CREDENTIALS` is set in Vercel
- ✅ Verify service account has "Cloud Vision API User" role
- ✅ Check Vercel function logs for errors

### **WebSocket Not Connecting:**
- ✅ Verify WebSocket server is running on Render
- ✅ Check CORS configuration in WebSocket server
- ✅ Verify `NEXT_PUBLIC_WEBSOCKET_URL` is set

### **Authentication Issues:**
- ✅ Check `NEXTAUTH_SECRET` is set
- ✅ Verify `NEXTAUTH_URL` matches your domain
- ✅ Check database connection

## **📋 Pre-Deployment Checklist**

- [ ] GCP credentials converted to environment variable
- [ ] All environment variables set in Vercel
- [ ] WebSocket server CORS updated
- [ ] Database connection tested
- [ ] Google OAuth redirect URIs updated
- [ ] Local build successful (`npm run build`)

## **🎯 Expected Results**

After deployment:
- ✅ Vision API works in production
- ✅ WebSocket connections work from Vercel
- ✅ Authentication flow works properly
- ✅ Theme switching works on all pages
- ✅ All features work as in local development

## **🆘 Need Help?**

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables are set
3. Test individual components
4. Check WebSocket server status

**Your app should work exactly like local development once deployed! 🎉**
