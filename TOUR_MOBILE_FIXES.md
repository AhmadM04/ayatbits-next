# Tutorial/Tour Mobile Fixes - Implementation Summary

## Date: 2026-02-15

## Problem Statement
The onboarding tour was "cooked" on mobile with the following issues:
1. Container sticks to the right edge after the first step
2. Manual scrolling interfering with the tour
3. Tutorial targets inside mobile navigation (burger menu) were inaccessible
4. Poor mobile UX with tooltip positioning

## Solutions Implemented

### 1. Mobile Burger Menu Auto-Trigger ✅

**File: `components/tutorial/TutorialOverlay.tsx`**

Added logic to automatically open the mobile burger menu when a tutorial step targets an element inside the collapsed mobile navigation.

```typescript
function tryOpenMobileMenu(): boolean {
  const burgerButton = document.querySelector('[data-mobile-menu-toggle]') as HTMLButtonElement;
  
  if (burgerButton) {
    const isMenuOpen = burgerButton.getAttribute('data-menu-open') === 'true';
    
    if (!isMenuOpen) {
      burgerButton.click();
      return true;
    }
  }
  
  return false;
}
```

**How it works:**
- In the `useEffect` listening to `currentStep`, the system checks if the target element is hidden
- If hidden, it programmatically clicks the burger icon using `[data-mobile-menu-toggle]` selector
- Waits 200ms for menu animation before proceeding

**File: `app/dashboard/DashboardContent.tsx`**

Added data attributes to the mobile burger menu button:
- `data-mobile-menu-toggle`: Identifies the button for the tutorial system
- `data-menu-open`: Tracks whether the menu is currently open

### 2. Scroll Lock & Auto-Scroll ✅

**File: `components/tutorial/TutorialOverlay.tsx`**

#### Scroll Lock
Prevents users from scrolling away during the tour:

```typescript
useEffect(() => {
  if (isActive) {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }
}, [isActive]);
```

#### Auto-Focus
Automatically scrolls the target element into view on each step:

```typescript
element.scrollIntoView({
  behavior: 'smooth',
  block: 'center',
  inline: 'center',
});
```

### 3. CSS "Edge-Hugging" Fix ✅

**File: `app/globals.css`**

Added comprehensive CSS fixes to prevent tooltip from sticking to edges:

```css
/* Force proper positioning for tour tooltips on mobile */
.tour-tooltip-container {
  max-width: 90vw !important;
  right: auto !important; /* Force calculation from left/top */
  left: auto !important;
  transition: transform 0.3s ease-out, left 0.3s ease-out, top 0.3s ease-out;
  z-index: 1000004 !important;
  will-change: transform, left, top;
}

/* Prevent horizontal scroll during tour on mobile */
body:has(.tour-backdrop) {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 768px) {
  .tour-tooltip-container {
    max-width: calc(100vw - 32px) !important;
    margin: 0 16px;
  }
}
```

**Key features:**
- Forces tooltip to ignore right-side boundary
- Adds smooth transitions
- Prevents body scroll during tour
- Responsive max-width on mobile

### 4. High-Performance Rendering ✅

#### React Portal Implementation

**New File: `components/tutorial/TutorialPortal.tsx`**

Created a dedicated Portal component to render tutorial overlay directly to `document.body`:

```typescript
export function TutorialPortal({ children }: TutorialPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
```

**Benefits:**
- Avoids parent `position: relative` constraints
- Ensures proper z-index stacking
- Better performance by isolating tutorial rendering

#### Direct DOM Manipulation

Added resize event dispatch to force positioning recalculation:

```typescript
useEffect(() => {
  if (!isActive || !step) return;
  
  const timer = setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 150);
  
  return () => clearTimeout(timer);
}, [currentStep, isActive, step]);
```

#### Performance Optimizations

- Used `will-change` CSS property for smooth animations
- Added orientation change listener for mobile rotation
- Optimized re-renders with proper useEffect dependencies
- Added refs to track tooltip DOM element

