import React, { useState, useEffect } from 'react';
import { useEcoTrack } from '../context/EcoTrackContext';
import { ShieldAlert, Trophy, BookOpen, Users, PlusCircle, CheckCircle } from 'lucide-react';
import { getDocs, collection } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

const AdminPanel: React.FC = () => {
  const { addGlobalChallenge, addGlobalArticle, challenges, articles } = useEcoTrack();
  const [activeTab, setActiveTab] = useState<'users' | 'challenges' | 'articles'>('users');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Forms success messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Challenge Form State
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cCategory, setCCategory] = useState<'transport' | 'energy' | 'food' | 'waste'>('transport');
  const [cPoints, setCPoints] = useState<number>(100);
  const [cDays, setCDays] = useState<number>(3);
  const [cIcon, setCIcon] = useState('🌱');

  // Article Form State
  const [aTitle, setATitle] = useState('');
  const [aSummary, setASummary] = useState('');
  const [aCategory, setACategory] = useState<'guide' | 'news' | 'tips'>('guide');
  const [aAuthor, setAAuthor] = useState('');
  const [aCover, setACover] = useState('');
  const [aContent, setAContent] = useState('');

  // Fetch Users List
  useEffect(() => {
    if (activeTab !== 'users') return;
    
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        if (isFirebaseConfigured && db) {
          const snap = await getDocs(collection(db, 'users'));
          const list = snap.docs.map(doc => doc.data());
          setUsersList(list);
        } else {
          // LocalStorage fallback user lists
          const storedUsers = JSON.parse(localStorage.getItem('ecotrack_users') || '{}');
          setUsersList(Object.values(storedUsers));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [activeTab]);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addGlobalChallenge({
        title: cTitle,
        description: cDesc,
        category: cCategory,
        rewardPoints: Number(cPoints),
        durationDays: Number(cDays),
        icon: cIcon,
        status: 'active'
      });
      triggerSuccess('New challenge published successfully!');
      setCTitle('');
      setCDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addGlobalArticle({
        title: aTitle,
        summary: aSummary,
        category: aCategory,
        author: aAuthor,
        coverImage: aCover || 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=600',
        content: aContent
      });
      triggerSuccess('New educational article published successfully!');
      setATitle('');
      setASummary('');
      setAAuthor('');
      setACover('');
      setAContent('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="font-outfit text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-emerald-500" />
          <span>Admin Controls</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Perform administrative tasks, publish challenges, edit guides, and monitor user eco-progress.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'users' 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Profiles ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'challenges' 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Publish Challenges</span>
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'articles' 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Write Articles</span>
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: USERS LIST */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg">Active Platform Users</h3>
            <p className="text-xs text-slate-500">Monitor carbon emission scores and user points statistics.</p>
          </div>

          <div className="overflow-x-auto">
            {loadingUsers ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : usersList.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-850">
                    <th className="p-4 pl-6">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-center">Emissions</th>
                    <th className="p-4 text-center">Points</th>
                    <th className="p-4 pr-6 text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {usersList.map((user, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-4 pl-6 font-semibold flex items-center gap-2.5">
                        <img 
                          src={user.profilePhoto || 'https://api.dicebear.com/7.x/adventurer/svg?seed=EcoUser'} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full border border-emerald-500/25 bg-emerald-50"
                        />
                        <span>{user.name}</span>
                      </td>
                      <td className="p-4 text-slate-500">{user.email}</td>
                      <td className="p-4 text-center font-bold text-emerald-500">{user.carbonScore}/100</td>
                      <td className="p-4 text-center">{user.totalEmissions} kg CO₂</td>
                      <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{user.points} XP</td>
                      <td className="p-4 pr-6 text-right uppercase font-bold text-[9px] text-slate-400">
                        {user.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No users loaded. Build profile records by signing in.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CHALLENGE FORM */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg lg:col-span-2">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              <span>Create Dynamic Challenge</span>
            </h3>

            <form onSubmit={handleChallengeSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Title</label>
                  <input
                    type="text"
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    placeholder="e.g. Vegetarian Weekend"
                    className="w-full glass-input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</label>
                  <select
                    value={cCategory}
                    onChange={(e) => setCCategory(e.target.value as any)}
                    className="w-full glass-input"
                  >
                    <option value="transport">Transport</option>
                    <option value="energy">Energy</option>
                    <option value="food">Dietary</option>
                    <option value="waste">Waste</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reward XP</label>
                  <input
                    type="number"
                    value={cPoints}
                    onChange={(e) => setCPoints(Number(e.target.value))}
                    className="w-full glass-input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Duration (Days)</label>
                  <input
                    type="number"
                    value={cDays}
                    onChange={(e) => setCDays(Number(e.target.value))}
                    className="w-full glass-input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={cIcon}
                    onChange={(e) => setCIcon(e.target.value)}
                    className="w-full glass-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Description</label>
                <textarea
                  rows={3}
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="Provide instructions on how to achieve this reward..."
                  className="w-full glass-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all text-xs"
              >
                Publish Challenge
              </button>
            </form>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
              <h4 className="font-bold text-sm mb-2">Current Challenges list ({challenges.length})</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {challenges.map(c => (
                  <div key={c.challengeId} className="flex justify-between items-center text-xs p-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-100/30">
                    <span className="truncate max-w-[120px] font-semibold">{c.icon} {c.title}</span>
                    <span className="text-slate-400 font-bold uppercase text-[9px]">{c.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ARTICLE FORM */}
      {activeTab === 'articles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg lg:col-span-2">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              <span>Write Educational Article</span>
            </h3>

            <form onSubmit={handleArticleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Title</label>
                  <input
                    type="text"
                    value={aTitle}
                    onChange={(e) => setATitle(e.target.value)}
                    placeholder="e.g. Harnessing Wind Power at Home"
                    className="w-full glass-input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</label>
                  <select
                    value={aCategory}
                    onChange={(e) => setACategory(e.target.value as any)}
                    className="w-full glass-input"
                  >
                    <option value="guide">Guide</option>
                    <option value="news">News</option>
                    <option value="tips">Tips</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Author</label>
                  <input
                    type="text"
                    value={aAuthor}
                    onChange={(e) => setAAuthor(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full glass-input"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Cover Image URL</label>
                  <input
                    type="url"
                    value={aCover}
                    onChange={(e) => setACover(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full glass-input"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Summary</label>
                  <input
                    type="text"
                    value={aSummary}
                    onChange={(e) => setASummary(e.target.value)}
                    placeholder="A brief 1-sentence synopsis of the article..."
                    className="w-full glass-input"
                    required
                  />
                </div>

              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Content (Markdown format)</label>
                <textarea
                  rows={8}
                  value={aContent}
                  onChange={(e) => setAContent(e.target.value)}
                  placeholder="### Wind Power Guide... Use ### for headings, * for bullets..."
                  className="w-full glass-input font-mono text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all text-xs"
              >
                Publish Article
              </button>
            </form>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
              <h4 className="font-bold text-sm mb-2">Current Articles list ({articles.length})</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {articles.map(art => (
                  <div key={art.articleId} className="p-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-100/30 text-xs">
                    <p className="font-semibold truncate">{art.title}</p>
                    <p className="text-[9px] text-slate-400 block mt-0.5 uppercase">By {art.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
