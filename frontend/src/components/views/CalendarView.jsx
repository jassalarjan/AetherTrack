import { Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarView({ projectId }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar View</h3>
        <p className="text-gray-600 mb-4">Coming soon - Month/Week/Day view with drag-and-drop</p>
        <div className="text-sm text-gray-500">
          Will integrate with react-big-calendar for rich calendar functionality
        </div>
      </div>
    </div>
  );
}
