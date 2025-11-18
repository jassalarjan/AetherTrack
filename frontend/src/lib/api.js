import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  console.log('[API] Request:', config.method?.toUpperCase(), config.url, {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : null,
    headers: config.headers
  });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.config.method?.toUpperCase(), response.config.url, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[API] Error:', error.config?.method?.toUpperCase(), error.config?.url, {
      status: error.response?.status,
      message: error.response?.data?.message,
      error: error.message
    });
    
    if (error.response?.status === 401) {
      // Only redirect if it's not a token issue during initial load
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token || error.response?.data?.message?.includes('Invalid') || error.response?.data?.message?.includes('expired')) {
        console.error('[API] 🚨 Authentication failed, redirecting to login:', error.response?.data?.message);
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } else {
        console.warn('[API] ⚠️ 401 error but token exists, not redirecting:', error.response?.data);
      }
    }
    return Promise.reject(error);
  }
);

// Project API
export const projectApi = {
  // Get all projects
  getAll: async (filters = {}) => {
    console.log('[projectApi.getAll] Called with filters:', filters);
    try {
      const { data } = await api.get('/projects', { params: filters });
      console.log('[projectApi.getAll] Response received:', data?.length, 'projects');
      return data;
    } catch (error) {
      console.error('[projectApi.getAll] Request failed:', error.response?.status, error.message);
      throw error;
    }
  },

  // Get single project
  getById: async (id) => {
    console.log('[projectApi.getById] Called with id:', id);
    try {
      const { data } = await api.get(`/projects/${id}`);
      console.log('[projectApi.getById] Response received:', data?._id);
      return data;
    } catch (error) {
      console.error('[projectApi.getById] Request failed:', error.response?.status, error.message);
      throw error;
    }
  },

  // Create project
  create: async (projectData) => {
    const { data } = await api.post('/projects', projectData);
    return data;
  },

  // Update project
  update: async (id, updates) => {
    const { data } = await api.patch(`/projects/${id}`, updates);
    return data;
  },

  // Archive project
  archive: async (id) => {
    const { data } = await api.post(`/projects/${id}/archive`);
    return data;
  },

  // Delete project
  delete: async (id) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },

  // Add team member
  addTeamMember: async (id, memberData) => {
    const { data } = await api.post(`/projects/${id}/roles`, memberData);
    return data;
  },

  // Remove team member
  removeTeamMember: async (id, userId) => {
    const { data } = await api.delete(`/projects/${id}/roles/${userId}`);
    return data;
  },

  // Get activity timeline
  getActivity: async (id, options = {}) => {
    const { data } = await api.get(`/projects/${id}/activity`, { params: options });
    return data;
  },
};

// Milestone API
export const milestoneApi = {
  // Get all milestones for a project
  getAll: async (projectId, filters = {}) => {
    const { data } = await api.get(`/projects/${projectId}/milestones`, { params: filters });
    return data;
  },

  // Get single milestone
  getById: async (id) => {
    const { data } = await api.get(`/milestones/${id}`);
    return data;
  },

  // Create milestone
  create: async (projectId, milestoneData) => {
    const { data } = await api.post(`/projects/${projectId}/milestones`, milestoneData);
    return data;
  },

  // Update milestone
  update: async (id, updates) => {
    const { data } = await api.patch(`/milestones/${id}`, updates);
    return data;
  },

  // Link tasks to milestone
  linkTasks: async (id, taskIds) => {
    const { data } = await api.post(`/milestones/${id}/link`, { task_ids: taskIds });
    return data;
  },

  // Unlink tasks from milestone
  unlinkTasks: async (id, taskIds) => {
    const { data } = await api.post(`/milestones/${id}/unlink`, { task_ids: taskIds });
    return data;
  },

  // Recalculate progress
  recalculateProgress: async (id) => {
    const { data } = await api.post(`/milestones/${id}/recalculate`);
    return data;
  },

  // Delete milestone
  delete: async (id) => {
    const { data } = await api.delete(`/milestones/${id}`);
    return data;
  },
};

// Dependency API
export const dependencyApi = {
  // Get all dependencies for a project
  getAll: async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/dependencies`);
    return data;
  },

  // Get dependency graph
  getGraph: async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/dependencies/graph`);
    return data;
  },

  // Get dependencies for a task
  getForTask: async (taskId) => {
    const { data } = await api.get(`/tasks/${taskId}/dependencies`);
    return data;
  },

  // Create dependency
  create: async (projectId, dependencyData) => {
    const { data } = await api.post(`/projects/${projectId}/dependencies`, dependencyData);
    return data;
  },

  // Update dependency
  update: async (id, updates) => {
    const { data } = await api.patch(`/dependencies/${id}`, updates);
    return data;
  },

  // Validate dependency (check for circular)
  validate: async (projectId, fromTaskId, toTaskId) => {
    const { data } = await api.post(`/projects/${projectId}/dependencies/validate`, {
      from_task_id: fromTaskId,
      to_task_id: toTaskId,
    });
    return data;
  },

  // Delete dependency
  delete: async (id) => {
    const { data } = await api.delete(`/dependencies/${id}`);
    return data;
  },
};

// Scheduler API
export const schedulerApi = {
  // Get critical path
  getCriticalPath: async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/schedule/critical-path`);
    return data;
  },

  // Compute auto-schedule preview
  computeSchedule: async (projectId, startDate) => {
    const { data } = await api.post(`/projects/${projectId}/schedule/compute`, {
      start_date: startDate,
    });
    return data;
  },

  // Apply schedule
  applySchedule: async (projectId, updates) => {
    const { data } = await api.post(`/projects/${projectId}/schedule/apply`, {
      updates,
    });
    return data;
  },
};

// Task API extensions for projects
export const taskApi = {
  // Get all tasks for a project
  getAll: async (projectId, filters = {}) => {
    const { data } = await api.get('/tasks', { 
      params: { project_id: projectId, ...filters } 
    });
    // Backend returns { tasks: [], count: number }
    return data.tasks || data;
  },

  // Get task hierarchy
  getHierarchy: async (projectId) => {
    const { data } = await api.get('/tasks', {
      params: { project_id: projectId, include_hierarchy: true }
    });
    // Backend returns { tasks: [], count: number }
    return data.tasks || data;
  },

  // Create task
  create: async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    return data;
  },

  // Update task
  update: async (id, updates) => {
    const { data } = await api.put(`/tasks/${id}`, updates);
    return data;
  },

  // Delete task
  delete: async (id) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },

  // Move task (reparent)
  move: async (taskId, newParentId, position) => {
    const { data } = await api.post(`/tasks/${taskId}/move`, {
      parent_id: newParentId,
      position,
    });
    return data;
  },

  // Bulk update tasks
  bulkUpdate: async (updates) => {
    const { data } = await api.post('/tasks/bulk', { updates });
    return data;
  },
};

export default api;
