import VacationAgent from './vacation-agent.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function getUserInputs() {
  console.log('🏖️  Welcome to the Vacation Planning Agent!\n');
  
  const sourceCity = await askQuestion('From which city are you traveling? (e.g., New York, USA): ');
  const destination = await askQuestion('Where would you like to go? (e.g., Barcelona, Spain): ');
  const budgetAmount = await askQuestion('What\'s your budget amount? (e.g., 2000): ');
  const currency = await askQuestion('What currency? (USD/EUR/GBP/INR/CAD/AUD/JPY, default: USD): ');
  const days = await askQuestion('How many days is your trip? (e.g., 5): ');
  
  console.log('\nOptional preferences:');
  const interests = await askQuestion('What are your interests? (comma-separated, e.g., food, culture, beaches): ');
  const travelStyle = await askQuestion('Travel style? (budget/mid-range/luxury, default: mid-range): ');
  
  return {
    sourceCity: sourceCity || 'not specified',
    destination: destination || 'flexible',
    budget: `${budgetAmount || '1000'} ${currency || 'USD'}`,
    duration: `${days || '7'} days`,
    interests: interests ? interests.split(',').map(i => i.trim()).filter(i => i) : ['sightseeing'],
    travelStyle: travelStyle || 'mid-range',
    currency: currency || 'USD'
  };
}

async function main() {
  const agent = new VacationAgent();

  try {
    const userPreferences = await getUserInputs();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 Generating your personalized vacation plan...\n');

    console.log('=== Budget Estimate ===');
    const budget = await agent.estimateBudget(userPreferences.sourceCity, userPreferences.destination, userPreferences.duration, userPreferences.travelStyle, userPreferences.currency);
    console.log(budget);
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('=== Complete Vacation Plan ===');
    const plan = await agent.planVacation(userPreferences);
    console.log(plan);

    rl.close();

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure to:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Add your Anthropic API key to .env');
    console.log('3. Run: npm install');
    rl.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}