import { createThreads } from 'prisma/seed/models/thread';
import { createUsers } from 'prisma/seed/models/user';
import { prisma } from 'prisma/seed/utils';

async function main() {
  await createUsers();
  await createThreads();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
