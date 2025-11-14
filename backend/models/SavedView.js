import mongoose from 'mongoose';

const savedViewSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  view_type: {
    type: String,
    enum: ['kanban', 'grid', 'calendar', 'timeline'],
    required: true
  },
  definition: {
    filters: {
      status: [String],
      priority: [String],
      assignee_ids: [mongoose.Schema.Types.ObjectId],
      label_ids: [mongoose.Schema.Types.ObjectId],
      due_date_range: {
        start: Date,
        end: Date
      },
      custom_fields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    },
    sorting: [{
      field: String,
      order: {
        type: String,
        enum: ['asc', 'desc']
      }
    }],
    grouping: {
      field: String,
      direction: {
        type: String,
        enum: ['horizontal', 'vertical']
      }
    },
    columns: [String], // For grid view
    swimlanes: String, // For kanban
    calendar_mode: String, // For calendar view (month/week/day)
    timeline_zoom: String // For timeline view (day/week/month/quarter)
  },
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'private'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_default: {
    type: Boolean,
    default: false
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
savedViewSchema.index({ project_id: 1 });
savedViewSchema.index({ created_by: 1 });
savedViewSchema.index({ project_id: 1, is_default: 1 });

// Update timestamp
savedViewSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Ensure only one default view per project and view type
savedViewSchema.pre('save', async function(next) {
  if (this.is_default) {
    await this.constructor.updateMany(
      { 
        project_id: this.project_id,
        view_type: this.view_type,
        _id: { $ne: this._id }
      },
      { is_default: false }
    );
  }
  next();
});

export default mongoose.model('SavedView', savedViewSchema);
