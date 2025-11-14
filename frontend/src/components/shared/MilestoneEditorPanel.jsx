import { X } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';

export default function MilestoneEditorPanel() {
  const { milestoneEditorOpen, milestoneEditorMode, milestoneEditorData, closeMilestoneEditor } = useProjectStore();

  if (!milestoneEditorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeMilestoneEditor} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {milestoneEditorMode === 'create' ? 'Create New Milestone' : 'Edit Milestone'}
            </h2>
            <button
              onClick={closeMilestoneEditor}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  defaultValue={milestoneEditorData?.title || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter milestone title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  defaultValue={milestoneEditorData?.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add milestone description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    defaultValue={milestoneEditorData?.start_date ? new Date(milestoneEditorData.start_date).toISOString().split('T')[0] : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    defaultValue={milestoneEditorData?.end_date ? new Date(milestoneEditorData.end_date).toISOString().split('T')[0] : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  defaultValue={milestoneEditorData?.status || 'pending'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Linked Tasks
                </label>
                <div className="border border-gray-300 rounded-lg p-4 min-h-[100px]">
                  <p className="text-sm text-gray-500 text-center">
                    Task linking functionality - Coming soon
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={closeMilestoneEditor}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={closeMilestoneEditor}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {milestoneEditorMode === 'create' ? 'Create Milestone' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
