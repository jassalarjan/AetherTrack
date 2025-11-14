import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys factory
export const queryKeys = {
  // Projects
  projects: {
    all: ['projects'],
    list: (filters) => ['projects', 'list', filters],
    detail: (id) => ['projects', 'detail', id],
    activity: (id) => ['projects', 'activity', id],
  },
  
  // Tasks
  tasks: {
    all: ['tasks'],
    list: (projectId, filters) => ['tasks', 'list', projectId, filters],
    detail: (id) => ['tasks', 'detail', id],
    hierarchy: (projectId) => ['tasks', 'hierarchy', projectId],
  },
  
  // Milestones
  milestones: {
    all: ['milestones'],
    list: (projectId) => ['milestones', 'list', projectId],
    detail: (id) => ['milestones', 'detail', id],
  },
  
  // Dependencies
  dependencies: {
    all: ['dependencies'],
    list: (projectId) => ['dependencies', 'list', projectId],
    graph: (projectId) => ['dependencies', 'graph', projectId],
    task: (taskId) => ['dependencies', 'task', taskId],
  },
  
  // Schedule
  schedule: {
    criticalPath: (projectId) => ['schedule', 'critical-path', projectId],
    preview: (projectId) => ['schedule', 'preview', projectId],
  },
  
  // Saved Views
  views: {
    all: ['views'],
    list: (projectId) => ['views', 'list', projectId],
    detail: (id) => ['views', 'detail', id],
  },
};
