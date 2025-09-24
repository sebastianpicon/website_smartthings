@echo off
echo Setting up SmartThings PWA for GitHub deployment...
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    echo.
)

echo Adding all files to Git...
git add .
echo.

echo Committing files...
git commit -m "Initial commit: SmartThings PWA with battery monitoring and responsive design"
echo.

echo Please follow these steps to complete the deployment:
echo.
echo 1. Create a new repository on GitHub named 'website_smartthings'
echo 2. Copy the remote URL (e.g., https://github.com/yourusername/website_smartthings.git)
echo 3. Run the following commands:
echo    git remote add origin YOUR_GITHUB_REPO_URL
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Go to your repository settings on GitHub
echo 5. Navigate to Pages section
echo 6. Set Source to "GitHub Actions"
echo 7. Your PWA will be deployed automatically!
echo.
echo The live URL will be: https://yourusername.github.io/website_smartthings
echo.
pause