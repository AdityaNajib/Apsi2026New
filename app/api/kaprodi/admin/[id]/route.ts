import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PUT - Update admin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, nidn, nip, password } = body;

    const updateData: any = {
      name,
      email,
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const admin = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: { dosen: true },
    });

    // Update dosen data if exists
    if (admin.dosen) {
      await prisma.dosen.update({
        where: { id: admin.dosen.id },
        data: { nidn, nip },
      });
    }

    return NextResponse.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      nidn,
      nip,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

// DELETE - Delete admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete dosen first (if exists)
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { dosen: true },
    });

    if (user?.dosen) {
      await prisma.dosen.delete({
        where: { id: user.dosen.id },
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 });
  }
}
