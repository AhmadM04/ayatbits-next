# usePreventBack Hook - Usage Examples

## Basic Usage

### Example 1: Simple Modal Confirmation

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePreventBack } from '@/lib/hooks/usePreventBack';

export default function FormPage() {
  const [showExitModal, setShowExitModal] = useState(false);
  const router = useRouter();
  
  // Hook automatically intercepts back navigation
  const isIntentionalExit = usePreventBack({
    onBackAttempt: () => setShowExitModal(true),
  });
  
  const handleSubmit = () => {
    // Mark as intentional before navigating
    isIntentionalExit.current = true;
    router.push('/success');
  };
  
  const handleCancel = () => {
    isIntentionalExit.current = true;
    router.push('/dashboard');
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
      
      {showExitModal && (
        <ConfirmModal
          onStay={() => setShowExitModal(false)}
          onLeave={() => {
            isIntentionalExit.current = true;
            router.back();
          }}
        />
      )}
    </div>
  );
}
```

---

## Example 2: Quiz/Test Component

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePreventBack } from '@/lib/hooks/usePreventBack';

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const router = useRouter();
  
  const isIntentionalExit = usePreventBack({
    onBackAttempt: () => setShowExitWarning(true),
  });
  
  const handleQuizComplete = () => {
    // Allow navigation after completion
    isIntentionalExit.current = true;
    router.push('/results');
  };
  
  return (
    <div>
      <h1>Question {currentQuestion + 1}</h1>
      {/* Quiz content */}
      
      <ExitWarningModal
        isOpen={showExitWarning}
        message="You'll lose your progress if you leave now!"
        onStay={() => setShowExitWarning(false)}
        onLeave={() => {
          isIntentionalExit.current = true;
          router.push('/dashboard');
        }}
      />
    </div>
  );
}
```

---

## Example 3: Multi-Step Form

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePreventBack } from '@/lib/hooks/usePreventBack';

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [showExitModal, setShowExitModal] = useState(false);
  const router = useRouter();
  
  const isIntentionalExit = usePreventBack({
    onBackAttempt: () => {
      // If on first step, show modal
      // If on later steps, go back one step
      if (step === 1) {
        setShowExitModal(true);
      } else {
        setStep(step - 1);
      }
    },
  });
  
  const handleComplete = () => {
    isIntentionalExit.current = true;
    router.push('/confirmation');
  };
  
  return (
    <div>
      <h1>Step {step} of 3</h1>
      {/* Form steps */}
      
      {showExitModal && (
        <ConfirmExitModal
          onStay={() => setShowExitModal(false)}
          onLeave={() => {
            isIntentionalExit.current = true;
            router.back();
          }}
        />
      )}
    </div>
  );
}
```

---

## Example 4: Custom State Key (Multiple Guards)

```tsx
'use client';

import { useState } from 'react';
import { usePreventBack } from '@/lib/hooks/usePreventBack';

export default function NestedComponent() {
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  
  // Use different state keys for nested components
  const isIntentionalExit1 = usePreventBack({
    onBackAttempt: () => setShowModal1(true),
    stateKey: 'outerGuard',
  });
  
  const isIntentionalExit2 = usePreventBack({
    onBackAttempt: () => setShowModal2(true),
    stateKey: 'innerGuard',
  });
  
  return (
    <div>
      {/* Component with multiple guard levels */}
    </div>
  );
}
```

---

## Example 5: Conditional Prevention

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePreventBack } from '@/lib/hooks/usePreventBack';

export default function ConditionalForm() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  
  const isIntentionalExit = usePreventBack({
    onBackAttempt: () => {
      // Only show modal if there are unsaved changes
      if (hasUnsavedChanges) {
        setShowModal(true);
      } else {
        // Allow navigation if no changes
        isIntentionalExit.current = true;
        router.back();
      }
    },
  });
  
  const handleSave = async () => {
    await saveData();
    setHasUnsavedChanges(false);
    isIntentionalExit.current = true;
    router.push('/saved');
  };
  
  return (
    <div>
      <input onChange={() => setHasUnsavedChanges(true)} />
      <button onClick={handleSave}>Save</button>
      
      {showModal && (
        <UnsavedChangesModal
          onSave={handleSave}
          onDiscard={() => {
            isIntentionalExit.current = true;
            router.back();
          }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
```

---

## Example 6: With Analytics Tracking

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePreventBack } from '@/lib/hooks/usePreventBack';
import { trackEvent } from '@/lib/analytics';

export default function TrackedPage() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  
  const isIntentionalExit = usePreventBack({
    onBackAttempt: () => {
      // Track back attempt
      trackEvent('back_attempt', {
        page: 'puzzle',
        timestamp: Date.now(),
      });
      setShowModal(true);
    },
  });
  
  const handleConfirmExit = () => {
    trackEvent('exit_confirmed', { page: 'puzzle' });
    isIntentionalExit.current = true;
    router.back();
  };
  
  const handleStay = () => {
    trackEvent('exit_cancelled', { page: 'puzzle' });
    setShowModal(false);
  };
  
  return (
    <div>
      {/* Page content */}
      
      {showModal && (
        <ConfirmModal
          onStay={handleStay}
          onLeave={handleConfirmExit}
        />
      )}
    </div>
  );
}
```

---

## Example 7: Integration with Existing PuzzleClient

```tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePreventBack } from '@/lib/hooks/usePreventBack';

