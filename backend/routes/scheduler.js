import express from 'express';
import schedulerService from '../utils/schedulerService.js';
import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Middleware to check project access
const checkProjectAccess = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId;
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

// Calculate critical path
router.get('/projects/:projectId/schedule/critical-path', auth, checkProjectAccess('viewer'), async (req, res) => {
  try {
    const result = await schedulerService.calculateCriticalPath(req.params.projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate auto-schedule preview
router.post('/projects/:projectId/schedule/compute', auth, checkProjectAccess('editor'), async (req, res) => {
  try {
    const { start_date } = req.body;
    
    const preview = await schedulerService.autoSchedule(req.params.projectId, {
      start_date: start_date ? new Date(start_date) : new Date()
    });
    
    // Emit socket event for preview
    if (req.io) {
      req.io.to(`project:${req.params.projectId}`).emit('schedule.preview', preview);
    }
    
    res.json(preview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply auto-schedule
router.post('/projects/:projectId/schedule/apply', auth, checkProjectAccess('editor'), async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates must be an array' });
    }
    
    const result = await schedulerService.applySchedule(req.params.projectId, updates);
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: req.params.projectId,
      actor_user_id: req.user.userId,
      action: 'updated',
      object_type: 'project',
      object_id: req.params.projectId,
      metadata: { 
        action: 'auto_schedule_applied',
        tasks_updated: result.applied
      }
    });
    
    // Emit socket event
    if (req.io) {
      req.io.to(`project:${req.params.projectId}`).emit('schedule.applied', result);
    }
    
    res.json({
      message: 'Schedule applied successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
