export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  profilePhoto?: string;
  carbonScore: number; // 0 - 100
  totalEmissions: number; // kg CO2 per month
  points: number;
  role: 'user' | 'admin';
  badges: Badge[];
  goals: Goal[];
  createdAt: any; // Firestore Timestamp
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  earnedAt: string; // ISO String or Date
  icon: string;
}

export interface Goal {
  id: string;
  category: 'all' | 'transport' | 'electricity' | 'water' | 'food' | 'waste';
  target: number; // target reduction in kg CO2 or percentage
  current: number; // current reduction achieved
  status: 'active' | 'completed' | 'failed';
  deadline: string; // YYYY-MM-DD
}

export interface ActivityEntry {
  activityId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  transport: {
    mode: 'car_petrol' | 'car_diesel' | 'ev' | 'motorbike' | 'bus' | 'train' | 'flight' | 'walk_bike';
    distance: number; // km
    emissions: number; // kg CO2
    routeDetails?: {
      origin: string;
      destination: string;
    };
  };
  electricity: {
    kwh: number;
    emissions: number; // kg CO2
  };
  water: {
    liters: number;
    emissions: number; // kg CO2
  };
  food: {
    dietType: 'vegan' | 'vegetarian' | 'mixed' | 'heavy_meat';
    emissions: number; // kg CO2 (calculated daily * 7 or individual meal)
  };
  waste: {
    weight: number; // kg
    recycled: number; // kg
    composted: number; // kg
    emissions: number; // kg CO2
  };
  totalEmissions: number; // Sum of all emissions above
}

export interface Challenge {
  challengeId: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'food' | 'waste';
  rewardPoints: number;
  durationDays: number;
  icon: string;
  status: 'active' | 'archived';
}

export interface UserChallenge {
  challengeId: string;
  status: 'joined' | 'completed' | 'failed';
  joinedAt: string; // ISO String
  completedAt?: string; // ISO String
}

export interface EducationalArticle {
  articleId: string;
  title: string;
  content: string; // markdown content
  summary: string;
  category: 'guide' | 'news' | 'tips';
  coverImage: string;
  author: string;
  createdAt: string; // ISO String
}

export interface MonthlyReport {
  reportId: string;
  userId: string;
  month: string; // YYYY-MM
  emissionsBreakdown: {
    transport: number;
    electricity: number;
    food: number;
    water: number;
    waste: number;
  };
  totalEmissions: number;
  averageEmissions: number; // Benchmark (e.g. 400 kg for local avg)
  sustainabilityScore: number;
  aiInsights: string; // Cached Gemini recommendations
  createdAt: string; // ISO string
}
