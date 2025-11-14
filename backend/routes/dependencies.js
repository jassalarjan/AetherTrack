import express from 'express';
import Dependency from '../models/Dependency.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Middleware to check project access
const checkProjectAccess = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.body.project_id;
      const project = await Project.findById(projectId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      if (!project.hasAccess(req.user.userId, requiredRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      req.project = project;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

// Create dependency
router.post('/projects/:projectId/dependencies', auth, checkProjectAccess('editor'), async (req, res) => {
  try {
    const {
      from_task_id,
      to_task_id,
      type,
      lag
    } = req.body;
    
    if (!from_task_id || !to_task_id) {
      return res.status(400).json({ error: 'from_task_id and to_task_id are required' });
    }
    
    // Verify both tasks exist and belong to the project
    const fromTask = await Task.findById(from_task_id);
    const toTask = await Task.findById(to_task_id);
    
    if (!fromTask || !toTask) {
      return res.status(404).json({ error: 'One or both tasks not found' });
    }
    
    if (fromTask.project_id?.toString() !== req.params.projectId || 
        toTask.project_id?.toString() !== req.params.projectId) {
      return res.status(400).json({ error: 'Tasks must belong to the same project' });
    }
    
    // Check for circular dependency
    const hasCircular = await Dependency.detectCircularDependency(
      req.params.projectId,
      from_task_id,
      to_task_id
    );
    
    if (hasCircular) {
      return res.status(400).json({ 
        error: 'Creating this dependency would create a circular dependency chain' 
      });
    }
    
    const dependency = new Dependency({
      project_id: req.params.projectId,
      from_task_id,
      to_task_id,
      type: type || 'FS',
      lag: lag || 0,
      created_by: req.user.userId
    });
    
    await dependency.save();
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: req.params.projectId,
      actor_user_id: req.user.userId,
      action: 'dependency_added',
      object_type: 'dependency',
      object_id: dependency._id,
      diff: { after: dependency.toObject() }
    });
    
    // Emit socket event
    if (req.io) {
      req.io.to(`project:${req.params.projectId}`).emit('dependency.added', dependency);
    }
    
    res.status(201).json(dependency);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This dependency already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Get all dependencies for a project
router.get('/projects/:projectId/dependencies', auth, checkProjectAccess('viewer'), async (req, res) => {
  try {
    const dependencies = await Dependency.find({ project_id: req.params.projectId })
      .populate('from_task_id', 'title status due_date')
      .populate('to_task_id', 'title status due_date');
    
    res.json(dependencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dependencies for a specific task
router.get('/tasks/:taskId/dependencies', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check project access if task has a project
    if (task.project_id) {
      const project = await Project.findById(task.project_id);
      if (!project.hasAccess(req.user.userId, 'viewer')) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }
    
    const { predecessors, successors } = await Dependency.getTaskDependencies(req.params.taskId);
    
    res.json({ predecessors, successors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dependency graph for visualization
router.get('/projects/:projectId/dependencies/graph', auth, checkProjectAccess('viewer'), async (req, res) => {
  try {
    const dependencies = await Dependency.find({ project_id: req.params.projectId })
      .populate('from_task_id', 'title status type')
      .populate('to_task_id', 'title status type');
    
    const tasks = await Task.find({ project_id: req.params.projectId })
      .select('_id title status type parent_id');
    
    // Format for graph visualization
    const nodes = tasks.map(task => ({
      id: task._id.toString(),
      label: task.title,
      status: task.status,
      type: task.type,
      parent_id: task.parent_id?.toString()
    }));
    
    const edges = dependencies.map(dep => ({
      id: dep._id.toString(),
      from: dep.from_task_id._id.toString(),
      to: dep.to_task_id._id.toString(),
      label: dep.type,
      lag: dep.lag
    }));
    
    res.json({ nodes, edges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update dependency
router.patch('/dependencies/:id', auth, async (req, res) => {
  try {
    const dependency = await Dependency.findById(req.params.id);
    
    if (!dependency) {
      return res.status(404).json({ error: 'Dependency not found' });
    }
    
    // Check project access
    const project = await Project.findById(dependency.project_id);
    if (!project.hasAccess(req.user.userId, 'editor')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const allowedUpdates = ['type', 'lag'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }
    
    const before = dependency.toObject();
    
    updates.forEach(update => dependency[update] = req.body[update]);
    await dependency.save();
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: dependency.project_id,
      actor_user_id: req.user.userId,
      action: 'updated',
      object_type: 'dependency',
      object_id: dependency._id,
      diff: { before, after: dependency.toObject() }
    });
    
    // Emit socket event
    if (req.io) {
      req.io.to(`project:${dependency.project_id}`).emit('dependency.updated', dependency);
    }
    
    res.json(dependency);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete dependency
router.delete('/dependencies/:id', auth, async (req, res) => {
  try {
    const dependency = await Dependency.findById(req.params.id);
    
    if (!dependency) {
      return res.status(404).json({ error: 'Dependency not found' });
    }
    
    // Check project access
    const project = await Project.findById(dependency.project_id);
    if (!project.hasAccess(req.user.userId, 'editor')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: dependency.project_id,
      actor_user_id: req.user.userId,
      action: 'dependency_removed',
      object_type: 'dependency',
      object_id: dependency._id,
      diff: { before: dependency.toObject() }
    });
    
    await dependency.deleteOne();
    
    // Emit socket event
    if (req.io) {
      req.io.to(`project:${dependency.project_id}`).emit('dependency.removed', { id: req.params.id });
    }
    
    res.json({ message: 'Dependency deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate dependency (check for circular dependencies)
router.post('/projects/:projectId/dependencies/validate', auth, checkProjectAccess('viewer'), async (req, res) => {
  try {
    const { from_task_id, to_task_id } = req.body;
    
    if (!from_task_id || !to_task_id) {
      return res.status(400).json({ error: 'from_task_id and to_task_id are required' });
    }
    
    const hasCircular = await Dependency.detectCircularDependency(
      req.params.projectId,
      from_task_id,
      to_task_id
    );
    
    res.json({ 
      valid: !hasCircular,
      has_circular_dependency: hasCircular
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
