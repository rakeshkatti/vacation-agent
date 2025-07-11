import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

config();

class VacationAgent {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async planVacation(preferences) {
    const { sourceCity, destination, budget, duration, interests, travelStyle, currency } = preferences;
    
    const prompt = `You are a vacation planning assistant. Create a detailed vacation plan based on these preferences:
    
From: ${sourceCity || 'not specified'}
To: ${destination || 'flexible'}
Budget: ${budget || 'moderate'}
Duration: ${duration || 'not specified'}
Interests: ${interests?.join(', ') || 'general sightseeing'}
Travel Style: ${travelStyle || 'balanced'}
Currency: ${currency || 'USD'}

Please provide:
1. Flight recommendations and estimated costs from ${sourceCity} to ${destination}
2. Recommended itinerary
3. Budget breakdown in ${currency}
4. Accommodation suggestions
5. Activity recommendations
6. Local transportation options
7. Travel tips specific to traveling from ${sourceCity}

Format your response in a clear, organized manner with all costs in ${currency}.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        system: 'You are an expert travel planner who creates detailed, practical vacation plans.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].text;
    } catch (error) {
      throw new Error(`Failed to generate vacation plan: ${error.message}`);
    }
  }

  async suggestDestinations(criteria) {
    const { sourceCity, climate, activities, budget, region, currency } = criteria;
    
    const prompt = `Suggest vacation destinations based on these criteria:
    
Starting from: ${sourceCity || 'not specified'}
Climate preference: ${climate || 'any'}
Preferred activities: ${activities?.join(', ') || 'varied'}
Budget: ${budget || 'moderate'}
Region preference: ${region || 'worldwide'}
Currency: ${currency || 'USD'}

Provide 5 destination recommendations with:
- Brief explanations of why each fits the criteria
- Estimated flight costs from ${sourceCity} in ${currency}
- Best time to visit
- Key attractions that match the specified activities

Consider flight accessibility and costs from ${sourceCity} when making recommendations.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 800,
        system: 'You are a knowledgeable travel advisor who suggests perfect destinations for different preferences.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].text;
    } catch (error) {
      throw new Error(`Failed to suggest destinations: ${error.message}`);
    }
  }

  async estimateBudget(sourceCity, destination, duration, travelStyle, currency) {
    const prompt = `Provide a budget estimate for a vacation from ${sourceCity} to ${destination} for ${duration || '1 week'} with ${travelStyle || 'mid-range'} travel style.

Break down costs in ${currency} for:
- Round-trip flights from ${sourceCity} to ${destination}
- Accommodation (per night and total)
- Food & dining (per day and total)
- Activities & entertainment
- Local transportation
- Visa/travel documentation fees (if applicable)
- Travel insurance
- Miscellaneous expenses

Provide:
- Total estimate in ${currency}
- Daily average spending in ${currency}
- Cost comparison notes relevant to travelers from ${sourceCity}
- Money-saving tips for this specific route

All amounts should be in ${currency} with current market rates considered.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 600,
        system: 'You are a travel budget expert who provides realistic cost estimates for vacations.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].text;
    } catch (error) {
      throw new Error(`Failed to estimate budget: ${error.message}`);
    }
  }
}

export default VacationAgent;