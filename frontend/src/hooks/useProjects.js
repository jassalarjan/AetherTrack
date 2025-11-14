import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, milestoneApi, dependencyApi, schedulerApi, taskApi } from '../lib/api';
import { queryKeys } from '../lib/queryClient';

// Project hooks
export function useProjects(filters = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => projectApi.getAll(filters),
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
  });
}

export function useProjectActivity(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.projects.activity(id),
    queryFn: () => projectApi.getActivity(id, options),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => projectApi.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectApi.archive,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

// Milestone hooks
export function useMilestones(projectId, filters = {}) {
  return useQuery({
    queryKey: queryKeys.milestones.list(projectId),
    queryFn: () => milestoneApi.getAll(projectId, filters),
    enabled: !!projectId,
  });
}

export function useMilestone(id) {
  return useQuery({
    queryKey: queryKeys.milestones.detail(id),
    queryFn: () => milestoneApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }) => milestoneApi.create(projectId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.list(variables.projectId) });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => milestoneApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.list(data.project_id) });
    },
  });
}

export function useLinkTasksToMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, taskIds }) => milestoneApi.linkTasks(id, taskIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.list(data.project_id) });
    },
  });
}

// Dependency hooks
export function useDependencies(projectId) {
  return useQuery({
    queryKey: queryKeys.dependencies.list(projectId),
    queryFn: () => dependencyApi.getAll(projectId),
    enabled: !!projectId,
  });
}

export function useDependencyGraph(projectId) {
  return useQuery({
    queryKey: queryKeys.dependencies.graph(projectId),
    queryFn: () => dependencyApi.getGraph(projectId),
    enabled: !!projectId,
  });
}

export function useTaskDependencies(taskId) {
  return useQuery({
    queryKey: queryKeys.dependencies.task(taskId),
    queryFn: () => dependencyApi.getForTask(taskId),
    enabled: !!taskId,
  });
}

export function useCreateDependency() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }) => dependencyApi.create(projectId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dependencies.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dependencies.graph(variables.projectId) });
    },
  });
}

export function useDeleteDependency() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dependencyApi.delete,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dependencies.all });
    },
  });
}

export function useValidateDependency() {
  return useMutation({
    mutationFn: ({ projectId, fromTaskId, toTaskId }) => 
      dependencyApi.validate(projectId, fromTaskId, toTaskId),
  });
}

// Scheduler hooks
export function useCriticalPath(projectId) {
  return useQuery({
    queryKey: queryKeys.schedule.criticalPath(projectId),
    queryFn: () => schedulerApi.getCriticalPath(projectId),
    enabled: !!projectId,
  });
}

export function useComputeSchedule() {
  return useMutation({
    mutationFn: ({ projectId, startDate }) => 
      schedulerApi.computeSchedule(projectId, startDate),
  });
}

export function useApplySchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, updates }) => 
      schedulerApi.applySchedule(projectId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule.criticalPath(variables.projectId) });
    },
  });
}

// Task hooks for projects
export function useProjectTasks(projectId, filters = {}) {
  return useQuery({
    queryKey: queryKeys.tasks.list(projectId, filters),
    queryFn: () => taskApi.getAll(projectId, filters),
    enabled: !!projectId,
  });
}

export function useTaskHierarchy(projectId) {
  return useQuery({
    queryKey: queryKeys.tasks.hierarchy(projectId),
    queryFn: () => taskApi.getHierarchy(projectId),
    enabled: !!projectId,
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, newParentId, position }) => 
      taskApi.move(taskId, newParentId, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useBulkUpdateTasks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskApi.bulkUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
