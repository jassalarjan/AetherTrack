import { Plus } from 'lucide-react';
import { useProjectTasks } from '../../hooks/useProjects';
import { useProjectStore } from '../../stores/projectStore';

export default function KanbanView({ projectId }) {
  const { openTaskEditor } = useProjectStore();
  const { data: tasks = [], isLoading } = useProjectTasks(projectId);

  const columns = [
    { id: 'todo', name: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', name: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', name: 'Review', color: 'bg-yellow-100' },
    { id: 'done', name: 'Done', color: 'bg-green-100' },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

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
    <div className="h-full bg-gray-50 p-6 overflow-x-auto">
      <div className="flex gap-6 h-full min-w-max">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
              {/* Column Header */}
              <div className={`${column.color} p-4 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{column.name}</h3>
                  <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                    {getTasksByStatus(column.id).length}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {getTasksByStatus(column.id).map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
                
                {/* Add task button */}
                <button
                  onClick={() => openTaskEditor('create', { status: column.id })}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task }) {
  const { openTaskEditor } = useProjectStore();

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  return (
    <div
      onClick={() => openTaskEditor('edit', task)}
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        
        {task.due_date && (
          <span className="text-xs text-gray-500">
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {task.assigned_to && task.assigned_to.length > 0 && (
        <div className="mt-3 flex -space-x-2">
          {task.assigned_to.slice(0, 3).map((user, idx) => (
            <div
              key={idx}
              className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
              title={user.name}
            >
              {user.name?.charAt(0) || '?'}
            </div>
          ))}
          {task.assigned_to.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center border-2 border-white">
              +{task.assigned_to.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
