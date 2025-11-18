import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useProjects, useCreateTask, useUpdateTask, useDeleteTask } from '../../hooks/useProjects';

export default function TaskEditorPanel() {
  const { 
    taskEditorOpen, 
    taskEditorMode, 
    taskEditorData, 
    closeTaskEditor,
    currentProject 
  } = useProjectStore();
  
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    type: 'task',
    start_date: '',
    due_date: '',
    estimate_hours: 0,
    project_id: '',
    parent_id: null,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data when editor opens
  useEffect(() => {
    if (taskEditorOpen) {
      if (taskEditorMode === 'edit' && taskEditorData) {
        setFormData({
          title: taskEditorData.title || '',
          description: taskEditorData.description || '',
          status: taskEditorData.status || 'todo',
          priority: taskEditorData.priority || 'medium',
          type: taskEditorData.type || 'task',
          start_date: taskEditorData.start_date ? new Date(taskEditorData.start_date).toISOString().split('T')[0] : '',
          due_date: taskEditorData.due_date ? new Date(taskEditorData.due_date).toISOString().split('T')[0] : '',
          estimate_hours: taskEditorData.estimate_hours || 0,
          project_id: taskEditorData.project_id || currentProject?._id || '',
          parent_id: taskEditorData.parent_id || null,
        });
      } else {
        // Create mode - set defaults
        setFormData({
          title: '',
          description: '',
          status: taskEditorData?.status || 'todo',
          priority: 'medium',
          type: 'task',
          start_date: '',
          due_date: taskEditorData?.due_date ? new Date(taskEditorData.due_date).toISOString().split('T')[0] : '',
          estimate_hours: 0,
          project_id: taskEditorData?.project_id || currentProject?._id || '',
          parent_id: null,
        });
      }
    }
  }, [taskEditorOpen, taskEditorMode, taskEditorData, currentProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (!formData.project_id) {
      alert('Please select a project');
      return;
    }

    try {
      if (taskEditorMode === 'create') {
        await createTask.mutateAsync(formData);
      } else {
        await updateTask.mutateAsync({
          id: taskEditorData._id,
          updates: formData,
        });
      }
      closeTaskEditor();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(taskEditorData._id);
      closeTaskEditor();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  if (!taskEditorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeTaskEditor} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {taskEditorMode === 'create' ? 'Create New Task' : 'Edit Task'}
            </h2>
            <button
              onClick={closeTaskEditor}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6" id="task-form">
              {/* Project Selection - REQUIRED */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project *
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={taskEditorMode === 'edit'} // Can't change project after creation
                >
                  <option value="">Select a project...</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {taskEditorMode === 'edit' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Project cannot be changed after task creation
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add task description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="epic">Epic</option>
                  <option value="task">Task</option>
                  <option value="subtask">Subtask</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimate (hours)
                </label>
                <input
                  type="number"
                  value={formData.estimate_hours}
                  onChange={(e) => setFormData({ ...formData, estimate_hours: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-between">
            <div>
              {taskEditorMode === 'edit' && (
                <>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Are you sure?</span>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        disabled={deleteTask.isPending}
                      >
                        {deleteTask.isPending ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeTaskEditor}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="task-form"
                disabled={createTask.isPending || updateTask.isPending}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {createTask.isPending || updateTask.isPending
                  ? 'Saving...'
                  : taskEditorMode === 'create'
                  ? 'Create Task'
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
