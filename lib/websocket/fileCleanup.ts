/**
 * File Cleanup Utility
 * TODO: Перенести из backend/src/utils/fileCleanup.js
 */

import { unlink, readdir, stat } from 'fs/promises';
import { join } from 'path';

const TEMP_DIRS = ['./temp', './tmp', './uploads'];
const MAX_AGE_MS = 60 * 60 * 1000; // 1 час

export async function cleanupTempFiles(): Promise<void> {
  for (const dir of TEMP_DIRS) {
    try {
      const files = await readdir(dir);
      const now = Date.now();

      for (const file of files) {
        const filePath = join(dir, file);
        const stats = await stat(filePath);
        
        if (now - stats.mtimeMs > MAX_AGE_MS) {
          await unlink(filePath);
          console.log(`[Cleanup] Deleted: ${filePath}`);
        }
      }
    } catch (error) {
      // Директория может не существовать
    }
  }
}

// TODO: Запуск по расписанию (cron или setInterval)
