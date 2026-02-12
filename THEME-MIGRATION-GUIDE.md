# 🎨 AyatBits Light Mode Migration Guide

## Overview

This guide documents the implementation of **Light Mode** ("Modern Parchment") while preserving the **Dark Mode** ("Cyber-Mushaf") aesthetic. The refactor introduces **semantic CSS variables** and **Tailwind utility classes** that automatically adapt based on the theme.

---

## ✅ What Was Changed

### 1. **globals.css** - CSS Variables Refactor

**Before:** Hex color codes (`#ffffff`, `#0a0a0a`)  
**After:** HSL semantic variables (`hsl(var(--background))`, `hsl(var(--foreground))`)

#### Light Mode Palette: "Modern Parchment"
- **Background:** `#FAF8F5` - Warm off-white (paper-like)
- **Text:** `#0F172A` - Deep slate (high contrast)
- **Cards:** `#FFFFFF` - Pure white
- **Muted:** `#F3F4F6` - Very light grey
- **Primary (Green):** `#10B981` - Emerald (readable on white)
- **Borders:** `#E5E7EB` - Light grey

#### Dark Mode Palette: "Cyber-Mushaf" (Preserved)
- **Background:** `#0a0a0a` - Void black
- **Text:** `#fafafa` - White text
- **Cards:** `#1a1a1a` - Card grey
- **Muted:** `#262626` - Dark grey
- **Primary (Green):** `#10B981` - Neon green
- **Borders:** `#262626` - Subtle borders

### 2. **Tailwind Configuration** (CSS-based, Tailwind v4)

Since you're using **Tailwind v4**, configuration is done entirely in CSS using the `@theme inline` directive. No separate `tailwind.config.ts` file is needed.

The `@theme inline` section in `globals.css` now maps semantic variables to Tailwind utilities:

```css
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-primary: hsl(var(--primary));
  --color-muted: hsl(var(--muted));
  --color-border: hsl(var(--border));
  /* ... and more */
}
```

### 3. **Component Updates**

Updated the following components:
- ✅ `app/puzzle/[id]/PuzzleClient.tsx`
- ✅ `components/WordPuzzle.tsx`

---

## 📖 Color Replacement Reference

Use this table to update other components in your app:

| **Old (Hardcoded)** | **New (Semantic)** | **Usage** |
|---------------------|-------------------|-----------|
| `bg-[#0a0a0a]` | `bg-background` | Main page backgrounds |
| `bg-[#1a1a1a]` | `bg-card` | Card/container backgrounds |
| `text-white` | `text-foreground` | Primary text |
| `text-gray-400` | `text-muted-foreground` | Secondary/muted text |
| `text-gray-500` | `text-muted-foreground` | Placeholder text |
| `text-gray-300` | `text-card-foreground` | Card text (on dark cards) |
| `border-white/10` | `border-border` | Borders |
| `bg-white/5` | `bg-muted` | Subtle backgrounds |
| `bg-white/10` | `bg-muted/80` | Hover states |
| `text-green-400` | `text-success` or `text-primary` | Success states |
| `bg-green-500/20` | `bg-success-soft` | Success backgrounds |
| `text-red-400` | `text-error` | Error states |
| `bg-red-500/20` | `bg-error-soft` | Error backgrounds |

### Puzzle-Specific Classes

| **Old** | **New** | **Usage** |
|---------|---------|-----------|
| `bg-[#1a1a1a]/50` | `bg-puzzle-slot` | Empty puzzle slots |
| `border-white/20` | `border-puzzle-slot-border` | Slot borders |
| `bg-[#1a1a1a]` (word tiles) | `bg-puzzle-word` | Draggable word tiles |
| `border-white/10` (word tiles) | `border-puzzle-word-border` | Word tile borders |

---

## 🎨 Light Mode Specific Enhancements

### Shadows

