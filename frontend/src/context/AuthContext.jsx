import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { io } from 'socket.io-client';
import notificationService from '../utils/notificationService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Get user's preferred timeout or use default (2 hours)
  const getSessionTimeout = () => {
    const savedTimeout = localStorage.getItem('sessionTimeout');
    return savedTimeout ? parseFloat(savedTimeout) * 60 * 60 * 1000 : 2 * 60 * 60 * 1000;
  };

  // Auto-logout configuration (in milliseconds)
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before logout
  
  let inactivityTimer = null;
  let warningTimer = null;

  useEffect(() => {
    // Check if user is logged in
    console.log('[AuthContext] Initializing - checking for stored user');
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    console.log('[AuthContext] Stored data:', { 
      hasUser: !!storedUser, 
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    });

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      console.log('[AuthContext] User found:', parsedUser);
      setUser(parsedUser);
      initializeSocket(parsedUser.id);
    } else {
      console.log('[AuthContext] No user or token found');
    }
    setLoading(false);
    console.log('[AuthContext] Initialization complete, loading set to false');
  }, []);

  // Set up inactivity detection
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT = getSessionTimeout();

    const resetInactivityTimer = () => {
      // Clear existing timers
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);

      const timeoutHours = INACTIVITY_TIMEOUT / (60 * 60 * 1000);
      const warningMinutes = WARNING_TIME / (60 * 1000);

      // Set warning timer (5 minutes before logout)
      warningTimer = setTimeout(() => {
        const shouldStayLoggedIn = confirm(
          `⚠️ Session Timeout Warning\n\nYou will be logged out in ${warningMinutes} minutes due to inactivity.\n\nClick OK to stay logged in, or Cancel to logout now.`
        );
        
        if (shouldStayLoggedIn) {
          resetInactivityTimer(); // Reset the timer if user wants to stay
        } else {
          handleInactivityLogout();
        }
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Set main logout timer
      inactivityTimer = setTimeout(() => {
        handleInactivityLogout();
      }, INACTIVITY_TIMEOUT);

      // Store last activity time
      localStorage.setItem('lastActivityTime', Date.now().toString());
    };

    const handleInactivityLogout = () => {
      const timeoutHours = INACTIVITY_TIMEOUT / (60 * 60 * 1000);
      alert(
        `🔒 Session Expired\n\nYou have been logged out after ${timeoutHours >= 1 ? `${timeoutHours} hour${timeoutHours !== 1 ? 's' : ''}` : `${timeoutHours * 60} minutes`} of inactivity.`
      );
      logout();
      window.location.href = '/login';
    };

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners for user activity
    events.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Initialize timer
    resetInactivityTimer();

    // Check if session expired while browser was closed
    const lastActivity = localStorage.getItem('lastActivityTime');
    if (lastActivity) {
      const INACTIVITY_TIMEOUT = getSessionTimeout();
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        handleInactivityLogout();
        return;
      }
    }

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
    };
  }, [user]);

  const initializeSocket = (userId) => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(SOCKET_URL);
    
    newSocket.on('connect', () => {
      newSocket.emit('join', userId);
    });

    newSocket.on('disconnect', () => {
      // Socket disconnected
    });

    // Note: Actual notification listeners are set up in useNotifications hook
    // to avoid duplicate event handlers
    
    setSocket(newSocket);
  };

  const login = async (email, password) => {
    try {
      console.log('[AuthContext] Login attempt for:', email);
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;

      console.log('[AuthContext] Login successful, storing user data:', {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        hasToken: !!accessToken
      });

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(user);
      initializeSocket(user.id);

      console.log('[AuthContext] User state set, login complete');
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Login failed:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (full_name, email, password, role = 'member') => {
    try {
      const response = await api.post('/auth/register', {
        full_name,
        email,
        password,
        role,
      });
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(user);
      initializeSocket(user.id);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logout called');
    console.trace('[AuthContext] Logout stack trace');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('lastActivityTime');
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    console.log('[AuthContext] Logout complete');
  };

  const value = {
    user,
    loading,
    socket,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};