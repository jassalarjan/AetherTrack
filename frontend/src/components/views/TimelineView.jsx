import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useProjectTasks, useMilestones } from '../../hooks/useProjects';
import { useProjectStore } from '../../stores/projectStore';

export default function TimelineView({ projectId }) {
  const [viewMode, setViewMode] = useState('month'); // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(projectId);
  const { data: milestones = [], isLoading: milestonesLoading } = useMilestones(projectId);
  const { openTaskEditor, openMilestoneEditor } = useProjectStore();

  // Calculate date range based on tasks
  const getDateRange = () => {
    if (tasks.length === 0 && milestones.length === 0) {
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 3);
      return { start, end };
    }

    const allDates = [
      ...tasks.filter(t => t.start_date).map(t => new Date(t.start_date)),
      ...tasks.filter(t => t.due_date).map(t => new Date(t.due_date)),
      ...milestones.filter(m => m.target_date).map(m => new Date(m.target_date)),
    ];

    const start = new Date(Math.min(...allDates));
    const end = new Date(Math.max(...allDates));
    
    // Add padding
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);

    return { start, end };
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange();

  // Generate timeline columns based on view mode
  const getTimelineColumns = () => {
    const columns = [];
    const current = new Date(rangeStart);

    while (current <= rangeEnd) {
      if (viewMode === 'day') {
        columns.push(new Date(current));
        current.setDate(current.getDate() + 1);
      } else if (viewMode === 'week') {
        columns.push(new Date(current));
        current.setDate(current.getDate() + 7);
      } else {
        columns.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
      }
    }

    return columns;
  };

  const columns = getTimelineColumns();

  const getTaskPosition = (task) => {
    if (!task.start_date || !task.due_date) return null;

    const start = new Date(task.start_date);
    const end = new Date(task.due_date);
    const totalDays = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24));
    const taskStart = Math.ceil((start - rangeStart) / (1000 * 60 * 60 * 24));
    const taskDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    return {
      left: `${(taskStart / totalDays) * 100}%`,
      width: `${(taskDuration / totalDays) * 100}%`,
    };
  };

  const getMilestonePosition = (milestone) => {
    if (!milestone.target_date) return null;

    const date = new Date(milestone.target_date);
    const totalDays = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24));
    const days = Math.ceil((date - rangeStart) / (1000 * 60 * 60 * 24));

    return {
      left: `${(days / totalDays) * 100}%`,
    };
  };

  const formatColumnHeader = (date) => {
    if (viewMode === 'day') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (viewMode === 'week') {
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  if (tasksLoading || milestonesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'day' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'week' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'month' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            Month
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rotate-45 bg-yellow-500"></div>
              <span>Milestones</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span>Critical Path</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Timeline Header */}
          <div className="sticky top-0 bg-gray-50 border-b z-10">
            <div className="flex">
              <div className="w-64 px-4 py-3 font-semibold border-r">Task Name</div>
              <div className="flex-1 flex">
                {columns.map((col, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-[100px] px-2 py-3 text-sm text-center border-r"
                  >
                    {formatColumnHeader(col)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="relative">
            {tasks.map((task, index) => {
              const position = getTaskPosition(task);
              
              return (
                <div key={task._id} className="flex border-b hover:bg-gray-50">
                  <div className="w-64 px-4 py-3 border-r">
                    <div className="font-medium text-sm truncate">{task.title}</div>
                    <div className="text-xs text-gray-500">
                      {task.start_date && task.due_date
                        ? `${new Date(task.start_date).toLocaleDateString()} - ${new Date(task.due_date).toLocaleDateString()}`
                        : 'No dates set'}
                    </div>
                  </div>
                  <div className="flex-1 relative" style={{ minHeight: '60px' }}>
                    {/* Timeline grid */}
                    <div className="absolute inset-0 flex">
                      {columns.map((_, i) => (
                        <div key={i} className="flex-1 min-w-[100px] border-r"></div>
                      ))}
                    </div>

                    {/* Task bar */}
                    {position && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-8 rounded cursor-pointer ${
                          task.is_critical ? 'bg-red-500' : 'bg-blue-500'
                        } hover:opacity-80 transition-opacity`}
                        style={position}
                        onClick={() => openTaskEditor(task)}
                      >
                        <div className="px-2 py-1 text-white text-xs truncate">
                          {task.title}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Milestones */}
            {milestones.map((milestone, index) => {
              const position = getMilestonePosition(milestone);
              
              return (
                <div key={milestone._id} className="flex border-b hover:bg-gray-50">
                  <div className="w-64 px-4 py-3 border-r">
                    <div className="font-medium text-sm truncate">🏁 {milestone.name}</div>
                    <div className="text-xs text-gray-500">
                      {milestone.target_date
                        ? new Date(milestone.target_date).toLocaleDateString()
                        : 'No date set'}
                    </div>
                  </div>
                  <div className="flex-1 relative" style={{ minHeight: '60px' }}>
                    {/* Timeline grid */}
                    <div className="absolute inset-0 flex">
                      {columns.map((_, i) => (
                        <div key={i} className="flex-1 min-w-[100px] border-r"></div>
                      ))}
                    </div>

                    {/* Milestone marker */}
                    {position && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rotate-45 bg-yellow-500 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ left: position.left }}
                        onClick={() => openMilestoneEditor(milestone)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                          <div className="text-white text-xs">M</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {tasks.length === 0 && milestones.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No tasks or milestones to display</p>
                <p className="text-sm mt-2">Add tasks with start and due dates to see them on the timeline</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
