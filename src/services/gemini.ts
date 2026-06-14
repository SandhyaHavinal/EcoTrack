import type { ActivityEntry, UserProfile } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash'; // High-speed, lightweight model perfect for quick insights

interface AIReportInput {
  userProfile: UserProfile;
  activities: ActivityEntry[];
  currentMonthBreakdown: {
    transport: number;
    electricity: number;
    food: number;
    water: number;
    waste: number;
  };
}

/**
 * Generates carbon footprint reduction recommendations and future predictions using Gemini.
 * Falls back to an intelligent mock generator if no API key is provided.
 */
export async function generateAICoachInsights(input: AIReportInput): Promise<string> {
  const { userProfile, currentMonthBreakdown, activities } = input;
  const total = Object.values(currentMonthBreakdown).reduce((a, b) => a + b, 0);

  // Format activities context
  const activitySummary = activities.slice(0, 5).map(a => 
    `Date: ${a.date}, Transport: ${a.transport.mode} (${a.transport.distance}km, ${a.transport.emissions}kg CO2), Electricity: ${a.electricity.kwh}kWh, Diet: ${a.food.dietType}, Waste: ${a.waste.weight}kg (${a.waste.recycled}kg recycled)`
  ).join('\n');

  const prompt = `
    You are the EcoTrack AI Sustainability Coach, a world-class environmental scientist and motivational coach.
    Analyze the following carbon footprint data for user ${userProfile.name} and provide a highly detailed, personalized reduction plan.

    USER PROFILE & METRICS:
    - Name: ${userProfile.name}
    - Sustainability Score: ${userProfile.carbonScore}/100
    - Points Earned: ${userProfile.points}
    - Total Monthly Emissions: ${total.toFixed(2)} kg CO2

    EMISSION BREAKDOWN THIS MONTH:
    - Transportation: ${currentMonthBreakdown.transport.toFixed(2)} kg CO2
    - Electricity: ${currentMonthBreakdown.electricity.toFixed(2)} kg CO2
    - Food Habits: ${currentMonthBreakdown.food.toFixed(2)} kg CO2
    - Water Consumption: ${currentMonthBreakdown.water.toFixed(2)} kg CO2
    - Waste & Recycling: ${currentMonthBreakdown.waste.toFixed(2)} kg CO2

    RECENT LOGGED ACTIVITIES:
    ${activitySummary || 'No recent activity logged yet.'}

    YOUR TASKS:
    1. **Personalized Analysis**: Analyze which categories contribute most to their footprint and provide a friendly, motivational assessment.
    2. **Actionable Recommendations**: Suggest 3 specific, realistic eco-friendly alternatives. Calculate how much CO2 they will save. (e.g., "Using public transport twice a week could reduce your footprint by 18 kg CO2 per month").
    3. **Weekly Sustainability Plan**: Create a 7-day checklist of simple actions (e.g. Day 1: Walk to store, Day 2: Turn off standby items).
    4. **Emission Predictions**: Project their emissions for the next month based on their behavior, assuming:
       - Scenario A: They do not change habits.
       - Scenario B: They adopt your recommendations.
    5. **Gamification Boost**: Suggest one of our active challenges ("No Car Day", "Plastic-Free Week", "Energy Saving Week", "Zero Food Waste") that would benefit them the most right now.

    FORMATTING RULES:
    - Output in beautiful Markdown.
    - Use headers (##), bold text, bullet points, and clean lists.
    - Keep tone positive, constructive, and inspiring. Do not make the user feel guilty.
  `;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    console.log('Gemini API key missing. Simulating AI coach responses locally.');
    return simulateAICoachInsights(userProfile, currentMonthBreakdown, total);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return resultText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return `### ⚠️ AI Coach Connection Error\n\nWe couldn't connect to the Gemini AI API right now. Here is a quick summary of your data:\n\n* **Top Source**: ${getTopCategory(currentMonthBreakdown)}\n* **Total Emissions**: ${total.toFixed(2)} kg CO2\n\n*Please check your Internet connection or verify your VITE_GEMINI_API_KEY in the environment settings.*`;
  }
}

