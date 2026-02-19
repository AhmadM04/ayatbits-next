# Mobile Tutorial Test Guide

## How to Test the Race Condition Fix

### Prerequisites
1. Open the app on a mobile device or mobile viewport (< 768px width)
2. Clear tutorial progress to trigger it on dashboard:
   ```javascript
   // In browser console:
   localStorage.removeItem('tutorial_dashboard_intro');
   ```
3. Refresh the page

### Test Cases

#### Test 1: Stats Card Tutorial (Mobile Menu)
**Target Element**: `[data-tutorial="stats-cards"]` inside mobile burger menu

**Expected Behavior:**
1. Tutorial starts at welcome section ✅
2. Advances to stats card (inside mobile menu)
3. Mobile burger menu **automatically opens** ✅
4. **No flash at top-left corner** ✅
5. Highlight appears **only when menu is fully open** ✅
6. Stats card is properly highlighted with green glow ✅
7. Tooltip appears centered on screen ✅

**What to Watch For:**
- ❌ No brief flash of highlight box at (0, 0)
- ❌ No highlight appearing before menu opens
- ✅ Smooth transition from closed menu → open menu → highlight appears

#### Test 2: Language Selector Tutorial (Mobile Menu)
**Target Element**: `[data-tutorial="language-selector"]` inside mobile burger menu

**Steps:**
1. Create a fresh user account (0 streak)
2. The tutorial will include language selector step
3. Observe the same smooth behavior as Test 1

**Expected:**
- Menu opens automatically
- Language selector is highlighted after menu is fully visible
- No visual glitches

#### Test 3: Regular Elements (Not in Menu)
**Target Elements**: 
- `[data-tutorial="welcome-section"]`
- `[data-tutorial="daily-quote"]`
- `[data-tutorial="juz-grid"]`
- `[data-tutorial="bottom-nav"]`

**Expected:**
- These should work as before
- No regression in highlighting
- Smooth transitions

#### Test 4: Fast Sequential Steps
**Steps:**
1. Start tutorial
2. Click "Next" rapidly through all steps
3. Watch for any timing issues

**Expected:**
- Each step waits for previous animation to complete
- No overlapping highlights
- No skipped steps

#### Test 5: Slow Network Simulation
**Steps:**
1. Open Chrome DevTools → Network Tab
2. Set throttling to "Slow 3G"
3. Refresh page and start tutorial

**Expected:**
- Tutorial still waits appropriately
- Polling mechanism catches elements even with slow rendering
- Graceful handling if element doesn't appear (auto-skip after 1.5s)

### Browser Console Logs

The fix includes helpful console logs for debugging:

```
✅ Normal operation:
"Opened mobile menu for tutorial target: [data-tutorial="stats-cards"]"
"Element now visible: [data-tutorial="stats-cards"]"

⚠️ If element doesn't appear:
"Tutorial target still not accessible after opening menu: [data-tutorial="stats-cards"]"
(Tutorial will auto-skip to next step)

ℹ️ Position validation:
"Skipping invalid position for: [data-tutorial="stats-cards"]" { top: 0, left: 0, ... }
```

### Manual Testing Checklist

- [ ] No flash at top-left corner
- [ ] Mobile menu opens automatically for menu items
- [ ] Highlight appears only after menu is fully open
- [ ] Smooth animations without jumps
- [ ] Tooltip is readable and centered
- [ ] Can complete entire tutorial flow
- [ ] Regular (non-menu) elements still work
- [ ] Tutorial can be skipped at any point
- [ ] Tutorial can be restarted via "🎓 Restart Tutorial" in menu

### Device Testing Matrix

| Device | Viewport | Status |
|--------|----------|--------|
| iPhone SE | 375x667 | ⬜️ |
| iPhone 12 Pro | 390x844 | ⬜️ |
| Samsung Galaxy S20 | 360x800 | ⬜️ |
| iPad Mini | 768x1024 | ⬜️ |
| Chrome Mobile Emulator | Various | ⬜️ |

### Performance Impact

The fix should have minimal performance impact:
- Polling runs max 15 times at 100ms intervals
- Early exits when element is ready (typically 200-300ms)
- Only affects tutorial flow, not regular app usage
- No persistent watchers or observers

### Rollback Plan

If issues arise, the fix can be quickly rolled back by reverting:
```bash
git revert <commit-hash>
```

The old timeout-based approach will be restored, though the flash bug will return.

## Debugging Tips

### If highlight still flashes:
1. Check browser console for logs
2. Verify menu animation duration matches expected (150ms)
3. Check if React Strict Mode is causing double renders
4. Increase polling interval or max attempts

### If element is never highlighted:
1. Verify `data-tutorial` attribute exists on target
2. Check if element is actually rendered in mobile menu
3. Confirm selector syntax is correct
4. Look for CSS that might hide element (display: none, visibility: hidden)

### If menu doesn't open:
1. Verify `data-mobile-menu-toggle` attribute exists on burger button
2. Check if `data-menu-open` attribute updates correctly
3. Confirm click handler is not prevented by other code

## Success Criteria

✅ The fix is successful when:
1. Zero reports of "flashing highlight"
2. Smooth tutorial experience on all mobile devices
3. No regression in desktop tutorial behavior
4. Console logs show proper sequencing
5. Users can complete entire tutorial without issues

