import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  User,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Activity,
  Send,
  Filter,
  Search,
  UserCheck,
  UserX,
  Coffee,
  Briefcase,
  Download,
  RefreshCw
} from 'lucide-react';

// Helper function to format date
const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  if (formatStr === 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`;
  }
  
  // Format: MMMM dd, yyyy
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[d.getMonth()]} ${day}, ${year}`;
};

const UserAnalyticsOverview = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailModal, setEmailModal] = useState(false);
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'));

  // Attendance status options
  const attendanceStatuses = [
    { value: 'present', label: 'Present', icon: UserCheck, color: 'emerald', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { value: 'absent', label: 'Absent', icon: UserX, color: 'red', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    { value: 'on_leave', label: 'On Leave', icon: Coffee, color: 'amber', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
    { value: 'remote', label: 'Remote', icon: Briefcase, color: 'blue', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { value: 'half_day', label: 'Half Day', icon: Clock, color: 'purple', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, tasksRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/tasks')
      ]);

      // Handle both array and object responses
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.users || []);
      const tasksData = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data.tasks || tasksRes.data);

      setUsers(usersData);
      setTasks(tasksData);
      
      // Try to fetch attendance data, but don't fail if endpoint doesn't exist yet
      try {
        const attendanceRes = await axios.get('/users/attendance/overview');
        setAttendanceData(attendanceRes.data || {});
      } catch (err) {
        console.log('Attendance endpoint not available yet');
        setAttendanceData({});
      }
      
      calculateUserStats(usersData, tasksData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setUsers([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserStats = (usersData, tasksData) => {
    const stats = {};

    // Ensure usersData is an array
    if (!Array.isArray(usersData) || !Array.isArray(tasksData)) {
      console.error('Invalid data format:', { usersData, tasksData });
      return;
    }

    usersData.forEach(user => {
      const userTasks = tasksData.filter(task => 
        task.assignedTo?._id === user._id || task.assignedTo === user._id
      );

      const completedTasks = userTasks.filter(task => task.status === 'completed');
      const inProgressTasks = userTasks.filter(task => task.status === 'in-progress');
      const todoTasks = userTasks.filter(task => task.status === 'todo');
      const overdueTasks = userTasks.filter(task => 
        task.status !== 'completed' && new Date(task.dueDate) < new Date()
      );

      const completionRate = userTasks.length > 0 
        ? ((completedTasks.length / userTasks.length) * 100).toFixed(1)
        : 0;

      // Calculate productivity score
      const onTimeTasks = completedTasks.filter(task => 
        new Date(task.updatedAt) <= new Date(task.dueDate)
      ).length;

      const productivityScore = userTasks.length > 0
        ? (
            (completedTasks.length * 0.4 + 
             onTimeTasks * 0.4 + 
             (userTasks.length - overdueTasks.length) * 0.2) / 
            userTasks.length * 100
          ).toFixed(1)
        : 0;

      // Calculate average completion time
      const completedWithDates = completedTasks.filter(task => task.createdAt && task.updatedAt);
      const avgCompletionTime = completedWithDates.length > 0
        ? completedWithDates.reduce((sum, task) => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.updatedAt);
            return sum + (completed - created) / (1000 * 60 * 60 * 24); // days
          }, 0) / completedWithDates.length
        : 0;

      stats[user._id] = {
        totalTasks: userTasks.length,
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        todo: todoTasks.length,
        overdue: overdueTasks.length,
        completionRate: parseFloat(completionRate),
        productivityScore: parseFloat(productivityScore),
        avgCompletionTime: avgCompletionTime.toFixed(1),
        highPriorityTasks: userTasks.filter(t => t.priority === 'high').length,
        mediumPriorityTasks: userTasks.filter(t => t.priority === 'medium').length,
        lowPriorityTasks: userTasks.filter(t => t.priority === 'low').length,
      };
    });

    setUserStats(stats);
  };

  const handleSendEmail = async () => {
    if (!selectedUser || !emailSubject || !emailMessage) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSendingEmail(true);
      await axios.post('/users/send-reminder', {
        userId: selectedUser._id,
        subject: emailSubject,
        message: emailMessage,
      });
      alert('Email sent successfully!');
      setEmailModal(false);
      setEmailSubject('');
      setEmailMessage('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleUpdateAttendance = async (userId, status) => {
    try {
      await axios.post('/users/attendance/mark', {
        userId,
        date: selectedDate,
        status,
      });
      
      // Update local state
      setAttendanceData(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [selectedDate]: status
        }
      }));
      
      alert('Attendance updated successfully!');
      setAttendanceModal(false);
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

  const getUserAttendanceStatus = (userId, date = selectedDate) => {
    return attendanceData[userId]?.[date] || 'not_marked';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      const stats = userStats[user._id];
      if (filterStatus === 'active' && stats?.inProgress === 0) matchesStatus = false;
      if (filterStatus === 'inactive' && stats?.inProgress > 0) matchesStatus = false;
      if (filterStatus === 'overdue' && stats?.overdue === 0) matchesStatus = false;
    }
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openEmailModal = (user) => {
    setSelectedUser(user);
    setEmailSubject('Task Reminder');
    setEmailMessage(`Dear ${user.name},\n\nThis is a reminder regarding your pending tasks.\n\nBest regards,\nAetherTrack Team`);
    setEmailModal(true);
  };

  const openAttendanceModal = (user) => {
    setSelectedUser(user);
    setAttendanceModal(true);
  };

  const getProductivityColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const exportReport = () => {
    const csvData = filteredUsers.map(user => {
      const stats = userStats[user._id] || {};
      const attendance = getUserAttendanceStatus(user._id);
      return {
        Name: user.name,
        Email: user.email,
        Role: user.role,
        'Total Tasks': stats.totalTasks || 0,
        'Completed': stats.completed || 0,
        'In Progress': stats.inProgress || 0,
        'Overdue': stats.overdue || 0,
        'Completion Rate': `${stats.completionRate || 0}%`,
        'Productivity Score': stats.productivityScore || 0,
        'Attendance': attendance,
      };
    });

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-analytics-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Navbar>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              User Analytics Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor team performance, attendance, and send reminders
            </p>
          </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-purple-100 dark:border-purple-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-purple-600">{users.length}</p>
            </div>
            <User className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-emerald-100 dark:border-emerald-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Active Users</p>
              <p className="text-3xl font-bold text-emerald-600">
                {Object.values(userStats).filter(s => s.inProgress > 0).length}
              </p>
            </div>
            <Activity className="w-12 h-12 text-emerald-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-amber-100 dark:border-amber-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Present Today</p>
              <p className="text-3xl font-bold text-amber-600">
                {Object.entries(attendanceData).filter(([_, dates]) => 
                  dates[selectedDate] === 'present'
                ).length}
              </p>
            </div>
            <UserCheck className="w-12 h-12 text-amber-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-red-100 dark:border-red-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Users with Overdue</p>
              <p className="text-3xl font-bold text-red-600">
                {Object.values(userStats).filter(s => s.overdue > 0).length}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="team_lead">Team Lead</option>
            <option value="member">Member</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active (Has Tasks)</option>
            <option value="inactive">Inactive (No Tasks)</option>
            <option value="overdue">Has Overdue Tasks</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map(user => {
          const stats = userStats[user._id] || {};
          const attendanceStatus = getUserAttendanceStatus(user._id);
          const statusConfig = attendanceStatuses.find(s => s.value === attendanceStatus);

          return (
            <div key={user._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              {/* User Header */}
              <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-purple-100 text-sm">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-white/20 rounded text-xs">
                        {user.role?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Status */}
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Attendance</span>
                  </div>
                  {statusConfig ? (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                      <statusConfig.icon className={`w-4 h-4 text-${statusConfig.color}-600`} />
                      <span className={`text-sm font-medium text-${statusConfig.color}-700 dark:text-${statusConfig.color}-400`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Not Marked</span>
                  )}
                </div>
              </div>

              {/* Task Statistics */}
              <div className="p-6 space-y-4">
                {/* Productivity Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Productivity Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-600"
                        style={{ width: `${stats.productivityScore || 0}%` }}
                      />
                    </div>
                    <span className={`font-bold text-lg ${getProductivityColor(stats.productivityScore || 0)}`}>
                      {stats.productivityScore || 0}
                    </span>
                  </div>
                </div>

                {/* Task Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalTasks || 0}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.completed || 0}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress || 0}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{stats.overdue || 0}</p>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="font-semibold text-purple-600">{stats.completionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg. Completion Time</span>
                    <span className="font-semibold text-purple-600">{stats.avgCompletionTime || 0} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">High Priority Tasks</span>
                    <span className="font-semibold text-red-600">{stats.highPriorityTasks || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => openEmailModal(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Send Reminder
                </button>
                <button
                  onClick={() => openAttendanceModal(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  Mark Attendance
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Send Email Reminder
                </h2>
                <button
                  onClick={() => setEmailModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                To: {selectedUser?.name} ({selectedUser?.email})
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your message"
                />
              </div>

              {/* Quick Templates */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Templates:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEmailSubject('Task Reminder');
                      setEmailMessage(`Dear ${selectedUser?.name},\n\nThis is a reminder regarding your pending tasks. Please review and update their status.\n\nBest regards,\nAetherTrack Team`);
                    }}
                    className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50"
                  >
                    Task Reminder
                  </button>
                  <button
                    onClick={() => {
                      setEmailSubject('Overdue Tasks Alert');
                      setEmailMessage(`Dear ${selectedUser?.name},\n\nYou have overdue tasks that require immediate attention. Please prioritize and complete them as soon as possible.\n\nBest regards,\nAetherTrack Team`);
                    }}
                    className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    Overdue Alert
                  </button>
                  <button
                    onClick={() => {
                      setEmailSubject('Performance Review');
                      setEmailMessage(`Dear ${selectedUser?.name},\n\nGreat work on your recent tasks! Keep up the excellent performance.\n\nBest regards,\nAetherTrack Team`);
                    }}
                    className="px-3 py-1 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                  >
                    Appreciation
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setEmailModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {attendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Mark Attendance
                </h2>
                <button
                  onClick={() => setAttendanceModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {selectedUser?.name} - {formatDate(new Date(selectedDate), 'MMMM dd, yyyy')}
              </p>
            </div>

            <div className="p-6 space-y-3">
              {attendanceStatuses.map(status => (
                <button
                  key={status.value}
                  onClick={() => handleUpdateAttendance(selectedUser._id, status.value)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    getUserAttendanceStatus(selectedUser._id) === status.value
                      ? `border-${status.color}-600 ${status.bgColor}`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <status.icon className={`w-6 h-6 text-${status.color}-600`} />
                  <span className="font-medium text-gray-900 dark:text-white">{status.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setAttendanceModal(false)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Navbar>
  );
};

export default UserAnalyticsOverview;
