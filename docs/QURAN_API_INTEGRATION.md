# Quran API Integration

This project uses the **Al-Quran Cloud API** (`api.alquran.cloud`) to fetch surahs, juzs, and ayahs, matching the Expo project's API usage.

## Configuration

The ayah slicing behavior can be configured to match your Expo project exactly. Edit `lib/quran-config.ts` or set environment variables:

### Environment Variables

```env
# Number of ayahs per puzzle (default: 1)
AYAH_CHUNK_SIZE=1

# Whether to create overlapping chunks (default: false)
AYAH_OVERLAP=false

# Minimum ayah length in words (default: 3)
MIN_AYAH_LENGTH=3

# Maximum ayah length in words (default: 50)
MAX_AYAH_LENGTH=50
```

### Configuration Options

#### `AYAH_CHUNK_SIZE`
- **1** (default): One ayah per puzzle - most common setup
- **2**: Two ayahs per puzzle
- **3+**: Multiple ayahs per puzzle

#### `AYAH_OVERLAP`
- **false** (default): Non-overlapping chunks
  - Example: Puzzle 1 = Ayah 1, Puzzle 2 = Ayah 2, Puzzle 3 = Ayah 3
- **true**: Overlapping chunks (sliding window)
  - Example: Puzzle 1 = Ayahs 1-2, Puzzle 2 = Ayahs 2-3, Puzzle 3 = Ayahs 3-4

## Matching Expo Project Settings

To match your Expo project's ayah slicing:

1. Check your Expo project's configuration for:
   - How many ayahs per puzzle?
   - Are chunks overlapping or non-overlapping?
   - Any minimum/maximum length filters?

2. Update `lib/quran-config.ts` or set environment variables accordingly

3. Run the seed script:
   ```bash
   npm run db:seed
   ```

## API Endpoints Used

- **All Surahs**: `GET https://api.alquran.cloud/v1/quran/quran-uthmani`
- **Single Surah**: `GET https://api.alquran.cloud/v1/surah/{number}`
- **Juz**: `GET https://api.alquran.cloud/v1/juz/{number}/quran-uthmani`

## Data Structure

### Surah
- `number`: 1-114
- `name`: Arabic name
- `englishName`: English transliteration
- `englishNameTranslation`: English translation
- `numberOfAyahs`: Total ayahs in surah
- `ayahs`: Array of ayah objects

### Ayah
- `number`: Global ayah number
- `numberInSurah`: Ayah number within surah (1-indexed)
- `text`: Arabic text
- `juz`: Juz number (1-30)
- `page`: Page number in Mushaf
- `ruku`: Ruku number
- `hizbQuarter`: Hizb quarter number

## Seed Process

When you run `npm run db:seed`, the script will:

1. ✅ Fetch all 114 surahs from the API
2. ✅ Create 30 Juzs in the database
3. ✅ Create all Surahs with proper juz mapping
4. ✅ Slice ayahs into puzzles using configured logic
5. ✅ Create puzzles in the database

**Note**: The seed process may take several minutes as it fetches data from the API and creates thousands of puzzles.

