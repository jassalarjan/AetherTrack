# 🔗 AetherTrack Project Management - Navigation Guide

## Quick Access Links

### Frontend Routes (After Login)

**Main Project Routes:**
- **Project List**: `http://localhost:5173/projects`
  - View all your projects
  - Create new projects
  - Search and filter projects
  - Grid/List view toggle

- **Project Detail**: `http://localhost:5173/projects/:id`
  - Replace `:id` with actual project ID
  - View tabs: Kanban | Grid | Calendar | Timeline
  - Project settings and team management
  
**Example Project URL:**
```
http://localhost:5173/projects/507f1f77bcf86cd799439011
```

### Navigation Access Points

#### 1. **Sidebar Navigation**
After logging in, click **"Projects"** in the left sidebar (2nd item)

#### 2. **Direct URL Navigation**
Go to: `http://localhost:5173/projects`

#### 3. **Programmatic Navigation**
```javascript
navigate('/projects')              // List all projects
navigate('/projects/:id')          // Open specific project
navigate('/projects/:id/settings') // Project settings (coming soon)
```

---

## 🎯 Available Features

### ✅ Fully Implemented (Ready to Use)

#### Backend API Endpoints
All endpoints require authentication token in header: `Authorization: Bearer <token>`

**Projects API:**
```
GET    /api/projects                    - List all projects
POST   /api/projects                    - Create project
GET    /api/projects/:id                - Get project details
PATCH  /api/projects/:id                - Update project
POST   /api/projects/:id/archive        - Archive project
DELETE /api/projects/:id                - Delete project
POST   /api/projects/:id/roles          - Add team member
DELETE /api/projects/:id/roles/:userId  - Remove team member
GET    /api/projects/:id/activity       - Get activity timeline
```

**Milestones API:**
```
POST   /api/projects/:projectId/milestones  - Create milestone
GET    /api/projects/:projectId/milestones  - List milestones
GET    /api/milestones/:id                  - Get milestone
PATCH  /api/milestones/:id                  - Update milestone
POST   /api/milestones/:id/link             - Link tasks
POST   /api/milestones/:id/unlink           - Unlink tasks
DELETE /api/milestones/:id                  - Delete milestone
```

**Dependencies API:**
```
POST   /api/projects/:projectId/dependencies     - Create dependency
GET    /api/projects/:projectId/dependencies     - List dependencies
GET    /api/projects/:projectId/dependencies/graph - Get graph data
GET    /api/tasks/:taskId/dependencies           - Get task dependencies
PATCH  /api/dependencies/:id                     - Update dependency
DELETE /api/dependencies/:id                     - Delete dependency
POST   /api/projects/:projectId/dependencies/validate - Validate (check circular)
```

**Scheduler API:**
```
GET    /api/projects/:projectId/schedule/critical-path - Calculate CPM
POST   /api/projects/:projectId/schedule/compute       - Generate auto-schedule preview
POST   /api/projects/:projectId/schedule/apply         - Apply schedule changes
```

#### Frontend Pages

**✅ Project List Page** (`/projects`)
- Grid and List view modes
- Search functionality
- Status filtering
- Create new project modal
- Project cards with metadata

**✅ Project Detail Page** (`/projects/:id`)
- Project header with back navigation
- Team member count
- View tabs (Kanban, Grid, Calendar, Timeline)
- Task editor panel
- Milestone editor panel

**✅ Kanban View**
- 4 columns (To Do, In Progress, Review, Done)
- Task cards with priority badges
- Assignee avatars
- Add task buttons per column
- Task click to edit

**✅ Grid View**
- Sortable table
- Status and priority badges
- Progress bars
- Assignee list
- Filter and export toolbar
- Row click to edit

**⏳ Calendar View** (Placeholder)
- Coming soon message
- Will integrate with react-big-calendar

**⏳ Timeline View** (Placeholder)
- Coming soon message
- Will show Gantt chart with dependencies

---

## 📋 Component Architecture

### Page Components
```
src/pages/projects/
  ├── ProjectsList.jsx       ✅ Project list with filters
  └── ProjectDetail.jsx      ✅ Project workspace with view tabs
```

### View Components
```
src/components/views/
  ├── KanbanView.jsx         ✅ Kanban board
  ├── GridView.jsx           ✅ Table view
  ├── CalendarView.jsx       ⏳ Placeholder
  └── TimelineView.jsx       ⏳ Placeholder
```

### Shared Components
```
src/components/shared/
  ├── TaskEditorPanel.jsx        ✅ Slide-out task editor
  └── MilestoneEditorPanel.jsx   ✅ Slide-out milestone editor
```

### State Management
```
src/stores/
  └── projectStore.js        ✅ Zustand store for project state
```

### Data Layer
```
src/lib/
  ├── queryClient.js         ✅ React Query configuration
  └── api.js                 ✅ API client with all endpoints
```

### Custom Hooks
```
src/hooks/
  └── useProjects.js         ✅ React Query hooks for all entities
```

---

## 🔧 Testing the Implementation

### 1. **Start the Servers**

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install  # Install new dependencies first
npm run dev
# Frontend runs on http://localhost:5173
```

### 2. **Login**
Navigate to `http://localhost:5173/login` and login with your credentials

### 3. **Access Projects**
Click **"Projects"** in the sidebar OR go to `http://localhost:5173/projects`

