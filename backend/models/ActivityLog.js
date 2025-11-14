import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  actor_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created', 'updated', 'deleted', 'moved', 'assigned',
      'status_changed', 'commented', 'archived', 'restored',
      'dependency_added', 'dependency_removed', 'milestone_linked'
    ]
  },
  object_type: {
    type: String,
    required: true,
    enum: ['project', 'task', 'milestone', 'dependency', 'comment', 'user']
  },
  object_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  diff: {
    before: {
      type: mongoose.Schema.Types.Mixed
    },
    after: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now,
    expires: 7776000 // Auto-delete after 90 days (optional)
  }
});

// Indexes for performance
activityLogSchema.index({ project_id: 1, created_at: -1 });
activityLogSchema.index({ object_type: 1, object_id: 1 });
activityLogSchema.index({ actor_user_id: 1 });
activityLogSchema.index({ created_at: -1 });

// Static method to log activity
activityLogSchema.statics.logActivity = async function(data) {
  const log = new this({
    project_id: data.project_id,
    actor_user_id: data.actor_user_id,
    action: data.action,
    object_type: data.object_type,
    object_id: data.object_id,
    diff: data.diff || {},
    metadata: data.metadata || {}
  });
  
  return await log.save();
};

// Static method to get activity timeline
activityLogSchema.statics.getTimeline = async function(projectId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    objectType = null,
    actorUserId = null,
    startDate = null,
    endDate = null
  } = options;
  
  const query = { project_id: projectId };
  
  if (objectType) query.object_type = objectType;
  if (actorUserId) query.actor_user_id = actorUserId;
  if (startDate || endDate) {
    query.created_at = {};
    if (startDate) query.created_at.$gte = startDate;
    if (endDate) query.created_at.$lte = endDate;
  }
  
  return await this.find(query)
    .populate('actor_user_id', 'name email')
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip);
};

export default mongoose.model('ActivityLog', activityLogSchema);
