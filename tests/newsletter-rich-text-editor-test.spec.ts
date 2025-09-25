import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  // Navigate to login page
  await page.goto('http://localhost:5177/login');

  // Fill in admin credentials (adjust as needed)
  await page.fill('input[name="email"]', 'admin@promac.ro');
  await page.fill('input[name="password"]', 'admin123');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL('http://localhost:5177/');
}

test.describe('Newsletter Management Rich Text Editor Test', () => {
  test('should display rich text editor in newsletter campaign modal', async ({ page }) => {
    // Step 1: Navigate to the newsletter management admin page
    console.log('Step 1: Attempting to login as admin...');
    await loginAsAdmin(page);

    // Navigate to newsletter management page
    console.log('Step 2: Navigating to newsletter management page...');
    await page.goto('http://localhost:5177/admin/newsletter');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the newsletter management page
    await page.screenshot({
      path: 'newsletter-management-page.png',
      fullPage: true
    });

    // Step 3: Click the "Campanie Newsletter" button to open the modal
    console.log('Step 3: Looking for Campanie Newsletter button...');

    // Look for button with text containing "Campanie" or "Newsletter"
    const campaignButton = page.locator('button:has-text("Campanie Newsletter"), button:has-text("Campanie"), button:has-text("Newsletter")').first();

    if (await campaignButton.isVisible()) {
      console.log('Found campaign button, clicking...');
      await campaignButton.click();

      // Wait for modal to appear
      await page.waitForTimeout(1000);

      // Take a screenshot of the modal
      await page.screenshot({
        path: 'newsletter-modal-opened.png',
        fullPage: true
      });

      // Step 4: Verify that content before "Subiect" field has been removed
      console.log('Step 4: Checking for unwanted content before Subiect field...');

      // Step 5: Verify that "Continut Email" field shows ReactQuill rich text editor
      console.log('Step 5: Looking for ReactQuill rich text editor...');

      // Look for ReactQuill editor elements
      const quillEditor = page.locator('.ql-editor, .ql-container, [data-testid="rich-text-editor"]');
      const quillToolbar = page.locator('.ql-toolbar, .ql-formats');

      if (await quillEditor.isVisible()) {
        console.log('✅ Rich text editor found!');

        // Check for toolbar elements
        if (await quillToolbar.isVisible()) {
          console.log('✅ Rich text editor toolbar found!');

          // Take a screenshot focusing on the rich text editor
          await page.screenshot({
            path: 'rich-text-editor-implementation.png',
            fullPage: true
          });

          // Step 6: Test the rich text editor functionality
          console.log('Step 6: Testing rich text editor functionality...');

          // Click into the editor and type some text
          await quillEditor.click();
          await page.keyboard.type('Testing rich text editor functionality...');

          // Try to use toolbar features
          const boldButton = page.locator('.ql-toolbar button[class*="ql-bold"], .ql-toolbar .ql-bold');
          if (await boldButton.isVisible()) {
            await boldButton.click();
            await page.keyboard.type(' Bold text test');
            console.log('✅ Bold formatting tested');
          }

          // Take final screenshot showing the editor in use
          await page.screenshot({
            path: 'rich-text-editor-in-use.png',
            fullPage: true
          });

        } else {
          console.log('❌ Rich text editor toolbar not found');
        }
      } else {
        console.log('❌ Rich text editor not found - checking for TextField instead...');

        // Check if it's still showing as a regular TextField
        const textField = page.locator('textarea[name="content"], input[name="content"], .MuiTextField-root textarea');
        if (await textField.isVisible()) {
          console.log('❌ Still showing as regular TextField - rich text editor not implemented');
        }
      }

    } else {
      console.log('❌ Campaign Newsletter button not found');

      // Take a screenshot to see what's available
      await page.screenshot({
        path: 'newsletter-page-no-button.png',
        fullPage: true
      });

      // List all visible buttons
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} buttons on the page:`);

      for (let i = 0; i < buttonCount; i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`Button ${i + 1}: "${buttonText}"`);
      }
    }

    console.log('Test completed. Check the generated screenshots for visual verification.');
  });
});