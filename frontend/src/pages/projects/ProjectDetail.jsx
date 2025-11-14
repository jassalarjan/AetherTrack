import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Settings, LayoutGrid, Calendar, GanttChart, 
  Table, Users, Activity, ChevronDown 
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useProject } from '../../hooks/useProjects';
import { useProjectStore } from '../../stores/projectStore';
import KanbanView from '../../components/views/KanbanView';
import GridView from '../../components/views/GridView';
import CalendarView from '../../components/views/CalendarView';
import TimelineView from '../../components/views/TimelineView';
import TaskEditorPanel from '../../components/shared/TaskEditorPanel';
import MilestoneEditorPanel from '../../components/shared/MilestoneEditorPanel';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id);
  const { currentView, setCurrentView, setCurrentProject } = useProjectStore();

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
      // Set default view from project settings
      if (project.settings?.default_view && !currentView) {
        setCurrentView(project.settings.default_view);
      }
    }
  }, [project, setCurrentProject]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/projects')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <Navbar>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Top row: Back button and project info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/projects')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Users className="h-4 w-4 mr-2" />
                  {project.team_members?.length || 0} Members
                </button>
                <Link
                  to={`/projects/${id}/settings`}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* View tabs */}
            <ViewTabs currentView={currentView} onViewChange={setCurrentView} projectId={id} />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="h-[calc(100vh-180px)]">
        {currentView === 'kanban' && <KanbanView projectId={id} />}
        {currentView === 'grid' && <GridView projectId={id} />}
        {currentView === 'calendar' && <CalendarView projectId={id} />}
        {currentView === 'timeline' && <TimelineView projectId={id} />}
      </div>

      {/* Side panels */}
      <TaskEditorPanel />
      <MilestoneEditorPanel />
      </div>
    </Navbar>
  );
}

function ViewTabs({ currentView, onViewChange, projectId }) {
  const views = [
    { id: 'kanban', name: 'Kanban', icon: LayoutGrid },
    { id: 'grid', name: 'Grid', icon: Table },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'timeline', name: 'Timeline', icon: GanttChart },
  ];

  return (
    <div className="flex border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="Tabs">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = currentView === view.id;
          
          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`
                group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm
                ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon className={`h-5 w-5 mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
              {view.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
