# Performance-Based Animation Control System

## Overview

This system automatically detects device performance and battery status to conditionally disable or reduce animations on low-powered devices, preventing lag and improving UX on older phones and low battery situations.

## Implementation Summary

### Core Components Created

1. **Performance Detection Utility** (`lib/performance-detection.ts`)
   - Detects battery level and charging status (Battery Status API)
   - Checks device CPU cores (`navigator.hardwareConcurrency`)
   - Checks device memory (`navigator.deviceMemory`)
   - Monitors network connection type (`navigator.connection`)
   - Respects user's motion preference (`prefers-reduced-motion`)
   - Calculates performance tier: `high` | `medium` | `low`

2. **Motion Context & Provider** (`lib/contexts/motion-context.tsx`)
   - Global context for animation preferences
   - Monitors battery, network, and preference changes in real-time
   - Provides manual override via localStorage
   - Exposes: `shouldReduceMotion`, `performanceTier`, `forceReducedMotion()`

3. **useReducedMotion Hook** (`lib/hooks/useReducedMotion.ts`)
   - Simple hook to check if animations should be reduced
   - Returns `true` when:
     - User prefers reduced motion (accessibility)
     - Device performance tier is low
     - Battery < 20% and not charging
     - Manual override enabled

4. **ConditionalMotion Component** (`components/ConditionalMotion.tsx`)
   - Smart wrapper that renders `motion.*` when animations enabled
   - Falls back to plain HTML elements when reduced motion active
   - Maintains layout without animation overhead
   - Includes helper components: `ConditionalAnimatePresence`, `useConditionalVariants`

### Updated Components

#### High-Impact (Priority 1)
- ✅ **WordPuzzle** (`components/WordPuzzle.tsx`)
  - Word-by-word recitation glow/pulse animations
  - Draggable word shake animations
  - Drop slot scale animations
  - Transliteration hover effects

- ✅ **TutorialOverlay** (`components/tutorial/TutorialOverlay.tsx`)
  - Backdrop fade animations
  - Spotlight animations
  - Pulsing glow effect (completely disabled when reduced motion)
  - Tooltip entrance animations

- ✅ **VerseSearch** (`components/VerseSearch.tsx`)
  - Modal open/close animations
  - Backdrop fade

#### Medium-Impact (Priority 2)
- ✅ **PageTransition** (`components/PageTransition.tsx`)
  - Page navigation transitions

- ✅ **Landing Page** (`app/page.tsx`)
  - Floating Arabic words background (static when reduced motion)
  - Hero section animations
  - Feature card animations
  - Stats section animations

#### Root Integration
- ✅ **Root Layout** (`app/layout.tsx`)
  - Added `MotionProvider` to wrap entire app
  - Placed after `ThemeProvider` for proper context hierarchy

## How It Works

### Detection Logic

The system calculates a performance score (0-100) based on:
- **Battery Level** (mobile only):
  - < 20%: -40 points (critical)
  - < 50%: -20 points (low)
- **CPU Cores**:
  - ≤ 2 cores: -25 points
  - ≤ 4 cores: -10 points
- **Device Memory**:
  - ≤ 2GB: -25 points
  - ≤ 4GB: -10 points
- **Network Connection**:
  - 2G/slow-2G: -15 points
  - 3G: -5 points
- **Mobile Device**: -5 points

**Performance Tiers**:
- **High**: Score ≥ 70 (full animations)
- **Medium**: Score 40-69 (some animations)
- **Low**: Score < 40 (minimal/no animations)

### Graceful Degradation

When `shouldReduceMotion` is `true`:

| Feature | Full Animation | Reduced Motion |
|---------|---------------|----------------|
| **Modals** | Fade in/out, scale | Instant show/hide |
| **Tutorial** | Pulsing glow, spotlight fade | Static spotlight only |
| **Word Puzzle** | Shake, scale, glow effects | Static border color changes |
| **Word-by-word Audio** | Pulsing glow animation | Simple ring border |
| **Page Transitions** | Opacity/position changes | Instant navigation |
| **Floating Elements** | Animated movement | Static positioning |
| **Feature Cards** | Staggered fade-in | Instant display |

## Usage Examples

### Basic Usage

```tsx
import { ConditionalMotion, useReducedMotion } from '@/components/ConditionalMotion';

function MyComponent() {
  return (
    <ConditionalMotion
      as="div"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-class"
    >
      Content here
    </ConditionalMotion>
  );
}
```

