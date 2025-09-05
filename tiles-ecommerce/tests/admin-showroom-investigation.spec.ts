import { test, expect } from '@playwright/test';

test.describe('Admin Showroom Investigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to regular auth page
    await page.goto('http://localhost:5177/auth');
    
    // Login with provided credentials
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'eduardpopa68@yahoo.com');
    await page.fill('input[type="password"]', 'Test200');
    
    // Find and click submit button (specifically the submit type button)
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard (admin users get redirected automatically)
    await page.waitForURL('**/admin**', { timeout: 15000 });
  });

  test('Take screenshots of showroom management interface', async ({ page }) => {
    // Navigate to showroom management
    await page.goto('http://localhost:5177/admin/showroom-uri');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the main list view
    await page.screenshot({ 
      path: 'admin-showroom-list.png', 
      fullPage: true 
    });
    
    // Check if there are showrooms and click edit on first one
    const showroomCards = page.locator('[data-testid="showroom-card"], .MuiCard-root').first();
    if (await showroomCards.isVisible()) {
      const editButton = page.getByRole('button', { name: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of edit form
        await page.screenshot({ 
          path: 'admin-showroom-edit.png', 
          fullPage: true 
        });
      }
    } else {
      // If no showrooms, click "Add Showroom" to see form
      const addButton = page.getByRole('button', { name: /adaugă showroom/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of create form
        await page.screenshot({ 
          path: 'admin-showroom-create.png', 
          fullPage: true 
        });
      }
    }
  });

  test('Test TextField focus behavior', async ({ page }) => {
    // Navigate to showroom management
    await page.goto('http://localhost:5177/admin/showroom-uri');
    await page.waitForLoadState('networkidle');
    
    // Try to create a new showroom to test fields
    const addButton = page.getByRole('button', { name: /adaugă showroom/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForLoadState('networkidle');
      
      // Test TextField focus behavior
      const nameField = page.locator('input[placeholder*="Pro-Mac"], input[label*="Nume"]').first();
      if (await nameField.isVisible()) {
        await nameField.click();
        await nameField.type('T');
        
        // Check if focus is still on the field after typing one character
        const isFocused = await nameField.evaluate(el => el === document.activeElement);
        console.log('TextField focus after typing one character:', isFocused);
        
        // Try typing more characters
        await nameField.type('est');
        const finalValue = await nameField.inputValue();
        console.log('Final TextField value:', finalValue);
      }
    }
  });

  test('Test working hours toggle behavior', async ({ page }) => {
    // Navigate to showroom management
    await page.goto('http://localhost:5177/admin/showroom-uri');
    await page.waitForLoadState('networkidle');
    
    // Create new showroom to test working hours
    const addButton = page.getByRole('button', { name: /adaugă showroom/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForLoadState('networkidle');
      
      // Look for working hours toggles
      const toggles = page.locator('input[type="checkbox"][role="switch"]');
      const toggleCount = await toggles.count();
      console.log('Found toggles:', toggleCount);
      
      if (toggleCount > 0) {
        // Test first toggle
        const firstToggle = toggles.first();
        const initialState = await firstToggle.isChecked();
        console.log('Initial toggle state:', initialState);
        
        // Click toggle
        await firstToggle.click();
        await page.waitForTimeout(500);
        
        const newState = await firstToggle.isChecked();
        console.log('Toggle state after click:', newState);
        console.log('Toggle state changed:', initialState !== newState);
      }
    }
  });

  test('Test save functionality', async ({ page }) => {
    // Navigate to showroom management
    await page.goto('http://localhost:5177/admin/showroom-uri');
    await page.waitForLoadState('networkidle');
    
    // Create new showroom to test save
    const addButton = page.getByRole('button', { name: /adaugă showroom/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForLoadState('networkidle');
      
      // Fill required fields
      await page.fill('input[placeholder*="Pro-Mac"]', 'Test Showroom');
      await page.fill('input[placeholder*="București"]', 'Test City');
      await page.fill('input[placeholder*="Strada"]', 'Test Address');
      
      // Try to save
      const saveButton = page.getByRole('button', { name: /salvează|creează/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Wait for confirmation modal
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        
        // Take screenshot of confirmation dialog
        await page.screenshot({ 
          path: 'admin-save-confirmation.png', 
          fullPage: true 
        });
        
        // Click yes to confirm
        const confirmButton = page.getByRole('button', { name: /da|yes/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          
          // Wait and see what happens
          await page.waitForTimeout(3000);
          
          // Check if we're back on list or still on form
          const currentUrl = page.url();
          console.log('URL after save:', currentUrl);
          
          // Take screenshot of result
          await page.screenshot({ 
            path: 'admin-save-result.png', 
            fullPage: true 
          });
        }
      }
    }
  });
});