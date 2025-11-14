import Dependency from '../models/Dependency.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

class SchedulerService {
  /**
   * Calculate Critical Path Method (CPM) for a project
   * Returns critical path, early/late start/finish times, and float for all tasks
   */
  async calculateCriticalPath(projectId) {
    try {
      // Get all tasks and dependencies
      const tasks = await Task.find({ project_id: projectId });
      const dependencies = await Dependency.find({ project_id: projectId });
      
      if (tasks.length === 0) {
        return { criticalPath: [], taskSchedules: {} };
      }
      
      // Build task map and dependency graph
      const taskMap = new Map();
      tasks.forEach(task => {
        const duration = this.calculateDuration(task);
        taskMap.set(task._id.toString(), {
          id: task._id.toString(),
          title: task.title,
          duration,
          es: 0, // Earliest Start
          ef: 0, // Earliest Finish
          ls: 0, // Latest Start
          lf: 0, // Latest Finish
          float: 0,
          predecessors: [],
          successors: []
        });
      });
      
      // Build dependency relationships
      dependencies.forEach(dep => {
        const fromId = dep.from_task_id.toString();
        const toId = dep.to_task_id.toString();
        
        if (taskMap.has(fromId) && taskMap.has(toId)) {
          taskMap.get(toId).predecessors.push({
            id: fromId,
            type: dep.type,
            lag: dep.lag || 0
          });
          taskMap.get(fromId).successors.push({
            id: toId,
            type: dep.type,
            lag: dep.lag || 0
          });
        }
      });
      
      // Forward pass: Calculate ES and EF
      const sorted = this.topologicalSort(taskMap);
      
      sorted.forEach(taskId => {
        const task = taskMap.get(taskId);
        
        if (task.predecessors.length === 0) {
          task.es = 0;
        } else {
          task.es = Math.max(...task.predecessors.map(pred => {
            const predTask = taskMap.get(pred.id);
            return this.calculateDependentStart(predTask, pred.type, pred.lag);
          }));
        }
        
        task.ef = task.es + task.duration;
      });
      
      // Find project end time
      const projectEnd = Math.max(...Array.from(taskMap.values()).map(t => t.ef));
      
      // Backward pass: Calculate LS and LF
      const reverseSorted = [...sorted].reverse();
      
      reverseSorted.forEach(taskId => {
        const task = taskMap.get(taskId);
        
        if (task.successors.length === 0) {
          task.lf = projectEnd;
        } else {
          task.lf = Math.min(...task.successors.map(succ => {
            const succTask = taskMap.get(succ.id);
            return this.calculateDependentFinish(succTask, succ.type, succ.lag);
          }));
        }
        
        task.ls = task.lf - task.duration;
        task.float = task.ls - task.es; // Total float
      });
      
      // Identify critical path (tasks with zero float)
      const criticalTasks = Array.from(taskMap.values())
        .filter(t => t.float === 0)
        .map(t => t.id);
      
      // Build critical path chain
      const criticalPath = this.buildCriticalPathChain(taskMap, criticalTasks);
      
      // Convert to response format
      const taskSchedules = {};
      taskMap.forEach((value, key) => {
        taskSchedules[key] = {
          task_id: value.id,
          title: value.title,
          duration: value.duration,
          earliest_start: value.es,
          earliest_finish: value.ef,
          latest_start: value.ls,
          latest_finish: value.lf,
          float: value.float,
          is_critical: value.float === 0
        };
      });
      
      return {
        criticalPath,
        taskSchedules,
        projectDuration: projectEnd,
        totalTasks: tasks.length,
        criticalTasksCount: criticalTasks.length
      };
    } catch (error) {
      console.error('Error calculating critical path:', error);
      throw error;
    }
  }
  
