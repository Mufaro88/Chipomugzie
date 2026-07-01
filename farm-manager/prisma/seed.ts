import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { hash } from "bcryptjs";

async function main() {
  const adapter = new PrismaLibSql({ url: "file:prisma/dev.db" });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await hash("demo1234", 12);

  const owner = await prisma.user.upsert({
    where: { email: "owner@ruzambo.co.zw" },
    update: {},
    create: { name: "Farm Owner", email: "owner@ruzambo.co.zw", passwordHash, role: "owner" },
  });

  const manager = await prisma.user.upsert({
    where: { email: "byron@ruzambo.co.zw" },
    update: {},
    create: { name: "Byron T Pasipanodya", email: "byron@ruzambo.co.zw", passwordHash, phone: "+263770000000", role: "manager" },
  });

  const farm = await prisma.farm.upsert({
    where: { id: "ruzambo-farm-001" },
    update: {},
    create: { id: "ruzambo-farm-001", name: "Ruzambo Farm", location: "Zimbabwe", ownerId: owner.id, tier: "basic" },
  });

  await prisma.farmAccess.upsert({
    where: { userId_farmId: { userId: manager.id, farmId: farm.id } },
    update: {},
    create: { userId: manager.id, farmId: farm.id, role: "manager" },
  });

  const months = [
    { month: 2, year: 2025, beef: { openingStock: 390, births: 0, movedIn: 0, movedOut: 2, sold: 0, slaughtered: 0, deaths: 0, closingStock: 388, bulls: 0, juvenileBulls: 7, cows: 158, bullingHeifers: 21, weanerHeifers: 71, feederSteers: 28, weanerSteers: 49, weanerMaleCalves: 2, calfSteers: 27, maleCaves: 6, femaleCalves: 19 }, dairy: { openingStock: 139, births: 2, movedIn: 0, movedOut: 0, sold: 0, slaughtered: 0, deaths: 0, closingStock: 141, bulls: 0, juvenileBulls: 0, milkingCows: 29, dryCows: 23, bullingHeifers: 31, weanerHeifers: 30, feederSteers: 0, weanerSteers: 15, weanerMaleCalves: 3, calfSteers: 1, maleCalves: 0, femaleCalves: 9, totalMilkYield: 0, feedConsumedBags: 0, feedWeightKg: 50 }, goats: { openingStock: 103, births: 0, movedIn: 1, sold: 12, slaughtered: 0, deaths: 1, movedOut: 0, closingStock: 91, bucks: 1, juvenileBucks: 1, does: 47, maidenDoes: 29, castratedWeaners: 3, castratedMaleKids: 10, femaleKids: 0, maleKids: 0 }, layers: { openingStock: 4608, mortalities: 18, movedIn: 18, closingStock: 4608, cratesCollected: 3343, eggTraysDelivered: 0, breakagesCrates: 47, binnedCrates: 25, averageLayingPct: 76.5, feedConsumedBags: 0, feedWeightKg: 50 }, broilers: { openingStock: 2025, received: 0, sold: 0, deaths: 16, closingStock: 2009, starterBags: 0, growerBags: 0, finisherBags: 0, feedWeightKg: 50 } },
    { month: 3, year: 2025, beef: { openingStock: 388, births: 1, movedIn: 0, movedOut: 0, sold: 0, slaughtered: 0, deaths: 0, closingStock: 389, bulls: 0, juvenileBulls: 7, cows: 158, bullingHeifers: 21, weanerHeifers: 71, feederSteers: 28, weanerSteers: 49, weanerMaleCalves: 2, calfSteers: 27, maleCaves: 6, femaleCalves: 20 }, dairy: { openingStock: 141, births: 4, movedIn: 0, movedOut: 0, sold: 0, slaughtered: 1, deaths: 0, closingStock: 144, bulls: 0, juvenileBulls: 0, milkingCows: 33, dryCows: 20, bullingHeifers: 28, weanerHeifers: 30, feederSteers: 0, weanerSteers: 15, weanerMaleCalves: 3, calfSteers: 1, maleCalves: 0, femaleCalves: 14, totalMilkYield: 6643, feedConsumedBags: 0, feedWeightKg: 50 }, goats: { openingStock: 91, births: 0, movedIn: 0, sold: 3, slaughtered: 0, deaths: 0, movedOut: 0, closingStock: 88, bucks: 1, juvenileBucks: 1, does: 44, maidenDoes: 29, castratedWeaners: 3, castratedMaleKids: 10, femaleKids: 0, maleKids: 0 }, layers: { openingStock: 4594, mortalities: 38, movedIn: 0, closingStock: 4556, cratesCollected: 4052, eggTraysDelivered: 0, breakagesCrates: 40, binnedCrates: 27, averageLayingPct: 76, feedConsumedBags: 318, feedWeightKg: 50 }, broilers: { openingStock: 2009, received: 0, sold: 0, deaths: 73, closingStock: 1936, starterBags: 5, growerBags: 60, finisherBags: 43, feedWeightKg: 50 } },
    { month: 4, year: 2025, beef: { openingStock: 389, births: 0, movedIn: 0, movedOut: 0, sold: 0, slaughtered: 1, deaths: 0, closingStock: 388, bulls: 0, juvenileBulls: 7, cows: 157, bullingHeifers: 21, weanerHeifers: 71, feederSteers: 28, weanerSteers: 49, weanerMaleCalves: 2, calfSteers: 27, maleCaves: 6, femaleCalves: 20 }, dairy: { openingStock: 144, births: 1, movedIn: 0, movedOut: 0, sold: 0, slaughtered: 1, deaths: 0, closingStock: 144, bulls: 0, juvenileBulls: 0, milkingCows: 33, dryCows: 20, bullingHeifers: 28, weanerHeifers: 30, feederSteers: 0, weanerSteers: 15, weanerMaleCalves: 3, calfSteers: 1, maleCalves: 0, femaleCalves: 14, totalMilkYield: 5074, feedConsumedBags: 0, feedWeightKg: 50 }, goats: { openingStock: 88, births: 0, movedIn: 0, sold: 0, slaughtered: 0, deaths: 0, movedOut: 0, closingStock: 88, bucks: 1, juvenileBucks: 1, does: 44, maidenDoes: 29, castratedWeaners: 3, castratedMaleKids: 10, femaleKids: 0, maleKids: 0 }, layers: { openingStock: 4556, mortalities: 23, movedIn: 0, closingStock: 4533, cratesCollected: 3665, eggTraysDelivered: 4260, breakagesCrates: 39, binnedCrates: 23, averageLayingPct: 80, feedConsumedBags: 297, feedWeightKg: 50 }, broilers: { openingStock: 1936, received: 0, sold: 1902, deaths: 34, closingStock: 0, starterBags: 0, growerBags: 0, finisherBags: 0, feedWeightKg: 50 } },
    { month: 5, year: 2025, beef: { openingStock: 388, births: 0, movedIn: 33, movedOut: 0, sold: 2, slaughtered: 2, deaths: 0, closingStock: 417, bulls: 0, juvenileBulls: 7, cows: 163, bullingHeifers: 26, weanerHeifers: 77, feederSteers: 28, weanerSteers: 58, weanerMaleCalves: 2, calfSteers: 28, maleCaves: 6, femaleCalves: 22 }, dairy: { openingStock: 144, births: 4, movedIn: 0, movedOut: 33, sold: 0, slaughtered: 0, deaths: 0, closingStock: 115, bulls: 0, juvenileBulls: 0, milkingCows: 35, dryCows: 10, bullingHeifers: 22, weanerHeifers: 24, feederSteers: 0, weanerSteers: 6, weanerMaleCalves: 3, calfSteers: 0, maleCalves: 1, femaleCalves: 15, totalMilkYield: 6078, feedConsumedBags: 86, feedWeightKg: 50 }, goats: { openingStock: 88, births: 0, movedIn: 0, sold: 2, slaughtered: 2, deaths: 0, movedOut: 0, closingStock: 84, bucks: 1, juvenileBucks: 1, does: 40, maidenDoes: 29, castratedWeaners: 3, castratedMaleKids: 10, femaleKids: 0, maleKids: 0 }, layers: { openingStock: 4533, mortalities: 28, movedIn: 0, closingStock: 4505, cratesCollected: 3714, eggTraysDelivered: 3990, breakagesCrates: 46, binnedCrates: 29, averageLayingPct: 82, feedConsumedBags: 339, feedWeightKg: 50 }, broilers: { openingStock: 0, received: 0, sold: 0, deaths: 0, closingStock: 0, starterBags: 0, growerBags: 0, finisherBags: 0, feedWeightKg: 50 } },
    { month: 6, year: 2025, beef: { openingStock: 417, births: 2, movedIn: 0, movedOut: 0, sold: 2, slaughtered: 0, deaths: 0, closingStock: 417, bulls: 0, juvenileBulls: 7, cows: 161, bullingHeifers: 26, weanerHeifers: 77, feederSteers: 28, weanerSteers: 58, weanerMaleCalves: 2, calfSteers: 28, maleCaves: 7, femaleCalves: 23 }, dairy: { openingStock: 115, births: 2, movedIn: 0, movedOut: 0, sold: 0, slaughtered: 0, deaths: 0, closingStock: 117, bulls: 0, juvenileBulls: 0, milkingCows: 35, dryCows: 12, bullingHeifers: 20, weanerHeifers: 24, feederSteers: 0, weanerSteers: 6, weanerMaleCalves: 3, calfSteers: 0, maleCalves: 1, femaleCalves: 10, totalMilkYield: 7803, feedConsumedBags: 0, feedWeightKg: 50 }, goats: { openingStock: 84, births: 44, movedIn: 0, sold: 0, slaughtered: 1, deaths: 1, movedOut: 0, closingStock: 126, bucks: 1, juvenileBucks: 1, does: 46, maidenDoes: 23, castratedWeaners: 12, castratedMaleKids: 0, femaleKids: 22, maleKids: 21 }, layers: { openingStock: 4505, mortalities: 77, movedIn: 0, closingStock: 4428, cratesCollected: 3129, eggTraysDelivered: 0, breakagesCrates: 45, binnedCrates: 22, averageLayingPct: 72, feedConsumedBags: 0, feedWeightKg: 50 }, broilers: { openingStock: 0, received: 0, sold: 0, deaths: 0, closingStock: 0, starterBags: 0, growerBags: 0, finisherBags: 0, feedWeightKg: 50 } },
    { month: 7, year: 2025, beef: { openingStock: 417, births: 4, movedIn: 0, movedOut: 0, sold: 0, slaughtered: 2, deaths: 0, closingStock: 419, bulls: 0, juvenileBulls: 7, cows: 159, bullingHeifers: 26, weanerHeifers: 77, feederSteers: 28, weanerSteers: 58, weanerMaleCalves: 2, calfSteers: 28, maleCaves: 9, femaleCalves: 25 }, dairy: { openingStock: 117, births: 1, movedIn: 11, movedOut: 0, sold: 0, slaughtered: 1, deaths: 0, closingStock: 128, bulls: 0, juvenileBulls: 1, milkingCows: 35, dryCows: 12, bullingHeifers: 29, weanerHeifers: 30, feederSteers: 0, weanerSteers: 6, weanerMaleCalves: 3, calfSteers: 0, maleCalves: 1, femaleCalves: 11, totalMilkYield: 9397, feedConsumedBags: 0, feedWeightKg: 50 }, goats: { openingStock: 126, births: 0, movedIn: 0, sold: 4, slaughtered: 0, deaths: 2, movedOut: 0, closingStock: 120, bucks: 1, juvenileBucks: 1, does: 46, maidenDoes: 23, castratedWeaners: 8, castratedMaleKids: 9, femaleKids: 20, maleKids: 12 }, layers: { openingStock: 4428, mortalities: 66, movedIn: 0, closingStock: 4362, cratesCollected: 3122, eggTraysDelivered: 0, breakagesCrates: 23, binnedCrates: 20, averageLayingPct: 71, feedConsumedBags: 0, feedWeightKg: 50 }, broilers: { openingStock: 0, received: 0, sold: 0, deaths: 0, closingStock: 0, starterBags: 0, growerBags: 0, finisherBags: 0, feedWeightKg: 50 } },
  ];

  for (const m of months) {
    const existing = await prisma.monthlyCensus.findUnique({
      where: { farmId_month_year: { farmId: farm.id, month: m.month, year: m.year } },
    });
    if (existing) continue;

    await prisma.monthlyCensus.create({
      data: {
        farmId: farm.id, userId: manager.id, month: m.month, year: m.year, status: "submitted",
        beefSection: { create: m.beef }, dairySection: { create: m.dairy },
        goatSection: { create: m.goats }, layerSection: { create: m.layers },
        broilerSection: { create: m.broilers },
      },
    });
    console.log(`Seeded ${m.month}/${m.year}`);
  }

  console.log("\nSeed complete!");
  console.log("Login as owner:   owner@ruzambo.co.zw / demo1234");
  console.log("Login as manager: byron@ruzambo.co.zw / demo1234");
  await prisma.$disconnect();
}

main().catch(console.error);
