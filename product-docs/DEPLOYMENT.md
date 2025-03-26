# Deployment Guide for Reword This! Chrome Extension

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

- [ ] Create a dedicated directory for your Node.js backend:

```bash
mkdir reword-this-backend
cd reword-this-backend
npm init -y
```

### 2. Install Required Dependencies

- [ ] Install the necessary packages:

```bash
npm install express cors dotenv helmet express-rate-limit openai
npm install --save-dev typescript @types/express @types/cors @types/node ts-node nodemon
```

### 3. Set Up TypeScript Configuration

- [ ] Create a `tsconfig.json` file:

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

### 4. Create Basic Directory Structure

- [ ] Create the source directory:

```bash
mkdir -p src
```

### 5. Create the Main Server File

- [ ] Create `src/index.ts`:

```typescript
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { OpenAI } from 'openai';

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
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Configure CORS (this is critical for the Chrome extension)
app.use(cors({
  origin: [
    'chrome-extension://ipnfehmlihflaagcolkjlopplfkaglem', // Your published extension ID
    'chrome-extension://*/index.html' // For testing unpacked extensions
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Reword This! API is running');
});

// OpenAI API endpoint for text rewriting
app.post('/api/rewrite', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'Error calling OpenAI API', 
      details: error.message 
    });
  }
});

// Battle endpoint for generating two versions
app.post('/api/battle', async (req: Request, res: Response) => {
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
  } catch (error: any) {
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

- [ ] Create a `.env` file in the root of your backend project:

```
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

### 7. Update `package.json` with Scripts

- [ ] Add these scripts to your `package.json`:

```json
"scripts": {
  "start": "node dist/index.js",
  "dev": "nodemon --exec ts-node src/index.ts",
  "build": "tsc",
  "postinstall": "npm run build"
}
```

### 8. Create a `.gitignore` File

- [ ] Create a `.gitignore` file:

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

- [ ] Start the development server:

```bash
npm run dev
```

- [ ] Visit `http://localhost:3000` to verify the server is running.

## Deploying to Render

### 1. Prepare Your Repository

- [ ] Push your backend code to a Git repository (GitHub, GitLab, etc.):

```bash
git init
git add .
git commit -m "Initial backend commit"
git remote add origin your-repository-url
git push -u origin main
```

### 2. Sign Up for Render

- [ ] Go to [render.com](https://render.com/) and sign up or log in
- [ ] Connect your Git repository to Render

### 3. Create a New Web Service

- [ ] Click "New" and select "Web Service"
- [ ] Select your repository with the backend code
- [ ] Configure the service with the following settings:
   - **Name**: reword-this-api (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or select a paid plan for better performance)

### 4. Configure Environment Variables

- [ ] Scroll down to the "Environment" section
- [ ] Add the following environment variables:
   - `PORT`: 3000
   - `OPENAI_API_KEY`: your_actual_openai_api_key
   - `NODE_ENV`: production

### 5. Deploy the Service

- [ ] Click "Create Web Service"
- [ ] Wait for the deployment to complete
- [ ] Note the URL provided by Render (e.g., `https://reword-this-api.onrender.com`)

## Addressing CORS Issues

### 1. Update the CORS Configuration in Your Backend

- [ ] Modify the CORS configuration in your `src/index.ts` file to include:

```typescript
// Configure CORS (this is critical for the Chrome extension)
app.use(cors({
  origin: [
    'chrome-extension://ipnfehmlihflaagcolkjlopplfkaglem', // Your published extension ID (replace with your actual ID)
    'chrome-extension://*/index.html', // For testing unpacked extensions
    // Add any other origins that might need access
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Preflight results can be cached for 1 day (in seconds)
}));

// Handle OPTIONS requests explicitly
app.options('*', cors()); // Enable pre-flight for all routes
```

### 2. Add a CORS Preflight Middleware

- [ ] Add a CORS preflight middleware before your routes:

```typescript
// Add this before your routes
app.use((req, res, next) => {
  // Set CORS headers manually for additional security
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
```

### 3. Update the Frontend API Service

- [ ] Modify the `apiService.ts` file in your extension to point to your Render API:

```typescript
import { API_ENDPOINT, DEFAULT_MODEL, MAX_TOKENS, isDev } from '@/utils/env';

/**
 * Service for making secure API calls to your Render backend
 */
export const callOpenAI = async (prompt: string): Promise<string> => {
  try {
    // Log the request in development for debugging
    if (isDev()) {
      console.log('Making API request with prompt (first 50 chars):', prompt.substring(0, 50) + '...');
    }

    const response = await fetch(`${API_ENDPOINT}/api/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model: DEFAULT_MODEL,
        maxTokens: MAX_TOKENS
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.result || '';
  } catch (error) {
    console.error('API error:', error);
    throw new Error(error instanceof Error ? error.message : 'Error calling API');
  }
};

/**
 * Service for battle rewrites feature
 */
