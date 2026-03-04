import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');

  const where: Record<string, unknown> = { projectId: id };
  if (category) where.category = category;
  if (search) where.originalName = { contains: search };

  const files = await prisma.projectFile.findMany({
    where,
    include: {
      uploadedBy: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(files);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const category = (formData.get('category') as string) || 'OTHER';
  const uploadedById = (formData.get('uploadedById') as string) || 'user-1';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), 'public', 'uploads', id);
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);

  const dbFile = await prisma.projectFile.create({
    data: {
      projectId: id,
      uploadedById,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: buffer.length,
      path: `/uploads/${id}/${filename}`,
      category,
    },
  });

  return NextResponse.json(dbFile, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const file = await prisma.projectFile.findUnique({ where: { id: body.fileId } });
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await unlink(join(process.cwd(), 'public', file.path));
  } catch {}

  await prisma.projectFile.delete({ where: { id: body.fileId } });
  return NextResponse.json({ success: true });
}
