import { test, expect } from '@playwright/test';

test('Investigate Showroom Management Issues', async ({ page }) => {
  // Authenticate first
  await page.goto('http://localhost:5177/auth');
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'eduardpopa68@yahoo.com');
  await page.fill('input[type="password"]', 'Test200');
  await page.click('button[type="submit"]');
  
  // Wait for redirect and then navigate to showroom management
  await page.waitForTimeout(3000);
  await page.goto('http://localhost:5177/admin/showroom-uri');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of showroom management page
  await page.screenshot({ path: 'showroom-management-main.png', fullPage: true });
  
  // Check if there are existing showrooms or if we need to create one
  const addButton = page.getByRole('button', { name: /adaugă showroom/i });
  const hasExistingShowrooms = await page.locator('.MuiCard-root').first().isVisible().catch(() => false);
  
  console.log('Has existing showrooms:', hasExistingShowrooms);
  console.log('Add button visible:', await addButton.isVisible());
  
  if (!hasExistingShowrooms && await addButton.isVisible()) {
    // Click "Add Showroom" to see the form
    await addButton.click();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of create form
    await page.screenshot({ path: 'showroom-create-form.png', fullPage: true });
    
    // Test TextField focus issue
    console.log('=== TESTING TEXTFIELD FOCUS ISSUE ===');
    
    // Find the name field
    const nameField = page.locator('input').filter({ hasText: /nume showroom|pro-mac/i }).first();
    const alternativeNameField = page.locator('input[placeholder*="Pro-Mac"]');
    const actualNameField = await nameField.isVisible() ? nameField : alternativeNameField;
    
    if (await actualNameField.isVisible()) {
      // Focus and type one character
      await actualNameField.click();
      await page.waitForTimeout(100);
      await actualNameField.type('T', { delay: 100 });
      
      // Check if still focused
      const isFocusedAfterOneChar = await actualNameField.evaluate(el => el === document.activeElement);
      console.log('TextField focused after typing one character:', isFocusedAfterOneChar);
      
      // Try typing more characters
      await actualNameField.type('est Showroom', { delay: 100 });
      const finalValue = await actualNameField.inputValue();
      console.log('Final TextField value:', finalValue);
      
      // Test city field too
      const cityField = page.locator('input[placeholder*="București"]');
      if (await cityField.isVisible()) {
        await cityField.click();
        await cityField.type('B', { delay: 100 });
        const cityFocusedAfterOne = await cityField.evaluate(el => el === document.activeElement);
        console.log('City field focused after one character:', cityFocusedAfterOne);
        await cityField.type('ucurești', { delay: 100 });
      }
      
      // Fill address field to make form valid
      const addressField = page.locator('input[placeholder*="Strada"]');
      if (await addressField.isVisible()) {
        await addressField.click();
        await addressField.fill('Test Address 123');
      }
      
      // Take screenshot after filling fields
      await page.screenshot({ path: 'showroom-form-filled.png', fullPage: true });
      
      // Test working hours toggles
      console.log('=== TESTING WORKING HOURS TOGGLES ===');
      
      const toggles = page.locator('input[type="checkbox"][role="switch"]');
      const toggleCount = await toggles.count();
      console.log('Found working hours toggles:', toggleCount);
      
      if (toggleCount > 0) {
        // Test first toggle (should be Monday)
        const firstToggle = toggles.first();
        const initialState = await firstToggle.isChecked();
        console.log('Initial toggle state:', initialState);
        
        // Click toggle
        await firstToggle.click();
        await page.waitForTimeout(500);
        
        const stateAfterClick = await firstToggle.isChecked();
        console.log('Toggle state after click:', stateAfterClick);
        console.log('Toggle state changed:', initialState !== stateAfterClick);
        
        // Click again to see if it toggles back
        await firstToggle.click();
        await page.waitForTimeout(500);
        
        const stateAfterSecondClick = await firstToggle.isChecked();
        console.log('Toggle state after second click:', stateAfterSecondClick);
        
        // Take screenshot of working hours section
        await page.screenshot({ path: 'working-hours-toggles.png', fullPage: true });
      }
      
      // Test save functionality
      console.log('=== TESTING SAVE FUNCTIONALITY ===');
      
      const saveButton = page.getByRole('button', { name: /salvează|creează/i });
      if (await saveButton.isVisible()) {
        console.log('Save button visible, attempting to save...');
        await saveButton.click();
        
        // Wait for confirmation dialog
        try {
          await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
          console.log('Confirmation dialog appeared');
          
          // Take screenshot of confirmation dialog
          await page.screenshot({ path: 'save-confirmation-dialog.png', fullPage: true });
          
          // Find and click confirm button
          const confirmButton = page.getByRole('button', { name: /da|yes|confirm/i });
          if (await confirmButton.isVisible()) {
            console.log('Clicking confirm button...');
            await confirmButton.click();
            
            // Wait and observe what happens
            await page.waitForTimeout(3000);
            
            // Check current URL
            const urlAfterSave = page.url();
            console.log('URL after save attempt:', urlAfterSave);
            
            // Take final screenshot
            await page.screenshot({ path: 'after-save-attempt.png', fullPage: true });
            
            // Check for any success/error messages
            const alerts = page.locator('.MuiAlert-root, [role="alert"]');
            const alertCount = await alerts.count();
            console.log('Alert messages found:', alertCount);
            
            if (alertCount > 0) {
              for (let i = 0; i < alertCount; i++) {
                const alertText = await alerts.nth(i).textContent();
                console.log(`Alert ${i + 1}:`, alertText);
              }
            }
          } else {
            console.log('Confirm button not found');
          }
        } catch (e) {
          console.log('No confirmation dialog appeared or timeout');
        }
      } else {
        console.log('Save button not visible');
      }
    } else {
      console.log('Name field not found');
    }
  } else if (hasExistingShowrooms) {
    // Test with existing showroom
    console.log('Testing with existing showrooms...');
    const editButton = page.getByRole('button', { name: /edit/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'showroom-edit-form.png', fullPage: true });
      
      // Test the same issues with editing
      // ... similar tests as above
    }
  }
});