export const callOpenAIForBattle = async (prompt: string): Promise<{versionA: string, versionB: string}> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/battle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model: DEFAULT_MODEL,
        maxTokens: MAX_TOKENS
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      versionA: data.versionA || 'Failed to generate Version A. Please try again.',
      versionB: data.versionB || 'Failed to generate Version B. Please try again.'
    };
  } catch (error) {
    console.error('Battle rewrites API error:', error);
    throw new Error(error instanceof Error ? error.message : 'Error generating battle rewrites');
  }
};
```

### 4. Update the Environment Configuration in Your Extension

- [ ] In your `src/utils/env.ts` file, update the API endpoint value:

```typescript
// App configuration
export const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT as string || 'https://reword-this-api.onrender.com';
```

### 5. Update Your Extension's Permissions

- [ ] Add host permissions to your extension's manifest:

```json
"permissions": [
  "contextMenus",
  "storage",
  "activeTab"
],
"host_permissions": [
  "https://reword-this-api.onrender.com/*"
]
```

## Building the Chrome Extension

### 1. Update Your Extension's Environment Variables

- [ ] Create a `.env` file in the extension root directory:

```
VITE_API_ENDPOINT=https://reword-this-api.onrender.com
VITE_DEFAULT_MODEL=gpt-3.5-turbo
VITE_MAX_TOKENS=1000
VITE_APP_ENV=production
```

### 2. Update the Extension's Manifest

- [ ] Ensure your `src/manifest.json` has the correct permissions:

```json
{
  "manifest_version": 3,
  "name": "Reword This",
  "version": "1.0.0",
  "description": "AI-Powered Text Rewriting Chrome Extension",
  "action": {
    "default_popup": "index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "permissions": [
    "contextMenus",
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://reword-this-api.onrender.com/*"
  ],
  "background": {
    "service_worker": "src/background.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content.ts"]
    }
  ]
}
```

### 3. Build the Extension

- [ ] Run the build command:

```bash
npm run build
```

- [ ] Verify the `dist` directory contains your production-ready Chrome extension.

## Publishing to the Chrome Web Store

### 1. Prepare the Extension Package

- [ ] Create promotional materials:
   - [ ] A 128x128 icon
   - [ ] Screenshots of the extension in action (1280x800 or 640x400)
   - [ ] A promotional image (1400x560)

- [ ] Create a ZIP file of the `dist` directory:
   ```bash
   cd dist
   zip -r ../reword-this-extension.zip *
   ```

### 2. Create a Developer Account

- [ ] Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [ ] Sign in with your Google account
- [ ] Pay the one-time developer registration fee ($5.00 USD)

### 3. Submit Your Extension

- [ ] In the Developer Dashboard, click "New Item"
- [ ] Upload the ZIP file you created
- [ ] Fill in the required information:
   - [ ] Store listing details (name, description, screenshots, etc.)
   - [ ] Privacy practices
   - [ ] Distribution regions

- [ ] For the Privacy practices section, ensure you:
   - [ ] Explain data collection (anonymous usage metrics)
   - [ ] Specify that text processing is done via your backend API
   - [ ] Mention encryption protocols for data transmission
   - [ ] Clarify that no long-term storage of user content is kept

- [ ] Submit the extension for review

### 4. Update the Extension ID in Your Backend

- [ ] Once your extension is approved, obtain the extension ID from the Chrome Web Store
- [ ] Update your backend's CORS configuration:

```typescript
app.use(cors({
  origin: [
    'chrome-extension://actual-extension-id-from-store', // Replace with your published ID
    'chrome-extension://*/index.html'
  ],
  // ... other CORS settings
}));
```

### 5. Deploy the Updated Backend

- [ ] Commit and push the changes to trigger a new deployment on Render.

## Troubleshooting

### CORS Issues

If you're still experiencing CORS issues after following the steps above:

- [ ] **Debug the CORS Headers**:
   - [ ] Use Chrome DevTools Network tab to inspect the preflight (OPTIONS) requests
   - [ ] Check the response headers to ensure proper CORS headers are present

- [ ] **Test with a Simple Endpoint**:
   - [ ] Add a simple endpoint to your backend:
     ```typescript
     app.get('/api/cors-test', (req, res) => {
       res.json({ message: 'CORS is working!' });
     });
     ```
   - [ ] Test this endpoint from your extension to isolate the issue

- [ ] **Common Solutions**:
   - [ ] Ensure your backend is correctly setting CORS headers on all routes
   - [ ] Verify the extension ID in your CORS configuration
   - [ ] Check that your extension has the correct host_permissions

### Extension Not Working After Publishing

- [ ] **Check the Console for Errors**:
   - [ ] Open DevTools in your extension popup to see error messages

- [ ] **Verify API Connections**:
   - [ ] Ensure the `API_ENDPOINT` environment variable is correct
   - [ ] Check that your Render service is running

- [ ] **Content Security Policy Issues**:
   - [ ] If you're seeing CSP violations, adjust your manifest.json

## Security Considerations

### API Key Protection

- [ ] **Never Include API Keys in the Frontend**:
   - [ ] Keep the OpenAI API key on your backend only
   - [ ] Use environment variables on Render

- [ ] **Implement Rate Limiting**:
   - [ ] Prevent abuse with `express-rate-limit`
   - [ ] Consider adding user authentication for premium features

### Data Privacy

- [ ] **Minimize Data Collection**:
   - [ ] Only send necessary text to the backend
   - [ ] Don't store user content unnecessarily

- [ ] **Secure Transmission**:
   - [ ] Ensure HTTPS is enforced for all API calls
   - [ ] Use Helmet.js for additional HTTP security headers

- [ ] **Compliance Documentation**:
   - [ ] Maintain clear privacy policies
   - [ ] Document data handling practices for Chrome Web Store review

### Backend Security

- [ ] **Keep Dependencies Updated**:
   - [ ] Regularly update Node.js and npm packages
   - [ ] Set up security scanning with tools like Dependabot

- [ ] **Input Validation**:
   - [ ] Validate all API inputs before processing
   - [ ] Implement proper error handling

- [ ] **Monitoring**:
   - [ ] Set up logging and monitoring for your Render service
   - [ ] Create alerts for unusual activity

## Additional Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Render Documentation](https://render.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [CORS in Express](https://expressjs.com/en/resources/middleware/cors.html)
- [Chrome Web Store Publishing Guidelines](https://developer.chrome.com/docs/webstore/publish/)

---

This deployment guide should help you successfully set up, configure, and deploy your "Reword This!" Chrome extension with a Node.js backend on Render while addressing CORS issues and following security best practices. 