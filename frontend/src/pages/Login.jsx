import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle, 
  Users, 
  BarChart3, 
  Calendar, 
  Zap, 
  Shield, 
  Sparkles,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: CheckCircle,
      title: "Task Management",
      description: "Organize and track all your tasks in one unified platform"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work seamlessly with your team in real-time"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Gain insights with powerful reporting and dashboards"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Never miss a deadline with intelligent reminders"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Left Side - Information Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo and Brand */}
          <div className="animate-fade-in-down">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 backdrop-blur-lg p-3 rounded-2xl border border-white/30 shadow-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">AetherTrack</h1>
                <p className="text-blue-100 text-sm mt-1">Elevate Your Productivity</p>
              </div>
            </div>

            <div className="space-y-3 mt-12">
              <h2 className="text-5xl font-bold leading-tight">
                Welcome to the
                <br />
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Future of Work
                </span>
              </h2>
              <p className="text-xl text-blue-100 max-w-md">
                Streamline workflows, boost collaboration, and achieve more with intelligent task management.
              </p>
            </div>
          </div>

          {/* Animated Feature Showcase */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-105">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className={`transition-all duration-700 ${
                      currentFeature === index 
                        ? 'opacity-100 transform translate-y-0' 
                        : 'opacity-0 absolute transform -translate-y-4'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-blue-100">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature indicators */}
            <div className="flex gap-2 justify-center">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentFeature === index 
                      ? 'w-8 bg-white' 
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Feature ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-6 animate-fade-in-up">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <p className="text-3xl font-bold">98%</p>
              </div>
              <p className="text-blue-200 text-sm">Productivity Boost</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <p className="text-3xl font-bold">10k+</p>
              </div>
              <p className="text-blue-200 text-sm">Active Users</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <p className="text-3xl font-bold">99.9%</p>
              </div>
              <p className="text-blue-200 text-sm">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 relative overflow-hidden">
        {/* Subtle animated background for mobile */}
        <div className="absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in-down">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-2xl shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AetherTrack
            </h1>
            <p className="text-gray-600 mt-1">Sign in to continue</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100 animate-fade-in-up">
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white outline-none"
                    placeholder="you@example.com"
                    required
                    data-testid="login-email"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <Zap className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white outline-none"
                    placeholder="••••••••"
                    required
                    data-testid="login-password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3 animate-shake" data-testid="login-error">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed relative overflow-hidden group"
                data-testid="login-submit"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <Zap className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Need an account?</span>
                </div>
              </div>

              <p className="text-center text-gray-600 text-sm">
                Contact your{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors inline-flex items-center gap-1">
                  Administrator
                  <Clock className="w-3 h-3" />
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Collaborative</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Efficient</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;