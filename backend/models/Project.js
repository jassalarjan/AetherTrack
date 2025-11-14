import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active'
  },
  start_date: {
    type: Date,
    default: Date.now
  },
  end_date: {
    type: Date
  },
  owner_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['private', 'team', 'org'],
    default: 'team'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  settings: {
    default_view: {
      type: String,
      enum: ['kanban', 'grid', 'calendar', 'timeline'],
      default: 'kanban'
    },
    workflow_settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    custom_field_definitions: [{
      key: String,
      label: String,
      type: {
        type: String,
        enum: ['text', 'number', 'enum', 'multiselect', 'boolean', 'date', 'user', 'currency']
      },
      options: [String], // For enum and multiselect
      required: Boolean,
      default: mongoose.Schema.Types.Mixed
    }]
  },
  team_members: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'editor', 'commenter', 'viewer'],
      default: 'editor'
    },
    added_at: {
      type: Date,
      default: Date.now
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
projectSchema.index({ owner_user_id: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'team_members.user_id': 1 });

// Update timestamp on save
projectSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to check user access
projectSchema.methods.hasAccess = function(userId, requiredRole = 'viewer') {
  const roleHierarchy = ['viewer', 'commenter', 'editor', 'admin', 'owner'];
  const member = this.team_members.find(m => m.user_id.toString() === userId.toString());
  
  if (!member) return false;
  
  const userRoleIndex = roleHierarchy.indexOf(member.role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
};

export default mongoose.model('Project', projectSchema);
