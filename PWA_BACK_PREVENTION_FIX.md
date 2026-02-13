# PWA Back Prevention Fix - The History Trap Solution

## 🚨 Problem: The History Loop

### Before (Broken Implementation)
```typescript
// ❌ BROKEN: This creates an infinite loop
const handleExitConfirm = () => {
  router.back(); // Only removes the dummy state, stays on same page!
};
```

**What happened:**
1. Hook pushes dummy state onto history stack
2. User swipes back → popstate fires
3. Hook re-arms by pushing dummy state again
4. Modal shows, user clicks "Yes, Go Back"
5. `router.back()` only removes the dummy state
6. **User stays on same page** → History Loop! 🔄

---

## ✅ Solution: The "Hard Exit" Pattern

### Key Insight
**Never use `router.back()` when you've modified the history stack!**

Instead, use `router.push('/specific-url')` to add a new entry that escapes the trap.

---

## Implementation

### 1. Fixed Hook: `lib/hooks/usePreventBack.ts`

```typescript
'use client';

import { useEffect, useCallback } from 'react';

/**
 * Hook to prevent back navigation (swipe-to-back on mobile, browser back button)
 * and show a confirmation modal instead.
 * 
 * IMPORTANT: When user confirms exit, use router.push() NOT router.back()
 * to escape the history trap.
 */
export function usePreventBack(
  shouldPrevent: boolean,
  onPrevent: () => void
) {
  const armTrap = useCallback(() => {
    // Push a dummy state to create a "history entry" we can intercept
    window.history.pushState({ trap: true }, '', window.location.href);
  }, []);

  useEffect(() => {
    if (!shouldPrevent) return;

    // STEP 1: Arm the trap on mount
    armTrap();

    // STEP 2: Intercept back navigation (swipe or button)
    const handlePopState = (e: PopStateEvent) => {
      // User tried to go back - immediately re-arm the trap
      // This keeps them on the page
      armTrap();
      
      // Show the "Are you sure?" modal
      onPrevent();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldPrevent, onPrevent, armTrap]);
}
```

### Key Changes from Old Version:
1. **Simpler API**: `(shouldPrevent, onPrevent)` instead of object options
2. **No isIntentionalExit ref**: Simplified - just use `router.push()` to exit
3. **Immediate re-arming**: Re-arms trap instantly in popstate handler
4. **No cleanup complexity**: Removes the problematic cleanup logic

---

### 2. Fixed PuzzleClient: `app/puzzle/[id]/PuzzleClient.tsx`

#### Integration

```typescript
const [showExitModal, setShowExitModal] = useState(false);
const backUrl = versePageUrl || '/dashboard';

// PWA FIX: Prevent accidental back navigation
usePreventBack(true, () => setShowExitModal(true));
```

#### Exit Handler (CRITICAL FIX)

```typescript
const handleExitConfirm = () => {
  setShowExitModal(false);
  // CRITICAL: Use push() NOT back() to escape the history trap
  router.push(backUrl); // ✅ This actually leaves the page
};

const handleMistakeLimitExceeded = useCallback(() => {
  // CRITICAL: Use push() NOT back() to escape the history trap
  router.push(backUrl); // ✅ Hard exit
}, [backUrl, router]);

const handleSolved = useCallback(async (isCorrect: boolean) => {
  // ... save progress ...
  
  setTimeout(() => {
    // Use push() to escape the history trap
    router.push(targetUrl); // ✅ Navigate to next puzzle
  }, 1800);
}, [/* deps */]);
```

---

## 🔍 How It Works

### The History Stack Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ENTERS PUZZLE PAGE                                   │
├─────────────────────────────────────────────────────────────┤
│ History: [Dashboard, Puzzle]                                 │
│ Hook pushes dummy state                                      │
│ History: [Dashboard, Puzzle, Dummy]                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. USER SWIPES BACK                                          │
├─────────────────────────────────────────────────────────────┤
│ popstate event fires                                         │
│ History: [Dashboard, Puzzle] ← Dummy removed                 │
│ Hook immediately re-arms                                     │
│ History: [Dashboard, Puzzle, Dummy] ← Dummy added back      │
│ Modal shows: "Are you sure?"                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3A. USER CLICKS "STAY"                                       │
├─────────────────────────────────────────────────────────────┤
│ Modal closes                                                 │
│ History: [Dashboard, Puzzle, Dummy] ← Still trapped         │
│ User can keep working                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3B. USER CLICKS "YES, GO BACK"                               │
├─────────────────────────────────────────────────────────────┤
│ router.push('/dashboard') executes                           │
│ History: [Dashboard, Puzzle, Dummy, Dashboard] ← New entry  │
│ Browser navigates to Dashboard ✅                            │
│ User successfully exits                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparison

| Approach | Result | Issue |
|----------|--------|-------|
| `router.back()` | Stays on page | Only removes dummy state |
| `router.replace()` | Stays on page | Replaces current entry |
| `router.push()` ✅ | **Exits successfully** | Adds new entry |

---

## 🎯 Why This Works

### The Problem with `router.back()`
```typescript
// History: [Dashboard, Puzzle, Dummy]
router.back();
// History: [Dashboard, Puzzle] ← Still on Puzzle page!
```

