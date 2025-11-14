import mongoose from 'mongoose';

const dependencySchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  from_task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  to_task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  type: {
    type: String,
    enum: ['FS', 'SS', 'FF', 'SF'], // Finish-Start, Start-Start, Finish-Finish, Start-Finish
    default: 'FS'
  },
  lag: {
    type: Number, // in days
    default: 0
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
dependencySchema.index({ project_id: 1 });
dependencySchema.index({ from_task_id: 1 });
dependencySchema.index({ to_task_id: 1 });
dependencySchema.index({ from_task_id: 1, to_task_id: 1 }, { unique: true });

// Validation: prevent self-dependencies
dependencySchema.pre('save', function(next) {
  if (this.from_task_id.toString() === this.to_task_id.toString()) {
    next(new Error('Task cannot depend on itself'));
  } else {
    next();
  }
});

// Static method to detect circular dependencies
dependencySchema.statics.detectCircularDependency = async function(projectId, fromTaskId, toTaskId) {
  // Build dependency graph
  const dependencies = await this.find({ project_id: projectId });
  
  const graph = new Map();
  dependencies.forEach(dep => {
    const from = dep.from_task_id.toString();
    const to = dep.to_task_id.toString();
    
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from).push(to);
  });
  
  // Add the proposed new dependency
  const fromStr = fromTaskId.toString();
  const toStr = toTaskId.toString();
  if (!graph.has(fromStr)) graph.set(fromStr, []);
  graph.get(fromStr).push(toStr);
  
  // DFS to detect cycles
  const visited = new Set();
  const recStack = new Set();
  
  const hasCycle = (node) => {
    visited.add(node);
    recStack.add(node);
    
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true;
      }
    }
    
    recStack.delete(node);
    return false;
  };
  
  // Check from the new dependency's starting point
  return hasCycle(toStr);
};

// Static method to get all dependencies for a task
dependencySchema.statics.getTaskDependencies = async function(taskId) {
  const predecessors = await this.find({ to_task_id: taskId }).populate('from_task_id');
  const successors = await this.find({ from_task_id: taskId }).populate('to_task_id');
  
  return { predecessors, successors };
};

export default mongoose.model('Dependency', dependencySchema);