In **Light Mode**, add shadows to elements to create depth (since we can't rely on dark borders):

```jsx
// ✅ GOOD - Automatic shadow in light mode
<div className="bg-puzzle-word shadow-sm dark:shadow-none">
  {/* Word tile */}
</div>

// ✅ GOOD - Hover effect with shadow
<button className="bg-card shadow-md hover:shadow-lg transition-shadow">
  Click me
</button>
```

### Green Text Contrast

In **Dark Mode**, we use `text-green-400` (bright neon).  
In **Light Mode**, this is too bright. Use `text-success` or `text-primary` instead, which automatically adjusts:

- **Dark Mode:** Bright green (`#10B981`)
- **Light Mode:** Darker green (`#16a34a`) for better readability

---

## 🔍 How to Find & Replace in Your Codebase

Use these search patterns to update remaining files:

### 1. **Backgrounds**
```bash
# Find hardcoded black backgrounds
grep -r "bg-\[#0a0a0a\]" --include="*.tsx" --include="*.jsx"
# Replace with: bg-background

# Find hardcoded card backgrounds
grep -r "bg-\[#1a1a1a\]" --include="*.tsx" --include="*.jsx"
# Replace with: bg-card
```

### 2. **Text Colors**
```bash
# Find hardcoded white text
grep -r "text-white" --include="*.tsx" --include="*.jsx"
# Replace with: text-foreground (where appropriate)

# Find grey text colors
grep -r "text-gray-[345]00" --include="*.tsx" --include="*.jsx"
# Replace with: text-muted-foreground
```

### 3. **Borders**
```bash
# Find opacity-based borders
grep -r "border-white/\(10\|20\)" --include="*.tsx" --include="*.jsx"
# Replace with: border-border
```

### 4. **Green Accents**
```bash
# Find hardcoded green colors
grep -r "text-green-[34]00" --include="*.tsx" --include="*.jsx"
# Replace with: text-success or text-primary

grep -r "bg-green-500/20" --include="*.tsx" --include="*.jsx"
# Replace with: bg-success-soft
```

---

## 🧪 Testing Checklist

After updating components, test both themes:

### Light Mode ("Modern Parchment")
- [ ] Background is warm off-white (`#FAF8F5`)
- [ ] Text is highly readable (dark slate on light background)
- [ ] Cards have subtle shadows for depth
- [ ] Green accents are darker and readable
- [ ] Borders are visible but not harsh

### Dark Mode ("Cyber-Mushaf")
- [ ] Background is deep black (`#0a0a0a`)
- [ ] Text is bright white
- [ ] Green accents are neon and vibrant
- [ ] Borders are subtle (white/10 opacity)
- [ ] No unnecessary shadows

### Both Modes
- [ ] Hover states work correctly
- [ ] Focus rings are visible
- [ ] Error/success states are clear
- [ ] Puzzle slots and words are distinguishable
- [ ] Animations don't flicker

---

## 🎯 Key Design Decisions

### Why HSL instead of RGB?

HSL (Hue, Saturation, Lightness) makes it easier to create consistent color variations:

```css
/* ✅ Easy to adjust opacity */
background: hsl(var(--primary) / 0.2); /* 20% opacity */

/* ✅ Easy to create lighter/darker variants */
--primary: 158 64% 52%;
--primary-dark: 158 64% 40%; /* Reduce lightness */
```

### Why Semantic Names?

Instead of `--color-green-500`, we use `--color-success`. This:
- Makes intent clear (success vs. just "green")
- Allows theme-specific adjustments (light mode uses darker green)
- Easier to maintain across themes

### Why Puzzle-Specific Variables?

Puzzle components have unique visual requirements:
- **Slots:** Need different backgrounds/borders in light vs. dark
- **Words:** Need shadows in light mode but not dark
- **Slots must be distinguishable from words in both themes**

By creating dedicated variables (`--puzzle-slot-bg`, `--puzzle-word-bg`), we ensure consistency.

---

## 🚀 Next Steps

1. **Update remaining components** using the Find & Replace guide above
2. **Test theme switching** on all pages
3. **Check mobile responsiveness** in both themes
4. **Verify accessibility** (contrast ratios, focus states)
5. **Update any custom CSS** that uses hardcoded colors

---

## 📚 Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [HSL Color Picker](https://www.w3schools.com/colors/colors_hsl.asp)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🎉 Result

You now have:
- ✅ A fully functional **Light Mode** with a clean, paper-like aesthetic
- ✅ A preserved **Dark Mode** with the iconic "Cyber-Mushaf" look
- ✅ Semantic color system that's easy to maintain
- ✅ Automatic theme switching via your existing `ThemeContext`
- ✅ Enhanced puzzle visibility with smart shadows and contrasts

**Your puzzle components will automatically adapt when users switch themes!** 🌓

