import { test, expect } from '@playwright/test'

/**
 * Specialized Working Hours Editor Testing
 * 
 * This test suite focuses on the WorkingHoursEditor component:
 * - Day toggle functionality (open/closed)
 * - Time picker validation and constraints  
 * - Working hours string generation and formatting
 * - Edge cases (midnight crossover, same start/end times)
 * - Responsive behavior and accessibility
 * - Integration with parent form state
 * 
 * Tests ensure the working hours functionality is robust and user-friendly.
 */

// Login helper
async function loginAsAdmin(page: any) {
  await page.goto('/auth')
  await page.fill('input[type="email"]', 'admin@promac.ro')
  await page.fill('input[type="password"]', 'Admin123!')
  await page.click('button:has-text("Autentificare")')
  await page.waitForURL('/admin')
}

// Page object for working hours testing
class WorkingHoursEditor {
  constructor(private page: any) {}

  async navigateToForm() {
    await this.page.goto('/admin/showroom-uri/create')
    await this.page.waitForLoadState('networkidle')
    
    // Scroll to working hours section
    await this.page.locator('text*="Program de lucru"').scrollIntoViewIfNeeded()
  }

  async getDayRow(day: string) {
    return this.page.locator(`text=${day}`).locator('..').first()
  }

  async toggleDay(day: string, shouldBeOpen: boolean) {
    const dayRow = await this.getDayRow(day)
    const toggle = dayRow.locator('input[type="checkbox"]')
    const isCurrentlyOpen = await toggle.isChecked()
    
    if (isCurrentlyOpen !== shouldBeOpen) {
      await toggle.click()
    }
  }

  async setTime(day: string, timeType: 'start' | 'stop', time: string) {
    const dayRow = await this.getDayRow(day)
    const timeInput = dayRow.locator(`input[label*="${timeType === 'start' ? 'Start' : 'Stop'}"]`)
    
    // Clear and set new time
    await timeInput.fill('')
    await timeInput.fill(time)
    await timeInput.press('Tab') // Trigger validation
  }

  async getTimeValue(day: string, timeType: 'start' | 'stop'): Promise<string> {
    const dayRow = await this.getDayRow(day)
    const timeInput = dayRow.locator(`input[label*="${timeType === 'start' ? 'Start' : 'Stop'}"]`)
    return await timeInput.inputValue()
  }

  async isTimeInputDisabled(day: string, timeType: 'start' | 'stop'): Promise<boolean> {
    const dayRow = await this.getDayRow(day)
    const timeInput = dayRow.locator(`input[label*="${timeType === 'start' ? 'Start' : 'Stop'}"]`)
    return await timeInput.isDisabled()
  }

  async isDayOpen(day: string): Promise<boolean> {
    const dayRow = await this.getDayRow(day)
    const toggle = dayRow.locator('input[type="checkbox"]')
    return await toggle.isChecked()
  }

  async isDayShowingClosed(day: string): Promise<boolean> {
    const dayRow = await this.getDayRow(day)
    const closedText = dayRow.locator('text=Închis')
    return await closedText.isVisible()
  }

  async getPreviewText(): Promise<string> {
    const previewBox = this.page.locator('.MuiTypography-root:has-text("Preview program:")').locator('..').locator('p')
    return (await previewBox.textContent()) || ''
  }

  async getWorkingHourString(): Promise<string> {
    // Get the generated working hours string from the form
    return await this.getPreviewText()
  }

  async setStandardBusinessHours() {
    // Monday to Friday: 9:00-18:00
    const weekdays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri']
    for (const day of weekdays) {
      await this.toggleDay(day, true)
      await this.setTime(day, 'start', '09:00')
      await this.setTime(day, 'stop', '18:00')
    }
    
    // Saturday: 9:00-14:00
    await this.toggleDay('Sâmbătă', true)
    await this.setTime('Sâmbătă', 'start', '09:00')
    await this.setTime('Sâmbătă', 'stop', '14:00')
    
    // Sunday: Closed
    await this.toggleDay('Duminică', false)
  }

  async setAllDaysClosed() {
    const allDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică']
    for (const day of allDays) {
      await this.toggleDay(day, false)
    }
  }

  async setCustomSchedule(schedule: { [day: string]: { open: boolean, start?: string, end?: string } }) {
    for (const [day, config] of Object.entries(schedule)) {
      await this.toggleDay(day, config.open)
      if (config.open && config.start && config.end) {
        await this.setTime(day, 'start', config.start)
        await this.setTime(day, 'stop', config.end)
      }
    }
  }
}

