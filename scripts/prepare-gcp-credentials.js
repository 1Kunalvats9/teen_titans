#!/usr/bin/env node

/**
 * Script to prepare GCP credentials for production deployment
 * Converts your google-credentials.json file to a single-line environment variable
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 GCP Credentials Preparation Script for Production\n');

// Check if credentials file exists
const credentialsPath = path.join(__dirname, '..', 'credentials', 'google-credentials.json');

if (!fs.existsSync(credentialsPath)) {
  console.error('❌ Credentials file not found at:', credentialsPath);
  console.log('\n📁 Make sure you have:');
  console.log('   - credentials/google-credentials.json file');
  console.log('   - Downloaded from Google Cloud Console');
  process.exit(1);
}

try {
  // Read and parse the credentials file
  const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
  const credentials = JSON.parse(credentialsContent);
  
  console.log('✅ Credentials file loaded successfully');
  console.log(`📋 Project ID: ${credentials.project_id}`);
  console.log(`👤 Service Account: ${credentials.client_email}`);
  
  // Convert to single line (escape newlines)
  const productionCredentials = credentialsContent
    .replace(/\n/g, '\\n')
    .replace(/"/g, '\\"');
  
  console.log('\n🔑 PRODUCTION ENVIRONMENT VARIABLE:');
  console.log('=====================================');
  console.log(`GOOGLE_APPLICATION_CREDENTIALS="${productionCredentials}"`);
  console.log('=====================================');
  
  console.log('\n📝 INSTRUCTIONS:');
  console.log('1. Copy the above line');
  console.log('2. Paste it in your Vercel environment variables');
  console.log('3. Or add it to your .env.production file');
  
  console.log('\n⚠️  SECURITY NOTES:');
  console.log('- Keep your credentials secure');
  console.log('- Never commit credentials to git');
  console.log('- Use Vercel environment variables for production');
  
  // Also save to a file for easy copying
  const outputPath = path.join(__dirname, '..', 'gcp-credentials-production.txt');
  fs.writeFileSync(outputPath, `GOOGLE_APPLICATION_CREDENTIALS="${productionCredentials}"`);
  console.log(`\n💾 Also saved to: ${outputPath}`);
  
} catch (error) {
  console.error('❌ Error processing credentials:', error.message);
  process.exit(1);
}
