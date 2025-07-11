import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import VacationAgent from './vacation-agent.js';
import VacationPlanningWorkflow from './vacation-workflow-simple.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const agent = new VacationAgent();
const workflow = new VacationPlanningWorkflow();

// Store active workflows (in production, use Redis or database)
const activeWorkflows = new Map();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/plan-vacation', async (req, res) => {
  try {
    const { sourceCity, destination, budgetAmount, currency, duration, interests, travelStyle } = req.body;
    
    if (!sourceCity || !destination || !budgetAmount || !currency || !duration) {
      return res.status(400).json({ 
        error: 'Missing required fields: sourceCity, destination, budgetAmount, currency, and duration are required' 
      });
    }

    const preferences = {
      sourceCity,
      destination,
      budget: `${budgetAmount} ${currency}`,
      duration: `${duration} days`,
      interests: interests || ['sightseeing'],
      travelStyle: travelStyle || 'mid-range',
      currency
    };

    const plan = await agent.planVacation(preferences);
    res.json({ plan });
  } catch (error) {
    console.error('Error planning vacation:', error);
    res.status(500).json({ error: 'Failed to generate vacation plan' });
  }
});

app.post('/api/suggest-destinations', async (req, res) => {
  try {
    const { sourceCity, climate, activities, budgetAmount, currency, region } = req.body;
    
    if (!sourceCity) {
      return res.status(400).json({ 
        error: 'Missing required field: sourceCity is required' 
      });
    }

    const criteria = {
      sourceCity,
      climate: climate || 'any',
      activities: activities || ['varied'],
      budget: budgetAmount && currency ? `${budgetAmount} ${currency}` : 'moderate',
      region: region || 'worldwide',
      currency: currency || 'USD'
    };

    const suggestions = await agent.suggestDestinations(criteria);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error suggesting destinations:', error);
    res.status(500).json({ error: 'Failed to suggest destinations' });
  }
});

app.post('/api/estimate-budget', async (req, res) => {
  try {
    const { sourceCity, destination, duration, travelStyle, currency } = req.body;
    
    if (!sourceCity || !destination || !duration || !currency) {
      return res.status(400).json({ 
        error: 'Missing required fields: sourceCity, destination, duration, and currency are required' 
      });
    }

    const estimate = await agent.estimateBudget(
      sourceCity,
      destination, 
      `${duration} days`, 
      travelStyle || 'mid-range',
      currency
    );
    
    res.json({ estimate });
  } catch (error) {
    console.error('Error estimating budget:', error);
    res.status(500).json({ error: 'Failed to estimate budget' });
  }
});

// Geolocation and city detection
app.post('/api/get-location-city', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    // Use a geocoding service (you can replace this with a paid service for production)
    // For demo purposes, we'll use a simple approximation
    const response = await axios.get(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    const city = response.data.city || response.data.locality || 'Unknown City';
    const country = response.data.countryName || 'Unknown Country';
    const cityName = `${city}, ${country}`;

    res.json({ 
      city: cityName,
      details: {
        city: city,
        country: country,
        region: response.data.principalSubdivision || '',
        latitude: latitude,
        longitude: longitude
      }
    });
  } catch (error) {
    console.error('Error getting location city:', error);
    res.status(500).json({ error: 'Failed to get city from coordinates' });
  }
});

