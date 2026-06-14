import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEcoTrack } from '../context/EcoTrackContext';
import { Trophy, Target, Star, Calendar, CheckCircle } from 'lucide-react';

const Challenges: React.FC = () => {
  const { userProfile } = useAuth();
  const { challenges, userChallenges, joinChallenge, completeChallenge, addUserGoal, updateGoalStatus } = useEcoTrack();
  const [goalCategory, setGoalCategory] = useState<'all' | 'transport' | 'electricity' | 'water' | 'food' | 'waste'>('transport');
  const [goalTarget, setGoalTarget] = useState<number>(20);
  const [goalDeadline, setGoalDeadline] = useState<string>('');
  const [addingGoal, setAddingGoal] = useState(false);

  // Gamification formulas
  const points = userProfile?.points || 0;
  const level = Math.floor(points / 500) + 1;
  const pointsForNextLevel = 500;
  const currentLevelPoints = points % 500;
  const levelProgressPercent = Math.round((currentLevelPoints / pointsForNextLevel) * 100);

  const getChallengeStatus = (challengeId: string) => {
    const uc = userChallenges.find(c => c.challengeId === challengeId);
    return uc ? uc.status : 'not_started';
  };

  const handleJoin = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (challengeId: string) => {
    try {
      await completeChallenge(challengeId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalDeadline) return;

    try {
      await addUserGoal({
        category: goalCategory,
        target: Number(goalTarget),
        deadline: goalDeadline
      });
      setAddingGoal(false);
      setGoalDeadline('');
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transport': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'energy': return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
      case 'food': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'waste': return 'text-pink-500 bg-pink-500/10 border-pink-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Eco Challenges & <span className="eco-gradient-text font-bold">Gamification</span></h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Unleash your inner green champion. Earn points, complete challenges, and earn badges.
        </p>
      </div>

      {/* Grid: Gamification & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Level Progress */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg lg:col-span-1 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Your Eco Progress</span>
            </h3>

            {/* Level graphic */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-[10px] uppercase font-bold tracking-widest leading-none">Level</span>
                <span className="font-outfit text-3xl font-extrabold leading-none mt-1">{level}</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Eco Explorer</p>
                <p className="text-xs text-slate-500">{points} lifetime carbon points</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Next Level</span>
                <span>{currentLevelPoints} / {pointsForNextLevel} XP</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${levelProgressPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6 mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Badges Earned</p>
            {userProfile?.badges && userProfile.badges.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {userProfile.badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className="group relative flex flex-col items-center p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:scale-105 transition-all"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 w-40 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-lg text-center leading-normal">
                      <strong className="font-bold block text-emerald-400">{badge.title}</strong>
                      {badge.description}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-normal">No badges unlocked yet. Start tracking to earn rewards!</p>
            )}
          </div>
        </div>

        {/* Right Side: Goals Section */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              <span>Carbon Goals</span>
            </h3>
            <button
              onClick={() => setAddingGoal(!addingGoal)}
              className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-xs transition-all"
            >
              {addingGoal ? 'Cancel' : 'Set New Goal'}
            </button>
          </div>

          {/* New Goal Form */}
          {addingGoal && (
            <form onSubmit={handleAddGoal} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label htmlFor="goal-category" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</label>
                <select
                  id="goal-category"
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as any)}
                  className="w-full glass-input py-2 px-3 text-xs"
                >
                  <option value="transport">Transport</option>
                  <option value="electricity">Electricity</option>
                  <option value="water">Water</option>
                  <option value="food">Dietary</option>
                  <option value="waste">Waste</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="goal-target" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reduction Target (kg)</label>
                <input
                  id="goal-target"
                  type="number"
                  min="1"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(Number(e.target.value))}
                  className="w-full glass-input py-2 px-3 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="goal-deadline" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Deadline</label>
                <input
                  id="goal-deadline"
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full glass-input py-2 px-3 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all shadow-md"
              >
                Create Goal
              </button>
            </form>
          )}

          {/* Goals List */}
          <div className="space-y-3">
            {userProfile?.goals && userProfile.goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProfile.goals.map((goal) => {
                  const pct = Math.round((goal.current / goal.target) * 100);
                  const isCompleted = goal.status === 'completed';
                  return (
                    <div 
                      key={goal.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        isCompleted 
                          ? 'border-emerald-500/20 bg-emerald-500/5' 
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Target</span>
                          <h4 className="font-bold text-sm capitalize">{goal.category} Reduction</h4>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded-full ${
                          isCompleted 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {goal.status}
                        </span>
                      </div>

                      {/* Goal details */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Progress: {goal.current} / {goal.target} kg CO₂</span>
                          <span className="font-bold">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-emerald-400'}`} 
                            style={{ width: `${Math.min(100, pct)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Deadline: {goal.deadline}</span>
                          </span>
                          {!isCompleted && goal.status === 'active' && (
                            <button
                              onClick={() => updateGoalStatus(goal.id, 'completed')}
                              className="text-emerald-500 font-bold hover:underline"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 leading-normal text-center py-6">
                You haven't set any sustainability goals yet. Add one now to start saving carbon emissions.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Section: Active Challenges */}
      <div className="space-y-4 pt-4">
        <h3 className="font-outfit text-xl font-bold">Active Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => {
            const status = getChallengeStatus(challenge.challengeId);
            return (
              <div 
                key={challenge.challengeId} 
                className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">{challenge.icon}</span>
                    <span className={`text-[10px] uppercase font-bold border px-2 py-0.5 rounded-full ${getCategoryColor(challenge.category)}`}>
                      {challenge.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base">{challenge.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                      <Star className="w-4 h-4 fill-amber-500/10" />
                      <span>{challenge.rewardPoints} XP Reward</span>
                    </div>
                    <div className="text-slate-400">
                      Duration: {challenge.durationDays} day(s)
                    </div>
                  </div>

                  {/* Buttons logic */}
                  {status === 'not_started' && (
                    <button
                      onClick={() => handleJoin(challenge.challengeId)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs transition-all shadow-md"
                    >
                      Join Challenge
                    </button>
                  )}

                  {status === 'joined' && (
                    <button
                      onClick={() => handleComplete(challenge.challengeId)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete Challenge</span>
                    </button>
                  )}

                  {status === 'completed' && (
                    <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>Challenge Completed!</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Challenges;
