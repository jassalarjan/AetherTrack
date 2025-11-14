import express from 'express';
import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check project access
const checkProjectAccess = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.id || req.params.projectId);
      
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

// Create new project
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      description,
      start_date,
      end_date,
      visibility,
      timezone,
      settings
    } = req.body;
    
    const project = new Project({
      name,
      description,
      start_date,
      end_date,
      owner_user_id: req.user._id,
      visibility,
      timezone,
      settings,
      team_members: [{
        user_id: req.user._id,
        role: 'owner'
      }]
    });
    
    await project.save();
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: project._id,
      actor_user_id: req.user._id,
      action: 'created',
      object_type: 'project',
      object_id: project._id,
      diff: { after: project.toObject() }
    });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all projects for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, visibility } = req.query;
    
    const query = {
      $or: [
        { owner_user_id: req.user._id },
        { 'team_members.user_id': req.user._id }
      ]
    };
    
    if (status) query.status = status;
    if (visibility) query.visibility = visibility;
    
    const projects = await Project.find(query)
      .populate('owner_user_id', 'name email')
      .populate('team_members.user_id', 'name email')
      .sort({ updated_at: -1 });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project
router.get('/:id', authenticate, checkProjectAccess('viewer'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner_user_id', 'name email')
      .populate('team_members.user_id', 'name email role');
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.patch('/:id', authenticate, checkProjectAccess('admin'), async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'description', 'status', 'start_date', 'end_date',
      'visibility', 'timezone', 'settings'
    ];
    
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }
    
    const project = req.project;
    const before = project.toObject();
    
    updates.forEach(update => project[update] = req.body[update]);
    await project.save();
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: project._id,
      actor_user_id: req.user._id,
      action: 'updated',
      object_type: 'project',
      object_id: project._id,
      diff: { before, after: project.toObject() }
    });
    
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Archive project
router.post('/:id/archive', authenticate, checkProjectAccess('owner'), async (req, res) => {
  try {
    const project = req.project;
    const before = project.toObject();
    
    project.status = 'archived';
    await project.save();
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: project._id,
      actor_user_id: req.user._id,
      action: 'archived',
      object_type: 'project',
      object_id: project._id,
      diff: { before, after: project.toObject() }
    });
    
    res.json({ message: 'Project archived successfully', project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add team member to project
router.post('/:id/roles', authenticate, checkProjectAccess('admin'), async (req, res) => {
  try {
    const { user_id, role } = req.body;
    
    if (!user_id || !role) {
      return res.status(400).json({ error: 'user_id and role are required' });
    }
    
    const project = req.project;
    
    // Check if user is already a member
    const existingMember = project.team_members.find(
      m => m.user_id.toString() === user_id
    );
    
    if (existingMember) {
      // Update role
      existingMember.role = role;
    } else {
      // Add new member
      project.team_members.push({ user_id, role });
    }
    
    await project.save();
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: project._id,
      actor_user_id: req.user._id,
      action: 'assigned',
      object_type: 'user',
      object_id: user_id,
      metadata: { role }
    });
    
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove team member from project
router.delete('/:id/roles/:userId', authenticate, checkProjectAccess('admin'), async (req, res) => {
  try {
    const project = req.project;
    
    // Prevent removing the owner
    if (project.owner_user_id.toString() === req.params.userId) {
      return res.status(400).json({ error: 'Cannot remove project owner' });
    }
    
    project.team_members = project.team_members.filter(
      m => m.user_id.toString() !== req.params.userId
    );
    
    await project.save();
    
    // Log activity
    await ActivityLog.logActivity({
      project_id: project._id,
      actor_user_id: req.user._id,
      action: 'deleted',
      object_type: 'user',
      object_id: req.params.userId
    });
    
    res.json({ message: 'Team member removed successfully', project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project activity timeline
router.get('/:id/activity', authenticate, checkProjectAccess('viewer'), async (req, res) => {
  try {
    const { limit, skip, object_type, actor_user_id, start_date, end_date } = req.query;
    
    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      objectType: object_type,
      actorUserId: actor_user_id,
      startDate: start_date ? new Date(start_date) : null,
      endDate: end_date ? new Date(end_date) : null
    };
    
    const activities = await ActivityLog.getTimeline(req.params.id, options);
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project (hard delete - use with caution)
router.delete('/:id', authenticate, checkProjectAccess('owner'), async (req, res) => {
  try {
    const project = req.project;
    
    // Log activity before deletion
    await ActivityLog.logActivity({
      project_id: project._id,
      actor_user_id: req.user._id,
      action: 'deleted',
      object_type: 'project',
      object_id: project._id,
      diff: { before: project.toObject() }
    });
    
    await project.deleteOne();
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