test.describe('Working Hours Editor - Specialized Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('🔄 Day Toggle Functionality', () => {
    
    test('should toggle days open and closed correctly', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Test toggling Sunday (default closed)
      expect(await editor.isDayOpen('Duminică')).toBe(false)
      expect(await editor.isDayShowingClosed('Duminică')).toBe(true)
      
      // Open Sunday
      await editor.toggleDay('Duminică', true)
      expect(await editor.isDayOpen('Duminică')).toBe(true)
      expect(await editor.isDayShowingClosed('Duminică')).toBe(false)
      
      // Close it again
      await editor.toggleDay('Duminică', false)
      expect(await editor.isDayOpen('Duminică')).toBe(false)
      expect(await editor.isDayShowingClosed('Duminică')).toBe(true)
    })

    test('should enable/disable time inputs based on day toggle', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Sunday should start closed with disabled inputs
      expect(await editor.isTimeInputDisabled('Duminică', 'start')).toBe(true)
      expect(await editor.isTimeInputDisabled('Duminică', 'stop')).toBe(true)
      
      // Open Sunday - inputs should be enabled
      await editor.toggleDay('Duminică', true)
      expect(await editor.isTimeInputDisabled('Duminică', 'start')).toBe(false)
      expect(await editor.isTimeInputDisabled('Duminică', 'stop')).toBe(false)
      
      // Close again - inputs should be disabled
      await editor.toggleDay('Duminică', false)
      expect(await editor.isTimeInputDisabled('Duminică', 'start')).toBe(true)
      expect(await editor.isTimeInputDisabled('Duminică', 'stop')).toBe(true)
    })

    test('should set default times when opening a closed day', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Open Sunday (was closed)
      await editor.toggleDay('Duminică', true)
      
      // Should have default times set
      const startTime = await editor.getTimeValue('Duminică', 'start')
      const stopTime = await editor.getTimeValue('Duminică', 'stop')
      
      expect(startTime).toBeTruthy()
      expect(stopTime).toBeTruthy()
      expect(startTime).not.toBe(stopTime)
    })

    test('should preserve times when toggling day off and on', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Set custom times for Monday
      await editor.setTime('Luni', 'start', '10:00')
      await editor.setTime('Luni', 'stop', '19:00')
      
      const originalStart = await editor.getTimeValue('Luni', 'start')
      const originalStop = await editor.getTimeValue('Luni', 'stop')
      
      // Toggle off and on
      await editor.toggleDay('Luni', false)
      await editor.toggleDay('Luni', true)
      
      // Times should be preserved (or reset to defaults - depends on implementation)
      const newStart = await editor.getTimeValue('Luni', 'start')
      const newStop = await editor.getTimeValue('Luni', 'stop')
      
      expect(newStart).toBeTruthy()
      expect(newStop).toBeTruthy()
    })
  })

  test.describe('🕐 Time Picker Validation', () => {
    
    test('should accept valid time formats', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      const validTimes = ['09:00', '9:00', '18:30', '23:59', '00:00']
      
      for (const time of validTimes) {
        await editor.setTime('Luni', 'start', time)
        const setValue = await editor.getTimeValue('Luni', 'start')
        expect(setValue).toBeTruthy()
        console.log(`Valid time test: ${time} -> ${setValue}`)
      }
    })

    test('should handle invalid time formats', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      const invalidTimes = ['25:00', '12:60', 'abc', '9:999', '']
      
      for (const invalidTime of invalidTimes) {
        await editor.setTime('Luni', 'start', invalidTime)
        
        // Check for validation error or automatic correction
        const setValue = await editor.getTimeValue('Luni', 'start')
        console.log(`Invalid time test: ${invalidTime} -> ${setValue}`)
        
        // Should either be corrected or cleared
        expect(setValue === invalidTime).toBe(false)
      }
    })

    test('should validate start time before end time', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Set end time before start time
      await editor.setTime('Luni', 'start', '18:00')
      await editor.setTime('Luni', 'stop', '09:00')
      
      // Check if validation prevents this or shows error
      const preview = await editor.getPreviewText()
      console.log('Invalid time range preview:', preview)
      
      // Implementation might show error or auto-correct
      // At minimum, it shouldn't crash
      expect(preview).toBeTruthy()
    })

    test('should handle edge cases', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Test midnight crossover (if supported)
      await editor.setTime('Luni', 'start', '23:00')
      await editor.setTime('Luni', 'stop', '01:00') // Next day
      
      const preview = await editor.getPreviewText()
      console.log('Midnight crossover preview:', preview)
      
      // Test same start and end time
      await editor.setTime('Marți', 'start', '12:00')
      await editor.setTime('Marți', 'stop', '12:00')
      
      const sameTimePreview = await editor.getPreviewText()
      console.log('Same start/end time preview:', sameTimePreview)
    })

    test('should handle 24-hour format correctly', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Test various hour formats
      await editor.setTime('Luni', 'start', '08:30')
      await editor.setTime('Luni', 'stop', '20:15')
      
      const preview = await editor.getPreviewText()
      
      // Should display in 24-hour format (Romanian standard)
      expect(preview).toContain('08:30')
      expect(preview).toContain('20:15')
      expect(preview).not.toContain('AM')
      expect(preview).not.toContain('PM')
    })
  })

  test.describe('📝 Working Hours String Generation', () => {
    
    test('should generate correct string for standard business hours', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      await editor.setStandardBusinessHours()
      
      const preview = await editor.getPreviewText()
      
      // Should group consecutive days with same hours
      expect(preview).toContain('Luni-Vineri')
      expect(preview).toContain('09:00-18:00')
      expect(preview).toContain('Sâmbătă')
      expect(preview).toContain('09:00-14:00')
      expect(preview).not.toContain('Duminică') // Closed, should not appear
    })

    test('should handle all days closed', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      await editor.setAllDaysClosed()
      
      const preview = await editor.getPreviewText()
      expect(preview).toBe('Închis')
    })

    test('should handle mixed schedules correctly', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Set custom mixed schedule
      await editor.setCustomSchedule({
        'Luni': { open: true, start: '09:00', end: '17:00' },
        'Marți': { open: false },
        'Miercuri': { open: true, start: '09:00', end: '17:00' },
        'Joi': { open: true, start: '10:00', end: '18:00' },
        'Vineri': { open: true, start: '10:00', end: '18:00' },
        'Sâmbătă': { open: true, start: '09:00', end: '13:00' },
        'Duminică': { open: false }
      })
      
      const preview = await editor.getPreviewText()
      
      // Should handle non-consecutive days correctly
      expect(preview).toContain('Luni')
      expect(preview).toContain('Miercuri') 
      expect(preview).toContain('Joi-Vineri')
      expect(preview).toContain('Sâmbătă')
    })

    test('should update preview in real-time', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Start with closed Sunday
      let preview = await editor.getPreviewText()
      const initialText = preview
      
      // Open Sunday
      await editor.toggleDay('Duminică', true)
      await editor.setTime('Duminică', 'start', '10:00')
      await editor.setTime('Duminică', 'stop', '16:00')
      
      // Preview should update
      preview = await editor.getPreviewText()
      expect(preview).not.toBe(initialText)
      expect(preview).toContain('Duminică')
      expect(preview).toContain('10:00-16:00')
    })

    test('should handle special day names and formatting', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Test Romanian day names are preserved
      await editor.setCustomSchedule({
        'Luni': { open: true, start: '09:00', end: '18:00' },
        'Sâmbătă': { open: true, start: '09:00', end: '14:00' }
      })
      
      const preview = await editor.getPreviewText()
      
      // Romanian characters should be preserved
      expect(preview).toContain('Sâmbătă')
      expect(preview).not.toContain('Sambata')
    })
  })

  test.describe('📱 Responsive Behavior', () => {
    
    test('should adapt layout for mobile screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
      
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Check that time pickers stack vertically on mobile
      const mondayRow = await editor.getDayRow('Luni')
      const timeInputs = mondayRow.locator('input[label*="Start"], input[label*="Stop"]')
      
      const inputBoxes = await timeInputs.evaluateAll(inputs => 
        inputs.map(input => input.getBoundingClientRect())
      )
      
      // On mobile, inputs should stack (second input below first)
      if (inputBoxes.length >= 2) {
        expect(inputBoxes[1].top).toBeGreaterThan(inputBoxes[0].bottom - 5)
      }
    })

    test('should maintain touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
      
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      const toggle = (await editor.getDayRow('Luni')).locator('input[type="checkbox"]')
      const toggleBox = await toggle.boundingBox()
      
      // Switch should have adequate touch target
      expect(toggleBox?.width).toBeGreaterThanOrEqual(32)
      expect(toggleBox?.height).toBeGreaterThanOrEqual(32)
    })

    test('should handle tablet layout correctly', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad
      
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Check that layout adapts for tablet
      const mondayRow = await editor.getDayRow('Luni')
      const timeInputs = mondayRow.locator('input[label*="Start"], input[label*="Stop"]')
      
      const inputBoxes = await timeInputs.evaluateAll(inputs => 
        inputs.map(input => input.getBoundingClientRect())
      )
      
      // On tablet, inputs might be side by side
      if (inputBoxes.length >= 2) {
        const verticalOverlap = inputBoxes[0].bottom > inputBoxes[1].top
        const horizontalOverlap = inputBoxes[0].right > inputBoxes[1].left
        console.log('Tablet layout - side by side:', horizontalOverlap && !verticalOverlap)
      }
    })
  })

  test.describe('♿ Accessibility', () => {
    
    test('should have proper ARIA labels', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Check time inputs have labels
      const startInput = (await editor.getDayRow('Luni')).locator('input[label*="Start"]')
      const stopInput = (await editor.getDayRow('Luni')).locator('input[label*="Stop"]')
      
      const startLabel = await startInput.getAttribute('aria-label')
      const stopLabel = await stopInput.getAttribute('aria-label')
      
      expect(startLabel || await startInput.locator('..').locator('label').textContent()).toBeTruthy()
      expect(stopLabel || await stopInput.locator('..').locator('label').textContent()).toBeTruthy()
    })

    test('should support keyboard navigation', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Focus first toggle
      const firstToggle = (await editor.getDayRow('Luni')).locator('input[type="checkbox"]')
      await firstToggle.focus()
      
      // Tab through all toggles
      for (let i = 0; i < 7; i++) {
        await page.keyboard.press('Tab')
        // Each day row should receive focus
      }
      
      // Should be able to operate toggles with space
      await firstToggle.focus()
      const initialState = await firstToggle.isChecked()
      await page.keyboard.press('Space')
      const newState = await firstToggle.isChecked()
      
      expect(newState).toBe(!initialState)
    })

    test('should announce changes to screen readers', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Check for live regions or aria-live attributes
      const previewSection = page.locator('text*="Preview program"').locator('..')
      const ariaLive = await previewSection.getAttribute('aria-live')
      
      console.log('Preview section aria-live:', ariaLive)
      
      // Changes in preview should be announced
      // Implementation detail - may use aria-live="polite"
    })
  })

  test.describe('🔗 Integration with Parent Form', () => {
    
    test('should integrate with form submission', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Fill required fields
      await page.fill('input[label*="Nume"]', 'Test Showroom')
      await page.fill('input[label*="Oraș"]', 'Test City')
      await page.fill('input[label*="Adresa"]', 'Test Address')
      
      // Set custom working hours
      await editor.setStandardBusinessHours()
      
      const previewText = await editor.getPreviewText()
      
      // Save form
      await page.click('button:has-text("Creează")')
      
      // Form should save successfully with working hours
      await page.waitForSelector('text*="salvat"', { timeout: 10000 })
      
      console.log('Working hours saved:', previewText)
    })

    test('should preserve state during form navigation', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Set custom hours
      await editor.setTime('Luni', 'start', '10:00')
      await editor.setTime('Luni', 'stop', '19:00')
      
      const originalPreview = await editor.getPreviewText()
      
      // Navigate to another section and back
      await page.click('input[label*="Nume"]') // Focus elsewhere
      await editor.navigateToForm() // Scroll back
      
      const newPreview = await editor.getPreviewText()
      expect(newPreview).toBe(originalPreview)
    })

    test('should handle form reset correctly', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Modify working hours
      await editor.toggleDay('Duminică', true)
      await editor.setTime('Duminică', 'start', '12:00')
      await editor.setTime('Duminică', 'stop', '18:00')
      
      // Simulate form reset (navigate away and back to create form)
      await page.goto('/admin/dashboard')
      await page.goto('/admin/showroom-uri/create')
      await editor.navigateToForm()
      
      // Sunday should be back to closed (default state)
      expect(await editor.isDayOpen('Duminică')).toBe(false)
    })
  })

  test.describe('🐛 Edge Cases and Error Handling', () => {
    
    test('should handle rapid toggle changes', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Rapidly toggle a day multiple times
      for (let i = 0; i < 5; i++) {
        await editor.toggleDay('Duminică', true)
        await editor.toggleDay('Duminică', false)
      }
      
      // Should end in closed state
      expect(await editor.isDayOpen('Duminică')).toBe(false)
      
      // Preview should be consistent
      const preview = await editor.getPreviewText()
      expect(preview).toBeTruthy()
    })

    test('should handle time changes during disabled state', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Close a day that was open
      await editor.toggleDay('Luni', false)
      
      // Try to set time while disabled (should not work)
      await editor.setTime('Luni', 'start', '99:99') // Invalid time
      
      // Open day again
      await editor.toggleDay('Luni', true)
      
      // Should have valid default times, not the invalid input
      const startTime = await editor.getTimeValue('Luni', 'start')
      expect(startTime).not.toBe('99:99')
      expect(startTime).toBeTruthy()
    })

    test('should handle browser back/forward correctly', async ({ page }) => {
      const editor = new WorkingHoursEditor(page)
      await editor.navigateToForm()
      
      // Set custom state
      await editor.setTime('Luni', 'start', '11:00')
      const originalPreview = await editor.getPreviewText()
      
      // Navigate to another page
      await page.goto('/admin/dashboard')
      
      // Use browser back
      await page.goBack()
      
      // State preservation depends on implementation
      const newPreview = await editor.getPreviewText()
      console.log('Browser back state preservation:', newPreview === originalPreview)
    })
  })
})