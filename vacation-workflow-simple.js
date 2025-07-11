import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

config();

class VacationPlanningWorkflow {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async executePlanning(userPreferences) {
    const state = {
      userPreferences,
      messages: [],
      errors: [],
      currentStep: 'start'
    };

    const steps = [
      { name: 'analyze_preferences', method: this.analyzePreferences },
      { name: 'suggest_destinations', method: this.suggestDestinations },
      { name: 'research_destination', method: this.researchDestination },
      { name: 'find_flights', method: this.findFlights },
      { name: 'find_accommodation', method: this.findAccommodation },
      { name: 'plan_activities', method: this.planActivities },
      { name: 'create_budget', method: this.createBudget },
      { name: 'get_weather', method: this.getWeatherInfo },
      { name: 'build_itinerary', method: this.buildItinerary },
      { name: 'finalize_plan', method: this.finalizePlan }
    ];

    try {
      for (const step of steps) {
        state.currentStep = step.name;
        await step.method.call(this, state);
        
        // Add a small delay to make the workflow feel more natural
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        success: true,
        state: state,
        finalPlan: state.messages[state.messages.length - 1]?.content,
        allSteps: state.messages,
        errors: state.errors
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        state: state
      };
    }
  }

  async analyzePreferences(state) {
    const prompt = `Analyze these vacation preferences and extract key insights:
    
From: ${state.userPreferences.sourceCity}
To: ${state.userPreferences.destination}
Budget: ${state.userPreferences.budget}
Duration: ${state.userPreferences.duration}
Interests: ${state.userPreferences.interests?.join(', ')}
Travel Style: ${state.userPreferences.travelStyle}
Currency: ${state.userPreferences.currency}

Provide insights about:
1. Travel motivation and type (relaxation, adventure, culture, etc.)
2. Budget category and expectations
3. Activity preferences and priorities
4. Accommodation preferences
5. Dining preferences

Keep your analysis concise and actionable.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 800,
        system: 'You are a travel psychology expert who analyzes vacation preferences to provide personalized recommendations.',
        messages: [{ role: 'user', content: prompt }]
      });

      state.messages.push({
        step: 'analyze_preferences',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      state.errors.push(`Preference analysis failed: ${error.message}`);
    }
  }

  async suggestDestinations(state) {
    const prompt = `Based on the user preferences, suggest destination analysis for ${state.userPreferences.destination}:

From: ${state.userPreferences.sourceCity}
To: ${state.userPreferences.destination}
Budget: ${state.userPreferences.budget}
Duration: ${state.userPreferences.duration}
Interests: ${state.userPreferences.interests?.join(', ')}
Travel Style: ${state.userPreferences.travelStyle}

Provide:
1. Why this destination matches their profile
2. Best time to visit
3. Estimated flight cost from ${state.userPreferences.sourceCity}
4. Unique experiences available
5. Alternative similar destinations to consider`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1200,
        system: 'You are a destination expert with deep knowledge of global travel destinations.',
        messages: [{ role: 'user', content: prompt }]
      });

      state.messages.push({
        step: 'suggest_destinations',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      state.errors.push(`Destination analysis failed: ${error.message}`);
    }
  }

  async researchDestination(state) {
    const destination = state.userPreferences.destination;
    const prompt = `Research detailed information about ${destination} for vacation planning:

Provide comprehensive information about:
1. Top 10 attractions and activities
2. Cultural highlights and local customs
3. Food scene and must-try dishes
4. Transportation options within the city/region
5. Safety considerations and travel tips
6. Local currency and payment methods
7. Language and communication tips
8. Shopping recommendations
9. Day trip options from the main destination
10. Seasonal considerations and weather patterns

Focus on practical, actionable information for travelers.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        system: 'You are a local travel guide expert with deep knowledge of destinations worldwide.',
        messages: [{ role: 'user', content: prompt }]
      });

      state.messages.push({
        step: 'research_destination',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      state.errors.push(`Destination research failed: ${error.message}`);
    }
  }

  async findFlights(state) {
    const prompt = `Provide flight recommendations from ${state.userPreferences.sourceCity} to ${state.userPreferences.destination}:

Consider:
- Duration: ${state.userPreferences.duration}
- Budget: ${state.userPreferences.budget}
- Travel Style: ${state.userPreferences.travelStyle}

Provide information about:
1. Best airlines for this route
2. Typical flight duration and layovers
3. Estimated costs in ${state.userPreferences.currency}
4. Best booking times and strategies
5. Airport information for both departure and arrival
6. Flight time recommendations (morning, afternoon, evening)
7. Luggage considerations
8. Seat selection tips for this route length

Include both budget and premium options.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: 'You are a flight booking expert with knowledge of airlines, routes, and travel optimization.',
        messages: [{ role: 'user', content: prompt }]
      });

      state.messages.push({
        step: 'find_flights',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      state.errors.push(`Flight search failed: ${error.message}`);
    }
  }

  async findAccommodation(state) {
    const prompt = `Recommend accommodations in ${state.userPreferences.destination} based on:

Budget: ${state.userPreferences.budget}
Duration: ${state.userPreferences.duration}
Travel Style: ${state.userPreferences.travelStyle}
Interests: ${state.userPreferences.interests?.join(', ')}

Provide:
1. 3-5 accommodation recommendations across different price ranges
2. Best neighborhoods to stay in and why
3. Accommodation types that match their travel style
4. Booking strategies and timing
5. What to look for in reviews
6. Amenities that matter for their trip type
7. Transportation accessibility from recommended areas
8. Safety considerations for accommodation selection

Include specific hotel/area names when possible.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1200,
        system: 'You are a hospitality expert with extensive knowledge of accommodations worldwide.',
        messages: [{ role: 'user', content: prompt }]
      });

      state.messages.push({
        step: 'find_accommodation',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      state.errors.push(`Accommodation search failed: ${error.message}`);
    }
  }

  async planActivities(state) {
    const prompt = `Create a detailed activity plan for ${state.userPreferences.destination}:

Trip Details:
- Duration: ${state.userPreferences.duration}
- Interests: ${state.userPreferences.interests?.join(', ')}
- Travel Style: ${state.userPreferences.travelStyle}
- Budget: ${state.userPreferences.budget}

Plan should include:
1. Day-by-day activity suggestions
2. Mix of must-see attractions and hidden gems
3. Activity timing and duration estimates
4. Booking requirements and advance reservations needed
5. Transportation between activities
6. Alternative options for different weather conditions
7. Local experiences and cultural immersion opportunities
8. Rest and leisure time
9. Photography and Instagram-worthy spots
10. Activities that match their specific interests

Balance structure with flexibility.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        system: 'You are an activity planning specialist who creates engaging, well-paced itineraries.',
        messages: [{ role: 'user', content: prompt }]
      });

      state.messages.push({
        step: 'plan_activities',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      state.errors.push(`Activity planning failed: ${error.message}`);
    }
  }

  async createBudget(state) {
    const prompt = `Create a comprehensive budget breakdown for the ${state.userPreferences.destination} trip:

Based on:
- Total Budget: ${state.userPreferences.budget}
- Duration: ${state.userPreferences.duration}
- Travel Style: ${state.userPreferences.travelStyle}

Provide detailed breakdown in ${state.userPreferences.currency}:
1. Flights (round-trip from ${state.userPreferences.sourceCity})
2. Accommodation (per night and total)
3. Food and dining (breakfast, lunch, dinner, snacks)
4. Activities and attractions (entry fees, tours, experiences)
5. Local transportation (taxis, public transport, car rental)
6. Shopping and souvenirs
7. Travel insurance
8. Visa/documentation fees if applicable
9. Emergency fund (5-10% of total)
10. Miscellaneous expenses

Include daily spending targets and money-saving tips.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1200,
        system: 'You are a travel budget expert who creates realistic, detailed financial planning for trips.',
        messages: [{ role: 'user', content: prompt }]
      });

      state.messages.push({
        step: 'create_budget',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      state.errors.push(`Budget creation failed: ${error.message}`);
    }
  }

  async getWeatherInfo(state) {
    const prompt = `Provide weather information and guidance for ${state.userPreferences.destination}:

Consider:
- Duration: ${state.userPreferences.duration}
- General travel timeframe

Include:
1. Expected weather conditions
2. Temperature ranges
3. Rainfall/precipitation expectations
4. Best and worst times for outdoor activities
5. Clothing and packing recommendations
6. Weather-related activity modifications
7. Seasonal highlights or concerns
8. UV/sun protection needs
9. What to pack for weather contingencies

Be specific about how weather affects the planned activities.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 800,
        system: 'You are a weather and climate expert for travel planning.',
        messages: [{ role: 'user', content: prompt }]
      });

      state.messages.push({
        step: 'get_weather',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      state.errors.push(`Weather information failed: ${error.message}`);
    }
  }

  async buildItinerary(state) {
    const prompt = `Create a complete, detailed itinerary for ${state.userPreferences.destination}:

Synthesize all previous planning into a cohesive, day-by-day itinerary:

Trip Overview:
- Duration: ${state.userPreferences.duration}
- Budget: ${state.userPreferences.budget}
- Travel Style: ${state.userPreferences.travelStyle}

For each day, provide:
1. Morning activities (with timing)
2. Lunch recommendations and locations
3. Afternoon activities
4. Evening entertainment/dining
5. Transportation methods
6. Estimated costs per day
7. Backup plans for weather issues
8. Rest periods and free time
9. Photo opportunities
10. Local tips and insider knowledge

Include:
- Pre-trip preparation checklist
- Day-by-day detailed schedule
- Emergency contacts and important information
- Post-trip follow-up suggestions

Make it practical, realistic, and engaging.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        system: 'You are a master itinerary planner who creates comprehensive, practical travel schedules.',
        messages: [{ role: 'user', content: prompt }]
      });

      state.messages.push({
        step: 'build_itinerary',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      state.errors.push(`Itinerary building failed: ${error.message}`);
    }
  }

  async finalizePlan(state) {
    const prompt = `Create a final vacation plan summary for ${state.userPreferences.destination}:

Consolidate all planning elements into a polished, comprehensive vacation plan:

1. Executive Summary
2. Quick Reference Information
3. Complete Itinerary Overview
4. Budget Summary
5. Booking Action Items with priorities
6. Packing Checklist
7. Important Documents and Preparations
8. Emergency Information
9. Cultural Tips and Etiquette
10. Post-trip Recommendations

Make this the ultimate vacation planning document that the traveler can use as their go-to reference.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2500,
        system: 'You are a master vacation planner creating the definitive travel document.',
        messages: [{ role: 'user', content: prompt }]
      });

      state.messages.push({
        step: 'finalize_plan',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      state.errors.push(`Plan finalization failed: ${error.message}`);
    }
  }

  async getWorkflowStatus(state) {
    const steps = [
      'analyze_preferences',
      'suggest_destinations', 
      'research_destination',
      'find_flights',
      'find_accommodation',
      'plan_activities',
      'create_budget',
      'get_weather',
      'build_itinerary',
      'finalize_plan'
    ];
    
    const currentIndex = steps.indexOf(state.currentStep);
    const progress = currentIndex >= 0 ? (currentIndex / steps.length) * 100 : 0;
    
    return {
      currentStep: state.currentStep,
      progress: Math.round(progress),
      completedSteps: state.messages.map(m => m.step),
      totalSteps: steps.length,
      errors: state.errors
    };
  }
}

export default VacationPlanningWorkflow;