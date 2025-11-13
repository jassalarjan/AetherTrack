@echo off
echo ====================================
echo 🧪 Testing Login Endpoint
echo ====================================
echo.

echo Testing login with admin credentials...
echo Email: jassalarjansingh@gmail.com
echo Password: waheguru
echo.

curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"jassalarjansingh@gmail.com\",\"password\":\"waheguru\"}"

echo.
echo.
echo ====================================
echo If you see a 500 error above:
echo - Check the backend terminal for error details
echo - Make sure JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are set in .env
echo.
echo If you see user data and tokens:
echo ✅ Login is working!
echo ====================================
pause
