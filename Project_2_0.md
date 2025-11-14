# AetherTrack — Full Project‑Management System Specification (Integrated with Existing Task Manager)

This document represents a **complete, unified system specification** for the evolution of **AetherTrack** from a community/role-based task manager into a **full‑scale project‑management platform**. It merges the **existing working system** (Node.js + Express + MongoDB + React + Socket.IO) with the newly defined roadmap for **Phases 1–3**: Projectization, Advanced Views, and Scheduling Intelligence.

It is intended as the **master document** for engineering, architecture, feature development, and future AI‑assisted generation (Copilot, etc.).

---

# 1. Overview

AetherTrack currently delivers:

* User management & teams
* Task creation/assignment
* Comments & real-time updates
* Automated email workflows
* Weekly PDF/XLS reports
* Role-based permissions
* Socket.IO live sync

This document transforms it into:

* A fully **project‑structured** system
* With **epic → task → subtask** hierarchy
* Multiple **synchronized views** (Kanban, Grid, Calendar, Gantt)
* **Milestones**, **dependencies**, **critical path**, and **auto‑scheduling**
* A scalable backend foundation using your existing **Node.js + Express + MongoDB** architecture

---

# 2. Phase 1 — Core Project Foundation

## 2.1 Project Workspaces

Each project becomes the top-level entity.

### Project metadata:

* `name`
* `description`
* `status`: active, paused, completed, archived
* `start_date`, `end_date`
* `owner_user_id`
* `visibility`: private/team/org
* `timezone`
* `settings`: default view, workflow settings, custom field definitions

### Role-based Access (Extended from existing RBAC)

Add project‑level roles (overriding global roles where needed):

* **Project Owner**
* **Project Admin**
* **Editor**
* **Commenter**
* **Viewer**

Existing system roles continue to work (Admin, HR, Lead, Member), but project roles allow finer control.

### Project Activity Log

Append-only, capturing:

* actor
* timestamp
* object type + ID
* action
* diff (before/after snapshot)

Stored as a separate MongoDB collection with partitioning by `project_id`.

---

## 2.2 Task Hierarchy (Epics → Tasks → Subtasks)

Extend existing task model:

* `type`: epic/task/subtask
* `parent_id`
* `position`
* Roll-up behaviors:

  * epic.progress = avg(child.progress)
  * epic.start/end auto-computed from children unless manually overridden

Reparenting allowed with integrity checks.

---

## 2.3 Simple Milestones

Milestones contain:

* `title`
* `date` or `start_date` + `end_date`
* `status`
* `linked_task_ids`
* auto-progress based on linked tasks

Displayed on **Calendar** and **Timeline**.

---

## 2.4 Custom Fields

Support project-level custom fields:

* `text`, `number`, `enum`, `multiselect`, `boolean`, `date`, `user`, `currency`

Stored in tasks as JSON inside MongoDB (`custom_fields: { key: value }`).

---

# 3. Phase 2 — Advanced Project Views

All views pull from the same canonical data.

## 3.1 Kanban Board

* Columns mapped to status or custom field
* Drag/drop reorder
* Swimlanes by epic/assignee
* WIP limit rules
* Real-time sync using existing Socket.IO

## 3.2 Grid/Table View

* Virtualized table for large data sets
* Inline editing
* Bulk actions with batch APIs
* Multi-column sorting + grouping

## 3.3 Calendar View

* Month/Week/Day modes
* Drag to move tasks/milestones
* Automatic update of dates + activity logs

## 3.4 Timeline / Gantt View

* Bars for tasks & milestones
* Resize to update dates
* Drag to shift
* Zoom: day/week/month/quarter
* Dependency lines rendered via canvas/SVG hybrid

## 3.5 Cross-View Behavior

* Universal filtering/sorting
* Saved views at project level
* Instant updates across all views via Socket.IO channels

---

# 4. Phase 3 — Milestones, Dependencies & Scheduling

## 4.1 Advanced Milestones Engine

* Auto-progress from linked tasks
* Overdue detection
* Notifications to assignees/team leads

## 4.2 Dependency System

Dependency types:

* FS (Finish → Start)
* SS (Start → Start)
* FF (Finish → Finish)
* SF (Start → Finish)

Stored as:

```json
{
  "_id": "UUID",
  "project_id": "UUID",
  "from_task_id": "UUID",
  "to_task_id": "UUID",
  "type": "FS",
  "lag": 0
}
```

Validation includes:

* circular deps
* impossible constraints
* project cross-boundary checks

## 4.3 Dependency Graph Visualization

* Graph rendered using vis.js / cytoscape
* Highlight cycles and critical paths

## 4.4 Critical Path Method (CPM)

Each task assigned a duration (from estimate or date-diff).

Backend worker service computes:

* ES, EF (Earliest Start/Finish)
* LS, LF (Latest Start/Finish)
* Float
* Critical path

Displayed in Gantt as highlighted chain.

## 4.5 Auto‑Scheduling

When task dates shift:

* system computes ripple effects
* shows a confirmation preview
* applies updates upon user approval

---

# 5. Integrated Updated Architecture (Based on Existing System)

## Backend — Node.js + Express + MongoDB

Your current architecture adapts cleanly by introducing modules:

### New backend modules:

* `/projects` — project lifecycle, RBAC
* `/tasks` — hierarchical tasks
* `/milestones`
* `/dependencies`
* `/scheduler` — CPM, date propagation
* `/activityLogs`
* `/views` — saved view definitions

