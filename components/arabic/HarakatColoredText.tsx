'use client';

import { parseArabicText } from '@/lib/harakat-utils';

interface HarakatColoredTextProps {
  text: string;
  className?: string;
}

/**
 * Visual-only harakat coloring component.
 * Use this in contexts where click interactions would interfere
 * with other functionality (like drag-and-drop in puzzles).
 */
export default function HarakatColoredText({ text, className = '' }: HarakatColoredTextProps) {
  const segments = parseArabicText(text);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.isHarakat && segment.definition) {
          return (
            <span
              key={`harakat-${index}`}
              style={{ color: segment.definition.color }}
            >
              {segment.text}
            </span>
          );
        }
        return <span key={`text-${index}`}>{segment.text}</span>;
      })}
    </span>
  );
}


