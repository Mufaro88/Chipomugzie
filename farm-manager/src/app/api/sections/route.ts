import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/// A farm is usable when the person owns it or has been given access to it.
async function usableFarm(farmId: string, userId: string) {
  return prisma.farm.findFirst({
    where: {
      id: farmId,
      OR: [{ ownerId: userId }, { farmAccess: { some: { userId } } }],
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const farmId = req.nextUrl.searchParams.get("farmId");
    if (!farmId) {
      return NextResponse.json({ error: "farmId is required" }, { status: 400 });
    }

    const farm = await usableFarm(farmId, user.id);
    if (!farm) return NextResponse.json({ error: "Farm not found" }, { status: 404 });

    const sections = await prisma.farmSection.findMany({
      where: { farmId, archived: false },
      include: { classes: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { farmId, name, icon, classes } = await req.json();

    if (!farmId || !String(name ?? "").trim()) {
      return NextResponse.json({ error: "Please give the new type a name" }, { status: 400 });
    }

    const farm = await usableFarm(farmId, user.id);
    if (!farm) return NextResponse.json({ error: "Farm not found" }, { status: 404 });

    const cleanName = String(name).trim().slice(0, 40);

    const existing = await prisma.farmSection.findUnique({
      where: { farmId_name: { farmId, name: cleanName } },
    });
    if (existing) {
      // Bringing back one that was put away before keeps its history intact.
      if (existing.archived) {
        const revived = await prisma.farmSection.update({
          where: { id: existing.id },
          data: { archived: false, icon: icon || existing.icon },
          include: { classes: { orderBy: { sortOrder: "asc" } } },
        });
        return NextResponse.json({ section: revived });
      }
      return NextResponse.json({ error: `${cleanName} is already on this farm` }, { status: 400 });
    }

    const count = await prisma.farmSection.count({ where: { farmId } });
    const cleanClasses: string[] = Array.isArray(classes)
      ? [
          ...new Set(
            classes
              .map((c: unknown) => String(c ?? "").trim().slice(0, 40))
              .filter(Boolean)
          ),
        ].slice(0, 20)
      : [];

    const section = await prisma.farmSection.create({
      data: {
        farmId,
        name: cleanName,
        icon: String(icon || "🐾").slice(0, 8),
        sortOrder: count,
        classes: {
          create: cleanClasses.map((c, i) => ({ name: c, sortOrder: i })),
        },
      },
      include: { classes: { orderBy: { sortOrder: "asc" } } },
    });

    await prisma.auditLog.create({
      data: {
        farmId,
        userId: user.id,
        action: "create",
        entity: "farm_section",
        entityId: section.id,
        newValues: JSON.stringify({ name: cleanName }),
      },
    });

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Section creation error:", error);
    return NextResponse.json({ error: "Could not add that type" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const sectionId = req.nextUrl.searchParams.get("id");
    if (!sectionId) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const section = await prisma.farmSection.findUnique({
      where: { id: sectionId },
      include: { _count: { select: { entries: true } } },
    });
    if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const farm = await usableFarm(section.farmId, user.id);
    if (!farm) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

    // Never throw away recorded months: put the type away instead of deleting it.
    if (section._count.entries > 0) {
      await prisma.farmSection.update({
        where: { id: sectionId },
        data: { archived: true },
      });
      return NextResponse.json({ ok: true, archived: true });
    }

    await prisma.farmSection.delete({ where: { id: sectionId } });
    return NextResponse.json({ ok: true, archived: false });
  } catch {
    return NextResponse.json({ error: "Could not remove that type" }, { status: 500 });
  }
}
