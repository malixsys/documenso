import fs from 'node:fs';
import path from 'node:path';

import { NEXT_PRIVATE_INTERNAL_WEBAPP_URL } from '../../constants/app';

const LOCAL_PUBLIC_DIR = path.join(process.cwd(), 'public');
const TMP_PUBLIC_DIR = '/tmp/public-assets';

/**
 * Ensures a static file from `public/` is available on disk and returns
 * its absolute path.
 *
 * On traditional servers the file is at `public/<relativePath>`.
 * On Vercel serverless, `public/` is served by the CDN but not bundled
 * into the function, so we fetch it via HTTP and cache it in `/tmp/`.
 */
export const getStaticFilePath = async (relativePath: string): Promise<string> => {
  const localPath = path.join(LOCAL_PUBLIC_DIR, relativePath);

  if (fs.existsSync(localPath)) {
    return localPath;
  }

  const tmpPath = path.join(TMP_PUBLIC_DIR, relativePath);

  if (fs.existsSync(tmpPath)) {
    return tmpPath;
  }

  const tmpDir = path.dirname(tmpPath);

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const baseUrl = NEXT_PRIVATE_INTERNAL_WEBAPP_URL();
  const res = await fetch(`${baseUrl}/${relativePath}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch static file ${relativePath}: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  fs.writeFileSync(tmpPath, buffer);

  return tmpPath;
};

/**
 * Returns a directory path containing the font files needed for PDF generation.
 *
 * On traditional servers, fonts live at `public/fonts/`. On Vercel serverless,
 * `public/` is not part of the function bundle, so we fetch fonts via HTTP
 * from the app's own static assets and cache them in `/tmp/`.
 */
export const getFontPath = async (fontFiles: string[]): Promise<string> => {
  const localFontDir = path.join(LOCAL_PUBLIC_DIR, 'fonts');

  if (fs.existsSync(localFontDir)) {
    const allExist = fontFiles.every((f) => fs.existsSync(path.join(localFontDir, f)));

    if (allExist) {
      return localFontDir;
    }
  }

  const tmpFontDir = path.join(TMP_PUBLIC_DIR, 'fonts');

  if (!fs.existsSync(tmpFontDir)) {
    fs.mkdirSync(tmpFontDir, { recursive: true });
  }

  const baseUrl = NEXT_PRIVATE_INTERNAL_WEBAPP_URL();

  await Promise.all(
    fontFiles.map(async (fileName) => {
      const dest = path.join(tmpFontDir, fileName);

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

  return tmpFontDir;
};