// Advanced vacation planning with LangGraph workflow
app.post('/api/plan-vacation-advanced', async (req, res) => {
  try {
    const { sourceCity, destination, budgetAmount, currency, duration, interests, travelStyle } = req.body;
    
    if (!sourceCity || !destination || !budgetAmount || !currency || !duration) {
      return res.status(400).json({ 
        error: 'Missing required fields: sourceCity, destination, budgetAmount, currency, and duration are required' 
      });
    }

    const preferences = {
      sourceCity,
      destination,
      budget: `${budgetAmount} ${currency}`,
      duration: `${duration} days`,
      interests: interests || ['sightseeing'],
      travelStyle: travelStyle || 'mid-range',
      currency
    };

    // Generate unique workflow ID
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Start the workflow asynchronously
    const workflowPromise = workflow.executePlanning(preferences);
    activeWorkflows.set(workflowId, { 
      promise: workflowPromise, 
      startTime: new Date(),
      preferences: preferences
    });

    // Don't wait for completion, return workflow ID for tracking
    res.json({ 
      workflowId: workflowId,
      message: 'Advanced vacation planning started',
      estimatedTime: '2-3 minutes'
    });

    // Clean up completed workflows after 1 hour
    setTimeout(() => {
      if (activeWorkflows.has(workflowId)) {
        activeWorkflows.delete(workflowId);
      }
    }, 3600000);

  } catch (error) {
    console.error('Error starting advanced vacation planning:', error);
    res.status(500).json({ error: 'Failed to start vacation planning workflow' });
  }
});

// Check workflow status
app.get('/api/workflow-status/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    if (!activeWorkflows.has(workflowId)) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const workflowData = activeWorkflows.get(workflowId);
    const result = await Promise.race([
      workflowData.promise,
      new Promise(resolve => setTimeout(() => resolve(null), 100)) // Quick check
    ]);

    if (result) {
      // Workflow completed
      activeWorkflows.delete(workflowId);
      res.json({
        status: 'completed',
        result: result,
        duration: Date.now() - workflowData.startTime.getTime()
      });
    } else {
      // Still running
      res.json({
        status: 'running',
        runtime: Date.now() - workflowData.startTime.getTime(),
        message: 'Planning in progress...'
      });
    }
  } catch (error) {
    console.error('Error checking workflow status:', error);
    res.status(500).json({ error: 'Failed to check workflow status' });
  }
});

// Get real-time currency conversion
app.post('/api/convert-currency', async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;
    
    // For demo purposes, use a simple conversion
    // In production, integrate with a real-time currency API
    const conversionRates = {
      'USD': { 'EUR': 0.85, 'GBP': 0.73, 'INR': 83.12, 'CAD': 1.25, 'AUD': 1.45, 'JPY': 110.0 },
      'EUR': { 'USD': 1.18, 'GBP': 0.86, 'INR': 97.8, 'CAD': 1.47, 'AUD': 1.71, 'JPY': 129.5 },
      'GBP': { 'USD': 1.37, 'EUR': 1.16, 'INR': 113.8, 'CAD': 1.71, 'AUD': 1.98, 'JPY': 150.7 },
      'INR': { 'USD': 0.012, 'EUR': 0.010, 'GBP': 0.0088, 'CAD': 0.015, 'AUD': 0.017, 'JPY': 1.32 },
      'CAD': { 'USD': 0.80, 'EUR': 0.68, 'GBP': 0.58, 'INR': 66.5, 'AUD': 1.16, 'JPY': 88.0 },
      'AUD': { 'USD': 0.69, 'EUR': 0.58, 'GBP': 0.50, 'INR': 57.3, 'CAD': 0.86, 'JPY': 75.9 },
      'JPY': { 'USD': 0.0091, 'EUR': 0.0077, 'GBP': 0.0066, 'INR': 0.76, 'CAD': 0.011, 'AUD': 0.013 }
    };

    if (fromCurrency === toCurrency) {
      return res.json({ convertedAmount: amount, rate: 1.0 });
    }

    const rate = conversionRates[fromCurrency]?.[toCurrency] || 1.0;
    const convertedAmount = (amount * rate).toFixed(2);

    res.json({
      originalAmount: amount,
      fromCurrency: fromCurrency,
      toCurrency: toCurrency,
      convertedAmount: parseFloat(convertedAmount),
      exchangeRate: rate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

app.listen(PORT, () => {
  console.log(`🏖️  Vacation Agent server running on http://localhost:${PORT}`);
  console.log(`📱 Open your browser and visit the URL above to use the web interface`);
  console.log(`🚀 Enhanced with LangGraph workflows and location services`);
});