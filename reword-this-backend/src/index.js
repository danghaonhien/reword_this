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
    'chrome-extension://*',
    // For development
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:5174',
    'http://localhost:*'
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