export default function PuzzleClient({ puzzle, nextPuzzleId }) {
  const [showExitModal, setShowExitModal] = useState(false);
  const router = useRouter();
  
  // PWA FIX: Prevent accidental back navigation
  const isIntentionalExit = usePreventBack({
    onBackAttempt: () => setShowExitModal(true),
  });
  
  const handleSolved = useCallback(() => {
    // Mark as intentional before auto-navigation
    isIntentionalExit.current = true;
    router.replace(`/puzzle/${nextPuzzleId}`);
  }, [nextPuzzleId, router]);
  
  const handleExitConfirm = () => {
    isIntentionalExit.current = true;
    setShowExitModal(false);
    router.replace('/dashboard');
  };
  
  const handleMistakeLimitExceeded = useCallback(() => {
    isIntentionalExit.current = true;
    router.replace('/dashboard');
  }, [router]);
  
  return (
    <div>
      <WordPuzzle
        onSolved={handleSolved}
        onMistakeLimitExceeded={handleMistakeLimitExceeded}
      />
      
      <ConfirmExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
      />
    </div>
  );
}
```

---

## Hook API Reference

### Parameters

```typescript
interface UsePreventBackOptions {
  /**
   * Callback to show the exit confirmation modal
   * Called when user attempts to navigate back
   */
  onBackAttempt: () => void;
  
  /**
   * Optional: State key to identify the guard state in history
   * Use different keys for nested components
   * @default 'guardState'
   */
  stateKey?: string;
}
```

### Return Value

```typescript
/**
 * Ref to track if exit is intentional
 * Set to true before programmatic navigation
 */
React.MutableRefObject<boolean>
```

---

## Best Practices

### ✅ DO

1. **Mark intentional exits**
   ```tsx
   isIntentionalExit.current = true;
   router.push('/next-page');
   ```

2. **Use for forms and quizzes**
   - Prevent data loss
   - Warn users about unsaved changes

3. **Clean up on completion**
   - Set `isIntentionalExit.current = true` before navigation
   - Let the hook handle cleanup

4. **Use custom state keys for nested guards**
   ```tsx
   usePreventBack({ onBackAttempt, stateKey: 'innerGuard' });
   ```

### ❌ DON'T

1. **Don't forget to mark intentional exits**
   ```tsx
   // BAD: Will show modal even after completion
   router.push('/next-page');
   
   // GOOD: Mark as intentional first
   isIntentionalExit.current = true;
   router.push('/next-page');
   ```

2. **Don't use on every page**
   - Only use where data loss is a concern
   - Don't annoy users with unnecessary modals

3. **Don't prevent navigation indefinitely**
   - Always provide a way to exit
   - Respect user's choice to leave

---

## Testing

### Manual Testing Checklist

- [ ] Swipe right on mobile - modal appears
- [ ] Click browser back button - modal appears
- [ ] Click "Stay" - modal closes, page remains
- [ ] Click "Leave" - navigates back
- [ ] Complete action - auto-navigates without modal
- [ ] Use keyboard shortcut (Alt+Left) - modal appears

### Automated Testing

```tsx
import { renderHook } from '@testing-library/react';
import { usePreventBack } from '@/lib/hooks/usePreventBack';

describe('usePreventBack', () => {
  it('should push guard state on mount', () => {
    const onBackAttempt = jest.fn();
    renderHook(() => usePreventBack({ onBackAttempt }));
    
    expect(window.history.state).toHaveProperty('guardState');
  });
  
  it('should call onBackAttempt when popstate fires', () => {
    const onBackAttempt = jest.fn();
    renderHook(() => usePreventBack({ onBackAttempt }));
    
    window.history.back();
    
    expect(onBackAttempt).toHaveBeenCalled();
  });
  
  it('should not intercept if intentional exit', () => {
    const onBackAttempt = jest.fn();
    const { result } = renderHook(() => usePreventBack({ onBackAttempt }));
    
    result.current.current = true; // Mark as intentional
    window.history.back();
    
    expect(onBackAttempt).not.toHaveBeenCalled();
  });
});
```

---

## Troubleshooting

### Issue: Modal shows even after completion

**Solution:** Make sure to set `isIntentionalExit.current = true` before navigation:

```tsx
const handleComplete = () => {
  isIntentionalExit.current = true; // ← Don't forget this!
  router.push('/next-page');
};
```

### Issue: Multiple modals appearing

**Solution:** Use different `stateKey` values for nested components:

```tsx
usePreventBack({ onBackAttempt, stateKey: 'outerGuard' });
usePreventBack({ onBackAttempt, stateKey: 'innerGuard' });
```

### Issue: Hook not working on iOS Safari

**Solution:** This is a known iOS limitation. The hook works on:
- ✅ PWAs (installed to home screen)
- ✅ Chrome/Firefox on iOS
- ⚠️ Safari in-browser (limited support)

---

## Related Hooks

- `useBeforeUnload` - Prevent page refresh/close
- `useBlocker` (React Router) - Similar functionality for React Router
- `usePrompt` (React Router v6) - Declarative navigation blocking

---

## License

This hook is part of the AyatBits project and follows the same license.

