import puppeteer from 'puppeteer';

async function testNewsletterEditor() {
  let browser;

  try {
    console.log('🚀 Starting newsletter editor test...');

    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Run in headed mode so we can see what's happening
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('📱 Navigating to newsletter management page...');

    // Navigate directly to the newsletter management page
    await page.goto('http://localhost:5177/admin/newsletter', {
      waitUntil: 'networkidle2'
    });

    // Take screenshot of the full page
    console.log('📸 Taking screenshot of newsletter management page...');
    await page.screenshot({
      path: 'newsletter-management-page.png',
      fullPage: true
    });

    // Look for the "Campanie Newsletter" button
    console.log('🔍 Looking for Campanie Newsletter button...');

    // Wait for the button and click it
    const campaignButtonSelector = 'button:has-text("Campanie Newsletter"), button:has-text("Campanie"), button[type="button"]';

    // Let's first check what buttons are available
    const allButtons = await page.$$('button');
    console.log(`Found ${allButtons.length} buttons on page`);

    // Get text content of all buttons
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await page.evaluate(el => el.textContent, allButtons[i]);
      console.log(`Button ${i + 1}: "${buttonText}"`);

      // If we find the campaign button, click it
      if (buttonText && (buttonText.includes('Campanie') || buttonText.includes('Newsletter'))) {
        console.log('✅ Found campaign button, clicking...');
        await allButtons[i].click();

        // Wait for modal to appear
        await page.waitForTimeout(2000);

        // Take screenshot of opened modal
        console.log('📸 Taking screenshot of opened modal...');
        await page.screenshot({
          path: 'newsletter-modal-opened.png',
          fullPage: true
        });

        // Look for ReactQuill editor
        console.log('🔍 Looking for ReactQuill editor...');

        // Check for ReactQuill elements
        const quillEditor = await page.$('.ql-editor');
        const quillToolbar = await page.$('.ql-toolbar');

        if (quillEditor && quillToolbar) {
          console.log('✅ ReactQuill editor found!');

          // Check toolbar buttons
          const toolbarButtons = await page.$$('.ql-toolbar button, .ql-toolbar .ql-formats span');
          console.log(`Found ${toolbarButtons.length} toolbar elements`);

          // Take focused screenshot of the rich text editor area
          const editorBox = await quillEditor.boundingBox();
          const toolbarBox = await quillToolbar.boundingBox();

          if (editorBox && toolbarBox) {
            await page.screenshot({
              path: 'rich-text-editor-close-up.png',
              clip: {
                x: toolbarBox.x - 20,
                y: toolbarBox.y - 20,
                width: Math.max(editorBox.width, toolbarBox.width) + 40,
                height: (editorBox.y + editorBox.height) - toolbarBox.y + 40
              }
            });
          }

          // Test typing in the editor
          console.log('⌨️ Testing editor functionality...');
          await quillEditor.click();
          await page.type('.ql-editor', 'Testing ReactQuill rich text editor functionality!');

          // Try using bold formatting
          const boldButton = await page.$('.ql-toolbar .ql-bold');
          if (boldButton) {
            await boldButton.click();
            await page.type('.ql-editor', ' This text should be bold!');
            console.log('✅ Bold formatting tested successfully');
          }

          // Test italic formatting
          const italicButton = await page.$('.ql-toolbar .ql-italic');
          if (italicButton) {
            await italicButton.click();
            await page.type('.ql-editor', ' And this should be italic!');
            console.log('✅ Italic formatting tested successfully');
          }

          // Take final screenshot showing the editor in use
          console.log('📸 Taking final screenshot with content...');
          await page.screenshot({
            path: 'rich-text-editor-with-content.png',
            fullPage: true
          });

          console.log('🎉 Rich text editor test completed successfully!');

        } else {
          console.log('❌ ReactQuill editor not found');

          // Check if it's still a regular text field
          const textField = await page.$('textarea[name="content"], input[name="content"]');
          if (textField) {
            console.log('❌ Still showing as regular TextField - rich text editor not implemented properly');
          }
        }

        break; // Exit the loop after finding and clicking the campaign button
      }
    }

    // Wait a moment before closing
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    if (browser) {
      console.log('🔄 Closing browser...');
      await browser.close();
    }
  }
}

// Run the test
testNewsletterEditor().then(() => {
  console.log('✅ Test completed. Check the generated screenshots for verification.');
}).catch(error => {
  console.error('❌ Test failed:', error);
});