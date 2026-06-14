import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEcoTrack } from '../context/EcoTrackContext';
import { generateAICoachInsights } from '../services/gemini';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  Trophy, 
  Activity, 
  Sparkles, 
  Target, 
  Calendar 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { activities, addMonthlyReport, reports } = useEcoTrack();
  const [aiReport, setAiReport] = useState<string>('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    const month = new Date().toISOString().substring(0, 7); // YYYY-MM
    setCurrentMonth(month);

    // Load existing report if available for this month
    const currentReport = reports.find(r => r.month === month);
    if (currentReport) {
      setAiReport(currentReport.aiInsights);
    }
  }, [reports]);

  // 1. Compute current month's emissions breakdown
  const currentMonthActs = activities.filter(act => act.date.startsWith(currentMonth));
  
  const transportTotal = currentMonthActs.reduce((acc, act) => acc + act.transport.emissions, 0);
  const electricityTotal = currentMonthActs.reduce((acc, act) => acc + act.electricity.emissions, 0);
  const waterTotal = currentMonthActs.reduce((acc, act) => acc + act.water.emissions, 0);
  const foodTotal = currentMonthActs.reduce((acc, act) => acc + act.food.emissions, 0);
  const wasteTotal = currentMonthActs.reduce((acc, act) => acc + act.waste.emissions, 0);

  const totalEmissions = Number((
    transportTotal + 
    electricityTotal + 
    waterTotal + 
    foodTotal + 
    wasteTotal
  ).toFixed(2));

  // Pie chart data
  const pieData = [
    { name: 'Transport', value: Number(transportTotal.toFixed(1)), color: '#10b981' }, // Emerald
    { name: 'Electricity', value: Number(electricityTotal.toFixed(1)), color: '#38bdf8' }, // Sky
    { name: 'Food Habits', value: Number(foodTotal.toFixed(1)), color: '#f59e0b' }, // Amber
    { name: 'Water Use', value: Number(waterTotal.toFixed(1)), color: '#6366f1' }, // Indigo
    { name: 'Waste Disposal', value: Number(wasteTotal.toFixed(1)), color: '#ec4899' } // Pink
  ].filter(d => d.value > 0);

  // If no emissions logged yet, provide a placeholder for the pie chart
  const hasLoggedData = pieData.length > 0;
  const dummyPieData = [
    { name: 'No Data Logged', value: 1, color: '#94a3b8' } // Slate
  ];

  // 2. Bar chart data: Group last 7 logs/days
  const barData = activities.slice(0, 7).reverse().map(act => ({
    date: act.date.substring(5), // MM-DD
    Transport: Number(act.transport.emissions.toFixed(1)),
    Utilities: Number((act.electricity.emissions + act.water.emissions).toFixed(1)),
    Diet: Number(act.food.emissions.toFixed(1)),
    Waste: Number(act.waste.emissions.toFixed(1)),
    Total: Number(act.totalEmissions.toFixed(1))
  }));

  const handleAskCoach = async () => {
    if (!userProfile) return;
    setGeneratingAI(true);
    try {
      const breakdown = {
        transport: transportTotal,
        electricity: electricityTotal,
        food: foodTotal,
        water: waterTotal,
        waste: wasteTotal
      };
      
      const insights = await generateAICoachInsights({
        userProfile,
        activities,
        currentMonthBreakdown: breakdown
      });

      // Save report in context & Firestore
      await addMonthlyReport(currentMonth, insights);
      setAiReport(insights);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingAI(false);
    }
  };

  // Score colors configuration
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 50) return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-500 border-rose-500/20 bg-rose-500/5';
  };

  // Simple Markdown-like formatter for AI Coach response
  const formatMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1 font-outfit">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('*   ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-slate-600 dark:text-slate-300 py-1">
            {line.replace(/^\*\s+\/?/, '').replace(/^\*\s+/, '')}
          </li>
        );
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
        return (
          <li key={idx} className="ml-4 list-decimal text-sm text-slate-600 dark:text-slate-300 py-1">
            {line.replace(/^\d+\.\s+/, '')}
          </li>
        );
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="my-4 border-slate-100 dark:border-slate-800" />;
      }
      if (line.trim()) {
        // Replace bold **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index));
          }
          parts.push(<strong key={match.index} className="font-bold text-slate-900 dark:text-white">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        
        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex));
        }

        return <p key={idx} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed py-1">{parts.length > 0 ? parts : line}</p>;
      }
      return <div key={idx} className="h-2"></div>;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Eco Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analyze your environmental footprint summary, trends, and active reduction achievements.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl text-xs font-semibold">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Period: {currentMonth} (Current Month)</span>
        </div>
      </div>

      {/* Grid: 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Footprint Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Footprint</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-outfit text-4xl font-extrabold text-slate-900 dark:text-white">{totalEmissions}</span>
              <span className="text-sm font-semibold text-slate-500">kg CO₂</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 text-xs">
            <span className="text-slate-500">Average US/EU benchmark:</span>
            <span className="font-bold text-slate-900 dark:text-white">450.0 kg</span>
          </div>
        </div>

        {/* Sustainability Score Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between min-h-[160px]">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Eco Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-outfit text-4xl font-extrabold text-emerald-500">{userProfile?.carbonScore || 75}</span>
              <span className="text-sm font-semibold text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 text-xs">
            <span className="text-slate-500">Level:</span>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${getScoreColor(userProfile?.carbonScore || 75).split(' ')[0]} ${getScoreColor(userProfile?.carbonScore || 75).split(' ')[1]} ${getScoreColor(userProfile?.carbonScore || 75).split(' ')[2]}`}>
              {(userProfile?.carbonScore || 75) >= 80 ? 'Green Champion' : (userProfile?.carbonScore || 75) >= 50 ? 'Moderate' : 'High Footprint'}
            </span>
          </div>
        </div>

        {/* Goals Progress Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Goals</span>
              <Target className="w-4 h-4 text-emerald-500" />
            </div>
            {userProfile?.goals && userProfile.goals.filter(g => g.status === 'active').length > 0 ? (
              <div className="space-y-3 mt-3">
                {userProfile.goals.filter(g => g.status === 'active').slice(0, 1).map((goal) => {
                  const pct = Math.round((goal.current / goal.target) * 100);
                  return (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="capitalize">{goal.category} Reduction</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-400 block pt-0.5">Deadline: {goal.deadline}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                No active reduction goals. Set a monthly target to jumpstart your savings.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 text-xs">
            <span className="text-slate-500">Lifetime Points:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>{userProfile?.points || 0} pts</span>
            </span>
          </div>
        </div>

      </div>

      {/* Grid: Charts & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category breakdown (Pie Chart) */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold">Category Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Carbon output proportion by category.</p>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hasLoggedData ? pieData : dummyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(hasLoggedData ? pieData : dummyPieData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(30, 41, 59, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart Legends */}
          <div className="space-y-1.5 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            {(hasLoggedData ? pieData : [{ name: 'No Logs Recorded', value: 0, color: '#94a3b8' }]).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-500 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value} kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly trends (Bar Chart) */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold">Recent Activities Log</h3>
            <p className="text-xs text-slate-500 mb-4">Footprint comparison over your last 7 entries.</p>
          </div>

          <div className="h-[250px] w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(30, 41, 59, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Transport" stackId="a" fill="#10b981" />
                  <Bar dataKey="Utilities" stackId="a" fill="#38bdf8" />
                  <Bar dataKey="Diet" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Waste" stackId="a" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 text-xs">
                <Activity className="w-8 h-8 text-slate-500 animate-pulse" />
                <span>No logged activities. Log your first action on the Calculator tab!</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* AI coach panel */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit text-xl font-bold">AI Sustainability Coach</h3>
              <p className="text-xs text-slate-500">Gemini-powered insights custom-tailored to your footprint.</p>
            </div>
          </div>

          <button
            onClick={handleAskCoach}
            disabled={generatingAI || !hasLoggedData}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 justify-center disabled:opacity-50"
          >
            {generatingAI ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Patterns...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Recommendations</span>
              </>
            )}
          </button>
        </div>

        {/* Recommendations Display */}
        {aiReport ? (
          <div className="p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 shadow-inner max-h-[500px] overflow-y-auto pr-4">
            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-100">
              {formatMarkdown(aiReport)}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-100/10">
            <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3 animate-pulse" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Coach is Ready to Analyze</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              {hasLoggedData 
                ? "Click 'Generate Recommendations' above to run a complete analysis on your transport, utilities, food, and waste logs using Gemini AI."
                : "You need to log at least one carbon activity entry in the Calculator tab before the AI Coach can run footprint diagnostics."
              }
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
