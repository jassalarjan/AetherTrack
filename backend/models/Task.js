import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  // Project hierarchy support
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  type: {
    type: String,
    enum: ['epic', 'task', 'subtask'],
    default: 'task'
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  position: {
    type: Number,
    default: 0
  },
  
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done', 'archived'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_to: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  
  // Time tracking
  start_date: {
    type: Date
  },
  due_date: {
    type: Date,
    required: [true, 'Due date is required']
  },
  estimate_hours: {
    type: Number,
    default: 0
  },
  time_spent_hours: {
    type: Number,
    default: 0
  },
  
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Labels and custom fields
  label_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label'
  }],
  custom_fields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
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
taskSchema.index({ project_id: 1 });
taskSchema.index({ parent_id: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ due_date: 1 });
taskSchema.index({ assigned_to: 1 });

taskSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to calculate epic roll-up progress
taskSchema.methods.calculateEpicProgress = async function() {
  if (this.type !== 'epic') return this.progress;
  
  const children = await this.constructor.find({ parent_id: this._id });
  
  if (children.length === 0) return this.progress;
  
  const totalProgress = children.reduce((sum, child) => sum + child.progress, 0);
  this.progress = Math.round(totalProgress / children.length);
  
  return this.progress;
};

// Method to get all children (recursive)
taskSchema.methods.getAllChildren = async function() {
  const children = await this.constructor.find({ parent_id: this._id });
  const allChildren = [...children];
  
  for (const child of children) {
    const grandChildren = await child.getAllChildren();
    allChildren.push(...grandChildren);
  }
  
  return allChildren;
};

// Method to auto-compute dates from children
taskSchema.methods.computeDatesFromChildren = async function() {
  if (this.type === 'subtask') return;
  
  const children = await this.constructor.find({ parent_id: this._id });
  
  if (children.length === 0) return;
  
  const startDates = children.map(c => c.start_date).filter(d => d);
  const dueDates = children.map(c => c.due_date).filter(d => d);
  
  if (startDates.length > 0) {
    this.start_date = new Date(Math.min(...startDates.map(d => d.getTime())));
  }
  
  if (dueDates.length > 0) {
    this.due_date = new Date(Math.max(...dueDates.map(d => d.getTime())));
  }
};

export default mongoose.model('Task', taskSchema);