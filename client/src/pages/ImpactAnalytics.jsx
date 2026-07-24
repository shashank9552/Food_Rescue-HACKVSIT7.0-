import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';
import { 
  calculateMealsSaved, 
  calculateCarbonSaved, 
  calculatePeopleFed, 
  generateInsights, 
  predictFutureTrends, 
  getLeaderboardData 
} from '../services/analyticsService';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, FileText, Download, Target, Award, ShieldCheck, 
  TrendingUp, Leaf, Award as Ribbon, Calendar, Clock, MapPin, Users 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImpactAnalytics() {
  const { user, userProfile } = useAuth();
  
  // Real-time states
  const [listings, setListings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [dateFilter, setDateFilter] = useState('month'); // today, week, month, year

  // Goal settings
  const [mealsGoal, setMealsGoal] = useState(150);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // 1. Fetch live data
  useEffect(() => {
    // Listen to listings
    const unsubListings = onSnapshot(collection(db, 'foodListings'), (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setListings(data);
    });

    // Listen to users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setUsersList(data);
    });

    // Listen to matches
    const unsubMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setMatches(data);
      setLoading(false);
    });

    return () => {
      unsubListings();
      unsubUsers();
      unsubMatches();
    };
  }, []);

  // Filter listings based on role
  const getRoleFilteredData = () => {
    if (!user || !userProfile) return [];
    if (userProfile.role === 'restaurant') {
      return listings.filter(l => l.restaurantId === user.uid);
    }
    if (userProfile.role === 'ngo') {
      return listings.filter(l => l.claimedByNgo === user.uid);
    }
    if (userProfile.role === 'volunteer') {
      return listings.filter(l => l.assignedVolunteer === user.uid);
    }
    return listings; // admin gets all
  };

  const filteredListings = getRoleFilteredData();

  // 2. Perform impact aggregations
  const totalWeightRescued = filteredListings
    .filter(l => l.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  const totalMeals = calculateMealsSaved(totalWeightRescued);
  const totalCo2 = calculateCarbonSaved(totalWeightRescued);
  const totalPeopleFed = calculatePeopleFed(totalMeals);

  // Busiest and growth predictions
  const predictions = predictFutureTrends(listings, matches);

  // Leaderboard data
  const leaderboards = getLeaderboardData(usersList, listings, matches);

  // AI generated insights
  const aiInsightsList = generateInsights(
    userProfile?.role || 'restaurant', 
    filteredListings, 
    matches, 
    usersList
  );

  // Recharts: category distribution
  const getCategoryChartData = () => {
    const counts = {};
    filteredListings.forEach(l => {
      counts[l.foodCategory] = (counts[l.foodCategory] || 0) + (l.quantity || 0);
    });
    return Object.keys(counts).map(cat => ({
      name: cat,
      value: Number(counts[cat].toFixed(1))
    }));
  };

  const categoryChartData = getCategoryChartData();
  const COLORS = ['#16A34A', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

  // Recharts: daily donation volume
  const getDailyChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
    filteredListings.forEach(l => {
      if (l.createdAt) {
        const date = l.createdAt.toDate ? l.createdAt.toDate() : new Date(l.createdAt);
        const day = days[date.getDay()];
        if (day in counts) counts[day] += l.quantity || 0;
      }
    });
    return Object.keys(counts).map(day => ({ name: day, quantity: counts[day] }));
  };

  const dailyChartData = getDailyChartData();

  // Recharts: monthly progression curve
  const getMonthlyGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = {};
    filteredListings.forEach(l => {
      if (l.createdAt) {
        const date = l.createdAt.toDate ? l.createdAt.toDate() : new Date(l.createdAt);
        const mon = months[date.getMonth()];
        counts[mon] = (counts[mon] || 0) + (l.quantity || 0);
      }
    });
    return months.map(m => ({ name: m, quantity: counts[m] || 0 })).filter(d => d.quantity > 0 || d.name === 'Jul'); // fallback default view
  };

  const monthlyGrowthData = getMonthlyGrowthData();

  // Client-side CSV export
  const exportCSV = () => {
    try {
      const headers = ['Listing ID', 'Food Name', 'Category', 'Weight (kg)', 'Status', 'Claimed By NGO'];
      const rows = filteredListings.map(l => [
        l.id,
        l.foodName,
        l.foodCategory,
        l.quantity,
        l.status,
        l.claimedByNgoName || 'None'
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `food_rescue_impact_${userProfile?.role || 'user'}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV export downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate CSV file.");
    }
  };

  // PDF print trigger
  const exportPDF = () => {
    window.print();
  };

  // Gamified Badges unlocked based on metrics
  const getUnlockedBadges = () => {
    const badges = [];
    if (filteredListings.length > 0) {
      badges.push({ title: "🌱 First Step", desc: "Initiated your first food listing rescue", icon: "🌱" });
    }
    if (totalMeals >= 100) {
      badges.push({ title: "🥈 Food Hero", desc: "Saved over 100 meals for local communities", icon: "🥈" });
    }
    if (totalMeals >= 500) {
      badges.push({ title: "🥇 Savior Legend", desc: "Saved over 500 meals for local families", icon: "🥇" });
    }
    if (totalCo2 >= 50) {
      badges.push({ title: "🌍 Earth Saver", desc: "Avoided over 50 kg of greenhouse carbon offsets", icon: "🌍" });
    }
    if (filteredListings.filter(l => l.status === 'delivered').length >= 5) {
      badges.push({ title: "🚀 Community Hero", desc: "Successfully closed 5+ transit operations", icon: "🚀" });
    }
    return badges;
  };

  const unlockedBadges = getUnlockedBadges();

  return (
    <DashboardLayout title="AI Impact Analytics Center">
      <div className="space-y-8 print:p-0">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-900">SaaS Impact Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time ecological offsets, meal counts, and predictive insights.</p>
          </div>
          
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            {/* Filter buttons */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs">
              <button 
                onClick={() => setDateFilter('week')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${dateFilter === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setDateFilter('month')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${dateFilter === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setDateFilter('year')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${dateFilter === 'year' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Year
              </button>
            </div>

            {/* Export buttons */}
            <button 
              onClick={exportCSV}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={exportPDF}
              className="px-3.5 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-500 flex items-center gap-1.5 transition-all shadow-md shadow-green-600/10"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print PDF Report</span>
            </button>
          </div>
        </div>

        {/* Aggregated Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 font-extrabold text-lg">
              🍽
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meals Rescued</span>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalMeals}</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Distributed to local shelters</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-extrabold text-lg">
              🌍
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CO₂ Offset (kg)</span>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalCo2}</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Greenhouse gases prevented</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-lg">
              👨‍👩‍👧
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">People Fed</span>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalPeopleFed}</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Nutritional portions saved</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-extrabold text-lg">
              ♻
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Food Rescued (kg)</span>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalWeightRescued}</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Landfill prevention volume</p>
            </div>
          </motion.div>
        </div>

        {/* Charts & AI Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Progression Curve */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Rescued Food Volume Progression (kg)</span>
                </h3>
              </div>
              <div className="h-64">
                {monthlyGrowthData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No data recorded to render curves.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="quantity" stroke="#16A34A" fill="rgba(22, 163, 74, 0.08)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Daily volume and Categories splits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Weekly Distribution Trend (kg)</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-800">Categories Breakdown</h3>
                {categoryChartData.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center">No categories recorded.</p>
                ) : (
                  <div className="h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center text-[10px]">
                  {categoryChartData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-600">{entry.name} ({entry.value} kg)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights & Goals Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* AI Insights Card */}
            <div className="bg-gradient-to-tr from-green-50/50 to-emerald-50/50 p-6 rounded-2xl border border-green-150 shadow-sm space-y-5 relative">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-green-600 animate-pulse" />
                <span>AI Insights & Analytics</span>
              </h3>
              
              <ul className="text-xs text-slate-650 space-y-3 leading-relaxed list-none pl-0">
                {aiInsightsList.map((insight, idx) => (
                  <li key={idx} className="relative pl-4 flex items-start gap-1">
                    <span className="text-green-600 font-extrabold mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>

              {/* Predictions details */}
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-100 text-[11px] text-slate-550 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Predictive Recommendations</div>
                <div>Donation Busiest Hours: <strong>{predictions.busiestHour}</strong></div>
                <div>Unmet Demand Spot: <strong>{predictions.unmetDemandRegion}</strong></div>
                <div>Expected Next Week volume: <strong>{predictions.nextWeekPredictedKg} kg</strong></div>
                <div>Recommended Window: <strong>{predictions.recommendedDonationTime}</strong></div>
              </div>
            </div>

            {/* Goals Tracking */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-green-600" />
                  <span>Monthly Goal Tracking</span>
                </h3>
                {isEditingGoal ? (
                  <button 
                    onClick={() => setIsEditingGoal(false)}
                    className="text-[10px] text-green-600 font-bold hover:underline"
                  >
                    Done
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditingGoal(true)}
                    className="text-[10px] text-slate-400 font-bold hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Meals Target:</span>
                    <span className="text-slate-800">{totalMeals} / {mealsGoal} meals</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (totalMeals / mealsGoal) * 100)}%` }}
                    />
                  </div>
                </div>

                {isEditingGoal && (
                  <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                    <span className="text-[10px] text-slate-500 font-bold">Set Target:</span>
                    <input 
                      type="number" 
                      value={mealsGoal}
                      onChange={(e) => setMealsGoal(Number(e.target.value))}
                      className="w-16 text-center text-xs border border-slate-350 rounded p-1 font-bold"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Achievements Badges */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-green-600 animate-pulse" />
                <span>Earned Achievements</span>
              </h3>
              
              {unlockedBadges.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No achievements unlocked yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {unlockedBadges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <span className="text-xl">{badge.icon}</span>
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-850">{badge.title}</div>
                        <div className="text-[9px] text-slate-500 leading-tight">{badge.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Leaders Board */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-green-600" />
            <span>Community Rescue Leaderboard</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            {/* Top Restaurants */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-2">Top Restaurants</div>
              {leaderboards.restaurants.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-slate-700 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">{item.score} meals</span>
                </div>
              ))}
            </div>

            {/* Top NGOs */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-2">Top NGOs</div>
              {leaderboards.ngos.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-slate-700 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{item.score} pts</span>
                </div>
              ))}
            </div>

            {/* Top Volunteers */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-2">Top Volunteers</div>
              {leaderboards.volunteers.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-slate-700 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{item.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
