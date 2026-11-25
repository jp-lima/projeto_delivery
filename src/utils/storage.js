import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { extname, join } from 'path';

const UPLOADS_DIR = 'uploads';

export async function uploadFileToStorage(file, bucketName = 'default') {
  const bucketDir = join(UPLOADS_DIR, bucketName);

  if (!existsSync(bucketDir)) {
    await mkdir(bucketDir, { recursive: true });
  }

  const fileExt = extname(file.originalname) || '';
  const fileName = `${randomUUID()}${fileExt}`;
  const filePath = join(bucketDir, fileName);

  await writeFile(filePath, file.buffer);

  return `/uploads/${bucketName}/${fileName}`;
}
