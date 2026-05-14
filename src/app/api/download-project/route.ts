import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  try {
    const zipPath = '/home/z/kuisto-project.zip';

    if (!fs.existsSync(zipPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(zipPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="kuisto-project.zip"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
