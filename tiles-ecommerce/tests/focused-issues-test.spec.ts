import { test, expect } from '@playwright/test';

test('Reproduce Specific TextField and Toggle Issues', async ({ page }) => {
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
  
  // Click Edit button on the first showroom
  const editButton = page.getByRole('button', { name: /editează/i }).first();
  await editButton.click();
  await page.waitForTimeout(2000);
  
  console.log('=== CRITICAL ISSUE 1: TEXTFIELD FOCUS LOSS ===');
  
  // Test the name field focus issue
  const nameField = page.locator('input[value*="Showroom"]').first();
  
  console.log('Testing TextField focus loss issue...');
  
  // Click on the field to focus it
  await nameField.click();
  await page.waitForTimeout(200);
  
  // Clear the field using keyboard
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(100);
  
  // Try typing one character at a time
  const testChars = ['T', 'e', 's', 't'];
  let focusLost = false;
  let characterWhereFocusLost = -1;
  
  for (let i = 0; i < testChars.length; i++) {
    const char = testChars[i];
    
    console.log(`Typing character ${i + 1}: '${char}'`);
    await page.keyboard.type(char, { delay: 200 });
    await page.waitForTimeout(100);
    
    // Check if the field is still focused
    const isFocused = await nameField.evaluate(el => el === document.activeElement);
    const currentValue = await nameField.inputValue();
    
    console.log(`After '${char}': focused=${isFocused}, value="${currentValue}"`);
    
    if (!isFocused) {
      console.log(`❌ FOCUS LOST after typing character '${char}' (position ${i + 1})`);
      focusLost = true;
      characterWhereFocusLost = i + 1;
      break;
    }
  }
  
  if (!focusLost) {
    console.log('✅ TextField maintained focus throughout typing');
  }
  
  // Test another field (city field)
  console.log('\nTesting city field...');
  const cityField = page.locator('input[value*="București"]').first();
  
  await cityField.click();
  await page.waitForTimeout(200);
  await page.keyboard.press('Control+a');
  await page.keyboard.type('B', { delay: 200 });
  
  const cityFocused = await cityField.evaluate(el => el === document.activeElement);
  if (!cityFocused) {
    console.log('❌ City field LOST FOCUS after typing first character');
  } else {
    console.log('✅ City field maintained focus after first character');
    await page.keyboard.type('ucurești Test', { delay: 100 });
  }
  
  console.log('\n=== CRITICAL ISSUE 2: WORKING HOURS TOGGLE PERSISTENCE ===');
  
  // Test working hours toggles
  const toggles = page.locator('input[type="checkbox"][role="switch"]');
  const toggleCount = await toggles.count();
  console.log(`Found ${toggleCount} working hours toggles`);
  
  if (toggleCount > 0) {
    // Test the first toggle (Luni - Monday)
    const firstToggle = toggles.first();
    
    // Get initial state
    const initialState = await firstToggle.isChecked();
    console.log(`Luni toggle initial state: ${initialState ? 'CHECKED' : 'UNCHECKED'}`);
    
    // Click the toggle
    console.log('Clicking Luni toggle...');
    await firstToggle.click();
    await page.waitForTimeout(1000); // Wait for state change
    
    // Check new state
    const newState = await firstToggle.isChecked();
    console.log(`Luni toggle state after click: ${newState ? 'CHECKED' : 'UNCHECKED'}`);
    
    if (initialState === newState) {
      console.log('❌ TOGGLE STATE DID NOT CHANGE - This confirms the bug!');
    } else {
      console.log('✅ Toggle state changed successfully');
    }
    
    // Wait a bit more and check if it reverted
    await page.waitForTimeout(2000);
    const finalState = await firstToggle.isChecked();
    console.log(`Luni toggle final state after wait: ${finalState ? 'CHECKED' : 'UNCHECKED'}`);
    
    if (finalState === initialState && finalState !== newState) {
      console.log('❌ TOGGLE REVERTED TO ORIGINAL STATE - This confirms the persistence bug!');
    }
  }
  
  console.log('\n=== CRITICAL ISSUE 3: SAVE FUNCTION BROKEN ===');
  
  // Make a small change to trigger save
  const descriptionField = page.locator('textarea').first();
  if (await descriptionField.isVisible()) {
    await descriptionField.click();
    const originalDesc = await descriptionField.textContent() || '';
    await descriptionField.fill(originalDesc + ' - Test modification for save');
    console.log('Made change to description field');
  }
  
  // Find save button
  const saveButton = page.getByRole('button', { name: /salvează modificările/i });
  
  if (await saveButton.isVisible()) {
    console.log('Save button found, clicking...');
    await saveButton.click();
    
    // Wait for confirmation dialog
    await page.waitForTimeout(1000);
    
    const confirmDialog = page.locator('[role="dialog"]');
    const dialogVisible = await confirmDialog.isVisible();
    
    console.log(`Confirmation dialog appeared: ${dialogVisible}`);
    
    if (dialogVisible) {
      // Take screenshot of dialog
      await page.screenshot({ path: 'save-confirmation-dialog.png', fullPage: true });
      
      // Find and click confirm button
      const confirmButton = page.getByRole('button', { name: /da|yes|confirm/i });
      const confirmButtonVisible = await confirmButton.isVisible();
      
      console.log(`Confirm button visible in dialog: ${confirmButtonVisible}`);
      
      if (confirmButtonVisible) {
        console.log('Clicking confirm button...');
        await confirmButton.click();
        
        // Wait and observe what happens
        await page.waitForTimeout(5000);
        
        // Check current URL
        const currentUrl = page.url();
        console.log(`URL after save attempt: ${currentUrl}`);
        
        // Check for success/error messages
        const successAlert = page.locator('.MuiAlert-root').filter({ hasText: /succes|salvat|actualizat/i });
        const errorAlert = page.locator('.MuiAlert-root').filter({ hasText: /eroare|error/i });
        
        const hasSuccess = await successAlert.isVisible();
        const hasError = await errorAlert.isVisible();
        
        console.log(`Success message visible: ${hasSuccess}`);
        console.log(`Error message visible: ${hasError}`);
        
        if (hasSuccess) {
          const successText = await successAlert.textContent();
          console.log(`✅ SUCCESS: ${successText}`);
        } else if (hasError) {
          const errorText = await errorAlert.textContent();
          console.log(`❌ ERROR: ${errorText}`);
        } else {
          console.log('❌ NO FEEDBACK MESSAGE - This could indicate the save function is broken!');
        }
        
        // Take screenshot of result
        await page.screenshot({ path: 'save-result.png', fullPage: true });
        
        // Check if we're still on the edit form (should redirect to list if save worked)
        const stillOnEditForm = currentUrl.includes('/admin/showroom-uri') && !currentUrl.endsWith('/admin/showroom-uri');
        console.log(`Still on edit form: ${stillOnEditForm}`);
        
        if (stillOnEditForm) {
          console.log('❌ Still on edit form - save may not have worked properly');
        } else {
          console.log('✅ Redirected away from edit form - save appears to have worked');
        }
      }
    } else {
      console.log('❌ No confirmation dialog appeared after clicking save');
    }
  } else {
    console.log('❌ Save button not found');
  }
  
  console.log('\n=== SUMMARY OF FOUND ISSUES ===');
  console.log('1. TextField Focus Loss: Test completed');
  console.log('2. Toggle Persistence: Test completed');  
  console.log('3. Save Function: Test completed');
});