### 4. **Create a Project**
1. Click **"New Project"** button
2. Fill in:
   - Project Name (required)
   - Description
   - Visibility (private/team/org)
   - Default View (kanban/grid/calendar/timeline)
3. Click **"Create Project"**

### 5. **Open Project**
Click on any project card to open the project workspace

### 6. **Switch Views**
Use the tabs to switch between:
- **Kanban**: Drag-and-drop board (basic version)
- **Grid**: Table view with filters
- **Calendar**: Placeholder (coming soon)
- **Timeline**: Placeholder (coming soon)

### 7. **Create Tasks**
- In Kanban: Click **"Add Task"** in any column
- In Grid: Click **"New Task"** button
- Fill in task details and save

---

## 🧪 API Testing Examples

### Using cURL

**Create a Project:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Project",
    "description": "Testing the API",
    "visibility": "team",
    "settings": {
      "default_view": "kanban"
    }
  }'
```

**Get All Projects:**
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create a Dependency:**
```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/dependencies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from_task_id": "TASK_A_ID",
    "to_task_id": "TASK_B_ID",
    "type": "FS",
    "lag": 0
  }'
```

**Calculate Critical Path:**
```bash
curl -X GET http://localhost:5000/api/projects/PROJECT_ID/schedule/critical-path \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 UI Features

### Project List Page
- **Search Bar**: Live search across project names and descriptions
- **Status Filter**: Filter by active, paused, completed, or archived
- **View Toggle**: Switch between grid and list layouts
- **Project Cards**: Show name, description, status badge, team count, last updated

### Project Detail Page
- **Breadcrumb Navigation**: Back to projects list
- **Project Header**: Name, description, team count
- **View Tabs**: Kanban, Grid, Calendar, Timeline
- **Settings Icon**: Access project settings (future)

### Kanban View
- **4 Status Columns**: To Do, In Progress, Review, Done
- **Task Cards**: Title, description, priority, due date, assignees
- **Column Headers**: Status name + task count
- **Add Task**: Quick add button per column

### Grid View
- **Sortable Columns**: Title, Status, Priority, Assignees, Due Date, Progress
- **Inline Badges**: Status and priority with color coding
- **Progress Bars**: Visual progress indicators
- **Avatars**: Assignee profile pictures
- **Bulk Actions**: Filter and export toolbar

### Task Editor Panel
- **Slide-out Panel**: From right side
- **Full Form**: Title, description, status, priority, type, dates, estimate
- **Task Types**: Epic, Task, Subtask
- **Date Pickers**: Start date and due date
- **Save/Cancel**: Form actions

---

## 🔄 Real-Time Updates

### Socket.IO Events
The app subscribes to these real-time events:

**Project Events:**
```javascript
socket.on('join-project', projectId)
socket.on('leave-project', projectId)
```

**Entity Events:**
```javascript
socket.on('task.created', data)
socket.on('task.updated', data)
socket.on('task.deleted', data)
socket.on('milestone.created', data)
socket.on('milestone.updated', data)
socket.on('dependency.added', data)
socket.on('dependency.removed', data)
socket.on('schedule.preview', data)
socket.on('schedule.applied', data)
```

---

## 📊 Data Flow

```
User Action
    ↓
React Component
    ↓
React Query Hook (useProjects, useTasks, etc.)
    ↓
API Client (projectApi, taskApi, etc.)
    ↓
Axios Request → Backend API
    ↓
Express Route Handler
    ↓
Mongoose Model
    ↓
MongoDB Database
    ↓
Response → React Query Cache
    ↓
Zustand Store (if needed)
    ↓
Component Re-renders
    ↓
Socket.IO broadcasts to all clients
```

---

## 🚧 Coming Soon

1. **Full Drag-and-Drop** in Kanban (using @dnd-kit)
2. **Calendar View** with react-big-calendar
3. **Timeline/Gantt View** with vis-network
4. **Dependency Graph Visualization** with cytoscape
5. **Advanced Filters** and saved views
6. **Bulk Operations** for tasks
7. **Project Settings** page
8. **Team Member Management** UI
9. **Activity Timeline** view
10. **Custom Fields** editor

---

## 🛠️ Troubleshooting

### "Projects" link not showing
- Refresh the page
- Check if you're logged in
- Clear browser cache

### Can't create project
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify you have a valid auth token

### Tasks not loading
- Check if project ID is valid
- Verify task API endpoints are working
- Check network tab for failed requests

### Real-time updates not working
- Ensure Socket.IO is connected (check console)
- Verify you've joined the project room
- Check backend Socket.IO configuration

---

## 📝 Development Notes

### Package Dependencies Added
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@tanstack/react-query": "^5.17.0",
  "@tanstack/react-table": "^8.11.2",
  "@tanstack/react-virtual": "^3.0.1",
  "date-fns": "^3.0.6",
  "cytoscape": "^3.28.1",
  "vis-network": "^9.1.9",
  "zustand": "^4.4.7"
}
```

### Install Command
```bash
cd frontend
npm install
```

---

## 🎯 Quick Start Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Logged in to the application
- [ ] "Projects" link visible in sidebar
- [ ] Can access `/projects` page
- [ ] Can create a new project
- [ ] Can open project detail page
- [ ] Can switch between views
- [ ] Can create tasks in Kanban view
- [ ] Can view tasks in Grid view

---

**Last Updated**: November 13, 2025  
**Status**: Core implementation complete, UI functional, advanced views in progress