### Real-time layer

Continue using Socket.IO with:

* Project channels: `project:<id>`
* Events: `task.updated`, `dependency.created`, `milestone.updated`, `schedule.preview`, etc.

### Worker Engine

A Node background worker using BullMQ or Agenda for:

* Critical path calculation
* Auto scheduling
* Notification dispatching

---

## Frontend — React + Vite

### New page structure:

```
/projects
   /:projectId
       /kanban
       /grid
       /calendar
       /timeline
       /milestones
       /settings
```

### Shared components:

* Task editor panel
* Milestone editor panel
* Dependency creation dialog
* Filter/Sort/Group bar
* Reusable date/time picker

### State layer

Use React Query + Zustand:

* React Query: API cache + data fetch
* Zustand: global UI and live updates

### Real‑time sync

Socket.IO updates merged into React Query cache.

---

# 6. Updated Database Schema (MongoDB)

Using Mongoose, collections include:

## `projects`

```js
{
  _id, name, description, status,
  start_date, end_date, owner_user_id,
  visibility, timezone, settings,
  created_at, updated_at
}
```

## `tasks`

```js
{
  _id, project_id,
  type, parent_id, position,
  title, description,
  status, priority,
  assignee_ids: [],
  label_ids: [],
  estimate_hours,
  time_spent_hours,
  start_date, due_date,
  custom_fields: {},
  created_at, updated_at
}
```

## `milestones`

```js
{
  _id, project_id,
  title, start_date, end_date, status,
  linked_task_ids: [],
  progress_percent,
  created_at, updated_at
}
```

## `dependencies`

```js
{
  _id, project_id,
  from_task_id, to_task_id,
  type, lag,
  created_at
}
```

## `activity_logs`

```js
{
  _id, project_id,
  actor_user_id,
  action, object_type, object_id,
  diff, metadata,
  created_at
}
```

## `saved_views`

```js
{
  _id, project_id,
  name, definition,
  visibility,
  created_at
}
```

---

# 7. API Specification (REST + WebSockets)

All endpoints follow `/api/v1` prefix.
Below is the **canonical API surface**.

## 7.1 Project Endpoints

* `POST /projects`
* `GET /projects/:id`
* `PATCH /projects/:id`
* `POST /projects/:id/archive`
* `POST /projects/:id/roles`

## 7.2 Task Endpoints

* `POST /projects/:id/tasks`
* `GET /projects/:id/tasks`
* `GET /tasks/:id`
* `PATCH /tasks/:id`
* `POST /tasks/bulk`
* `POST /tasks/:id/move`

## 7.3 Milestone Endpoints

* `POST /projects/:id/milestones`
* `PATCH /milestones/:id`
* `POST /milestones/:id/link`

## 7.4 Dependency Endpoints

* `POST /projects/:id/dependencies`
* `DELETE /dependencies/:id`
* `GET /projects/:id/dependencies`
* `POST /projects/:id/schedule/compute`

### WebSocket Events

```
task.created
task.updated
task.deleted
milestone.updated
dependency.added
dependency.removed
schedule.preview
```

---

# 8. UX Flow Summaries

## 8.1 Project Creation

1. Click **New Project**
2. Enter basic metadata
3. Add team members
4. Redirect to project dashboard
5. Select initial view (Kanban/Grid)

## 8.2 Task Creation

1. Click + Add Task
2. Choose type: epic/task/subtask
3. Enter minimal data
4. Full editor opens for more fields

## 8.3 Milestone Creation

1. Open milestone panel
2. Add title + date
3. Link tasks via search or multi-select

## 8.4 Dependency Creation

1. Open task detail → Add Dependency
2. Select target task
3. Choose dependency type
4. Save → validate cycles → update graph

## 8.5 Gantt Scheduling

1. Drag bar → preview schedule impact
2. Accept changes → commit
3. Real-time updates to all clients

---

# 9. Sprint Implementation Roadmap

A realistic 12‑sprint roadmap:

* **S1:** Project CRUD + settings + RBAC
* **S2:** Activity logs + task hierarchy
* **S3:** Milestones + custom fields
* **S4:** Kanban + real-time sync
* **S5:** Grid view + bulk actions
* **S6:** Calendar view
* **S7:** Timeline/Gantt + resizing
* **S8:** Dependency create + visualization
* **S9:** Critical path engine + auto-scheduler
* **S10:** View scaling + virtualization optimizations
* **S11:** Governance (archive/lock) + export tools
* **S12:** Polishing, security, hardening

---

# 10. Performance Guidelines

* Virtualized lists
* Delta updates through Socket.IO
* Index tasks by `project_id`, `status`, `due_date`
* Cache dependency graphs
* Background workers for scheduler

---

# 11. Security & Auditing

* JWT access + refresh
* RBAC enforced at project and global level
* Sanitized user input
* Audit logs for all sensitive operations

---

# 12. Deliverables for Copilot

* Backend code scaffolding for new collections
* Express controllers with validation
* React components for Kanban, Grid, Timeline
* Worker scripts for critical path
* Mongoose models for projects, milestones, dependencies

---

# 13. Conclusion

This document now provides a **complete, unified specification** for evolving AetherTrack into a full project‑management platform while reusing your current Node.js + MongoDB + React + Socket.IO foundation.
