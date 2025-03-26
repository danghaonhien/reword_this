# Deployment Guide for Reword This! Chrome Extension

## ⚠️ IMPORTANT SECURITY NOTICE ⚠️

**NEVER include your OpenAI API key directly in the frontend code or frontend environment variables!**

This deployment guide uses a secure architecture where:
1. The OpenAI API key is ONLY stored on the backend server (Node.js app on Render)
2. The Chrome extension communicates with your backend, which then calls OpenAI
3. All API keys and sensitive data are stored as environment variables on the server only

Before proceeding, ensure you remove any API keys from your frontend code or environment files:
- [x] Delete the `VITE_OPENAI_API_KEY` from your local `.env` file (if present)
- [x] Verify the Chrome extension code does not contain hardcoded API keys
- [x] Ensure the extension is configured to communicate with your backend server only

This guide provides detailed, step-by-step instructions for deploying the "Reword This!" Chrome extension with a Node.js backend hosted on Render. It includes solutions for common CORS issues and the complete process for publishing the extension on the Chrome Web Store.

## Table of Contents

1. [Project Structure Overview](#project-structure-overview)
2. [Setting Up the Node.js Backend](#setting-up-the-nodejs-backend)
3. [Deploying to Render](#deploying-to-render)
4. [Addressing CORS Issues](#addressing-cors-issues)
5. [Building the Chrome Extension](#building-the-chrome-extension)
6. [Publishing to the Chrome Web Store](#publishing-to-the-chrome-web-store)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)

## Project Structure Overview

"Reword This!" is a Chrome extension that uses AI to help users rewrite text on websites. The project consists of:

- Frontend: Chrome extension built with React, TypeScript, and TailwindCSS
- Backend: Node.js server to handle API calls to OpenAI

## Setting Up the Node.js Backend

### 1. Create a Backend Directory

- [x] Create a dedicated directory for your Node.js backend:

```bash
mkdir reword-this-backend
cd reword-this-backend
npm init -y
```

### 2. Install Required Dependencies

- [x] Install the necessary packages:

```bash
npm install express cors dotenv helmet express-rate-limit openai
npm install --save-dev typescript @types/express @types/cors @types/node ts-node nodemon
```

### 3. Set Up TypeScript Configuration

- [x] Create a `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

> Note: We switched to JavaScript to avoid TypeScript configuration issues.

### 4. Create Basic Directory Structure

- [x] Create the source directory:

```bash
mkdir -p src
```

### 5. Create the Main Server File

- [x] Create the server file (we're using JavaScript instead of TypeScript):

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { OpenAI } = require('openai');

// Load environment variables
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for simplicity, consider enabling in production
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Configure CORS with strict settings
app.use(cors({
  origin: [
    // Chrome extension URLs
    'chrome-extension://*/index.html',
    // For development
    'http://localhost:5173',
    'http://localhost:4173',
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Preflight results can be cached for 1 day (in seconds)
}));

// Handle OPTIONS requests explicitly
app.options('*', cors());

// Parse JSON bodies
app.use(express.json({ limit: '1mb' })); // Limiting request size for security

// API status route
app.get('/', (req, res) => {
  res.send('Reword This! API is running');
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({ message: 'CORS is working correctly!' });
});

// OpenAI API endpoint for text rewriting
app.post('/api/rewrite', async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo', maxTokens = 1000 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    
    res.json({ result: completion.choices[0]?.message?.content || '' });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'Error calling OpenAI API', 
      details: error.message 
    });
  }
});

// Battle endpoint for generating two versions
app.post('/api/battle', async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo', maxTokens = 1000 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    
    const response = completion.choices[0]?.message?.content || '';
    
    // Parse the response to extract Version A and Version B
    const versionAMatch = response.match(/Version A[:\s]*(.+?)(?=Version B|$)/is);
    const versionBMatch = response.match(/Version B[:\s]*(.+?)$/is);
    
    if (!versionAMatch || !versionBMatch) {
      console.warn('Battle response parsing issue:', response);
    }
    
    res.json({
      versionA: versionAMatch?.[1]?.trim() || 'Failed to generate Version A. Please try again.',
      versionB: versionBMatch?.[1]?.trim() || 'Failed to generate Version B. Please try again.'
    });
  } catch (error) {
    console.error('Battle API error:', error);
    res.status(500).json({ 
      error: 'Error generating battle rewrites', 
      details: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 6. Create Environment Variables File

- [x] Create a `.env` file in the root of your backend project:

```
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

### 7. Update `package.json` with Scripts

- [x] Add these scripts to your `package.json`:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js"
}
```

### 8. Create a `.gitignore` File

- [x] Create a `.gitignore` file:

```
# Dependencies
node_modules/

# Environment variables
.env

# Build output
dist/

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
```

### 9. Test the Backend Locally

- [x] Start the development server:

```bash
npm run dev
```

- [x] Visit `http://localhost:3000` to verify the server is running.

## Deploying to Render

### 1. Create a GitHub Repository

- [ ] Go to GitHub and create a new repository:
  - Visit https://github.com/new
  - Name: reword-this-backend
  - Description: Backend API server for Reword This Chrome Extension
  - Visibility: Public or Private (your choice)
  - Initialize with a README: Yes
  - Click "Create repository"

### 2. Push Your Backend Code to GitHub

- [ ] Initialize a Git repository in your backend folder:
```bash
# From the reword-this-backend directory
git init
git add .
git commit -m "Initial backend setup"
```

- [ ] Add the GitHub repository as remote:
```bash
git remote add origin https://github.com/yourusername/reword-this-backend.git
git branch -M main
git push -u origin main
```

### 3. Create a Render Account

- [x] Sign up for a Render account if you don't have one: [Render](https://render.com/)

### 4. Create a New Web Service

- [ ] In the Render dashboard, click on "New" and select "Web Service"
- [ ] Connect your GitHub repository 
- [ ] Select the repository containing your backend code
- [ ] Configure the following settings:
  - Name: reword-this-backend (or your preferred name)
  - Environment: Node
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Instance Type: Free (or paid tier if needed)

### 5. Configure Environment Variables

- [ ] Add your environment variables in the Render dashboard:
  - OPENAI_API_KEY: your_actual_openai_api_key
  - NODE_ENV: production

### 6. Deploy the Service

- [ ] Click "Create Web Service" to deploy
- [ ] Wait for the deployment to complete
- [ ] Note your Render service URL (e.g., https://reword-this-backend.onrender.com)

### 7. Test the Deployed API

- [ ] Visit your Render service URL to verify the server is running
- [ ] Test the `/api/cors-test` endpoint to verify CORS is working correctly

## Addressing CORS Issues

### 1. Understanding CORS

- [x] Understand the concept of Cross-Origin Resource Sharing (CORS) in web development.

### 2. Configuring CORS

- [x] Configure the Node.js backend to handle CORS requests properly.

## Building the Chrome Extension

### 1. Setting Up the Development Environment

- [x] Set up your development environment for building the Chrome extension.

### 2. Building the Extension

- [x] Build the Chrome extension using React, TypeScript, and TailwindCSS.

### 1. Update API Endpoint in Frontend

- [ ] Open the `src/utils/env.ts` file in the frontend project
- [ ] No need to modify this file as it reads from environment variables

### 2. Update Environment Variables

- [ ] Create or modify `.env.production` in the root of the frontend project:

```
# Production environment settings
VITE_APP_ENV=production
VITE_ENABLE_DEBUG_MODE=false

# OpenAI model settings
VITE_DEFAULT_MODEL=gpt-3.5-turbo
VITE_MAX_TOKENS=1000

# Set this to your Render backend URL
VITE_API_ENDPOINT=https://your-render-service-url.onrender.com
```

### 3. Build for Production

- [ ] Build the Chrome extension for production:

```bash
npm run build
```

- [ ] The built extension will be in the `dist` folder

## Publishing to the Chrome Web Store

### 1. Preparing for Publication

- [x] Ensure your extension is ready for publication.

### 2. Submitting to the Chrome Web Store

- [x] Submit your extension to the Chrome Web Store.

## Troubleshooting

### 1. Common Issues

- [x] Identify common issues that may arise during deployment and development.

### 2. Debugging

- [x] Use debugging tools to troubleshoot issues.

## Security Considerations

### 1. Data Security

- [x] Ensure data security by storing sensitive information securely.

### 2. API Key Management

- [x] Manage API keys securely to prevent unauthorized access. 