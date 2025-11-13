@echo off
echo ====================================
echo 🔧 MongoDB Atlas Fix Helper
echo ====================================
echo.

echo Your current connection error:
echo ❌ MongoDB Connection Error: bad auth : authentication failed
echo.

echo ====================================
echo 📋 STEP-BY-STEP FIX INSTRUCTIONS
echo ====================================
echo.

echo STEP 1: Whitelist Your IP in MongoDB Atlas
echo ----------------------------------------
echo 1. Open this link in your browser:
echo    https://cloud.mongodb.com/
echo.
echo 2. Login with your credentials
echo.
echo 3. Click "Network Access" in left sidebar
echo.
echo 4. Click "ADD IP ADDRESS" button
echo.
echo 5. Either:
echo    - Click "ADD CURRENT IP ADDRESS" (recommended)
echo    - OR enter: 0.0.0.0/0 (allow all IPs - development only)
echo.
echo 6. Click "Confirm"
echo.
echo 7. WAIT 1-2 MINUTES for changes to take effect
echo.

pause

echo.
echo STEP 2: Verify Database User
echo ----------------------------------------
echo 1. In MongoDB Atlas, click "Database Access"
echo.
echo 2. Find user: jassalarjansingh_db_user
echo.
echo 3. Verify user has "Read and write to any database" role
echo.
echo 4. If user doesn't exist or password is wrong, click "Edit"
echo    and reset the password
echo.

pause

echo.
echo STEP 3: Connection String Updated
echo ----------------------------------------
echo I've updated your backend/.env file with the correct format:
echo.
echo Old: mongodb+srv://.../?appName=Cluster0
echo New: mongodb+srv://.../aethertrack?retryWrites=true...
echo.
echo ✅ Database name 'aethertrack' added
echo ✅ Proper connection parameters added
echo.

pause

echo.
echo STEP 4: Restart Backend Server
echo ----------------------------------------
echo Please restart your backend server:
echo.
echo 1. Go to the terminal running backend
echo 2. Press Ctrl+C to stop
echo 3. Run: npm run dev
echo.
echo You should see: ✅ MongoDB connected successfully!
echo.

pause

echo.
echo ====================================
echo 🧪 Testing Connection...
echo ====================================
echo.

echo Waiting 3 seconds for you to restart backend...
timeout /t 3 /nobreak >nul

echo Checking if backend is running...
curl -s http://localhost:5000/api/diagnostics
echo.
echo.

echo ====================================
echo 📊 What to Look For:
echo ====================================
echo.
echo In the response above, check:
echo ✅ "connected": true
echo ✅ "state": "connected"
echo.
echo If you see:
echo ❌ "connected": false
echo Then MongoDB is still not connected.
echo.

echo ====================================
echo 🆘 If Still Not Working:
echo ====================================
echo.
echo 1. Make sure you whitelisted your IP (Step 1)
echo 2. Wait 2-3 minutes after whitelisting
echo 3. Verify username/password are correct
echo 4. Try creating a NEW database user:
echo    - Go to Database Access
echo    - Add New User
echo    - Username: aethertrack_user
echo    - Password: (simple, no special chars)
echo    - Update backend/.env with new credentials
echo.
echo 5. Check MongoDB status:
echo    https://status.cloud.mongodb.com/
echo.

echo ====================================
echo.

pause
