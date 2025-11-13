# Diagnosing 500 Internal Server Error

A 500 Internal Server Error means something went wrong on the server side. Here's how to identify and fix it:

## 🔍 Step 1: Identify Which Request is Failing

### In Browser Console:
1. Open Developer Tools (Press `F12`)
2. Go to **Network** tab
3. Reload the page or trigger the action that causes the error
4. Look for requests with **500** status (shown in red)
5. Click on the failed request to see:
   - **Request URL** (which endpoint failed)
   - **Response** (error message from server)
   - **Headers** (request details)
   - **Payload** (data sent to server)

## 🔍 Step 2: Check Server Logs

The backend server logs will show the exact error. Run this command:

```bash
# Look at the terminal where you started the backend server
# The error will be logged there with details
```

Common error patterns:
- `MongoServerError` - Database connection issue
- `ValidationError` - Data validation failed
- `CastError` - Invalid ID format
- `Cannot read property of undefined` - Missing data
- `ECONNREFUSED` - Database not connected

## 🔍 Step 3: Common Causes & Solutions

### 1️⃣ Database Not Connected
**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**:
- Check if MongoDB is running
- Verify `MONGODB_URI` in backend/.env file
- Make sure database connection string is correct

### 2️⃣ Missing Environment Variables
**Error**: `Cannot read property 'X' of undefined` or `JWT_SECRET is not defined`

**Solution**:
- Create/check `backend/.env` file
- Ensure all required variables are set:
  ```env
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_secret_key
  PORT=5000
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=your_email
  EMAIL_PASSWORD=your_app_password
  ```

### 3️⃣ Invalid Data Format
**Error**: `ValidationError` or `CastError`

**Solution**:
- Check the data being sent from frontend
- Verify required fields are included
- Ensure data types match (strings, numbers, etc.)

### 4️⃣ Authentication Issues
**Error**: `jwt malformed` or `No token provided`

**Solution**:
- Check if token is being sent in Authorization header
- Verify token format: `Bearer <token>`
- Check if JWT_SECRET matches between login and verification

### 5️⃣ Missing Middleware or Dependencies
**Error**: `Cannot find module` or `X is not a function`

**Solution**:
```bash
cd backend
npm install
```

## 🛠️ Quick Diagnostic Script

Run this to check common issues:

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Test database connection
cd backend
node -e "import('./config/db.js').then(m => m.default())"
```

## 📝 Specific Route Errors

Based on your application structure, here are endpoints that might fail:

### Authentication Routes (`/api/auth/*`)
- `/api/auth/login` - Check credentials, JWT_SECRET
- `/api/auth/register` - Check validation, duplicate users
- `/api/auth/verify` - Check token validity

### User Routes (`/api/users/*`)
- `/api/users/me` - Requires authentication token
- `/api/users` - Requires admin/hr role
- `/api/users/:id` - Check if ID is valid MongoDB ObjectId

### Task Routes (`/api/tasks/*`)
- Check if user has access to the task
- Verify task ID format
- Check team permissions

### Notification Routes (`/api/notifications/*`)
- Check if user is authenticated
- Verify notification preferences exist

## 🔧 Debugging Tips

### Add More Logging
Temporarily add console.log statements in the route that's failing:

```javascript
router.get('/some-route', async (req, res) => {
  try {
    console.log('📍 Route hit:', req.path);
    console.log('📍 User:', req.user);
    console.log('📍 Query:', req.query);
    
    // Your code here
    
  } catch (error) {
    console.error('❌ ERROR DETAILS:', {
      message: error.message,
      stack: error.stack,
      route: req.path
    });
    res.status(500).json({ message: error.message });
  }
});
```

### Test Individual Routes
Use a tool like Postman or curl to test specific routes:

```bash
# Test health check
curl http://localhost:5000/api/health

# Test authentication (replace with your token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/users/me
```

## 🚑 Emergency Fixes

### Restart Everything
```bash
# Stop backend (Ctrl+C)
# Stop frontend (Ctrl+C)

# Clear node_modules if needed
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install

# Restart backend
cd backend
npm run dev

# Restart frontend (in new terminal)
cd frontend
npm run dev
```

### Check Database
```bash
# If using MongoDB locally
mongosh
# Then run: show dbs

# If using MongoDB Atlas
# Check your connection string and network access settings
```

## 📞 Need More Help?

Provide these details:
1. **Exact error message** from server logs
2. **Request URL** that's failing (from Network tab)
3. **What action** triggered the error
4. **Request payload** (data being sent)
5. **Server environment** (local, production, etc.)

---

## Next Steps

1. ✅ Check browser console Network tab
2. ✅ Check server terminal for error logs
3. ✅ Identify the failing endpoint
4. ✅ Apply specific fix from above
5. ✅ Test the fix
6. ✅ If issue persists, add more logging and retry
