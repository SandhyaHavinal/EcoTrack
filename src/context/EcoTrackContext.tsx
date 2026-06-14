import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, addDoc, getDocs, setDoc, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { useAuth } from './AuthContext';
import type { ActivityEntry, Challenge, UserChallenge, EducationalArticle, MonthlyReport, Goal } from '../types';
import { calculateTransportEmissions, calculateElectricityEmissions, calculateWaterEmissions, calculateFoodEmissions, calculateWasteEmissions, calculateSustainabilityScore } from '../services/emissions';

interface EcoTrackContextType {
  activities: ActivityEntry[];
  challenges: Challenge[];
  userChallenges: UserChallenge[];
  reports: MonthlyReport[];
  articles: EducationalArticle[];
  loadingData: boolean;
  addActivity: (activity: Omit<ActivityEntry, 'activityId' | 'userId' | 'totalEmissions'>) => Promise<ActivityEntry>;
  joinChallenge: (challengeId: string) => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  addUserGoal: (goal: Omit<Goal, 'id' | 'current' | 'status'>) => Promise<void>;
  updateGoalStatus: (goalId: string, status: 'completed' | 'failed') => Promise<void>;
  fetchReports: () => Promise<void>;
  addMonthlyReport: (month: string, aiInsights: string) => Promise<MonthlyReport>;
  // Admin functions
  addGlobalChallenge: (challenge: Omit<Challenge, 'challengeId'>) => Promise<void>;
  addGlobalArticle: (article: Omit<EducationalArticle, 'articleId' | 'createdAt'>) => Promise<void>;
}

const EcoTrackContext = createContext<EcoTrackContextType | undefined>(undefined);

export function useEcoTrack() {
  const context = useContext(EcoTrackContext);
  if (!context) throw new Error('useEcoTrack must be used within an EcoTrackProvider');
  return context;
}

// Global Preset Challenges
const PRESET_CHALLENGES: Challenge[] = [
  {
    challengeId: 'c1',
    title: 'No Car Day',
    description: 'Leave your car at home for 24 hours. Walk, cycle, or use public transportation instead.',
    category: 'transport',
    rewardPoints: 100,
    durationDays: 1,
    icon: '🚲',
    status: 'active'
  },
  {
    challengeId: 'c2',
    title: 'Plastic-Free Week',
    description: 'Avoid single-use plastics entirely for 7 days. Use reusable bottles, bags, and food containers.',
    category: 'waste',
    rewardPoints: 250,
    durationDays: 7,
    icon: '🥤',
    status: 'active'
  },
  {
    challengeId: 'c3',
    title: 'Energy Saving Week',
    description: 'Turn off standby appliances, use energy-efficient LED light bulbs, and wash laundry at cold temperatures.',
    category: 'energy',
    rewardPoints: 200,
    durationDays: 7,
    icon: '⚡',
    status: 'active'
  },
  {
    challengeId: 'c4',
    title: 'Tree Plantation Drive',
    description: 'Plant a tree in your garden or participate in a local forestation project. Trees naturally sequester carbon!',
    category: 'food', // general/eco category
    rewardPoints: 300,
    durationDays: 1,
    icon: '🌳',
    status: 'active'
  },
  {
    challengeId: 'c5',
    title: 'Zero Food Waste Challenge',
    description: 'Plan your meals, shop with a list, store leftovers properly, and compost organic scraps. Throw away zero food for 5 days.',
    category: 'food',
    rewardPoints: 150,
    durationDays: 5,
    icon: '🍎',
    status: 'active'
  }
];

