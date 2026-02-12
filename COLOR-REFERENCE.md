# 🎨 Quick Color Reference Card

## Common Replacements

### Backgrounds
```tsx
// OLD ❌
bg-[#0a0a0a]          → bg-background
bg-[#1a1a1a]          → bg-card
bg-[#0f0f0f]          → bg-muted/30
bg-white/5            → bg-muted
bg-white/10           → bg-muted/80
bg-white/[0.02]       → bg-card/50

// SPECIAL - Puzzle Components
bg-[#1a1a1a]/50       → bg-puzzle-slot (for empty slots)
bg-[#1a1a1a]          → bg-puzzle-word (for word tiles)
```

### Text Colors
```tsx
// OLD ❌
text-white            → text-foreground
text-gray-300         → text-card-foreground
text-gray-400         → text-muted-foreground
text-gray-500         → text-muted-foreground
text-gray-600         → text-muted-foreground
text-green-400        → text-success (or text-primary)
text-red-400          → text-error
```

### Borders
```tsx
// OLD ❌
border-white/10       → border-border
border-white/20       → border-border
border-white/5        → border-border
border-[#27272a]      → border-border

// SPECIAL - Puzzle Components
border-white/10       → border-puzzle-word-border (for word tiles)
border-white/20       → border-puzzle-slot-border (for slots)
```

### Success/Error States
```tsx
// SUCCESS
text-green-400        → text-success
text-green-600        → text-success
bg-green-500/20       → bg-success-soft
bg-green-500/30       → bg-success/30
border-green-500      → border-success
border-green-400      → border-success

// ERROR
text-red-400          → text-error
bg-red-500/20         → bg-error-soft
border-red-500/30     → border-error/30
```

### Hover States
```tsx
// OLD ❌
hover:bg-white/5      → hover:bg-muted
hover:bg-white/10     → hover:bg-muted/80
hover:text-gray-300   → hover:text-foreground
hover:border-white/20 → hover:border-border
```

---

## Available Semantic Classes

### Core Colors (Tailwind CSS v4)
- `bg-background` - Main page background
- `bg-foreground` - Inverse background (rarely used)
- `text-foreground` - Primary text color
- `text-background` - Inverse text (rarely used)

### Cards & Surfaces
- `bg-card` - Card backgrounds
- `text-card-foreground` - Text on cards
- `border-card` - Card borders (if needed)

### Muted/Secondary
- `bg-muted` - Subtle backgrounds (hover states, disabled)
- `text-muted-foreground` - Secondary/muted text
- `border-muted` - Muted borders

### Borders & Inputs
- `border-border` - Standard borders
- `border-input` - Input field borders
- `ring-ring` - Focus ring color

### Brand/Primary
- `bg-primary` - Primary brand color (green)
- `text-primary` - Primary brand text
- `bg-primary-foreground` - Text on primary backgrounds
- `border-primary` - Primary borders

### State Colors
- `text-success` - Success states (green)
- `bg-success-soft` - Success backgrounds
- `text-error` - Error states (red)
- `bg-error-soft` - Error backgrounds

### Puzzle-Specific
- `bg-puzzle-slot` - Empty puzzle slots
- `border-puzzle-slot-border` - Slot borders
- `bg-puzzle-word` - Word tiles
- `border-puzzle-word-border` - Word tile borders

---

## Light Mode Enhancements

### Add Shadows in Light Mode
```tsx
// ✅ Add shadow that disappears in dark mode
<div className="shadow-sm dark:shadow-none">
  {/* Content */}
</div>

<div className="shadow-md dark:shadow-none">
  {/* More prominent shadow */}
</div>
```

### Conditional Classes for Light/Dark
```tsx
// ✅ Different styles per theme
<div className="bg-white dark:bg-[#1a1a1a]">
  {/* Only use for special cases! */}
</div>

// ✅ Better - Use semantic classes that adapt automatically
<div className="bg-card">
  {/* Automatically white in light, #1a1a1a in dark */}
</div>
```

---

## CSS Variables (for custom CSS)

If you need to use colors in custom CSS (not Tailwind classes):

```css
/* ✅ Use HSL variables */
.my-custom-class {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}

/* ✅ With opacity */
.my-overlay {
  background: hsl(var(--background) / 0.9);
}

/* ✅ Puzzle colors */
.puzzle-slot {
  background: hsl(var(--puzzle-slot-bg));
  border: 2px dashed hsl(var(--puzzle-slot-border));
}
```

---

## grep Commands for Finding Old Colors

```bash
# Find all hardcoded black backgrounds
grep -r "bg-\[#0[a-f]0[a-f]0[a-f]\]" --include="*.tsx" --include="*.jsx"

# Find all hardcoded grey backgrounds
grep -r "bg-\[#1[a-f]1[a-f]1[a-f]\]" --include="*.tsx" --include="*.jsx"

# Find text-white (may need manual review)
grep -r "text-white\b" --include="*.tsx" --include="*.jsx"

# Find opacity-based borders
grep -r "border-white/[0-9]" --include="*.tsx" --include="*.jsx"

# Find grey text colors
grep -r "text-gray-[3-6]00" --include="*.tsx" --include="*.jsx"

# Find green colors
grep -r "text-green-[3-6]00" --include="*.tsx" --include="*.jsx"
grep -r "bg-green-[3-6]00" --include="*.tsx" --include="*.jsx"
```

---

## Theme Values Reference

### Light Mode ("Modern Parchment")
```
Background: hsl(250, 248, 245) = #FAF8F5 (warm off-white)
Foreground: hsl(15, 23, 42)    = #0F172A (deep slate)
Card:       hsl(0, 0%, 100%)   = #FFFFFF (pure white)
Muted:      hsl(210, 40%, 96%) = #F3F4F6 (very light grey)
Border:     hsl(214, 32%, 91%) = #E5E7EB (light grey)
Primary:    hsl(158, 64%, 52%) = #10B981 (emerald)
```

### Dark Mode ("Cyber-Mushaf")
```
Background: hsl(0, 0%, 4%)     = #0a0a0a (void black)
Foreground: hsl(0, 0%, 98%)    = #fafafa (white)
Card:       hsl(0, 0%, 10%)    = #1a1a1a (card grey)
Muted:      hsl(0, 0%, 15%)    = #262626 (dark grey)
Border:     hsl(0, 0%, 15%)    = #262626 (subtle)
Primary:    hsl(158, 64%, 52%) = #10B981 (neon green)
```

---

## Pro Tips

1. **Search before replacing**: Use `grep` to find all instances first
2. **Test both themes**: Always check Light + Dark mode after changes
3. **Use semantic names**: Prefer `text-foreground` over conditional classes
4. **Add shadows in Light Mode**: Use `shadow-sm dark:shadow-none` for depth
5. **Check contrast**: Light mode needs darker greens for readability
6. **Puzzle components**: Use specialized `puzzle-*` classes for consistency

---

**🎯 Goal:** Replace ALL hardcoded colors with semantic classes so the entire app adapts automatically when users switch themes!