### Conditional Rendering

```tsx
function MyComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div>
      {!shouldReduceMotion ? (
        <motion.div animate={{ rotate: 360 }}>
          Animated content
        </motion.div>
      ) : (
        <div>Static content</div>
      )}
    </div>
  );
}
```

### AnimatePresence Wrapper

```tsx
import { ConditionalAnimatePresence } from '@/components/ConditionalMotion';

function MyComponent() {
  return (
    <ConditionalAnimatePresence>
      {isOpen && (
        <ConditionalMotion
          as="div"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Modal content
        </ConditionalMotion>
      )}
    </ConditionalAnimatePresence>
  );
}
```

### Manual Override

```tsx
import { useMotionContext } from '@/components/ConditionalMotion';

function SettingsPanel() {
  const { shouldReduceMotion, forceReducedMotion } = useMotionContext();
  
  return (
    <button onClick={() => forceReducedMotion(!shouldReduceMotion)}>
      {shouldReduceMotion ? 'Enable' : 'Disable'} Animations
    </button>
  );
}
```

## Browser Compatibility

- **Battery Status API**: Chrome, Edge, Opera (not Safari/Firefox)
- **Device Memory**: Chrome, Edge, Opera
- **Network Information API**: Chrome, Edge, Opera, Samsung Internet
- **Hardware Concurrency**: All modern browsers
- **prefers-reduced-motion**: All modern browsers

Graceful fallbacks are provided when APIs are unavailable.

## Performance Benefits

### Expected Improvements

1. **Reduced Jank**: 60fps on older devices by eliminating heavy animations
2. **Battery Savings**: 10-20% longer battery life on low-power devices
3. **Faster Load Times**: Reduced JavaScript execution for animation calculations
4. **Accessibility**: Respects user preferences for reduced motion
5. **Better UX**: Smooth experience across all device capabilities

### Metrics to Monitor

- Frame rate on low-end devices (target: 60fps)
- Battery drain rate during gameplay
- User engagement on mobile devices
- Accessibility compliance scores

## Testing Checklist

### Manual Testing

- [ ] Test on iPhone SE (2016) or equivalent
- [ ] Test on low-end Android (< 4GB RAM)
- [ ] Test with battery < 20% (not charging)
- [ ] Test with battery < 20% (charging)
- [ ] Test with slow 3G connection
- [ ] Test with `prefers-reduced-motion: reduce` enabled
- [ ] Test manual override toggle
- [ ] Test localStorage persistence

### Automated Testing

```bash
# Chrome DevTools
# 1. Open DevTools > Performance
# 2. Enable CPU throttling (4x slowdown)
# 3. Record interaction
# 4. Check for dropped frames

# Battery Status Simulation
# Chrome DevTools > Sensors > Battery
# Set level to 15%, charging: false
```

### Browser Testing

- Chrome/Edge (full support)
- Safari (partial support, no Battery API)
- Firefox (partial support, no Battery API)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

1. **User Settings Integration**: Add toggle in profile settings
2. **Analytics**: Track animation performance metrics
3. **A/B Testing**: Compare engagement with/without animations
4. **Progressive Enhancement**: More granular animation levels (high/medium/low)
5. **Smart Caching**: Remember device performance tier across sessions

## Troubleshooting

### Animations Not Disabling

1. Check if `MotionProvider` is in root layout
2. Verify browser supports detection APIs
3. Check console for errors
4. Test manual override: `localStorage.setItem('ayatbits-reduced-motion-override', 'true')`

### Animations Always Disabled

1. Check `prefers-reduced-motion` setting in OS
2. Clear localStorage: `localStorage.removeItem('ayatbits-reduced-motion-override')`
3. Check battery level and charging status
4. Verify performance tier calculation

### Hydration Errors

The system defaults to reduced motion on server-side rendering to prevent hydration mismatches. Animations are enabled on client after performance check completes.

## Contributing

When adding new animations:

1. Use `ConditionalMotion` instead of `motion.*`
2. Use `ConditionalAnimatePresence` instead of `AnimatePresence`
3. For complex animations, check `useReducedMotion()` and provide static fallback
4. Test on low-end devices
5. Document performance impact

## License

Part of AyatBits - Gamified Quranic Study Platform

