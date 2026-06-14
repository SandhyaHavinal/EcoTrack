import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/generative-ai';

admin.initializeApp();

// Initialize the Gemini API client. It reads the API key from environment configuration
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: any = null;
if (apiKey) {
  genAI = new GoogleGenAI({ apiKey });
}

/**
 * Cloud Function to securely generate AI recommendations for users' footprints.
 * Avoids storing Gemini API keys on the client-side.
 */
export const getEcoCoachRecommendations = functions.https.onCall(async (data: any, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to call this function.');
  }

  const { name, carbonScore, totalEmissions, breakdown, recentActivities } = data;

  if (!apiKey || !genAI) {
    throw new functions.https.HttpsError('failed-precondition', 'Gemini API key is not configured on the server.');
  }

  const prompt = `
    You are the EcoTrack AI Sustainability Coach. Analyze this footprint data:
    - User Name: ${name}
    - Sustainability Score: ${carbonScore}/100
    - Monthly Footprint: ${totalEmissions} kg CO2
    
    Category Breakdown:
    - Transport: ${breakdown.transport} kg CO2
    - Electricity: ${breakdown.electricity} kg CO2
    - Food: ${breakdown.food} kg CO2
    - Water: ${breakdown.water} kg CO2
    - Waste: ${breakdown.waste} kg CO2

    Recent Activities:
    ${recentActivities}

    Task: Provide a detailed carbon-reduction plan in Markdown, including:
    1. Motivational assessment.
    2. 3 recommendations with estimated CO2 savings.
    3. Weekly 7-day sustainability checklist.
    4. Prediction scenarios (Plateau vs Action).
    Keep it positive and inspiring.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return { success: true, insights: text };
  } catch (error: any) {
    console.error('Gemini error:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to call Gemini API.');
  }
});
