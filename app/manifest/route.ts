import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const manifestPath = join(process.cwd(), 'public', 'manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error reading manifest:', error);
    // Return a default manifest if file read fails
    return NextResponse.json(
      {
        name: 'AyatBits - Gamified Quranic Study',
        short_name: 'AyatBits',
        description: 'Learn and memorize Quranic verses through fun, interactive puzzles',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#16a34a',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['education', 'lifestyle'],
        lang: 'en',
        dir: 'ltr',
      },
      {
        headers: {
          'Content-Type': 'application/manifest+json',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  }
}






