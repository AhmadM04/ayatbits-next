# Tutorial/Tour System - Usage Examples for Mobile

## Basic Usage (No Changes Required)

The existing tutorial configuration continues to work as-is. All improvements are transparent:

```typescript
import { TutorialWrapper, TutorialStep } from '@/components/tutorial';

const steps: TutorialStep[] = [
  {
    id: 'welcome',
    target: '[data-tutorial="welcome-section"]',
    title: 'Welcome!',
    message: 'Let\'s get started with a quick tour',
    placement: 'bottom',
  },
];

function MyComponent() {
  return (
    <TutorialWrapper
      sectionId="my_section"
      steps={steps}
      delay={800}
    >
      <div data-tutorial="welcome-section">
        Welcome content here
      </div>
    </TutorialWrapper>
  );
}
```

## Advanced: Targeting Mobile Menu Items

### Step 1: Add data-tutorial to Mobile Menu Items

In your component (e.g., `DashboardContent.tsx`):

```tsx
{/* Mobile Menu Dropdown */}
<AnimatePresence>
  {showMobileMenu && (
    <motion.div className="md:hidden border-t">
      <div className="px-4 py-4 space-y-2">
        
        {/* Profile Link with Tutorial Target */}
        <Link 
          href="/dashboard/profile"
          data-tutorial="mobile-profile-link"  // ← Add this
          onClick={() => setShowMobileMenu(false)}
          className="flex items-center gap-3 p-3 hover:bg-gray-50"
        >
          <User className="w-5 h-5" />
          <span>View Profile</span>
        </Link>

        {/* Achievements Link with Tutorial Target */}
        <Link 
          href="/dashboard/achievements"
          data-tutorial="mobile-achievements-link"  // ← Add this
          onClick={() => setShowMobileMenu(false)}
          className="flex items-center gap-3 p-3 hover:bg-gray-50"
        >
          <Trophy className="w-5 h-5" />
          <span>Achievements</span>
        </Link>

      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### Step 2: Configure Tutorial Steps

```typescript
const mobileTutorialSteps: TutorialStep[] = [
  {
    id: 'mobile-profile',
    target: '[data-tutorial="mobile-profile-link"]',
    title: 'Your Profile',
    message: 'Access your profile and settings from here',
    placement: 'bottom',
  },
  {
    id: 'mobile-achievements',
    target: '[data-tutorial="mobile-achievements-link"]',
    title: 'Track Your Progress',
    message: 'View your achievements and unlock new trophies',
    placement: 'bottom',
  },
];
```

### Step 3: The Magic Happens Automatically! ✨

The system will automatically:
1. **Detect** that the target is hidden (inside collapsed menu)
2. **Open** the burger menu by clicking `[data-mobile-menu-toggle]`
3. **Wait** 200ms for animation to complete
4. **Scroll** the target into view
5. **Show** the tooltip centered on screen

**No extra code needed!**

## Real-World Example: Dashboard Tour

```typescript
// lib/tutorial-configs.ts

export const dashboardMobileTutorialSteps: TutorialStep[] = [
  // Step 1: Welcome (visible on load)
  {
    id: 'dashboard-welcome',
    target: '[data-tutorial="welcome-section"]',
    title: 'Welcome to AyatBits!',
    message: 'Let\'s take a quick tour of your dashboard',
    placement: 'bottom',
  },
  
  // Step 2: Juz Grid (visible on load)
  {
    id: 'dashboard-juz',
    target: '[data-tutorial="juz-grid"]',
    title: 'Explore the Quran',
    message: 'Choose any Juz to start your learning journey',
    placement: 'bottom',
  },
  
  // Step 3: Profile (HIDDEN in mobile menu) - Auto-opens menu!
  {
    id: 'dashboard-profile',
    target: '[data-tutorial="mobile-profile-link"]',
    title: 'Your Profile',
    message: 'Customize your learning experience here',
    placement: 'bottom',
  },
  
  // Step 4: Achievements (HIDDEN in mobile menu) - Menu already open!
  {
    id: 'dashboard-achievements',
    target: '[data-tutorial="mobile-achievements-link"]',
    title: 'Track Progress',
    message: 'Earn trophies as you complete challenges',
    placement: 'bottom',
  },
  
  // Step 5: Bottom Nav (visible, menu auto-closes)
  {
    id: 'dashboard-nav',
    target: '[data-tutorial="bottom-nav"]',
    title: 'Quick Navigation',
    message: 'Use the bottom bar to navigate quickly',
    placement: 'top',
  },
];
```

## Conditional Steps Based on Screen Size

You can create different tutorial flows for mobile and desktop:

```typescript
import { TutorialStep } from '@/components/tutorial';

