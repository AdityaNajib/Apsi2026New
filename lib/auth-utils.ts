import { prisma } from '@/lib/prisma';

/**
 * Check if a dosen is authorized to access a specific kelas
 * Authorization is based on the Pengampu table (teaching assignments)
 * 
 * @param userId - The user ID of the dosen
 * @param kelasId - The kelas ID to check access for
 * @returns true if dosen is assigned to teach this kelas, false otherwise
 */
export async function isDosenAuthorizedForKelas(
  userId: string,
  kelasId: string
): Promise<boolean> {
  try {
    const pengampu = await prisma.pengampu.findFirst({
      where: {
        kelasId,
        dosen: {
          userId,
        },
      },
    });

    return !!pengampu;
  } catch (error) {
    console.error('Error checking dosen authorization:', error);
    return false;
  }
}

/**
 * Get all kelas IDs that a dosen is authorized to access
 * 
 * @param userId - The user ID of the dosen
 * @returns Array of kelas IDs that the dosen is assigned to teach
 */
export async function getDosenAuthorizedKelas(
  userId: string
): Promise<string[]> {
  try {
    const dosen = await prisma.dosen.findUnique({
      where: { userId },
      include: {
        pengampu: {
          select: {
            kelasId: true,
          },
        },
      },
    });

    if (!dosen) {
      return [];
    }

    return dosen.pengampu.map(p => p.kelasId);
  } catch (error) {
    console.error('Error getting dosen authorized kelas:', error);
    return [];
  }
}

/**
 * Get mata kuliah list for a dosen (only courses they teach)
 * 
 * @param userId - The user ID of the dosen
 * @returns Array of mata kuliah with their kelas info
 */
export async function getDosenMataKuliah(userId: string) {
  try {
    const dosen = await prisma.dosen.findUnique({
      where: { userId },
      include: {
        pengampu: {
          include: {
            kelas: {
              include: {
                mataKuliah: true,
              },
            },
          },
        },
      },
    });

    if (!dosen) {
      return [];
    }

    // Return unique mata kuliah (dosen might teach multiple kelas of same course)
    const mataKuliahMap = new Map();
    
    for (const p of dosen.pengampu) {
      const mk = p.kelas.mataKuliah;
      if (!mataKuliahMap.has(mk.id)) {
        mataKuliahMap.set(mk.id, {
          id: mk.id,
          kode: mk.kode,
          nama: mk.nama,
          sks: mk.sks,
          semester: mk.semester,
          kelas: [],
        });
      }
      
      mataKuliahMap.get(mk.id).kelas.push({
        id: p.kelas.id,
        nama: p.kelas.nama,
        tahun_ajaran: p.kelas.tahun_ajaran,
        semester: p.kelas.semester,
      });
    }

    return Array.from(mataKuliahMap.values());
  } catch (error) {
    console.error('Error getting dosen mata kuliah:', error);
    return [];
  }
}
