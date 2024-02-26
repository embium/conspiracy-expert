import { prisma } from 'prisma/seed/utils';

export async function createThreads() {
  console.log(`⏳ Seeding threads`);

  let createdCounter = 0;
  const existingCount = await prisma.thread.count();

  if (
    !(await prisma.thread.findUnique({ where: { title: 'Start UI [web]' } }))
  ) {
    await prisma.thread.create({
      data: {
        title: 'Start UI [web]',
        body: '🚀 Start UI [web] is an opinionated UI starter with ⚛️ React, ▲ NextJS, ⚡️ Chakra UI, ⚛️ TanStack Query & 🐜 Formiz — From the 🐻 BearStudio Team',
        user: { connect: { email: 'admin@admin.com' } },
      },
    });
    createdCounter += 1;
  }

  if (
    !(await prisma.thread.findUnique({
      where: { title: 'Start UI [native]' },
    }))
  ) {
    await prisma.thread.create({
      data: {
        title: 'Start UI [native]',
        body: "🚀 Start UI [native] is a opinionated Expo starter thread created & maintained by the BearStudio Team and other contributors. It represents our team's up-to-date stack that we use when creating React Native apps for our clients.",
        user: { connect: { email: 'admin@admin.com' } },
      },
    });
    createdCounter += 1;
  }

  console.log(
    `✅ ${existingCount} existing threads 👉 ${createdCounter} threads created`
  );
}
