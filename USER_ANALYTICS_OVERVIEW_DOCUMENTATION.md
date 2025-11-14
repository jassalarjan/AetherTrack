# User Analytics Overview - HR Management Dashboard

## 📋 Overview

The **User Analytics Overview** page is a comprehensive HR management dashboard that allows administrators and HR personnel to:

- **Monitor all users** with individual performance cards
- **Track attendance** (manual status tracking)
- **Send email reminders** to users
- **View task statistics** for each user
- **Export reports** for analysis
- **Filter and search** users efficiently

---

## 🎯 Key Features

### 1. **User Performance Cards**

Each user is displayed in a card showing:

- **User Information**: Name, email, role
- **Attendance Status**: Present/Absent/On Leave/Remote/Half Day
- **Productivity Score**: 0-100 scale with visual progress bar
- **Task Breakdown**:
  - Total Tasks
  - Completed Tasks
  - In Progress Tasks
  - Overdue Tasks
- **Additional Metrics**:
  - Completion Rate (%)
  - Average Completion Time (days)
  - High Priority Task Count

### 2. **Attendance Tracking (Manual)**

HR can mark user attendance for any date with the following statuses:

| Status | Description | Icon | Color |
|--------|-------------|------|-------|
| **Present** | User is working in office | UserCheck | Green |
| **Absent** | User is not present | UserX | Red |
| **On Leave** | User is on approved leave | Coffee | Amber |
| **Remote** | User is working remotely | Briefcase | Blue |
| **Half Day** | User worked partial day | Clock | Purple |

**How it works:**
1. Click "Mark Attendance" button on any user card
2. Select the appropriate status
3. Attendance is saved for the selected date
4. View attendance status on user cards

### 3. **Email Reminder System**

Send customized email reminders to users:

**Features:**
- Custom subject and message
- Pre-built templates:
  - Task Reminder
  - Overdue Tasks Alert
  - Performance Appreciation
- Professional HTML email format
- Instant delivery via nodemailer

**How to send:**
1. Click "Send Reminder" on user card
2. Choose a template or write custom message
3. Click "Send Email"
4. User receives professionally formatted email

### 4. **Summary Statistics**

Dashboard header shows real-time metrics:

- **Total Users**: Count of all users in system
- **Active Users**: Users with tasks in progress
- **Present Today**: Users marked present for selected date
- **Users with Overdue**: Users having overdue tasks

### 5. **Advanced Filtering**

Filter users by:

- **Search**: Name or email
- **Role**: Admin/HR/Team Lead/Member
- **Status**: 
  - All
  - Active (has in-progress tasks)
  - Inactive (no active tasks)
  - Has Overdue Tasks
- **Date**: Select date for attendance view

### 6. **Export Functionality**

Export filtered user data to CSV including:
- Name, Email, Role
- Task statistics
- Productivity metrics
- Attendance status
- Completion rates

---

## 🔐 Access Control

**Who can access:**
- ✅ Admin
- ✅ HR
- ❌ Team Lead (view only their own analytics)
- ❌ Member (view only their own analytics)

**Route:** `/user-analytics-overview`

**Navigation:** Sidebar > "User Analytics" (visible to Admin/HR only)

---

## 🎨 UI Components

### Color Scheme (Purple Theme)

