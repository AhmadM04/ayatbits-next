interface AyahTextDisplayProps {
  ayahText: string;
  surahNumber: number;
  ayahNumber: number;
}

export default function AyahTextDisplay({ ayahText }: AyahTextDisplayProps) {
  return (
    <p
      className="text-xl sm:text-2xl md:text-3xl leading-[2] text-white text-right"
      dir="rtl"
      style={{ fontFamily: 'var(--font-arabic, "Amiri", serif)' }}
    >
      {ayahText}
    </p>
  );
}

