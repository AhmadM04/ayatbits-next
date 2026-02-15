# Mobile Tour Testing Guide

## Quick Test Checklist

### Pre-Test Setup
1. Open your app in dev mode: `npm run dev`
2. Open on mobile device or use Chrome DevTools mobile emulation
3. Navigate to dashboard: `http://localhost:3000/dashboard`
4. Clear localStorage to trigger tour: `localStorage.clear()` in console
5. Refresh page

### Test 1: Edge-Hugging Fix ✅
**What to test:** Tooltip should stay centered, not stick to right edge

**Steps:**
1. Start tour (should auto-start on first visit)
2. Observe first tooltip position
3. Click "Next" to advance through steps
4. Check each step - tooltip should remain centered

**Expected:**
- Tooltip always centered horizontally
- Max-width 90vw (doesn't touch edges)
- Smooth transitions between steps

**Fail if:**
- Tooltip sticks to right edge
- Tooltip partially off-screen
- Horizontal scrollbar appears

---

### Test 2: Scroll Lock ✅
**What to test:** User can't scroll away during tour

**Steps:**
1. Start tour
2. Try to scroll page up/down
3. Try to scroll left/right
4. Try pull-to-refresh (on mobile)

**Expected:**
- Page doesn't scroll
- Body is locked in place
- No bouncing effect
- Can still interact with tooltip

**Fail if:**
- Page scrolls
- Pull-to-refresh triggers
- Content jumps around

---

### Test 3: Auto-Scroll to Target ✅
**What to test:** Target element scrolls into view automatically

**Steps:**
1. Start tour at step 1 (top of page)
2. Click "Next" to go to step 2 (bottom nav)
3. Observe smooth scroll animation
4. Target should be centered in viewport

**Expected:**
- Smooth scroll animation
- Target element centered
- Spotlight highlights correct element
- Tooltip appears after scroll completes

**Fail if:**
- No scroll happens
- Scroll is jumpy
- Wrong element highlighted
- Tooltip appears before scroll ends

---

### Test 4: Mobile Menu Auto-Trigger ⭐ KEY TEST
**What to test:** Menu opens automatically for hidden targets

**Prerequisites:**
1. Ensure mobile burger menu exists
2. Ensure menu items have `data-tutorial` attributes
3. Tutorial config must target a menu item

**Steps:**
1. Start tour
2. Navigate to step that targets mobile menu item (e.g., Profile)
3. Observe menu automatically opens
4. Tooltip appears pointing to menu item

**Expected:**
- Menu opens automatically (you see the X icon)
- Wait ~200ms for animation
- Target element becomes visible
- Spotlight highlights menu item
- Tooltip shows correct message

**Fail if:**
- Menu doesn't open
- Error in console
- Tooltip shows before menu opens
- Wrong element highlighted

**Debug:**
```javascript
// In browser console, check:
document.querySelector('[data-mobile-menu-toggle]')  // Should exist
document.querySelector('[data-mobile-menu-toggle]').getAttribute('data-menu-open')  // Should be 'true' after auto-open
```

---

### Test 5: Portal Rendering ✅
**What to test:** Tooltip renders at document.body level

**Steps:**
1. Start tour
2. Open browser DevTools (Elements/Inspector tab)
3. Inspect tooltip element
4. Check its parent in DOM tree

**Expected:**
- Tooltip is direct child of `<body>`
- Not nested inside main app container
- Z-index is 1000004
- Separate from main React root

**Debug:**
```javascript
// In console:
document.querySelector('.tour-tooltip-container').parentElement
// Should be: <body>
```

**Fail if:**
- Tooltip is inside #__next or app container
- Z-index conflicts with other elements

---

### Test 6: Force Positioning Recalculation ✅
**What to test:** Position updates correctly on step change

**Steps:**
1. Start tour
2. Open DevTools Console
3. Add listener: `window.addEventListener('resize', () => console.log('RESIZE'))`
4. Click "Next" through steps
5. Should see "RESIZE" log on each step change

**Expected:**
- Resize event fires ~150ms after step change
- Tooltip repositions correctly
- No visual glitches

**Fail if:**
- No resize events
- Tooltip position incorrect after step change

---

### Test 7: Hidden Element Detection ✅
**What to test:** System detects when target is hidden

**Manual Test:**
1. Start tour
2. Navigate to step targeting visible element (e.g., Welcome section)
3. ✅ No menu open
4. Navigate to step targeting hidden element (e.g., mobile Profile link)
5. ✅ Menu opens automatically

**Code Test:**
```javascript
// In console:
const hiddenElement = document.querySelector('[data-tutorial="mobile-profile-link"]');
const style = window.getComputedStyle(hiddenElement);
console.log('Display:', style.display);  // Should be 'none' when menu closed
console.log('Visibility:', style.visibility);
console.log('Width:', hiddenElement.offsetWidth);  // Should be 0 when menu closed
```

---

### Test 8: Keyboard Navigation ✅
**What to test:** Keyboard controls work correctly

**Steps:**
1. Start tour
2. Press `Escape` → Tour should close
3. Start tour again
4. Press `Enter` → Should go to next step
5. Press `ArrowRight` → Should go to next step
6. On last step, press `Enter` → Tour should complete

**Expected:**
- All keys work as described
- Tour state updates correctly
- No console errors

**Fail if:**
- Keys don't work
- Tour doesn't close/advance
- Multiple keys required

---

### Test 9: Orientation Change (Mobile Only) 📱
**What to test:** Tour adapts to orientation change

**Steps:**
1. Start tour on mobile in portrait mode
2. Rotate device to landscape
3. Observe tooltip repositions
4. Rotate back to portrait
5. Continue tour to next step

**Expected:**
- Tooltip stays centered in both orientations
- No overlap with mobile notches
- Smooth transition on rotate
- Target remains highlighted

**Fail if:**
- Tooltip goes off-screen
- Orientation change breaks tour
- Tooltip doesn't reposition

---

### Test 10: Multiple Rapid Clicks ⚡
**What to test:** System handles rapid navigation

**Steps:**
1. Start tour
2. Rapidly click "Next" button 5+ times
3. Observe behavior

**Expected:**
- Each step shows briefly
- No crashes or errors
- Eventually reaches last step
- Tour completes gracefully

**Fail if:**
- Console errors
- Tour gets stuck
- Steps skip incorrectly
- UI breaks

---

## Edge Case Tests

### EC1: Target Element Doesn't Exist
**Scenario:** Tutorial targets non-existent element

**Setup:**
```typescript
const steps = [
  { id: 'fake', target: '[data-tutorial="nonexistent"]', ... }
];
```

**Expected:**
- Console warning: "Tutorial target not found: nonexistent"
- Tour continues to next step (graceful degradation)
- No crash

---

### EC2: Burger Menu Already Open
**Scenario:** User manually opened menu before tour targets it

**Steps:**
1. Manually open burger menu
2. Start tour
3. Navigate to step targeting menu item

**Expected:**
- Menu stays open
- No double-open attempt
- Tooltip shows correctly
- No console errors

---

### EC3: Network Tab Open (Performance)
**Scenario:** Check performance with DevTools network throttling

**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Start tour
4. Navigate through steps

**Expected:**
- Tour still works
- May be slightly slower
- No timeout errors
- UI remains responsive

---

## Device-Specific Tests

### iPhone 12 Pro (iOS Safari)
- [ ] Tour starts automatically
- [ ] Scroll lock works
- [ ] Pull-to-refresh disabled during tour
- [ ] Notch area respected
- [ ] Portrait mode ✅
- [ ] Landscape mode ✅
- [ ] Burger menu auto-opens ✅

### iPhone SE (Small Screen)
- [ ] Tooltip fits on screen
- [ ] Text is readable
- [ ] Buttons not cut off
- [ ] All steps visible

### iPad (Tablet)
- [ ] Desktop or mobile layout?
- [ ] Burger menu present?
- [ ] Tooltip sizing appropriate

### Android (Chrome)
- [ ] Tour works identically to iOS
- [ ] Back button during tour?
- [ ] Hardware back button handling

### Android (Samsung Internet)
- [ ] CSS compatibility
- [ ] Portal API works
- [ ] Animations smooth

---

## Performance Benchmarks

### Measure Time to First Tooltip
```javascript
console.time('tour-start');
// Start tour
// When first tooltip appears:
console.timeEnd('tour-start');
// Target: < 500ms
```

### Measure Frame Rate
```javascript
// In DevTools Performance tab
1. Start recording
2. Navigate through 5 tour steps
3. Stop recording
4. Check FPS graph
// Target: 60fps (no drops below 55fps)
```

### Memory Usage
```javascript
// In DevTools Memory tab
1. Take heap snapshot (before tour)
2. Complete entire tour
3. Close tour
4. Take heap snapshot (after tour)
5. Compare sizes
// Target: < 5MB increase, no memory leaks
```

---

## Automated Testing (Optional Future)

### Playwright Test Example
```typescript
import { test, expect } from '@playwright/test';

test('mobile tour opens burger menu automatically', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  
  // Wait for tour to start
  await page.waitForSelector('.tour-backdrop');
  
  // Navigate to step that targets mobile menu
  await page.click('button:has-text("Next")'); // x times
  
  // Check burger menu opened
  const menuOpen = await page.getAttribute('[data-mobile-menu-toggle]', 'data-menu-open');
  expect(menuOpen).toBe('true');
  
  // Check target is visible
  const target = await page.locator('[data-tutorial="mobile-profile-link"]');
  await expect(target).toBeVisible();
});
```

---

## Bug Report Template

If you find a bug:

```markdown
**Bug:** [Brief description]

**Severity:** Critical / High / Medium / Low

**Environment:**
- Device: [e.g., iPhone 12 Pro]
- OS: [e.g., iOS 16.5]
- Browser: [e.g., Safari]
- Screen Size: [e.g., 390x844]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Video:**
[If applicable]

**Console Errors:**
```
[Paste any errors]
```

**Additional Context:**
[Anything else relevant]
```

---

## Testing Sign-Off

When all tests pass:

```markdown
## Mobile Tour Testing - Sign-Off

**Date:** [Date]
**Tester:** [Name]
**Devices Tested:**
- [ ] iPhone 12 Pro (iOS 16)
- [ ] Samsung Galaxy S21 (Android 12)
- [ ] iPad Air (iOS 16)
- [ ] Desktop Chrome (simulator)

**Test Results:**
- Core Functionality: ✅ Pass
- Mobile Menu Auto-Open: ✅ Pass
- Scroll Lock: ✅ Pass
- Edge-Hugging Fix: ✅ Pass
- Performance: ✅ Pass (< 500ms, 60fps)
- Edge Cases: ✅ Pass

**Critical Bugs Found:** 0
**Minor Issues Found:** [List any]

**Status:** ✅ Ready for Production

**Signature:** _____________
```

---

## Quick Debug Commands

### Check if tour is active
```javascript
document.querySelector('.tour-backdrop') !== null
```

### Check current step
```javascript
// Look for key in tooltip
document.querySelector('.tour-tooltip-container').getAttribute('key')
```

### Force tour restart
```javascript
localStorage.removeItem('ayatbits_tutorial_dashboard_intro_completed');
location.reload();
```

### Check burger menu state
```javascript
document.querySelector('[data-mobile-menu-toggle]')?.getAttribute('data-menu-open')
```

### Check scroll lock
```javascript
document.body.style.overflow  // Should be 'hidden' during tour
```

### Force menu open (manual test)
```javascript
document.querySelector('[data-mobile-menu-toggle]')?.click()
```

---

## Success Criteria Summary

✅ **All tests pass** (10/10 main tests)
✅ **Edge cases handled** (3/3)
✅ **Performance targets met** (< 500ms, 60fps)
✅ **Zero critical bugs**
✅ **Works on iOS and Android**
✅ **Keyboard navigation functional**
✅ **Accessibility maintained**

**Status:** 🎉 Ready to Ship!

