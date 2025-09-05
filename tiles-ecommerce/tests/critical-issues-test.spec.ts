import { test, expect } from '@playwright/test';

test('Test Critical Issues in Showroom Management', async ({ page }) => {
  // Enable detailed logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  // Authenticate and navigate to showroom management
  await page.goto('http://localhost:5177/auth');
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'eduardpopa68@yahoo.com');
  await page.fill('input[type="password"]', 'Test200');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await page.goto('http://localhost:5177/admin/showroom-uri');
  await page.waitForTimeout(3000);
  
  // Take screenshot of main page
  await page.screenshot({ path: 'critical-test-main.png', fullPage: true });
  
  console.log('=== TESTING CRITICAL ISSUES ===');
  
  // Click Edit button on the first showroom
  const editButton = page.getByRole('button', { name: /editează/i }).first();
  if (await editButton.isVisible()) {
    console.log('Clicking edit button...');
    await editButton.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot of edit form
    await page.screenshot({ path: 'critical-test-edit-form.png', fullPage: true });
    
    console.log('=== ISSUE 1: TESTING TEXTFIELD FOCUS LOSS ===');
    
    // Test TextField focus issue - try the name field
    const nameField = page.locator('input').first();
    if (await nameField.isVisible()) {
      console.log('Testing name field focus...');
      
      // Get initial value
      const initialValue = await nameField.inputValue();
      console.log('Initial name field value:', initialValue);
      
      // Clear and start typing
      await nameField.click();
      await page.waitForTimeout(100);
      await nameField.selectAll();
      await page.waitForTimeout(100);
      
      // Type one character at a time and check focus
      const testText = 'Test Focus';
      for (let i = 0; i < testText.length; i++) {
        const char = testText[i];
        await nameField.type(char, { delay: 100 });
        
        // Check if still focused after each character
        const isFocused = await nameField.evaluate(el => el === document.activeElement);
        const currentValue = await nameField.inputValue();
        
        if (!isFocused) {
          console.log(`❌ FOCUS LOST after character ${i + 1} ('${char}')`);
          console.log(`Current value: "${currentValue}"`);
          break;
        } else if (i === testText.length - 1) {
          console.log(`✅ Focus maintained throughout entire input`);
          console.log(`Final value: "${currentValue}"`);
        }
      }
      
      // Test city field too
      const cityField = page.locator('input').nth(1);
      if (await cityField.isVisible()) {
        console.log('Testing city field focus...');
        await cityField.click();
        await cityField.selectAll();
        await cityField.type('B', { delay: 100 });
        
        const cityFocused = await cityField.evaluate(el => el === document.activeElement);
        if (!cityFocused) {
          console.log('❌ City field LOST FOCUS after one character');
        } else {
          await cityField.type('ucurești Test', { delay: 50 });
          const finalCityValue = await cityField.inputValue();
          console.log(`✅ City field maintained focus, final value: "${finalCityValue}"`);
        }
      }
    }
    
    console.log('=== ISSUE 2: TESTING WORKING HOURS TOGGLES ===');
    
    // Look for toggle switches
    const toggles = page.locator('input[type="checkbox"][role="switch"]');
    const toggleCount = await toggles.count();
    console.log(`Found ${toggleCount} toggle switches`);
    
    if (toggleCount > 0) {
      // Test first toggle (Monday)
      const firstToggle = toggles.first();
      const toggleLabel = page.locator('label').filter({ has: firstToggle });
      const labelText = await toggleLabel.textContent();
      
      console.log(`Testing toggle: "${labelText}"`);
      
      // Get initial state
      const initialState = await firstToggle.isChecked();
      console.log('Initial toggle state:', initialState);
      
      // Click toggle
      await firstToggle.click();
      await page.waitForTimeout(1000);
      
      // Check new state
      const newState = await firstToggle.isChecked();
      console.log('State after click:', newState);
      
      if (initialState === newState) {
        console.log('❌ TOGGLE STATE DID NOT CHANGE!');
      } else {
        console.log('✅ Toggle state changed successfully');
        
        // Click again to test if it reverts
        await firstToggle.click();
        await page.waitForTimeout(1000);
        
        const revertState = await firstToggle.isChecked();
        console.log('State after second click:', revertState);
        
        if (revertState === initialState) {
          console.log('✅ Toggle reverted to initial state');
        } else {
          console.log('❌ Toggle did not revert properly');
        }
      }
    }
    
    // Take screenshot after testing toggles
    await page.screenshot({ path: 'critical-test-after-toggles.png', fullPage: true });
    
    console.log('=== ISSUE 3: TESTING SAVE FUNCTIONALITY ===');
    
    // Find and test save button
    const saveButton = page.getByRole('button', { name: /salvează modificările/i });
    if (await saveButton.isVisible()) {
      console.log('Save button found, testing save functionality...');
      
      // Make a small change first
      const descriptionField = page.locator('textarea').first();
      if (await descriptionField.isVisible()) {
        await descriptionField.click();
        await descriptionField.fill('Updated description for testing save functionality');
      }
      
      // Click save
      await saveButton.click();
      await page.waitForTimeout(1000);
      
      // Look for confirmation dialog
      const confirmDialog = page.locator('[role="dialog"]');
      if (await confirmDialog.isVisible()) {
        console.log('✅ Confirmation dialog appeared');
        
        // Take screenshot of dialog
        await page.screenshot({ path: 'critical-test-save-dialog.png', fullPage: true });
        
        // Find confirm button
        const confirmButton = page.getByRole('button', { name: /da|yes/i });
        if (await confirmButton.isVisible()) {
          console.log('Clicking confirm button...');
          await confirmButton.click();
          
          // Wait and observe results
          await page.waitForTimeout(5000);
          
          // Check if we're still on the form or redirected
          const currentUrl = page.url();
          console.log('URL after save:', currentUrl);
          
          // Look for success/error messages
          const successAlert = page.locator('.MuiAlert-root').filter({ hasText: /succes/i });
          const errorAlert = page.locator('.MuiAlert-root').filter({ hasText: /eroare/i });
          
          if (await successAlert.isVisible()) {
            const successText = await successAlert.textContent();
            console.log('✅ SUCCESS MESSAGE:', successText);
          } else if (await errorAlert.isVisible()) {
            const errorText = await errorAlert.textContent();
            console.log('❌ ERROR MESSAGE:', errorText);
          } else {
            console.log('❌ NO SUCCESS/ERROR MESSAGE FOUND');
          }
          
          // Take final screenshot
          await page.screenshot({ path: 'critical-test-save-result.png', fullPage: true });
          
        } else {
          console.log('❌ Confirm button not found in dialog');
        }
      } else {
        console.log('❌ No confirmation dialog appeared');
      }
    } else {
      console.log('❌ Save button not found');
    }
    
  } else {
    console.log('❌ Edit button not found - cannot test issues');
  }
});