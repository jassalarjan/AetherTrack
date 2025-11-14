import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  linked_task_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  progress_percent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes
milestoneSchema.index({ project_id: 1 });
milestoneSchema.index({ end_date: 1 });
milestoneSchema.index({ status: 1 });

// Update timestamp
milestoneSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  
  // Auto-update status based on end_date
  if (this.status !== 'completed' && this.end_date < Date.now()) {
    this.status = 'overdue';
  }
  
  next();
});

// Method to calculate progress from linked tasks
milestoneSchema.methods.calculateProgress = async function() {
  if (this.linked_task_ids.length === 0) {
    this.progress_percent = 0;
    return 0;
  }
  
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ _id: { $in: this.linked_task_ids } });
  
  const totalProgress = tasks.reduce((sum, task) => {
    // Assuming tasks have a progress field or calculate from status
    const taskProgress = task.progress || (task.status === 'completed' ? 100 : 0);
    return sum + taskProgress;
  }, 0);
  
  this.progress_percent = Math.round(totalProgress / tasks.length);
  return this.progress_percent;
};

export default mongoose.model('Milestone', milestoneSchema);
