import express from 'express';
import Milestone from '../models/Milestone.js';
import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';
import { authenticate } from '../middleware/auth.js';

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
      
      if (!project.hasAccess(req.user._id, requiredRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      req.project = project;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

// Create milestone
router.post('/projects/:projectId/milestones', authenticate, checkProjectAccess('editor'), async (req, res) => {
  try {
    const {
      title,
      description,
      start_date,
      end_date,
      linked_task_ids
    } = req.body;
    
    const milestone = new Milestone({
      project_id: req.params.projectId,
      title,
      description,
      start_date,
      end_date,
      linked_task_ids: linked_task_ids || [],
      created_by: req.user._id
    });
    
    await milestone.save();
    
    // Calculate initial progress
    if (milestone.linked_task_ids.length > 0) {
      await milestone.calculateProgress();
      await milestone.save();
    }
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: req.params.projectId,
      actor_user_id: req.user._id,
      action: 'created',
      object_type: 'milestone',
      object_id: milestone._id,
      diff: { after: milestone.toObject() }
    });
    
    // Emit socket event
    if (req.io) {
      req.io.to(`project:${req.params.projectId}`).emit('milestone.created', milestone);
    }
    
    res.status(201).json(milestone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all milestones for a project
router.get('/projects/:projectId/milestones', authenticate, checkProjectAccess('viewer'), async (req, res) => {
  try {
    const { status, start_date, end_date } = req.query;
    
    const query = { project_id: req.params.projectId };
    
    if (status) query.status = status;
    if (start_date || end_date) {
      query.end_date = {};
      if (start_date) query.end_date.$gte = new Date(start_date);
      if (end_date) query.end_date.$lte = new Date(end_date);
    }
    
    const milestones = await Milestone.find(query)
      .populate('linked_task_ids', 'title status progress')
      .populate('created_by', 'name email')
      .sort({ end_date: 1 });
    
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single milestone
router.get('/milestones/:id', authenticate, async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id)
      .populate('linked_task_ids', 'title status progress due_date')
      .populate('created_by', 'name email');
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    // Check project access
    const project = await Project.findById(milestone.project_id);
    if (!project.hasAccess(req.user._id, 'viewer')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update milestone
router.patch('/milestones/:id', authenticate, async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    // Check project access
    const project = await Project.findById(milestone.project_id);
    if (!project.hasAccess(req.user._id, 'editor')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const allowedUpdates = [
      'title', 'description', 'start_date', 'end_date', 'status'
    ];
    
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }
    
    const before = milestone.toObject();
    
    updates.forEach(update => milestone[update] = req.body[update]);
    await milestone.save();
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: milestone.project_id,
      actor_user_id: req.user._id,
      action: 'updated',
      object_type: 'milestone',
      object_id: milestone._id,
      diff: { before, after: milestone.toObject() }
    });
    
    // Emit socket event
    if (req.io) {
      req.io.to(`project:${milestone.project_id}`).emit('milestone.updated', milestone);
    }
    
    res.json(milestone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Link tasks to milestone
router.post('/milestones/:id/link', authenticate, async (req, res) => {
  try {
    const { task_ids } = req.body;
    
    if (!Array.isArray(task_ids)) {
      return res.status(400).json({ error: 'task_ids must be an array' });
    }
    
    const milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    // Check project access
    const project = await Project.findById(milestone.project_id);
    if (!project.hasAccess(req.user._id, 'editor')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Add new task IDs (avoid duplicates)
    task_ids.forEach(taskId => {
      if (!milestone.linked_task_ids.includes(taskId)) {
        milestone.linked_task_ids.push(taskId);
      }
    });
    
    // Recalculate progress
    await milestone.calculateProgress();
    await milestone.save();
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: milestone.project_id,
      actor_user_id: req.user._id,
      action: 'milestone_linked',
      object_type: 'milestone',
      object_id: milestone._id,
      metadata: { task_ids }
    });
    
    // Emit socket event
    if (req.io) {
      req.io.to(`project:${milestone.project_id}`).emit('milestone.updated', milestone);
    }
    
    res.json(milestone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Unlink tasks from milestone
router.post('/milestones/:id/unlink', authenticate, async (req, res) => {
  try {
    const { task_ids } = req.body;
    
    if (!Array.isArray(task_ids)) {
      return res.status(400).json({ error: 'task_ids must be an array' });
    }
    
    const milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    // Check project access
    const project = await Project.findById(milestone.project_id);
    if (!project.hasAccess(req.user._id, 'editor')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Remove task IDs
    milestone.linked_task_ids = milestone.linked_task_ids.filter(
      taskId => !task_ids.includes(taskId.toString())
    );
    
    // Recalculate progress
    await milestone.calculateProgress();
    await milestone.save();
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: milestone.project_id,
      actor_user_id: req.user._id,
      action: 'updated',
      object_type: 'milestone',
      object_id: milestone._id,
      metadata: { unlinked_task_ids: task_ids }
    });
    
    // Emit socket event
    if (req.io) {
      req.io.to(`project:${milestone.project_id}`).emit('milestone.updated', milestone);
    }
    
    res.json(milestone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Recalculate milestone progress
router.post('/milestones/:id/recalculate', authenticate, async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    // Check project access
    const project = await Project.findById(milestone.project_id);
    if (!project.hasAccess(req.user._id, 'viewer')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await milestone.calculateProgress();
    await milestone.save();
    
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete milestone
router.delete('/milestones/:id', authenticate, async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    // Check project access
    const project = await Project.findById(milestone.project_id);
    if (!project.hasAccess(req.user._id, 'admin')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: milestone.project_id,
      actor_user_id: req.user._id,
      action: 'deleted',
      object_type: 'milestone',
      object_id: milestone._id,
      diff: { before: milestone.toObject() }
    });
    
    await milestone.deleteOne();
    
    // Emit socket event
    if (req.io) {
      req.io.to(`project:${milestone.project_id}`).emit('milestone.deleted', { id: req.params.id });
    }
    
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