### The Solution with `router.push()`
```typescript
// History: [Dashboard, Puzzle, Dummy]
router.push('/dashboard');
// History: [Dashboard, Puzzle, Dummy, Dashboard]
// Browser navigates to the NEW Dashboard entry ✅
```

---

## 🧪 Testing

### Manual Test Checklist

1. **Swipe Back → Stay**
   - [ ] Open puzzle on mobile PWA
   - [ ] Swipe right (or press back button)
   - [ ] Modal appears: "Are you sure?"
   - [ ] Click "Stay" / "Cancel"
   - [ ] Modal closes, still on puzzle page ✅

2. **Swipe Back → Leave**
   - [ ] Swipe right again
   - [ ] Modal appears
   - [ ] Click "Yes, Go Back" / "Confirm"
   - [ ] **Navigates to verse page** ✅ (NOT stuck!)

3. **Multiple Swipes**
   - [ ] Swipe back → Click Stay
   - [ ] Swipe back again → Click Stay
   - [ ] Swipe back third time → Click Leave
   - [ ] Successfully exits ✅

4. **Puzzle Completion**
   - [ ] Complete puzzle
   - [ ] Success animation plays
   - [ ] Auto-navigates to next puzzle ✅
   - [ ] No modal appears ✅

5. **Mistake Limit**
   - [ ] Make 5 mistakes
   - [ ] Auto-exits to dashboard ✅
   - [ ] No modal appears ✅

6. **Back Button in Header**
   - [ ] Click back arrow in header
   - [ ] Modal appears ✅
   - [ ] Click "Leave"
   - [ ] Successfully exits ✅

---

## 🚀 Migration Guide

### If You're Using the Old Hook

**Before:**
```typescript
const isIntentionalExit = usePreventBack({
  onBackAttempt: () => setShowExitModal(true),
});

const handleExit = () => {
  isIntentionalExit.current = true; // ❌ No longer needed
  router.back(); // ❌ Causes history loop
};
```

**After:**
```typescript
usePreventBack(true, () => setShowExitModal(true));

const handleExit = () => {
  router.push('/dashboard'); // ✅ Hard exit
};
```

### Breaking Changes
1. **Hook API changed**: Now takes `(shouldPrevent, onPrevent)` instead of options object
2. **No return value**: Hook no longer returns `isIntentionalExit` ref
3. **Must use `router.push()`**: All exit handlers MUST use push, not back/replace

---

## 💡 Advanced Usage

### Conditional Prevention

```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

// Only prevent back if there are unsaved changes
usePreventBack(hasUnsavedChanges, () => setShowExitModal(true));
```

### Custom Exit Logic

```typescript
const handleExitConfirm = () => {
  // Save draft before exiting
  saveDraft();
  
  // Then exit with push()
  router.push('/dashboard');
};
```

### With Analytics

```typescript
usePreventBack(true, () => {
  trackEvent('back_attempt', { page: 'puzzle' });
  setShowExitModal(true);
});

const handleExitConfirm = () => {
  trackEvent('exit_confirmed', { page: 'puzzle' });
  router.push(backUrl);
};
```

---

## 🐛 Troubleshooting

### Issue: Still stuck in history loop

**Check:** Are you using `router.push()` instead of `router.back()`?
```typescript
// ❌ Wrong
router.back();

// ✅ Correct
router.push('/dashboard');
```

### Issue: Modal not showing on swipe

**Check:** Is `shouldPrevent` set to `true`?
```typescript
// ❌ Wrong - hook is disabled
usePreventBack(false, () => setShowExitModal(true));

// ✅ Correct
usePreventBack(true, () => setShowExitModal(true));
```

### Issue: Can't exit even after clicking "Yes"

**Check:** Does your exit handler close the modal AND call `router.push()`?
```typescript
// ❌ Wrong - modal stays open
const handleExit = () => {
  router.push('/dashboard');
};

// ✅ Correct - close modal first
const handleExit = () => {
  setShowExitModal(false);
  router.push('/dashboard');
};
```

---

## 📝 Summary

### Key Takeaways

1. ✅ **Use `router.push(url)`** to exit (NOT `router.back()`)
2. ✅ **Simplified API**: `usePreventBack(shouldPrevent, onPrevent)`
3. ✅ **Immediate re-arming**: Trap re-arms instantly in popstate handler
4. ✅ **No ref complexity**: Removed `isIntentionalExit` pattern
5. ✅ **Works on mobile PWAs**: Handles swipe-to-back gestures

### What Changed

| Old Implementation | New Implementation |
|-------------------|-------------------|
| `router.back()` → History loop | `router.push()` → Clean exit |
| Complex ref tracking | Simple boolean flag |
| Inconsistent behavior | Reliable on all platforms |

### Result

🎉 **No more history loops!** Users can now exit puzzles reliably on mobile PWAs.

---

## 📚 Related Files

- `/lib/hooks/usePreventBack.ts` - The fixed hook
- `/app/puzzle/[id]/PuzzleClient.tsx` - Updated exit handlers
- `/components/ConfirmExitModal.tsx` - The modal component

---

## 🔗 References

- [History API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [PopStateEvent - MDN](https://developer.mozilla.org/en-US/docs/Web/API/PopStateEvent)
- [Next.js Router - push vs back](https://nextjs.org/docs/app/api-reference/functions/use-router)