- **Primary Gradient**: Purple (#a855f7) to Fuchsia (#c026d3)
- **Status Colors**:
  - Success/Completed: Emerald
  - In Progress: Blue
  - Overdue/Urgent: Red
  - Warning: Amber
  - Default: Purple

### Responsive Design

- **Desktop**: 3-column grid of user cards
- **Tablet**: 2-column grid
- **Mobile**: Single column stack

---

## 📊 Metrics Calculation

### Productivity Score Formula

```javascript
productivityScore = (
  (completedTasks * 0.4) +
  (onTimeTasks * 0.4) +
  (tasksWithoutOverdue * 0.2)
) / totalTasks * 100
```

**Components:**
- 40% weight: Task completion
- 40% weight: On-time completion
- 20% weight: Avoiding overdue tasks

**Score Interpretation:**
- 🟢 80-100: Excellent performance
- 🔵 60-79: Good performance
- 🟡 40-59: Average performance
- 🔴 0-39: Needs improvement

### Completion Rate

```javascript
completionRate = (completedTasks / totalTasks) * 100
```

### Average Completion Time

```javascript
avgCompletionTime = sum(completedAt - createdAt) / completedTasksCount
```
*Measured in days*

---

## 🔧 Backend API Endpoints

### 1. Send Email Reminder

```http
POST /api/users/send-reminder
```

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "subject": "Task Reminder",
  "message": "Please complete your pending tasks."
}
```

**Response:**
```json
{
  "message": "Email sent successfully"
}
```

### 2. Mark Attendance

```http
POST /api/users/attendance/mark
```

**Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "date": "2025-11-13",
  "status": "present"
}
```

**Response:**
```json
{
  "message": "Attendance marked successfully",
  "attendance": { "2025-11-13": "present" }
}
```

### 3. Get Attendance Overview

```http
GET /api/users/attendance/overview
```

**Response:**
```json
{
  "507f1f77bcf86cd799439011": {
    "2025-11-13": "present",
    "2025-11-12": "remote"
  },
  "507f1f77bcf86cd799439012": {
    "2025-11-13": "absent"
  }
}
```

### 4. Get User Attendance History

```http
GET /api/users/attendance/:userId
```

**Response:**
```json
{
  "2025-11-13": "present",
  "2025-11-12": "remote",
  "2025-11-11": "present"
}
```

---

## 📁 File Structure

### Frontend

```
frontend/src/
├── pages/
│   ├── UserAnalyticsOverview.jsx    # Main HR dashboard (NEW)
│   └── UserAnalytics.jsx            # Individual user analytics
├── components/
│   └── Navbar.jsx                   # Updated with new nav link
└── App.jsx                          # Added route
```

### Backend

```
backend/
├── routes/
│   └── users.js                     # Added 4 new endpoints
├── models/
│   └── User.js                      # Added attendance field
└── utils/
    └── emailService.js              # Added sendEmail function
```

---

## 🚀 Usage Guide

### For HR/Admin:

1. **Access the Dashboard**
   - Navigate to sidebar > "User Analytics"
   - View all users with their statistics

2. **Monitor Daily Attendance**
   - Select today's date from date picker
   - Mark attendance for each user
   - View attendance summary in header stats

3. **Send Reminders**
   - Identify users with overdue tasks
   - Click "Send Reminder" on their card
   - Choose template or write custom message
   - Send email instantly

4. **Analyze Performance**
   - Review productivity scores
   - Check completion rates
   - Identify top performers or users needing support

5. **Export Reports**
   - Apply filters as needed
   - Click "Export Report" button
   - Download CSV with all metrics

### For Team Leads/Members:

- Access "My Analytics" to view personal performance
- Cannot access User Analytics Overview page

---

## 🔔 Email Templates

### 1. Task Reminder Template

```
Subject: Task Reminder

Dear [Name],

This is a reminder regarding your pending tasks. Please review and update their status.

Best regards,
AetherTrack Team
```

### 2. Overdue Alert Template

```
Subject: Overdue Tasks Alert

Dear [Name],

You have overdue tasks that require immediate attention. Please prioritize and complete them as soon as possible.

Best regards,
AetherTrack Team
```

### 3. Appreciation Template

```
Subject: Performance Review

Dear [Name],

Great work on your recent tasks! Keep up the excellent performance.

Best regards,
AetherTrack Team
```

---

## 📈 Statistics Dashboard

### Summary Cards (Top of Page)

1. **Total Users**
   - Icon: User
   - Color: Purple
   - Shows: Count of all users

