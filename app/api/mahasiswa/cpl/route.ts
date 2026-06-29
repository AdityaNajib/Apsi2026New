import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { calculateCPLForMahasiswa } from '@/lib/cplEngine';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { mahasiswa: true },
    });

    if (!user || !user.mahasiswa) {
      return NextResponse.json({ error: 'Mahasiswa not found' }, { status: 404 });
    }

    const results = await calculateCPLForMahasiswa(user.mahasiswa.id);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching CPL mahasiswa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