  /**
   * Calculate task duration in days
   */
  calculateDuration(task) {
    if (task.estimate_hours) {
      return Math.ceil(task.estimate_hours / 8); // Convert hours to days
    }
    
    if (task.start_date && task.due_date) {
      const start = new Date(task.start_date);
      const end = new Date(task.due_date);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Default to 1 day if no duration info available
    return 1;
  }
  
  /**
   * Calculate when a dependent task can start based on dependency type
   */
  calculateDependentStart(predecessorTask, depType, lag) {
    switch (depType) {
      case 'FS': // Finish-to-Start
        return predecessorTask.ef + lag;
      case 'SS': // Start-to-Start
        return predecessorTask.es + lag;
      case 'FF': // Finish-to-Finish (affects finish, not start)
        return predecessorTask.ef - predecessorTask.duration + lag;
      case 'SF': // Start-to-Finish
        return predecessorTask.es - predecessorTask.duration + lag;
      default:
        return predecessorTask.ef + lag;
    }
  }
  
  /**
   * Calculate when a dependent task must finish based on dependency type
   */
  calculateDependentFinish(successorTask, depType, lag) {
    switch (depType) {
      case 'FS': // Finish-to-Start
        return successorTask.ls - lag;
      case 'SS': // Start-to-Start
        return successorTask.ls + successorTask.duration - lag;
      case 'FF': // Finish-to-Finish
        return successorTask.lf - lag;
      case 'SF': // Start-to-Finish
        return successorTask.lf - successorTask.duration - lag;
      default:
        return successorTask.ls - lag;
    }
  }
  
  /**
   * Topological sort using Kahn's algorithm
   */
  topologicalSort(taskMap) {
    const sorted = [];
    const inDegree = new Map();
    
    // Calculate in-degrees
    taskMap.forEach((task, id) => {
      inDegree.set(id, task.predecessors.length);
    });
    
    // Find all nodes with no incoming edges
    const queue = [];
    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });
    
    while (queue.length > 0) {
      const taskId = queue.shift();
      sorted.push(taskId);
      
      const task = taskMap.get(taskId);
      task.successors.forEach(succ => {
        const newDegree = inDegree.get(succ.id) - 1;
        inDegree.set(succ.id, newDegree);
        if (newDegree === 0) {
          queue.push(succ.id);
        }
      });
    }
    
    return sorted;
  }
  
  /**
   * Build the critical path chain from critical tasks
   */
  buildCriticalPathChain(taskMap, criticalTaskIds) {
    if (criticalTaskIds.length === 0) return [];
    
    // Find starting task (no predecessors or all predecessors not critical)
    const criticalSet = new Set(criticalTaskIds);
    const startTasks = criticalTaskIds.filter(id => {
      const task = taskMap.get(id);
      return task.predecessors.length === 0 || 
             !task.predecessors.some(pred => criticalSet.has(pred.id));
    });
    
    if (startTasks.length === 0) return criticalTaskIds;
    
    // Build chain from start
    const chain = [];
    const visited = new Set();
    
    const buildChain = (taskId) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);
      chain.push(taskId);
      
      const task = taskMap.get(taskId);
      const criticalSuccessor = task.successors.find(succ => criticalSet.has(succ.id));
      
      if (criticalSuccessor) {
        buildChain(criticalSuccessor.id);
      }
    };
    
    buildChain(startTasks[0]);
    return chain;
  }
  
  /**
   * Auto-schedule tasks based on dependencies
   * Returns preview of date changes
   */
  async autoSchedule(projectId, options = {}) {
    try {
      const { start_date = new Date() } = options;
      
      const cpmResult = await this.calculateCriticalPath(projectId);
      const tasks = await Task.find({ project_id: projectId });
      
      const updates = [];
      
      tasks.forEach(task => {
        const schedule = cpmResult.taskSchedules[task._id.toString()];
        
        if (schedule) {
          const newStartDate = new Date(start_date);
          newStartDate.setDate(newStartDate.getDate() + schedule.earliest_start);
          
          const newDueDate = new Date(start_date);
          newDueDate.setDate(newDueDate.getDate() + schedule.earliest_finish);
          
          updates.push({
            task_id: task._id,
            title: task.title,
            current_start_date: task.start_date,
            current_due_date: task.due_date,
            new_start_date: newStartDate,
            new_due_date: newDueDate,
            is_critical: schedule.is_critical,
            float: schedule.float
          });
        }
      });
      
      return {
        project_id: projectId,
        base_start_date: start_date,
        total_updates: updates.length,
        updates,
        critical_path: cpmResult.criticalPath,
        project_duration: cpmResult.projectDuration
      };
    } catch (error) {
      console.error('Error in auto-schedule:', error);
      throw error;
    }
  }
  
  /**
   * Apply auto-schedule updates to tasks
   */
  async applySchedule(projectId, updates) {
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.task_id },
        update: {
          start_date: update.new_start_date,
          due_date: update.new_due_date
        }
      }
    }));
    
    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }
    
    return { applied: bulkOps.length };
  }
}

export default new SchedulerService();
