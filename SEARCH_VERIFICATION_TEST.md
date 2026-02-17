# Search Component Verification Tests

## Quick Manual Test Cases

Open your browser console and test these searches:

### ✅ Test 1: Numeric Surah Search
```
Input: "2"
Expected: Navigate to Surah 2 (Al-Baqarah), Ayah 1
```

### ✅ Test 2: Coordinate Search (Numeric)
```
Input: "2:255"
Expected: Navigate to Surah 2, Ayah 255 (Ayat al-Kursi)
```

### ✅ Test 3: Transliteration Search
```
Input: "Baqarah"
Expected: Dropdown shows:
  2 - Al-Baqarah
  البقرة
```

### ✅ Test 4: Arabic Name Search (With Tashkeel)
```
Input: "البقرة"
Expected: Dropdown shows Surah 2
```

### ✅ Test 5: Arabic Name Search (Without Al)
```
Input: "يس"
Expected: Dropdown shows Surah 36 (Ya-Sin)
```

### ✅ Test 6: Partial Transliteration
```
Input: "Kahf"
Expected: Dropdown shows Surah 18 (Al-Kahf)
```

### ✅ Test 7: Text Coordinate (Transliteration)
```
Input: "Baqarah:255"
Expected: Navigate to Surah 2, Ayah 255
```

### ✅ Test 8: Text Coordinate (Arabic)
```
Input: "البقرة:255"
Expected: Navigate to Surah 2, Ayah 255
```

### ✅ Test 9: Space Separator
```
Input: "2 255"
Expected: Navigate to Surah 2, Ayah 255
```

### ✅ Test 10: Keyboard Navigation
```
1. Type: "al"
2. Press: ↓ arrow key
3. Press: ↓ arrow key again
4. Press: Enter
Expected: Navigate to selected Surah from dropdown
```

### ✅ Test 11: Popular Surahs
```
Input: "Rahman"
Expected: Dropdown shows Surah 55 (Ar-Rahman)
```

### ✅ Test 12: Short Surahs
```
Input: "Ikhlas"
Expected: Dropdown shows Surah 112 (Al-Ikhlas)
```

### ✅ Test 13: Alternative Names
```
Input: "Bara"
Expected: Should match Surah 9 (At-Tawbah, also known as Bara'ah)
```

### ✅ Test 14: Case Insensitive
```
Input: "BAQARAH" or "baqarah" or "BaQaRaH"
Expected: All should show same result
```

### ✅ Test 15: Arabic Without Prefix
```
Input: "فاتحة" (without ال)
Expected: Should match Surah 1 (Al-Fatiha)
```

---

## Code Verification Checklist

### ✅ Constants File (`lib/constants/surahs.ts`)
- [ ] All 114 Surahs are present
- [ ] Each Surah has id, transliteration, arabic, and tokens
- [ ] Tokens include multiple variants
- [ ] Helper functions export correctly
- [ ] TypeScript types are defined

### ✅ Component File (`components/VerseSearch.tsx`)
- [ ] Imports from new constants file
- [ ] State management includes searchResults
- [ ] parseQuery handles all patterns
- [ ] navigateToSurah function works
- [ ] handleKeyDown supports arrow keys
- [ ] Search results dropdown renders
- [ ] Clear button resets searchResults

---

## Expected Console Logs

When searching "Baqarah:255":
```
[VerseSearch] Parsing query: "Baqarah:255"
[VerseSearch] Text coordinate match found: Baqarah, verse 255
[VerseSearch] Resolved to Surah ID: 2
[VerseSearch] Navigating to: /dashboard/juz/1/surah/2?ayah=255
```

---

## Browser DevTools Check

### Network Tab
- API call to `/api/search/verse?surah=2&ayah=255` should fire
- Should fallback to static Juz mapping if API fails

### React DevTools
- searchResults state should update as you type
- selectedIndex should change with arrow keys
- query state should match input value

---

## Edge Cases to Test

### ✅ Invalid Inputs
```
Input: "999"
Expected: Error message "Surah not found"
```

```
Input: "xyz"
Expected: Empty dropdown (no matches)
```

```
Input: "2:0"
Expected: Error or no navigation (Ayah must be ≥ 1)
```

### ✅ Special Characters
```
Input: "Al-Baqarah" (with hyphen)
Expected: Should match Surah 2
```

```
Input: "Ya-Sin" (with hyphen)
Expected: Should match Surah 36
```

---

## Performance Check

- [ ] Dropdown appears instantly (< 100ms)
- [ ] No lag when typing quickly
- [ ] Arrow key navigation is smooth
- [ ] No unnecessary re-renders

---

## Accessibility Check

- [ ] Press 'F' key opens search modal
- [ ] Tab key navigates properly
- [ ] Escape key closes modal
- [ ] Screen reader announces results
- [ ] Keyboard-only navigation works

---

## Mobile Testing

- [ ] Touch to open dropdown items
- [ ] Smooth scrolling in results
- [ ] Clear button is easily tappable
- [ ] Examples are touch-friendly

---

## Final Verification

Run these commands to ensure code quality:

```bash
# TypeScript check
npx tsc --noEmit

# ESLint check (if applicable)
npm run lint

# Test search functionality
# Open: http://localhost:3000/dashboard
# Click search or press 'F'
# Try each test case above
```

---

## Known Working Examples

These should DEFINITELY work:

| Input | Expected Result |
|-------|----------------|
| `1` | Navigate to Al-Fatiha |
| `2:255` | Navigate to Ayat al-Kursi |
| `Fatiha` | Show Surah 1 in dropdown |
| `الفاتحة` | Show Surah 1 in dropdown |
| `Baqarah:1` | Navigate to Surah 2, Ayah 1 |
| `يس` | Show Ya-Sin in dropdown |
| `36` | Navigate to Ya-Sin |
| `Kahf` | Show Al-Kahf in dropdown |

---

## Success Criteria

✅ **All test cases pass**
✅ **No TypeScript errors**
✅ **No console errors**
✅ **Smooth user experience**
✅ **Fast search results**
✅ **Accurate navigation**

---

## If Issues Occur

### Search not working?
1. Check browser console for errors
2. Verify SURAHS import in VerseSearch.tsx
3. Check that lib/constants/surahs.ts exists
4. Verify SURAH_TO_JUZ mapping is correct

### Dropdown not showing?
1. Check searchResults state in React DevTools
2. Verify searchSurahs function is working
3. Check CSS classes for visibility

### Navigation not working?
1. Verify router.push is being called
2. Check SURAH_TO_JUZ mapping has the Surah
3. Verify Juz and Surah pages exist

---

**Ready to test!** 🚀

