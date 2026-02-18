/**
 * Webpack Override for Remotion
 * ==============================
 * Handles:
 *  1. @/ path alias → project root (matches tsconfig.json)
 *  2. next/image   → our mock <img> component
 *  3. next/link    → our mock <a> component
 *  4. @clerk/nextjs → empty mock (not needed in video)
 *  5. next/dynamic  → passthrough component
 *
 * NOTE: We use process.cwd() instead of __dirname because Remotion
 *       transpiles this file and __dirname can point to a temp dir.
 */
import path from 'path';
import type { WebpackOverrideFn } from '@remotion/bundler';

export const webpackOverride: WebpackOverrideFn = (currentConfig) => {
  // process.cwd() is the project root (where `npx remotion` is invoked)
  const projectRoot = process.cwd();
  const mocksDir = path.join(projectRoot, 'remotion', 'mocks');

  return {
    ...currentConfig,
    resolve: {
      ...currentConfig.resolve,
      alias: {
        ...(currentConfig.resolve?.alias || {}),

        // 1. Map @/ to the project root (same as tsconfig paths)
        '@': projectRoot,

        // 2. Replace next/image with our plain <img> mock
        'next/image': path.join(mocksDir, 'next-image.tsx'),

        // 3. Replace next/link with our plain <a> mock
        'next/link': path.join(mocksDir, 'next-link.tsx'),

        // 4. Mock out next/navigation (useRouter, usePathname, etc.)
        'next/navigation': path.join(mocksDir, 'next-navigation.ts'),

        // 5. Mock next/dynamic → just render the component
        'next/dynamic': path.join(mocksDir, 'next-dynamic.ts'),

        // 6. Mock @clerk/nextjs → empty stubs
        '@clerk/nextjs': path.join(mocksDir, 'clerk.ts'),
        '@clerk/nextjs/server': path.join(mocksDir, 'clerk.ts'),
      },
    },
  };
};