2. **Active Users**
   - Icon: Activity
   - Color: Emerald
   - Shows: Users with in-progress tasks

3. **Present Today**
   - Icon: UserCheck
   - Color: Amber
   - Shows: Users marked present for selected date

4. **Users with Overdue**
   - Icon: AlertCircle
   - Color: Red
   - Shows: Users having overdue tasks

---

## 🎯 Best Practices

### For HR Managers:

1. **Daily Attendance**: Mark attendance every morning
2. **Weekly Review**: Check productivity scores weekly
3. **Proactive Communication**: Send reminders before deadlines
4. **Regular Exports**: Download reports for monthly reviews
5. **Performance Support**: Reach out to users with low scores

### For System Administrators:

1. **Email Configuration**: Ensure EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD are set
2. **Backup Data**: Regular attendance data backups
3. **Monitor Performance**: Check dashboard load times
4. **Access Control**: Verify only admin/HR can access

---

## 🐛 Troubleshooting

### Email Not Sending

**Check:**
1. `.env` file has correct email credentials
2. `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` are set
3. SMTP port is correct (usually 587 or 465)
4. Firewall allows SMTP connections

**Solution:**
```bash
# Test email configuration
node backend/scripts/testEmail.js
```

### Attendance Not Saving

**Check:**
1. User model has `attendance` field
2. MongoDB connection is active
3. User has permission (admin/hr role)

**Solution:**
- Check backend logs for errors
- Verify MongoDB is running
- Restart backend server

### Page Loading Slowly

**Optimization:**
1. Reduce number of users displayed (pagination)
2. Optimize task queries in backend
3. Use data caching
4. Index database fields

---

## 🔄 Future Enhancements

Potential features for future versions:

- [ ] **Bulk Attendance Import**: Upload CSV for multiple users
- [ ] **Attendance Calendar View**: Monthly calendar with color-coded status
- [ ] **Automatic Attendance**: Integration with biometric systems
- [ ] **Performance Trends**: Historical productivity charts
- [ ] **Team Comparisons**: Department-wise analytics
- [ ] **Scheduled Reminders**: Auto-send reminders at specific times
- [ ] **Custom Email Templates**: Save and reuse templates
- [ ] **PDF Reports**: Generate printable reports
- [ ] **Push Notifications**: Browser notifications for low productivity
- [ ] **Integration with Payroll**: Export attendance for payroll processing

---

## 📝 Change Log

### Version 1.0.0 (November 13, 2025)

**Added:**
- User Analytics Overview page
- Manual attendance tracking system
- Email reminder functionality
- Export to CSV feature
- Advanced filtering (search, role, status, date)
- Productivity score calculation
- 4 new backend API endpoints
- Email templates for common scenarios
- Responsive user cards with task breakdown
- Real-time summary statistics
- Attendance status badges

**Modified:**
- User model: Added `attendance` field (Map type)
- Navbar: Added "User Analytics" link for admin/HR
- Email service: Added generic `sendEmail` function
- Routes: Added `/user-analytics-overview` route

---

## 📞 Support

For issues or questions:

1. Check this documentation
2. Review backend logs
3. Test email configuration
4. Verify user permissions
5. Contact system administrator

---

## 🎓 Learning Resources

### Technologies Used

- **React 18**: Frontend framework
- **Lucide React**: Icon library
- **date-fns**: Date formatting
- **Axios**: HTTP client
- **Express.js**: Backend framework
- **MongoDB**: Database
- **Nodemailer**: Email service

### Related Documentation

- [Notification System](./NOTIFICATION_IMPLEMENTATION_SUMMARY.md)
- [User Management](./BULK_USER_IMPORT_GUIDE.md)
- [Email Configuration](./test-email-config.sh)
- [Individual User Analytics](./frontend/src/pages/UserAnalytics.jsx)

---

**Created:** November 13, 2025  
**Version:** 1.0.0  
**Author:** AetherTrack Development Team
