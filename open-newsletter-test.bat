@echo off
echo Opening Newsletter Management Page for Testing...
echo.
echo Instructions:
echo 1. The browser will open to the newsletter management page
echo 2. Click on "Campanie Newsletter" button
echo 3. Verify the rich text editor appears in the modal
echo 4. Test the toolbar functionality
echo.
echo Press any key to open the page...
pause >nul

start "" "http://localhost:5177/admin/newsletter"

echo.
echo Page opened! Check the browser for:
echo - Newsletter management page loaded
echo - "Campanie Newsletter" button visible
echo - Click button to open modal with rich text editor
echo - Verify ReactQuill toolbar with formatting options
echo.
pause