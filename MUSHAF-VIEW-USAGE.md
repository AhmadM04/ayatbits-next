# 📖 MushafView Component - Usage Guide

## Overview

The `MushafView` component displays Quran verses in a **clean, block-justified layout** that mimics a traditional Mushaf (Quran book) appearance. Verses flow together continuously like a paragraph, with no floating icons disrupting the text flow.

---

## ✨ Features

### 1. **Block-Justified Layout**
- Text flows naturally from right to left (RTL)
- Verses connected in one continuous paragraph
- Last line centered for elegant appearance

### 2. **Visual Indicators (Text-Based Only)**
- ✅ **Completed verses**: Green text (`text-success`)
- ❌ **Liked verses**: NO visual indicator (clean look preserved)
- 🔘 **Normal verses**: Default foreground color

### 3. **Interactions**
- **Long press** (500ms) on any verse to open a modal/action
- **Hover effect**: Subtle background highlight
- **Smooth transitions**: 200ms color transitions

### 4. **End-of-Ayah Symbols**
- Inline Arabic symbol: `۝` followed by verse number
- Styled with reduced opacity for subtle appearance
- Uses sans font to distinguish from Quranic text

---

## 📄 Component API

```typescript
interface Verse {
  id: string;              // Unique identifier
  text_uthmani: string;    // Quranic text in Uthmani script
  verse_key: string;       // Format: "2:255" (Surah:Ayah)
  isCompleted: boolean;    // Completion status
  isLiked: boolean;        // Liked status (NOT visually indicated)
}

interface MushafViewProps {
  verses: Verse[];                          // Array of verses to display
  onVerseLongPress: (verse: Verse) => void; // Callback when user long-presses
}
```

---

## 🔧 How to Use

### Example 1: Basic Usage

```tsx
import MushafView from './MushafView';

function MyComponent() {
  const [verses, setVerses] = useState<Verse[]>([
    {
      id: '2:1',
      text_uthmani: 'الٓمٓ',
      verse_key: '2:1',
      isCompleted: true,
      isLiked: false,
    },
    {
      id: '2:2',
      text_uthmani: 'ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
      verse_key: '2:2',
      isCompleted: false,
      isLiked: true, // Won't show any visual indicator
    },
    // ... more verses
  ]);

  const handleVerseLongPress = (verse: Verse) => {
    console.log('Long pressed:', verse.verse_key);
    // Open modal, show options, etc.
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <MushafView
        verses={verses}
        onVerseLongPress={handleVerseLongPress}
      />
    </div>
  );
}
```

### Example 2: With Modal Integration

```tsx
'use client';

import { useState } from 'react';
import MushafView from './MushafView';
import VerseActionsModal from './VerseActionsModal';

export default function SurahPage() {
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  const handleVerseLongPress = (verse: Verse) => {
    setSelectedVerse(verse);
  };

  const closeModal = () => {
    setSelectedVerse(null);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-6">
        <MushafView
          verses={verses}
          onVerseLongPress={handleVerseLongPress}
        />
      </div>

      {selectedVerse && (
        <VerseActionsModal
          isOpen={!!selectedVerse}
          verse={selectedVerse}
          onClose={closeModal}
        />
      )}
    </>
  );
}
```

### Example 3: Fetching Verses from API

```tsx
'use client';

import { useEffect, useState } from 'react';
import MushafView from './MushafView';

export default function SurahView({ surahNumber }: { surahNumber: number }) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerses = async () => {
      try {
        const response = await fetch(
          `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNumber}`
        );
        const data = await response.json();

        const formattedVerses = data.verses.map((v: any) => ({
          id: v.verse_key,
          text_uthmani: v.text_uthmani,
          verse_key: v.verse_key,
          isCompleted: false, // Check from your database
          isLiked: false,     // Check from your database
        }));

        setVerses(formattedVerses);
      } catch (error) {
        console.error('Failed to fetch verses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [surahNumber]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <MushafView
      verses={verses}
      onVerseLongPress={(verse) => {
        console.log('Selected verse:', verse.verse_key);
      }}
    />
  );
}
```

