import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@health.local' },
    update: {},
    create: {
      email: 'demo@health.local',
      profile: {
        create: {
          birthDate: new Date('1990-01-01'),
          sex: 'male',
          heightCm: 178,
          activityLevel: 'moderate',
          goals: JSON.stringify(['maintain']),
        },
      },
    },
  });

  await prisma.dailyIntakeEntry.create({
    data: {
      userId: user.id,
      consumedAt: new Date(),
      meal: 'breakfast',
      item: 'Greek Yogurt',
      calories: 180,
      proteinGrams: 15,
      carbsGrams: 12,
      fatGrams: 7,
    },
  });

  await prisma.dailyBodyMetric.create({
    data: {
      userId: user.id,
      recordedAt: new Date(),
      weightKg: 82.3,
      bodyFatPercentage: 19.4,
      restingHeartRate: 55,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
