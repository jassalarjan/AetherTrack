import { create } from 'zustand';

// Project state store
export const useProjectStore = create((set, get) => ({
  // Current project
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),

  // Current view type
  currentView: 'kanban', // kanban, grid, calendar, timeline
  setCurrentView: (view) => set({ currentView: view }),

  // Filters
  filters: {
    status: [],
    priority: [],
    assignees: [],
    labels: [],
    search: ''
  },
  setFilters: (filters) => set({ filters }),
  updateFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  clearFilters: () => set({
    filters: {
      status: [],
      priority: [],
      assignees: [],
      labels: [],
      search: ''
    }
  }),

  // Sorting
  sorting: [],
  setSorting: (sorting) => set({ sorting }),

  // Grouping
  groupBy: null,
  setGroupBy: (field) => set({ groupBy: field }),

  // Selected tasks
  selectedTasks: [],
  setSelectedTasks: (tasks) => set({ selectedTasks: tasks }),
  toggleTaskSelection: (taskId) => set((state) => {
    const isSelected = state.selectedTasks.includes(taskId);
    return {
      selectedTasks: isSelected
        ? state.selectedTasks.filter(id => id !== taskId)
        : [...state.selectedTasks, taskId]
    };
  }),
  clearSelection: () => set({ selectedTasks: [] }),

  // UI state
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Task editor panel
  taskEditorOpen: false,
  taskEditorMode: 'create', // create, edit
  taskEditorData: null,
  openTaskEditor: (mode, data = null) => set({
    taskEditorOpen: true,
    taskEditorMode: mode,
    taskEditorData: data
  }),
  closeTaskEditor: () => set({
    taskEditorOpen: false,
    taskEditorMode: 'create',
    taskEditorData: null
  }),

  // Milestone editor panel
  milestoneEditorOpen: false,
  milestoneEditorMode: 'create',
  milestoneEditorData: null,
  openMilestoneEditor: (mode, data = null) => set({
    milestoneEditorOpen: true,
    milestoneEditorMode: mode,
    milestoneEditorData: data
  }),
  closeMilestoneEditor: () => set({
    milestoneEditorOpen: false,
    milestoneEditorMode: 'create',
    milestoneEditorData: null
  }),

  // Dependency dialog
  dependencyDialogOpen: false,
  dependencyDialogTask: null,
  openDependencyDialog: (task) => set({
    dependencyDialogOpen: true,
    dependencyDialogTask: task
  }),
  closeDependencyDialog: () => set({
    dependencyDialogOpen: false,
    dependencyDialogTask: null
  })
}));

// UI preferences store
export const usePreferencesStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  
  compactMode: false,
  toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
  
  showCompletedTasks: true,
  toggleShowCompletedTasks: () => set((state) => ({ 
    showCompletedTasks: !state.showCompletedTasks 
  })),
  
  // Kanban settings
  kanbanSettings: {
    swimlane: null, // epic, assignee, priority
    wipLimits: {},
    columnOrder: ['todo', 'in_progress', 'review', 'done']
  },
  setKanbanSettings: (settings) => set((state) => ({
    kanbanSettings: { ...state.kanbanSettings, ...settings }
  })),
  
  // Grid settings
  gridSettings: {
    visibleColumns: ['title', 'status', 'priority', 'assignees', 'due_date'],
    columnWidths: {}
  },
  setGridSettings: (settings) => set((state) => ({
    gridSettings: { ...state.gridSettings, ...settings }
  })),
  
  // Calendar settings
  calendarSettings: {
    mode: 'month', // month, week, day
    startDay: 0 // Sunday
  },
  setCalendarSettings: (settings) => set((state) => ({
    calendarSettings: { ...state.calendarSettings, ...settings }
  })),
  
  // Timeline settings
  timelineSettings: {
    zoom: 'week', // day, week, month, quarter
    showDependencies: true,
    showCriticalPath: false
  },
  setTimelineSettings: (settings) => set((state) => ({
    timelineSettings: { ...state.timelineSettings, ...settings }
  }))
}));
