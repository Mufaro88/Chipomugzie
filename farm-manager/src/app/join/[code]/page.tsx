import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// A farm invite link. Logged-in users are attached to the farm directly;
// new people are sent to signup with the invite carried along.
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const invite = await prisma.farmInvite.findUnique({
    where: { code },
    include: { farm: { select: { id: true, name: true, ownerId: true } } },
  });

  if (!invite || invite.usedById) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 text-center max-w-md">
          <p className="text-4xl mb-3">🤔</p>
          <h1 className="text-xl font-bold text-stone-900 mb-2">This invite is no longer valid</h1>
          <p className="text-stone-600 mb-6">
            It may have been used already or cancelled. Ask the farm owner to send you a fresh one.
          </p>
          <Link href="/" className="text-orange-700 font-medium hover:underline">
            Go to The Farmer&apos;s Pocket Book
          </Link>
        </div>
      </div>
    );
  }

  const user = await getSession();
  if (user) {
    if (user.id !== invite.farm.ownerId) {
      await prisma.farmAccess.upsert({
        where: { userId_farmId: { userId: user.id, farmId: invite.farmId } },
        update: { role: invite.role },
        create: { userId: user.id, farmId: invite.farmId, role: invite.role },
      });
      await prisma.farmInvite.update({
        where: { id: invite.id },
        data: { usedById: user.id, usedAt: new Date() },
      });
    }
    redirect("/dashboard");
  }

  redirect(`/signup?join=${code}`);
}