// Global Preset Articles
const PRESET_ARTICLES: EducationalArticle[] = [
  {
    articleId: 'a1',
    title: '10 Simple Ways to Reduce Your Home Carbon Footprint',
    summary: 'Small adjustments in your daily domestic routines can lead to large environmental benefits. Learn how.',
    content: `### Reducing Home Carbon Emissions

Our homes account for a major portion of global energy consumption. By adopting energy-efficient practices, you can save money on utility bills while saving the planet.

1. **Switch to LED Lighting**: LEDs use at least 75% less energy and last 25 times longer than incandescent lighting.
2. **Install a Smart Thermostat**: Keep your heating and cooling optimized automatically.
3. **Upgrade to Energy Star Appliances**: When replacing household electronics, look for high-efficiency labels.
4. **Wash Laundry in Cold Water**: About 75% to 90% of all the energy your washing machine uses goes towards heating the water.
5. **Air Dry Your Clothes**: When weather permits, dry laundry on lines or racks.
6. **Seal Air Leaks**: Apply caulk or weatherstripping to doors and windows.
7. **Optimize Standby Power**: Plug electronics into smart power strips that shut down power when not in use.
8. **Insulate Your Boiler/Water Heater**: Retain thermal energy longer to reduce reheat cycles.
9. **Reduce Shower Time**: Heating water is energy-intensive. Shorter showers save electricity/gas and water.
10. **Install Solar Panels**: Transition to renewable energy if your property permits.`,
    category: 'guide',
    coverImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=600',
    author: 'Elena Rostova',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    articleId: 'a2',
    title: 'The Impact of Dietary Choices on Climate Change',
    summary: 'How does food production affect global warming? Compare vegan, vegetarian, and meat-rich diets.',
    content: `### Food & Footprints: The Climate Cost of What We Eat

Did you know food production is responsible for one-quarter of global greenhouse gas emissions? Livestock rearing, deforestation, and agricultural practices release CO2, methane, and nitrous oxide.

#### Emission Comparisons by Diet Type
* **Heavy Meat Diet**: ~7.2 kg CO₂ equivalent per day.
* **Mixed (Average Diet)**: ~5.6 kg CO₂ equivalent per day.
* **Vegetarian Diet**: ~3.8 kg CO₂ equivalent per day.
* **Vegan Diet**: ~2.9 kg CO₂ equivalent per day.

#### Why Beef is Highly Carbon-Intensive
Beef production produces roughly 60kg of greenhouse gases per kg of meat—more than double any other animal protein, and nearly 30 times more than tofu or beans. Methane from cow digestion (enteric fermentation) is 28 times more potent than carbon dioxide at trapping atmospheric heat.

#### Action Steps
1. **Meatless Mondays**: Try eating plant-based meals at least one day a week.
2. **Choose Local**: Minimize food miles by buying from farmer markets.
3. **Minimize Dairy**: Dairy products (cheese, butter) also have large methane footprints; substitute with oat or almond milk.
4. **Legumes for Protein**: Swap meat for lentils, chickpeas, and beans, which naturally fertilize soil with nitrogen.`,
    category: 'tips',
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600',
    author: 'Dr. Marcus Vance',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    articleId: 'a3',
    title: 'Demystifying Recycling: How to Avoid Greenwashing',
    summary: 'Not all plastic is recyclable. Uncover the facts about recycling symbols and sorting rules.',
    content: `### The Recycling Guide: Sorting Fact from Fiction

Recycling is a critical piece of the circular economy, but contamination in recycling bins prevents millions of tons of material from actually being recycled. 

#### Understanding Resin Identification Codes (Plastic Numbers 1-7)
* **#1 (PET)**: Highly recyclable (water bottles, soda bottles).
* **#2 (HDPE)**: Highly recyclable (milk jugs, detergent bottles).
* **#5 (PP)**: Frequently recyclable (yogurt cups, tub lids). Check local guides.
* **#3, #4, #6, #7 (PVC, LDPE, PS, Other)**: Rarely recyclable in municipal curbside programs.

#### Top Recycling Pitfalls (Wishcycling)
1. **Plastic Bags**: Never put loose plastic grocery bags in curbside bins. They wrap around recycling sort machines, causing breakdowns. Take them to store drop-off centers.
2. **Greasy Pizza Boxes**: Cardboard soaked in food oils cannot be processed into clean paper. Compost them instead!
3. **Coffee Cups**: Most paper cups contain a thin plastic liner that makes them non-recyclable unless sent to specialized facilities.
4. **Food Residue**: Always rinse jars and containers. Food waste ruins batches of plastic and paper recycling.`,
    category: 'guide',
    coverImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600',
    author: 'Sarah Jenkins',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const EcoTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, currentUser, updateProfileData } = useAuth();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>(PRESET_CHALLENGES);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [articles, setArticles] = useState<EducationalArticle[]>(PRESET_ARTICLES);
  const [loadingData, setLoadingData] = useState(true);

  // Sync data on login
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        setActivities([]);
        setUserChallenges([]);
        setReports([]);
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      
      try {
        if (isFirebaseConfigured && db) {
          // 1. Fetch user activities
          const actRef = collection(db, 'users', currentUser.uid, 'activities');
          const qAct = query(actRef, orderBy('date', 'desc'));
          const actSnap = await getDocs(qAct);
          const actList = actSnap.docs.map(doc => ({ activityId: doc.id, ...doc.data() } as ActivityEntry));
          setActivities(actList);

          // 2. Fetch user challenges
          const chalRef = collection(db, 'users', currentUser.uid, 'userChallenges');
          const chalSnap = await getDocs(chalRef);
          const chalList = chalSnap.docs.map(doc => ({ challengeId: doc.id, ...doc.data() } as UserChallenge));
          setUserChallenges(chalList);

          // 3. Fetch monthly reports
          const repRef = collection(db, 'users', currentUser.uid, 'reports');
          const qRep = query(repRef, orderBy('month', 'desc'));
          const repSnap = await getDocs(qRep);
          const repList = repSnap.docs.map(doc => ({ reportId: doc.id, ...doc.data() } as MonthlyReport));
          setReports(repList);

          // 4. Fetch global challenges if they are dynamic in Firestore
          const globalChalRef = collection(db, 'challenges');
          const globalChalSnap = await getDocs(globalChalRef);
          if (!globalChalSnap.empty) {
            const list = globalChalSnap.docs.map(doc => ({ challengeId: doc.id, ...doc.data() } as Challenge));
            setChallenges(list);
          }

          // 5. Fetch global articles
          const artRef = collection(db, 'educational_articles');
          const artSnap = await getDocs(artRef);
          if (!artSnap.empty) {
            const list = artSnap.docs.map(doc => ({ articleId: doc.id, ...doc.data() } as EducationalArticle));
            setArticles(list);
          }
        } else {
          // LocalStorage fallback
          const localActivities = JSON.parse(localStorage.getItem(`ecotrack_activities_${currentUser.uid}`) || '[]');
          setActivities(localActivities);

          const localUserChallenges = JSON.parse(localStorage.getItem(`ecotrack_userchallenges_${currentUser.uid}`) || '[]');
          setUserChallenges(localUserChallenges);

          const localReports = JSON.parse(localStorage.getItem(`ecotrack_reports_${currentUser.uid}`) || '[]');
          setReports(localReports);

          const localChallenges = JSON.parse(localStorage.getItem('ecotrack_global_challenges') || '[]');
          if (localChallenges.length > 0) setChallenges(localChallenges);
          
          const localArticles = JSON.parse(localStorage.getItem('ecotrack_global_articles') || '[]');
          if (localArticles.length > 0) setArticles(localArticles);
        }
      } catch (err) {
        console.error('Error loading EcoTrack data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const addActivity = async (activityData: Omit<ActivityEntry, 'activityId' | 'userId' | 'totalEmissions'>) => {
    if (!currentUser || !userProfile) throw new Error('User must be logged in');

    // 1. Calculate emissions for each category
    const transportEmissions = calculateTransportEmissions(activityData.transport.mode, activityData.transport.distance);
    const electricityEmissions = calculateElectricityEmissions(activityData.electricity.kwh);
    const waterEmissions = calculateWaterEmissions(activityData.water.liters);
    const foodEmissions = calculateFoodEmissions(activityData.food.dietType, 1); // weekly factors are daily average
    const wasteEmissions = calculateWasteEmissions(activityData.waste.weight, activityData.waste.recycled, activityData.waste.composted);

    const totalEmissions = Number((
      transportEmissions + 
      electricityEmissions + 
      waterEmissions + 
      foodEmissions + 
      wasteEmissions
    ).toFixed(2));

    const completeActivity: ActivityEntry = {
      ...activityData,
      activityId: '',
      userId: currentUser.uid,
      transport: { ...activityData.transport, emissions: transportEmissions },
      electricity: { ...activityData.electricity, emissions: electricityEmissions },
      water: { ...activityData.water, emissions: waterEmissions },
      food: { ...activityData.food, emissions: foodEmissions },
      waste: { ...activityData.waste, emissions: wasteEmissions },
      totalEmissions
    };

    let savedActivity: ActivityEntry;

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'activities'), completeActivity);
      savedActivity = { ...completeActivity, activityId: docRef.id };
    } else {
      savedActivity = { ...completeActivity, activityId: 'act_' + Math.random().toString(36).substr(2, 9) };
      const updated = [savedActivity, ...activities];
      setActivities(updated);
      localStorage.setItem(`ecotrack_activities_${currentUser.uid}`, JSON.stringify(updated));
    }

    if (isFirebaseConfigured && db) {
      setActivities(prev => [savedActivity, ...prev]);
    }

    // 2. Recalculate User Profile Stats based on activities (latest month)
    // Filter activities in the current month to update user's monthly emissions
    const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
    const currentMonthActs = [...activities, savedActivity].filter(act => act.date.startsWith(currentMonthStr));
    const monthlyTotalEmissions = currentMonthActs.reduce((acc, act) => acc + act.totalEmissions, 0);
    const newCarbonScore = calculateSustainabilityScore(monthlyTotalEmissions);

    // Unlocking milestones / Badges
    const updatedBadges = [...userProfile.badges];
    
    // Badge logic
    const activeCount = activities.length + 1;
    if (activeCount >= 5 && !updatedBadges.some(b => b.id === 'track_5')) {
      updatedBadges.push({
        id: 'track_5',
        title: 'Carbon Investigator',
        description: 'Logged carbon footprint activities 5 times.',
        earnedAt: new Date().toISOString(),
        icon: '🔍'
      });
    }

    if (newCarbonScore >= 90 && !updatedBadges.some(b => b.id === 'green_champion')) {
      updatedBadges.push({
        id: 'green_champion',
        title: 'Eco Champion',
        description: 'Achieved an outstanding sustainability score above 90.',
        earnedAt: new Date().toISOString(),
        icon: '🏆'
      });
    }

    // Update goals progress
    const updatedGoals = userProfile.goals.map(goal => {
      if (goal.status !== 'active') return goal;
      
      // Compute reduction
      // Check category target
      let emissionsSaved = 0;
      if (goal.category === 'transport') {
        // Assume default transport was gas car. Saved is diff: (car_petrol_factor * distance) - actual
        // We will mock dynamic reduction updates
        emissionsSaved = 5; 
      } else if (goal.category === 'electricity') {
        emissionsSaved = 8;
      }
      
      const newCurrent = Math.min(goal.target, goal.current + emissionsSaved);
      const newStatus = newCurrent >= goal.target ? 'completed' : 'active';
      
      return {
        ...goal,
        current: newCurrent,
        status: newStatus as 'active' | 'completed'
      };
    });

    // Check if any goals were completed and reward points
    let pointsEarned = 0;
    updatedGoals.forEach((goal, idx) => {
      if (goal.status === 'completed' && userProfile.goals[idx].status === 'active') {
        pointsEarned += 150; // Goal completed reward
      }
    });

    await updateProfileData({
      totalEmissions: Number(monthlyTotalEmissions.toFixed(2)),
      carbonScore: newCarbonScore,
      goals: updatedGoals,
      badges: updatedBadges,
      points: userProfile.points + pointsEarned + 10 // +10 points per activity logged
    });

    return savedActivity;
  };

  const joinChallenge = async (challengeId: string) => {
    if (!currentUser) throw new Error('User must be logged in');

    const newUserChallenge: UserChallenge = {
      challengeId,
      status: 'joined',
      joinedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'users', currentUser.uid, 'userChallenges', challengeId), newUserChallenge);
      setUserChallenges(prev => [...prev.filter(c => c.challengeId !== challengeId), newUserChallenge]);
    } else {
      const updated = [...userChallenges.filter(c => c.challengeId !== challengeId), newUserChallenge];
      setUserChallenges(updated);
      localStorage.setItem(`ecotrack_userchallenges_${currentUser.uid}`, JSON.stringify(updated));
    }
  };

  const completeChallenge = async (challengeId: string) => {
    if (!currentUser || !userProfile) throw new Error('User must be logged in');

    const challengeObj = challenges.find(c => c.challengeId === challengeId);
    if (!challengeObj) throw new Error('Challenge not found');

    const updatedUserChallenge: UserChallenge = {
      challengeId,
      status: 'completed',
      joinedAt: userChallenges.find(c => c.challengeId === challengeId)?.joinedAt || new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'users', currentUser.uid, 'userChallenges', challengeId), updatedUserChallenge);
      setUserChallenges(prev => prev.map(c => c.challengeId === challengeId ? updatedUserChallenge : c));
    } else {
      const updated = userChallenges.map(c => c.challengeId === challengeId ? updatedUserChallenge : c);
      setUserChallenges(updated);
      localStorage.setItem(`ecotrack_userchallenges_${currentUser.uid}`, JSON.stringify(updated));
    }

    // Award Points
    const updatedBadges = [...userProfile.badges];
    const completedChallengesCount = userChallenges.filter(c => c.status === 'completed').length + 1;
    
    // Check challenge badge
    if (completedChallengesCount >= 3 && !updatedBadges.some(b => b.id === 'challenge_3')) {
      updatedBadges.push({
        id: 'challenge_3',
        title: 'Eco Warrior',
        description: 'Successfully completed 3 sustainability challenges.',
        earnedAt: new Date().toISOString(),
        icon: '🛡️'
      });
    }

    await updateProfileData({
      points: userProfile.points + challengeObj.rewardPoints,
      badges: updatedBadges
    });
  };

  const addUserGoal = async (goalData: Omit<Goal, 'id' | 'current' | 'status'>) => {
    if (!currentUser || !userProfile) throw new Error('User must be logged in');

    const newGoal: Goal = {
      ...goalData,
      id: 'goal_' + Math.random().toString(36).substr(2, 9),
      current: 0,
      status: 'active'
    };

    const updatedGoals = [...userProfile.goals, newGoal];
    await updateProfileData({ goals: updatedGoals });
  };

  const updateGoalStatus = async (goalId: string, status: 'completed' | 'failed') => {
    if (!currentUser || !userProfile) throw new Error('User must be logged in');

    const updatedGoals = userProfile.goals.map(g => 
      g.id === goalId ? { ...g, status } : g
    );

    await updateProfileData({ 
      goals: updatedGoals,
      points: userProfile.points + (status === 'completed' ? 100 : 0) // reward points
    });
  };

  const fetchReports = async () => {
    if (!currentUser) return;
    if (isFirebaseConfigured && db) {
      const repRef = collection(db, 'users', currentUser.uid, 'reports');
      const qRep = query(repRef, orderBy('month', 'desc'));
      const repSnap = await getDocs(qRep);
      const repList = repSnap.docs.map(doc => ({ reportId: doc.id, ...doc.data() } as MonthlyReport));
      setReports(repList);
    }
  };

  const addMonthlyReport = async (month: string, aiInsights: string) => {
    if (!currentUser || !userProfile) throw new Error('User must be logged in');

    // 1. Calculate average category footprint for this month
    const monthlyActs = activities.filter(act => act.date.startsWith(month));
    const breakdown = {
      transport: monthlyActs.reduce((acc, act) => acc + act.transport.emissions, 0),
      electricity: monthlyActs.reduce((acc, act) => acc + act.electricity.emissions, 0),
      food: monthlyActs.reduce((acc, act) => acc + act.food.emissions, 0),
      water: monthlyActs.reduce((acc, act) => acc + act.water.emissions, 0),
      waste: monthlyActs.reduce((acc, act) => acc + act.waste.emissions, 0)
    };
    
    const totalEmissionsVal = Object.values(breakdown).reduce((acc, v) => acc + v, 0);

    const newReport: MonthlyReport = {
      reportId: '',
      userId: currentUser.uid,
      month,
      emissionsBreakdown: breakdown,
      totalEmissions: Number(totalEmissionsVal.toFixed(2)),
      averageEmissions: 450, // Local benchmark average
      sustainabilityScore: calculateSustainabilityScore(totalEmissionsVal),
      aiInsights,
      createdAt: new Date().toISOString()
    };

    let savedReport: MonthlyReport;

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'reports'), newReport);
      savedReport = { ...newReport, reportId: docRef.id };
    } else {
      savedReport = { ...newReport, reportId: 'rep_' + Math.random().toString(36).substr(2, 9) };
      const updated = [savedReport, ...reports];
      setReports(updated);
      localStorage.setItem(`ecotrack_reports_${currentUser.uid}`, JSON.stringify(updated));
    }

    if (isFirebaseConfigured && db) {
      setReports(prev => [savedReport, ...prev]);
    }

    return savedReport;
  };

  const addGlobalChallenge = async (challengeData: Omit<Challenge, 'challengeId'>) => {
    const newId = 'c_' + Math.random().toString(36).substr(2, 9);
    const newChallenge: Challenge = { ...challengeData, challengeId: newId };
    
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'challenges', newId), newChallenge);
    } else {
      const updated = [...challenges, newChallenge];
      setChallenges(updated);
      localStorage.setItem('ecotrack_global_challenges', JSON.stringify(updated));
    }
  };

  const addGlobalArticle = async (articleData: Omit<EducationalArticle, 'articleId' | 'createdAt'>) => {
    const newId = 'a_' + Math.random().toString(36).substr(2, 9);
    const newArticle: EducationalArticle = { 
      ...articleData, 
      articleId: newId,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'educational_articles', newId), newArticle);
    } else {
      const updated = [newArticle, ...articles];
      setArticles(updated);
      localStorage.setItem('ecotrack_global_articles', JSON.stringify(updated));
    }
  };

  return (
    <EcoTrackContext.Provider value={{
      activities,
      challenges,
      userChallenges,
      reports,
      articles,
      loadingData,
      addActivity,
      joinChallenge,
      completeChallenge,
      addUserGoal,
      updateGoalStatus,
      fetchReports,
      addMonthlyReport,
      addGlobalChallenge,
      addGlobalArticle
    }}>
      {children}
    </EcoTrackContext.Provider>
  );
};
