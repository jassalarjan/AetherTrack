import { GanttChart } from 'lucide-react';

export default function TimelineView({ projectId }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <GanttChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Timeline / Gantt View</h3>
        <p className="text-gray-600 mb-4">Coming soon - Gantt chart with dependencies and critical path</p>
        <div className="text-sm text-gray-500 space-y-1">
          <div>• Drag to resize task bars</div>
          <div>• Visualize task dependencies</div>
          <div>• Highlight critical path</div>
          <div>• Auto-scheduling support</div>
        </div>
      </div>
    </div>
  );
}
