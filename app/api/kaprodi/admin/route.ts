import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Fetch all admins
export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      include: {
        dosen: {
          select: {
            nidn: true,
            nip: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedAdmins = admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      nidn: admin.dosen?.nidn || "-",
      nip: admin.dosen?.nip || "-",
      createdAt: admin.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedAdmins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

// POST - Create new admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, nidn, nip, password } = body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and dosen in transaction
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        dosen: {
          create: {
            nidn,
            nip,
          },
        },
      },
      include: {
        dosen: true,
      },
    });

    return NextResponse.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      nidn: admin.dosen?.nidn || "-",
      nip: admin.dosen?.nip || "-",
      createdAt: admin.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
