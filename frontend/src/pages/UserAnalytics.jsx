import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import api from '../api/axios';
import { 
  User, 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Target,
  Calendar,
  Award,
  Activity,
  BarChart3,
  Mail,
  Phone,
  Building,
  Users,
  ArrowLeft,
  Download,
  FileText,
  Zap
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const UserAnalytics = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { currentTheme, currentColorScheme } = useTheme();
  
  const [userData, setUserData] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all'); // all, week, month, quarter, year
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    productivityScore: 0,
    statusDistribution: [],
    priorityDistribution: [],
    weeklyActivity: [],
    performanceTrend: [],
    tasksByTeam: []
  });

  // Check permissions - only admin, HR, and the user themselves can view
  const hasPermission = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.role === 'hr' ||
    currentUser.id === userId
  );

  useEffect(() => {
    if (!hasPermission) {
      navigate('/dashboard');
      return;
    }
    fetchUserData();
    fetchUserTasks();
  }, [userId, dateRange, hasPermission]);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUserData(response.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      const allTasks = response.data.tasks;
      
      // Filter tasks assigned to this user
      const filteredTasks = allTasks.filter(task => 
        task.assigned_to?.some(assignee => 
          (assignee._id === userId || assignee === userId)
        )
      );

      // Apply date range filter
      const filteredByDate = filterByDateRange(filteredTasks);
      
      setUserTasks(filteredByDate);
      calculateAnalytics(filteredByDate);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      setLoading(false);
    }
  };

  const filterByDateRange = (tasks) => {
    const now = new Date();
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };

    if (dateRange === 'all') return tasks;

    const daysBack = ranges[dateRange];
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.created_at);
      return taskDate >= cutoffDate;
    });
  };

  const calculateAnalytics = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const overdue = tasks.filter(t => {
      const dueDate = new Date(t.due_date);
      const today = new Date();
      return dueDate < today && t.status !== 'done' && t.status !== 'archived';
    }).length;

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    // Calculate average completion time
    const completedTasksWithDates = tasks.filter(t => 
      t.status === 'done' && t.createdAt && t.updatedAt
    );
    const avgCompletionTime = completedTasksWithDates.length > 0
      ? completedTasksWithDates.reduce((sum, task) => {
          const created = new Date(task.createdAt);
          const completed = new Date(task.updatedAt);
          const days = (completed - created) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / completedTasksWithDates.length
      : 0;

    // Calculate productivity score (0-100)
    const onTimeCompletions = tasks.filter(t => {
      if (t.status !== 'done' || !t.due_date) return false;
      const dueDate = new Date(t.due_date);
      const completedDate = new Date(t.updatedAt);
      return completedDate <= dueDate;
    }).length;
    
    const productivityScore = total > 0 
      ? Math.round(
          (completed * 0.4 + onTimeCompletions * 0.4 + (total - overdue) * 0.2) / total * 100
        )
      : 0;

    // Status distribution
    const statusDist = [
      { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#6b7280' },
      { name: 'In Progress', value: inProgress, color: '#a855f7' },
      { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#f59e0b' },
      { name: 'Done', value: completed, color: '#10b981' },
      { name: 'Archived', value: tasks.filter(t => t.status === 'archived').length, color: '#ef4444' }
    ].filter(item => item.value > 0);

    // Priority distribution
    const priorityDist = [
      { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
      { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#f97316' },
      { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length, color: '#ef4444' }
    ].filter(item => item.value > 0);

    // Weekly activity (last 7 days or within date range)
    const weeklyActivity = calculateWeeklyActivity(tasks);

    // Performance trend (completion rate over time)
    const performanceTrend = calculatePerformanceTrend(tasks);

    // Tasks by team
    const tasksByTeam = calculateTasksByTeam(tasks);

    setAnalytics({
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      overdueTasks: overdue,
      completionRate: parseFloat(completionRate),
      averageCompletionTime: avgCompletionTime.toFixed(1),
      productivityScore,
      statusDistribution: statusDist,
      priorityDistribution: priorityDist,
      weeklyActivity,
      performanceTrend,
      tasksByTeam
    });
  };

  const calculateWeeklyActivity = (tasks) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activity = days.map(day => ({ day, completed: 0, created: 0 }));

    tasks.forEach(task => {
      if (task.createdAt) {
        const created = new Date(task.createdAt);
        const dayIndex = created.getDay();
        activity[dayIndex].created++;
      }
      if (task.status === 'done' && task.updatedAt) {
        const updated = new Date(task.updatedAt);
        const dayIndex = updated.getDay();
        activity[dayIndex].completed++;
      }
    });

    return activity;
  };

  const calculatePerformanceTrend = (tasks) => {
    // Group by month
    const monthlyData = {};
    
    tasks.forEach(task => {
      if (task.createdAt) {
        const date = new Date(task.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, completed: 0 };
        }
        
        monthlyData[monthKey].total++;
        if (task.status === 'done') {
          monthlyData[monthKey].completed++;
        }
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      completionRate: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : 0,
      total: data.total,
      completed: data.completed
    })).slice(-6); // Last 6 months
  };

  const calculateTasksByTeam = (tasks) => {
    const teamData = {};
    
    tasks.forEach(task => {
      const teamName = task.team_id?.name || 'No Team';
      if (!teamData[teamName]) {
        teamData[teamName] = 0;
      }
      teamData[teamName]++;
    });

    return Object.entries(teamData).map(([team, count]) => ({
      team,
      count
    }));
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-300',
      hr: 'bg-purple-100 text-purple-800 border-purple-300',
      team_lead: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      member: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[role] || colors.member;
  };

  if (!hasPermission) {
    return null;
  }

  if (loading || !userData) {
    return (
      <div className={`min-h-screen ${currentTheme.background}`}>
        <div className="flex">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
              <p className="text-gray-600 font-medium">Loading user analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <div className="flex">
        <Navbar />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <PageHeader
            title={`User Analytics - ${userData.full_name}`}
            subtitle="Comprehensive performance insights and task statistics"
            icon={User}
            actions={
              <>
                <Link
                  to="/users"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back to Users</span>
                </Link>
                <button
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
                  title="Export Report"
                >
                  <Download className="w-5 h-5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </>
            }
          />

          {/* User Info Card */}
          <div className="card mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl">
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>
                      {userData.full_name}
                    </h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getRoleColor(userData.role)}`}>
                      {userData.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Mail className="w-5 h-5" />
                    <span>{userData.email}</span>
                  </div>
                  
                  {userData.team_id && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Building className="w-5 h-5" />
                      <span>Team: {userData.team_id.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-5 h-5" />
                    <span>Joined: {new Date(userData.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Activity className="w-5 h-5" />
                    <span>Status: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="card mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className={`text-lg font-semibold ${currentTheme.text}`}>Analytics Period</h3>
              <div className="flex gap-2">
                {['all', 'week', 'month', 'quarter', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      dateRange === range
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Tasks */}
            <div className="card border-l-4 border-primary-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Total Tasks
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {analytics.totalTasks}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-xl shadow-lg">
                  <CheckSquare className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="card border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Completion Rate
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {analytics.completionRate}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Productivity Score */}
            <div className="card border-l-4 border-amber-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Productivity Score
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {analytics.productivityScore}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-xl shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className="card border-l-4 border-red-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Overdue Tasks
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {analytics.overdueTasks}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Completion Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.averageCompletionTime} days
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.inProgressTasks}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.completedTasks}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution */}
            <div className="card">
              <h3 className={`text-lg font-semibold ${currentTheme.text} mb-6`}>
                Task Status Distribution
              </h3>
              {analytics.statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>

            {/* Priority Distribution */}
            <div className="card">
              <h3 className={`text-lg font-semibold ${currentTheme.text} mb-6`}>
                Task Priority Distribution
              </h3>
              {analytics.priorityDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.priorityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#a855f7">
                      {analytics.priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Activity */}
            <div className="card">
              <h3 className={`text-lg font-semibold ${currentTheme.text} mb-6`}>
                Weekly Activity
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="created" fill="#a855f7" name="Tasks Created" />
                  <Bar dataKey="completed" fill="#10b981" name="Tasks Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Trend */}
            <div className="card">
              <h3 className={`text-lg font-semibold ${currentTheme.text} mb-6`}>
                Performance Trend (Last 6 Months)
              </h3>
              {analytics.performanceTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      name="Completion Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No trend data available yet
                </div>
              )}
            </div>
          </div>

          {/* Tasks by Team */}
          {analytics.tasksByTeam.length > 0 && (
            <div className="card mb-8">
              <h3 className={`text-lg font-semibold ${currentTheme.text} mb-6`}>
                Tasks by Team
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.tasksByTeam} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="team" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${currentTheme.text}`}>
                Recent Tasks ({userTasks.slice(0, 10).length})
              </h3>
              <Link
                to="/tasks"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-2"
              >
                View All Tasks
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {userTasks.slice(0, 10).map((task) => (
                <div
                  key={task._id}
                  className={`p-4 rounded-lg border-l-4 ${
                    task.status === 'done' ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' :
                    task.status === 'in_progress' ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10' :
                    task.status === 'review' ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' :
                    'border-gray-300 bg-gray-50/50 dark:bg-gray-700/10'
                  } ${currentTheme.hover} transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${currentTheme.text} mb-1`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'done' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                          task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                        {task.due_date && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {userTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No tasks found for this user in the selected period
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