---

## 🎨 Styling Details

### Container Styles

```css
/* Applied to the parent div */
text-align: justify;           /* Block justification */
direction: rtl;                /* Right-to-left */
font-family: Arabic font;      /* Uses font-arabic class */
font-size: 2xl (1.5rem);       /* 24px */
line-height: 2.6;              /* Relaxed spacing */
text-align-last: center;       /* Centers last line (Basmallah/end) */
```

### Verse Span Styles

```css
/* Each verse <span> */
position: relative;
padding: 0.125rem (2px horizontal);
transition: colors 200ms;
cursor: pointer;

/* Completed verses */
color: hsl(var(--success));    /* Green in both light/dark */

/* Normal verses */
color: hsl(var(--foreground)); /* Adapts to theme */

/* Hover state */
background: hsl(var(--muted)); /* Subtle highlight */
```

### End-of-Ayah Symbol

```css
font-family: sans-serif;       /* Distinguishes from Arabic text */
font-size: 1.25rem (20px);     /* Slightly smaller */
margin: 0 0.25rem;             /* 4px horizontal spacing */
opacity: 0.8;                  /* Subtle appearance */
```

---

## 🎯 Design Decisions

### Why No Icons for Liked Verses?

**Reason:** Icons break the clean, traditional Mushaf aesthetic. Users can still long-press any verse to see its liked status in the modal.

**Alternative:** If you MUST show liked status, use a very subtle indicator:

```tsx
{verse.isLiked && (
  <span className="inline-block w-1 h-1 bg-red-500 rounded-full ml-1 opacity-50" />
)}
```

### Why Inline End-of-Ayah Symbols?

**Reason:** Traditional Mushafs have inline verse markers, not floating ones. This maintains text flow and justification.

### Why `text-align-last: center`?

**Reason:** In traditional Mushafs, the Basmallah and the last line of a Surah are centered for aesthetic balance.

---

## 🔄 Theme Compatibility

The component uses semantic color tokens that automatically adapt to Light/Dark mode:

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Normal verse | Deep slate (`#0F172A`) | White (`#fafafa`) |
| Completed verse | Emerald (`#10B981`) | Neon green (`#10B981`) |
| Hover background | Very light grey (`#F3F4F6`) | Dark grey (`#262626`) |

---

## 📱 Mobile Optimization

The `useLongPress` hook handles both:
- **Touch devices**: Long touch (500ms) triggers action
- **Desktop**: Long mouse press or right-click triggers action

Scroll detection prevents accidental triggers when scrolling.

---

##  ✅ Accessibility

- **Cursor pointer**: Indicates interactive elements
- **Smooth transitions**: Visual feedback for state changes
- **Haptic feedback**: On mobile devices (vibration)
- **RTL support**: Proper right-to-left text flow

---

## 🐛 Common Issues

### Issue 1: Verses Not Flowing Together

**Cause:** Extra margins/padding on spans  
**Solution:** Ensure no CSS overrides add spacing

### Issue 2: End Marker Too Large/Small

**Cause:** Font-size inheritance  
**Solution:** Adjust `text-xl` to `text-lg` or `text-2xl` in the marker span

### Issue 3: Long Press Not Working

**Cause:** Conflicting touch event handlers  
**Solution:** Ensure no parent elements are capturing touch events

---

## 📚 Related Components

- `useLongPress` - `/lib/hooks/useLongPress.ts`
- Semantic color tokens - `/app/globals.css`
- Light Mode guide - `/THEME-MIGRATION-GUIDE.md`

---

## 🚀 Future Enhancements

Possible additions without breaking the clean aesthetic:

1. **Verse highlighting on tap** (temporary, fades out)
2. **Search highlighting** (yellow background for search results)
3. **Bookmarking** (small dot indicator, optional)
4. **Audio sync** (verse highlights as recitation plays)

---

**Result:** A clean, elegant Mushaf view that respects traditional Quran book aesthetics while providing modern interaction! 📖✨

