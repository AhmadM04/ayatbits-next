# Duplicate Words Fix - Implementation Summary

## Problem
When an ayah contains duplicate words (e.g., "Ilahi" appearing twice), users could place the first instance correctly, but the second instance was rejected even when placed in the correct slot.

## Root Cause Analysis
The issue was NOT in the core logic - the matching was already comparing only `norm` (normalized text) values, not IDs or positions. However, the system lacked visibility into WHY rejections were happening.

## Changes Made

### 1. Enhanced Tokenization Logging (`lib/puzzle-logic.ts`)
- Added duplicate word detection during tokenization
- Logs each duplicate token as it's created with full details (id, text, norm, position)
- Provides summary of all duplicate words found in the ayah
- This helps developers verify that duplicate words receive identical `norm` values

### 2. Enhanced Placement Logging (`components/WordPuzzle.tsx`)
- Added detailed logging in `tryPlaceTokenOnSlot()` function
- Shows exactly what's being compared:
  - Token being placed (id, text, norm, position)
  - Expected token in slot (id, text, norm, position)
  - Whether norms match
  - Byte-level comparison of norm values (to catch invisible character differences)
- Clear success/rejection indicators

### 3. Enhanced Normalization (`lib/puzzle-logic.ts`)
- Added more zero-width character removal (including U+2060-2063)
- Added debug logging for normalization differences
- Shows byte-level differences when original and normalized text differ
- More comprehensive whitespace handling

### 4. Initialization Logging (`components/WordPuzzle.tsx`)
- Logs all tokens when puzzle initializes
- Shows the complete token structure for debugging

## How to Test

### Step 1: Find an Ayah with Duplicate Words
Look for ayahs where the same word appears multiple times (e.g., containing "Ilahi" or "Allah" multiple times).

### Step 2: Open Browser Console
1. Start the app: `npm run dev`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Navigate to a puzzle with duplicate words

### Step 3: Watch the Logs
You should see logs like:
```
[TOKENIZATION] Duplicate words found: "الله" (3x), "من" (2x)
[DUPLICATE] Token created (2x): { id: "token-5-5", text: "الله", norm: "اللـه", position: 5 }
[INIT] Original tokens created: 12
```

### Step 4: Try Placing Duplicate Words
1. Try to place the first instance of a duplicate word
2. Try to place the second instance of the same word
3. Watch console for:
```
[PLACEMENT] Attempting placement: {
  slotPosition: 3,
  token: { id: "token-5-5", text: "الله", norm: "اللـه" },
  expected: { id: "token-2-3", text: "الله", norm: "اللـه" },
  normMatch: true
}
[PLACEMENT] ✅ ACCEPTED - placing token
```

### Step 5: Verify Fix
- Both instances of duplicate words should be accepted in their correct slots
- If rejection occurs, check `normMatch` and byte arrays in console
- Byte arrays help identify invisible character differences

## Expected Behavior
- ✅ Each duplicate word should be placeable in ANY slot expecting that word
- ✅ The word "Ilahi" (instance 1) can go in slot expecting "Ilahi" (position 1)
- ✅ The word "Ilahi" (instance 2) can go in slot expecting "Ilahi" (position 2)
- ✅ Either instance can go in either slot - order doesn't matter for duplicates

## If Issues Persist

### Check Console Logs for:
1. **Different `norm` values** for same word
   - Look at byte arrays - may reveal invisible characters
   - Check normalization logs

2. **`normMatch: false`** when visually identical
   - Indicates normalization inconsistency
   - May need to add more character normalizations

3. **Slot already filled** messages
   - Indicates logic issue, not duplicate word issue

## Cleanup
Once testing confirms the fix works, remove debug logging:
- Remove console.log statements from `lib/puzzle-logic.ts`
- Remove console.log statements from `components/WordPuzzle.tsx`
- Keep enhanced normalization (it's an improvement)

## Technical Details

### How Duplicate Words Are Handled
The system creates separate tokens for each word in the ayah:
- Token 1: `{ id: "token-0-0", text: "Ilahi", norm: "الهي", position: 0 }`
- Token 2: `{ id: "token-1-1", text: "word", norm: "كلمه", position: 1 }`
- Token 3: `{ id: "token-2-2", text: "Ilahi", norm: "الهي", position: 2 }`

When placing:
- Bank contains shuffled tokens: [Token-2, Token-0, Token-1]
- Slots expect: [Token-0, Token-1, Token-2]
- User can place Token-2 in Slot-0 because `Token-2.norm === Slot-0.expected.norm`
- User can place Token-0 in Slot-2 because `Token-0.norm === Slot-2.expected.norm`

The key: **Only `norm` is compared, not IDs or positions**

### Why This Should Work
- Duplicate words have identical `norm` values after normalization
- The `tryPlaceTokenOnSlot` function only checks `token.norm !== expectedToken.norm`
- IDs and positions are ignored in the comparison
- Each token is removed from bank after placement (by ID), preventing duplicate placements

## Contact
If issues persist after this fix, the debug logs will show exactly where the comparison fails.

