import fs from 'node:fs';
import path from 'node:path';

import { NEXT_PRIVATE_INTERNAL_WEBAPP_URL } from '../../constants/app';

const LOCAL_FONT_DIR = path.join(process.cwd(), 'public/fonts');
const TMP_FONT_DIR = '/tmp/fonts';

/**
 * Returns a directory path containing the font files needed for PDF generation.
 *
 * On traditional servers, fonts live at `public/fonts/`. On Vercel serverless,
 * `public/` is not part of the function bundle, so we fetch fonts via HTTP
 * from the app's own static assets and cache them in `/tmp/fonts/`.
 */
export const getFontPath = async (fontFiles: string[]): Promise<string> => {
  // If local fonts exist (non-Vercel), use them directly.
  if (fs.existsSync(LOCAL_FONT_DIR)) {
    const allExist = fontFiles.every((f) => fs.existsSync(path.join(LOCAL_FONT_DIR, f)));

    if (allExist) {
      return LOCAL_FONT_DIR;
    }
  }

  // On Vercel: download fonts to /tmp and cache them.
  if (!fs.existsSync(TMP_FONT_DIR)) {
    fs.mkdirSync(TMP_FONT_DIR, { recursive: true });
  }

  const baseUrl = NEXT_PRIVATE_INTERNAL_WEBAPP_URL();

  await Promise.all(
    fontFiles.map(async (fileName) => {
      const dest = path.join(TMP_FONT_DIR, fileName);

      if (fs.existsSync(dest)) {
        return;
      }

      const res = await fetch(`${baseUrl}/fonts/${fileName}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch font ${fileName}: ${res.status}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());

      fs.writeFileSync(dest, buffer);
    }),
  );

  return TMP_FONT_DIR;
};
