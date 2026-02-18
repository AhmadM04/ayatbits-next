/**
 * Remotion Configuration
 * =======================
 * Applies the webpack override so that:
 *  - @/ alias resolves to the project root
 *  - next/image is swapped with a plain <img> mock
 *  - next/link is swapped with a plain <a> mock
 *  - @clerk/nextjs is stubbed out
 */
import { Config } from '@remotion/cli/config';
import { webpackOverride } from './remotion/webpack-override';

Config.overrideWebpackConfig(webpackOverride);

