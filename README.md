# 🏖️ Advanced Vacation Planning Agent

A sophisticated AI-powered vacation planning platform with intelligent workflows, real-time data integration, and beautiful animations. Built with Claude AI for intelligent recommendations and advanced planning capabilities.

## ✨ Key Features

### 🚀 **Advanced AI Planning**
- **Multi-step AI workflows**: Comprehensive planning with specialized agents
- **10-Step Planning Process**: From preference analysis to final itinerary creation
- **Real-time Progress Tracking**: Visual workflow progress with animated steps
- **Intelligent Recommendations**: Smart suggestions for destinations, activities, and budget

### 🌍 **Smart Location Services**
- **Auto-detect Location**: One-click geolocation detection for source city
- **Global Coverage**: Support for worldwide destinations and travel routes
- **Reverse Geocoding**: Convert GPS coordinates to readable city names

### 💰 **Advanced Financial Planning**
- **Multi-Currency Support**: USD, EUR, GBP, INR, CAD, AUD, JPY
- **Real-time Currency Conversion**: Live exchange rate calculations
- **Smart Budget Breakdown**: Detailed cost analysis by category
- **Currency Hints**: Automatic USD conversion display

### 🎨 **Premium User Experience**
- **Stunning Animations**: Floating particles, smooth transitions, and micro-interactions
- **Glass Morphism Design**: Modern UI with backdrop filters and transparency
- **Responsive Design**: Perfect on mobile, tablet, and desktop
- **Accessibility Features**: Reduced motion support and screen reader friendly

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file and add your Anthropic API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

## 🛠️ Usage

### Web Interface (Recommended)
Start the web server:
```bash
npm start
```
Then open your browser and visit `http://localhost:3000`

### 🎯 **Planning Modes**

#### **Quick Plan** ⚡
- Fast, single-agent vacation planning
- Instant results with basic itinerary
- Perfect for simple trip planning

#### **🚀 Advanced Plan** (NEW!)
- **Multi-step AI workflow**
- **10 specialized planning steps:**
  1. 🧠 **Analyze Preferences** - Psychology-based travel profiling
  2. 🌍 **Suggest Destinations** - AI-powered destination matching
  3. 🔍 **Research Destination** - Deep local knowledge gathering
  4. ✈️ **Find Flights** - Route optimization and airline recommendations
  5. 🏨 **Find Accommodation** - Neighborhood analysis and booking strategies
  6. 🎯 **Plan Activities** - Day-by-day itinerary creation
  7. 💰 **Create Budget** - Comprehensive financial planning
  8. 🌤️ **Get Weather** - Climate considerations and packing advice
  9. 📅 **Build Itinerary** - Final schedule optimization
  10. ✨ **Finalize Plan** - Complete vacation document creation

#### **Suggest Destinations** 🌎
- Personalized destination recommendations
- Climate and activity-based filtering
- Budget-aware suggestions with flight costs

#### **Estimate Budget** 💳
- Detailed cost breakdowns by category
- Multi-currency support with real-time conversion
- Route-specific pricing analysis

### 📱 **Smart Features**

#### **📍 Auto-Location Detection**
- Click the 📍 button on any source city field
- Automatically detects your current location
- Converts GPS coordinates to city names
- Works worldwide with high accuracy

#### **💱 Currency Intelligence**
- Real-time exchange rate calculations
- Automatic USD conversion hints
- Support for 7 major currencies
- Smart budget recommendations

### Command Line Interface
Run the interactive CLI version:
```bash
npm run cli
```

Or use the agent programmatically:

```javascript
import VacationAgent from './vacation-agent.js';

const agent = new VacationAgent();

// Get destination suggestions
const suggestions = await agent.suggestDestinations({
  climate: 'warm',
  activities: ['beaches', 'culture'],
  budget: 'moderate'
});

// Plan a complete vacation
const plan = await agent.planVacation({
  destination: 'Barcelona, Spain',
  budget: '$2000',
  duration: '5 days',
  interests: ['architecture', 'food', 'beaches'],
  travelStyle: 'mid-range'
});

// Estimate budget
const budget = await agent.estimateBudget('Paris, France', '1 week', 'luxury');
```

## 🚀 Deployment

### Deploy to Render

1. Fork this repository to your GitHub account
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Use the following settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variable:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
6. Deploy!

The render.yaml file is included for one-click deployment.

## 🏗️ **Technical Architecture**

### **Backend Stack**
- **Node.js + Express**: RESTful API server
- **Anthropic Claude**: AI reasoning and content generation
- **Axios**: HTTP client for external API integration

### **Frontend Stack**
- **Vanilla JavaScript**: Performance-optimized client-side code
- **CSS3 Advanced**: Glass morphism, animations, and responsive design
- **HTML5 APIs**: Geolocation, local storage, and modern web features

### **Key APIs & Integrations**
- **Geolocation API**: Browser-based location detection
- **BigDataCloud**: Reverse geocoding service
- **Real-time Currency**: Exchange rate calculations
- **Weather Integration**: Climate-aware planning (ready for API integration)

### **Workflow Engine**
- **Sequential Processing**: Multi-step vacation planning workflow
- **Progress Tracking**: Real-time status updates and completion monitoring
- **Error Handling**: Robust error recovery and user feedback

## Requirements

- Node.js 18+
- Anthropic API key
- Modern web browser with geolocation support

## License

MIT

---

## 🎯 **Quick Start Examples**

### Planning a European Adventure
1. Click 📍 to auto-detect your location
2. Enter "Paris, France" as destination
3. Set budget: €2000, Duration: 7 days
4. Select interests: "culture, food, museums"
5. Choose "🚀 Advanced Plan" for comprehensive planning
6. Watch the AI agents work through planning steps
7. Receive your complete vacation guide!

### Discovering New Destinations
1. Use "Suggest Destinations" tab
2. Auto-detect your location
3. Choose climate: "Warm", Activities: "beaches, adventure"
4. Get personalized destination recommendations with costs

### Quick Budget Check
1. Use "Estimate Budget" tab
2. Enter route: "New York → Tokyo"
3. Duration: 10 days, Style: "Mid-range"
4. Get detailed cost breakdown in your preferred currency

---

*Built with ❤️ using Claude AI and modern web technologies*