function getTopCategory(breakdown: Record<string, number>): string {
  const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  return sorted[0][0].toUpperCase();
}

/**
 * Intelligent rule-based AI Coach simulator
 */
function simulateAICoachInsights(
  profile: UserProfile,
  breakdown: Record<string, number>,
  total: number
): string {
  const topCat = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];
  const catName = topCat[0];
  const catVal = topCat[1];
  const percent = total > 0 ? Math.round((catVal / total) * 100) : 0;

  let analysis = '';
  let recommendations = '';
  let weeklyPlan = '';
  let challengeRecommendation = '';

  if (catName === 'transport') {
    analysis = `Your **Transportation** habits make up the largest share of your carbon footprint, accounting for **${percent}%** of your emissions this month. This is typical for active commuters, but presents a fantastic opportunity for positive change!`;
    recommendations = `1. **Carpool or Transit**: Commuting via public transport or carpooling just 2 days a week will save approximately **24.5 kg CO₂** monthly.
2. **Cycle for Short Trips**: For distances under 5km, swap your car for a bicycle. It is healthy, cost-free, and saves **1.9 kg CO₂** per 10km.
3. **Eco-Driving**: When driving, avoid sudden acceleration and maintain steady speeds. Good driving habits can reduce fuel consumption by **10-15%**, saving around **8.0 kg CO₂** per tank.`;
    weeklyPlan = `*   **Day 1 (Monday)**: Map out a public transit or bike route for your commute.
*   **Day 2 (Tuesday)**: Try a "No Car Day" — walk, cycle, or bus to work/school.
*   **Day 3 (Wednesday)**: Consolidate all grocery trips and errands into a single driving circuit.
*   **Day 4 (Thursday)**: Check your car's tire pressure (under-inflated tires increase fuel usage by 3%).
*   **Day 5 (Friday)**: Walk to lunch instead of driving to a nearby restaurant.
*   **Day 6 (Saturday)**: Explore local parks on foot rather than driving to a distant trail.
*   **Day 7 (Sunday)**: Reflect on your week. Celebrate the kilometers saved!`;
    challengeRecommendation = `Based on your logs, we recommend joining the **No Car Day** challenge! You can earn **100 points** and start lowering your transport emissions immediately.`;
  } else if (catName === 'electricity') {
    analysis = `Your **Electricity Usage** is your primary carbon driver, contributing **${percent}%** of your total footprint. Heating, cooling, and large household appliances are generally the major contributors.`;
    recommendations = `1. **Cold Wash Laundry**: Running your washing machine at 30°C instead of 40°C saves up to **60% of laundry electricity**, reducing your emissions by **5.2 kg CO₂** per month.
2. **Standby Off**: Unplugging standby chargers, game consoles, and computer screens saves "vampire draw" energy, preventing around **12.5 kg CO₂** of emissions annually.
3. **LED Replacement**: Swapping out 5 of your most frequently used incandescent bulbs for LEDs will cut lighting energy by 80% and save **4.5 kg CO₂** monthly.`;
    weeklyPlan = `*   **Day 1 (Monday)**: Set a timer to limit showers to 5 minutes (saving both water heating energy and water).
*   **Day 2 (Tuesday)**: Turn off all standby appliances at the wall outlet before going to bed.
*   **Day 3 (Wednesday)**: Adjust your heating down by 1°C or air conditioning up by 1°C.
*   **Day 4 (Thursday)**: Do laundry on a cold water cycle and air-dry the clothes.
*   **Day 5 (Friday)**: Turn off lights immediately when leaving any room.
*   **Day 6 (Saturday)**: Clean your refrigerator condenser coils (dust makes them work up to 25% harder).
*   **Day 7 (Sunday)**: Unplug all electronic chargers when devices are fully charged.`;
    challengeRecommendation = `You are primed for the **Energy Saving Week** challenge! Join now, complete the checklist, and claim **200 points**!`;
  } else if (catName === 'food') {
    analysis = `Your **Food Habits** contribute the most to your footprint, representing **${percent}%** of your emissions. Animal products (especially beef, pork, and dairy) have high carbon and methane intensity.`;
    recommendations = `1. **Embrace Plant-Based Meals**: Replacing beef or lamb meals with plant-based alternatives (lentils, beans, tofu) twice a week reduces food-related emissions by **32.0 kg CO₂** per month.
2. **Reduce Dairy Consumption**: Swap dairy milk for oat, soy, or almond milk. Dairy milk has double the carbon footprint of plant milks.
3. **Zero Waste Cooking**: Plan meals using ingredients you already have. Wasted food accounts for 8% of global greenhouse emissions.`;
    weeklyPlan = `*   **Day 1 (Monday)**: Try a fully plant-based "Meatless Monday" menu.
*   **Day 2 (Tuesday)**: Substitute dairy milk in your morning coffee with oat or almond milk.
*   **Day 3 (Wednesday)**: Inventory your fridge and cook a "leftovers" meal to prevent waste.
*   **Day 4 (Thursday)**: Buy vegetables from a local farmer's market to cut food transportation miles.
*   **Day 5 (Friday)**: Try a delicious vegetarian lunch, like a chickpea wrap or lentil soup.
*   **Day 6 (Saturday)**: Batch cook and freeze portions to avoid throwing away excess ingredients.
*   **Day 7 (Sunday)**: Compost all food scraps (vegetable peels, coffee grounds) instead of throwing them in the trash.`;
    challengeRecommendation = `We suggest the **Zero Food Waste Challenge**! It will help you plan your diet, reduce carbon, and reward you with **150 points**!`;
  } else {
    analysis = `Your carbon footprint is fairly balanced, with **${catName.toUpperCase()}** being the slightly higher category at **${percent}%**. You are doing a solid job maintaining a moderate footprint!`;
    recommendations = `1. **Compost Organic Scraps**: Composting vegetable peels and coffee grounds prevents anaerobic decay in landfills, reducing waste emissions by **15.0 kg CO₂** monthly.
2. **Be a Conscious Consumer**: Buy items with minimal packaging and reuse glass containers.
3. **Conserve Water**: Install aerators on faucets to reduce flow rates, saving up to **2.0 kg CO₂** on water heating and treatment monthly.`;
    weeklyPlan = `*   **Day 1 (Monday)**: Separate all recyclable plastics, papers, and metals from unsorted waste.
*   **Day 2 (Tuesday)**: Take reusable bags with you when grocery shopping.
*   **Day 3 (Wednesday)**: Turn off the tap while brushing your teeth (saves 6 liters of water/minute).
*   **Day 4 (Thursday)**: Repair any leaking faucets or toilets in your home.
*   **Day 5 (Friday)**: Reuse a glass jar or plastic container for storage instead of buying new organizers.
*   **Day 6 (Saturday)**: Learn which plastics are recyclable in your municipal district.
*   **Day 7 (Sunday)**: Clean up plastic waste in your local neighborhood.`;
    challengeRecommendation = `You should join the **Plastic-Free Week** challenge! It fits your profile perfectly and awards **250 points** upon completion.`;
  }

  // Emission Predictions
  const scenarioANextMonth = total * 1.05; // 5% increase due to business-as-usual variations
  const scenarioBNextMonth = total * 0.78; // 22% reduction if recommendations are followed

  return `## 🤖 AI Sustainability Coach: Personalized Insights

Hello **${profile.name}**, I've analyzed your activity history and carbon dashboard. Here is your personalized report:

### 📊 Carbon Analysis
${analysis}

---

### 💡 Carbon Reduction Recommendations

${recommendations}

---

### 📅 Your Weekly Sustainability Plan

${weeklyPlan}

---

### 🔮 Predictive Carbon Projections (Next Month)

Based on your current activity patterns, I've projected your emissions for next month:
*   **Scenario A (Business As Usual)**: **${scenarioANextMonth.toFixed(1)} kg CO₂**. Continuing your current routines will likely cause your emissions to plateau or rise slightly.
*   **Scenario B (Active Eco Action)**: **${scenarioBNextMonth.toFixed(1)} kg CO₂** (*Estimated 22% savings*). Adopting the recommendations above will significantly reduce your footprint and boost your sustainability score!

---

### 🛡️ Challenge Recommendation

${challengeRecommendation}
`;
}