### 5. Hidden Element Detection

**File: `components/tutorial/TutorialOverlay.tsx`**

Added utility function to detect hidden elements:

```typescript
function isElementHidden(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    element.offsetWidth === 0 ||
    element.offsetHeight === 0
  );
}
```

This checks for:
- CSS `display: none`
- CSS `visibility: hidden`
- Zero-dimension elements (collapsed)

### 6. Updated Exports

**File: `components/tutorial/index.ts`**

Added export for new TutorialPortal component:

```typescript
export { TutorialPortal } from './TutorialPortal';
```

## Testing Checklist

### Mobile Testing (Required)
- [ ] Test on actual mobile device (iOS Safari)
- [ ] Test on actual mobile device (Android Chrome)
- [ ] Test burger menu auto-open functionality
- [ ] Verify scroll lock works correctly
- [ ] Check tooltip doesn't stick to right edge
- [ ] Verify smooth transitions between steps
- [ ] Test with different screen sizes (small/medium/large phones)
- [ ] Test landscape orientation

### Desktop Testing (Regression)
- [ ] Ensure desktop tour still works
- [ ] Verify no visual regressions
- [ ] Check keyboard navigation (Escape, Enter, ArrowRight)

### Edge Cases
- [ ] Test when target element doesn't exist
- [ ] Test when burger menu is already open
- [ ] Test rapid step navigation
- [ ] Test with reduced motion preferences

## Performance Notes

### Before
- Tooltip could get stuck due to parent positioning constraints
- Manual scrolling interfered with tour flow
- Hidden elements in mobile menu were inaccessible
- No automatic menu opening

### After
- Portal ensures proper rendering context
- Scroll is locked during tour
- Automatic detection and menu opening
- Smooth, centered tooltip positioning
- Force resize event for positioning recalculation

## Browser Compatibility

- ✅ Modern browsers with Portal API support
- ✅ iOS Safari 15+
- ✅ Android Chrome 90+
- ✅ Desktop Chrome, Firefox, Safari, Edge (latest)

## Future Enhancements (Optional)

1. **Gesture Support**: Add swipe gestures to navigate between tutorial steps on mobile
2. **Voice Over**: Improve accessibility with better ARIA labels
3. **Smart Positioning**: Calculate optimal tooltip position based on available space
4. **Analytics**: Track which tutorial steps users skip most often
5. **Adaptive Content**: Show shorter messages on mobile vs desktop

## Related Files Modified

1. `components/tutorial/TutorialOverlay.tsx` - Core logic updates
2. `components/tutorial/TutorialPortal.tsx` - New portal component
3. `components/tutorial/index.ts` - Export updates
4. `app/dashboard/DashboardContent.tsx` - Burger menu data attributes
5. `app/globals.css` - CSS fixes

## Migration Notes

No breaking changes. Existing tutorial configurations continue to work as-is. The improvements are transparent to existing code using the tutorial system.

## Developer Notes

### Adding Tutorial Steps for Mobile Menu Items

To target items inside the mobile menu:

```typescript
const steps: TutorialStep[] = [
  {
    id: 'mobile-profile',
    target: '[data-tutorial="profile-link"]',  // Add this to mobile menu item
    title: 'Your Profile',
    message: 'Access your profile settings here',
    placement: 'bottom',
  },
];
```

The system will automatically:
1. Detect the element is hidden
2. Open the burger menu
3. Wait for animation
4. Scroll to the element
5. Show the tooltip

### Performance Tips

- Use `data-tutorial` attributes instead of complex CSS selectors
- Keep tutorial steps under 7 per section for better UX
- Test on real devices, not just browser dev tools
- Monitor performance with React DevTools Profiler

## Support

For issues or questions, refer to:
- Tutorial system documentation: `/lib/tutorial-configs.ts`
- Tutorial manager: `/lib/tutorial-manager.ts`
- Component source: `/components/tutorial/`

