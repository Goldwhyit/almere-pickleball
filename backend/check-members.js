const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const members = await prisma.member.findMany({
    select: { id: true, userId: true, accountType: true, membershipType: true, paymentStatus: true },
  });
  console.log('Total members in DB:', members.length);
  console.log('\nMembers by accountType:');
  const grouped = {};
  members.forEach(m => {
    grouped[m.accountType] = (grouped[m.accountType] || 0) + 1;
  });
  console.log(grouped);
  console.log('\nAll members:');
  console.log(JSON.stringify(members, null, 2));
  await prisma.$disconnect();
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
