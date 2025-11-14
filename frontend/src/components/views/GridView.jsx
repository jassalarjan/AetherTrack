import { useMemo } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import { useProjectTasks } from '../../hooks/useProjects';
import { useProjectStore } from '../../stores/projectStore';

export default function GridView({ projectId }) {
  const { openTaskEditor } = useProjectStore();
  const { data: tasks = [], isLoading } = useProjectTasks(projectId);

  const columns = [
    { key: 'title', label: 'Title', width: '300px' },
    { key: 'status', label: 'Status', width: '120px' },
    { key: 'priority', label: 'Priority', width: '100px' },
    { key: 'assigned_to', label: 'Assignees', width: '150px' },
    { key: 'due_date', label: 'Due Date', width: '120px' },
    { key: 'progress', label: 'Progress', width: '100px' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
        <button
          onClick={() => openTaskEditor('create')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  No tasks yet. Create your first task to get started.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task._id}
                  onClick={() => openTaskEditor('edit', task)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    {task.type && (
                      <div className="text-xs text-gray-500 mt-1">
                        {task.type === 'epic' ? '📦 Epic' : task.type === 'subtask' ? '📄 Subtask' : '✓ Task'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <AssigneesList assignees={task.assigned_to} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <ProgressBar value={task.progress || 0} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
    done: { label: 'Done', color: 'bg-green-100 text-green-800' },
    archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600' },
  };

  const config = statusConfig[status] || statusConfig.todo;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
    medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function AssigneesList({ assignees }) {
  if (!assignees || assignees.length === 0) {
    return <span className="text-gray-400 text-sm">Unassigned</span>;
  }

  return (
    <div className="flex -space-x-2">
      {assignees.slice(0, 3).map((user, idx) => (
        <div
          key={idx}
          className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
          title={user.name}
        >
          {user.name?.charAt(0) || '?'}
        </div>
      ))}
      {assignees.length > 3 && (
        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center border-2 border-white">
          +{assignees.length - 3}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 w-10 text-right">{value}%</span>
      </div>
    </div>
  );
}
