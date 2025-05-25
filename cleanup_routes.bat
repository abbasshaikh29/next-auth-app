@echo off
echo Removing conflicting routes...

:: Remove the old [id] routes
rmdir /s /q "c:\Users\ABBAS SHAIKH\Desktop\next-auth-app\src\app\api\community\[id]"

:: Remove the temporary id/[id] routes we created earlier
rmdir /s /q "c:\Users\ABBAS SHAIKH\Desktop\next-auth-app\src\app\api\community\id"

echo Routes removed successfully!