function getDashboardSteps(): TutorialStep[] {
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    return [
      // Mobile-specific steps (includes burger menu items)
      { id: 'mobile-welcome', target: '[data-tutorial="welcome"]', ... },
      { id: 'mobile-menu-profile', target: '[data-tutorial="mobile-profile-link"]', ... },
      { id: 'mobile-menu-settings', target: '[data-tutorial="mobile-settings-link"]', ... },
    ];
  } else {
    return [
      // Desktop-specific steps (targets desktop header)
      { id: 'desktop-welcome', target: '[data-tutorial="welcome"]', ... },
      { id: 'desktop-header-profile', target: '[data-tutorial="profile-icon"]', ... },
      { id: 'desktop-header-settings', target: '[data-tutorial="settings-icon"]', ... },
    ];
  }
}

// Usage
function Dashboard() {
  const steps = useMemo(() => getDashboardSteps(), []);
  
  return (
    <TutorialWrapper sectionId="dashboard_intro" steps={steps}>
      {/* Your dashboard content */}
    </TutorialWrapper>
  );
}
```

## Pro Tips

### 1. Name Convention for Mobile Menu Items

Use consistent naming:
- `mobile-{feature}-link` for mobile menu items
- `desktop-{feature}-button` for desktop items
- `{feature}-section` for content areas

### 2. Test on Real Devices

```bash
# Start dev server accessible on network
npm run dev -- --host

# Access from phone: http://YOUR_IP:3000
```

### 3. Debug Mode

Add console logs to see what's happening:

```typescript
// In TutorialOverlay.tsx (already included)
if (element && isElementHidden(element)) {
  console.log('🔍 Element hidden, opening menu...');
  const menuOpened = tryOpenMobileMenu();
  console.log('📱 Menu opened:', menuOpened);
}
```

### 4. Graceful Fallback

If burger menu doesn't exist (desktop), the system continues normally:

```typescript
function tryOpenMobileMenu(): boolean {
  const burgerButton = document.querySelector('[data-mobile-menu-toggle]');
  
  if (!burgerButton) {
    console.log('No mobile menu found (probably desktop)');
    return false;  // Gracefully skip
  }
  
  // ... rest of logic
}
```

## Troubleshooting

### Issue: Tooltip still sticks to right edge
**Solution:** Ensure CSS is loaded:
```css
/* Check app/globals.css contains: */
.tour-tooltip-container {
  max-width: 90vw !important;
  right: auto !important;
}
```

### Issue: Menu doesn't open automatically
**Solution:** Verify burger button has the correct attribute:
```tsx
<button
  data-mobile-menu-toggle    // ← Must have this
  data-menu-open={showMobileMenu}  // ← Must reflect state
  aria-label="Menu"
>
```

### Issue: Target element not found
**Solution:** Check the selector format:
```typescript
// ✅ Correct
target: '[data-tutorial="my-element"]'

// ❌ Wrong (missing brackets)
target: 'data-tutorial="my-element"'

// ✅ Also works (auto-wrapped)
target: 'my-element'  // Becomes [data-tutorial="my-element"]
```

### Issue: Scroll lock doesn't work
**Solution:** Check if another component is overriding body overflow:
```typescript
// The system sets:
document.body.style.overflow = 'hidden';

// Make sure no other code is doing:
document.body.style.overflow = 'auto';  // after tour starts
```

## Performance Monitoring

Monitor tutorial performance:

```typescript
import { TutorialWrapper } from '@/components/tutorial';
import { useEffect } from 'react';

function MyComponent() {
  const startTime = Date.now();
  
  useEffect(() => {
    const endTime = Date.now();
    console.log(`Tutorial ready in ${endTime - startTime}ms`);
  }, []);
  
  return (
    <TutorialWrapper {...props}>
      {/* content */}
    </TutorialWrapper>
  );
}
```

## Accessibility

The tutorial system includes:
- ✅ Keyboard navigation (Escape, Enter, Arrow keys)
- ✅ ARIA labels on buttons
- ✅ Reduced motion support
- ✅ Focus management
- ✅ High contrast spotlight

To enhance further:

```typescript
{
  id: 'my-step',
  target: '[data-tutorial="my-element"]',
  title: 'My Step',
  message: 'Description here',
  placement: 'bottom',
  // Add custom aria label
  ariaLabel: 'Tutorial step 1 of 5: Welcome message',
}
```

## Next Steps

1. ✅ Read `TOUR_MOBILE_FIXES.md` for implementation details
2. ⚡ Add `data-tutorial` attributes to your components
3. 📱 Test on real mobile devices
4. 🎨 Customize tooltip styles if needed
5. 📊 Track analytics (optional)

## Support

Questions? Check:
- Implementation: `/components/tutorial/TutorialOverlay.tsx`
- Configuration: `/lib/tutorial-configs.ts`
- Management: `/lib/tutorial-manager.ts`

